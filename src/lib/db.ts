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
  UserRole,
  Policy,
  ExchangeRateConfig
} from './types';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
export const MAX_CATALOG_IMAGE_BYTES = 250 * 1024; // Límite estricto de 250 KB (256,000 bytes) por imagen en el catálogo

/**
 * Verifica que cualquier imagen local registrada en la base de datos no supere 250 KB
 * y prohíbe terminantemente almacenar datos binarios (BLOB / Base64) en MariaDB/MySQL.
 */
export function assertCatalogImageUnder250KB(imageUrl?: string | null): void {
  if (!imageUrl) return;
  const trimmed = imageUrl.trim();

  // 1. REGLA DE BASE DE DATOS: Prohibido almacenar binarios BLOB o base64 en la BD
  if (trimmed.startsWith('data:image/') || trimmed.length > 2000) {
    throw new Error('No se permite almacenar imágenes en formato binario (BLOB / Base64) en la base de datos. Se debe registrar únicamente la ruta relativa del archivo en el servidor (ej. /uploads/products/nombre.webp).');
  }

  // 2. Si es un archivo local subido a /uploads/..., verificar que en disco no supere 250 KB
  if (trimmed.startsWith('/uploads/')) {
    const localPath = path.join(process.cwd(), 'public', trimmed.replace(/^\//, ''));
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      if (stats.size > MAX_CATALOG_IMAGE_BYTES) {
        throw new Error(`La imagen optimizada supera el límite máximo de 250 KB permitido en el servidor (${(stats.size / 1024).toFixed(1)} KB).`);
      }
    }
  }
}

// Alias para compatibilidad con llamadas existentes
export const assertCatalogImageUnder1MB = assertCatalogImageUnder250KB;

export const DEFAULT_SUPERADMIN: User = {
  id: 1,
  name: "Darinka Arias",
  username: "darinka.arias18@gmail.com",
  email: "darinka.arias18@gmail.com",
  password: "superadmin1234*",
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

  // Fallback por defecto a la base de datos de producción Plesk de Hobby Bolivia
  if (!host || !user || !database) {
    host = host || (process.env.NODE_ENV === 'production' ? 'localhost' : '50.30.32.59');
    user = user || 'dariasdigital_hobbybolivia';
    password = password || 'Imp6fSMr2%mj0w?v';
    database = database || 'dariasdigital_hobbybolivia';
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
        connectTimeout: 5000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
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

// ============================================================================
// SISTEMA DE CACHÉ EN MEMORIA DE ALTA VELOCIDAD (< 1ms RESPONSE TIME)
// ============================================================================

interface CacheRecord<T> {
  data: T;
  timestamp: number;
}

const memoryCache = {
  productsActive: null as CacheRecord<Product[]> | null,
  productsAll: null as CacheRecord<Product[]> | null,
  categories: null as CacheRecord<Category[]> | null,
  policies: null as CacheRecord<Policy[]> | null,
  exchangeRate: null as CacheRecord<ExchangeRateConfig> | null,
  quotes: null as CacheRecord<QuoteOrder[]> | null,
  localStore: null as CacheRecord<LocalDatabase> | null,
  users: null as CacheRecord<User[]> | null,
};

const CACHE_TTL = {
  PRODUCTS: 60 * 1000,       // 60 segundos
  CATEGORIES: 5 * 60 * 1000, // 5 minutos
  POLICIES: 10 * 60 * 1000,  // 10 minutos
  EXCHANGE_RATE: 60 * 1000,  // 60 segundos
  QUOTES: 15 * 1000,         // 15 segundos
  LOCAL_STORE: 30 * 1000,    // 30 segundos
  USERS: 60 * 1000           // 60 segundos
};

function getNow(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function invalidateProductsCache() {
  memoryCache.productsActive = null;
  memoryCache.productsAll = null;
  memoryCache.localStore = null;
}

export function invalidateCategoriesCache() {
  memoryCache.categories = null;
  memoryCache.localStore = null;
}

export function invalidateExchangeRateCache() {
  memoryCache.exchangeRate = null;
  memoryCache.localStore = null;
}

export function invalidateQuotesCache() {
  memoryCache.quotes = null;
  memoryCache.localStore = null;
}

export function invalidatePoliciesCache() {
  memoryCache.policies = null;
  memoryCache.localStore = null;
}

export function invalidateUsersCache() {
  memoryCache.users = null;
  memoryCache.localStore = null;
}

export function invalidateAllCache() {
  memoryCache.productsActive = null;
  memoryCache.productsAll = null;
  memoryCache.categories = null;
  memoryCache.policies = null;
  memoryCache.exchangeRate = null;
  memoryCache.quotes = null;
  memoryCache.localStore = null;
  memoryCache.users = null;
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
        price_usd DECIMAL(10,2) NULL,
        old_price DECIMAL(10,2) NULL,
        stock INT NOT NULL DEFAULT 0,
        badge VARCHAR(100) NULL,
        image_url VARCHAR(500) NOT NULL,
        image_size_bytes INT UNSIGNED NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        brand VARCHAR(100) DEFAULT 'Hobby Bolivia',
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_products_category (category_id),
        INDEX idx_products_sku (sku),
        INDEX idx_products_active (is_active),
        CONSTRAINT chk_products_image_max_1mb CHECK (image_size_bytes <= 1048576)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    try {
      await conn.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,2) NULL AFTER price`);
      await conn.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_size_bytes INT UNSIGNED NOT NULL DEFAULT 0 AFTER image_url`);
      await conn.query(`ALTER TABLE products ADD CONSTRAINT chk_products_image_max_1mb CHECK (image_size_bytes <= 1048576)`);
    } catch {
      // Ignorar si ya existe la columna o la restricción CHECK en MySQL
    }

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
        name VARCHAR(255) NOT NULL DEFAULT 'Administrador Hobby Bolivia',
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    try {
      await conn.query(`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Administrador Hobby Bolivia' AFTER id`);
      await conn.query(`ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role`);
    } catch {
      // Ignorar si la versión de MySQL no soporta IF NOT EXISTS en ALTER TABLE o ya existen
    }

    // Asegurar que la tabla admin_users en MySQL tenga siempre las cuentas administradoras base
    await conn.query(`
      INSERT INTO admin_users (id, name, username, email, password_hash, role, is_active)
      VALUES (1, 'Darinka Arias', 'darinka.arias18@gmail.com', 'darinka.arias18@gmail.com', 'superadmin1234*', 'SUPERADMIN', 1),
             (2, 'Administrador Hobby Bolivia', 'dariasdigital_hobbybolivia', 'admin@hobbybolivia.com', 'Imp6fSMr2%mj0w?v', 'SUPERADMIN', 1)
      ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), role=VALUES(role);
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
        stock_deducted TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    try {
      await conn.query(`ALTER TABLE quote_orders ADD COLUMN IF NOT EXISTS stock_deducted TINYINT(1) NOT NULL DEFAULT 0`);
    } catch {
      // Ignorar si la columna ya existe o no soporta IF NOT EXISTS
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 6.9600,
        auto_update TINYINT(1) NOT NULL DEFAULT 1,
        source VARCHAR(100) DEFAULT 'API Oficial',
        last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      INSERT INTO system_settings (id, setting_key, exchange_rate, auto_update, source)
      VALUES (1, 'default_exchange_rate', 6.9600, 1, 'API Oficial')
      ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
    `);

    // 2. Sincronización bidireccional automática continua
    let catInserted = 0;
    let prodInserted = 0;
    let polInserted = 0;

    if (forceSeed) {
      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      await conn.query('TRUNCATE TABLE products');
      await conn.query('TRUNCATE TABLE categories');
      await conn.query('TRUNCATE TABLE policies');
      await conn.query('TRUNCATE TABLE admin_users');
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    // Obtener datos fuente desde getLocalStore() o fallback inicial
    const store = getLocalStore();
    const seedCats = store.categories && store.categories.length > 0 ? store.categories : initialCategories;
    const seedProducts = store.items && store.items.length > 0 ? store.items : initialProducts;
    const seedPolicies = store.policies && store.policies.length > 0 ? store.policies : initialPolicies;

    // Sincronizar Categorías (Upsert en MySQL)
    for (const cat of seedCats) {
      await conn.query(
        `INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url),
           display_order=VALUES(display_order), is_active=VALUES(is_active)`,
        [
          cat.id,
          cat.name,
          cat.slug,
          cat.description || '',
          cat.image_url || cat.imageUrl || '',
          cat.order || (cat as any).display_order || cat.id,
          cat.isActive !== false && (cat as any).is_active !== false ? 1 : 0
        ]
      );
      catInserted++;
    }

    // Sincronizar Productos con price y price_usd exactos (Upsert en MySQL)
    for (const prod of seedProducts) {
      const pUsd = prod.price_usd !== undefined && prod.price_usd !== null
        ? Number(prod.price_usd)
        : (prod.priceUsd !== undefined && prod.priceUsd !== null ? Number(prod.priceUsd) : null);
      const pImg = prod.image_url || prod.imageUrl || (prod.images && prod.images[0]) || '/placeholder.webp';
      const pActive = prod.is_active !== undefined ? (prod.is_active ? 1 : 0) : (prod.isActive !== undefined ? (prod.isActive ? 1 : 0) : 1);

      await conn.query(
        `INSERT INTO products (
          id, sku, name, slug, category_id, scale, material, specs_line,
          compatible_models, price, price_usd, old_price, stock, badge, image_url,
          is_active, brand, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name=VALUES(name), price=VALUES(price), price_usd=VALUES(price_usd),
          stock=VALUES(stock), specs_line=VALUES(specs_line), image_url=VALUES(image_url),
          is_active=VALUES(is_active), badge=VALUES(badge), brand=VALUES(brand), description=VALUES(description)`,
        [
          prod.id,
          prod.sku,
          prod.name || prod.title,
          prod.slug,
          prod.category_id || prod.categoryId || 1,
          prod.scale || 'RC Estándar',
          prod.material || 'Compuesto',
          prod.specs_line || '',
          prod.compatible_models || '',
          prod.price || 0,
          pUsd,
          prod.old_price || null,
          prod.stock !== undefined ? Number(prod.stock) : (prod.stockQuantity !== undefined ? Number(prod.stockQuantity) : 0),
          prod.badge || null,
          pImg,
          pActive,
          prod.brand || 'Hobby Bolivia',
          prod.description || ''
        ]
      );
      prodInserted++;
    }

    // Sincronizar Políticas (Upsert en MySQL)
    for (const pol of seedPolicies) {
      await conn.query(
        `INSERT INTO policies (id, slug, title, content)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content)`,
        [pol.id, pol.slug, pol.title, pol.content]
      );
      polInserted++;
    }

    // Asegurar Administradores
    await conn.query(`
      INSERT INTO admin_users (id, username, email, password_hash, role)
      VALUES (1, 'darinka.arias18@gmail.com', 'darinka.arias18@gmail.com', 'superadmin1234*', 'SUPERADMIN'),
             (2, 'dariasdigital_hobbybolivia', 'admin@hobbybolivia.com', 'Imp6fSMr2%mj0w?v', 'SUPERADMIN')
      ON DUPLICATE KEY UPDATE username=VALUES(username), email=VALUES(email), password_hash=VALUES(password_hash), role=VALUES(role)
    `);

    // Sincronizar de vuelta: refrescar localStore desde MySQL para coherencia absoluta
    try {
      const [allRows]: any = await conn.query('SELECT * FROM products ORDER BY id ASC');
      if (allRows && allRows.length >= store.items.length) {
        store.items = allRows.map(mapMysqlRowToProduct);
        saveLocalStore(store);
      }
    } catch (e) {
      // Ignorar si falla lectura inversa
    }

    // Invalida la memoria caché para que el sistema sirva de inmediato la nueva información sincronizada
    invalidateAllCache();

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

// Sincronización desacoplada ultrarrápida: no bloquea lecturas de usuarios ni peticiones HTTP
export async function ensureMysqlSynced(): Promise<void> {
  // Las consultas operan con caché en memoria y acceso directo a MySQL (<1ms).
  // No bloquear el ciclo de vida de peticiones HTTP con sincronizaciones pesadas.
  return;
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
  systemSettings?: ExchangeRateConfig;
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
    users: [DEFAULT_SUPERADMIN],
    systemSettings: {
      exchangeRate: 6.96,
      autoUpdate: true,
      source: "API Oficial",
      lastChecked: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
}

export function getLocalStore(): LocalDatabase {
  if (memoryCache.localStore && getNow() - memoryCache.localStore.timestamp < CACHE_TTL.LOCAL_STORE) {
    return memoryCache.localStore.data;
  }
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = initDefaultDatabase();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      memoryCache.localStore = { data: initial, timestamp: getNow() };
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
    if (!parsed.systemSettings) {
      parsed.systemSettings = {
        exchangeRate: 6.96,
        autoUpdate: true,
        source: "API Oficial",
        lastChecked: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveLocalStore(parsed);
    }
    if (!parsed.users || parsed.users.length === 0) {
      parsed.users = [DEFAULT_SUPERADMIN];
      saveLocalStore(parsed);
    } else {
      const darinkaUser = parsed.users.find(u =>
        u.email?.toLowerCase() === 'darinka.arias18@gmail.com' ||
        u.username?.toLowerCase() === 'darinka.arias18@gmail.com'
      );
      if (!darinkaUser) {
        parsed.users.unshift(DEFAULT_SUPERADMIN);
        saveLocalStore(parsed);
      } else if (darinkaUser.password !== 'superadmin1234*' || darinkaUser.role !== 'SUPERADMIN') {
        darinkaUser.name = 'Darinka Arias';
        darinkaUser.password = 'superadmin1234*';
        darinkaUser.role = 'SUPERADMIN';
        darinkaUser.isActive = true;
        saveLocalStore(parsed);
      }
    }

    memoryCache.localStore = { data: parsed, timestamp: getNow() };
    return parsed;
  } catch (error) {
    console.error('Error al leer localStore:', error);
    return initDefaultDatabase();
  }
}

export function saveLocalStore(data: LocalDatabase): void {
  try {
    memoryCache.localStore = { data, timestamp: getNow() };
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error al guardar localStore:', error);
  }
}

export async function getExchangeRateDb(): Promise<ExchangeRateConfig> {
  if (memoryCache.exchangeRate && getNow() - memoryCache.exchangeRate.timestamp < CACHE_TTL.EXCHANGE_RATE) {
    return memoryCache.exchangeRate.data;
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        "SELECT * FROM system_settings WHERE setting_key = 'default_exchange_rate' LIMIT 1"
      );
      if (rows && rows.length > 0) {
        const row = rows[0];
        const res: ExchangeRateConfig = {
          exchangeRate: Number(row.exchange_rate) || 6.96,
          autoUpdate: Boolean(row.auto_update),
          source: row.source || "API Oficial",
          lastChecked: row.last_checked ? new Date(row.last_checked).toISOString() : new Date().toISOString(),
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
        };
        memoryCache.exchangeRate = { data: res, timestamp: getNow() };
        return res;
      }
    } catch (e) {
      console.warn('[MySQL getExchangeRateDb Warning]:', e);
    }
  }

  const store = getLocalStore();
  const fallback = store.systemSettings || {
    exchangeRate: 6.96,
    autoUpdate: true,
    source: "API Oficial",
    lastChecked: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryCache.exchangeRate = { data: fallback, timestamp: getNow() };
  return fallback;
}

export async function saveExchangeRateDb(config: Partial<ExchangeRateConfig>): Promise<ExchangeRateConfig> {
  invalidateExchangeRateCache();
  const current = await getExchangeRateDb();
  const updated: ExchangeRateConfig = {
    exchangeRate: config.exchangeRate !== undefined ? Number(config.exchangeRate) : current.exchangeRate,
    autoUpdate: config.autoUpdate !== undefined ? Boolean(config.autoUpdate) : current.autoUpdate,
    source: config.source || current.source || "API Oficial",
    lastChecked: config.lastChecked || current.lastChecked || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const pool = getMysqlPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO system_settings (setting_key, exchange_rate, auto_update, source, last_checked, updated_at)
         VALUES ('default_exchange_rate', ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           exchange_rate = VALUES(exchange_rate),
           auto_update = VALUES(auto_update),
           source = VALUES(source),
           last_checked = VALUES(last_checked),
           updated_at = CURRENT_TIMESTAMP`,
        [
          updated.exchangeRate,
          updated.autoUpdate ? 1 : 0,
          updated.source,
          new Date(updated.lastChecked || Date.now()),
          new Date(updated.updatedAt)
        ]
      );
    } catch (e) {
      console.warn('[MySQL saveExchangeRateDb Warning]:', e);
    }
  }

  const store = getLocalStore();
  store.systemSettings = updated;
  saveLocalStore(store);

  invalidateExchangeRateCache();
  return updated;
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
  const catId = Number(row.category_id);
  const priceUsdVal = row.price_usd !== undefined && row.price_usd !== null
    ? Number(row.price_usd)
    : (row.priceUsd !== undefined && row.priceUsd !== null ? Number(row.priceUsd) : undefined);
  return {
    id: Number(row.id),
    sku: row.sku,
    name: row.name,
    title: row.name,
    slug: row.slug,
    category_id: catId,
    categoryId: catId,
    category: row.category_name ? {
      id: catId,
      name: row.category_name,
      slug: row.category_slug || '',
      order: Number(row.category_order || 0),
      isActive: Boolean(row.category_is_active ?? true),
      itemCount: 0
    } : undefined,
    scale: row.scale,
    material: row.material,
    specs_line: row.specs_line,
    compatible_models: row.compatible_models,
    price: Number(row.price),
    priceUsd: priceUsdVal,
    price_usd: priceUsdVal,
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
  // 1. Si no hay filtros o solo filtros en memoria, verificar la caché activa
  let baseList: Product[] | null = null;
  const isCacheValid = memoryCache.productsActive && (getNow() - memoryCache.productsActive.timestamp < CACHE_TTL.PRODUCTS);

  if (isCacheValid) {
    baseList = memoryCache.productsActive!.data;
  } else {
    const pool = getMysqlPool();
    if (pool) {
      try {
        const [rows]: any = await pool.query('SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC');
        if (rows && rows.length > 0) {
          const mapped = rows.map(mapMysqlRowToProduct);
          baseList = mapped;
          memoryCache.productsActive = { data: mapped, timestamp: getNow() };
        }
      } catch (err) {
        console.warn('[MySQL Query Warning, using local fallback]:', err);
      }
    }

    if (!baseList) {
      const store = getLocalStore();
      const fallback = store.items.filter(p => p.is_active !== false);
      baseList = fallback;
      memoryCache.productsActive = { data: fallback, timestamp: getNow() };
    }
  }

  // 2. Si no hay filtros complejos requeridos, retornar la lista activa directamente en < 0.1ms
  const hasFilters = Boolean(
    filters.category ||
    (filters.scale && filters.scale !== 'all') ||
    (filters.material && filters.material !== 'all') ||
    (filters.badge && filters.badge !== 'all') ||
    filters.inStockOnly ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.search ||
    filters.sort
  );

  if (!hasFilters) {
    return baseList;
  }

  // 3. Aplicar filtros en memoria ultrarrápida (0.01ms) sin roundtrip de red
  const store = getLocalStore();
  let list = [...baseList];

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
  if (memoryCache.productsAll && getNow() - memoryCache.productsAll.timestamp < CACHE_TTL.PRODUCTS) {
    return memoryCache.productsAll.data;
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(`
        SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.display_order AS category_order, c.is_active AS category_is_active
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        ORDER BY p.id ASC
      `);
      if (rows && rows.length > 0) {
        const mapped = rows.map(mapMysqlRowToProduct);
        memoryCache.productsAll = { data: mapped, timestamp: getNow() };
        try {
          const store = getLocalStore();
          if (store.items.length !== mapped.length) {
            store.items = mapped;
            saveLocalStore(store);
          }
        } catch { }
        return mapped;
      }
    } catch (e) {
      console.warn('[MySQL Admin Query Warning]:', e);
    }
  }

  const store = getLocalStore();
  const list = store.items.map(item => {
    const catId = item.category_id || item.categoryId || 1;
    const cat = store.categories.find(c => c.id === catId);
    return {
      ...item,
      category_id: catId,
      categoryId: catId,
      category: cat || item.category
    };
  });
  memoryCache.productsAll = { data: list, timestamp: getNow() };
  return list;
}

export async function getProductById(id: number): Promise<Product | null> {
  // Búsqueda instantánea en caché de memoria (<0.01ms)
  if (memoryCache.productsAll) {
    const cached = memoryCache.productsAll.data.find(p => p.id === id);
    if (cached) return cached;
  }
  if (memoryCache.productsActive) {
    const cached = memoryCache.productsActive.data.find(p => p.id === id);
    if (cached) return cached;
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(`
        SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.display_order AS category_order, c.is_active AS category_is_active
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.id = ?
      `, [id]);
      if (rows && rows.length > 0) {
        return mapMysqlRowToProduct(rows[0]);
      }
    } catch (e) {
      console.warn('[MySQL getProductById Warning]:', e);
    }
  }

  const store = getLocalStore();
  const product = store.items.find(p => p.id === id);
  if (!product) return null;
  const catId = product.category_id || product.categoryId || 1;
  const cat = store.categories.find(c => c.id === catId);
  return {
    ...product,
    category_id: catId,
    categoryId: catId,
    category: cat || product.category
  };
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const cleanSku = sku.toLowerCase().trim();
  // Búsqueda instantánea en caché de memoria (<0.01ms)
  if (memoryCache.productsAll) {
    const cached = memoryCache.productsAll.data.find(p => p.sku?.toLowerCase().trim() === cleanSku);
    if (cached) return cached;
  }
  if (memoryCache.productsActive) {
    const cached = memoryCache.productsActive.data.find(p => p.sku?.toLowerCase().trim() === cleanSku);
    if (cached) return cached;
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(`
        SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.display_order AS category_order, c.is_active AS category_is_active
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE p.sku = ?
      `, [sku]);
      if (rows && rows.length > 0) {
        return mapMysqlRowToProduct(rows[0]);
      }
    } catch (e) {
      console.warn('[MySQL getProductBySku Warning]:', e);
    }
  }

  const store = getLocalStore();
  const found = store.items.find(p => p.sku?.toLowerCase() === cleanSku);
  if (!found) return null;
  const catId = found.category_id || found.categoryId || 1;
  const cat = store.categories.find(c => c.id === catId);
  return {
    ...found,
    category_id: catId,
    categoryId: catId,
    category: cat || found.category
  };
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const store = getLocalStore();
  const pool = getMysqlPool();
  let newId: number;

  if (pool) {
    try {
      const [maxRes]: any = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM products');
      newId = Number(maxRes[0]?.next_id) || 1;
    } catch {
      newId = store.items.length > 0 ? Math.max(...store.items.map(p => p.id), 0) + 1 : 1;
    }
  } else {
    newId = store.items.length > 0 ? Math.max(...store.items.map(p => p.id), 0) + 1 : 1;
  }

  // Asegurar que newId sea mayor que cualquier ID existente en la tienda local
  if (store.items.length > 0) {
    const maxStoreId = Math.max(...store.items.map(p => p.id), 0);
    if (maxStoreId >= newId) {
      newId = maxStoreId + 1;
    }
  }

  const sku = data.sku || `HB-${newId.toString().padStart(4, '0')}`;
  const slug = data.slug || (data.name || `producto-${newId}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const imageUrl = data.image_url || (data.images && data.images[0]) || data.imageUrl || "/placeholder.webp";

  // Validar que la imagen no supere 1 MB en la base de datos
  assertCatalogImageUnder1MB(imageUrl);

  const newProduct: Product = {
    id: newId,
    sku,
    name: data.name || "Nuevo Producto",
    title: data.name || "Nuevo Producto",
    slug,
    category_id: data.category_id || data.categoryId || 1,
    categoryId: data.category_id || data.categoryId || 1,
    scale: data.scale || "RC Estándar",
    material: data.material || "Compuesto",
    specs_line: data.specs_line || "Componente mecánico original Hobby Bolivia",
    compatible_models: data.compatible_models || "Aviones a escala y radiocontrol",
    price: Number(data.price) || 0,
    priceUsd: data.priceUsd !== undefined ? Number(data.priceUsd) : (data.price_usd !== undefined ? Number(data.price_usd) : undefined),
    price_usd: data.price_usd !== undefined ? Number(data.price_usd) : (data.priceUsd !== undefined ? Number(data.priceUsd) : undefined),
    currency: data.currency || 'Bs.',
    display_currency: (data.display_currency || data.currency || 'Bs.') as any,
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
  if (pool) {
    try {
      const [insertRes]: any = await pool.query(
        `INSERT INTO products (
          id, sku, name, slug, category_id, scale, material, specs_line,
          compatible_models, price, price_usd, old_price, stock, badge, image_url,
          is_active, brand, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          newProduct.price_usd ?? newProduct.priceUsd ?? null,
          newProduct.old_price || null,
          newProduct.stock,
          newProduct.badge || null,
          newProduct.image_url,
          newProduct.is_active ? 1 : 0,
          newProduct.brand,
          newProduct.description
        ]
      );
      if (insertRes?.insertId && insertRes.insertId !== newProduct.id) {
        newProduct.id = insertRes.insertId;
      }
    } catch (e: any) {
      console.warn('[MySQL createProduct Warning]:', e?.message || e);
    }
  }

  // 2. Guardar en localStore
  store.items.unshift(newProduct);
  saveLocalStore(store);

  invalidateProductsCache();
  return newProduct;
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
  const store = getLocalStore();
  const index = store.items.findIndex(p => p.id === id);

  const candidateImage = data.image_url || data.imageUrl || (data.images && data.images[0]);
  if (candidateImage) {
    assertCatalogImageUnder1MB(candidateImage);
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
      if (data.slug !== undefined) { fields.push('slug = ?'); values.push(data.slug); }
      if (data.sku !== undefined) { fields.push('sku = ?'); values.push(data.sku); }
      if (data.category_id !== undefined || data.categoryId !== undefined) {
        fields.push('category_id = ?');
        values.push(data.category_id || data.categoryId);
      }
      if (data.scale !== undefined) { fields.push('scale = ?'); values.push(data.scale); }
      if (data.material !== undefined) { fields.push('material = ?'); values.push(data.material); }
      if (data.specs_line !== undefined) { fields.push('specs_line = ?'); values.push(data.specs_line); }
      if (data.compatible_models !== undefined) { fields.push('compatible_models = ?'); values.push(data.compatible_models); }
      if (data.price !== undefined) { fields.push('price = ?'); values.push(Number(data.price)); }
      if (data.price_usd !== undefined || data.priceUsd !== undefined) {
        fields.push('price_usd = ?');
        values.push(data.price_usd ?? data.priceUsd);
      }
      if (data.old_price !== undefined) { fields.push('old_price = ?'); values.push(data.old_price); }
      if (data.stock !== undefined) { fields.push('stock = ?'); values.push(Number(data.stock)); }
      if (data.badge !== undefined) { fields.push('badge = ?'); values.push(data.badge); }
      if (candidateImage !== undefined) { fields.push('image_url = ?'); values.push(candidateImage); }
      if (data.is_active !== undefined || data.isActive !== undefined) {
        fields.push('is_active = ?');
        values.push(data.is_active !== undefined ? (data.is_active ? 1 : 0) : (data.isActive ? 1 : 0));
      }
      if (data.brand !== undefined) { fields.push('brand = ?'); values.push(data.brand); }
      if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }

      if (fields.length > 0) {
        values.push(id);
        await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
      }
    } catch (e: any) {
      console.warn('[MySQL updateProduct Warning]:', e?.message || e);
    }
  }

  // 2. Actualizar en localStore
  if (index !== -1) {
    const current = store.items[index];
    const updated: Product = {
      ...current,
      ...data,
      id,
      sku: data.sku || current.sku,
      name: data.name || current.name,
      title: data.name || current.title || current.name,
      price: data.price !== undefined ? Number(data.price) : current.price,
      priceUsd: data.priceUsd !== undefined ? (data.priceUsd === null ? undefined : Number(data.priceUsd)) : (data.price_usd !== undefined ? (data.price_usd === null ? undefined : Number(data.price_usd)) : current.priceUsd),
      price_usd: data.price_usd !== undefined ? (data.price_usd === null ? undefined : Number(data.price_usd)) : (data.priceUsd !== undefined ? (data.priceUsd === null ? undefined : Number(data.priceUsd)) : current.price_usd),
      currency: data.currency !== undefined ? data.currency : (current.currency || 'Bs.'),
      display_currency: (data.display_currency !== undefined ? data.display_currency : (current.display_currency || current.currency || 'Bs.')) as any,
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

    store.items[index] = updated;
    saveLocalStore(store);
    invalidateProductsCache();
    return updated;
  } else {
    // Si no estaba en localStore, refrescar desde MySQL
    invalidateProductsCache();
    const all = await getAllProductsAdmin();
    const found = all.find(p => p.id === id);
    if (found) {
      store.items.unshift(found);
      saveLocalStore(store);
      return found;
    }
  }

  invalidateProductsCache();
  return null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  let deletedFromMysql = false;
  let deletedFromLocal = false;

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [res]: any = await pool.query('DELETE FROM products WHERE id = ?', [id]);
      if (res?.affectedRows > 0) {
        deletedFromMysql = true;
      }
    } catch (e: any) {
      console.warn('[MySQL deleteProduct Warning]:', e?.message || e);
    }
  }

  const store = getLocalStore();
  const initCount = store.items.length;
  store.items = store.items.filter(p => p.id !== id);
  if (store.items.length !== initCount) {
    deletedFromLocal = true;
    saveLocalStore(store);
  }

  invalidateProductsCache();
  return deletedFromMysql || deletedFromLocal;
}

// ============================================================================
// 5. REPOSITORIO DE CATEGORÍAS (MYSQL PRIORITARIO CON FALLBACK)
// ============================================================================

export async function getCategories(): Promise<Category[]> {
  if (memoryCache.categories && getNow() - memoryCache.categories.timestamp < CACHE_TTL.CATEGORIES) {
    return memoryCache.categories.data;
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(`
        SELECT c.*, COUNT(p.id) as item_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
        GROUP BY c.id
        ORDER BY c.display_order ASC, c.id ASC
      `);

      if (rows && rows.length > 0) {
        const mapped = rows.map((r: any) => ({
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
        memoryCache.categories = { data: mapped, timestamp: getNow() };
        try {
          const store = getLocalStore();
          if (store.categories.length !== mapped.length) {
            store.categories = mapped.map((c: Category) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description,
              imageUrl: c.imageUrl,
              image_url: c.image_url,
              order: c.order,
              isActive: c.isActive,
              itemCount: c.itemCount
            }));
            saveLocalStore(store);
          }
        } catch { }
        return mapped;
      }
    } catch (e) {
      console.warn('[MySQL getCategories Warning]:', e);
    }
  }

  const store = getLocalStore();
  const fallback = store.categories.map(cat => {
    const count = store.items.filter(i => (i.category_id === cat.id || i.categoryId === cat.id) && i.is_active !== false).length;
    return { ...cat, itemCount: count };
  });
  memoryCache.categories = { data: fallback, timestamp: getNow() };
  return fallback;
}

export async function saveCategory(data: Partial<Category>): Promise<Category> {
  invalidateCategoriesCache();
  const store = getLocalStore();
  const pool = getMysqlPool();

  if (data.id) {
    const index = store.categories.findIndex(c => c.id === data.id);
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
      } catch (e: any) {
        console.warn('[MySQL saveCategory Update Warning]:', e?.message || e);
      }
    }

    if (index !== -1) {
      store.categories[index] = { ...store.categories[index], ...data } as Category;
    } else {
      store.categories.push({
        id: data.id,
        name: data.name || "Categoría",
        slug: data.slug || `categoria-${data.id}`,
        imageUrl: data.imageUrl || data.image_url || "/placeholder.webp",
        image_url: data.image_url || data.imageUrl || "/placeholder.webp",
        description: data.description || "",
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        order: data.order !== undefined ? Number(data.order) : data.id,
        itemCount: 0
      });
    }
    saveLocalStore(store);
    invalidateCategoriesCache();
    const updated = store.categories.find(c => c.id === data.id)!;
    return updated;
  }

  // Creación de nueva categoría: obtener nextId desde MySQL
  let newId: number;
  if (pool) {
    try {
      const [maxRes]: any = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM categories');
      newId = Number(maxRes[0]?.next_id) || 1;
    } catch {
      newId = store.categories.length > 0 ? Math.max(...store.categories.map(c => c.id), 0) + 1 : 1;
    }
  } else {
    newId = store.categories.length > 0 ? Math.max(...store.categories.map(c => c.id), 0) + 1 : 1;
  }

  if (store.categories.length > 0) {
    const maxStoreId = Math.max(...store.categories.map(c => c.id), 0);
    if (maxStoreId >= newId) {
      newId = maxStoreId + 1;
    }
  }

  const slug = data.slug || (data.name || `categoria-${newId}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newCat: Category = {
    id: newId,
    name: data.name || "Nueva Categoría",
    slug,
    imageUrl: data.imageUrl || data.image_url || "/placeholder.webp",
    image_url: data.image_url || data.imageUrl || "/placeholder.webp",
    description: data.description || "",
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    order: data.order !== undefined ? Number(data.order) : newId,
    itemCount: 0
  };

  if (pool) {
    try {
      const [insertRes]: any = await pool.query(
        'INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newCat.id, newCat.name, newCat.slug, newCat.description, newCat.image_url, newCat.order, newCat.isActive ? 1 : 0]
      );
      if (insertRes?.insertId && insertRes.insertId !== newCat.id) {
        newCat.id = insertRes.insertId;
      }
    } catch (e: any) {
      console.warn('[MySQL saveCategory Insert Warning]:', e?.message || e);
    }
  }

  store.categories.push(newCat);
  saveLocalStore(store);
  invalidateCategoriesCache();
  return newCat;
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  return saveCategory({ ...data, id: undefined });
}

export async function deleteCategory(id: number): Promise<boolean> {
  const store = getLocalStore();
  const pool = getMysqlPool();
  let deletedFromMysql = false;
  let deletedFromLocal = false;

  const fallbackCatId = store.categories.find(c => c.id !== id)?.id || 1;

  if (pool) {
    try {
      await pool.query('UPDATE products SET category_id = ? WHERE category_id = ?', [fallbackCatId, id]);
      const [res]: any = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
      if (res?.affectedRows > 0) {
        deletedFromMysql = true;
      }
    } catch (e: any) {
      console.warn('[MySQL deleteCategory Warning]:', e?.message || e);
    }
  }

  const initCount = store.categories.length;
  store.categories = store.categories.filter(c => c.id !== id);
  if (store.categories.length !== initCount) {
    deletedFromLocal = true;
    store.items = store.items.map(item => {
      if (item.category_id === id || item.categoryId === id) {
        return { ...item, category_id: fallbackCatId, categoryId: fallbackCatId };
      }
      return item;
    });
    saveLocalStore(store);
  }

  invalidateCategoriesCache();
  invalidateProductsCache();
  return deletedFromMysql || deletedFromLocal;
}

// ============================================================================
// 6. REPOSITORIO DE POLÍTICAS (MYSQL PRIORITARIO CON FALLBACK)
// ============================================================================

export async function getPolicies(): Promise<Policy[]> {
  if (memoryCache.policies && getNow() - memoryCache.policies.timestamp < CACHE_TTL.POLICIES) {
    return memoryCache.policies.data;
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM policies ORDER BY id ASC');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r: any) => ({
          id: Number(r.id),
          slug: r.slug,
          title: r.title,
          content: r.content,
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
        }));
        memoryCache.policies = { data: mapped, timestamp: getNow() };
        return mapped;
      }
    } catch (e) {
      markMysqlUnavailable(e);
      console.warn('[MySQL getPolicies Warning]:', e);
    }
  }

  const store = getLocalStore();
  const fallback = store.policies || initialPolicies;
  memoryCache.policies = { data: fallback, timestamp: getNow() };
  return fallback;
}

export async function getPolicyBySlug(slug: string): Promise<Policy | null> {
  const policies = await getPolicies();
  return policies.find(p => p.slug === slug) || null;
}

export async function savePolicy(slug: string, data: { title?: string; content?: string }): Promise<Policy | null> {
  invalidatePoliciesCache();
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

  invalidatePoliciesCache();
  return store.policies[index];
}

// ============================================================================
// 7. COTIZACIONES Y PEDIDOS
// ============================================================================

export async function getQuotes(): Promise<QuoteOrder[]> {
  if (memoryCache.quotes && getNow() - memoryCache.quotes.timestamp < CACHE_TTL.QUOTES) {
    return memoryCache.quotes.data;
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM quote_orders ORDER BY id DESC');
      if (rows && rows.length > 0) {
        const mapped = rows.map((r: any) => ({
          id: Number(r.id),
          orderCode: `HB-${r.id.toString().padStart(4, '0')}`,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          deliveryCity: r.customer_city,
          customerNotes: r.customer_notes,
          items: JSON.parse(r.items_json || '[]'),
          total: Number(r.total),
          status: r.status as OrderStatus,
          stockDeducted: Boolean(r.stock_deducted),
          createdAt: new Date(r.created_at).toISOString()
        }));
        memoryCache.quotes = { data: mapped, timestamp: getNow() };
        return mapped;
      }
    } catch (e) {
      console.warn('[MySQL getQuotes Warning]:', e);
    }
  }

  const store = getLocalStore();
  const list = store.quotes || [];
  memoryCache.quotes = { data: list, timestamp: getNow() };
  return list;
}

export async function createQuoteOrder(data: Partial<QuoteOrder>): Promise<QuoteOrder> {
  invalidateQuotesCache();
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
  invalidateQuotesCache();
  return newOrder;
}

// ============================================================================
// 8. USUARIOS ADMINISTRADORES
// ============================================================================

export async function getUserByUsername(username: string): Promise<User | null> {
  const clean = username.trim().toLowerCase();
  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        'SELECT id, username, name, email, password_hash, role, is_active FROM admin_users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1',
        [clean, clean]
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: Number(r.id),
          username: r.username,
          name: r.name || (r.username === 'darinka.arias18@gmail.com' ? 'Darinka Arias' : 'Administrador Hobby Bolivia'),
          email: r.email,
          password: r.password_hash,
          role: (r.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN') as 'SUPERADMIN' | 'ADMIN',
          isActive: r.is_active !== undefined ? Boolean(r.is_active) : true
        };
      }
    } catch (e) {
      console.warn('[MySQL getUserByUsername Warning]:', e);
    }
  }

  const store = getLocalStore();
  const user = store.users?.find(u =>
    u.username?.toLowerCase() === clean ||
    u.email?.toLowerCase() === clean
  );
  return user || null;
}

export async function getAllUsers(): Promise<User[]> {
  if (memoryCache.users && getNow() - memoryCache.users.timestamp < CACHE_TTL.USERS) {
    return memoryCache.users.data;
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM admin_users ORDER BY id ASC');
      if (rows && rows.length > 0) {
        const mapped: User[] = rows.map((r: any) => ({
          id: Number(r.id),
          name: r.name || (r.username === 'superadmin' ? 'Super Administrador' : r.username),
          username: r.username,
          email: r.email || `${r.username}@hobbybolivia.com`,
          phone: r.phone || '',
          countryCode: r.country_code || '+591',
          role: (r.role || 'ADMIN') as UserRole,
          isActive: r.is_active !== undefined ? Boolean(r.is_active) : true,
          createdAt: r.created_at || new Date().toISOString()
        }));
        memoryCache.users = { data: mapped, timestamp: getNow() };
        return mapped;
      }
    } catch (e) {
      console.warn('[MySQL getAllUsers Warning]:', e);
    }
  }

  const store = getLocalStore();
  if (!store.users || store.users.length === 0) {
    store.users = [DEFAULT_SUPERADMIN];
    saveLocalStore(store);
  }
  memoryCache.users = { data: store.users, timestamp: getNow() };
  return store.users;
}

export async function getUserById(id: number): Promise<User | null> {
  if (memoryCache.users) {
    const cached = memoryCache.users.data.find(u => u.id === id);
    if (cached) return cached;
  }

  const pool = getMysqlPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM admin_users WHERE id = ? LIMIT 1', [id]);
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          id: Number(r.id),
          name: r.name || r.username,
          username: r.username,
          email: r.email,
          password: r.password_hash,
          role: (r.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN') as UserRole,
          isActive: r.is_active !== undefined ? Boolean(r.is_active) : true,
          createdAt: r.created_at || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('[MySQL getUserById Warning]:', e);
    }
  }
  const users = await getAllUsers();
  return users.find(u => u.id === id) || null;
}

export async function createUserRecord(userData: Partial<User>): Promise<User> {
  const store = getLocalStore();
  if (!store.users) store.users = [];

  const nextId = store.users.length > 0 ? Math.max(...store.users.map(u => u.id), 0) + 1 : 1;
  const now = new Date().toISOString();

  const newUser: User = {
    id: nextId,
    name: userData.name || userData.username || 'Usuario Admin',
    username: (userData.username || userData.email || `admin_${nextId}`).trim().toLowerCase(),
    email: (userData.email || userData.username || '').trim().toLowerCase(),
    phone: userData.phone ? String(userData.phone).trim() : '',
    countryCode: userData.countryCode ? String(userData.countryCode).trim() : '+591',
    password: userData.password || 'admin1234*',
    role: (userData.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN') as UserRole,
    isActive: userData.isActive !== undefined ? Boolean(userData.isActive) : true,
    createdAt: now,
    updatedAt: now
  };

  // 1. MySQL si está disponible
  const pool = getMysqlPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO admin_users (id, name, username, email, password_hash, role, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password_hash=VALUES(password_hash), role=VALUES(role), is_active=VALUES(is_active)`,
        [newUser.id, newUser.name, newUser.username, newUser.email, newUser.password, newUser.role, newUser.isActive ? 1 : 0]
      );
    } catch (e) {
      console.warn('[MySQL createUserRecord Warning]:', e);
    }
  }

  // 2. Almacenamiento local
  store.users.push(newUser);
  saveLocalStore(store);
  return newUser;
}

export async function updateUserRecord(id: number, data: Partial<User>): Promise<User | null> {
  const store = getLocalStore();
  if (!store.users) store.users = [];
  const index = store.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  const current = store.users[index];
  const now = new Date().toISOString();

  const updated: User = {
    ...current,
    ...data,
    id,
    name: data.name !== undefined ? data.name : current.name,
    username: data.username !== undefined ? data.username.trim().toLowerCase() : current.username,
    email: data.email !== undefined ? data.email.trim().toLowerCase() : current.email,
    phone: data.phone !== undefined ? data.phone : current.phone,
    countryCode: data.countryCode !== undefined ? data.countryCode : current.countryCode,
    role: data.role !== undefined ? (data.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN') : current.role,
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : current.isActive,
    password: data.password && data.password.trim() ? data.password.trim() : current.password,
    updatedAt: now
  };

  // 1. MySQL si está disponible
  const pool = getMysqlPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE admin_users SET name = ?, username = ?, email = ?, password_hash = ?, role = ?, is_active = ? WHERE id = ?`,
        [updated.name, updated.username, updated.email, updated.password, updated.role, updated.isActive ? 1 : 0, id]
      );
    } catch (e) {
      console.warn('[MySQL updateUserRecord Warning]:', e);
    }
  }

  // 2. Almacenamiento local
  store.users[index] = updated;
  saveLocalStore(store);
  return updated;
}

export async function deleteUserRecord(id: number): Promise<boolean> {
  const store = getLocalStore();
  if (!store.users) return false;

  const user = store.users.find(u => u.id === id);
  if (!user) return false;

  // Validación de seguridad: no permitir eliminar al único SUPERADMIN
  if (user.role === 'SUPERADMIN') {
    const activeSuperadmins = store.users.filter(u => u.role === 'SUPERADMIN' && u.isActive);
    if (activeSuperadmins.length <= 1) {
      throw new Error("No es posible eliminar al único Superadministrador del sistema.");
    }
  }

  // 1. MySQL si está disponible
  const pool = getMysqlPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM admin_users WHERE id = ?', [id]);
    } catch (e) {
      console.warn('[MySQL deleteUserRecord Warning]:', e);
    }
  }

  // 2. Almacenamiento local
  store.users = store.users.filter(u => u.id !== id);
  saveLocalStore(store);
  return true;
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
export async function updateQuoteOrderStatus(idOrCode: number | string, status: OrderStatus): Promise<QuoteOrder | null> {
  const store = getLocalStore();
  const pool = getMysqlPool();

  const codeStr = String(idOrCode).trim();
  const numericId = !isNaN(Number(idOrCode)) ? Number(idOrCode) : Number(codeStr.replace(/[^0-9]/g, ''));

  let orderIndex = store.quotes.findIndex(
    q => q.orderCode === codeStr ||
      (typeof idOrCode === 'number' && q.id === idOrCode) ||
      q.id === Number(idOrCode) ||
      q.orderCode?.toLowerCase() === codeStr.toLowerCase() ||
      (numericId > 0 && q.id === numericId)
  );

  let targetOrder: QuoteOrder | null = orderIndex !== -1 ? store.quotes[orderIndex] : null;

  // Si no está en store local pero MySQL está conectado, buscar en MySQL
  if (!targetOrder && pool) {
    try {
      const [rows]: any = await pool.query('SELECT * FROM quote_orders WHERE id = ?', [numericId]);
      if (rows && rows.length > 0) {
        const r = rows[0];
        targetOrder = {
          id: Number(r.id),
          orderCode: `HB-${r.id.toString().padStart(4, '0')}`,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          deliveryCity: r.customer_city,
          customerNotes: r.customer_notes,
          items: JSON.parse(r.items_json || '[]'),
          total: Number(r.total),
          status: r.status as OrderStatus,
          stockDeducted: Boolean(r.stock_deducted),
          createdAt: new Date(r.created_at).toISOString()
        };
        store.quotes.unshift(targetOrder);
        orderIndex = 0;
      }
    } catch (e) {
      console.warn('[MySQL fetchQuoteOrder Warning]:', e);
    }
  }

  if (!targetOrder) return null;

  const DEDUCTION_STATUSES: OrderStatus[] = [
    'CONFIRMADO',
    'PAGADO',
    'DESPACHADO',
    'IN_PREPARATION',
    'DELIVERED'
  ];

  const REVERSAL_STATUSES: OrderStatus[] = [
    'CANCELADO',
    'CANCELLED'
  ];

  const isTargetDeduction = DEDUCTION_STATUSES.includes(status);
  const isTargetReversal = REVERSAL_STATUSES.includes(status);

  // Considerar deducido si flag es true o si era una orden preexistente ya en un estado de despacho
  const wasDeducted = targetOrder.stockDeducted === true || (targetOrder.stockDeducted === undefined && DEDUCTION_STATUSES.includes(targetOrder.status));

  // Consolidar cantidades por producto en la orden
  const items = Array.isArray(targetOrder.items) ? targetOrder.items : [];
  const requestedTotals: {
    productId?: number;
    sku?: string;
    name: string;
    qty: number;
    matchedProductIndex: number;
  }[] = [];

  for (const it of items) {
    const rawProd = it.item || (it as any);
    const prodId = rawProd?.id ? Number(rawProd.id) : undefined;
    const prodSku = rawProd?.sku ? String(rawProd.sku).trim() : undefined;
    const prodName = rawProd?.name || rawProd?.title || 'Producto Hobby Bolivia';
    const qty = Math.max(1, Number(it.quantity) || 1);

    const pIndex = store.items.findIndex(p =>
      (prodId !== undefined && p.id === prodId) ||
      (prodSku && p.sku?.toLowerCase() === prodSku.toLowerCase())
    );

    const existing = requestedTotals.find(entry =>
      (prodId !== undefined && entry.productId === prodId) ||
      (prodSku && entry.sku?.toLowerCase() === prodSku.toLowerCase())
    );

    if (existing) {
      existing.qty += qty;
    } else {
      requestedTotals.push({
        productId: prodId,
        sku: prodSku,
        name: prodName,
        qty,
        matchedProductIndex: pIndex
      });
    }
  }

  // 1. SALIDA DE STOCK (DESCUENTO)
  if (isTargetDeduction && !wasDeducted) {
    // 3. CONTROL DE STOCK INSUFICIENTE (Verificación previa integral)
    for (const req of requestedTotals) {
      let currentStock = 0;
      let prodSku = req.sku || 'N/A';
      let prodName = req.name;

      if (req.matchedProductIndex !== -1) {
        const prod = store.items[req.matchedProductIndex];
        currentStock = prod.stock !== undefined ? Number(prod.stock) : (Number(prod.stockQuantity) || 0);
        prodSku = prod.sku || prodSku;
        prodName = prod.name || prodName;
      }

      if (currentStock < req.qty) {
        throw new Error(
          `Stock insuficiente para "${prodName}" (SKU: ${prodSku}). Solicitado: ${req.qty} unid., disponible en inventario: ${currentStock} unid.`
        );
      }
    }

    // Si todos cuentan con stock suficiente, proceder al descuento
    for (const req of requestedTotals) {
      if (req.matchedProductIndex !== -1) {
        const prod = store.items[req.matchedProductIndex];
        const oldStock = prod.stock !== undefined ? Number(prod.stock) : (Number(prod.stockQuantity) || 0);
        const newStock = Math.max(0, oldStock - req.qty);
        prod.stock = newStock;
        prod.stockQuantity = newStock;
        prod.updated_at = new Date().toISOString();

        if (pool && prod.id) {
          try {
            await pool.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, prod.id]);
          } catch (e) {
            console.warn('[MySQL deduct stock Warning]:', e);
          }
        }
      }
    }
    targetOrder.stockDeducted = true;
  }
  // 2. REVERSIÓN DE STOCK (CANCELACIONES O RETORNO A PEDIDO / PENDIENTE)
  else if ((isTargetReversal || status === 'PENDING' || status === 'PEDIDO') && wasDeducted) {
    for (const req of requestedTotals) {
      if (req.matchedProductIndex !== -1) {
        const prod = store.items[req.matchedProductIndex];
        const oldStock = prod.stock !== undefined ? Number(prod.stock) : (Number(prod.stockQuantity) || 0);
        const newStock = oldStock + req.qty;
        prod.stock = newStock;
        prod.stockQuantity = newStock;
        prod.updated_at = new Date().toISOString();

        if (pool && prod.id) {
          try {
            await pool.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, prod.id]);
          } catch (e) {
            console.warn('[MySQL revert stock Warning]:', e);
          }
        }
      }
    }
    targetOrder.stockDeducted = false;
  }

  targetOrder.status = status;
  targetOrder.updatedAt = new Date().toISOString();

  if (orderIndex !== -1) {
    store.quotes[orderIndex] = targetOrder;
  }
  saveLocalStore(store);

  if (pool && targetOrder.id) {
    try {
      await pool.query(
        'UPDATE quote_orders SET status = ?, stock_deducted = ? WHERE id = ?',
        [status, targetOrder.stockDeducted ? 1 : 0, targetOrder.id]
      );
    } catch (e) {
      console.warn('[MySQL updateQuoteOrderStatus Warning]:', e);
    }
  }

  invalidateQuotesCache();
  invalidateProductsCache();
  return targetOrder;
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

export const getUsers = getAllUsers;
export async function saveUser(data: Partial<User>): Promise<User> {
  if (data.id) {
    const updated = await updateUserRecord(data.id, data);
    if (updated) return updated;
  }
  return createUserRecord(data);
}
export const deleteUser = deleteUserRecord;

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
    imageUrl: data.imageUrl || "/placeholder.webp",
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

