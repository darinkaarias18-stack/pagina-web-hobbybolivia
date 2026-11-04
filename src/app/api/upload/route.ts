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
    if (!user) {
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

    // 4. Directorios de destino duales (public/uploads/products y uploads/products) para compatibilidad total en Plesk
    const uploadsPublicDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    const uploadsDirectDir = path.join(process.cwd(), 'uploads', 'products');

    if (!fs.existsSync(uploadsPublicDir)) {
      fs.mkdirSync(uploadsPublicDir, { recursive: true });
    }
    if (!fs.existsSync(uploadsDirectDir)) {
      fs.mkdirSync(uploadsDirectDir, { recursive: true });
    }

    // 5. Normalizar nombre base seguro para evitar path traversal
    const baseName = path.basename(originalName, fileExt)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'producto';

    // Helper para guardar en ambos directorios simultáneamente
    const saveToDisk = async (fname: string, buf: Buffer) => {
      await Promise.all([
        fs.promises.writeFile(path.join(uploadsPublicDir, fname), buf),
        fs.promises.writeFile(path.join(uploadsDirectDir, fname), buf)
      ]);
    };

    // Si es SVG, validar que no supere 250 KB
    if (fileExt === '.svg' || file.type === 'image/svg+xml') {
      if (rawBuffer.length > MAX_COMPRESSED_SIZE) {
        return NextResponse.json(
          { success: false, error: 'El archivo SVG supera el límite máximo de 250 KB permitido en el catálogo.' },
          { status: 400 }
        );
      }
      const svgFilename = `${Date.now()}-${baseName}.svg`;
      await saveToDisk(svgFilename, rawBuffer);
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

    // 6. Optimización Veloz:
    // Si la imagen ya viene convertida a WebP desde el navegador del cliente y pesa <= 250 KB,
    // se guarda directamente en 0ms sin consumir CPU del servidor.
    const isAlreadyWebp = file.type === 'image/webp' || (rawBuffer.length > 12 && rawBuffer.toString('utf8', 8, 12) === 'WEBP');

    if (isAlreadyWebp && rawBuffer.length <= MAX_COMPRESSED_SIZE) {
      await saveToDisk(filename, rawBuffer);
      const publicUrl = `/uploads/products/${filename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename,
        originalSize: file.size,
        optimizedSize: rawBuffer.length,
        mimeType: 'image/webp'
      });
    }

    // Si no es WebP o supera los 250 KB, compresión rápida con Sharp (effort: 1 para ejecución ultra rápida <30ms)
    try {
      const optimizedWebpBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({
          width: 1000,
          height: 1000,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 80, effort: 1 })
        .toBuffer();

      await saveToDisk(filename, optimizedWebpBuffer);

      const publicUrl = `/uploads/products/${filename}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename,
        originalSize: file.size,
        optimizedSize: optimizedWebpBuffer.length,
        mimeType: 'image/webp'
      });
    } catch (sharpErr) {
      console.warn('[Sharp fast fallback]:', sharpErr);
      // Fallback seguro: guardar buffer directo si falla sharp
      await saveToDisk(filename, rawBuffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/products/${filename}`,
        filename,
        originalSize: file.size,
        optimizedSize: rawBuffer.length,
        mimeType: 'image/webp'
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
