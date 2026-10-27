import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getSessionUser } from '@/lib/auth';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB (2,097,152 bytes)
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

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

    // 1. Validar límite estricto de tamaño a 2 MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El tamaño máximo permitido por imagen es de 2 MB.' },
        { status: 400 }
      );
    }

    // 2. Validar formato permitido (.jpg, .jpeg, .png, .webp)
    const originalName = file.name || '';
    const fileExt = originalName.includes('.')
      ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
      : (file.type === 'image/png' ? '.png' : (file.type === 'image/webp' ? '.webp' : '.jpg'));

    const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type);
    const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);

    if (!isMimeValid && !isExtValid) {
      return NextResponse.json(
        { success: false, error: 'Solo se permiten formatos web (.jpg, .jpeg, .png, .webp)' },
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
      .replace(/^-+|-+$/g, '') || 'repuesto';

    const filename = `${Date.now()}-${baseName}.webp`;
    const filePath = path.join(uploadsDir, filename);

    // 6. Optimización y compresión a WebP con Sharp
    const optimizedWebpBuffer = await sharp(rawBuffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    await fs.promises.writeFile(filePath, optimizedWebpBuffer);

    // 7. Ruta relativa resultante
    const publicUrl = `/uploads/products/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      originalSize: file.size,
      optimizedSize: optimizedWebpBuffer.length,
      mimeType: 'image/webp'
    });
  } catch (error: any) {
    console.error('Error al procesar subida de imagen en /api/upload:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al procesar y optimizar la imagen' },
      { status: 500 }
    );
  }
}
