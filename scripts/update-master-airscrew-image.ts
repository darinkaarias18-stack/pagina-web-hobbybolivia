import * as fs from 'fs';
import * as path from 'path';

const TARGET_SKUS = [
  'MASQ1210',
  'MASQ1220',
  'MASQ1240',
  'MASQ1280',
  'MASQ1300',
  'MASQ1320',
  'MASQ1330',
  'MASQ1336',
  'MASQ1337',
  'MASQ1340',
  'MASQ1350',
  'MASQ1353',
];
const SHARED_IMAGE = '/products/MASQ1337.jpg';

// 1. Actualizar prisma/seed-catalog.ts
const seedCatalogPath = path.resolve(process.cwd(), 'prisma', 'seed-catalog.ts');
let seedCatalogContent = fs.readFileSync(seedCatalogPath, 'utf8');

for (const sku of TARGET_SKUS) {
  const skuRegex = new RegExp(
    `(sku:\\s*'${sku}'[\\s\\S]*?image_url:\\s*)null([\\s\\S]*?imageUrl:\\s*)null`,
    'm'
  );
  if (skuRegex.test(seedCatalogContent)) {
    seedCatalogContent = seedCatalogContent.replace(
      skuRegex,
      `$1'${SHARED_IMAGE}'$2'${SHARED_IMAGE}'`
    );
    console.log(`[seed-catalog.ts] ✅ Actualizado SKU: ${sku}`);
  } else {
    console.warn(`[seed-catalog.ts] ⚠️ No se encontró o ya estaba actualizado SKU: ${sku}`);
  }
}

fs.writeFileSync(seedCatalogPath, seedCatalogContent, 'utf8');

// 2. Actualizar src/lib/initial-data.ts
const initialDataPath = path.resolve(process.cwd(), 'src', 'lib', 'initial-data.ts');
let initialDataContent = fs.readFileSync(initialDataPath, 'utf8');

for (const sku of TARGET_SKUS) {
  const skuRegex = new RegExp(
    `(sku:\\s*"${sku}"[\\s\\S]*?image_url:\\s*)null([\\s\\S]*?images:\\s*)\\[\\]`,
    'm'
  );
  if (skuRegex.test(initialDataContent)) {
    initialDataContent = initialDataContent.replace(
      skuRegex,
      `$1"${SHARED_IMAGE}"$2["${SHARED_IMAGE}"]`
    );
    console.log(`[initial-data.ts] ✅ Actualizado SKU: ${sku}`);
  } else {
    console.warn(`[initial-data.ts] ⚠️ No se encontró o ya estaba actualizado SKU: ${sku}`);
  }
}

fs.writeFileSync(initialDataPath, initialDataContent, 'utf8');

console.log('✨ Mapeo de imagen compartida aplicado a seed-catalog.ts e initial-data.ts');
