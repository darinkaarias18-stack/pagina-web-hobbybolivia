---
name: security
description: Guía operativa y listas de verificación para auditorías de seguridad, protección de endpoints, firmas criptográficas de sesión, mitigación OWASP y hardening en Next.js.
---

# Security Skill — Directrices Operativas de Ciberseguridad

Este skill proporciona los procedimientos, scripts y listas de verificación para auditar y reforzar la seguridad en la plataforma **Hobby Bolivia**.

---

## 1. Comandos de Verificación Rápida

### 1.1. Auditoría de Dependencias
```bash
npm audit
```

### 1.2. Inspección de Secretos Expuestos en Git
```bash
git status --ignored
git log -p -S "ADMIN_PASSWORD"
```

### 1.3. Verificación de Compilación y Tipado Estricto
```bash
npx tsc --noEmit
```

---

## 2. Lista de Verificación OWASP para Next.js App Router

### A01: Control de Acceso Roto (Broken Access Control)
- [ ] ¿Están todas las rutas de `/admin/*` protegidas por middleware en servidor?
- [ ] ¿Requieren autenticación todos los Route Handlers con métodos `POST`, `PUT`, `DELETE`?
- [ ] ¿Se valida el rol `SUPERADMIN` en acciones críticas como `/api/db-setup` y `/api/users`?

### A02: Fallos Criptográficos (Cryptographic Failures)
- [ ] ¿Las sesiones utilizan tokens firmados con HMAC-SHA256 y secreto seguro (`AUTH_SECRET`)?
- [ ] ¿Las contraseñas de usuarios están protegidas con hash criptográfico y salt?
- [ ] ¿Las cookies sensibles tienen los flags `HttpOnly`, `SameSite=Lax` y `Secure`?

### A03: Inyección (Injection - SQL & XSS)
- [ ] ¿Todas las consultas MySQL utilizan parámetros vinculados (`?`) sin concatenar cadenas?
- [ ] ¿Se sanitizan las entradas de texto en renderizado dinámico contra XSS?

### A04: Diseño Inseguro (Insecure Design)
- [ ] ¿Las credenciales maestras están excluidas de la interfaz gráfica del cliente (`/login`)?
- [ ] ¿Se filtran los datos de clientes (PII) en endpoints públicos?

### A05: Configuración Incorrecta de Seguridad (Security Misconfiguration)
- [ ] ¿Están configuradas las cabeceras HTTP de seguridad (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `HSTS`)?
- [ ] ¿Los endpoints de depuración no exponen errores de infraestructura ni credenciales en respuestas HTTP?
