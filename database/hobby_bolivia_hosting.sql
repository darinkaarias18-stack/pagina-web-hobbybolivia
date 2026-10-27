-- ============================================================================
-- BASE DE DATOS MYSQL / MARIADB PARA HOSTING - HOBBY BOLIVIA
-- Compatible con cPanel / phpMyAdmin / MySQL 5.7+ / MariaDB 10.3+
-- Generado con todos los productos, categorías, políticas y administradores
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ----------------------------------------------------------------------------
-- 1. TABLA: categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `image_url` VARCHAR(500) NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. TABLA: products
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `scale` VARCHAR(100) DEFAULT 'RC Estándar',
  `material` VARCHAR(100) DEFAULT 'Compuesto',
  `specs_line` VARCHAR(255) NOT NULL,
  `compatible_models` TEXT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `old_price` DECIMAL(10,2) NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `badge` VARCHAR(100) NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `brand` VARCHAR(100) DEFAULT 'Hobby Bolivia',
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_sku` (`sku`),
  INDEX `idx_products_scale` (`scale`),
  INDEX `idx_products_material` (`material`),
  INDEX `idx_products_active` (`is_active`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. TABLA: policies
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `policies` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. TABLA: admin_users
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. TABLA: quote_orders (Opcional para pedidos y cotizaciones)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quote_orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `customer_city` VARCHAR(100) NOT NULL,
  `customer_notes` TEXT NULL,
  `items_json` LONGTEXT NOT NULL,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- VACIADO PREVENTIVO PARA IMPORTACIÓN LIMPIA (COMPATIBLE CON MARIADB)
-- ----------------------------------------------------------------------------
DELETE FROM `quote_orders`;
DELETE FROM `products`;
DELETE FROM `categories`;
DELETE FROM `policies`;
DELETE FROM `admin_users`;

-- ----------------------------------------------------------------------------
-- POBLACIÓN: categories
-- ----------------------------------------------------------------------------
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `display_order`, `is_active`) VALUES
(1, 'Conectores y Línea de Control', 'conectores-y-linea-de-control', 'Conectores E/Z, bellcranks, clevises mecánicos y accesorios de mando de máxima precisión para brazos de servo.', 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp', 1, 1),
(2, 'Varillaje y Alambres', 'varillaje-y-alambres', 'Alambres push rod de acero con rosca 2-56, 4-40 y métrica de 2mm con clevises para alerones y timones.', 'https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp', 2, 1),
(3, 'Motores y Propulsión', 'motores-y-propulsion', 'Motores brushless outrunner de alto torque, variadores ESC con BEC y monturas en aluminio CNC.', 'https://images.unsplash.com/photo-1559819614-81fea9ef7080?auto=format&fit=crop&w=600&q=80', 3, 1),
(4, 'Hélices y Spinners', 'helices-y-spinners', 'Hélices APC equilibradas, palas en fibra de carbono y spinners en aluminio anodizado para alta velocidad.', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', 4, 1),
(5, 'Servos y Electrónica', 'servos-y-electronica', 'Micro servos con piñonería metálica, receptores 2.4GHz multi-canal y sistemas de estabilización de vuelo.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 5, 1),
(6, 'Trenes de Aterrizaje', 'trenes-de-aterrizaje', 'Trenes principales en fibra de carbono, conjuntos retráctiles oleoneumáticos y ruedas ligeras de espuma.', 'https://images.unsplash.com/photo-1517976487507-5b3b48855a82?auto=format&fit=crop&w=600&q=80', 6, 1),
(7, 'Baterías y Conectores', 'baterias-y-conectores', 'Packs LiPo de alta tasa de descarga (C-rating), conectores dorados XT60/XT90 y cables siliconados.', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', 7, 1),
(8, 'Estructuras y Materiales', 'estructuras-y-materiales', 'Tubos de fibra de carbono pultruidos, madera de balsa seleccionada y bisagras de nylon para superficies de mando.', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80', 8, 1);

-- ----------------------------------------------------------------------------
-- POBLACIÓN: products (18 PRODUCTOS CON IMÁGENES EXACTAS INTACTAS)
-- ----------------------------------------------------------------------------
INSERT INTO `products` (`id`, `sku`, `name`, `slug`, `category_id`, `scale`, `material`, `specs_line`, `compatible_models`, `price`, `old_price`, `stock`, `badge`, `image_url`, `is_active`, `brand`, `description`) VALUES
(1, 'DUBQ3570', 'Conectores E/Z Dubro (12)', 'conectores-e-z-dubro-12', 1, 'RC Estándar', 'Aluminio CNC / Latón', 'Paso Alambre hasta 2mm | Prisionero Allen | 12 Pcs', 'Aviones RC Glow, Eléctricos y Drones', 220.00, 245.00, 15, 'Best Seller', 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp', 1, 'Dubro', '12 conectores E/Z originales Dubro. El estándar de oro en aeromodelismo para acoplar varillas a brazos de servo de forma segura, rápida y sin holguras mecánicas.'),
(2, 'DUBQ8450', 'Conector Mini E/Z (2) Dubro', 'conector-mini-e-z-2-dubro', 1, 'Micro / 1:32', 'Aluminio Ligero', 'Varilla 1.0mm - 1.5mm | Micro Servos | 2 Pcs', 'Park Flyers, Planeadores Micro y Drones FPV', 40.00, NULL, 24, 'Nuevo', 'https://hobbybolivia.com/media/products/19df1961af-dubq8450-t.webp', 1, 'Dubro', 'Pack de 2 conectores Mini E/Z Dubro diseñados especialmente para micro servos y varillajes delgados en modelos eléctricos ultraligeros y aviones indoor.'),
(3, 'DUBQ2000', 'Bellcrank 90º Standard de Plástico Dubro', 'bellcrank-90o-standard-de-plastico-dubro', 1, 'RC Estándar / 1:10', 'Nylon Compuesto + Casquillo Bronce', 'Ángulo 90° | Buje de Latón Antifricción | Incluye Tornillo', 'Alerones dobles, Flaps y Trenes Retráctiles', 25.00, 30.00, 18, 'Popular', 'https://hobbybolivia.com/media/products/d315fa511a-dubq2000tn-t.webp', 1, 'Dubro', 'Bellcrank de 90º estándar fabricado en nylon de alto impacto Dubro. Incluye tornillería, casquillos de bronce y arandelas para una transmisión de mando angular suave y precisa.'),
(4, 'AIB62993', 'Alambre de Push Rod con Rosca 2mm (2) y 4 Clevises', 'alambre-de-push-road-con-rosca-2-mm-2-y-4-clevises', 2, 'RC Estándar / 1:10', 'Acero Templado Zincado', 'Rosca Métrica 2mm | Longitud 300mm | 4 Clevises Metálicos', 'Alerones, Profundidad y Timón de Dirección', 30.00, NULL, 22, 'Best Seller', 'https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp', 1, 'Dubro', 'Set completo de 2 varillas de alambre push rod con rosca métrica de 2 mm y 4 clevises metálicos de acople rápido para mando de alerones, timón y estabilizadores de vuelo.'),
(5, 'GPMQ3741', 'Alambre con Rosca Completa 2-56 de 12" Great Planes', 'alambre-con-rosca-completa-2-56-de-12-great-planes', 2, 'RC Estándar', 'Acero Templado', 'Rosca Continua 2-56 | Longitud 12" (305mm) | Rigidez Superior', 'Modelos a escala, entrenadores .40-.46 y acrobáticos', 20.00, 25.00, 19, 'Popular', 'https://hobbybolivia.com/media/products/c2253e5048-gpmq3741-t.webp', 1, 'Great Planes', 'Varilla de alambre de acero con rosca continua 2-56 en sus 12 pulgadas de largo. Original Great Planes con excelente resistencia torsional que permite cortar y acoplar a cualquier longitud exacta.'),
(6, 'DUBQ1474', 'Alambre con Rosca 4-40 en un Solo Extremo 12"', 'alambre-con-rosca-4-40-en-un-solo-extremo-12', 2, 'Aviones Grandes / 1:10', 'Acero Templado Grueso', 'Rosca 4-40 Heavy Duty | Longitud 12" | Cero Deflexión', 'Aviones Gigantes 50cc-100cc, Jets y Acrobáticos 3D', 15.00, NULL, 28, NULL, 'https://hobbybolivia.com/media/products/7f5b761d4f-dubq1474-large-t.webp', 1, 'Dubro', 'Varilla de control rígida de 12 pulgadas con rosca 4-40 en un extremo. Diseñada para aeromodelos de gran escala y alta velocidad que no toleran ninguna flexión bajo carga aerodinámica.'),
(7, 'DUBQ1464', 'Alambre con Rosca 2-56 en un Solo Extremo 12"', 'alambre-con-rosca-2-56-en-un-solo-extremo-12', 2, 'RC Estándar', 'Acero Templado', 'Rosca 2-56 | Longitud 12" | Acabado Brillante', 'Mandos de servo estándar y bocinas de control', 12.00, NULL, 35, NULL, 'https://hobbybolivia.com/media/products/7f5b761d4f-dubq1464-large-t.webp', 1, 'Dubro', 'Alambre acerado de control de 12 pulgadas de longitud con rosca 2-56 en un extremo, para brazos de servo estándar y bocinas de mando de alerón y profundidad.'),
(8, 'DUBQ9306', 'Alambre 4-40 de 12" de Largo con Clevis', 'alambre-4-40-de-12-de-largo-con-clevis', 2, 'Aviones Grandes / 1:10', 'Acero Templado + Nylon Reforzado', 'Rosca 4-40 | Incluye Clevis de Seguridad | 12 Pulgadas', 'Aviones medianos, grandes y modelos sport', 26.00, 32.00, 14, 'Pocas Unidades', 'https://hobbybolivia.com/media/products/7fcaad4571-dubq9306-large-t.webp', 1, 'Dubro', 'Varilla de control 4-40 de 12 pulgadas con clevis de nylon/acero reforzado incluido para máxima seguridad en mandos principales de vuelo.'),
(9, 'DUBQ9108', 'Alambre 2-56 de 12" de Largo con Clevis', 'alambre-2-56-de-12-de-largo-con-clevis', 2, 'RC Estándar', 'Acero + Clevis Dubro', 'Rosca 2-56 | Clevis Preensamblado | 12 Pulgadas', 'Modelos .25 a .60 y planeadores eléctricos', 18.00, NULL, 25, 'Popular', 'https://hobbybolivia.com/media/products/ac56aa1747-dubq9108-large-t.webp', 1, 'Dubro', 'Varilla de alambre 2-56 de 12 pulgadas con clevis Dubro prearmado. Ensamble inmediato sin necesidad de herramientas especiales.'),
(10, 'DUBQ2005', '90º Bellcrank Micro de Plástico Dubro', '90o-bellcrank-micro-de-plastico-dubro', 1, 'Micro / 1:48', 'Nylon Ultraligero', 'Ángulo 90° Micro | Peso 1.2g | Para Espacios Reducidos', 'Fuselajes delgados, micro alerones y alas volantes', 24.00, NULL, 19, 'Nuevo', 'https://hobbybolivia.com/media/products/586ddc4ce2-dubq2005-large-t.webp', 1, 'Dubro', 'Micro bellcrank de 90 grados en material plástico ultraligero y resistente Dubro. Diseñado para espacios reducidos en fuselajes y alas de modelos compactos.'),
(11, 'MOT-2212-1400', 'Motor Brushless A2212 1400KV Outrunner con Accesorios', 'motor-brushless-a2212-1400kv-outrunner', 3, 'RC Estándar / Park Flyer', 'Aluminio CNC / Cobre Esmaltado', '1400KV | 2-3S LiPo | Eje 3.17mm | Empuje 850g', 'Aviones Cessna 182, Ala Volante ZOHD y Entrenadores', 110.00, 130.00, 16, 'Best Seller', 'https://images.unsplash.com/photo-1559819614-81fea9ef7080?auto=format&fit=crop&w=600&q=80', 1, 'XXD Power', 'Motor sin escobillas outrunner de 1400KV de alta eficiencia. Incluye cruz de fijación metálica, adaptador tipo collet para hélice y tornillos de montaje.'),
(12, 'ESC-30A-BEC', 'Variador de Velocidad Electrónico ESC 30A con BEC 5V/2A', 'variador-esc-30a-con-bec', 3, 'RC Estándar', 'Compuesto PCB / Disipador Aluminio', '30A Continuo (40A Burst) | BEC 5V/2A | Conector XT60', 'Aviones a escala, planeadores eléctricos y motoveleros', 85.00, 95.00, 20, 'Popular', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', 1, 'Hobbywing Tech', 'Controlador de velocidad programable con freno de hélice automático para planeadores. Disipador de calor de aluminio y protección térmica integrada.'),
(13, 'APC-09060E', 'Hélice APC 9x6 Thin Electric E-Series Balanceada', 'helice-apc-9x6-thin-electric', 4, 'RC Estándar / 1:10', 'Compuesto Poliamida Reforzado', '9x6 Pulgadas | Giro Horario (Tractor) | Bujes Adaptadores', 'Motores 2212 1400KV, Aviones Trainer y Sport', 38.00, NULL, 30, 'Best Seller', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', 1, 'APC Propellers', 'Hélice de alta eficiencia aerodinámica moldeada en poliamida con fibra. Máximo empuje y mínima vibración para motores eléctricos.'),
(14, 'SPIN-CNC-51', 'Spinner en Aluminio CNC Anodizado 51mm (2")', 'spinner-aluminio-cnc-51mm', 4, '1:32 / 1:10 Escala', 'Aluminio CNC 6061-T6', 'Diámetro 51mm (2.0") | Eje Adaptable 3mm a 6mm | Cono Pulido', 'Warbirds P-51 Mustang, Spitfire y Acrobáticos Extra 300', 95.00, 110.00, 11, 'Nuevo', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80', 1, 'Aerotech CNC', 'Cono aerodinámico mecanizado en torno CNC de aleación de aluminio aeroespacial. Acabado brillante con plato base ranurado para montaje seguro de palas.'),
(15, 'SRV-MG90S', 'Micro Servo MG90S 9g con Piñonería Metálica Completa', 'micro-servo-mg90s-metal-gear-9g', 5, 'RC Estándar / Micro', 'Piñonería Bronce + Carcasa ABS', 'Torque 2.2 kg·cm | Velocidad 0.10s/60° | Peso 9g', 'Alerones, Elevadores, Timón de Aviones y Drones', 32.00, 38.00, 45, 'Best Seller', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 1, 'TowerPro', 'Servo micro de 9 gramos reforzado con engranajes de bronce de alta durabilidad y rodamientos para soportar esfuerzos mecánicos sin barrer los dientes.'),
(16, 'TREN-CF-20CC', 'Tren de Aterrizaje Principal en Fibra de Carbono 3K', 'tren-de-aterrizaje-fibra-carbono-3k', 6, '1:10 / Escala Grande', 'Fibra de Carbono 3K Curada al Vacío', 'Ancho Base 120mm | Apertura Ruedas 380mm | Peso 78g', 'Aviones Acrobáticos Slick, Edge 540 y Extra 300', 260.00, 310.00, 8, 'Popular', 'https://images.unsplash.com/photo-1517976487507-5b3b48855a82?auto=format&fit=crop&w=600&q=80', 1, 'AcroFlight', 'Estructura de tren principal ultrarresistente moldeada en auténtica fibra de carbono 3K. Excelente capacidad de absorción de impacto en pista de tierra o pasto.'),
(17, 'BAT-3S-2200', 'Batería LiPo Tattu 3S 11.1V 2200mAh 45C XT60', 'bateria-lipo-tattu-3s-2200mah-45c', 7, 'RC Estándar', 'Polímero de Litio de Alta Densidad', '11.1V 3S1P | Descarga Continua 45C (90C Burst) | XT60', 'Aviones Trainer, Warbirds 1200mm y Motoveleros', 195.00, 220.00, 12, 'Best Seller', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', 1, 'Tattu / Gens Ace', 'Batería LiPo de grado profesional con celdas emparejadas para entrega constante de potencia. Conector de descarga original XT60 y terminal de balanceo JST-XH.'),
(18, 'TUB-CF-10500', 'Tubo de Fibra de Carbono Pultruido 10mm x 500mm para Alas', 'tubo-fibra-de-carbono-10mm-500mm', 8, 'RC Estándar', 'Fibra de Carbono', 'Diámetro Ext. 10mm | Int. 8mm | Largo 500mm | Mate', 'Largueros alares, bayonetas desmontables y fuselajes', 45.00, NULL, 26, 'Nuevo', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80', 1, 'AeroCarbon', 'Tubo estructural pultruido en fibra de carbono de altísima rigidez a la flexión. Ideal como bayoneta central para ensamblaje de alas bipartitas o refuerzo longitudinal de fuselajes.');

-- ----------------------------------------------------------------------------
-- POBLACIÓN: policies (4 POLÍTICAS DE HOBBY BOLIVIA)
-- ----------------------------------------------------------------------------
INSERT INTO `policies` (`id`, `slug`, `title`, `content`) VALUES
(1, 'envios', 'Política de Envíos y Embalaje Frágil', 'En Hobby Bolivia garantizamos que cada repuesto y componente llegue en perfectas condiciones a cualquier rincón de Bolivia:\n- **Santa Cruz de la Sierra:** Entregas en el día o en un lapso máximo de 24 horas a través de mensajería express o entrega en nuestro punto céntrico.\n- **Envíos Nacionales:** Despachos de lunes a sábado a La Paz, El Alto, Cochabamba, Sucre, Tarija, Oruro, Potosí, Beni y Pando mediante empresas de transporte interdepartamental y courier aéreo.\n- **Embalaje Especial Anti-Dobladuras:** Las varillas de alambre templado (push-rods), tubos de fibra de carbono y hélices se empacan en fundas rígidas de PVC o perfiles de cartón reforzado con relleno amortiguante para evitar deflexión durante el traslado.\n- **Código de Seguimiento:** Reciba la guía de transporte inmediatamente despachado su pedido vía WhatsApp.'),
(2, 'devoluciones', 'Política de Cambios y Devoluciones', 'Para su total tranquilidad y satisfacción en sus proyectos aeronáuticos:\n- **Plazo de Notificación:** Dispone de hasta 7 días calendario tras la recepción del producto para solicitar un cambio por incompatibilidad de rosca, escala o medida.\n- **Estado del Componente:** El artículo debe encontrarse sin instalar, en su empaque original sellado o con sus etiquetas completas y sin muestras de sujeción mecánica o soldadura.\n- **Asistencia para Cambio:** Si la medida o paso de rosca no fue la adecuada para su brazo de servo o bancada, nuestro equipo técnico le asesora para canjearlo por la dimensión correcta de forma ágil.'),
(3, 'garantias', 'Garantía de Componentes Electrónicos y Mecánicos', 'Calidad internacional respaldada por Hobby Bolivia:\n- **Marcas Oficiales:** Distribuimos repuestos originales de fabricantes líderes como Dubro Products, Great Planes, APC Propellers, E-flite y Sunnysky.\n- **Control de Calidad Previo:** Todos los servos, motores y variadores pasan por una inspección ocular de cableado, terminales y prueba de continuidad antes del despacho.\n- **Cobertura de Defectos:** Cobertura de 30 días calendario por fallas atribuibles a manufactura. No aplica por sobrevoltaje, inversión de polaridad en soldadura o impactos por aterrizajes forzosos.'),
(4, 'privacidad', 'Política de Privacidad y Tratamiento de Datos', 'Sus datos están protegidos en Hobby Bolivia:\n- Recopilamos exclusivamente nombre completo, teléfono móvil de contacto y datos de envío para la emisión de notas de venta y rotulado de encomiendas.\n- No compartimos su base de datos con terceros ni comercializamos información con entidades ajenas al servicio de encomiendas y logística de Bolivia.');

-- ----------------------------------------------------------------------------
-- POBLACIÓN: admin_users (USUARIOS DE ACCESO ADMINISTRATIVO)
-- ----------------------------------------------------------------------------
INSERT INTO `admin_users` (`id`, `username`, `email`, `password_hash`, `role`) VALUES
(1, 'superadmin', 'superadmin@hobbybolivia.com', 'superhobby2026*', 'SUPERADMIN'),
(2, 'dariasdigital_hobbybolivia', 'admin@hobbybolivia.com', 'Imp6fSMr2%mj0w?v', 'SUPERADMIN');

SET FOREIGN_KEY_CHECKS = 1;
