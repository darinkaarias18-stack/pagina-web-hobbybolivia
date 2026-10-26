import { PrismaClient } from '@prisma/client';
import {
  initialSiteConfig,
  initialCategories,
  initialOccasions,
  initialBanners,
  initialItems
} from '../src/lib/initial-data';

const prisma = new PrismaClient();

export async function main() {
  console.log("🌸 Iniciando Seed de datos para Hobby Bolivia...");

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

  // 3. Categories
  const categoryMap = new Map<string, number>();
  for (const cat of initialCategories) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    });
    categoryMap.set(cat.slug, upserted.id);
  }
  console.log(`${initialCategories.length} categorías registradas.`);

  // 4. Occasions
  const occasionMap = new Map<string, number>();
  for (const occ of initialOccasions) {
    const upserted = await prisma.occasion.upsert({
      where: { slug: occ.slug },
      update: occ,
      create: occ
    });
    occasionMap.set(occ.slug, upserted.id);
  }
  console.log(`${initialOccasions.length} ocasiones registradas.`);

  // 5. Banners
  for (const banner of initialBanners) {
    const existing = await prisma.banner.findFirst({
      where: { title: banner.title }
    });
    if (!existing) {
      await prisma.banner.create({ data: banner });
    }
  }
  console.log("Banners promocionales registrados.");

  // 6. Products & Services
  for (const item of initialItems) {
    const categoryId = item.category_id || item.categoryId || 1;
    const { categorySlug, occasionSlugs, category, ...itemData } = item as any;

    const upsertedItem = await prisma.catalogItem.upsert({
      where: { sku: item.sku },
      update: {
        ...itemData,
        categoryId
      },
      create: {
        ...itemData,
        categoryId
      }
    });


    // Relate occasions
    if (occasionSlugs && Array.isArray(occasionSlugs)) {
      for (const occSlug of occasionSlugs) {
        const occasionId = occasionMap.get(occSlug);
        if (occasionId) {
          await prisma.catalogItemOccasion.upsert({
            where: {
              itemId_occasionId: {
                itemId: upsertedItem.id,
                occasionId
              }
            },
            update: {},
            create: {
              itemId: upsertedItem.id,
              occasionId
            }
          });
        }
      }
    }
  }
  console.log(`✈️ ${initialItems.length} componentes y repuestos sembrados en MySQL con éxito.`);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
