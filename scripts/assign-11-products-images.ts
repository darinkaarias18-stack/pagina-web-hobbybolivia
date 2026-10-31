import * as fs from 'fs';
import * as path from 'path';

export const BATCH_3_IMAGE_MAPPINGS: Record<string, string> = {
  // Hélices Tripala asignadas a 'MASQ1906.jpg'
  'MASQ1908': '/products/MASQ1906.jpg',
  'MASQ1966': '/products/MASQ1906.jpg',

  // Balanceador asignado a 'AIB14927.jpg'
  'AIB14927': '/products/AIB14927.jpg',

  // Hélices Eléctricas asignadas a 'MASQ1337.jpg'
  'MASQ0705E': '/products/MASQ1337.jpg',
  'MASQ0805E': '/products/MASQ1337.jpg',
  'MASQ0603E': '/products/MASQ1337.jpg',
  'MASQ1260E': '/products/MASQ1337.jpg',
  'MASQ1270E': '/products/MASQ1337.jpg',
  'MASQ1360E': '/products/MASQ1337.jpg',
  'MASQ1385E': '/products/MASQ1337.jpg',

  // Palas de Hélice Plegable asignadas a 'AIBFP.jpg'
  'AIBFP12-6,5': '/products/AIBFP.jpg',
};

// 1. Actualizar prisma/seed-catalog.ts
const seedCatalogPath = path.resolve(process.cwd(), 'prisma', 'seed-catalog.ts');
let seedCatalogContent = fs.readFileSync(seedCatalogPath, 'utf8');

for (const [sku, imageUrl] of Object.entries(BATCH_3_IMAGE_MAPPINGS)) {
  const escapedSku = sku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const skuRegex = new RegExp(
    `(sku:\\s*'${escapedSku}'[\\s\\S]*?image_url:\\s*)(null|'[^']*')([\\s\\S]*?imageUrl:\\s*)(null|'[^']*')`,
    'm'
  );
  if (skuRegex.test(seedCatalogContent)) {
    seedCatalogContent = seedCatalogContent.replace(
      skuRegex,
      `$1'${imageUrl}'$3'${imageUrl}'`
    );
    console.log(`[seed-catalog.ts] ✅ Actualizado SKU: ${sku} -> ${imageUrl}`);
  } else {
    console.warn(`[seed-catalog.ts] ⚠️ No se encontró SKU: ${sku}`);
  }
}

fs.writeFileSync(seedCatalogPath, seedCatalogContent, 'utf8');

// 2. Actualizar src/lib/initial-data.ts
const initialDataPath = path.resolve(process.cwd(), 'src', 'lib', 'initial-data.ts');
let initialDataContent = fs.readFileSync(initialDataPath, 'utf8');

for (const [sku, imageUrl] of Object.entries(BATCH_3_IMAGE_MAPPINGS)) {
  const escapedSku = sku.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const skuRegex = new RegExp(
    `(sku:\\s*"${escapedSku}"[\\s\\S]*?image_url:\\s*)(null|"[^"]*")([\\s\\S]*?images:\\s*)(null|\\[[^\\]]*\\])`,
    'm'
  );
  if (skuRegex.test(initialDataContent)) {
    initialDataContent = initialDataContent.replace(
      skuRegex,
      `$1"${imageUrl}"$3["${imageUrl}"]`
    );
    console.log(`[initial-data.ts] ✅ Actualizado SKU: ${sku} -> ${imageUrl}`);
  } else {
    console.warn(`[initial-data.ts] ⚠️ No se encontró SKU: ${sku}`);
  }
}

fs.writeFileSync(initialDataPath, initialDataContent, 'utf8');

console.log('✨ Mapeo de 11 repuestos aplicado con éxito a seed-catalog.ts e initial-data.ts');

