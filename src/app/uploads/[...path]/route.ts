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

    const targetFile = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : null);

    if (!targetFile) {
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

