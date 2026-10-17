import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import {
  initialSiteConfig,
  initialCategories,
  initialOccasions,
  initialBanners,
  initialItems
} from './initial-data';
import type {
  SiteConfig,
  Category,
  Occasion,
  CatalogItem,
  Banner,
  QuoteOrder,
  ClaimRecord,
  OrderStatus,
  ClaimStatus,
  User,
  UserRole
} from './types';

// Global Prisma instance for Next.js
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

export const DEFAULT_SUPERADMIN: User = {
  id: 1,
  name: "Super Administrador",
  username: "superadmin",
  email: "superadmin@hobbybolivia.com",
  password: "superhobby2026*",
  role: "SUPERADMIN",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z"
};

interface LocalDatabase {
  siteConfig: SiteConfig;
  categories: Category[];
  occasions: Occasion[];
  banners: Banner[];
  items: CatalogItem[];
  quotes: QuoteOrder[];
  claims: ClaimRecord[];
  users: User[];
}

function initDefaultDatabase(): LocalDatabase {
  const categories: Category[] = initialCategories.map((c, idx) => ({
    id: idx + 1,
    name: c.name,
    slug: c.slug,
    order: c.order,
    imageUrl: c.imageUrl,
    description: c.description,
    isActive: true
  }));

  const occasions: Occasion[] = initialOccasions.map((o, idx) => ({
    id: idx + 1,
    name: o.name,
    slug: o.slug,
    iconName: o.iconName,
    isActive: true
  }));

  const banners: Banner[] = initialBanners.map((b, idx) => ({
    id: idx + 1,
    title: b.title,
    subtitle: b.subtitle,
    imageUrl: b.imageUrl,
    buttonText: b.buttonText,
    buttonUrl: b.buttonUrl,
    placement: b.placement,
    isActive: b.isActive
  }));

  const items: CatalogItem[] = initialItems.map((item, idx) => {
    const cat = categories.find((c) => c.slug === item.categorySlug);
    return {
      id: idx + 1,
      sku: item.sku,
      title: item.title,
      slug: item.slug,
      brand: item.brand || null,
      description: item.description,
      itemType: item.itemType,
      price: item.price,
      compareAtPrice: (item as any).compareAtPrice ?? null,
      discountPercent: (item as any).discountPercent ?? null,
      availability: item.availability,
      stockQuantity: item.stockQuantity,
      actionType: item.actionType,
      flowerTypes: (item as any).flowerTypes ?? [],
      specifications: item.specifications,
      variants: (item as any).variants ?? [],
      images: item.images,
      categoryId: cat ? cat.id : 1,
      occasionSlugs: item.occasionSlugs
    };
  });

  return {
    siteConfig: {
      id: 1,
      ...initialSiteConfig
    },
    categories,
    occasions,
    banners,
    items,
    quotes: [
      {
        id: 1,
        orderCode: "HB-20261016-001",
        customerName: "Carlos Méndez",
        customerPhone: "+59177654321",
        recipientName: "Valeria Suárez",
        deliveryDate: "2026-10-17",
        deliveryTimeSlot: "Mañana (09:00 - 13:00)",
        deliveryAddress: "Av. San Martín #450, Equipetrol, Santa Cruz",
        cardMessage: "¡Feliz Aniversario mi amor! Gracias por cada sonrisa y por iluminar mis días. Te amo.",
        items: [
          {
            item: items[0],
            quantity: 1,
            selectedOptions: { "Color del Papel": "Vino Tinto y Dorado" }
          }
        ],
        total: 240.00,
        status: "IN_PREPARATION" as OrderStatus,
        createdAt: new Date().toISOString()
      }
    ],
    claims: [],
    users: [DEFAULT_SUPERADMIN]
  };
}

function getLocalStore(): LocalDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = initDefaultDatabase();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed: LocalDatabase = JSON.parse(raw);

    // Ensure users array and default superadmin exist
    if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = [DEFAULT_SUPERADMIN];
      saveLocalStore(parsed);
    } else {
      const superIndex = parsed.users.findIndex((u) => u.username === 'superadmin');
      if (superIndex === -1) {
        parsed.users.unshift(DEFAULT_SUPERADMIN);
        saveLocalStore(parsed);
      } else {
        // Guarantee credentials for superadmin match required credentials
        parsed.users[superIndex] = {
          ...parsed.users[superIndex],
          username: 'superadmin',
          password: 'superhobby2026*',
          role: 'SUPERADMIN',
          isActive: true
        };
      }
    }

    return parsed;
  } catch (err) {
    console.warn("Using in-memory database fallback:", err);
    return initDefaultDatabase();
  }
}

function saveLocalStore(data: LocalDatabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to write local database file:", err);
  }
}

// Check if Prisma MySQL is currently reachable
let mysqlReachable: boolean | null = null;
async function isMySQLConnected(): Promise<boolean> {
  if (mysqlReachable !== null) return mysqlReachable;
  try {
    // 1-second timeout probe
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
    ]);
    mysqlReachable = true;
    return true;
  } catch {
    mysqlReachable = false;
    return false;
  }
}

/* ========================================================
   1. SITE CONFIGURATION
======================================================== */
export async function getSiteConfig(): Promise<SiteConfig> {
  if (await isMySQLConnected()) {
    try {
      const cfg = await prisma.siteConfig.findFirst();
      if (cfg) return cfg as unknown as SiteConfig;
    } catch {
      // fallback
    }
  }
  const store = getLocalStore();
  return store.siteConfig;
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
  const store = getLocalStore();
  store.siteConfig = { ...store.siteConfig, ...data, updatedAt: new Date().toISOString() };
  saveLocalStore(store);

  if (await isMySQLConnected()) {
    try {
      await prisma.siteConfig.upsert({
        where: { id: 1 },
        update: data,
        create: { ...initialSiteConfig, ...data }
      });
    } catch (e) {
      console.warn("Failed to update siteConfig in MySQL:", e);
    }
  }

  return store.siteConfig;
}

/* ========================================================
   2. CATEGORIES
======================================================== */
export async function getCategories(): Promise<Category[]> {
  const store = getLocalStore();
  const items = store.items;

  // Add item count to each category
  const categoriesWithCount = store.categories.map((cat) => {
    const count = items.filter((i) => i.categoryId === cat.id && i.availability !== 'OUT_OF_STOCK').length;
    return {
      ...cat,
      itemCount: count
    };
  });

  if (await isMySQLConnected()) {
    try {
      const cats = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: { _count: { select: { items: true } } }
      });
      if (cats.length > 0) {
        return cats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          order: c.order,
          imageUrl: c.imageUrl,
          description: c.description,
          isActive: c.isActive,
          itemCount: c._count.items
        }));
      }
    } catch {
      // fallback
    }
  }

  return categoriesWithCount;
}

export async function saveCategory(categoryData: Partial<Category>): Promise<Category> {
  const store = getLocalStore();
  let saved: Category;

  if (categoryData.id) {
    const idx = store.categories.findIndex((c) => c.id === categoryData.id);
    if (idx >= 0) {
      store.categories[idx] = { ...store.categories[idx], ...categoryData };
      saved = store.categories[idx];
    } else {
      saved = {
        id: categoryData.id,
        name: categoryData.name || '',
        slug: categoryData.slug || '',
        order: categoryData.order || 0,
        imageUrl: categoryData.imageUrl || null,
        description: categoryData.description || null,
        isActive: categoryData.isActive ?? true
      };
      store.categories.push(saved);
    }
  } else {
    const newId = store.categories.length > 0 ? Math.max(...store.categories.map((c) => c.id)) + 1 : 1;
    saved = {
      id: newId,
      name: categoryData.name || '',
      slug: categoryData.slug || '',
      order: categoryData.order || store.categories.length + 1,
      imageUrl: categoryData.imageUrl || null,
      description: categoryData.description || null,
      isActive: categoryData.isActive ?? true
    };
    store.categories.push(saved);
  }

  saveLocalStore(store);

  if (await isMySQLConnected()) {
    try {
      await prisma.category.upsert({
        where: { slug: saved.slug },
        update: {
          name: saved.name,
          order: saved.order,
          imageUrl: saved.imageUrl,
          description: saved.description,
          isActive: saved.isActive
        },
        create: {
          name: saved.name,
          slug: saved.slug,
          order: saved.order,
          imageUrl: saved.imageUrl,
          description: saved.description,
          isActive: saved.isActive
        }
      });
    } catch (e) {
      console.warn("Failed category sync to MySQL:", e);
    }
  }

  return saved;
}

export async function deleteCategory(id: number): Promise<boolean> {
  const store = getLocalStore();
  const cat = store.categories.find((c) => c.id === id);
  store.categories = store.categories.filter((c) => c.id !== id);
  saveLocalStore(store);

  if (cat && (await isMySQLConnected())) {
    try {
      await prisma.category.delete({ where: { id } });
    } catch {
      // ignore
    }
  }

  return true;
}

/* ========================================================
   3. OCCASIONS
======================================================== */
export async function getOccasions(): Promise<Occasion[]> {
  const store = getLocalStore();
  const items = store.items;

  const occasionsWithCount = store.occasions.map((occ) => {
    const count = items.filter((i) => i.occasionSlugs?.includes(occ.slug)).length;
    return {
      ...occ,
      itemCount: count
    };
  });

  if (await isMySQLConnected()) {
    try {
      const occs = await prisma.occasion.findMany({
        where: { isActive: true },
        include: { _count: { select: { items: true } } }
      });
      if (occs.length > 0) {
        return occs.map((o) => ({
          id: o.id,
          name: o.name,
          slug: o.slug,
          iconName: o.iconName,
          isActive: o.isActive,
          itemCount: o._count.items
        }));
      }
    } catch {
      // fallback
    }
  }

  return occasionsWithCount;
}

export async function saveOccasion(data: Partial<Occasion>): Promise<Occasion> {
  const store = getLocalStore();
  let saved: Occasion;

  if (data.id) {
    const idx = store.occasions.findIndex((o) => o.id === data.id);
    if (idx >= 0) {
      store.occasions[idx] = { ...store.occasions[idx], ...data };
      saved = store.occasions[idx];
    } else {
      saved = {
        id: data.id,
        name: data.name || '',
        slug: data.slug || '',
        iconName: data.iconName || 'Flower',
        isActive: data.isActive ?? true
      };
      store.occasions.push(saved);
    }
  } else {
    const newId = store.occasions.length > 0 ? Math.max(...store.occasions.map((o) => o.id)) + 1 : 1;
    saved = {
      id: newId,
      name: data.name || '',
      slug: data.slug || '',
      iconName: data.iconName || 'Flower',
      isActive: data.isActive ?? true
    };
    store.occasions.push(saved);
  }

  saveLocalStore(store);

  if (await isMySQLConnected()) {
    try {
      await prisma.occasion.upsert({
        where: { slug: saved.slug },
        update: { name: saved.name, iconName: saved.iconName, isActive: saved.isActive },
        create: { name: saved.name, slug: saved.slug, iconName: saved.iconName, isActive: saved.isActive }
      });
    } catch (e) {
      console.warn("Failed occasion sync to MySQL:", e);
    }
  }

  return saved;
}

export async function deleteOccasion(id: number): Promise<boolean> {
  const store = getLocalStore();
  store.occasions = store.occasions.filter((o) => o.id !== id);
  saveLocalStore(store);

  if (await isMySQLConnected()) {
    try {
      await prisma.occasion.delete({ where: { id } });
    } catch {
      // ignore
    }
  }
  return true;
}

/* ========================================================
   4. BANNERS
======================================================== */
export async function getBanners(): Promise<Banner[]> {
  const store = getLocalStore();
  if (await isMySQLConnected()) {
    try {
      const banners = await prisma.banner.findMany({ where: { isActive: true } });
      if (banners.length > 0) return banners as unknown as Banner[];
    } catch {
      // fallback
    }
  }
  return store.banners;
}

export async function saveBanner(data: Partial<Banner>): Promise<Banner> {
  const store = getLocalStore();
  let saved: Banner;

  if (data.id) {
    const idx = store.banners.findIndex((b) => b.id === data.id);
    if (idx >= 0) {
      store.banners[idx] = { ...store.banners[idx], ...data };
      saved = store.banners[idx];
    } else {
      saved = {
        id: data.id,
        title: data.title || '',
        subtitle: data.subtitle,
        imageUrl: data.imageUrl || '',
        buttonText: data.buttonText,
        buttonUrl: data.buttonUrl,
        placement: data.placement || 'HERO',
        isActive: data.isActive ?? true
      };
      store.banners.push(saved);
    }
  } else {
    const newId = store.banners.length > 0 ? Math.max(...store.banners.map((b) => b.id)) + 1 : 1;
    saved = {
      id: newId,
      title: data.title || '',
      subtitle: data.subtitle,
      imageUrl: data.imageUrl || '',
      buttonText: data.buttonText,
      buttonUrl: data.buttonUrl,
      placement: data.placement || 'HERO',
      isActive: data.isActive ?? true
    };
    store.banners.push(saved);
  }

  saveLocalStore(store);
  return saved;
}

export async function deleteBanner(id: number): Promise<boolean> {
  const store = getLocalStore();
  store.banners = store.banners.filter((b) => b.id !== id);
  saveLocalStore(store);
  return true;
}

/* ========================================================
   5. CATALOG ITEMS (PRODUCTS & SERVICES)
======================================================== */
export interface CatalogItemFilters {
  category?: string;
  brand?: string;
  occasion?: string;
  flowerType?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  q?: string;
  sort?: string;
}

export async function getCatalogItems(filters: CatalogItemFilters = {}): Promise<CatalogItem[]> {
  const store = getLocalStore();
  let items = [...store.items];

  // Category filter (slug or id)
  if (filters.category && filters.category !== 'all') {
    const cat = store.categories.find(
      (c) => c.slug === filters.category || c.id.toString() === filters.category
    );
    if (cat) {
      items = items.filter((i) => i.categoryId === cat.id);
    }
  }

  // Brand filter
  if (filters.brand && filters.brand !== 'all') {
    const brandLower = filters.brand.toLowerCase().trim();
    items = items.filter((i) => i.brand?.toLowerCase().trim() === brandLower);
  }

  // Occasion filter (slug)
  if (filters.occasion && filters.occasion !== 'all') {
    items = items.filter((i) => i.occasionSlugs?.includes(filters.occasion!));
  }

  // Flower Type filter
  if (filters.flowerType) {
    const ft = filters.flowerType.toLowerCase();
    items = items.filter((i) =>
      i.flowerTypes?.some((f) => f.toLowerCase().includes(ft))
    );
  }

  // Price range
  if (typeof filters.minPrice === 'number' && !isNaN(filters.minPrice)) {
    items = items.filter((i) => i.price >= filters.minPrice!);
  }
  if (typeof filters.maxPrice === 'number' && !isNaN(filters.maxPrice)) {
    items = items.filter((i) => i.price <= filters.maxPrice!);
  }

  // Availability
  if (filters.availability && filters.availability !== 'all') {
    items = items.filter((i) => i.availability === filters.availability);
  }

  // Search Query `q`
  if (filters.q && filters.q.trim().length > 0) {
    const query = filters.q.toLowerCase().trim();
    items = items.filter((i) => {
      const matchTitle = i.title.toLowerCase().includes(query);
      const matchSku = i.sku.toLowerCase().includes(query);
      const matchDesc = i.description.toLowerCase().includes(query);
      const matchFlowers = i.flowerTypes?.some((f) => f.toLowerCase().includes(query));
      return matchTitle || matchSku || matchDesc || matchFlowers;
    });
  }

  // Sorting
  if (filters.sort === 'price_asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (filters.sort === 'price_desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (filters.sort === 'newest') {
    items.sort((a, b) => b.id - a.id);
  } else if (filters.sort === 'featured') {
    // Featured prioritizes items with discount or highest stock
    items.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
  }

  // Hydrate category details
  return items.map((i) => {
    const cat = store.categories.find((c) => c.id === i.categoryId);
    return {
      ...i,
      category: cat
    };
  });
}

export async function getCatalogItemById(id: number): Promise<CatalogItem | null> {
  const store = getLocalStore();
  const item = store.items.find((i) => i.id === id);
  if (!item) return null;
  const cat = store.categories.find((c) => c.id === item.categoryId);
  return { ...item, category: cat };
}

export async function getCatalogItemBySlug(slug: string): Promise<CatalogItem | null> {
  const store = getLocalStore();
  const item = store.items.find((i) => i.slug === slug);
  if (!item) return null;
  const cat = store.categories.find((c) => c.id === item.categoryId);
  return { ...item, category: cat };
}

export async function saveCatalogItem(data: Partial<CatalogItem>): Promise<CatalogItem> {
  const store = getLocalStore();
  let saved: CatalogItem;

  if (data.id) {
    const idx = store.items.findIndex((i) => i.id === data.id);
    if (idx >= 0) {
      store.items[idx] = {
        ...store.items[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      saved = store.items[idx];
    } else {
      saved = {
        id: data.id,
        sku: data.sku || `HB-NEW-${Date.now().toString().slice(-4)}`,
        title: data.title || '',
        slug: data.slug || `item-${Date.now()}`,
        brand: data.brand || null,
        description: data.description || '',
        itemType: data.itemType || 'PRODUCT',
        price: Number(data.price) || 0,
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
        discountPercent: data.discountPercent ? Number(data.discountPercent) : null,
        availability: data.availability || 'IN_STOCK',
        stockQuantity: Number(data.stockQuantity) || 10,
        actionType: data.actionType || 'ADD_TO_CART',
        flowerTypes: data.flowerTypes || [],
        specifications: data.specifications || {},
        variants: data.variants || [],
        images: data.images || ['https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp'],
        categoryId: data.categoryId || 1,
        occasionSlugs: data.occasionSlugs || []
      };
      store.items.push(saved);
    }
  } else {
    const newId = store.items.length > 0 ? Math.max(...store.items.map((i) => i.id)) + 1 : 1;
    saved = {
      id: newId,
      sku: data.sku || `HB-NEW-${Date.now().toString().slice(-4)}`,
      title: data.title || '',
      slug: data.slug || `item-${Date.now()}`,
      brand: data.brand || null,
      description: data.description || '',
      itemType: data.itemType || 'PRODUCT',
      price: Number(data.price) || 0,
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
      discountPercent: data.discountPercent ? Number(data.discountPercent) : null,
      availability: data.availability || 'IN_STOCK',
      stockQuantity: Number(data.stockQuantity) || 10,
      actionType: data.actionType || 'ADD_TO_CART',
      flowerTypes: data.flowerTypes || [],
      specifications: data.specifications || {},
      variants: data.variants || [],
      images: data.images && data.images.length > 0 ? data.images : ['https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp'],
      categoryId: data.categoryId || 1,
      occasionSlugs: data.occasionSlugs || []
    };
    store.items.push(saved);
  }

  saveLocalStore(store);

  // Sync to MySQL if available
  if (await isMySQLConnected()) {
    try {
      await (prisma.catalogItem.upsert as any)({
        where: { sku: saved.sku },
        update: {
          title: saved.title,
          slug: saved.slug,
          brand: saved.brand || null,
          description: saved.description,
          itemType: saved.itemType,
          price: saved.price,
          compareAtPrice: saved.compareAtPrice,
          discountPercent: saved.discountPercent,
          availability: saved.availability,
          stockQuantity: saved.stockQuantity,
          actionType: saved.actionType,
          flowerTypes: saved.flowerTypes,
          specifications: saved.specifications,
          variants: saved.variants,
          images: saved.images,
          categoryId: saved.categoryId
        },
        create: {
          sku: saved.sku,
          title: saved.title,
          slug: saved.slug,
          brand: saved.brand || null,
          description: saved.description,
          itemType: saved.itemType,
          price: saved.price,
          compareAtPrice: saved.compareAtPrice,
          discountPercent: saved.discountPercent,
          availability: saved.availability,
          stockQuantity: saved.stockQuantity,
          actionType: saved.actionType,
          flowerTypes: saved.flowerTypes,
          specifications: saved.specifications,
          variants: saved.variants,
          images: saved.images,
          categoryId: saved.categoryId
        }
      });
    } catch (e) {
      console.warn("Failed item sync to MySQL:", e);
    }
  }

  const cat = store.categories.find((c) => c.id === saved.categoryId);
  return { ...saved, category: cat };
}

export async function deleteCatalogItem(id: number): Promise<boolean> {
  const store = getLocalStore();
  const item = store.items.find((i) => i.id === id);
  store.items = store.items.filter((i) => i.id !== id);
  saveLocalStore(store);

  if (item && (await isMySQLConnected())) {
    try {
      await prisma.catalogItem.delete({ where: { id } });
    } catch {
      // ignore
    }
  }
  return true;
}

/* ========================================================
   6. QUOTE ORDERS & WHATSAPP ORDERS
======================================================== */
export async function getQuoteOrders(): Promise<QuoteOrder[]> {
  const store = getLocalStore();
  if (await isMySQLConnected()) {
    try {
      const orders = await prisma.quoteOrder.findMany({
        orderBy: { createdAt: 'desc' }
      });
      if (orders.length > 0) return orders as unknown as QuoteOrder[];
    } catch {
      // fallback
    }
  }
  return store.quotes.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export async function createQuoteOrder(data: Omit<QuoteOrder, 'id' | 'orderCode' | 'createdAt'>): Promise<{ order: QuoteOrder; whatsappUrl: string }> {
  const store = getLocalStore();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(100 + Math.random() * 900);
  const orderCode = `HB-${dateStr}-${rand}`;

  const newOrder: QuoteOrder = {
    id: store.quotes.length > 0 ? Math.max(...store.quotes.map((q) => q.id || 0)) + 1 : 1,
    orderCode,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    recipientName: data.recipientName,
    deliveryDate: data.deliveryDate,
    deliveryTimeSlot: data.deliveryTimeSlot,
    deliveryAddress: data.deliveryAddress,
    cardMessage: data.cardMessage || null,
    items: data.items,
    total: data.total,
    status: 'PENDING',
    createdAt: now.toISOString()
  };

  store.quotes.unshift(newOrder);
  saveLocalStore(store);

  // Sync with MySQL
  if (await isMySQLConnected()) {
    try {
      await prisma.quoteOrder.create({
        data: {
          orderCode: newOrder.orderCode,
          customerName: newOrder.customerName,
          customerPhone: newOrder.customerPhone,
          recipientName: newOrder.recipientName,
          deliveryDate: newOrder.deliveryDate,
          deliveryTimeSlot: newOrder.deliveryTimeSlot,
          deliveryAddress: newOrder.deliveryAddress,
          cardMessage: newOrder.cardMessage,
          items: newOrder.items as unknown as object,
          total: newOrder.total,
          status: newOrder.status
        }
      });
    } catch (e) {
      console.warn("Failed quote order sync to MySQL:", e);
    }
  }

  // Build structured WhatsApp message
  const itemsText = newOrder.items
    .map((ci) => {
      const opts = ci.selectedOptions ? ` (${Object.entries(ci.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')})` : '';
      return `• ${ci.quantity}x ${ci.item.title}${opts} - Bs. ${(ci.item.price * ci.quantity).toFixed(2)}`;
    })
    .join('\n');

  const waNumber = store.siteConfig.whatsappNumber.replace(/[^0-9]/g, '') || '59178000000';
  const rawMsg = `🌸 *NUEVO PEDIDO EN HOBBY BOLIVIA* 🌸
*Código:* ${orderCode}

👤 *Cliente:* ${newOrder.customerName} (${newOrder.customerPhone})
🎁 *Para:* ${newOrder.recipientName}
📅 *Fecha de Entrega:* ${newOrder.deliveryDate}
⏰ *Horario:* ${newOrder.deliveryTimeSlot}
📍 *Dirección de Entrega:* ${newOrder.deliveryAddress}

💌 *Dedicatoria en la Tarjeta:*
"${newOrder.cardMessage || 'Sin dedicatoria especificada'}"

💐 *Detalle de los Arreglos:*
${itemsText}

💰 *TOTAL A PAGAR:* Bs. ${Number(newOrder.total).toFixed(2)}

_Hola Hobby Bolivia, acabo de generar mi pedido desde la web hobbybolivia.com. Por favor confirmen los datos para el pago y despacho._`;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(rawMsg)}`;

  return { order: newOrder, whatsappUrl };
}

export async function updateQuoteOrderStatus(orderCode: string, status: OrderStatus): Promise<QuoteOrder | null> {
  const store = getLocalStore();
  const order = store.quotes.find((q) => q.orderCode === orderCode);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  saveLocalStore(store);

  if (await isMySQLConnected()) {
    try {
      await prisma.quoteOrder.update({
        where: { orderCode },
        data: { status }
      });
    } catch {
      // ignore
    }
  }

  return order;
}

/* ========================================================
   7. LIBRO DE RECLAMACIONES (CLAIM RECORDS)
======================================================== */
export async function getClaimRecords(): Promise<ClaimRecord[]> {
  const store = getLocalStore();
  if (await isMySQLConnected()) {
    try {
      const claims = await prisma.claimRecord.findMany({ orderBy: { createdAt: 'desc' } });
      if (claims.length > 0) return claims as unknown as ClaimRecord[];
    } catch {
      // fallback
    }
  }
  return store.claims.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

export async function getClaimRecordByCode(trackingCode: string): Promise<ClaimRecord | null> {
  const store = getLocalStore();
  const claim = store.claims.find((c) => c.trackingCode === trackingCode);
  return claim || null;
}

export async function createClaimRecord(data: Omit<ClaimRecord, 'id' | 'trackingCode' | 'status' | 'createdAt'>): Promise<ClaimRecord> {
  const store = getLocalStore();
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const prefix = data.type === 'QUEJA' ? 'QUE' : 'REC';
  const trackingCode = `${prefix}-${year}-${rand}`;

  const newClaim: ClaimRecord = {
    id: store.claims.length > 0 ? Math.max(...store.claims.map((c) => c.id || 0)) + 1 : 1,
    trackingCode,
    fullName: data.fullName,
    documentId: data.documentId,
    phone: data.phone,
    email: data.email,
    contractedItem: data.contractedItem,
    orderCode: data.orderCode || null,
    amount: data.amount ? Number(data.amount) : null,
    type: data.type,
    detail: data.detail,
    customerRequest: data.customerRequest,
    status: 'PENDIENTE',
    adminNotes: null,
    createdAt: new Date().toISOString()
  };

  store.claims.unshift(newClaim);
  saveLocalStore(store);

  if (await isMySQLConnected()) {
    try {
      await prisma.claimRecord.create({
        data: {
          trackingCode: newClaim.trackingCode,
          fullName: newClaim.fullName,
          documentId: newClaim.documentId,
          phone: newClaim.phone,
          email: newClaim.email,
          contractedItem: newClaim.contractedItem,
          orderCode: newClaim.orderCode,
          amount: newClaim.amount,
          type: newClaim.type,
          detail: newClaim.detail,
          customerRequest: newClaim.customerRequest,
          status: newClaim.status
        }
      });
    } catch (e) {
      console.warn("Failed claim record sync to MySQL:", e);
    }
  }

  return newClaim;
}

export async function updateClaimStatus(trackingCode: string, status: ClaimStatus, adminNotes?: string): Promise<ClaimRecord | null> {
  const store = getLocalStore();
  const claim = store.claims.find((c) => c.trackingCode === trackingCode);
  if (!claim) return null;

  claim.status = status;
  if (adminNotes !== undefined) claim.adminNotes = adminNotes;
  claim.updatedAt = new Date().toISOString();
  saveLocalStore(store);

  if (await isMySQLConnected()) {
    try {
      await prisma.claimRecord.update({
        where: { trackingCode },
        data: {
          status,
          adminNotes: claim.adminNotes
        }
      });
    } catch {
      // ignore
    }
  }

  return claim;
}

/* ========================================================
   8. USERS MANAGEMENT (SUPERADMIN & ADMIN)
======================================================== */
export async function getUsers(): Promise<User[]> {
  const store = getLocalStore();
  if (await isMySQLConnected()) {
    try {
      const dbUsers = await prisma.user.findMany({ orderBy: { id: 'asc' } });
      if (dbUsers.length > 0) {
        return dbUsers.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.email,
          password: u.passwordHash,
          role: (u.role as UserRole) || 'ADMIN',
          isActive: true,
          createdAt: u.createdAt
        }));
      }
    } catch {
      // fallback
    }
  }
  return store.users || [DEFAULT_SUPERADMIN];
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const clean = username.trim().toLowerCase();
  const users = await getUsers();
  const user = users.find((u) => u.username.toLowerCase() === clean);
  return user || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const users = await getUsers();
  const user = users.find((u) => u.id === id);
  return user || null;
}

export async function saveUser(data: Partial<User>): Promise<User> {
  const store = getLocalStore();
  let saved: User;

  if (data.id) {
    const idx = store.users.findIndex((u) => u.id === data.id);
    if (idx >= 0) {
      const isMaster = store.users[idx].username === 'superadmin';
      store.users[idx] = {
        ...store.users[idx],
        ...data,
        name: data.name !== undefined ? data.name : store.users[idx].name,
        password: data.password ? data.password : store.users[idx].password,
        role: isMaster ? 'SUPERADMIN' : (data.role || store.users[idx].role),
        isActive: isMaster ? true : (data.isActive ?? store.users[idx].isActive),
        updatedAt: new Date().toISOString()
      };
      saved = store.users[idx];
    } else {
      saved = {
        id: data.id,
        name: data.name || '',
        username: data.username || '',
        password: data.password || '',
        role: (data.role as UserRole) || 'ADMIN',
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString()
      };
      store.users.push(saved);
    }
  } else {
    const newId = store.users.length > 0 ? Math.max(...store.users.map((u) => u.id)) + 1 : 1;
    saved = {
      id: newId,
      name: data.name || '',
      username: data.username || '',
      password: data.password || '',
      role: (data.role as UserRole) || 'ADMIN',
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString()
    };
    store.users.push(saved);
  }

  saveLocalStore(store);

  // Sync to MySQL if available
  if (await isMySQLConnected()) {
    try {
      await prisma.user.upsert({
        where: { email: saved.username },
        update: {
          name: saved.name,
          passwordHash: saved.password || '',
          role: saved.role
        },
        create: {
          name: saved.name,
          email: saved.username,
          passwordHash: saved.password || '',
          role: saved.role
        }
      });
    } catch (e) {
      console.warn("Failed user sync to MySQL:", e);
    }
  }

  return saved;
}

export async function deleteUser(id: number): Promise<boolean> {
  const store = getLocalStore();
  const target = store.users.find((u) => u.id === id);
  if (!target || target.username === 'superadmin') {
    return false; // Cannot delete master superadmin
  }

  store.users = store.users.filter((u) => u.id !== id);
  saveLocalStore(store);

  if (await isMySQLConnected()) {
    try {
      await prisma.user.delete({ where: { email: target.username } });
    } catch {
      // ignore
    }
  }

  return true;
}

