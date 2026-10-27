-- ============================================================================
-- BASE DE DATOS MYSQL PARA "HOBBY BOLIVIA"
-- Plataforma E-Commerce de Repuestos y Accesorios para Aviones a Escala
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `dariasdigital_hobbybolivia` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `dariasdigital_hobbybolivia`;

-- 1. TABLA: categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `image_url` VARCHAR(500) NULL,
  `description` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: products
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(60) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `category_id` INT UNSIGNED NOT NULL,
  `scale` VARCHAR(60) NOT NULL DEFAULT 'RC Estándar',
  `material` VARCHAR(100) NOT NULL DEFAULT 'Compuesto',
  `specs_line` VARCHAR(255) NOT NULL,
  `compatible_models` TEXT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `old_price` DECIMAL(10, 2) NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `badge` ENUM('Best Seller', 'Nuevo', 'Popular', 'Pocas Unidades', 'Oferta') NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `brand` VARCHAR(100) NULL DEFAULT 'Hobby Bolivia',
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_sku` (`sku`),
  INDEX `idx_products_scale` (`scale`),
  INDEX `idx_products_material` (`material`),
  INDEX `idx_products_price` (`price`),
  INDEX `idx_products_active` (`is_active`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: policies
CREATE TABLE IF NOT EXISTS `policies` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(60) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_policies_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: site_config
CREATE TABLE IF NOT EXISTS `site_config` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(150) NOT NULL DEFAULT 'Hobby Bolivia',
  `domain` VARCHAR(255) NOT NULL DEFAULT 'https://hobbybolivia.com',
  `logo_url` VARCHAR(500) NULL,
  `primary_color` VARCHAR(20) NOT NULL DEFAULT '#2563EB',
  `secondary_color` VARCHAR(20) NOT NULL DEFAULT '#0F172A',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'Bs.',
  `whatsapp_number` VARCHAR(30) NOT NULL DEFAULT '+591 77293446',
  `top_bar_text` VARCHAR(300) NOT NULL DEFAULT 'Hobby Bolivia: Repuestos y componentes de precisión para aviones a escala | Envíos seguros a toda Bolivia',
  `contact_email` VARCHAR(150) NOT NULL DEFAULT 'contacto@hobbybolivia.com',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: quote_orders (Pedidos y Cotizaciones con Detalle para WhatsApp)
CREATE TABLE IF NOT EXISTS `quote_orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_code` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(40) NOT NULL,
  `delivery_city` VARCHAR(80) NOT NULL DEFAULT 'Santa Cruz',
  `delivery_address` TEXT NOT NULL,
  `customer_notes` TEXT NULL,
  `items_json` JSON NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('PENDING', 'IN_PREPARATION', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- DATOS SEMILLA (INITIAL SEED DATA)
-- ============================================================================

-- Inserción de Categorías
INSERT INTO `categories` (`id`, `name`, `slug`, `image_url`, `description`, `display_order`) VALUES
(1, 'Conectores y Línea de Control', 'conectores-y-linea-de-control', 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp', 'Conectores E/Z, bellcranks, clevises mecánicos y accesorios de mando de máxima precisión.', 1),
(2, 'Varillaje y Alambres', 'varillaje-y-alambres', 'https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp', 'Alambres push rod de acero templado con rosca métrica, 2-56 y 4-40 para mandos de alerón y timón.', 2),
(3, 'Motores y Propulsión', 'motores-y-propulsion', 'https://images.unsplash.com/photo-1559819614-81fea9ef7080?auto=format&fit=crop&w=600&q=80', 'Motores brushless outrunner de alto torque y variadores de velocidad ESC programables.', 3),
(4, 'Hélices y Spinners', 'helices-y-spinners', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', 'Hélices APC balanceadas, fibra de carbono y spinners torneados en aluminio aeroespacial CNC.', 4),
(5, 'Servos y Electrónica', 'servos-y-electronica', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 'Micro servos con piñonería metálica de bronce y receptores 2.4GHz multi-canal de largo alcance.', 5),
(6, 'Trenes de Aterrizaje', 'trenes-de-aterrizaje', 'https://images.unsplash.com/photo-1517976487507-5b3b48855a82?auto=format&fit=crop&w=600&q=80', 'Trenes principales en fibra de carbono 3K y ruedas ligeras de absorción de impacto.', 6),
(7, 'Baterías y Conectores', 'baterias-y-conectores', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', 'Packs LiPo 3S de alta descarga con conectores dorados XT60 y cables siliconados.', 7),
(8, 'Estructuras y Materiales', 'estructuras-y-materiales', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80', 'Tubos de fibra de carbono pultruidos, perfiles de refuerzo y bisagras de nylon para alas.', 8)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `image_url` = VALUES(`image_url`), `description` = VALUES(`description`);

-- Inserción de Políticas
INSERT INTO `policies` (`id`, `slug`, `title`, `content`) VALUES
(1, 'envios', 'Política de Envíos y Embalaje Frágil', 'Despachos diarios a Santa Cruz (mismo día/24h) y a nivel nacional (La Paz, Cochabamba, Sucre, Tarija, Oruro, Potosí, Beni, Pando) por flota o courier. Las varillas y repuestos delicados viajan en tubos rígidos protectores de PVC.'),
(2, 'devoluciones', 'Política de Cambios y Devoluciones', '7 días calendario para cambio por incompatibilidad de rosca o medida. El producto debe conservarse nuevo en su empaque original.'),
(3, 'garantias', 'Garantía de Componentes Electrónicos', 'Distribución autorizada de Dubro, Great Planes, APC y componentes certificados. Cobertura de 30 días contra defectos de manufactura.'),
(4, 'privacidad', 'Política de Privacidad y Tratamiento de Datos', 'Uso confidencial de datos únicamente para la facturación y el rotulado logístico de encomiendas.')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `content` = VALUES(`content`);

-- Inserción de Productos
INSERT INTO `products` (`id`, `sku`, `name`, `slug`, `category_id`, `scale`, `material`, `specs_line`, `compatible_models`, `price`, `old_price`, `stock`, `badge`, `image_url`, `brand`, `description`) VALUES
(1, 'DUBQ3570', 'Conectores E/Z Dubro (12)', 'conectores-e-z-dubro-12', 1, 'RC Estándar', 'Aluminio CNC / Latón', 'Paso Alambre hasta 2mm | Prisionero Allen | 12 Pcs', 'Aviones RC Glow, Eléctricos y Drones', 220.00, 245.00, 15, 'Best Seller', 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp', 'Dubro', '12 conectores E/Z originales Dubro. El estándar de oro en aeromodelismo para acoplar varillas a brazos de servo de forma segura.'),
(2, 'DUBQ8450', 'Conector Mini E/Z (2) Dubro', 'conector-mini-e-z-2-dubro', 1, 'Micro / 1:32', 'Aluminio Ligero', 'Varilla 1.0mm - 1.5mm | Micro Servos | 2 Pcs', 'Park Flyers, Planeadores Micro y Drones FPV', 40.00, NULL, 24, 'Nuevo', 'https://hobbybolivia.com/media/products/19df1961af-dubq8450-t.webp', 'Dubro', 'Pack de 2 conectores Mini E/Z Dubro diseñados especialmente para micro servos y varillajes delgados.'),
(3, 'DUBQ2000', 'Bellcrank 90º Standard de Plástico Dubro', 'bellcrank-90o-standard-de-plastico-dubro', 1, 'RC Estándar / 1:10', 'Nylon Compuesto + Casquillo Bronce', 'Ángulo 90° | Buje de Latón Antifricción | Incluye Tornillo', 'Alerones dobles, Flaps y Trenes Retráctiles', 25.00, 30.00, 18, 'Popular', 'https://hobbybolivia.com/media/products/d315fa511a-dubq2000tn-t.webp', 'Dubro', 'Bellcrank de 90º estándar fabricado en nylon de alto impacto Dubro con casquillos de bronce.'),
(4, 'AIB62993', 'Alambre de Push Rod con Rosca 2mm (2) y 4 Clevises', 'alambre-de-push-road-con-rosca-2-mm-2-y-4-clevises', 2, 'RC Estándar / 1:10', 'Acero Templado Zincado', 'Rosca Métrica 2mm | Longitud 300mm | 4 Clevises Metálicos', 'Alerones, Profundidad y Timón de Dirección', 30.00, NULL, 22, 'Best Seller', 'https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp', 'Dubro', 'Set completo de 2 varillas de alambre push rod con rosca métrica de 2 mm y 4 clevises metálicos.'),
(5, 'GPMQ3741', 'Alambre con Rosca Completa 2-56 de 12" Great Planes', 'alambre-con-rosca-completa-2-56-de-12-great-planes', 2, 'RC Estándar', 'Acero Templado', 'Rosca Continua 2-56 | Longitud 12" (305mm) | Rigidez Superior', 'Modelos a escala, entrenadores .40-.46 y acrobáticos', 20.00, 25.00, 19, 'Popular', 'https://hobbybolivia.com/media/products/c2253e5048-gpmq3741-t.webp', 'Great Planes', 'Varilla de alambre de acero con rosca continua 2-56 en sus 12 pulgadas de largo.'),
(6, 'DUBQ1474', 'Alambre con Rosca 4-40 en un Solo Extremo 12"', 'alambre-con-rosca-4-40-en-un-solo-extremo-12', 2, 'Aviones Grandes / 1:10', 'Acero Templado Grueso', 'Rosca 4-40 Heavy Duty | Longitud 12" | Cero Deflexión', 'Aviones Gigantes 50cc-100cc, Jets y Acrobáticos 3D', 15.00, NULL, 28, NULL, 'https://hobbybolivia.com/media/products/7f5b761d4f-dubq1474-large-t.webp', 'Dubro', 'Varilla de control rígida de 12 pulgadas con rosca 4-40 en un extremo.'),
(7, 'DUBQ1464', 'Alambre con Rosca 2-56 en un Solo Extremo 12"', 'alambre-con-rosca-2-56-en-un-solo-extremo-12', 2, 'RC Estándar', 'Acero Templado', 'Rosca 2-56 | Longitud 12" | Acabado Brillante', 'Mandos de servo estándar y bocinas de control', 12.00, NULL, 35, NULL, 'https://hobbybolivia.com/media/products/7f5b761d4f-dubq1464-large-t.webp', 'Dubro', 'Alambre acerado de control de 12 pulgadas con rosca 2-56 en un extremo.'),
(8, 'DUBQ9306', 'Alambre 4-40 de 12" de Largo con Clevis', 'alambre-4-40-de-12-de-largo-con-clevis', 2, 'Aviones Grandes / 1:10', 'Acero Templado + Nylon Reforzado', 'Rosca 4-40 | Incluye Clevis de Seguridad | 12 Pulgadas', 'Aviones medianos, grandes y modelos sport', 26.00, 32.00, 14, 'Pocas Unidades', 'https://hobbybolivia.com/media/products/7fcaad4571-dubq9306-large-t.webp', 'Dubro', 'Varilla de control 4-40 de 12 pulgadas con clevis de nylon/acero reforzado incluido.'),
(9, 'DUBQ9108', 'Alambre 2-56 de 12" de Largo con Clevis', 'alambre-2-56-de-12-de-largo-con-clevis', 2, 'RC Estándar', 'Acero + Clevis Dubro', 'Rosca 2-56 | Clevis Preensamblado | 12 Pulgadas', 'Modelos .25 a .60 y planeadores eléctricos', 18.00, NULL, 25, 'Popular', 'https://hobbybolivia.com/media/products/ac56aa1747-dubq9108-large-t.webp', 'Dubro', 'Varilla de alambre 2-56 de 12 pulgadas con clevis Dubro prearmado.'),
(10, 'DUBQ2005', '90º Bellcrank Micro de Plástico Dubro', '90o-bellcrank-micro-de-plastico-dubro', 1, 'Micro / 1:48', 'Nylon Ultraligero', 'Ángulo 90° Micro | Peso 1.2g | Para Espacios Reducidos', 'Fuselajes delgados, micro alerones y alas volantes', 24.00, NULL, 19, 'Nuevo', 'https://hobbybolivia.com/media/products/586ddc4ce2-dubq2005-large-t.webp', 'Dubro', 'Micro bellcrank de 90 grados en material plástico ultraligero y resistente Dubro.'),
(11, 'MOT-2212-1400', 'Motor Brushless A2212 1400KV Outrunner con Accesorios', 'motor-brushless-a2212-1400kv-outrunner', 3, 'RC Estándar / Park Flyer', 'Aluminio CNC / Cobre Esmaltado', '1400KV | 2-3S LiPo | Eje 3.17mm | Empuje 850g', 'Aviones Cessna 182, Ala Volante ZOHD y Entrenadores', 110.00, 130.00, 16, 'Best Seller', 'https://images.unsplash.com/photo-1559819614-81fea9ef7080?auto=format&fit=crop&w=600&q=80', 'XXD Power', 'Motor sin escobillas outrunner de 1400KV de alta eficiencia para aeromodelismo.'),
(12, 'ESC-30A-BEC', 'Variador de Velocidad Electrónico ESC 30A con BEC 5V/2A', 'variador-esc-30a-con-bec', 3, 'RC Estándar', 'Compuesto PCB / Disipador Aluminio', '30A Continuo (40A Burst) | BEC 5V/2A | Conector XT60', 'Aviones a escala, planeadores eléctricos y motoveleros', 85.00, 95.00, 20, 'Popular', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', 'Hobbywing Tech', 'Controlador de velocidad programable con freno de hélice automático para planeadores.'),
(13, 'APC-09060E', 'Hélice APC 9x6 Thin Electric E-Series Balanceada', 'helice-apc-9x6-thin-electric', 4, 'RC Estándar / 1:10', 'Compuesto Poliamida Reforzado', '9x6 Pulgadas | Giro Horario (Tractor) | Bujes Adaptadores', 'Motores 2212 1400KV, Aviones Trainer y Sport', 38.00, NULL, 30, 'Best Seller', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', 'APC Propellers', 'Hélice de alta eficiencia aerodinámica moldeada en poliamida con fibra.'),
(14, 'SPIN-CNC-51', 'Spinner en Aluminio CNC Anodizado 51mm (2")', 'spinner-aluminio-cnc-51mm', 4, '1:32 / 1:10 Escala', 'Aluminio CNC 6061-T6', 'Diámetro 51mm (2.0") | Eje Adaptable 3mm a 6mm | Cono Pulido', 'Warbirds P-51 Mustang, Spitfire y Acrobáticos Extra 300', 95.00, 110.00, 11, 'Nuevo', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80', 'Aerotech CNC', 'Cono aerodinámico mecanizado en torno CNC de aleación de aluminio aeroespacial.'),
(15, 'SRV-MG90S', 'Micro Servo MG90S 9g con Piñonería Metálica Completa', 'micro-servo-mg90s-metal-gear-9g', 5, 'RC Estándar / Micro', 'Piñonería Bronce + Carcasa ABS', 'Torque 2.2 kg·cm | Velocidad 0.10s/60° | Peso 9g', 'Alerones, Elevadores, Timón de Aviones y Drones', 32.00, 38.00, 45, 'Best Seller', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 'TowerPro', 'Servo micro de 9 gramos reforzado con engranajes de bronce de alta durabilidad.'),
(16, 'TREN-CF-20CC', 'Tren de Aterrizaje Principal en Fibra de Carbono 3K', 'tren-de-aterrizaje-fibra-carbono-3k', 6, '1:10 / Escala Grande', 'Fibra de Carbono 3K Curada al Vacío', 'Ancho Base 120mm | Apertura Ruedas 380mm | Peso 78g', 'Aviones Acrobáticos Slick, Edge 540 y Extra 300', 260.00, 310.00, 8, 'Popular', 'https://images.unsplash.com/photo-1517976487507-5b3b48855a82?auto=format&fit=crop&w=600&q=80', 'AcroFlight', 'Estructura de tren principal ultrarresistente moldeada en auténtica fibra de carbono 3K.'),
(17, 'BAT-3S-2200', 'Batería LiPo Tattu 3S 11.1V 2200mAh 45C XT60', 'bateria-lipo-tattu-3s-2200mah-45c', 7, 'RC Estándar', 'Polímero de Litio de Alta Densidad', '11.1V 3S1P | Descarga Continua 45C (90C Burst) | XT60', 'Aviones Trainer, Warbirds 1200mm y Motoveleros', 195.00, 220.00, 12, 'Best Seller', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', 'Tattu / Gens Ace', 'Batería LiPo de grado profesional con celdas emparejadas para entrega constante de potencia.'),
(18, 'TUB-CF-10500', 'Tubo de Fibra de Carbono Pultruido 10mm x 500mm para Alas', 'tubo-fibra-de-carbono-10mm-500mm', 8, 'RC Estándar', 'Fibra de Carbono', 'Diámetro Ext. 10mm | Int. 8mm | Largo 500mm | Mate', 'Largueros alares, bayonetas desmontables y fuselajes', 45.00, NULL, 26, 'Nuevo', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80', 'AeroCarbon', 'Tubo estructural pultruido en fibra de carbono de altísima rigidez a la flexión.')
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `scale` = VALUES(`scale`),
  `material` = VALUES(`material`),
  `specs_line` = VALUES(`specs_line`),
  `compatible_models` = VALUES(`compatible_models`),
  `price` = VALUES(`price`),
  `old_price` = VALUES(`old_price`),
  `stock` = VALUES(`stock`),
  `badge` = VALUES(`badge`),
  `image_url` = VALUES(`image_url`);
