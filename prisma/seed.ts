import { PrismaClient } from '@prisma/client';
import {
  initialSiteConfig,
  initialCategories,
  initialOccasions,
  initialBanners
} from '../src/lib/initial-data';
import { seedCatalog, OFFICIAL_CATEGORIES, OFFICIAL_PRODUCTS } from './seed-catalog';

const prisma = new PrismaClient();

export async function main() {
  console.log("🌸 Iniciando Seed oficial de catálogo para Hobby Bolivia...");

  // Siempre ejecutar la sincronización y limpieza del catálogo en .data/db.json
  await seedCatalog();

  // Si DATABASE_URL está configurado, sincronizar con Prisma ORM / MariaDB
  if (process.env.DATABASE_URL) {
    try {
      console.log("🔌 Conectando con MariaDB / MySQL vía Prisma...");
      await prisma.$connect();

      // 1. SiteConfig
      const existingConfig = await prisma.siteConfig.findFirst();
      if (!existingConfig) {
        await prisma.siteConfig.create({
          data: initialSiteConfig
        });
        console.log("Configuración inicial de Hobby Bolivia creada.");
      }

      // 2. Admin User
      const existingUser = await prisma.user.findFirst({
        where: { email: "dariasdigital_hobbybolivia" }
      });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            name: "dariasdigital_hobbybolivia",
            email: "dariasdigital_hobbybolivia",
            passwordHash: "Imp6fSMr2%mj0w?v",
            role: "ADMIN"
          }
        });
        console.log("Usuario administrador dariasdigital_hobbybolivia creado.");
      }

      // 3. Categories con prisma.category.upsert
      const categoryMap: Record<number, number> = {};
      for (const cat of OFFICIAL_CATEGORIES) {
        const c = await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {
            name: cat.name,
            description: cat.description,
            imageUrl: cat.imageUrl,
            order: cat.order,
            isActive: cat.isActive
          },
          create: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            imageUrl: cat.imageUrl,
            order: cat.order,
            isActive: cat.isActive
          }
        });
        categoryMap[cat.id] = c.id;
      }
      console.log(`✅ ${OFFICIAL_CATEGORIES.length} categorías oficiales registradas en Prisma.`);

      // 4. Products con prisma.product.upsert (evitando duplicados por SKU)
      const exchangeRate = 12.01;

      for (const prod of OFFICIAL_PRODUCTS) {
        const catId = categoryMap[prod.categoryId];
        if (catId) {
          const priceBob = Number((prod.priceUsd * exchangeRate).toFixed(2));
          await prisma.product.upsert({
            where: { sku: prod.sku },
            update: {
              name: prod.name,
              slug: prod.slug,
              categoryId: catId,
              scale: prod.scale,
              material: prod.material,
              specsLine: prod.specs_line,
              compatibleModels: prod.compatible_models,
              // Precios y stock preservados en update para no sobreescribir datos existentes en MariaDB
              imageUrl: prod.image_url || prod.imageUrl || null,
              isActive: prod.is_active ?? true,
              brand: prod.brand,
              description: prod.description
            },
            create: {
              sku: prod.sku,
              name: prod.name,
              slug: prod.slug,
              categoryId: catId,
              scale: prod.scale,
              material: prod.material,
              specsLine: prod.specs_line,
              compatibleModels: prod.compatible_models,
              price: priceBob,
              priceUsd: prod.priceUsd,
              stock: prod.stock,
              badge: prod.badge,
              imageUrl: prod.image_url || prod.imageUrl || null,
              isActive: prod.is_active ?? true,
              brand: prod.brand,
              description: prod.description
            }
          });
        }
      }
      console.log(`✈️ ${OFFICIAL_PRODUCTS.length} productos oficiales sincronizados con prisma.product.upsert en MariaDB.`);

      // 5. Mapeo explícito de imagen compartida para Hélices Master Airscrew (sin alterar precios ni stock)
      const MASTER_AIRSCREW_IMAGE_MAPPING: Record<string, string> = {
        'MASQ1210': '/products/MASQ1337.jpg',
        'MASQ1220': '/products/MASQ1337.jpg',
        'MASQ1240': '/products/MASQ1337.jpg',
        'MASQ1280': '/products/MASQ1337.jpg',
        'MASQ1300': '/products/MASQ1337.jpg',
        'MASQ1320': '/products/MASQ1337.jpg',
        'MASQ1330': '/products/MASQ1337.jpg',
        'MASQ1336': '/products/MASQ1337.jpg',
        'MASQ1337': '/products/MASQ1337.jpg',
        'MASQ1340': '/products/MASQ1337.jpg',
        'MASQ1350': '/products/MASQ1337.jpg',
        'MASQ1353': '/products/MASQ1337.jpg',
      };

      for (const [sku, imageUrl] of Object.entries(MASTER_AIRSCREW_IMAGE_MAPPING)) {
        await prisma.product.updateMany({
          where: { sku },
          data: { imageUrl }
        });
      }
      console.log(`🖼️ Imagen compartida /products/MASQ1337.jpg asegurada en los ${Object.keys(MASTER_AIRSCREW_IMAGE_MAPPING).length} SKU de hélices Master Airscrew en MariaDB.`);

      // 6. Actualización conservadora de imageUrl para productos registrados vía prisma.product.update
      const TARGET_PRODUCT_IMAGE_MAPPING: Record<string, string> = {
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

      for (const [sku, imageUrl] of Object.entries(TARGET_PRODUCT_IMAGE_MAPPING)) {
        try {
          await prisma.product.update({
            where: { sku },
            data: { imageUrl }
          });
          console.log(`📸 [Prisma Update] Imagen asignada a SKU ${sku} -> ${imageUrl}`);
        } catch (updateErr: any) {
          console.warn(`⚠️ [Prisma Update] SKU ${sku}:`, updateErr.message);
        }
      }
      console.log(`🖼️ Rutas de imagen asignadas mediante prisma.product.update para ${Object.keys(TARGET_PRODUCT_IMAGE_MAPPING).length} productos oficiales (precios y stock intactos).`);

      // 7. Mapeo específico de 21 hélices (Master Airscrew, APC y Tripala) mediante prisma.product.update
      const PROPELLER_IMAGE_MAPPINGS: Record<string, string> = {
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

      for (const [sku, imageUrl] of Object.entries(PROPELLER_IMAGE_MAPPINGS)) {
        try {
          await prisma.product.update({
            where: { sku },
            data: { imageUrl }
          });
          console.log(`📸 [Prisma Update] Imagen asignada a SKU ${sku} -> ${imageUrl}`);
        } catch (updateErr: any) {
          console.warn(`⚠️ [Prisma Update] SKU ${sku}:`, updateErr.message);
        }
      }
      console.log(`✈️ ${Object.keys(PROPELLER_IMAGE_MAPPINGS).length} hélices actualizadas con prisma.product.update (precios y stock intactos).`);

      // 8. Mapeo de 11 productos (Tripalas, Balanceador, Eléctricas y Palas Plegables) mediante prisma.product.update
      const BATCH_3_IMAGE_MAPPINGS: Record<string, string> = {
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

      for (const [sku, imageUrl] of Object.entries(BATCH_3_IMAGE_MAPPINGS)) {
        try {
          await prisma.product.update({
            where: { sku },
            data: { imageUrl }
          });
          console.log(`📸 [Prisma Update] Imagen asignada a SKU ${sku} -> ${imageUrl}`);
        } catch (updateErr: any) {
          console.warn(`⚠️ [Prisma Update] SKU ${sku}:`, updateErr.message);
        }
      }
      console.log(`🛠️ ${Object.keys(BATCH_3_IMAGE_MAPPINGS).length} productos adicionales actualizados con prisma.product.update (precios y stock intactos).`);

      // 9. Mapeo de 21 productos (Categorías SPINNERS y CONSTRUCCION) mediante prisma.product.update
      const SPINNERS_CONSTRUCCION_IMAGE_MAPPINGS: Record<string, string> = {
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

      for (const [sku, imageUrl] of Object.entries(SPINNERS_CONSTRUCCION_IMAGE_MAPPINGS)) {
        try {
          await prisma.product.update({
            where: { sku },
            data: { imageUrl }
          });
          console.log(`📸 [Prisma Update] Imagen asignada a SKU ${sku} -> ${imageUrl}`);
        } catch (updateErr: any) {
          console.warn(`⚠️ [Prisma Update] SKU ${sku}:`, updateErr.message);
        }
      }
      console.log(`🎯 ${Object.keys(SPINNERS_CONSTRUCCION_IMAGE_MAPPINGS).length} productos de Spinners y Construcción actualizados con prisma.product.update (precios y stock intactos).`);

      // 10. Mapeo de 21 productos (Categorías CONSTRUCCION, RUEDAS y MONOKOTE) mediante prisma.product.update
      const BATCH_5_CONSTRUCCION_RUEDAS_MONOKOTE_IMAGE_MAPPINGS: Record<string, string> = {
        // Categoría CONSTRUCCION:
        'DUBQ9109': '/products/DUBQ9109.jpg',
        'DUBQ9600': '/products/DUBQ9600.jpg',
        'DUBQ9601': '/products/DUBQ9601.jpg',
        'DUBQ9850': '/products/DUBQ9850.jpg',
        'DUBQ9108': '/products/DUBQ9108.jpg',
        'DUBQ9306': '/products/DUBQ9306.jpg',

        // Categoría RUEDAS:
        'AIB15115': '/products/AIB15115.jpg',
        'DUBQ0865': '/products/DUBQ0865.jpg',
        'DUBQ0870': '/products/DUBQ0870.jpg',
        'DUBQ0890': '/products/DUBQ0890.jpg',
        'SULQ2751': '/products/SULQ2751.jpg',
        'SULQ2752': '/products/SULQ2751.jpg',

        // Categoría MONOKOTE:
        'TOPQ0204': '/products/TOPQ0204.jpg',
        'TOPQ0207': '/products/TOPQ0207.jpg',
        'TOPQ0209': '/products/TOPQ0209_LARGE_1.jpg',
        'TOPQ0210': '/products/TOPQ0210.jpg',
        'TOPQ0211': '/products/TOPQ0211.jpg',
        'TOPQ0213': '/products/TOPQ0213.jpg',
        'TOPQ0302': '/products/TOPQ0302.jpg',
        'TOPQ0303': '/products/TOPQ0303.jpg',
        'TOPQ0510': '/products/TOPQ0510.jpg',
      };

      for (const [sku, imageUrl] of Object.entries(BATCH_5_CONSTRUCCION_RUEDAS_MONOKOTE_IMAGE_MAPPINGS)) {
        try {
          await prisma.product.update({
            where: { sku },
            data: { imageUrl }
          });
          console.log(`📸 [Prisma Update] Imagen asignada a SKU ${sku} -> ${imageUrl}`);
        } catch (updateErr: any) {
          console.warn(`⚠️ [Prisma Update] SKU ${sku}:`, updateErr.message);
        }
      }
      console.log(`🎯 ${Object.keys(BATCH_5_CONSTRUCCION_RUEDAS_MONOKOTE_IMAGE_MAPPINGS).length} productos de Construcción, Ruedas y Monokote actualizados con prisma.product.update (precios y stock intactos).`);
    } catch (err: any) {
      console.warn("⚠️ Nota sobre Prisma/MySQL (Conexión omitida en este entorno local):", err.message);
    } finally {
      await prisma.$disconnect();
    }
  }

  console.log("🎉 Seed finalizado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
