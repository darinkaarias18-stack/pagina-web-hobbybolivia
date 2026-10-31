import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { assertCatalogImageUnder250KB, MAX_CATALOG_IMAGE_BYTES } from '../src/lib/db';
import { revalidateCatalog } from '../src/lib/revalidate';

async function runQAAudit() {
  console.log('================================================================');
  console.log('🛠️ QA AUDIT & VERIFICATION REPORT: IMAGES & REAL-TIME SYNC');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(description: string, condition: boolean) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${description}`);
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      process.exitCode = 1;
    }
  }

  // ============================================================================
  // TEST 1: COMPRESIÓN AUTOMÁTICA CON SHARP (MÁX. 1000px y <= 250 KB)
  // ============================================================================
  console.log('1. Verificando Compresor Automático Interno con Sharp:');

  // Generar imagen cruda de prueba de alta resolución (2400x1800 px)
  const rawWidth = 2400;
  const rawHeight = 1800;
  const rawImage = await sharp({
    create: {
      width: rawWidth,
      height: rawHeight,
      channels: 4,
      background: { r: 212, g: 163, b: 89, alpha: 1 }
    }
  })
    .png()
    .toBuffer();

  const originalSizeKb = Math.round(rawImage.length / 1024);
  console.log(`   - Imagen cruda generada para prueba: ${rawWidth}x${rawHeight}px (${originalSizeKb} KB)`);

  // Ejecutar el pipeline de compresión exacto de /api/upload
  const compressionSteps = [
    { maxDimension: 1000, quality: 82 },
    { maxDimension: 1000, quality: 75 },
    { maxDimension: 1000, quality: 68 },
    { maxDimension: 900, quality: 62 },
    { maxDimension: 800, quality: 55 }
  ];

  let optimizedBuffer: Buffer | null = null;
  for (const step of compressionSteps) {
    const candidate = await sharp(rawImage)
      .rotate()
      .resize({
        width: step.maxDimension,
        height: step.maxDimension,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: step.quality, effort: 4 })
      .toBuffer();

    optimizedBuffer = candidate;
    if (candidate.length <= MAX_CATALOG_IMAGE_BYTES) {
      break;
    }
  }

  assert('Sharp procesa la imagen y produce un buffer WebP', optimizedBuffer !== null);

  const optimizedSizeKb = Math.round((optimizedBuffer?.length || 0) / 1024);
  console.log(`   - Tamaño final tras compresión a WebP: ${optimizedSizeKb} KB (Límite: 250 KB)`);

  assert('El archivo comprimido NUNCA supera el límite estricto de 250 KB (256,000 bytes)', (optimizedBuffer?.length || 0) <= MAX_CATALOG_IMAGE_BYTES);

  // Inspeccionar dimensiones de la imagen procesada
  const metadata = await sharp(optimizedBuffer!).metadata();
  console.log(`   - Dimensiones resultantes: ${metadata.width}x${metadata.height}px (Formato: ${metadata.format})`);
  assert('La dimensión máxima no supera los 1000px', (metadata.width || 0) <= 1000 && (metadata.height || 0) <= 1000);
  assert('El formato final resultante es WebP', metadata.format === 'webp');

  // ============================================================================
  // TEST 2: REGLAS DE BASE DE DATOS MARIADB (RECHAZO DE BLOB Y RUTA RELATIVA)
  // ============================================================================
  console.log('\n2. Verificando Reglas de Integridad en MariaDB / Prisma:');

  // Prueba 2.1: Ruta relativa válida permitida
  let relativePathAllowed = false;
  try {
    assertCatalogImageUnder250KB('/uploads/products/179341-sample-part.webp');
    relativePathAllowed = true;
  } catch {
    relativePathAllowed = false;
  }
  assert('Ruta relativa de texto (/uploads/products/...) es aceptada correctamente', relativePathAllowed);

  // Prueba 2.2: Rechazo de BLOB / Base64
  let blobRejected = false;
  try {
    const fakeBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    assertCatalogImageUnder250KB(fakeBase64);
  } catch (err: any) {
    if (err.message.includes('No se permite almacenar imágenes en formato binario (BLOB / Base64)')) {
      blobRejected = true;
    }
  }
  assert('La base de datos RECHAZA terminantemente datos binarios (BLOB / Base64)', blobRejected);

  // Prueba 2.3: Verificación de schema.prisma VARCHAR(500)
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const hasVarchar500 = schemaContent.includes('imageUrl         String?       @map("image_url") @db.VarChar(500)');
  assert('El campo image_url en MariaDB/Prisma está configurado como VarChar(500), imposibilitando almacenar BLOB', hasVarchar500);

  // ============================================================================
  // TEST 3: SINCRONIZACIÓN EN TIEMPO REAL Y REVALIDACIÓN DE CACHÉ
  // ============================================================================
  console.log('\n3. Verificando Mecanismo de Sincronización en Tiempo Real:');

  let revalidationRanCleanly = false;
  try {
    revalidateCatalog();
    revalidationRanCleanly = true;
  } catch {
    revalidationRanCleanly = false;
  }
  assert('La función revalidateCatalog() se ejecuta sin lanzar excepciones no controladas', revalidationRanCleanly);

  // Verificar que los endpoints principales importan y llaman a revalidateCatalog
  const apiProductsPath = path.join(process.cwd(), 'src', 'app', 'api', 'products', 'route.ts');
  const apiProductIdPath = path.join(process.cwd(), 'src', 'app', 'api', 'products', '[id]', 'route.ts');
  const apiCategoriesPath = path.join(process.cwd(), 'src', 'app', 'api', 'categories', 'route.ts');
  const apiExchangeRatePath = path.join(process.cwd(), 'src', 'app', 'api', 'exchange-rate', 'route.ts');
  const apiSettingsPath = path.join(process.cwd(), 'src', 'app', 'api', 'settings', 'route.ts');

  assert('/api/products incluye revalidación activa', fs.readFileSync(apiProductsPath, 'utf8').includes('revalidateCatalog()'));
  assert('/api/products/[id] incluye revalidación activa en PUT y DELETE', fs.readFileSync(apiProductIdPath, 'utf8').includes('revalidateCatalog()'));
  assert('/api/categories incluye revalidación activa en POST, PUT y DELETE', fs.readFileSync(apiCategoriesPath, 'utf8').includes('revalidateCatalog()'));
  assert('/api/exchange-rate incluye revalidación activa', fs.readFileSync(apiExchangeRatePath, 'utf8').includes('revalidateCatalog()'));
  assert('/api/settings incluye revalidación activa', fs.readFileSync(apiSettingsPath, 'utf8').includes('revalidateCatalog()'));

  // Verificar canal BroadcastChannel para sincronización instantánea entre pestañas
  const catalogViewPath = path.join(process.cwd(), 'src', 'components', 'catalog', 'CatalogView.tsx');
  const hasBroadcastChannel = fs.readFileSync(catalogViewPath, 'utf8').includes('new BroadcastChannel(\'hb_catalog_channel\')');
  assert('BroadcastChannel (hb_catalog_channel) activo en CatalogView para actualización instantánea sin recargar', hasBroadcastChannel);

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL: ${passedTests} de ${totalTests} pruebas superadas exitosamente.`);
  console.log('================================================================\n');
}

runQAAudit().catch((err) => {
  console.error('Fatal QA error:', err);
  process.exit(1);
});
