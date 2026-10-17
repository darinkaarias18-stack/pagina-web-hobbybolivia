# 🌸 Hobby Bolivia - Plataforma E-Commerce de Florería & Detalles

Plataforma web integral para la florería y tienda de detalles **"Hobby Bolivia"** ([https://hobbybolivia.com/](https://hobbybolivia.com/)). Desarrollada con arquitectura de alta conversión, Next.js (App Router), TypeScript, Prisma ORM (MySQL), Tailwind CSS y Lucide React.

---

## 🎨 Identidad Visual y Paleta de Conversión
- **Color Primario (Botones CTA "AGREGAR", "BUSCAR", "COTIZAR"):** Rosa Carmesí Vibrante (`#E11D48` / `rose-600`, hover `#BE123C` / `rose-700`).
- **Color Secundario (Top Bar & Garantías):** Verde Botánico Profundo (`#064E3B`) y Verde Fresco (`#059669`) para indicadores de "Flores Frescas / Entrega Hoy".
- **Color Acento (Badges de Oferta):** Amarillo Girasol (`#FACC15` con texto `#111827`) para etiquetas de descuento (`-15%`, `-20%`).
- **Fondos de Contraste:** Blanco Puro (`#FFFFFF`) para fotografía floral y Rosa Crema Suave (`#FFF1F2`) para banners de personalización.
- **Isotipo / Logotipo:** Configurable en base de datos con fallback automático SVG botanical floral + tipografía serif contemporánea.

---

## 🗄️ Modelado de Base de Datos MySQL (`prisma/schema.prisma`)
1. `SiteConfig`: Identidad de marca, logo, número de WhatsApp, topbar y políticas oficiales.
2. `User`: Administradores del panel.
3. `Category`: Categorías y subcategorías con conteo exacto de artículos.
4. `Occasion`: Ocasiones especiales (San Valentín, Día de la Madre, 21 de Septiembre, Aniversarios).
5. `CatalogItem`: Arreglos florales y servicios con SKU, precios en Bolivianos (`Bs.`), descuentos, variantes (colores de rosas, envoltura), especificaciones dinámicas y disponibilidad.
6. `Banner`: Banners promocionales administrables.
7. `QuoteOrder`: Pedidos y cotizaciones con dedicatoria para tarjeta de felicitación, fecha/hora y dirección.
8. `ClaimRecord`: Libro de Reclamaciones oficial con código de seguimiento (`REC-2026-XXXX`).

---

## 🚀 Backend APIs (`src/app/api/...`)
- `GET / POST /api/items`: Catálogo con filtros facetados (`category`, `occasion`, `flowerType`, `minPrice`, `maxPrice`, `availability`, `q`, `sort`).
- `GET / PUT / DELETE /api/items/[id]`: Gestión de arreglo floral individual.
- `GET / POST / PUT / DELETE /api/categories`: Gestión de categorías.
- `GET / POST / PUT / DELETE /api/occasions`: Gestión de ocasiones especiales.
- `GET / POST / PUT / DELETE /api/banners`: Gestión de banners promocionales.
- `POST / GET / PUT /api/quotes`: Guarda pedidos/cotizaciones con dedicatoria en base de datos y genera el enlace directo a WhatsApp.
- `POST / GET / PUT /api/claims`: Registro público y resolución de reclamos en el Libro de Reclamaciones.
- `GET / PUT /api/settings`: Configuración en vivo de la tienda.

---

## 🌿 Datos Semilla Realistas (`prisma/seed.ts`)
Incluye **18 productos y servicios reales con fotografía de alta resolución**, precios en Bolivianos (`Bs.`), descuentos y variantes:
- *Bouquet Imperial de 24 Rosas Rojas de Exportación* (`Bs. 240,00`, antes `Bs. 280,00`, `-14%`)
- *Box Cilíndrico "Amor Eterno" con 18 Rosas y Ferrero Rocher* (`Bs. 320,00`, variantes de color)
- *Ramo Radiante de 10 Girasoles e Ilusión* (`Bs. 165,00`)
- *Rosa Eterna Encantada en Cúpula de Cristal con Luz LED* (`Bs. 210,00`)
- *Canasta Primavera con Liliums, Gerberas y Vino Tinto* (`Bs. 390,00`)
- *Orquídea Phalaenopsis Doble Vara en Maceta Cerámica* (`Bs. 295,00`, Agotado)
- *Servicio de Decoración Floral para Bodas y Eventos Corporativos* (`Bs. 1.500,00`, Cotización)
- *Box Cuadrado de 50 Rosas Mixtas Premium con Dedicatoria Caligráfica* (`Bs. 580,00`)

---

## 💻 Puesta en Marcha

### 1. Variables de Entorno (`.env`)
Configura la cadena de conexión de MySQL en tu archivo `.env`:
```env
DATABASE_URL="mysql://usuario:password@localhost:3306/hobbybolivia"
NEXT_PUBLIC_SITE_URL="https://hobbybolivia.com"
NEXT_PUBLIC_WHATSAPP_NUMBER="+59178000000"
```

### 2. Migración y Seed en MySQL
```bash
# Generar cliente de Prisma
npx prisma generate

# Empujar el esquema a la base de datos MySQL
npx prisma db push

# Sembrar los datos iniciales de Hobby Bolivia
npm run seed
```

*Nota:* La aplicación cuenta con una capa de resiliencia (`src/lib/db.ts`) con almacenamiento local que permite que la tienda y el panel funcionen de forma inmediata para desarrollo o pruebas visuales incluso antes de iniciar el servicio MySQL local.

### 3. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Visita [http://localhost:3000](http://localhost:3000) para la tienda pública y [http://localhost:3000/admin](http://localhost:3000/admin) para el panel de administración.
