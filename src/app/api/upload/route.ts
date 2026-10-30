import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getSessionUser } from '@/lib/auth';

// Límite máximo final tras compresión: 250 KB (256,000 bytes)
const MAX_COMPRESSED_SIZE = 250 * 1024;
// Límite máximo de archivo crudo de entrada antes de procesar (10 MB)
const MAX_RAW_INPUT_SIZE = 10 * 1024 * 1024;
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

    // 1. Validar tamaño máximo de entrada antes del compresor (10 MB)
    if (file.size > MAX_RAW_INPUT_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo original es demasiado pesado para procesar (máximo 10 MB).' },
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

    // 4. Directorio de destino en el servidor: public/uploads/products/
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
      .replace(/^-+|-+$/g, '') || 'repuesto';

    // Si es SVG, validar que no supere 250 KB
    if (fileExt === '.svg' || file.type === 'image/svg+xml') {
      if (rawBuffer.length > MAX_COMPRESSED_SIZE) {
        return NextResponse.json(
          { success: false, error: 'El archivo SVG supera el límite máximo de 250 KB permitido en el catálogo.' },
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

    // 6. Compresor automático interno con Sharp:
    // - Redimensión a máx 1000px proporcional (sin deformar)
    // - Conversión a WebP optimizado garantizando peso final <= 250 KB
    try {
      const compressionSteps = [
        { maxDimension: 1000, quality: 82 },
        { maxDimension: 1000, quality: 75 },
        { maxDimension: 1000, quality: 68 },
        { maxDimension: 900, quality: 62 },
        { maxDimension: 800, quality: 55 }
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
          { success: false, error: 'No fue posible comprimir la imagen por debajo de 250 KB.' },
          { status: 400 }
        );
      }

      await fs.promises.writeFile(filePath, optimizedWebpBuffer);

      // Regla de Base de Datos: Retorna ÚNICAMENTE la ruta relativa en texto para guardar en image_url (nunca BLOB)
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
      return NextResponse.json(
        { success: false, error: 'Error interno en el procesamiento y compresión de la imagen con Sharp.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error al procesar subida de imagen en /api/upload:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al procesar y optimizar la imagen' },
      { status: 500 }
    );
  }
}
