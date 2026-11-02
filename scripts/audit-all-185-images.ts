import fs from 'fs';
import path from 'path';

async function main() {
  console.log('=== AUDITORÍA COMPLETA DE IMÁGENES DE LOS 185 PRODUCTOS ===\n');

  // 1. Leer .data/db.json
  const dbJson = JSON.parse(fs.readFileSync('.data/db.json', 'utf8'));
  const items = dbJson.items || [];
  console.log(`Total productos en .data/db.json: ${items.length}`);

  // 2. Archivos existentes en public/products y public/uploads
  const publicDir = path.join(process.cwd(), 'public');
  const productsDir = path.join(publicDir, 'products');
  const filesOnDisk = fs.existsSync(productsDir) ? fs.readdirSync(productsDir) : [];
  console.log(`Archivos físicos encontrados en public/products/: ${filesOnDisk.length}`);

  // Mapeo case-insensitive de archivos en disco
  const diskMap = new Map<string, string>();
  for (const f of filesOnDisk) {
    diskMap.set(f.toLowerCase(), `/products/${f}`);
    // También guardar sin extensión
    const base = path.parse(f).name.toLowerCase();
    diskMap.set(base, `/products/${f}`);
  }

  // 3. Revisar cada producto
  let assignedCount = 0;
  let placeholderCount = 0;
  let recoverableBySku = 0;
  const missingList: any[] = [];
  const recoverableList: any[] = [];

  for (const item of items) {
    const currentImg = item.image_url || item.imageUrl || (item.images && item.images[0]);
    const isPlaceholder = !currentImg || currentImg === '/placeholder.webp' || currentImg.includes('placeholder');

    // Comprobar si existe un archivo en disco que coincida con el SKU
    const skuClean = (item.sku || '').trim().toLowerCase();
    const diskMatch = diskMap.get(skuClean);

    if (!isPlaceholder) {
      assignedCount++;
    } else {
      placeholderCount++;
      if (diskMatch) {
        recoverableBySku++;
        recoverableList.push({
          id: item.id,
          sku: item.sku,
          name: item.name,
          matchedFile: diskMatch
        });
      } else {
        missingList.push({
          id: item.id,
          sku: item.sku,
          name: item.name,
          category_id: item.category_id || item.categoryId
        });
      }
    }
  }

  console.log(`\nResultados:`);
  console.log(` - Con foto asignada: ${assignedCount}`);
  console.log(` - Con placeholder: ${placeholderCount}`);
  console.log(` - Recuperables automáticamente por coincidencia de SKU: ${recoverableBySku}`);
  console.log(` - Sin archivo en disco correspondiente: ${missingList.length}`);

  if (recoverableList.length > 0) {
    console.log(`\nEjemplos recuperables por SKU en disco:`, recoverableList.slice(0, 10));
  }

  console.log(`\nArchivos en disco no asignados a ningún producto o disponibles:`);
  const usedFiles = new Set(items.map((p: any) => (p.image_url || '').toLowerCase()));
  const unassigned = filesOnDisk.filter(f => !usedFiles.has(`/products/${f.toLowerCase()}`));
  console.log(`Total archivos en public/products sin asignar: ${unassigned.length}`);
  console.log(unassigned.slice(0, 30));

  // Desglose de los productos que no tienen imagen
  console.log(`\nProductos sin imagen en disco (${missingList.length}):`);
  const missingByCat: Record<number, number> = {};
  missingList.forEach(m => {
    missingByCat[m.category_id] = (missingByCat[m.category_id] || 0) + 1;
  });
  console.log('Faltantes por ID de categoría:', missingByCat);
}

main().catch(console.error);
