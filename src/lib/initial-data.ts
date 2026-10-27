import { Product, Category, Policy, Banner, SiteConfig } from './types';

export const initialSiteConfig: SiteConfig = {
  id: 1,
  companyName: "Hobby Bolivia",
  subtitle: "Repuestos y componentes de precisión para aviones a escala & aeromodelismo",
  domain: "https://hobbybolivia.com",
  logoUrl: "https://hobbybolivia.com/icon.svg",
  heroBannerUrl: "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
  primaryColor: "#2563EB",
  secondaryColor: "#0F172A",
  accentColor: "#0095FF",
  currency: "Bs.",
  whatsappNumber: "+591 77293446",
  topBarText: "Hobby Bolivia: Repuestos y componentes de precisión para aviones a escala | Envíos seguros a toda Bolivia",
  contactEmail: "contacto@hobbybolivia.com",
  themePreset: "technest",
  cardStyle: "with_button",
  desktopColumns: 4,
  showTopBar: true,
  termsPolicy: `TÉRMINOS Y CONDICIONES - HOBBY BOLIVIA
1. GENERAL: Hobby Bolivia es la tienda especializada en repuestos, componentes mecánicos, electrónica y accesorios para aeromodelismo y aviones a escala en el territorio boliviano.
2. PRECIOS: Todos los precios están expresados en Bolivianos (Bs.) con impuestos y opciones de pago vía QR Simple, transferencia interbancaria o contra entrega coordinada.
3. COMPATIBILIDAD TÉCNICA: Verifique el paso de rosca (métrica o imperial 2-56 / 4-40), diámetro de varillas y compatibilidad de voltaje antes de su instalación definitiva.
4. ASISTENCIA: Nuestro equipo técnico brinda soporte preventa para validar medidas y montajes en sus proyectos de vuelo.`,
  privacyPolicy: `POLÍTICA DE PRIVACIDAD - HOBBY BOLIVIA
En Hobby Bolivia protegemos sus datos personales. La información de contacto, número de celular y dirección de entrega se utilizan exclusivamente para despachos, facturación y confirmación logística mediante guías de transporte nacional.`,
  shippingPolicy: `POLÍTICA DE ENVÍOS Y EMBALAJE FRÁGIL - HOBBY BOLIVIA
- Envíos Locales (La Paz y El Alto): Entregas en el día o en 24 horas mediante mensajería directa o recojo en almacén.
- Envíos Nacionales: Despachos diarios a Santa Cruz, Cochabamba, Sucre, Tarija, Oruro, Potosí, Beni y Pando mediante flotas de encomienda o courier aéreo expreso.
- Embalaje Blindado: Varillas de push-rod, alambres templados y componentes de fibra de carbono se envían protegidos en tubos rígidos de PVC o cartón de alta densidad para evitar dobladuras accidentales.`,
  returnsPolicy: `POLÍTICA DE GARANTÍA Y CONFORMIDAD TÉCNICA
- Repuestos mecánicos 100% nuevos, genuinos y sin uso (Dubro, Great Planes, APC, E-flite).
- Garantía de 30 días contra defectos de fabricación en componentes mecánicos y estructurales.
- Componentes electrónicos cuentan con verificación previa de polaridad y continuidad antes de despacho.`,
  paymentQrUrl: "/images/payment/qr_simple_hobbybolivia.svg",
  paymentQrInstructions: "Titular: Hobby Bolivia\nBanco: Banco Unión / BCP / BNB\nMoneda: Bolivianos (Bs.)\nEnvía tu comprobante de pago por WhatsApp para procesar tu despacho.",
  enablePaymentQr: true
};

export const initialCategories: Category[] = [
  {
    id: 1,
    name: "Conectores y Línea de Control",
    slug: "conectores-y-linea-de-control",
    order: 1,
    imageUrl: "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
    image_url: "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
    description: "Conectores E/Z, bellcranks, clevises mecánicos y accesorios de mando de máxima precisión para brazos de servo.",
    isActive: true,
    itemCount: 4
  },
  {
    id: 2,
    name: "Varillaje y Alambres",
    slug: "varillaje-y-alambres",
    order: 2,
    imageUrl: "https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp",
    image_url: "https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp",
    description: "Alambres push rod de acero con rosca 2-56, 4-40 y métrica de 2mm con clevises para alerones y timones.",
    isActive: true,
    itemCount: 6
  },
  {
    id: 3,
    name: "Motores y Propulsión",
    slug: "motores-y-propulsion",
    order: 3,
    imageUrl: "https://images.unsplash.com/photo-1559819614-81fea9ef7080?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1559819614-81fea9ef7080?auto=format&fit=crop&w=600&q=80",
    description: "Motores brushless outrunner de alto torque, variadores ESC con BEC y monturas en aluminio CNC.",
    isActive: true,
    itemCount: 3
  },
  {
    id: 4,
    name: "Hélices y Spinners",
    slug: "helices-y-spinners",
    order: 4,
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    description: "Hélices APC equilibradas, palas en fibra de carbono y spinners en aluminio anodizado para alta velocidad.",
    isActive: true,
    itemCount: 3
  },
  {
    id: 5,
    name: "Servos y Electrónica",
    slug: "servos-y-electronica",
    order: 5,
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    description: "Micro servos con piñonería metálica, receptores 2.4GHz multi-canal y sistemas de estabilización de vuelo.",
    isActive: true,
    itemCount: 3
  },
  {
    id: 6,
    name: "Trenes de Aterrizaje",
    slug: "trenes-de-aterrizaje",
    order: 6,
    imageUrl: "https://images.unsplash.com/photo-1517976487507-5b3b48855a82?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1517976487507-5b3b48855a82?auto=format&fit=crop&w=600&q=80",
    description: "Trenes principales en fibra de carbono, conjuntos retráctiles oleoneumáticos y ruedas ligeras de espuma.",
    isActive: true,
    itemCount: 2
  },
  {
    id: 7,
    name: "Baterías y Conectores",
    slug: "baterias-y-conectores",
    order: 7,
    imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
    description: "Packs LiPo de alta tasa de descarga (C-rating), conectores dorados XT60/XT90 y cables siliconados.",
    isActive: true,
    itemCount: 2
  },
  {
    id: 8,
    name: "Estructuras y Materiales",
    slug: "estructuras-y-materiales",
    order: 8,
    imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
    image_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
    description: "Tubos de fibra de carbono pultruidos, madera de balsa seleccionada y bisagras de nylon para superficies de mando.",
    isActive: true,
    itemCount: 2
  }
];

export const initialPolicies: Policy[] = [
  {
    id: 1,
    slug: "envios",
    title: "Política de Envíos y Embalaje Frágil",
    content: `En Hobby Bolivia garantizamos que cada repuesto y componente llegue en perfectas condiciones a cualquier rincón de Bolivia:
- **La Paz y El Alto:** Entregas en el día o en un lapso máximo de 24 horas a través de mensajería express o entrega en nuestro punto céntrico.
- **Envíos Nacionales:** Despachos de lunes a sábado a Santa Cruz, Cochabamba, Sucre, Tarija, Oruro, Potosí, Beni y Pando mediante empresas de transporte interdepartamental y courier aéreo.
- **Embalaje Especial Anti-Dobladuras:** Las varillas de alambre templado (push-rods), tubos de fibra de carbono y hélices se empacan en fundas rígidas de PVC o perfiles de cartón reforzado con relleno amortiguante para evitar deflexión durante el traslado.
- **Código de Seguimiento:** Reciba la guía de transporte inmediatamente despachado su pedido vía WhatsApp.`,
    updatedAt: "2026-10-25T12:00:00Z"
  },
  {
    id: 2,
    slug: "devoluciones",
    title: "Política de Cambios y Devoluciones",
    content: `Para su total tranquilidad y satisfacción en sus proyectos aeronáuticos:
- **Plazo de Notificación:** Dispone de hasta 7 días calendario tras la recepción del producto para solicitar un cambio por incompatibilidad de rosca, escala o medida.
- **Estado del Componente:** El artículo debe encontrarse sin instalar, en su empaque original sellado o con sus etiquetas completas y sin muestras de sujeción mecánica o soldadura.
- **Asistencia para Cambio:** Si la medida o paso de rosca no fue la adecuada para su brazo de servo o bancada, nuestro equipo técnico le asesora para canjearlo por la dimensión correcta de forma ágil.`,
    updatedAt: "2026-10-25T12:00:00Z"
  },
  {
    id: 3,
    slug: "garantias",
    title: "Garantía de Componentes Electrónicos y Mecánicos",
    content: `Calidad internacional respaldada por Hobby Bolivia:
- **Marcas Oficiales:** Distribuimos repuestos originales de fabricantes líderes como Dubro Products, Great Planes, APC Propellers, E-flite y Sunnysky.
- **Control de Calidad Previo:** Todos los servos, motores y variadores pasan por una inspección ocular de cableado, terminales y prueba de continuidad antes del despacho.
- **Cobertura de Defectos:** Cobertura de 30 días calendario por fallas atribuibles a manufactura. No aplica por sobrevoltaje, inversión de polaridad en soldadura o impactos por aterrizajes forzosos.`,
    updatedAt: "2026-10-25T12:00:00Z"
  },
  {
    id: 4,
    slug: "privacidad",
    title: "Política de Privacidad y Tratamiento de Datos",
    content: `Sus datos están protegidos en Hobby Bolivia:
- Recopilamos exclusivamente nombre completo, teléfono móvil de contacto y datos de envío para la emisión de notas de venta y rotulado de encomiendas.
- No compartimos su base de datos con terceros ni comercializamos información con entidades ajenas al servicio de encomiendas y logística de Bolivia.`,
    updatedAt: "2026-10-25T12:00:00Z"
  }
];

export const initialBanners: Banner[] = [
  {
    id: 1,
    title: "Repuestos de Precisión para tus Aviones a Escala en Hobby Bolivia",
    subtitle: "Conectores E/Z, varillajes templados, trenes de aterrizaje y electrónica de alta gama con envíos seguros a toda Bolivia.",
    imageUrl: "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
    buttonText: "Explorar Catálogo →",
    buttonUrl: "#catalogo",
    placement: "HERO",
    isActive: true
  },
  {
    id: 2,
    title: "Sistemas de Propulsión y Electrónica de Alto Rendimiento",
    subtitle: "Motores brushless outrunner, variadores ESC calibrados y micro servos de piñonería metálica.",
    imageUrl: "https://images.unsplash.com/photo-1559819614-81fea9ef7080?auto=format&fit=crop&w=800&q=80",
    buttonText: "Ver Motores y Electrónica →",
    buttonUrl: "#catalogo",
    placement: "CATEGORY_PROMO",
    isActive: true
  },
  {
    id: 3,
    title: "Estructuras Ligeras, Trenes y Accesorios a Escala",
    subtitle: "Tubos de fibra de carbono, varillajes roscados y clevises de precisión Dubro y Great Planes.",
    imageUrl: "https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp",
    buttonText: "Ver Accesorios y Varillaje →",
    buttonUrl: "#catalogo",
    placement: "CATEGORY_PROMO",
    isActive: true
  }
];

export const initialProducts: Product[] = [
  // 1. DUBQ3570 - Conectores E/Z Dubro (12)
  {
    id: 1,
    sku: "HB-0001",
    name: "Conectores E/Z Dubro (12)",
    title: "Conectores E/Z Dubro (12)",
    slug: "conectores-e-z-dubro-12",
    brand: "Dubro",
    category_id: 1,
    categoryId: 1,
    scale: "RC Estándar",
    material: "Aluminio CNC / Latón",
    specs_line: "Paso Alambre hasta 2mm | Prisionero Allen | 12 Pcs",
    compatible_models: "Aviones RC Glow, Eléctricos y Drones",
    price: 220.00,
    old_price: 245.00,
    compareAtPrice: 245.00,
    discountPercent: 10,
    stock: 15,
    stockQuantity: 15,
    badge: "Popular",
    image_url: "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
    images: ["https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "12 conectores E/Z originales Dubro. El estándar de oro en aeromodelismo para acoplar varillas a brazos de servo de forma segura, rápida y sin holguras mecánicas.",
    specifications: {
      "Marca": "Dubro Products USA",
      "Modelo": "E/Z Connector Standard",
      "Cantidad": "12 unidades con prisionero",
      "Compatibilidad": "Varillas de 1.8mm a 2.1mm",
      "SKU Oficial": "DUBQ3570"
    }
  },
  // 2. DUBQ8450 - Conector Mini E/Z (2) Dubro
  {
    id: 2,
    sku: "HB-0002",
    name: "Conector Mini E/Z (2) Dubro",
    title: "Conector Mini E/Z (2) Dubro",
    slug: "conector-mini-e-z-2-dubro",
    brand: "Dubro",
    category_id: 1,
    categoryId: 1,
    scale: "Micro / 1:32",
    material: "Aluminio Ligero",
    specs_line: "Varilla 1.0mm - 1.5mm | Micro Servos | 2 Pcs",
    compatible_models: "Park Flyers, Planeadores Micro y Drones FPV",
    price: 40.00,
    old_price: null,
    stock: 24,
    stockQuantity: 24,
    badge: "Nuevo",
    image_url: "https://hobbybolivia.com/media/products/19df1961af-dubq8450-t.webp",
    images: ["https://hobbybolivia.com/media/products/19df1961af-dubq8450-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Pack de 2 conectores Mini E/Z Dubro diseñados especialmente para micro servos y varillajes delgados en modelos eléctricos ultraligeros y aviones indoor.",
    specifications: {
      "Marca": "Dubro",
      "Modelo": "Mini E/Z Connector",
      "Cantidad": "2 conectores con prisionero micro",
      "Diámetro Varilla": "Hasta 1.5 mm",
      "Código SKU": "DUBQ8450"
    }
  },
  // 3. DUBQ2000 - Bellcrank 90º Standard
  {
    id: 3,
    sku: "HB-0003",
    name: "Bellcrank 90º Standard de Plástico Dubro",
    title: "Bellcrank 90º Standard de Plástico Dubro",
    slug: "bellcrank-90o-standard-de-plastico-dubro",
    brand: "Dubro",
    category_id: 1,
    categoryId: 1,
    scale: "RC Estándar / 1:10",
    material: "Nylon Compuesto + Casquillo Bronce",
    specs_line: "Ángulo 90° | Buje de Latón Antifricción | Incluye Tornillo",
    compatible_models: "Alerones dobles, Flaps y Trenes Retráctiles",
    price: 25.00,
    old_price: 30.00,
    compareAtPrice: 30.00,
    discountPercent: 16,
    stock: 18,
    stockQuantity: 18,
    badge: "Popular",
    image_url: "https://hobbybolivia.com/media/products/d315fa511a-dubq2000tn-t.webp",
    images: ["https://hobbybolivia.com/media/products/d315fa511a-dubq2000tn-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Bellcrank de 90º estándar fabricado en nylon de alto impacto Dubro. Incluye tornillería, casquillos de bronce y arandelas para una transmisión de mando angular suave y precisa.",
    specifications: {
      "Marca": "Dubro",
      "Tipo": "Bellcrank 90 grados",
      "Material": "Nylon de alta resistencia + Bujes de latón",
      "Código SKU": "DUBQ2000"
    }
  },
  // 4. AIB62993 - Alambre Push Rod con rosca 2 mm
  {
    id: 4,
    sku: "HB-0004",
    name: "Alambre de Push Rod con Rosca 2mm (2) y 4 Clevises",
    title: "Alambre de Push Rod con Rosca 2mm (2) y 4 Clevises",
    slug: "alambre-de-push-road-con-rosca-2-mm-2-y-4-clevises",
    brand: "Dubro",
    category_id: 2,
    categoryId: 2,
    scale: "RC Estándar / 1:10",
    material: "Acero Templado Zincado",
    specs_line: "Rosca Métrica 2mm | Longitud 300mm | 4 Clevises Metálicos",
    compatible_models: "Alerones, Profundidad y Timón de Dirección",
    price: 30.00,
    old_price: null,
    stock: 22,
    stockQuantity: 22,
    badge: null,
    image_url: "https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp",
    images: ["https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Set completo de 2 varillas de alambre push rod con rosca métrica de 2 mm y 4 clevises metálicos de acople rápido para mando de alerones, timón y estabilizadores de vuelo.",
    specifications: {
      "Diámetro": "2.0 mm",
      "Contenido": "2 alambres push rod + 4 clevises de resorte",
      "Longitud": "Aprox. 300 mm",
      "Código SKU": "AIB62993"
    }
  },
  // 5. GPMQ3741 - Alambre rosca completa 2-56 Great Planes
  {
    id: 5,
    sku: "HB-0005",
    name: "Alambre con Rosca Completa 2-56 de 12\" Great Planes",
    title: "Alambre con Rosca Completa 2-56 de 12\" Great Planes",
    slug: "alambre-con-rosca-completa-2-56-de-12-great-planes",
    brand: "Great Planes",
    category_id: 2,
    categoryId: 2,
    scale: "RC Estándar",
    material: "Acero Templado",
    specs_line: "Rosca Continua 2-56 | Longitud 12\" (305mm) | Rigidez Superior",
    compatible_models: "Modelos a escala, entrenadores .40-.46 y acrobáticos",
    price: 20.00,
    old_price: 25.00,
    compareAtPrice: 25.00,
    discountPercent: 20,
    stock: 19,
    stockQuantity: 19,
    badge: "Popular",
    image_url: "https://hobbybolivia.com/media/products/c2253e5048-gpmq3741-t.webp",
    images: ["https://hobbybolivia.com/media/products/c2253e5048-gpmq3741-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Varilla de alambre de acero con rosca continua 2-56 en sus 12 pulgadas de largo. Original Great Planes con excelente resistencia torsional que permite cortar y acoplar a cualquier longitud exacta.",
    specifications: {
      "Marca": "Great Planes USA",
      "Rosca": "2-56 completa en toda la varilla",
      "Longitud": "12 pulgadas (305 mm)",
      "Código SKU": "GPMQ3741"
    }
  },
  // 6. DUBQ1474 - Alambre rosca 4-40 un extremo 12"
  {
    id: 6,
    sku: "HB-0006",
    name: "Alambre con Rosca 4-40 en un Solo Extremo 12\"",
    title: "Alambre con Rosca 4-40 en un Solo Extremo 12\"",
    slug: "alambre-con-rosca-4-40-en-un-solo-extremo-12",
    brand: "Dubro",
    category_id: 2,
    categoryId: 2,
    scale: "Aviones Grandes / 1:10",
    material: "Acero Templado Grueso",
    specs_line: "Rosca 4-40 Heavy Duty | Longitud 12\" | Cero Deflexión",
    compatible_models: "Aviones Gigantes 50cc-100cc, Jets y Acrobáticos 3D",
    price: 15.00,
    old_price: null,
    stock: 28,
    stockQuantity: 28,
    badge: null,
    image_url: "https://hobbybolivia.com/media/products/7f5b761d4f-dubq1474-large-t.webp",
    images: ["https://hobbybolivia.com/media/products/7f5b761d4f-dubq1474-large-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Varilla de control rígida de 12 pulgadas con rosca 4-40 en un extremo. Diseñada para aeromodelos de gran escala y alta velocidad que no toleran ninguna flexión bajo carga aerodinámica.",
    specifications: {
      "Marca": "Dubro",
      "Rosca": "4-40 (un extremo)",
      "Longitud": "12 pulgadas (305 mm)",
      "Código SKU": "DUBQ1474"
    }
  },
  // 7. DUBQ1464 - Alambre rosca 2-56 un extremo 12"
  {
    id: 7,
    sku: "HB-0007",
    name: "Alambre con Rosca 2-56 en un Solo Extremo 12\"",
    title: "Alambre con Rosca 2-56 en un Solo Extremo 12\"",
    slug: "alambre-con-rosca-2-56-en-un-solo-extremo-12",
    brand: "Dubro",
    category_id: 2,
    categoryId: 2,
    scale: "RC Estándar",
    material: "Acero Templado",
    specs_line: "Rosca 2-56 | Longitud 12\" | Acabado Brillante",
    compatible_models: "Mandos de servo estándar y bocinas de control",
    price: 12.00,
    old_price: null,
    stock: 35,
    stockQuantity: 35,
    badge: null,
    image_url: "https://hobbybolivia.com/media/products/7f5b761d4f-dubq1464-large-t.webp",
    images: ["https://hobbybolivia.com/media/products/7f5b761d4f-dubq1464-large-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Alambre acerado de control de 12 pulgadas de longitud con rosca 2-56 en un extremo, para brazos de servo estándar y bocinas de mando de alerón y profundidad.",
    specifications: {
      "Marca": "Dubro",
      "Rosca": "2-56 (un extremo)",
      "Longitud": "12 pulgadas",
      "Código SKU": "DUBQ1464"
    }
  },
  // 8. DUBQ9306 - Alambre 4-40 con Clevis
  {
    id: 8,
    sku: "HB-0008",
    name: "Alambre 4-40 de 12\" de Largo con Clevis",
    title: "Alambre 4-40 de 12\" de Largo con Clevis",
    slug: "alambre-4-40-de-12-de-largo-con-clevis",
    brand: "Dubro",
    category_id: 2,
    categoryId: 2,
    scale: "Aviones Grandes / 1:10",
    material: "Acero Templado + Nylon Reforzado",
    specs_line: "Rosca 4-40 | Incluye Clevis de Seguridad | 12 Pulgadas",
    compatible_models: "Aviones medianos, grandes y modelos sport",
    price: 26.00,
    old_price: 32.00,
    compareAtPrice: 32.00,
    discountPercent: 18,
    stock: 14,
    stockQuantity: 14,
    badge: "Pocas Unidades",
    image_url: "https://hobbybolivia.com/media/products/7fcaad4571-dubq9306-large-t.webp",
    images: ["https://hobbybolivia.com/media/products/7fcaad4571-dubq9306-large-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Varilla de control 4-40 de 12 pulgadas con clevis de nylon/acero reforzado incluido para máxima seguridad en mandos principales de vuelo.",
    specifications: {
      "Marca": "Dubro",
      "Rosca": "4-40",
      "Longitud": "12 pulgadas",
      "Incluye": "Clevis de seguridad con seguro antidesenganche",
      "Código SKU": "DUBQ9306"
    }
  },
  // 9. DUBQ9108 - Alambre 2-56 con Clevis
  {
    id: 9,
    sku: "HB-0009",
    name: "Alambre 2-56 de 12\" de Largo con Clevis",
    title: "Alambre 2-56 de 12\" de Largo con Clevis",
    slug: "alambre-2-56-de-12-de-largo-con-clevis",
    brand: "Dubro",
    category_id: 2,
    categoryId: 2,
    scale: "RC Estándar",
    material: "Acero + Clevis Dubro",
    specs_line: "Rosca 2-56 | Clevis Preensamblado | 12 Pulgadas",
    compatible_models: "Modelos .25 a .60 y planeadores eléctricos",
    price: 18.00,
    old_price: null,
    stock: 25,
    stockQuantity: 25,
    badge: "Popular",
    image_url: "https://hobbybolivia.com/media/products/ac56aa1747-dubq9108-large-t.webp",
    images: ["https://hobbybolivia.com/media/products/ac56aa1747-dubq9108-large-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Varilla de alambre 2-56 de 12 pulgadas con clevis Dubro prearmado. Ensamble inmediato sin necesidad de herramientas especiales.",
    specifications: {
      "Marca": "Dubro",
      "Rosca": "2-56",
      "Longitud": "12 pulgadas",
      "Incluye": "Clevis Dubro",
      "Código SKU": "DUBQ9108"
    }
  },
  // 10. DUBQ2005 - Micro Bellcrank 90º Dubro
  {
    id: 10,
    sku: "HB-0010",
    name: "90º Bellcrank Micro de Plástico Dubro",
    title: "90º Bellcrank Micro de Plástico Dubro",
    slug: "90o-bellcrank-micro-de-plastico-dubro",
    brand: "Dubro",
    category_id: 1,
    categoryId: 1,
    scale: "Micro / 1:48",
    material: "Nylon Ultraligero",
    specs_line: "Ángulo 90° Micro | Peso 1.2g | Para Espacios Reducidos",
    compatible_models: "Fuselajes delgados, micro alerones y alas volantes",
    price: 24.00,
    old_price: null,
    stock: 19,
    stockQuantity: 19,
    badge: "Nuevo",
    image_url: "https://hobbybolivia.com/media/products/586ddc4ce2-dubq2005-large-t.webp",
    images: ["https://hobbybolivia.com/media/products/586ddc4ce2-dubq2005-large-t.webp"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Micro bellcrank de 90 grados en material plástico ultraligero y resistente Dubro. Diseñado para espacios reducidos en fuselajes y alas de modelos compactos.",
    specifications: {
      "Marca": "Dubro",
      "Tipo": "Micro Bellcrank 90 grados",
      "Material": "Plástico técnico resistente",
      "Código SKU": "DUBQ2005"
    }
  },
  // 11. Motor Brushless A2212 1400KV Outrunner
  {
    id: 11,
    sku: "HB-0011",
    name: "Motor Brushless A2212 1400KV Outrunner con Accesorios",
    title: "Motor Brushless A2212 1400KV Outrunner con Accesorios",
    slug: "motor-brushless-a2212-1400kv-outrunner",
    brand: "XXD Power",
    category_id: 3,
    categoryId: 3,
    scale: "RC Estándar / Park Flyer",
    material: "Aluminio CNC / Cobre Esmaltado",
    specs_line: "1400KV | 2-3S LiPo | Eje 3.17mm | Empuje 850g",
    compatible_models: "Aviones Cessna 182, Ala Volante ZOHD y Entrenadores",
    price: 110.00,
    old_price: 130.00,
    compareAtPrice: 130.00,
    discountPercent: 15,
    stock: 16,
    stockQuantity: 16,
    badge: null,
    image_url: "https://images.unsplash.com/photo-1559819614-81fea9ef7080?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1559819614-81fea9ef7080?auto=format&fit=crop&w=600&q=80"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Motor sin escobillas outrunner de 1400KV de alta eficiencia. Incluye cruz de fijación metálica, adaptador tipo collet para hélice y tornillos de montaje.",
    specifications: {
      "KV": "1400 RPM/V",
      "Voltaje Operativo": "7.4V - 11.1V (2S - 3S LiPo)",
      "Corriente Máx": "16A por 60 seg",
      "Peso": "48 gramos",
      "Hélice recomendada": "8x6, 9x4.7"
    }
  },
  // 12. Variador ESC 30A Brushless con BEC 5V/2A
  {
    id: 12,
    sku: "HB-0012",
    name: "Variador de Velocidad Electrónico ESC 30A con BEC 5V/2A",
    title: "Variador de Velocidad Electrónico ESC 30A con BEC 5V/2A",
    slug: "variador-esc-30a-con-bec",
    brand: "Hobbywing Tech",
    category_id: 3,
    categoryId: 3,
    scale: "RC Estándar",
    material: "Compuesto PCB / Disipador Aluminio",
    specs_line: "30A Continuo (40A Burst) | BEC 5V/2A | Conector XT60",
    compatible_models: "Aviones a escala, planeadores eléctricos y motoveleros",
    price: 85.00,
    old_price: 95.00,
    compareAtPrice: 95.00,
    discountPercent: 10,
    stock: 20,
    stockQuantity: 20,
    badge: "Popular",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Controlador de velocidad programable con freno de hélice automático para planeadores. Disipador de calor de aluminio y protección térmica integrada.",
    specifications: {
      "Amperaje": "30A constante, 40A pico",
      "Entrada": "2-3 celdas LiPo",
      "Conector batería": "XT60 Macho soldado",
      "Conectores motor": "Banana hembra 3.5mm"
    }
  },
  // 13. Hélice APC 9x6 Thin Electric E-Series
  {
    id: 13,
    sku: "HB-0013",
    name: "Hélice APC 9x6 Thin Electric E-Series Balanceada",
    title: "Hélice APC 9x6 Thin Electric E-Series Balanceada",
    slug: "helice-apc-9x6-thin-electric",
    brand: "APC Propellers",
    category_id: 4,
    categoryId: 4,
    scale: "RC Estándar / 1:10",
    material: "Compuesto Poliamida Reforzado",
    specs_line: "9x6 Pulgadas | Giro Horario (Tractor) | Bujes Adaptadores",
    compatible_models: "Motores 2212 1400KV, Aviones Trainer y Sport",
    price: 38.00,
    old_price: null,
    stock: 30,
    stockQuantity: 30,
    badge: null,
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Hélice de alta eficiencia aerodinámica moldeada en poliamida con fibra. Máximo empuje y mínima vibración para motores eléctricos.",
    specifications: {
      "Diámetro": "9 pulgadas",
      "Paso": "6 pulgadas",
      "Peso": "14 gramos",
      "Fabricación": "APC Landing Products USA"
    }
  },
  // 14. Spinner de Aluminio CNC 51mm (2 Pulgadas)
  {
    id: 14,
    sku: "HB-0014",
    name: "Spinner en Aluminio CNC Anodizado 51mm (2\")",
    title: "Spinner en Aluminio CNC Anodizado 51mm (2\")",
    slug: "spinner-aluminio-cnc-51mm",
    brand: "Aerotech CNC",
    category_id: 4,
    categoryId: 4,
    scale: "1:32 / 1:10 Escala",
    material: "Aluminio CNC 6061-T6",
    specs_line: "Diámetro 51mm (2.0\") | Eje Adaptable 3mm a 6mm | Cono Pulido",
    compatible_models: "Warbirds P-51 Mustang, Spitfire y Acrobáticos Extra 300",
    price: 95.00,
    old_price: 110.00,
    compareAtPrice: 110.00,
    discountPercent: 13,
    stock: 11,
    stockQuantity: 11,
    badge: "Nuevo",
    image_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Cono aerodinámico mecanizado en torno CNC de aleación de aluminio aeroespacial. Acabado brillante con plato base ranurado para montaje seguro de palas.",
    specifications: {
      "Diámetro Base": "51 mm (2 pulgadas)",
      "Material": "Aluminio 6061-T6 ultraligero",
      "Fijación": "Tornillo central de acero templado"
    }
  },
  // 15. Micro Servo TowerPro MG90S Metal Gear 9g
  {
    id: 15,
    sku: "HB-0015",
    name: "Micro Servo MG90S 9g con Piñonería Metálica Completa",
    title: "Micro Servo MG90S 9g con Piñonería Metálica Completa",
    slug: "micro-servo-mg90s-metal-gear-9g",
    brand: "TowerPro",
    category_id: 5,
    categoryId: 5,
    scale: "RC Estándar / Micro",
    material: "Piñonería Bronce + Carcasa ABS",
    specs_line: "Torque 2.2 kg·cm | Velocidad 0.10s/60° | Peso 9g",
    compatible_models: "Alerones, Elevadores, Timón de Aviones y Drones",
    price: 32.00,
    old_price: 38.00,
    compareAtPrice: 38.00,
    discountPercent: 15,
    stock: 45,
    stockQuantity: 45,
    badge: null,
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Servo micro de 9 gramos reforzado con engranajes de bronce de alta durabilidad y rodamientos para soportar esfuerzos mecánicos sin barrer los dientes.",
    specifications: {
      "Torque": "2.2 kg/cm a 6V",
      "Voltaje": "4.8V - 6.0V",
      "Conector": "Estándar JR / Futaba 3 pines",
      "Incluye": "3 brazos de servo + tornillos de sujeción"
    }
  },
  // 16. Tren de Aterrizaje en Fibra de Carbono para Avión 15-20cc
  {
    id: 16,
    sku: "HB-0016",
    name: "Tren de Aterrizaje Principal en Fibra de Carbono 3K",
    title: "Tren de Aterrizaje Principal en Fibra de Carbono 3K",
    slug: "tren-de-aterrizaje-fibra-carbono-3k",
    brand: "AcroFlight",
    category_id: 6,
    categoryId: 6,
    scale: "1:10 / Escala Grande",
    material: "Fibra de Carbono 3K Curada al Vacío",
    specs_line: "Ancho Base 120mm | Apertura Ruedas 380mm | Peso 78g",
    compatible_models: "Aviones Acrobáticos Slick, Edge 540 y Extra 300",
    price: 260.00,
    old_price: 310.00,
    compareAtPrice: 310.00,
    discountPercent: 16,
    stock: 8,
    stockQuantity: 8,
    badge: null,
    image_url: "https://images.unsplash.com/photo-1517976487507-5b3b48855a82?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1517976487507-5b3b48855a82?auto=format&fit=crop&w=600&q=80"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Estructura de tren principal ultrarresistente moldeada en auténtica fibra de carbono 3K. Excelente capacidad de absorción de impacto en pista de tierra o pasto.",
    specifications: {
      "Material": "Fibra de Carbono 100% 3K",
      "Altura total": "155 mm",
      "Apertura en ruedas": "380 mm",
      "Carga recomendada": "Modelos de hasta 4.5 kg"
    }
  },
  // 17. Batería LiPo Tattu 3S 2200mAh 45C con Conector XT60
  {
    id: 17,
    sku: "HB-0017",
    name: "Batería LiPo Tattu 3S 11.1V 2200mAh 45C XT60",
    title: "Batería LiPo Tattu 3S 11.1V 2200mAh 45C XT60",
    slug: "bateria-lipo-tattu-3s-2200mah-45c",
    brand: "Tattu / Gens Ace",
    category_id: 7,
    categoryId: 7,
    scale: "RC Estándar",
    material: "Polímero de Litio de Alta Densidad",
    specs_line: "11.1V 3S1P | Descarga Continua 45C (90C Burst) | XT60",
    compatible_models: "Aviones Trainer, Warbirds 1200mm y Motoveleros",
    price: 195.00,
    old_price: 220.00,
    compareAtPrice: 220.00,
    discountPercent: 11,
    stock: 12,
    stockQuantity: 12,
    badge: null,
    image_url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Batería LiPo de grado profesional con celdas emparejadas para entrega constante de potencia. Conector de descarga original XT60 y terminal de balanceo JST-XH.",
    specifications: {
      "Capacidad": "2200 mAh",
      "Voltaje": "11.1V (3S)",
      "Tasa de descarga": "45C continua",
      "Peso": "178 gramos",
      "Dimensiones": "106 x 34 x 24 mm"
    }
  },
  // 18. Tubo de Fibra de Carbono Estructural 10mm x 500mm
  {
    id: 18,
    sku: "TUB-CF-10500",
    name: "Tubo de Fibra de Carbono Pultruido 10mm x 500mm para Alas",
    title: "Tubo de Fibra de Carbono Pultruido 10mm x 500mm para Alas",
    slug: "tubo-fibra-de-carbono-10mm-500mm",
    brand: "AeroCarbon",
    category_id: 8,
    categoryId: 8,
    scale: "RC Estándar",
    material: "Fibra de Carbono",
    specs_line: "Diámetro Ext. 10mm | Int. 8mm | Largo 500mm | Mate",
    compatible_models: "Largueros alares, bayonetas desmontables y fuselajes",
    price: 45.00,
    old_price: null,
    stock: 26,
    stockQuantity: 26,
    badge: "Nuevo",
    image_url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
    images: ["https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80"],
    is_active: true,
    isActive: true,
    itemType: "PRODUCT",
    actionType: "ADD_TO_CART",
    availability: "IN_STOCK",
    description: "Tubo estructural pultruido en fibra de carbono de altísima rigidez a la flexión. Ideal como bayoneta central para ensamblaje de alas bipartitas o refuerzo longitudinal de fuselajes.",
    specifications: {
      "Diámetro exterior": "10.0 mm",
      "Diámetro interior": "8.0 mm",
      "Longitud": "500 mm",
      "Peso": "22 gramos"
    }
  }
];

export const initialOccasions = [
  { id: 1, name: "Mandos y Control", slug: "mandos-y-control", iconName: "Wrench", isActive: true },
  { id: 2, name: "Dubro Original", slug: "dubro-original", iconName: "ShieldCheck", isActive: true },
  { id: 3, name: "Varillaje y Alambres", slug: "varillaje-y-alambres", iconName: "Activity", isActive: true },
  { id: 4, name: "Great Planes", slug: "great-planes-brand", iconName: "Plane", isActive: true },
  { id: 5, name: "Propulsión Brushless", slug: "propulsion-brushless", iconName: "Zap", isActive: true },
  { id: 6, name: "Fibra de Carbono", slug: "fibra-de-carbono", iconName: "Cpu", isActive: true }
];

// Helper export for backwards compatibility
export const initialItems = initialProducts;
