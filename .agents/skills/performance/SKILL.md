---
name: performance
description: Técnicas avanzadas de optimización de rendimiento web en Next.js, code splitting con imports dinámicos, eliminación de render-blocking resources, compresión de bundle y métricas Core Web Vitals para tiempos de carga menores a 1 segundo.
---

# Performance Skill — Optimización de Carga y Core Web Vitals (< 1s)

Este skill define la metodología, reglas de arquitectura y patrones de código para garantizar que la plataforma **Hobby Bolivia** cargue en **menos de 1 segundo** (FCP < 800ms, LCP < 1.2s, CLS < 0.05).

---

## 1. Principios de Optimización de Imports

### 1.1. Code Splitting con `next/dynamic`
Los componentes que no son visibles de inmediato en el viewport inicial (Above The Fold) NO deben incluirse en el bundle de JavaScript principal:
- **Modales y Drawers**: Deben cargarse únicamente cuando el usuario interactúa (on-demand) o en diferido con `ssr: false`:
  ```tsx
  import dynamic from 'next/dynamic';

  const CartQuoteDrawer = dynamic(
    () => import('@/components/catalog/CartQuoteDrawer').then(m => m.CartQuoteDrawer),
    { ssr: false }
  );
  const QuickSpecsModal = dynamic(
    () => import('./QuickSpecsModal').then(m => m.QuickSpecsModal),
    { ssr: false }
  );
  ```
- **Secciones Below-The-Fold**: Testimonios, políticas extendidas y strips de newsletter deben dividirse en chunks asíncronos para no bloquear la interacción principal.

### 1.2. Tree-Shaking de Librerías de Iconos (`lucide-react`)
Evitar la inclusión innecesaria de todo el árbol de iconos mediante `optimizePackageImports` en `next.config.ts`:
```ts
experimental: {
  optimizePackageImports: ['lucide-react', 'clsx', 'tailwind-merge'],
}
```

---

## 2. Optimización de Fuentes (Zero Render-Blocking)

- **Nunca usar `<link href="https://fonts.googleapis.com...">` en el `<head>`**: Esto agrega 2 conexiones TCP/TLS adicionales y bloquea el renderizado por 200-400ms.
- **Usar `next/font/google`**: Descarga y hospeda las fuentes localmente en tiempo de compilación con `display: 'swap'` y `preload: true`:
  ```tsx
  import { Manrope } from 'next/font/google';

  const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '600', '700', '800'],
    display: 'swap',
    variable: '--font-manrope',
  });
  ```

---

## 3. Optimización de Imágenes y Decodificación Asíncrona

- Toda imagen de producto en tarjetas de catálogo debe incluir:
  - `loading="lazy"` para evitar descargas fuera de pantalla.
  - `decoding="async"` para que la decodificación de la imagen ocurra en un hilo secundario sin congelar el hilo principal de JavaScript.
  - Contenedor con `aspect-ratio` o dimensiones explícitas (`h-40`) para evitar Cumulative Layout Shift (CLS).

---

## 4. Checklist para Tiempo de Carga Sub-Segundo (< 1s)

- [ ] Modales (`QuickSpecs`, `CartQuoteDrawer`, `CustomArrangementModal`) cargados con `next/dynamic`.
- [ ] Fuentes autohospedadas mediante `next/font/google` sin peticiones externas en el `<head>`.
- [ ] `optimizePackageImports` activo en `next.config.ts`.
- [ ] Compresión Gzip/Brotli habilitada con `compress: true`.
- [ ] Decodificación asíncrona (`decoding="async"`) en imágenes del catálogo.
- [ ] Build limpio verificado con `npm run build`.
