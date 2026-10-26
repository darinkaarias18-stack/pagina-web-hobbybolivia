---
name: audit
description: Procedimientos y listas de verificación para auditorías técnicas 360°, inspección de enlaces comerciales, validación de TypeScript, consistencia de datos y rendimiento en Next.js.
---

# Audit Skill — Procedimientos de Auditoría Técnica 360°

Este skill contiene las directrices operativas y comandos para realizar escaneos completos sobre el código, la experiencia del usuario y la conversión en **Hobby Bolivia**.

---

## 1. Fases del Escaneo 360°

```
+---------------------------------------------------------------------------------+
|  1. Código y Tipado  -->  2. Enlaces & WhatsApp  -->  3. WCAG AA  -->  4. Móvil |
+---------------------------------------------------------------------------------+
```

### Fase 1: Validación de Código y Compilación
- Ejecutar verificación estricta de TypeScript:
  ```bash
  npx tsc --noEmit
  ```
- Validar que no existan errores de compilación ni módulos rotos en Turbopack o Next.js dev.

### Fase 2: Auditoría de Enlaces de WhatsApp (+591 77293446)
- Verificar que ninguna referencia conserve números de prueba antiguos o ficticios.
- Comprobar que la URL cumpla el formato:
  `https://wa.me/59177293446?text=...`
- Revisar que cada punto de contacto (TopBar, Hero, ProductCards, Modales, Barra Móvil, Footer) incluya el contexto adecuado en el mensaje pre-armado.

### Fase 3: Auditoría de Interfaces y Usabilidad
- Confirmar que los modales (QuickSpecs, CartDrawer, CustomArrangement) cuenten con:
  1. Fondo con desenfoque (`backdrop-blur`).
  2. Botón táctil 'X' con `aria-label` accesible.
  3. Desplazamiento interno independiente para pantallas pequeñas.

### Fase 4: Reporte y Clasificación de Hallazgos
- **Crítico (P1)**: Enlace de compra roto, error de compilación, fallo de accesibilidad que bloquea el uso.
- **Importante (P2)**: Contraste insuficiente en textos secundarios, touch target menor a 40px en móvil.
- **Oportunidad (P3)**: Microinteracción mejorable, animación más fluida o pulido visual menor.
