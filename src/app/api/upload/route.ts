import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getSessionUser } from '@/lib/auth';

// Límite máximo final tras compresión: 1 MB (1,048,576 bytes)
const MAX_COMPRESSED_SIZE = 1 * 1024 * 1024;
// Límite máximo de archivo crudo de entrada antes de comprimir (20 MB)
const MAX_RAW_INPUT_SIZE = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    // En producción requiere sesión válida
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Acceso no autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se recibió ningún archivo' },
        { status: 400 }
      );
    }

    // 1. Validar tamaño máximo de entrada antes del compresor
    if (file.size > MAX_RAW_INPUT_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo original es demasiado grande para comprimir (máx. 20 MB).' },
        { status: 400 }
      );
    }

    // 2. Validar formato permitido (.jpg, .jpeg, .png, .webp, .svg)
    const originalName = file.name || '';
    const fileExt = originalName.includes('.')
      ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
      : (file.type === 'image/png' ? '.png' : (file.type === 'image/svg+xml' ? '.svg' : (file.type === 'image/webp' ? '.webp' : '.jpg')));

    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);

    if (!isMimeValid && !isExtValid) {
      return NextResponse.json(
        { success: false, error: 'Solo se permiten formatos de imagen web (.png, .jpg, .jpeg, .webp, .svg)' },
        { status: 400 }
      );
    }

    // 3. Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 4. Directorio de destino: public/uploads/products/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 5. Normalizar nombre base seguro para evitar path traversal
    const baseName = path.basename(originalName, fileExt)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'imagen';

    // Si es SVG, validar que no supere 1 MB
    if (fileExt === '.svg' || file.type === 'image/svg+xml') {
      if (rawBuffer.length > MAX_COMPRESSED_SIZE) {
        return NextResponse.json(
          { success: false, error: 'El archivo SVG supera el límite máximo de 1 MB permitido en el catálogo.' },
          { status: 400 }
        );
      }
      const svgFilename = `${Date.now()}-${baseName}.svg`;
      const svgFilePath = path.join(uploadsDir, svgFilename);
      await fs.promises.writeFile(svgFilePath, rawBuffer);
      const publicUrl = `/uploads/products/${svgFilename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: svgFilename,
        originalSize: file.size,
        optimizedSize: rawBuffer.length,
        mimeType: 'image/svg+xml'
      });
    }

    const filename = `${Date.now()}-${baseName}.webp`;
    const filePath = path.join(uploadsDir, filename);

    // 6. Compresor automático iterativo con Sharp (Garantiza peso final <= 1 MB)
    try {
      const compressionSteps = [
        { maxDimension: 1600, quality: 84 },
        { maxDimension: 1280, quality: 76 },
        { maxDimension: 1024, quality: 68 },
        { maxDimension: 800, quality: 58 },
        { maxDimension: 640, quality: 48 }
      ];

      let optimizedWebpBuffer: Buffer | null = null;

      for (const step of compressionSteps) {
        const candidate = await sharp(rawBuffer)
          .rotate()
          .resize({
            width: step.maxDimension,
            height: step.maxDimension,
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: step.quality, effort: 4 })
          .toBuffer();

        optimizedWebpBuffer = candidate;
        if (candidate.length <= MAX_COMPRESSED_SIZE) {
          break;
        }
      }

      if (!optimizedWebpBuffer || optimizedWebpBuffer.length > MAX_COMPRESSED_SIZE) {
        return NextResponse.json(
          { success: false, error: 'No fue posible comprimir la imagen por debajo de 1 MB.' },
          { status: 400 }
        );
      }

      await fs.promises.writeFile(filePath, optimizedWebpBuffer);

      const publicUrl = `/uploads/products/${filename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename,
        originalSize: file.size,
        optimizedSize: optimizedWebpBuffer.length,
        mimeType: 'image/webp'
      });
    } catch {
      if (rawBuffer.length > MAX_COMPRESSED_SIZE) {
        return NextResponse.json(
          { success: false, error: 'La imagen supera el límite máximo permitido de 1 MB en la base de datos.' },
          { status: 400 }
        );
      }
      const fallbackFilename = `${Date.now()}-${baseName}${fileExt}`;
      const fallbackPath = path.join(uploadsDir, fallbackFilename);
      await fs.promises.writeFile(fallbackPath, rawBuffer);
      const publicUrl = `/uploads/products/${fallbackFilename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: fallbackFilename,
        originalSize: file.size,
        optimizedSize: rawBuffer.length,
        mimeType: file.type || 'image/png'
      });
    }
  } catch (error: any) {
    console.error('Error al procesar subida de imagen en /api/upload:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al procesar y optimizar la imagen' },
      { status: 500 }
    );
  }
}
