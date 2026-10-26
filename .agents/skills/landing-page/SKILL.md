---
name: landing-page
description: Guía especializada y patrones de diseño para construir landing pages de catálogos comerciales de alta conversión, responsivas con Tailwind CSS, optimizadas para móviles y con flujos directos de venta por WhatsApp.
---

# Landing Page Skill — Catálogos Comerciales y E-Commerce

Este skill proporciona la metodología, componentes clave y patrones de conversión para desarrollar o refinar landing pages de catálogos comerciales, enfocado en el **Catálogo de Repuestos de Aviones a Escala** de Hobby Bolivia.

---

## 1. Anatomía de una Landing Page de Catálogo de Alta Conversión

Una landing page efectiva para aeromodelismo y componentes técnicos debe estructurarse en las siguientes capas estratégicas:

1. **Top Bar Informativa**:
   - Mensaje de despacho nacional (La Paz, Santa Cruz, Cochabamba, Tarija, etc.), métodos de pago (QR Simple, transferencias) y acceso directo a WhatsApp.
2. **Hero Section con Filtro Rápido**:
   - Propuesta de valor clara en dos tonos ("Repuestos de precisión para aviones a escala").
   - 4 sellos de confianza visibles: Envíos blindados en tubos PVC, Garantía 100% nuevos, Pago QR Simple y Asesoría técnica inmediata.
   - Acceso dual: "Explorar Catálogo" y botón verde de "Asesoría Técnica WhatsApp".
3. **Barra de Marcas y Garantías**:
   - Logotipos o menciones de marcas reconocidas: Dubro, Great Planes, APC Propellers, E-flite, Sullivan, etc.
4. **Catálogo Interactivo de Repuestos**:
   - Barra de búsqueda instantánea por SKU, modelo o marca.
   - Pestañas/chips horizontales para filtrado por categorías con scroll táctil en móvil.
   - Filtros avanzados: Escala (1/4, 1/5, 40-60, Glow, Gas, Eléctrico), Material (Acero templado, Fibra de carbono, Nylon), Disponibilidad y Rango de Precios.
5. **Tarjetas de Producto (Dual Action)**:
   - Visualización clara del repuesto sobre fondo blanco neutral.
   - Badge de estado (Nuevo, Best Seller, Oferta).
   - Datos clave: Marca, SKU, Escala y Material.
   - Botón 1: "Añadir al Carrito" (para armar pedido acumulado).
   - Botón 2: "Pedir por WhatsApp" (botón verde para compra con 1 solo toque).
   - Botón 3: "Vista Rápida" (detalles técnicos y medidas de rosca/diámetro).
6. **Modal de Especificaciones Técnicas (Quick Specs)**:
   - Selector de cantidad.
   - Botón directo de compra por WhatsApp con SKU y especificaciones precargadas.
7. **Barra Fija Inferior en Móviles (Sticky Mobile Bar)**:
   - Acceso inmediato al catálogo, filtros activos, WhatsApp oficial (+591 77293446) y cotizador.
8. **Módulos de Confianza y Políticas**:
   - Políticas de embalaje frágil (tubos de PVC rígido para alambres y varillas).
   - Testimonios reales de pilotos y aeromodelistas bolivianos.

---

## 2. Implementación con Tailwind CSS

### 2.1. Clases de Ergonomía Móvil
- **Grid responsivo de productos**:
  ```tsx
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
  ```
- **Chips de categorías desplazables en móvil**:
  ```tsx
  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
  ```
- **Botón Flotante / Sticky Mobile Bar**:
  ```tsx
  <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#161311]/95 backdrop-blur-md border-t border-[#2D2622] p-2 flex items-center justify-around">
  ```

---

## 3. Flujo de Conversión WhatsApp (+591 77293446)

Construir URLs con el helper estándar:
```ts
export function getWhatsAppProductUrl(product: Product, phone = '59177293446'): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = `Hola Hobby Bolivia, deseo comprar el repuesto:\n• *${product.name}*\n• SKU: ${product.sku}\n• Precio: Bs. ${product.price.toFixed(2)}\n\n¿Tienen disponibilidad para envío inmediato?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
```

---

## 4. Checklist de Validación Móvil (100% Mobile Ready)

- [ ] Sin desplazamiento horizontal accidental en pantallas de 360px a 430px (`overflow-x-hidden` en contenedor raíz).
- [ ] Botones táctiles de al menos 44px de altura.
- [ ] Textos legibles sin zoom (mínimo 12px para secundario, 14px-16px para cuerpo).
- [ ] Los modales tienen scroll interno y botón de cierre táctil fácil de pulsar.
- [ ] El botón flotante de WhatsApp no obstruye botones críticos del carrito.
