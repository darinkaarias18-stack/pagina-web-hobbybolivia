import * as fs from 'fs';
import * as path from 'path';

export const PROPELLER_IMAGE_MAPPINGS: Record<string, string> = {
  // Hélices asignadas a 'MASQ1337.jpg'
  'MASQ1355': '/products/MASQ1337.jpg',
  'MASQ1359': '/products/MASQ1337.jpg',
  'MASQ1360': '/products/MASQ1337.jpg',
  'MASQ1362': '/products/MASQ1337.jpg',
  'MASQ1370': '/products/MASQ1337.jpg',
  'MASQ1373': '/products/MASQ1337.jpg',
  'MASQ1380': '/products/MASQ1337.jpg',
  'MASQ1390': '/products/MASQ1337.jpg',
  'MASQ1395': '/products/MASQ1337.jpg',
  'MASQ1400': '/products/MASQ1337.jpg',
  'MASQ1410': '/products/MASQ1337.jpg',
  'MASQ1519': '/products/MASQ1337.jpg',
  'MASQ1756': '/products/MASQ1337.jpg',

  // Hélices APC asignadas a 'APCQ1238.jpg'
  'APCQ0116': '/products/APCQ1238.jpg',
  'APCQ1109': '/products/APCQ1238.jpg',
  'APCQ1212': '/products/APCQ1238.jpg',
  'APCQ1413': '/products/APCQ1238.jpg',
  'APCQ1610': '/products/APCQ1238.jpg',

  // Hélices Tripala asignadas a 'MASQ1906.jpg'
  'MASQ0640': '/products/MASQ1906.jpg',
  'MASQ1905': '/products/MASQ1906.jpg',
  'MASQ1907': '/products/MASQ1906.jpg',
};

// 1. Actualizar prisma/seed-catalog.ts
const seedCatalogPath = path.resolve(process.cwd(), 'prisma', 'seed-catalog.ts');
let seedCatalogContent = fs.readFileSync(seedCatalogPath, 'utf8');

for (const [sku, imageUrl] of Object.entries(PROPELLER_IMAGE_MAPPINGS)) {
  const skuRegex = new RegExp(
    `(sku:\\s*'${sku}'[\\s\\S]*?image_url:\\s*)(null|'[^']*')([\\s\\S]*?imageUrl:\\s*)(null|'[^']*')`,
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

for (const [sku, imageUrl] of Object.entries(PROPELLER_IMAGE_MAPPINGS)) {
  const skuRegex = new RegExp(
    `(sku:\\s*"${sku}"[\\s\\S]*?image_url:\\s*)(null|"[^"]*")([\\s\\S]*?images:\\s*)(null|\\[[^\\]]*\\])`,
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

console.log('✨ Mapeo de 21 hélices aplicado con éxito a seed-catalog.ts e initial-data.ts');

