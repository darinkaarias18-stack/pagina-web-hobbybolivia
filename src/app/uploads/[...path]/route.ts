import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Normalizar ruta evitando path traversal
    const safeSegments = pathSegments.map(s => s.replace(/[\/\\]/g, ''));
    const relativePath = path.join(...safeSegments);

    const candidate1 = path.join(process.cwd(), 'public', 'uploads', relativePath);
    const candidate2 = path.join(process.cwd(), 'uploads', relativePath);

    let targetFile = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : null);

    // Si el archivo físico aún no existe en disco local:
    if (!targetFile) {
      // 1. Fallback por SKU en public/products (ej: 1795303639560-aib9891.webp -> AIB9891.webp)
      const fileName = path.basename(relativePath);
      const cleaned = fileName.replace(/^\d+-/, '').replace(/\.[^/.]+$/, '').toLowerCase();
      const prodDir = path.join(process.cwd(), 'public', 'products');
      if (fs.existsSync(prodDir)) {
        const pFiles = fs.readdirSync(prodDir);
        const match = pFiles.find(f => {
          const nameOnly = path.parse(f).name.toLowerCase();
          return nameOnly === cleaned || nameOnly === cleaned.split('-')[0];
        });
        if (match) {
          targetFile = path.join(prodDir, match);
        }
      }

      // 2. Si no está en public/products, sincronizar desde el servidor oficial de producción (Plesk)
      if (!targetFile) {
        try {
          const prodUrl = `https://hobbybolivia.com/uploads/${safeSegments.join('/')}`;
          const resp = await fetch(prodUrl, { signal: AbortSignal.timeout(5000) });
          if (resp.ok) {
            const buffer = Buffer.from(await resp.arrayBuffer());
            try {
              await fs.promises.mkdir(path.dirname(candidate1), { recursive: true });
              await fs.promises.writeFile(candidate1, buffer);
              targetFile = candidate1;
            } catch {
              // Si no se puede escribir en disco, retornar directamente el buffer obtenido
              const ext = path.extname(candidate1).toLowerCase();
              const contentType = MIME_TYPES[ext] || 'application/octet-stream';
              return new NextResponse(buffer, {
                headers: {
                  'Content-Type': contentType,
                  'Cache-Control': 'public, max-age=31536000, immutable',
                }
              });
            }
          }
        } catch (fetchErr) {
          console.warn('[Uploads Route]: No se pudo descargar imagen remota:', fetchErr);
        }
      }
    }

    if (!targetFile || !fs.existsSync(targetFile)) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(targetFile);
    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });
  } catch (error) {
    console.error('[Uploads Route Error]:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

