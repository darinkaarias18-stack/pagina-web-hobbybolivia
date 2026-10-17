export const initialSiteConfig = {
  companyName: "Hobby Bolivia",
  subtitle: "Aeromodelismo & R/C",
  domain: "https://hobbybolivia.com",
  logoUrl: "https://hobbybolivia.com/icon.svg",
  heroBannerUrl: "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
  primaryColor: "#e04f26",
  secondaryColor: "#162544",
  accentColor: "#2563eb",
  currency: "$us",
  whatsappNumber: "+59178000000",
  topBarText: "Hobby Bolivia · Aeromodelismo y radio control en Bolivia | Envíos a todo el país",
  contactEmail: "contacto@hobbybolivia.com",
  themePreset: "ferreteria",
  cardStyle: "with_button" as const,
  desktopColumns: 6,
  showTopBar: true,
  termsPolicy: `TÉRMINOS Y CONDICIONES - HOBBY BOLIVIA
1. GENERAL: Hobby Bolivia es la tienda especializada en aeromodelismo, radio control, partes, repuestos y accesorios en Bolivia.
2. PRECIOS: Los precios están expresados en dólares americanos ($us) y pueden cancelarse en moneda nacional al tipo de cambio acordado o por transferencia QR.
3. ENVÍOS: Despachamos repuestos y kits a Santa Cruz, La Paz, Cochabamba y todas las ciudades del territorio boliviano mediante empresas de transporte terrestre o courier aéreo.
4. COMPATIBILIDAD: Recomendamos verificar las medidas, roscas y especificaciones técnicas antes de instalar los componentes en sus modelos.`,
  privacyPolicy: `POLÍTICA DE PRIVACIDAD - HOBBY BOLIVIA
En Hobby Bolivia valoramos su privacidad. Sus datos de contacto y entrega son utilizados únicamente para la coordinación de envíos y emisión de notas de venta. No compartimos su información con terceros.`,
  shippingPolicy: `POLÍTICA DE ENVÍOS A TODA BOLIVIA
- Santa Cruz de la Sierra: Entregas el mismo día o al día siguiente en nuestro punto de entrega o por delivery.
- Envíos Nacionales: Despachos a La Paz, Cochabamba, Sucre, Tarija, Oruro, Potosí, Beni y Pando vía Flota o Courier con número de guía inmediato.
- Empaque Seguro: Todos los repuestos, alambres y partes delicadas viajan protegidos contra impactos.`,
  returnsPolicy: `GARANTÍA Y CONFORMIDAD
- Productos 100% originales de marcas internacionales de prestigio (Dubro, Great Planes, etc.).
- Verifique el contenido de su paquete al recibirlo. En caso de daño por transporte o discrepancia, comuníquese con nosotros por WhatsApp dentro de las 48 horas.`
};

export const initialCategories = [
  {
    name: "Conectores y Linea de Control",
    slug: "conectores-y-linea-de-control",
    order: 1,
    imageUrl: "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
    description: "Conectores E/Z, bellcranks, alambres push rod, clevises y accesorios esenciales para sistemas de mando y control en aeromodelos y vehículos RC."
  }
];

export const initialOccasions = [
  { name: "Mandos y Control", slug: "mandos-y-control", iconName: "Wrench" },
  { name: "Dubro Original", slug: "dubro-original", iconName: "ShieldCheck" },
  { name: "Varillaje y Alambres", slug: "varillaje-y-alambres", iconName: "Activity" },
  { name: "Great Planes", slug: "great-planes-brand", iconName: "Plane" }
];

export const initialBanners = [
  {
    title: "El hangar de quienes construyen y vuelan",
    subtitle: "Repuestos, hélices, servos, combustibles y todo lo que necesitas para armar, reparar y volar.",
    imageUrl: "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp",
    buttonText: "Explorar el catálogo →",
    buttonUrl: "#catalogo",
    placement: "HERO" as const,
    isActive: true
  }
];

export const initialItems = [
  {
    sku: "DUBQ3570",
    title: "Conectores E/Z Dubro (12)",
    slug: "conectores-e-z-dubro-12",
    brand: "Dubro",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 31.70,
    availability: "IN_STOCK" as const,
    stockQuantity: 12,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp"],
    description: "12 conectores E/Z originales Dubro. El estándar de oro en aeromodelismo para acoplar varillas a brazos de servo de forma segura, rápida y sin holguras mecánicas.",
    specifications: {
      "Marca": "Dubro",
      "Modelo": "E/Z Connector",
      "Cantidad": "12 unidades",
      "Código SKU": "DUBQ3570",
      "Uso recomendado": "Aviones RC, Planeadores y Drones"
    },
    occasionSlugs: ["mandos-y-control", "dubro-original"]
  },
  {
    sku: "DUBQ8450",
    title: "Conector Mini E/Z (2) Dubro",
    slug: "conector-mini-e-z-2-dubro",
    brand: "Dubro",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 5.70,
    availability: "IN_STOCK" as const,
    stockQuantity: 24,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/19df1961af-dubq8450-t.webp"],
    description: "Pack de 2 conectores Mini E/Z Dubro diseñados especialmente para micro servos y varillajes delgados en modelos eléctricos y park flyers.",
    specifications: {
      "Marca": "Dubro",
      "Modelo": "Mini E/Z",
      "Cantidad": "2 conectores con prisionero",
      "Código SKU": "DUBQ8450"
    },
    occasionSlugs: ["mandos-y-control", "dubro-original"]
  },
  {
    sku: "DUBQ2000",
    title: "Bellcrank 90º Standard de plastico Dubro",
    slug: "bellcrank-90o-standard-de-plastico-dubro",
    brand: "Dubro",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 3.20,
    availability: "IN_STOCK" as const,
    stockQuantity: 16,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/d315fa511a-dubq2000tn-t.webp"],
    description: "Bellcrank de 90º estándar fabricado en plástico de alto impacto Dubro. Incluye tornillería, casquillos de bronce y arandelas para una transmisión de mando angular suave y precisa.",
    specifications: {
      "Marca": "Dubro",
      "Tipo": "Bellcrank 90 grados",
      "Material": "Nylon de alta resistencia + Bujes de latón",
      "Código SKU": "DUBQ2000"
    },
    occasionSlugs: ["mandos-y-control", "dubro-original"]
  },
  {
    sku: "AIB62993",
    title: "Alambre de Push Road con rosca 2 mm (2) y 4 clevises",
    slug: "alambre-de-push-road-con-rosca-2-mm-2-y-4-clevises",
    brand: "Dubro",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 4.00,
    availability: "IN_STOCK" as const,
    stockQuantity: 20,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp"],
    description: "Set de 2 varillas de alambre push rod con rosca métrica de 2 mm y 4 clevises metálicos de acople rápido para mando de alerones, profundidad y timón de dirección.",
    specifications: {
      "Diámetro": "2 mm",
      "Contenido": "2 alambres push rod + 4 clevises",
      "Longitud": "Aprox. 300 mm"
    },
    occasionSlugs: ["varillaje-y-alambres"]
  },
  {
    sku: "GPMQ3741",
    title: "Alambre con rosca completa 2-56 de 12\" Great Planes",
    slug: "alambre-con-rosca-completa-2-56-de-12-great-planes",
    brand: "Great Planes",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 2.70,
    availability: "IN_STOCK" as const,
    stockQuantity: 18,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/c2253e5048-gpmq3741-t.webp"],
    description: "Varilla de alambre de acero con rosca continua 2-56 en sus 12 pulgadas de largo. Original Great Planes de excelente rigidez torsional.",
    specifications: {
      "Marca": "Great Planes",
      "Rosca": "2-56 completa",
      "Longitud": '12 pulgadas (305 mm)',
      "Código SKU": "GPMQ3741"
    },
    occasionSlugs: ["varillaje-y-alambres", "great-planes-brand"]
  },
  {
    sku: "DUBQ1474",
    title: "Alambre con rosca 4-40 en un solo extremo 12\"",
    slug: "alambre-con-rosca-4-40-en-un-solo-extremo-12",
    brand: "Dubro",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 1.50,
    availability: "IN_STOCK" as const,
    stockQuantity: 25,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/7f5b761d4f-dubq1474-large-t.webp"],
    description: "Varilla de control rígida de 12 pulgadas con rosca 4-40 en un extremo. Perfecta para aviones medianos y grandes que exigen cero deflexión bajo carga aerodinámica.",
    specifications: {
      "Marca": "Dubro",
      "Rosca": "4-40 (un extremo)",
      "Longitud": '12 pulgadas',
      "Código SKU": "DUBQ1474"
    },
    occasionSlugs: ["varillaje-y-alambres", "dubro-original"]
  },
  {
    sku: "DUBQ1464",
    title: "Alambre con rosca 2-56 en un solo extremo 12\"",
    slug: "alambre-con-rosca-2-56-en-un-solo-extremo-12",
    brand: "Dubro",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 1.40,
    availability: "IN_STOCK" as const,
    stockQuantity: 30,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/7f5b761d4f-dubq1464-large-t.webp"],
    description: "Alambre acerado de control de 12 pulgadas de longitud con rosca 2-56 en un extremo, para brazos de servo estándar y bocinas de mando.",
    specifications: {
      "Marca": "Dubro",
      "Rosca": "2-56 (un extremo)",
      "Longitud": '12 pulgadas',
      "Código SKU": "DUBQ1464"
    },
    occasionSlugs: ["varillaje-y-alambres", "dubro-original"]
  },
  {
    sku: "DUBQ9306",
    title: "Alambre 4-40 de 12\" de largo con clevis",
    slug: "alambre-4-40-de-12-de-largo-con-clevis",
    brand: "Dubro",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 3.50,
    availability: "IN_STOCK" as const,
    stockQuantity: 15,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/7fcaad4571-dubq9306-large-t.webp"],
    description: "Varilla de control 4-40 de 12 pulgadas con clevis de nylon/acero reforzado incluido para máxima seguridad en mandos principales de vuelo.",
    specifications: {
      "Marca": "Dubro",
      "Rosca": "4-40",
      "Longitud": '12 pulgadas',
      "Incluye": "Clevis de seguridad",
      "Código SKU": "DUBQ9306"
    },
    occasionSlugs: ["varillaje-y-alambres", "dubro-original"]
  },
  {
    sku: "DUBQ9108",
    title: "Alambre 2-56 de 12\" de largo con clevis",
    slug: "alambre-2-56-de-12-de-largo-con-clevis",
    brand: "Dubro",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 2.60,
    availability: "IN_STOCK" as const,
    stockQuantity: 22,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/ac56aa1747-dubq9108-large-t.webp"],
    description: "Varilla de alambre 2-56 de 12 pulgadas con clevis Dubro prearmado. Ensamble inmediato sin necesidad de herramientas especiales.",
    specifications: {
      "Marca": "Dubro",
      "Rosca": "2-56",
      "Longitud": '12 pulgadas',
      "Incluye": "Clevis Dubro",
      "Código SKU": "DUBQ9108"
    },
    occasionSlugs: ["varillaje-y-alambres", "dubro-original"]
  },
  {
    sku: "DUBQ2005",
    title: "90º Bellcrank Micro de plastico Dubro",
    slug: "90o-bellcrank-micro-de-plastico-dubro",
    brand: "Dubro",
    categorySlug: "conectores-y-linea-de-control",
    itemType: "PRODUCT" as const,
    price: 3.20,
    availability: "IN_STOCK" as const,
    stockQuantity: 19,
    actionType: "ADD_TO_CART" as const,
    images: ["https://hobbybolivia.com/media/products/586ddc4ce2-dubq2005-large-t.webp"],
    description: "Micro bellcrank de 90 grados en material plástico ultraligero y resistente Dubro. Diseñado para espacios reducidos en fuselajes y alas de modelos compactos.",
    specifications: {
      "Marca": "Dubro",
      "Tipo": "Micro Bellcrank 90 grados",
      "Material": "Plástico técnico",
      "Código SKU": "DUBQ2005"
    },
    occasionSlugs: ["mandos-y-control", "dubro-original"]
  }
];
