import * as fs from 'fs';
import * as path from 'path';

export const TARGET_PRODUCT_IMAGE_MAPPING: Record<string, string> = {
  'DUBQ0290': '/products/DUBQ0290.jpg',
  'DAVP2500': '/products/DAVP2500.jpg',
  'DUBQ0197': '/products/DUBQ0197.jpg',
  'DUBQ9617': '/products/DUBQ9617.jpg',
  'SULQ4290': '/products/SULQ4290.jpg',
  'AIB0002': '/products/AIB0002.jpg',
  'AIB11271': '/products/AIB11271.jpg',
  'AIB14458': '/products/AIB14458.jpg',
  'AIB14459': '/products/AIB14459.jpg',
  'AIB3743': '/products/AIB3743.jpg',
  'AIB23330': '/products/AIB23330.jpg',
  'AIB6222-5': '/products/AIB6222-5.jpg',
  'FUTM0031': '/products/FUTM0031.jpg',
};

// 1. Actualizar prisma/seed-catalog.ts
const seedCatalogPath = path.resolve(process.cwd(), 'prisma', 'seed-catalog.ts');
let seedCatalogContent = fs.readFileSync(seedCatalogPath, 'utf8');

for (const [sku, imageUrl] of Object.entries(TARGET_PRODUCT_IMAGE_MAPPING)) {
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

for (const [sku, imageUrl] of Object.entries(TARGET_PRODUCT_IMAGE_MAPPING)) {
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

console.log('✨ Mapeo de 13 repuestos aplicado con éxito a seed-catalog.ts e initial-data.ts');
