import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import {
  initialSiteConfig,
  initialCategories,
  initialOccasions,
  initialBanners,
  initialProducts,
  initialPolicies
} from './initial-data';
import type {
  SiteConfig,
  Category,
  Occasion,
  Product,
  Banner,
  QuoteOrder,
  ClaimRecord,
  OrderStatus,
  User,
  Policy
} from './types';

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

// ============================================================================
// 1. POOL DE CONEXIÓN A MYSQL (HOSTING / CPANEL)
// ============================================================================

let mysqlPool: mysql.Pool | null = null;
let mysqlUnavailable = false;
let lastMysqlCheck = 0;

export function getMysqlConfig() {
  let host = process.env.MYSQL_HOST;
  let port = Number(process.env.MYSQL_PORT) || 3306;
  let user = process.env.MYSQL_USER;
  let password = process.env.MYSQL_PASSWORD || '';
  let database = process.env.MYSQL_DATABASE;
  const ssl = process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

  // Fallback a DATABASE_URL si las variables individuales no están definidas
  if ((!host || !user || !database) && process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL.replace(/^mysql:\/\//, 'http://'));
      host = host || parsed.hostname;
      if (parsed.port && !process.env.MYSQL_PORT) port = Number(parsed.port);
      user = user || decodeURIComponent(parsed.username);
      password = password || decodeURIComponent(parsed.password);
      database = database || parsed.pathname.replace(/^\//, '');
    } catch {
      // Ignorar error de parsing si el formato es inválido
    }
  }

  return { host, port, user, password, database, ssl };
}

export function markMysqlUnavailable(err?: any) {
  if (!mysqlUnavailable) {
    console.warn('[MySQL Fallback]: Conexión no disponible, usando almacenamiento local (.data/db.json).', err?.message || '');
  }
  mysqlUnavailable = true;
  lastMysqlCheck = Date.now();
}

export function isMysqlConfigured(): boolean {
  const cfg = getMysqlConfig();
  return Boolean(cfg.host && cfg.user && cfg.database);
}

export function getMysqlPool(): mysql.Pool | null {
  const cfg = getMysqlConfig();
  if (!cfg.host || !cfg.user || !cfg.database) return null;
  if (mysqlUnavailable && Date.now() - lastMysqlCheck < 60000) {
    return null;
  }

  if (!mysqlPool) {
    try {
      mysqlPool = mysql.createPool({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: cfg.password,
        database: cfg.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: cfg.ssl,
        connectTimeout: 3000
      });

      (mysqlPool as any).on('error', (err: any) => {
        markMysqlUnavailable(err);
      });
    } catch (err) {
      markMysqlUnavailable(err);
      mysqlPool = null;
    }
  }

  return mysqlPool;
}

export async function testMysqlConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  latencyMs?: number;
  host?: string;
  database?: string;
  tables?: string[];
  productCount?: number;
  categoryCount?: number;
  policyCount?: number;
  error?: string;
}> {
  const cfg = getMysqlConfig();
  if (!isMysqlConfigured()) {
    return {
      configured: false,
      connected: false,
      error: 'Variables MYSQL_HOST, MYSQL_USER o MYSQL_DATABASE (o DATABASE_URL) no configuradas en el entorno.'
    };
  }

  mysqlUnavailable = false;
  const pool = getMysqlPool();
  if (!pool) {
    return {
      configured: true,
      connected: false,
      error: 'No se pudo instanciar el pool de conexiones MySQL.'
    };
  }

  const startTime = Date.now();
  try {
    const conn = await pool.getConnection();
    try {
      await conn.query('SELECT 1');
      const latencyMs = Date.now() - startTime;

      // Obtener lista de tablas
      const [tableRows]: any = await conn.query('SHOW TABLES');
      const tables: string[] = tableRows.map((r: any) => Object.values(r)[0]);

      let productCount = 0;
      let categoryCount = 0;
      let policyCount = 0;

      if (tables.includes('products')) {
        const [prodRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM products');
        productCount = prodRows[0]?.cnt || 0;
      }

      if (tables.includes('categories')) {
        const [catRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM categories');
        categoryCount = catRows[0]?.cnt || 0;
      }

      if (tables.includes('policies')) {
        const [polRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM policies');
        policyCount = polRows[0]?.cnt || 0;
      }

      return {
        configured: true,
        connected: true,
        latencyMs,
        host: cfg.host,
        database: cfg.database,
        tables,
        productCount,
        categoryCount,
        policyCount
      };
    } finally {
      conn.release();
    }
  } catch (err) {
    return {
      configured: true,
      connected: false,
      host: cfg.host,
      database: cfg.database,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// ============================================================================
// 2. SINCRONIZACIÓN Y CREACIÓN DE TABLAS EN EL HOSTING
// ============================================================================

export async function syncMysqlTables(forceSeed = false): Promise<{
  success: boolean;
  message: string;
  tablesCreated?: string[];
  productsInserted?: number;
  categoriesInserted?: number;
  policiesInserted?: number;
  error?: string;
}> {
  const pool = getMysqlPool();
  if (!pool) {
    return {
      success: false,
      message: 'No hay conexión activa a MySQL. Verifica tus credenciales de hosting en .env.'
    };
  }

  const conn = await pool.getConnection();
  try {
    // 1. Crear tablas si no existen
    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NULL,
        image_url VARCHAR(500) NULL,
        display_order INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_categories_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        category_id INT UNSIGNED NOT NULL,
        scale VARCHAR(100) DEFAULT 'RC Estándar',
        material VARCHAR(100) DEFAULT 'Compuesto',
        specs_line VARCHAR(255) NOT NULL,
        compatible_models TEXT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        old_price DECIMAL(10,2) NULL,
        stock INT NOT NULL DEFAULT 0,
        badge VARCHAR(100) NULL,
        image_url VARCHAR(500) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        brand VARCHAR(100) DEFAULT 'Hobby Bolivia',
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_products_category (category_id),
        INDEX idx_products_sku (sku),
        INDEX idx_products_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS policies (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        content MEDIUMTEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS quote_orders (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_city VARCHAR(100) NOT NULL,
        customer_notes TEXT NULL,
        items_json LONGTEXT NOT NULL,
        total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Verificar datos existentes
    const [catCountRows]: any = await conn.query('SELECT COUNT(*) as cnt FROM categories');
    const existingCats = catCountRows[0]?.cnt || 0;

    let catInserted = 0;
    let prodInserted = 0;
    let polInserted = 0;

    if (existingCats === 0 || forceSeed) {
      if (forceSeed) {
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('TRUNCATE TABLE products');
        await conn.query('TRUNCATE TABLE categories');
        await conn.query('TRUNCATE TABLE policies');
        await conn.query('TRUNCATE TABLE admin_users');
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
      }

      // Insertar Categorías
      for (const cat of initialCategories) {
        await conn.query(
          `INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url)`,
          [
            cat.id,
            cat.name,
            cat.slug,
            cat.description || '',
            cat.image_url || cat.imageUrl || '',
            cat.order || cat.id,
            cat.isActive ? 1 : 0
          ]
        );
        catInserted++;
      }

      // Insertar Productos (18 productos con imágenes intactas)
      for (const prod of initialProducts) {
        await conn.query(
          `INSERT INTO products (
            id, sku, name, slug, category_id, scale, material, specs_line,
            compatible_models, price, old_price, stock, badge, image_url,
            is_active, brand, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name=VALUES(name), price=VALUES(price), stock=VALUES(stock),
            specs_line=VALUES(specs_line), image_url=VALUES(image_url)`,
          [
            prod.id,
            prod.sku,
            prod.name,
            prod.slug,
            prod.category_id || prod.categoryId || 1,
            prod.scale || 'RC Estándar',
            prod.material || 'Compuesto',
            prod.specs_line || '',
            prod.compatible_models || '',
            prod.price || 0,
            prod.old_price || null,
            prod.stock || 0,
            prod.badge || null,
            prod.image_url || (prod.images && prod.images[0]) || '',
            prod.is_active ? 1 : 0,
            prod.brand || 'Hobby Bolivia',
            prod.description || ''
          ]
        );
        prodInserted++;
      }

      // Insertar Políticas
      for (const pol of initialPolicies) {
        await conn.query(
          `INSERT INTO policies (id, slug, title, content)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content)`,
          [pol.id, pol.slug, pol.title, pol.content]
        );
        polInserted++;
      }

      // Insertar Administradores
      await conn.query(`
        INSERT INTO admin_users (id, username, email, password_hash, role)
        VALUES (1, 'superadmin', 'superadmin@hobbybolivia.com', 'superhobby2026*', 'SUPERADMIN'),
               (2, 'dariasdigital_hobbybolivia', 'admin@hobbybolivia.com', 'Imp6fSMr2%mj0w?v', 'SUPERADMIN')
        ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)
      `);
    }

    return {
      success: true,
      message: 'Tablas sincronizadas e inicializadas exitosamente en el MySQL de tu Hosting.',
      tablesCreated: ['categories', 'products', 'policies', 'admin_users', 'quote_orders'],
      productsInserted: prodInserted,
      categoriesInserted: catInserted,
      policiesInserted: polInserted
    };
  } catch (err) {
    return {
      success: false,
      message: 'Error al sincronizar tablas en MySQL.',
      error: err instanceof Error ? err.message : String(err)
    };
  } finally {
    conn.release();
  }
}

// ============================================================================
// 3. ALMACENAMIENTO LOCAL REACTIVO (FALLBACK SEGURO)
// ============================================================================

export interface LocalDatabase {
  siteConfig: SiteConfig;
  categories: Category[];
  occasions: Occasion[];
  banners: Banner[];
  items: Product[];
  policies: Policy[];
  quotes: QuoteOrder[];
  claims: ClaimRecord[];
  users: User[];
}

export function initDefaultDatabase(): LocalDatabase {
  return {
    siteConfig: { ...initialSiteConfig },
    categories: [...initialCategories],
    occasions: [...initialOccasions],
    banners: [...initialBanners],
    items: [...initialProducts],
    policies: [...initialPolicies],
    quotes: [
      {
        id: 1,
        orderCode: "HB-20261025-001",
        customerName: "Ing. Jorge Villagómez",
        customerPhone: "+59177012345",
        deliveryCity: "Santa Cruz",
        deliveryAddress: "Av. Bush #420, Condominio Los Sauces",
        customerNotes: "Por favor embalar en tubo rígido de PVC las varillas de control.",
        items: [
          { item: initialProducts[0], quantity: 2 },
          { item: initialProducts[3], quantity: 1 }
        ],
        total: 470.00,
        status: "IN_PREPARATION" as OrderStatus,
        createdAt: new Date().toISOString()
      }
    ],
    claims: [],
    users: [DEFAULT_SUPERADMIN]
  };
}

export function getLocalStore(): LocalDatabase {
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

    if (!parsed.policies || parsed.policies.length === 0) {
      parsed.policies = [...initialPolicies];
      saveLocalStore(parsed);
    }
    if (!parsed.items || parsed.items.length === 0) {
      parsed.items = [...initialProducts];
      saveLocalStore(parsed);
    }
    if (!parsed.categories || parsed.categories.length === 0) {
      parsed.categories = [...initialCategories];
      saveLocalStore(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Error al leer localStore:', error);
    return initDefaultDatabase();
  }
}

export function saveLocalStore(data: LocalDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error al guardar localStore:', error);
  }
}

// ============================================================================
// 4. REPOSITORIO DE PRODUCTOS (MYSQL PRIORITARIO CON FALLBACK)
// ============================================================================

export interface ProductFilters {
  q?: string;
  category?: string | number;
  scale?: string;
  material?: string;
  search?: string;
  badge?: string;
  brand?: string;
  occasion?: string;
  inStock?: boolean;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest' | string;
  [key: string]: any;
}

function mapMysqlRowToProduct(row: any): Product {
  return {
    id: Number(row.id),
    sku: row.sku,
    name: row.name,
    title: row.name,
    slug: row.slug,
    category_id: Number(row.category_id),
    categoryId: Number(row.category_id),
    scale: row.scale,
    material: row.material,
    specs_line: row.specs_line,
    compatible_models: row.compatible_models,
    price: Number(row.price),
    old_price: row.old_price ? Number(row.old_price) : undefined,
    compareAtPrice: row.old_price ? Number(row.old_price) : undefined,
    discountPercent: row.old_price && Number(row.old_price) > Number(row.price)
      ? Math.round(((Number(row.old_price) - Number(row.price)) / Number(row.old_price)) * 100)
      : undefined,
    stock: Number(row.stock),
    stockQuantity: Number(row.stock),
    badge: row.badge || undefined,
    image_url: row.image_url,
    imageUrl: row.image_url,
    images: [row.image_url],
    is_active: Boolean(row.is_active),
    isActive: Boolean(row.is_active),
    brand: row.brand || 'Hobby Bolivia',
    description: row.description || '',
    itemType: 'PRODUCT',
    actionType: 'ADD_TO_CART',
    availability: Number(row.stock) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
  };
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const pool = getMysqlPool();
  if (pool) {
    try {
      let query = 'SELECT * FROM products WHERE is_active = 1';
      const params: any[] = [];

      if (filters.category) {
        if (typeof filters.category === 'number' || !isNaN(Number(filters.category))) {
          query += ' AND category_id = ?';
          params.push(Number(filters.category));
        } else {
          query += ' AND category_id IN (SELECT id FROM categories WHERE slug = ?)';
          params.push(filters.category);
        }
      }

      if (filters.scale && filters.scale !== 'all') {
        query += ' AND scale = ?';
        params.push(filters.scale);
      }

      if (filters.material && filters.material !== 'all') {
        query += ' AND material = ?';
        params.push(filters.material);
      }

      if (filters.badge && filters.badge !== 'all') {
        query += ' AND badge = ?';
        params.push(filters.badge);
      }

      if (filters.inStockOnly) {
        query += ' AND stock > 0';
      }

      if (filters.minPrice !== undefined) {
        query += ' AND price >= ?';
        params.push(filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query += ' AND price <= ?';
        params.push(filters.maxPrice);
      }

      if (filters.search) {
        const term = `%${filters.search.trim()}%`;
        query += ' AND (name LIKE ? OR sku LIKE ? OR specs_line LIKE ? OR compatible_models LIKE ?)';
        params.push(term, term, term, term);
      }

      if (filters.sort === 'price_asc') {
        query += ' ORDER BY price ASC';
      } else if (filters.sort === 'price_desc') {
        query += ' ORDER BY price DESC';
      } else if (filters.sort === 'name_asc') {
        query += ' ORDER BY name ASC';
      } else {
        query += ' ORDER BY id ASC';
      }

      const [rows]: any = await pool.query(query, params);
      if (rows && rows.length > 0) {
        return rows.map(mapMysqlRowToProduct);
      }
    } catch (err) {
      console.warn('[MySQL Query Warning, using local fallback]:', err);
    }
  }

  // Fallback Local
  const store = getLocalStore();
  let list = store.items.filter(p => p.is_active !== false);

  if (filters.category) {
    list = list.filter(p => {
      const catId = p.category_id || p.categoryId;
      if (typeof filters.category === 'number' || !isNaN(Number(filters.category))) {
        return catId === Number(filters.category);
      }
      const cat = store.categories.find(c => c.slug === filters.category);
      return cat ? catId === cat.id : false;
    });
  }

  if (filters.scale && filters.scale !== 'all') {
    list = list.filter(p => p.scale === filters.scale);
  }

  if (filters.material && filters.material !== 'all') {
    list = list.filter(p => p.material === filters.material);
  }

  if (filters.badge && filters.badge !== 'all') {
    list = list.filter(p => p.badge === filters.badge);
  }

  if (filters.inStockOnly) {
    list = list.filter(p => (p.stock || p.stockQuantity || 0) > 0);
  }

  if (filters.minPrice !== undefined) {
    list = list.filter(p => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    list = list.filter(p => p.price <= filters.maxPrice!);
  }

  if (filters.search) {
    const term = filters.search.toLowerCase().trim();
    list = list.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.specs_line && p.specs_line.toLowerCase().includes(term)) ||
      (p.compatible_models && p.compatible_models.toLowerCase().includes(term))
    );
  }

  if (filters.sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (filters.sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (filters.sort === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list.sort((a, b) => a.id - b.id);
  }

  return list;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM products ORDER BY id ASC');
      if (rows && rows.length > 0) {
        return rows.map(mapMysqlRowToProduct);
      }
    } catch (e) {
      console.warn('[MySQL Admin Query Warning]:', e);
    }
  }

  const store = getLocalStore();
  return store.items;
}

export async function getProductById(id: number): Promise<Product | null> {
  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        return mapMysqlRowToProduct(rows[0]);
      }
    } catch (e) {
      console.warn('[MySQL getProductById Warning]:', e);
    }
  }

  const store = getLocalStore();
  const product = store.items.find(p => p.id === id);
  return product || null;
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM products WHERE sku = ?', [sku]);
      if (rows && rows.length > 0) {
        return mapMysqlRowToProduct(rows[0]);
      }
    } catch (e) {
      console.warn('[MySQL getProductBySku Warning]:', e);
    }
  }

  const store = getLocalStore();
  return store.items.find(p => p.sku?.toLowerCase() === sku.toLowerCase()) || null;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const store = getLocalStore();
  const newId = store.items.length > 0 ? Math.max(...store.items.map(p => p.id)) + 1 : 1;
  const sku = data.sku || `HB-${newId.toString().padStart(4, '0')}`;
  const slug = data.slug || (data.name || `producto-${newId}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const imageUrl = data.image_url || (data.images && data.images[0]) || data.imageUrl || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp";

  const newProduct: Product = {
    id: newId,
    sku,
    name: data.name || "Nuevo Repuesto",
    title: data.name || "Nuevo Repuesto",
    slug,
    category_id: data.category_id || data.categoryId || 1,
    categoryId: data.category_id || data.categoryId || 1,
    scale: data.scale || "RC Estándar",
    material: data.material || "Compuesto",
    specs_line: data.specs_line || "Componente mecánico original Hobby Bolivia",
    compatible_models: data.compatible_models || "Aviones a escala y radiocontrol",
    price: Number(data.price) || 0,
    old_price: data.old_price ? Number(data.old_price) : undefined,
    compareAtPrice: data.old_price ? Number(data.old_price) : undefined,
    stock: data.stock !== undefined ? Number(data.stock) : 10,
    stockQuantity: data.stock !== undefined ? Number(data.stock) : 10,
    badge: data.badge,
    image_url: imageUrl,
    imageUrl,
    images: [imageUrl],
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    isActive: data.is_active !== undefined ? Boolean(data.is_active) : true,
    brand: data.brand || "Hobby Bolivia",
    description: data.description || "Componente de alta precisión para aeromodelismo.",
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    updated_at: new Date().toISOString()
  };

  // 1. Guardar en MySQL si está disponible
  const pool = getMysqlPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO products (
          id, sku, name, slug, category_id, scale, material, specs_line,
          compatible_models, price, old_price, stock, badge, image_url,
          is_active, brand, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newProduct.id,
          newProduct.sku,
          newProduct.name,
          newProduct.slug,
          newProduct.category_id,
          newProduct.scale,
          newProduct.material,
          newProduct.specs_line,
          newProduct.compatible_models,
          newProduct.price,
          newProduct.old_price || null,
          newProduct.stock,
          newProduct.badge || null,
          newProduct.image_url,
          newProduct.is_active ? 1 : 0,
          newProduct.brand,
          newProduct.description
        ]
      );
    } catch (e) {
      console.warn('[MySQL createProduct Warning]:', e);
    }
  }

  // 2. Guardar en localStore
  store.items.unshift(newProduct);
  saveLocalStore(store);

  return newProduct;
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
  const store = getLocalStore();
  const index = store.items.findIndex(p => p.id === id);
  if (index === -1) return null;

  const current = store.items[index];
  const updated: Product = {
    ...current,
    ...data,
    id,
    sku: data.sku || current.sku,
    name: data.name || current.name,
    title: data.name || current.title || current.name,
    price: data.price !== undefined ? Number(data.price) : current.price,
    stock: data.stock !== undefined ? Number(data.stock) : current.stock,
    stockQuantity: data.stock !== undefined ? Number(data.stock) : (current.stockQuantity || current.stock),
    specs_line: data.specs_line || current.specs_line,
    material: data.material || current.material,
    scale: data.scale || current.scale,
    badge: data.badge !== undefined ? data.badge : current.badge,
    image_url: data.image_url || data.imageUrl || (data.images && data.images[0]) || current.image_url,
    imageUrl: data.image_url || data.imageUrl || (data.images && data.images[0]) || current.imageUrl,
    is_active: data.is_active !== undefined ? Boolean(data.is_active) : (data.isActive !== undefined ? Boolean(data.isActive) : current.is_active),
    isActive: data.is_active !== undefined ? Boolean(data.is_active) : (data.isActive !== undefined ? Boolean(data.isActive) : current.isActive),
    updated_at: new Date().toISOString()
  };

  // 1. Actualizar en MySQL
  const pool = getMysqlPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE products SET
          sku = ?, name = ?, price = ?, old_price = ?, stock = ?,
          specs_line = ?, material = ?, scale = ?, badge = ?,
          image_url = ?, is_active = ?, description = ?
         WHERE id = ?`,
        [
          updated.sku,
          updated.name,
          updated.price,
          updated.old_price || null,
          updated.stock,
          updated.specs_line,
          updated.material,
          updated.scale,
          updated.badge || null,
          updated.image_url,
          updated.is_active ? 1 : 0,
          updated.description || '',
          id
        ]
      );
    } catch (e) {
      console.warn('[MySQL updateProduct Warning]:', e);
    }
  }

  // 2. Actualizar en localStore
  store.items[index] = updated;
  saveLocalStore(store);

  return updated;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const store = getLocalStore();
  const initCount = store.items.length;
  store.items = store.items.filter(p => p.id !== id);

  if (store.items.length !== initCount) {
    saveLocalStore(store);

    const pool = getMysqlPool();
    if (pool) {
      try {
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
      } catch (e) {
        console.warn('[MySQL deleteProduct Warning]:', e);
      }
    }
    return true;
  }
  return false;
}

// ============================================================================
// 5. REPOSITORIO DE CATEGORÍAS (MYSQL PRIORITARIO CON FALLBACK)
// ============================================================================

export async function getCategories(): Promise<Category[]> {
  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(`
        SELECT c.*, COUNT(p.id) as item_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.display_order ASC, c.id ASC
      `);

      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          id: Number(r.id),
          name: r.name,
          slug: r.slug,
          description: r.description || '',
          imageUrl: r.image_url,
          image_url: r.image_url,
          order: Number(r.display_order || r.id),
          isActive: Boolean(r.is_active),
          itemCount: Number(r.item_count || 0)
        }));
      }
    } catch (e) {
      console.warn('[MySQL getCategories Warning]:', e);
    }
  }

  const store = getLocalStore();
  return store.categories.map(cat => {
    const count = store.items.filter(i => (i.category_id === cat.id || i.categoryId === cat.id) && i.is_active !== false).length;
    return { ...cat, itemCount: count };
  });
}

export async function saveCategory(data: Partial<Category>): Promise<Category> {
  const store = getLocalStore();

  if (data.id) {
    const index = store.categories.findIndex(c => c.id === data.id);
    if (index !== -1) {
      store.categories[index] = { ...store.categories[index], ...data } as Category;
      saveLocalStore(store);

      const pool = getMysqlPool();
      if (pool) {
        try {
          await pool.query(
            'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, is_active = ? WHERE id = ?',
            [
              data.name,
              data.slug,
              data.description || '',
              data.image_url || data.imageUrl || '',
              data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
              data.id
            ]
          );
        } catch (e) {
          console.warn('[MySQL saveCategory Update Warning]:', e);
        }
      }
      return store.categories[index];
    }
  }

  const newId = store.categories.length > 0 ? Math.max(...store.categories.map(c => c.id)) + 1 : 1;
  const slug = data.slug || (data.name || `categoria-${newId}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newCat: Category = {
    id: newId,
    name: data.name || "Nueva Categoría",
    slug,
    imageUrl: data.imageUrl || data.image_url || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
    image_url: data.image_url || data.imageUrl || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
    description: data.description || "",
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    order: data.order !== undefined ? Number(data.order) : newId,
    itemCount: 0
  };

  const pool = getMysqlPool();
  if (pool) {
    try {
      await pool.query(
        'INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newCat.id, newCat.name, newCat.slug, newCat.description, newCat.image_url, newCat.order, newCat.isActive ? 1 : 0]
      );
    } catch (e) {
      console.warn('[MySQL saveCategory Insert Warning]:', e);
    }
  }

  store.categories.push(newCat);
  saveLocalStore(store);
  return newCat;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  return saveCategory({ ...data, id: undefined });
}

export async function deleteCategory(id: number): Promise<boolean> {
  const store = getLocalStore();
  const initCount = store.categories.length;
  store.categories = store.categories.filter(c => c.id !== id);
  if (store.categories.length !== initCount) {
    saveLocalStore(store);

    const pool = getMysqlPool();
    if (pool) {
      try {
        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
      } catch (e) {
        console.warn('[MySQL deleteCategory Warning]:', e);
      }
    }
    return true;
  }
  return false;
}

// ============================================================================
// 6. REPOSITORIO DE POLÍTICAS (MYSQL PRIORITARIO CON FALLBACK)
// ============================================================================

export async function getPolicies(): Promise<Policy[]> {
  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM policies ORDER BY id ASC');
      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          id: Number(r.id),
          slug: r.slug,
          title: r.title,
          content: r.content,
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
        }));
      }
    } catch (e) {
      markMysqlUnavailable(e);
      console.warn('[MySQL getPolicies Warning]:', e);
    }
  }

  const store = getLocalStore();
  return store.policies || initialPolicies;
}

export async function getPolicyBySlug(slug: string): Promise<Policy | null> {
  const policies = await getPolicies();
  return policies.find(p => p.slug === slug) || null;
}

export async function savePolicy(slug: string, data: { title?: string; content?: string }): Promise<Policy | null> {
  const store = getLocalStore();
  const index = store.policies.findIndex(p => p.slug === slug);
  if (index === -1) return null;

  store.policies[index] = {
    ...store.policies[index],
    ...(data.title ? { title: data.title } : {}),
    ...(data.content ? { content: data.content } : {}),
    updatedAt: new Date().toISOString()
  };
  saveLocalStore(store);

  const pool = getMysqlPool();
  if (pool) {
    try {
      await pool.query(
        'UPDATE policies SET title = COALESCE(?, title), content = COALESCE(?, content) WHERE slug = ?',
        [data.title || null, data.content || null, slug]
      );
    } catch (e) {
      console.warn('[MySQL savePolicy Warning]:', e);
    }
  }

  return store.policies[index];
}

// ============================================================================
// 7. COTIZACIONES Y PEDIDOS
// ============================================================================

export async function getQuotes(): Promise<QuoteOrder[]> {
  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM quote_orders ORDER BY id DESC');
      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          id: Number(r.id),
          orderCode: `HB-${r.id.toString().padStart(4, '0')}`,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          deliveryCity: r.customer_city,
          customerNotes: r.customer_notes,
          items: JSON.parse(r.items_json || '[]'),
          total: Number(r.total),
          status: r.status as OrderStatus,
          createdAt: new Date(r.created_at).toISOString()
        }));
      }
    } catch (e) {
      console.warn('[MySQL getQuotes Warning]:', e);
    }
  }

  const store = getLocalStore();
  return store.quotes;
}

export async function createQuoteOrder(data: Partial<QuoteOrder>): Promise<QuoteOrder> {
  const store = getLocalStore();
  const newId = store.quotes.length > 0 ? Math.max(...store.quotes.map(q => q.id || 0)) + 1 : 1;
  const orderCode = `HB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${newId.toString().padStart(3, '0')}`;

  const newOrder: QuoteOrder = {
    id: newId,
    orderCode,
    customerName: data.customerName || "Cliente",
    customerPhone: data.customerPhone || "",
    deliveryCity: data.deliveryCity || "Santa Cruz",
    deliveryAddress: data.deliveryAddress || "",
    customerNotes: data.customerNotes,
    items: data.items || [],
    total: Number(data.total) || 0,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const pool = getMysqlPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO quote_orders (id, customer_name, customer_phone, customer_city, customer_notes, items_json, total, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newOrder.id,
          newOrder.customerName,
          newOrder.customerPhone,
          newOrder.deliveryCity,
          newOrder.customerNotes || '',
          JSON.stringify(newOrder.items),
          newOrder.total,
          newOrder.status
        ]
      );
    } catch (e) {
      console.warn('[MySQL createQuoteOrder Warning]:', e);
    }
  }

  store.quotes.unshift(newOrder);
  saveLocalStore(store);
  return newOrder;
}

// ============================================================================
// 8. USUARIOS ADMINISTRADORES
// ============================================================================

export async function getUserByUsername(username: string): Promise<User | null> {
  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        'SELECT * FROM admin_users WHERE username = ? OR email = ? LIMIT 1',
        [username.trim().toLowerCase(), username.trim().toLowerCase()]
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: Number(r.id),
          username: r.username,
          name: r.username === 'superadmin' ? 'Super Administrador' : 'Administrador Hobby Bolivia',
          email: r.email,
          password: r.password_hash,
          role: r.role as 'SUPERADMIN' | 'ADMIN',
          isActive: true
        };
      }
    } catch (e) {
      console.warn('[MySQL getUserByUsername Warning]:', e);
    }
  }

  const store = getLocalStore();
  const clean = username.trim().toLowerCase();
  const user = store.users?.find(u => u.username?.toLowerCase() === clean || u.email?.toLowerCase() === clean);
  return user || null;
}

// ============================================================================
// 9. ADAPTADORES DE COMPATIBILIDAD
// ============================================================================

export const getCatalogItemById = getProductById;
export const deleteCatalogItem = deleteProduct;
export async function saveCatalogItem(data: Partial<Product>): Promise<Product> {
  if (data.id) {
    const updated = await updateProduct(data.id, data);
    if (updated) return updated;
  }
  return createProduct(data);
}

export const getQuoteOrders = getQuotes;
export async function updateQuoteOrderStatus(id: number, status: OrderStatus): Promise<QuoteOrder | null> {
  const store = getLocalStore();
  const index = store.quotes.findIndex(q => q.id === id);
  if (index === -1) return null;
  store.quotes[index].status = status;
  store.quotes[index].updatedAt = new Date().toISOString();
  saveLocalStore(store);
  return store.quotes[index];
}

export async function getClaimRecords(): Promise<ClaimRecord[]> {
  const store = getLocalStore();
  return store.claims || [];
}

export async function getClaimRecordByCode(code: string): Promise<ClaimRecord | null> {
  const store = getLocalStore();
  return store.claims?.find(c => c.trackingCode === code) || null;
}

export async function createClaimRecord(data: Partial<ClaimRecord>): Promise<ClaimRecord> {
  const store = getLocalStore();
  if (!store.claims) store.claims = [];
  const trackingCode = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const newRecord: ClaimRecord = {
    id: store.claims.length + 1,
    trackingCode,
    fullName: data.fullName || "",
    documentId: data.documentId || "",
    phone: data.phone || "",
    email: data.email || "",
    contractedItem: data.contractedItem || "",
    orderCode: data.orderCode || null,
    amount: data.amount || null,
    type: data.type || "RECLAMO",
    detail: data.detail || "",
    customerRequest: data.customerRequest || "",
    status: "PENDIENTE",
    adminNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.claims.unshift(newRecord);
  saveLocalStore(store);
  return newRecord;
}

export async function updateClaimStatus(id: number, status: any, adminNotes?: string): Promise<ClaimRecord | null> {
  const store = getLocalStore();
  const index = store.claims.findIndex(c => c.id === id);
  if (index === -1) return null;
  store.claims[index].status = status;
  if (adminNotes !== undefined) store.claims[index].adminNotes = adminNotes;
  store.claims[index].updatedAt = new Date().toISOString();
  saveLocalStore(store);
  return store.claims[index];
}

export async function getUsers(): Promise<User[]> {
  const store = getLocalStore();
  return store.users || [DEFAULT_SUPERADMIN];
}

export async function getUserById(id: number): Promise<User | null> {
  const store = getLocalStore();
  return store.users?.find(u => u.id === id) || null;
}

export async function saveUser(data: Partial<User>): Promise<User> {
  const store = getLocalStore();
  if (!store.users) store.users = [DEFAULT_SUPERADMIN];
  if (data.id) {
    const idx = store.users.findIndex(u => u.id === data.id);
    if (idx !== -1) {
      store.users[idx] = { ...store.users[idx], ...data, updatedAt: new Date().toISOString() };
      saveLocalStore(store);
      return store.users[idx];
    }
  }
  const newId = store.users.length > 0 ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
  const newUser: User = {
    id: newId,
    name: data.name || "Usuario",
    username: data.username || `user${newId}`,
    email: data.email,
    password: data.password || "password",
    role: data.role || "ADMIN",
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: new Date().toISOString()
  };
  store.users.push(newUser);
  saveLocalStore(store);
  return newUser;
}

export async function deleteUser(id: number): Promise<boolean> {
  const store = getLocalStore();
  if (id === 1) return false;
  const initCount = store.users.length;
  store.users = store.users.filter(u => u.id !== id);
  if (store.users.length !== initCount) {
    saveLocalStore(store);
    return true;
  }
  return false;
}

export async function saveBanner(data: Partial<Banner>): Promise<Banner> {
  const store = getLocalStore();
  if (!store.banners) store.banners = [...initialBanners];
  if (data.id) {
    const idx = store.banners.findIndex(b => b.id === data.id);
    if (idx !== -1) {
      store.banners[idx] = { ...store.banners[idx], ...data };
      saveLocalStore(store);
      return store.banners[idx];
    }
  }
  const newId = store.banners.length > 0 ? Math.max(...store.banners.map(b => b.id)) + 1 : 1;
  const newBanner: Banner = {
    id: newId,
    title: data.title || "Banner",
    subtitle: data.subtitle,
    imageUrl: data.imageUrl || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
    buttonText: data.buttonText,
    buttonUrl: data.buttonUrl,
    placement: data.placement || "HERO",
    isActive: data.isActive !== undefined ? data.isActive : true
  };
  store.banners.push(newBanner);
  saveLocalStore(store);
  return newBanner;
}

export async function deleteBanner(id: number): Promise<boolean> {
  const store = getLocalStore();
  const initCount = store.banners.length;
  store.banners = store.banners.filter(b => b.id !== id);
  if (store.banners.length !== initCount) {
    saveLocalStore(store);
    return true;
  }
  return false;
}

export async function saveOccasion(data: Partial<Occasion>): Promise<Occasion> {
  const store = getLocalStore();
  if (!store.occasions) store.occasions = [...initialOccasions];
  if (data.id) {
    const idx = store.occasions.findIndex(o => o.id === data.id);
    if (idx !== -1) {
      store.occasions[idx] = { ...store.occasions[idx], ...data };
      saveLocalStore(store);
      return store.occasions[idx];
    }
  }
  const newId = store.occasions.length > 0 ? Math.max(...store.occasions.map(o => o.id)) + 1 : 1;
  const newOccasion: Occasion = {
    id: newId,
    name: data.name || "Mando",
    slug: data.slug || `mando-${newId}`,
    iconName: data.iconName || "Plane",
    isActive: data.isActive !== undefined ? data.isActive : true
  };
  store.occasions.push(newOccasion);
  saveLocalStore(store);
  return newOccasion;
}

export async function deleteOccasion(id: number): Promise<boolean> {
  const store = getLocalStore();
  const initCount = store.occasions.length;
  store.occasions = store.occasions.filter(o => o.id !== id);
  if (store.occasions.length !== initCount) {
    saveLocalStore(store);
    return true;
  }
  return false;
}

export const getCatalogItems = getProducts;
export const updatePolicy = savePolicy;

export async function getSiteConfig(): Promise<SiteConfig> {
  const store = getLocalStore();
  return store.siteConfig;
}

export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
  const store = getLocalStore();
  store.siteConfig = { ...store.siteConfig, ...data };
  saveLocalStore(store);
  return store.siteConfig;
}

export async function getOccasions(): Promise<Occasion[]> {
  const store = getLocalStore();
  return store.occasions || [];
}

export async function getBanners(): Promise<Banner[]> {
  const store = getLocalStore();
  return store.banners || [];
}

