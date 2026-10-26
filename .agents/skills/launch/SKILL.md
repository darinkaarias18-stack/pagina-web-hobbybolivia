---
name: launch
description: Guía de despliegue continuo (CI/CD) en Vercel y GitHub, configuración de dominios personalizados, emisión de certificados SSL/HTTPS, variables de entorno y validación de builds para producción.
---

# Launch Skill — Guía Operativa de Despliegue en Vercel y GitHub

Este skill detalla el procedimiento paso a paso para publicar y mantener en producción el sitio web de **Hobby Bolivia** con integración continua entre GitHub y Vercel.

---

## 1. Conexión de Repositorio en GitHub

1. **Inicializar y Confirmar Cambios Locales**:
   ```bash
   git status
   git add .
   git commit -m "feat: optimizaciones de catalogo, whatsapp y accesibilidad"
   ```
2. **Vincular Repositorio Remoto (si aún no está configurado)**:
   ```bash
   git remote add origin https://github.com/[TU_USUARIO]/pagina-web-hobbybolivia.git
   git branch -M main
   git push -u origin main
   ```

---

## 2. Importación y Configuración en Vercel

1. Iniciar sesión en [vercel.com](https://vercel.com) con la cuenta de GitHub.
2. Hacer clic en **"Add New..."** → **"Project"**.
3. Seleccionar el repositorio `pagina-web-hobbybolivia`.
4. **Configuración del Framework**:
   - Framework Preset: **Next.js** (detectado automáticamente).
   - Root Directory: `./`
   - Build Command: `next build`
   - Output Directory: `.next`
5. **Configuración de Variables de Entorno (Environment Variables)**:
   Cargar las siguientes variables para los entornos *Production* y *Preview*:
   - `NEXT_PUBLIC_SITE_URL`: `https://hobbybolivia.com`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`: `+591 77293446`
   - `ADMIN_USER`: `[USUARIO_ADMINISTRADOR]`
   - `ADMIN_PASSWORD`: `[CONTRASENA_SEGURA]`
   - `DATABASE_URL`: URL de conexión MySQL (si se conecta a base de datos externa).
6. Presionar **"Deploy"**. Vercel compilará el proyecto en menos de 1 minuto y generará una URL `.vercel.app`.

---

## 3. Configuración de Dominio Personalizado y SSL

Para activar el dominio oficial `hobbybolivia.com`:

1. En el panel de Vercel del proyecto, ir a: **Settings** → **Domains**.
2. Agregar `hobbybolivia.com` y marcar la opción de redirigir `www.hobbybolivia.com` a `hobbybolivia.com`.
3. **Configurar los Registros DNS en el Proveedor de Dominio (Namecheap, GoDaddy, NIC.bo o cPanel)**:

| Tipo | Host / Nombre | Valor / Destino | TTL |
| :---: | :---: | :---: | :---: |
| **A** | `@` | `76.76.21.21` | Automático / 300 |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automático / 300 |

4. **Certificado SSL / HTTPS**:
   - Vercel emitirá y activará automáticamente un certificado SSL gratuito de **Let's Encrypt** tan pronto los registros DNS apunten a sus servidores (demora entre 2 y 15 minutos).
   - El candado de seguridad HTTPS se encenderá en verde sin necesidad de intervención manual.

---

## 4. Verificación Post-Lanzamiento (Health Check)

- [ ] La URL principal `https://hobbybolivia.com` carga correctamente con protocolo seguro HTTPS.
- [ ] La redirección de `http://` a `https://` y de `www.` a sin `www.` funciona de forma transparente (código HTTP 301/308).
- [ ] El botón flotante y las tarjetas abren WhatsApp con el número **+591 77293446**.
- [ ] Los filtros y el drawer de cotizaciones responden con total fluidez en dispositivos móviles.
