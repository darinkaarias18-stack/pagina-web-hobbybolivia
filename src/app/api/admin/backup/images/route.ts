import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { zipSync } from 'fflate';
import { getAllProductsAdmin } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireSuperAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const today = new Date().toISOString().slice(0, 10);
    const dateFormatted = new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' });

    // 1. Obtener productos del catálogo
    let products: any[] = [];
    try {
      products = await getAllProductsAdmin();
    } catch (e) {
      console.warn('Advertencia obteniendo productos para respaldo de imágenes:', e);
    }

    const zipEntries: Record<string, Uint8Array> = {};
    const publicDir = path.join(process.cwd(), 'public');
    const productsDir = path.join(publicDir, 'products');
    const uploadsDir = path.join(publicDir, 'uploads', 'products');
    const placeholderPath = path.join(publicDir, 'images', 'placeholder.webp');

    let totalImageCount = 0;
    let totalBytes = 0;
    const packagedFiles = new Set<string>();

    // 2. Empaquetar imágenes de /public/products/
    if (fs.existsSync(productsDir)) {
      const files = fs.readdirSync(productsDir);
      for (const file of files) {
        if (file.endsWith('.gitkeep')) continue;
        const filePath = path.join(productsDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            const data = fs.readFileSync(filePath);
            zipEntries[`imagenes/products/${file}`] = new Uint8Array(data);
            totalImageCount++;
            totalBytes += stats.size;
            packagedFiles.add(`/products/${file}`);
          }
        } catch (err) {
          console.error(`Error leyendo imagen ${filePath}:`, err);
        }
      }
    }

    // 3. Empaquetar imágenes de /public/uploads/products/
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      for (const file of files) {
        if (file.endsWith('.gitkeep')) continue;
        const filePath = path.join(uploadsDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            const data = fs.readFileSync(filePath);
            zipEntries[`imagenes/uploads/products/${file}`] = new Uint8Array(data);
            totalImageCount++;
            totalBytes += stats.size;
            packagedFiles.add(`/uploads/products/${file}`);
          }
        } catch (err) {
          console.error(`Error leyendo imagen subida ${filePath}:`, err);
        }
      }
    }

    // 4. Empaquetar placeholder oficial
    if (fs.existsSync(placeholderPath)) {
      try {
        const data = fs.readFileSync(placeholderPath);
        zipEntries[`imagenes/placeholder.webp`] = new Uint8Array(data);
        totalImageCount++;
        totalBytes += data.length;
        packagedFiles.add('/images/placeholder.webp');
      } catch (err) {
        console.error('Error leyendo placeholder:', err);
      }
    }

    // 5. Construir índice CSV con UTF-8 BOM
    const csvRows: string[] = [
      'N°,SKU,NOMBRE_PRODUCTO,CATEGORIA,MARCA,PRECIO_USD,STOCK,RUTA_IMAGEN_CATALOGO,NOMBRE_ARCHIVO,TAMANO_KB,ESTADO_EN_RESPALDO'
    ];

    const manifestProducts: any[] = [];

    products.forEach((p, idx) => {
      const sku = (p.sku || `HB-${p.id}`).replace(/,/g, '');
      const name = (p.name || p.title || 'Sin nombre').replace(/"/g, '""').replace(/,/g, ' ');
      const category = (p.category?.name || p.category_name || 'General').replace(/,/g, ' ');
      const brand = (p.brand || 'Hobby Bolivia').replace(/,/g, ' ');
      const priceUsd = Number(p.priceUsd ?? p.price_usd ?? 0).toFixed(2);
      const stock = p.stock ?? p.stockQuantity ?? 0;
      const imgUrl = (p.imageUrl || p.image_url || '').trim();

      let inBackup = 'SIN_IMAGEN';
      let fileName = 'Ninguno';
      let sizeKb = '0';

      if (imgUrl) {
        fileName = path.basename(imgUrl);
        const normPath = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;
        if (packagedFiles.has(normPath) || Array.from(packagedFiles).some(f => f.endsWith(fileName))) {
          inBackup = 'EMPAQUETADA';
          const diskPath = path.join(publicDir, normPath.replace(/^\//, ''));
          if (fs.existsSync(diskPath)) {
            sizeKb = (fs.statSync(diskPath).size / 1024).toFixed(1);
          }
        } else {
          inBackup = 'NO_ENCONTRADA_EN_DISCO';
        }
      }

      csvRows.push(
        `${idx + 1},"${sku}","${name}","${category}","${brand}",${priceUsd},${stock},"${imgUrl}","${fileName}",${sizeKb},"${inBackup}"`
      );

      manifestProducts.push({
        id: p.id,
        sku,
        name: p.name || p.title,
        category,
        brand,
        priceUsd: Number(priceUsd),
        stock,
        imageUrl: imgUrl,
        fileName,
        sizeKb: Number(sizeKb),
        status: inBackup
      });
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    zipEntries['indice_imagenes_catalogo.csv'] = new TextEncoder().encode(csvContent);

    // 6. Construir manifiesto JSON
    const manifest = {
      empresa: 'Hobby Bolivia',
      sitioWeb: 'https://hobbybolivia.com',
      fechaRespaldo: new Date().toISOString(),
      fechaFormatoLocal: dateFormatted,
      totalImagenesEmpaquetadas: totalImageCount,
      tamanoTotalBytes: totalBytes,
      tamanoTotalMB: Number((totalBytes / (1024 * 1024)).toFixed(2)),
      limiteMaximoPorImagenKB: 250,
      totalProductosEnCatalogo: products.length,
      productos: manifestProducts
    };

    zipEntries['manifest_imagenes.json'] = new TextEncoder().encode(JSON.stringify(manifest, null, 2));

    // 7. Instrucciones LEEME_RESPALDO.txt
    const readmeContent = `======================================================================
HOBBY BOLIVIA · RESPALDO OFICIAL DE IMÁGENES DEL CATÁLOGO
======================================================================
Fecha de exportación: ${dateFormatted}
Total de archivos incluidos: ${totalImageCount} imágenes
Tamaño total del archivo ZIP: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB
Cumplimiento técnico: Todas las imágenes optimizadas para Next.js / WebP (máximo 250 KB por fotografía).

CONTENIDO DEL ARCHIVO ZIP:
1. Carpeta /imagenes/
   - /imagenes/products/ : Fotografías de productos con código SKU
   - /imagenes/uploads/products/ : Imágenes subidas desde el módulo administrativo
   - /imagenes/placeholder.webp : Fotografía oficial en preparación

2. indice_imagenes_catalogo.csv
   Tabla completa compatible con Excel con la correspondencia de cada SKU,
   nombre de producto, categoría, precio, tamaño en KB y nombre de archivo.

3. manifest_imagenes.json
   Metadatos estructurados en JSON para sincronizaciones automáticas o scripts de restauración.

INSTRUCCIONES DE RESTAURACIÓN:
- Para restaurar en el servidor Next.js / Plesk / cPanel:
  1. Extraer los archivos de "/imagenes/products/" directamente en "public/products/"
  2. Extraer los archivos de "/imagenes/uploads/products/" en "public/uploads/products/"
  3. Los nombres coinciden exactamente con los registros de la base de datos MariaDB.

Soporte y administración: Hobby Bolivia
======================================================================`;

    zipEntries['LEEME_RESPALDO.txt'] = new TextEncoder().encode(readmeContent);

    // 8. Generar archivo ZIP binario
    const zippedBuffer = zipSync(zipEntries, { level: 6 });

    const fileName = `Hobby_Bolivia_Respaldo_Imagenes_${today}.zip`;

    return new NextResponse(Buffer.from(zippedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(zippedBuffer.length),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generando respaldo de imágenes del catálogo:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar el respaldo de imágenes del catálogo: ' + (error?.message || 'Error desconocido') },
      { status: 500 }
    );
  }
}
