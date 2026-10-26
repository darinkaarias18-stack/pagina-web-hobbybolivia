---
name: accessibility
description: Criterios de éxito WCAG 2.1 niveles A y AA, fórmulas de contraste cromático relativo, accesibilidad semántica, navegación por teclado y diseño universal.
---

# Accessibility Skill — Estándares WCAG 2.1 AA

Este skill define los métodos de cálculo, criterios de evaluación y soluciones para asegurar que la web de **Hobby Bolivia** sea accesible e inclusiva para todos los usuarios.

---

## 1. Criterios Clave de WCAG 2.1 Nivel AA

### 1.1. Criterio 1.4.3: Contraste Mínimo (Nivel AA)
La presentación visual de texto e imágenes de texto debe mantener un ratio de contraste de al menos:
- **Texto Normal (< 18pt / < 14pt bold)**: **4.5 : 1** mínimo.
- **Texto Grande (≥ 18pt / ≥ 14pt bold)**: **3.0 : 1** mínimo.
- **Criterio 1.4.11: Contraste no textual**: Los componentes de interfaz de usuario e iconos informativos deben tener un contraste de al menos **3.0 : 1** contra colores adyacentes.

### 1.2. Fórmula de Luminancia Relativa y Contraste
El ratio se calcula como:
$$\text{Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$$
Donde $L_1$ es la luminancia relativa del color más claro y $L_2$ la del más oscuro.

---

## 2. Pautas de Implementación en Código

### 2.1. Imágenes y Elementos Gráficos (Criterio 1.1.1)
- Cada etiqueta `<img />` debe incluir un atributo `alt` significativo.
- En tarjetas de repuestos:
  ```tsx
  <img src={imgSrc} alt={`Repuesto de aeromodelismo: ${name} (SKU: ${product.sku})`} />
  ```
- Iconos puramente decorativos deben incluir `aria-hidden="true"` para no saturar lectores de pantalla.

### 2.2. Botones Interactivos sin Texto Visible (Criterio 4.1.2)
- Todo botón compuesto únicamente por iconos (como corazones de favoritos, botones de cerrar 'X', vistas rápidas) DEBE incluir `aria-label`:
  ```tsx
  <button aria-label="Cerrar modal de especificaciones técnicas">
    <X className="w-5 h-5" aria-hidden="true" />
  </button>
  ```

### 2.3. Jerarquía Semántica de Encabezados (Criterio 1.3.1)
- Debe existir un único encabezado `<h1>` por página (en el Hero Section).
- Los títulos de sección usan `<h2>` (ej. Catálogo de Repuestos, Categorías, Políticas).
- Los nombres de productos o subsecciones usan `<h3>`.

### 2.4. Ergonomía Táctil en Dispositivos Móviles (Criterio 2.5.5)
- El tamaño del objetivo táctil debe ser de al menos **44x44 píxeles CSS** en botones principales, menús y selectores de filtros.
