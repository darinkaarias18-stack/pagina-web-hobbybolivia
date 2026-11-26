import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PassThrough, Readable } from 'stream';
import { ZipArchive } from 'archiver';
import { getAllProductsAdmin } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const today = new Date().toISOString().slice(0, 10);
    const dateFormatted = new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' });

    // 1. Consulta ligera a MySQL (Prisma Client con select puntual y fallback a getAllProductsAdmin)
    let products: any[] = [];
    try {
      const prismaPkg = '@prisma/client';
      const { PrismaClient } = eval('require')(prismaPkg);
      const prisma = new PrismaClient();
      products = await prisma.product.findMany({
        select: {
          id: true,
          sku: true,
          name: true,
          brand: true,
          price: true,
          priceUsd: true,
          stock: true,
          imageUrl: true,
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });
      await prisma.$disconnect();
    } catch {
      products = await getAllProductsAdmin();
    }

    if (!products || products.length === 0) {
      products = await getAllProductsAdmin();
    }

    const statsOnly = request.nextUrl.searchParams.get('stats') === '1';

    const publicDir = path.join(process.cwd(), 'public');
    const productsDir = path.join(publicDir, 'products');
    const uploadsDir = path.join(publicDir, 'uploads', 'products');
    const directUploadsDir = path.join(process.cwd(), 'uploads', 'products');

    // Calcular hashes SHA-256 y tamaños de la imagen plantilla genérica "Fotografía en Preparación"
    const placeholderHashes = new Set<string>();
    const placeholderCandidates = [
      path.join(publicDir, 'placeholder.webp'),
      path.join(publicDir, 'images', 'placeholder.webp'),
    ];
    for (const ph of placeholderCandidates) {
      if (fs.existsSync(ph)) {
        try {
          const buf = fs.readFileSync(ph);
          placeholderHashes.add(crypto.createHash('sha256').update(buf).digest('hex'));
        } catch { }
      }
    }

    const isPlaceholderBuffer = (buf: Buffer): boolean => {
      if (placeholderHashes.size === 0) return false;
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      return placeholderHashes.has(hash);
    };

    const isPlaceholderDiskFile = (diskPath: string): boolean => {
      if (placeholderHashes.size === 0) return false;
      try {
        const buf = fs.readFileSync(diskPath);
        return isPlaceholderBuffer(buf);
      } catch {
        return false;
      }
    };

    type ZipFileItem =
      | { type: 'file'; diskPath: string; archivePath: string; size: number }
      | { type: 'buffer'; buffer: Buffer; archivePath: string; size: number };

    const fileItems: ZipFileItem[] = [];
    const addedArchivePaths = new Set<string>();
    let totalImageCount = 0;
    let totalBytes = 0;

    function stageDiskFile(diskPath: string, archivePath: string): boolean {
      if (addedArchivePaths.has(archivePath)) return false;
      if (!fs.existsSync(diskPath)) return false;
      try {
        const stats = fs.statSync(diskPath);
        if (!stats.isFile()) return false;
        if (isPlaceholderDiskFile(diskPath)) return false;
        addedArchivePaths.add(archivePath);
        fileItems.push({
          type: 'file',
          diskPath,
          archivePath,
          size: stats.size,
        });
        totalImageCount++;
        totalBytes += stats.size;
        return true;
      } catch {
        return false;
      }
    }

    function stageBuffer(buffer: Buffer, archivePath: string): boolean {
      if (addedArchivePaths.has(archivePath)) return false;
      if (isPlaceholderBuffer(buffer)) return false;
      addedArchivePaths.add(archivePath);
      fileItems.push({
        type: 'buffer',
        buffer,
        archivePath,
        size: buffer.length,
      });
      totalImageCount++;
      totalBytes += buffer.length;
      return true;
    }

    if (!statsOnly) {
      // 2. Empaquetar árbol físico de /public/products/ (solo fotografías reales)
      if (fs.existsSync(productsDir)) {
        const files = fs.readdirSync(productsDir);
        for (const file of files) {
          if (file.endsWith('.gitkeep')) continue;
          const filePath = path.join(productsDir, file);
          stageDiskFile(filePath, `imagenes/products/${file}`);
        }
      }

      // 3. Empaquetar árbol físico de uploads (solo fotografías reales)
      const checkUploadDirs = [uploadsDir, directUploadsDir];
      for (const uDir of checkUploadDirs) {
        if (fs.existsSync(uDir)) {
          const files = fs.readdirSync(uDir);
          for (const file of files) {
            if (file.endsWith('.gitkeep')) continue;
            const filePath = path.join(uDir, file);
            stageDiskFile(filePath, `imagenes/uploads/products/${file}`);
          }
        }
      }
    }

    // 5. Rastreo Multiorigen & Renombrado Limpio por SKU (solo fotografías reales)
    let fotosReales = 0;
    let sinFoto = 0;
    const manifestProducts: any[] = [];
    const csvRows: string[] = [
      'N°,SKU,NOMBRE_PRODUCTO,CATEGORIA,MARCA,PRECIO_USD,STOCK,RUTA_IMAGEN_ORIGINAL,NOMBRE_ARCHIVO_SKU,TAMANO_KB,ORIGEN,ESTADO',
    ];

    for (let idx = 0; idx < products.length; idx++) {
      const p = products[idx];
      const sku = (p.sku || `HB-${p.id}`).trim().toUpperCase();
      const cleanSku = sku.replace(/[^A-Z0-9_-]/g, '_');
      const name = (p.name || p.title || 'Sin nombre').replace(/"/g, '""').replace(/,/g, ' ');
      const category = (p.category?.name || p.category_name || 'General').replace(/,/g, ' ');
      const brand = (p.brand || 'Hobby Bolivia').replace(/,/g, ' ');
      const priceUsd = Number(p.priceUsd ?? p.price_usd ?? 0).toFixed(2);
      const stock = p.stock ?? p.stockQuantity ?? 0;
      const rawImg = String(p.imageUrl || p.image_url || p.image || '').trim();

      let resolvedDiskPath: string | null = null;
      let fileExt = '.webp';
      let originType = 'DESCONOCIDO';
      let status = 'SIN_IMAGEN';
      let sizeKb = 0;
      let skuFileName = 'NO_DISPONIBLE';

      const isExplicitPlaceholder =
        !rawImg ||
        rawImg.toLowerCase().includes('placeholder') ||
        rawImg.includes('d0721149ad-dubq3570tn-t');

      // Origen a): Cadena Base64 / Data URL
      if (!isExplicitPlaceholder && rawImg.startsWith('data:image/')) {
        try {
          const match = rawImg.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (match) {
            const rawExt = match[1].toLowerCase();
            fileExt = rawExt === 'jpeg' ? '.jpg' : `.${rawExt}`;
            const buf = Buffer.from(match[2], 'base64');
            if (isPlaceholderBuffer(buf)) {
              originType = 'PLACEHOLDER_EN_PREPARACION';
              status = 'EN_PREPARACION';
              sinFoto++;
            } else {
              skuFileName = `${cleanSku}${fileExt}`;
              if (!statsOnly) stageBuffer(buf, `imagenes_por_sku/${skuFileName}`);
              originType = 'BASE64_DATA_URL';
              status = 'CONVERTIDA_A_IMAGEN';
              sizeKb = Number((buf.length / 1024).toFixed(1));
              fotosReales++;
            }
          } else {
            sinFoto++;
          }
        } catch {
          sinFoto++;
        }
      }
      // Origen b): Ruta local en public/products/ o public/uploads/
      else if (!isExplicitPlaceholder) {
        const cleanPath = rawImg.replace(/^\//, '');
        const baseName = path.basename(cleanPath);
        const candidates = [
          path.join(publicDir, cleanPath),
          path.join(process.cwd(), cleanPath),
          path.join(productsDir, baseName),
          path.join(uploadsDir, baseName),
          path.join(directUploadsDir, baseName),
          path.join(productsDir, `${cleanSku}.webp`),
          path.join(productsDir, `${cleanSku}.jpg`),
          path.join(productsDir, `${cleanSku}.png`),
        ];

        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) {
            try {
              const stats = fs.statSync(candidate);
              if (stats.isFile()) {
                resolvedDiskPath = candidate;
                fileExt = path.extname(candidate).toLowerCase() || '.webp';
                sizeKb = Number((stats.size / 1024).toFixed(1));
                break;
              }
            } catch { }
          }
        }

        if (resolvedDiskPath) {
          if (isPlaceholderDiskFile(resolvedDiskPath)) {
            originType = 'PLACEHOLDER_EN_PREPARACION';
            status = 'EN_PREPARACION';
            sizeKb = 0;
            skuFileName = 'NO_DISPONIBLE';
            sinFoto++;
          } else {
            originType = resolvedDiskPath.includes('upload') ? 'UPLOADS_PANEL' : 'PRODUCTS_LOCAL';
            status = 'ENCONTRADA_EN_DISCO';
            skuFileName = `${cleanSku}${fileExt}`;
            if (!statsOnly) stageDiskFile(resolvedDiskPath, `imagenes_por_sku/${skuFileName}`);
            fotosReales++;
          }
        } else {
          // Manejo tolerante: omitir archivo faltante en el ZIP y registrarlo en el manifiesto
          originType = 'ARCHIVO_FALTANTE';
          status = 'NO_ENCONTRADA_EN_DISCO';
          sizeKb = 0;
          skuFileName = 'NO_DISPONIBLE';
          sinFoto++;
        }
      } else {
        originType = rawImg ? 'PLACEHOLDER_EN_PREPARACION' : 'SIN_ASIGNAR';
        status = rawImg ? 'EN_PREPARACION' : 'SIN_IMAGEN';
        sizeKb = 0;
        skuFileName = 'NO_DISPONIBLE';
        sinFoto++;
      }

      if (!statsOnly) {
        csvRows.push(
          `${idx + 1},"${sku}","${name}","${category}","${brand}",${priceUsd},${stock},"${rawImg}","${skuFileName}",${sizeKb},"${originType}","${status}"`
        );

        manifestProducts.push({
          id: p.id,
          sku,
          name: p.name || p.title,
          category,
          brand,
          priceUsd: Number(priceUsd),
          stock,
          rawImageUrl: rawImg,
          skuFileName,
          sizeKb,
          origin: originType,
          status,
        });
      }
    }

    if (statsOnly) {
      return NextResponse.json({
        success: true,
        totalProductos: products.length,
        fotosReales,
        sinFoto,
      });
    }

    // Totales en CSV de correspondencia
    csvRows.push('');
    csvRows.push(`"RESUMEN","fotos_reales",${fotosReales},"pendientes_foto",${sinFoto},"total_productos",${products.length},"","","","",""`);

    // 6. Construir índice CSV con UTF-8 BOM
    const csvContent = '\uFEFF' + csvRows.join('\r\n');

    // 7. Manifiesto JSON estructurado
    const manifest = {
      empresa: 'Hobby Bolivia',
      sitioWeb: 'https://hobbybolivia.com',
      fechaRespaldo: new Date().toISOString(),
      fechaFormatoLocal: dateFormatted,
      totalArchivosEnZip: totalImageCount,
      tamanoTotalBytes: totalBytes,
      tamanoTotalMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
      limiteMaximoPorImagenKB: 250,
      totalProductosEnCatalogo: products.length,
      fotos_reales: fotosReales,
      pendientes_foto: sinFoto,
      productos: manifestProducts,
    };
    const manifestContent = JSON.stringify(manifest, null, 2);

    // 8. LEEME_RESPALDO.txt con especificaciones técnicas
    const readmeContent = `======================================================================
HOBBY BOLIVIA · RESPALDO OFICIAL DE IMÁGENES DEL CATÁLOGO (${products.length} PRODUCTOS)
======================================================================
Fecha de exportación: ${dateFormatted}
Productos con fotografía real: ${fotosReales}
Productos sin foto (en preparación): ${sinFoto}
Total de archivos incluidos: ${totalImageCount} imágenes reales
Tamaño total estimado: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB
Modo de compresión: STORE (level 0 - streaming directo de alto rendimiento)
Base de datos: MySQL / MariaDB (Plesk Hosting)
Cumplimiento técnico: Todas las imágenes optimizadas (≤ 250 KB por fotografía).

ESTRUCTURA DE ARCHIVOS EN ESTE ARCHIVO ZIP:
1. /imagenes_por_sku/
   Contiene las imágenes de los productos renombradas limpiamente por su
   código SKU de catálogo (ej. DUBQ0212.webp, F-OM10.webp, MASQ1300.webp).
   Incluye tanto imágenes predeterminadas como todas las fotografías subidas
   desde el panel de administración.

2. /imagenes/products/
   Árbol original de fotografías del catálogo.

3. /imagenes/uploads/products/
   Árbol de imágenes subidas en tiempo real desde el módulo administrativo.

4. indice_imagenes_catalogo.csv
   Tabla completa compatible con Microsoft Excel conteniendo la correspondencia
   de cada producto, SKU, categoría, precio en USD, stock, tamaño y ruta.

5. manifest_imagenes.json
   Metadatos estructurados en JSON para sincronizaciones automáticas o scripts.

Soporte técnico: Hobby Bolivia
======================================================================`;

    // 9. Inicializar generador ZIP en modo STORE (zlib level 0) para rendimiento óptimo
    const archive = new ZipArchive({
      store: true,
      zlib: { level: 0 },
      forceZip64: false,
    });

    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    // Manejo de errores en archive
    archive.on('error', (err: any) => {
      console.error('[Backup ZIP Archive Error]:', err);
      passThrough.destroy(err);
    });

    // Proceso asíncrono de transmisión de archivos por streaming directo
    (async () => {
      try {
        // Archivos informativos de texto en la raíz del ZIP
        archive.append(readmeContent, { name: 'LEEME_RESPALDO.txt' });
        archive.append(csvContent, { name: 'indice_imagenes_catalogo.csv' });
        archive.append(manifestContent, { name: 'manifest_imagenes.json' });

        // Transmisión directa por streaming de cada imagen física
        for (const item of fileItems) {
          if (item.type === 'file') {
            archive.file(item.diskPath, { name: item.archivePath });
          } else if (item.type === 'buffer') {
            archive.append(item.buffer, { name: item.archivePath });
          }
        }

        // Finalizar el archivo ZIP (cierra el stream)
        await archive.finalize();
      } catch (streamErr: any) {
        console.error('[Backup ZIP Stream Error]:', streamErr);
        passThrough.destroy(streamErr);
      }
    })();

    const responseStream = Readable.toWeb(passThrough);
    const fileName = `Hobby_Bolivia_Respaldo_Imagenes_${today}.zip`;

    return new Response(responseStream as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generando respaldo de imágenes del catálogo:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'Error al generar el respaldo de imágenes del catálogo: ' +
          (error?.message || 'Error desconocido'),
      },
      { status: 500 }
    );
  }
}
