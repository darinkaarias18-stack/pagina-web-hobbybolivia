import * as fs from 'fs';
import * as path from 'path';

export const SPINNERS_CONSTRUCCION_IMAGE_MAPPINGS: Record<string, string> = {
  // Categoría SPINNERS:
  'DUBQ3694': '/products/DUBQ3694.jpg',
  'DUBQ3730': '/products/DUBQ3730.jpg',
  'DUBQ3731': '/products/DUBQ3731.jpg',
  'SP2751': '/products/Spinner_Blanco.jpg',
  'SP2752': '/products/Spinner_Negro.jpg',
  'SP2753': '/products/Spinner_Rojo.jpg',
  'SP2754': '/products/Spinner_Azul.jpg',
  'SP2755': '/products/Spinner_Amarillo.jpg',
  'SP305': '/products/Spinner_Amarillo.jpg',

  // Categoría CONSTRUCCION:
  'AIB1011425': '/products/AIB1011425.jpg',
  'AIB8424': '/products/AIB8424.jpg',
  'DUBQ0916': '/products/DUBQ0916.jpg',
  'DUBQ0937': '/products/DUBQ0937.jpg',
  'DUBQ2025': '/products/DUBQ2025.jpg',
  'DUBQ2035': '/products/DUBQ2035.jpg',
  'DUBQ2040': '/products/DUBQ2040.jpg',
  'AIB1980': '/products/AIB1980.jpg',
  'DUBQ1980': '/products/DUBQ1980.jpg',
  'DUBQ8484': '/products/DUBQ8484.jpg',
  'DUBQ1575': '/products/DUBQ1575.jpg',
  'DUBQ1580': '/products/DUBQ1580.jpg',
};

// 1. Actualizar prisma/seed-catalog.ts
const seedCatalogPath = path.resolve(process.cwd(), 'prisma', 'seed-catalog.ts');
let seedCatalogContent = fs.readFileSync(seedCatalogPath, 'utf8');

for (const [sku, imageUrl] of Object.entries(SPINNERS_CONSTRUCCION_IMAGE_MAPPINGS)) {
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

for (const [sku, imageUrl] of Object.entries(SPINNERS_CONSTRUCCION_IMAGE_MAPPINGS)) {
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

console.log('✨ Mapeo de 21 repuestos (Spinners & Construcción) aplicado con éxito a seed-catalog.ts e initial-data.ts');

