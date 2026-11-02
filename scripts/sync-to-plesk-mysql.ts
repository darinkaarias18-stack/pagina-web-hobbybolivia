import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('=== INICIANDO SINCRONIZACIÓN COMPLETA A PLESK MYSQL ===');

  const dbJsonPath = path.join(process.cwd(), '.data', 'db.json');
  if (!fs.existsSync(dbJsonPath)) {
    throw new Error(`No se encontró el archivo de datos en ${dbJsonPath}`);
  }

  const raw = fs.readFileSync(dbJsonPath, 'utf8');
  const dbData = JSON.parse(raw);

  const categories = dbData.categories || [];
  const items = dbData.items || [];
  const policies = dbData.policies || [];

  console.log(`Datos leídos de .data/db.json:`);
  console.log(` - Categorías: ${categories.length}`);
  console.log(` - Productos: ${items.length}`);
  console.log(` - Políticas: ${policies.length}`);

  const conn = await mysql.createConnection({
    host: '50.30.32.59',
    port: 3306,
    user: 'dariasdigital_hobbybolivia',
    password: 'Imp6fSMr2%mj0w?v',
    database: 'dariasdigital_hobbybolivia'
  });

  console.log('Conexión establecida con éxito con 50.30.32.59 (dariasdigital_hobbybolivia).');

  // 1. Desactivar validación de Foreign Keys temporalmente
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  // 2. Asegurar que la columna price_usd exista en products
  const [cols]: any = await conn.query("SHOW COLUMNS FROM products LIKE 'price_usd'");
  if (cols.length === 0) {
    console.log("Agregando columna 'price_usd' a la tabla products...");
    await conn.query("ALTER TABLE products ADD COLUMN price_usd DECIMAL(10,2) NULL AFTER price");
    console.log("Columna 'price_usd' agregada exitosamente.");
  } else {
    console.log("Columna 'price_usd' ya existe en products.");
  }

  // 3. Truncar tablas para sincronización limpia de 185 productos y 11 categorías
  console.log('Limpiando tablas products y categories anteriores...');
  await conn.query('TRUNCATE TABLE products');
  await conn.query('TRUNCATE TABLE categories');
  await conn.query('TRUNCATE TABLE policies');

  // 4. Insertar las 11 categorías
  console.log(`Insertando ${categories.length} categorías...`);
  for (const cat of categories) {
    await conn.query(
      `INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        cat.id,
        cat.name,
        cat.slug,
        cat.description || '',
        cat.image_url || cat.imageUrl || '',
        cat.order || cat.display_order || cat.id,
        cat.isActive !== false && cat.is_active !== false ? 1 : 0
      ]
    );
  }
  console.log(`Categorías insertadas: ${categories.length}`);

  // 5. Insertar los 185 productos
  console.log(`Insertando ${items.length} productos con precios en USD y Bs. sin recálculo...`);
  for (const p of items) {
    const catId = p.category_id || p.categoryId || 1;
    const priceBs = Number(p.price) || 0;
    const priceUsd = (p.price_usd !== undefined && p.price_usd !== null)
      ? Number(p.price_usd)
      : ((p.priceUsd !== undefined && p.priceUsd !== null) ? Number(p.priceUsd) : null);
    
    const imageUrl = p.image_url || p.imageUrl || (p.images && p.images[0]) || '/placeholder.webp';
    const isActive = (p.is_active !== undefined)
      ? (p.is_active ? 1 : 0)
      : ((p.isActive !== undefined) ? (p.isActive ? 1 : 0) : 1);

    await conn.query(
      `INSERT INTO products (
        id, sku, name, slug, category_id, scale, material, specs_line,
        compatible_models, price, price_usd, old_price, stock, badge,
        image_url, image_size_bytes, is_active, brand, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.sku,
        p.name || p.title,
        p.slug,
        catId,
        p.scale || 'RC Estándar',
        p.material || 'Compuesto',
        p.specs_line || '',
        p.compatible_models || '',
        priceBs,
        priceUsd,
        p.old_price ? Number(p.old_price) : null,
        p.stock !== undefined ? Number(p.stock) : (p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0),
        p.badge || null,
        imageUrl,
        p.image_size_bytes || 0,
        isActive,
        p.brand || 'Hobby Bolivia',
        p.description || ''
      ]
    );
  }
  console.log(`Productos insertados: ${items.length}`);

  // 6. Insertar políticas
  console.log(`Insertando ${policies.length} políticas...`);
  for (const pol of policies) {
    await conn.query(
      `INSERT INTO policies (id, slug, title, content)
       VALUES (?, ?, ?, ?)`,
      [pol.id, pol.slug, pol.title, pol.content]
    );
  }

  // 7. Asegurar administradores
  console.log('Verificando usuarios administradores...');
  await conn.query(`
    INSERT INTO admin_users (id, name, username, email, password_hash, role, is_active)
    VALUES (1, 'Darinka Arias', 'darinka.arias18@gmail.com', 'darinka.arias18@gmail.com', 'superadmin1234*', 'SUPERADMIN', 1),
           (2, 'Administrador Hobby Bolivia', 'dariasdigital_hobbybolivia', 'admin@hobbybolivia.com', 'Imp6fSMr2%mj0w?v', 'SUPERADMIN', 1)
    ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), role=VALUES(role), password_hash=VALUES(password_hash), is_active=1
  `);

  // 8. Reactivar Foreign Keys
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  // 9. Verificación de conteos
  const [prodCount]: any = await conn.query('SELECT COUNT(*) as cnt FROM products');
  const [catCount]: any = await conn.query('SELECT COUNT(*) as cnt FROM categories');
  const [activeProdCount]: any = await conn.query('SELECT COUNT(*) as cnt FROM products WHERE is_active = 1');
  const [usdProdCount]: any = await conn.query('SELECT COUNT(*) as cnt FROM products WHERE price_usd IS NOT NULL');

  console.log('\n=== RESULTADOS DE VERIFICACIÓN EN PLESK MYSQL ===');
  console.log(`Total Productos en BD: ${prodCount[0].cnt} (esperados: ${items.length})`);
  console.log(`Total Productos con price_usd: ${usdProdCount[0].cnt}`);
  console.log(`Total Productos activos: ${activeProdCount[0].cnt}`);
  console.log(`Total Categorías en BD: ${catCount[0].cnt} (esperadas: ${categories.length})`);

  // Mostrar muestra de 3 productos
  const [samples]: any = await conn.query('SELECT id, sku, name, price, price_usd, category_id, is_active FROM products LIMIT 3');
  console.log('\nMuestra de productos insertados en MySQL:');
  console.table(samples);

  await conn.end();
  console.log('\n¡SINCRONIZACIÓN EXITOSA Y COMPLETA!');
}

main().catch(err => {
  console.error('Error fatal durante la sincronización:', err);
  process.exit(1);
});

