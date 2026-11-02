import fs from 'fs';
import path from 'path';
import { initialProducts, initialCategories, initialPolicies } from '../src/lib/initial-data';

function escapeSql(str: string | null | undefined): string {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\r/g, '\\r').replace(/\n/g, '\\n')}'`;
}

function generateSql(): string {
  const dbJsonPath = path.join(__dirname, '..', '.data', 'db.json');
  let categories = initialCategories;
  let products = initialProducts;
  let policies = initialPolicies;

  if (fs.existsSync(dbJsonPath)) {
    try {
      const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
      if (dbData.categories && dbData.categories.length > 0) categories = dbData.categories;
      if (dbData.items && dbData.items.length > 0) products = dbData.items;
      if (dbData.policies && dbData.policies.length > 0) policies = dbData.policies;
    } catch {
      // Usar defaults si falla parse
    }
  }

  let sql = `-- ============================================================================
-- BASE DE DATOS MYSQL / MARIADB PARA HOSTING - HOBBY BOLIVIA
-- Compatible con cPanel / Plesk / phpMyAdmin / MySQL 5.7+ / MariaDB 10.3+
-- Sincronizado con todos los ${products.length} productos, ${categories.length} categorías y políticas oficiales
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ----------------------------------------------------------------------------
-- 1. TABLA: categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`categories\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL UNIQUE,
  \`description\` TEXT NULL,
  \`image_url\` VARCHAR(500) NULL,
  \`display_order\` INT NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_categories_slug\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. TABLA: products
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`products\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`sku\` VARCHAR(100) NOT NULL UNIQUE,
  \`name\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL,
  \`category_id\` INT UNSIGNED NOT NULL,
  \`scale\` VARCHAR(100) DEFAULT 'RC Estándar',
  \`material\` VARCHAR(100) DEFAULT 'Compuesto',
  \`specs_line\` VARCHAR(255) NOT NULL,
  \`compatible_models\` TEXT NULL,
  \`price\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`price_usd\` DECIMAL(10,2) NULL,
  \`old_price\` DECIMAL(10,2) NULL,
  \`stock\` INT NOT NULL DEFAULT 0,
  \`badge\` VARCHAR(100) NULL,
  \`image_url\` VARCHAR(500) NOT NULL,
  \`image_size_bytes\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`brand\` VARCHAR(100) DEFAULT 'Hobby Bolivia',
  \`description\` TEXT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_products_category\` (\`category_id\`),
  INDEX \`idx_products_sku\` (\`sku\`),
  INDEX \`idx_products_scale\` (\`scale\`),
  INDEX \`idx_products_material\` (\`material\`),
  INDEX \`idx_products_active\` (\`is_active\`),
  CONSTRAINT \`fk_products_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. TABLA: policies
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`policies\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`slug\` VARCHAR(100) NOT NULL UNIQUE,
  \`title\` VARCHAR(255) NOT NULL,
  \`content\` MEDIUMTEXT NOT NULL,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. TABLA: admin_users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`admin_users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL DEFAULT 'Administrador Hobby Bolivia',
  \`username\` VARCHAR(100) NOT NULL UNIQUE,
  \`email\` VARCHAR(255) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. TABLA: quote_orders
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`quote_orders\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`customer_name\` VARCHAR(255) NOT NULL,
  \`customer_phone\` VARCHAR(50) NOT NULL,
  \`customer_city\` VARCHAR(100) NOT NULL,
  \`customer_notes\` TEXT NULL,
  \`items_json\` LONGTEXT NOT NULL,
  \`total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  \`stock_deducted\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- VACIADO PREVENTIVO PARA IMPORTACIÓN LIMPIA
-- ----------------------------------------------------------------------------
DELETE FROM \`quote_orders\`;
DELETE FROM \`products\`;
DELETE FROM \`categories\`;
DELETE FROM \`policies\`;
DELETE FROM \`admin_users\`;

-- ----------------------------------------------------------------------------
-- POBLACIÓN: categories (${categories.length} CATEGORÍAS)
-- ----------------------------------------------------------------------------
INSERT INTO \`categories\` (\`id\`, \`name\`, \`slug\`, \`description\`, \`image_url\`, \`display_order\`, \`is_active\`) VALUES
`;

  const catValues = categories.map((c: any) => {
    return `(${c.id}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${escapeSql(c.description || '')}, ${escapeSql(c.image_url || c.imageUrl || '')}, ${c.order || c.display_order || c.id}, ${c.isActive !== false && c.is_active !== false ? 1 : 0})`;
  }).join(',\n');

  sql += catValues + ';\n\n';

  sql += `-- ----------------------------------------------------------------------------
-- POBLACIÓN: products (${products.length} PRODUCTOS CON PRECIOS EN USD Y BS.)
-- ----------------------------------------------------------------------------
INSERT INTO \`products\` (\`id\`, \`sku\`, \`name\`, \`slug\`, \`category_id\`, \`scale\`, \`material\`, \`specs_line\`, \`compatible_models\`, \`price\`, \`price_usd\`, \`old_price\`, \`stock\`, \`badge\`, \`image_url\`, \`image_size_bytes\`, \`is_active\`, \`brand\`, \`description\`) VALUES
`;

  const prodValues = products.map((p: any) => {
    const priceUsd = p.price_usd !== undefined && p.price_usd !== null
      ? Number(p.price_usd).toFixed(2)
      : (p.priceUsd !== undefined && p.priceUsd !== null ? Number(p.priceUsd).toFixed(2) : 'NULL');
    const imageUrl = p.image_url || p.imageUrl || (p.images && p.images[0]) || '/placeholder.webp';
    const isActive = p.is_active !== undefined ? (p.is_active ? 1 : 0) : (p.isActive !== undefined ? (p.isActive ? 1 : 0) : 1);
    const stockVal = p.stock !== undefined ? Number(p.stock) : (p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0);

    return `(${p.id}, ${escapeSql(p.sku)}, ${escapeSql(p.name || p.title)}, ${escapeSql(p.slug)}, ${p.category_id || p.categoryId || 1}, ${escapeSql(p.scale || 'RC Estándar')}, ${escapeSql(p.material || 'Compuesto')}, ${escapeSql(p.specs_line || '')}, ${escapeSql(p.compatible_models || '')}, ${Number(p.price).toFixed(2)}, ${priceUsd}, ${p.old_price ? Number(p.old_price).toFixed(2) : 'NULL'}, ${stockVal}, ${escapeSql(p.badge || null)}, ${escapeSql(imageUrl)}, ${p.image_size_bytes || 0}, ${isActive}, ${escapeSql(p.brand || 'Hobby Bolivia')}, ${escapeSql(p.description || '')})`;
  }).join(',\n');

  sql += prodValues + ';\n\n';

  sql += `-- ----------------------------------------------------------------------------
-- POBLACIÓN: policies (${policies.length} POLÍTICAS DE HOBBY BOLIVIA)
-- ----------------------------------------------------------------------------
INSERT INTO \`policies\` (\`id\`, \`slug\`, \`title\`, \`content\`) VALUES
`;

  const polValues = policies.map((pol: any) => {
    return `(${pol.id}, ${escapeSql(pol.slug)}, ${escapeSql(pol.title)}, ${escapeSql(pol.content)})`;
  }).join(',\n');

  sql += polValues + ';\n\n';

  sql += `-- ----------------------------------------------------------------------------
-- POBLACIÓN: admin_users (USUARIOS DE ACCESO ADMINISTRATIVO)
-- ----------------------------------------------------------------------------
INSERT INTO \`admin_users\` (\`id\`, \`name\`, \`username\`, \`email\`, \`password_hash\`, \`role\`, \`is_active\`) VALUES
(1, 'Darinka Arias', 'darinka.arias18@gmail.com', 'darinka.arias18@gmail.com', 'superadmin1234*', 'SUPERADMIN', 1),
(2, 'Administrador Hobby Bolivia', 'dariasdigital_hobbybolivia', 'admin@hobbybolivia.com', 'Imp6fSMr2%mj0w?v', 'SUPERADMIN', 1);

SET FOREIGN_KEY_CHECKS = 1;
`;

  return sql;
}

const outputPath = path.join(__dirname, '..', 'database', 'hobby_bolivia_hosting.sql');
fs.writeFileSync(outputPath, generateSql(), 'utf8');
console.log('Successfully generated:', outputPath);
