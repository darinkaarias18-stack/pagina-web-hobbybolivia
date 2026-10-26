---
name: web-design
description: Metodologías y estándares de diseño web moderno, maquetación responsiva, jerarquía visual, espaciado, estados de componentes y optimización de interfaces para catálogos comerciales.
---

# Web Design Skill — Diseño de Interfaces Web Modernas

Este skill proporciona patrones, reglas de maquetación y estándares estéticos para construir interfaces de alto impacto visual y usabilidad superior en la web de **Hobby Bolivia**.

---

## 1. Fundamentos de Maquetación y Layout

### 1.1. Sistema de Cuadrícula (Grid) y Contenedores
- **Ancho máximo de lectura**: `max-w-[1320px]` centrado con padding horizontal dinámico (`px-4 sm:px-6 lg:px-8`).
- **Ritmo Vertical de Secciones**:
  - Hero y áreas clave: `py-12 sm:py-16 md:py-20`.
  - Catálogo y contenido principal: `py-10 sm:py-14`.
  - Cintas divisorias y llamadas a la acción: `py-6 sm:py-8`.
- **Grids de Productos Adaptativos**:
  - Móviles (`< 640px`): `grid-cols-1` o `grid-cols-2` según densidad de datos.
  - Tablets (`640px - 1024px`): `grid-cols-2 sm:grid-cols-2 md:grid-cols-3`.
  - Escritorio (`> 1024px` con barra lateral): `grid-cols-2 xl:grid-cols-3`.

### 1.2. Relación de Contraste y Fondos
- **Fondo General**: Crema suave `#F5F2EB` (neutral cálido, 0% deslumbramiento).
- **Tarjetas y Cajas**: Blanco crema `#FAF8F5` con reborde `#E2DCD3`.
- **Secciones Destacadas (Dark)**: `#161311` y `#1E1916` con detalles en dorado `#D4A359` y naranja `#F85606`.

---

## 2. Anatomía de Componentes UI

### 2.1. Tarjetas de Catálogo (Product Cards)
- **Contenedor**: Bordes redondeados pronunciados (`rounded-2xl`), fondo `#FAF8F5`, sombra sutil en reposo.
- **Área de Imagen**:
  - Fondo blanco puro `#FFFFFF` enmarcado (`rounded-xl border border-[#EBE5DB]`).
  - Imagen centrada con `object-contain`, sin recortes forzados ni distorsión.
  - Altura contenida (`h-36` a `h-44`) para uniformidad visual.
- **Bloque de Especificaciones**:
  - SKU y marca en fuente mono/condensada en la parte superior.
  - Título con corte a dos líneas (`line-clamp-2`) para mantener alturas homogéneas.
  - Píldora de precio en carbón oscuro (`#211E1C`) con acento dorado.
- **Acciones Rápidas**:
  - Botón primario de carrito o pedido.
  - Botón verde directo de WhatsApp (+591 77293446).
  - Botón de vista rápida (ojo).

### 2.2. Modales y Paneles Deslizables (Drawers)
- Fondo desenfocado: `bg-[#161311]/75 backdrop-blur-xs`.
- Entrada animada: `animate-in fade-in zoom-in-95 duration-200`.
- Cabecera fija con botón de cierre táctil visible de al menos 40x40px.

---

## 3. Accesibilidad y Estándares WCAG

- **Contraste Mínimo de Texto**: Relación 4.5:1 para texto normal y 3:1 para texto grande o negrita.
  - Texto `#1A1817` sobre fondo `#FAF8F5` (Contraste 14.8:1 - Pasa AAA).
  - Texto `#FAF8F5` sobre fondo `#161311` (Contraste 16.2:1 - Pasa AAA).
  - Texto `#161311` sobre botón dorado `#D4A359` (Contraste 6.4:1 - Pasa AA).
- **Indicadores de Foco**: Siempre visibles con `focus-visible:ring-2 focus-visible:ring-[#D4A359]`.
