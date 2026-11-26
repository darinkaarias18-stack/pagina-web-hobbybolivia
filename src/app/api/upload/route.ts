import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { requireAdmin } from '@/lib/auth';

// Límite máximo de archivo crudo de entrada antes de procesar (10 MB)
const MAX_RAW_INPUT_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

function hasValidImageMagicBytes(buf: Buffer): boolean {
  if (!buf || buf.length < 12) return false;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a;
  // JPEG: FF D8 FF
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  // WEBP: "RIFF" .... "WEBP"
  const isWebp =
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP';
  return isPng || isJpeg || isWebp;
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

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

    // 2. Validar formato permitido estrictamente (.jpg, .jpeg, .png, .webp) — SVG bloqueado por seguridad
    const originalName = file.name || '';
    const fileExt = originalName.includes('.')
      ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
      : '';

    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);

    if (!isMimeValid || !isExtValid) {
      return NextResponse.json(
        { success: false, error: 'Solo se permiten imágenes reales en formato PNG, JPEG o WebP.' },
        { status: 400 }
      );
    }

    // 3. Convertir archivo a Buffer y validar magic bytes reales
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    if (!hasValidImageMagicBytes(rawBuffer)) {
      return NextResponse.json(
        { success: false, error: 'El archivo no corresponde a una imagen PNG, JPEG o WebP válida.' },
        { status: 400 }
      );
    }

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

    const filename = `${Date.now()}-${baseName}.webp`;

    // 6. Compresión y re-codificación obligatoria con Sharp (ancho máximo 1000px, formato .webp, calidad 80)
    try {
      const optimizedWebpBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({
          width: 1000,
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
      console.warn('[Sharp compression error]:', sharpErr);
      return NextResponse.json(
        { success: false, error: 'La imagen está dañada o no pudo procesarse de forma segura.' },
        { status: 400 }
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
