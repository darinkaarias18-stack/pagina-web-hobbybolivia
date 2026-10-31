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
              price: priceBob,
              priceUsd: prod.priceUsd,
              stock: prod.stock,
              badge: prod.badge,
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
      console.log(`✈️ ${OFFICIAL_PRODUCTS.length} repuestos oficiales sincronizados con prisma.product.upsert en MariaDB.`);
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
