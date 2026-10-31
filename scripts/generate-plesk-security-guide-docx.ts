import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

async function generateDocx() {
  const primaryColor = '0F172A'; // Slate 900
  const accentColor = 'E11D48';  // Rose 600 (Hobby Bolivia)
  const secondaryColor = '2563EB'; // Blue 600
  const textColor = '334155';   // Slate 700
  const lightBg = 'F1F5F9';     // Slate 100

  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: textColor,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Hobby Bolivia | Guía de Configuración Segura en Plesk',
                    size: 18,
                    color: '94A3B8',
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.SPACE_BETWEEN,
                children: [
                  new TextRun({
                    text: 'Confidencial - Para uso exclusivo de Administración Hobby Bolivia',
                    size: 16,
                    color: '94A3B8',
                  }),
                  new TextRun({
                    children: ['Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: '94A3B8',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Título Principal
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'GUÍA OPERATIVA Y CHECKLIST DE CIBERSEGURIDAD',
                size: 36, // 18pt
                bold: true,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
            children: [
              new TextRun({
                text: 'Configuración de Producción en Plesk, Dominio y Base de Datos MariaDB',
                size: 26, // 13pt
                bold: true,
                color: accentColor,
              }),
            ],
          }),

          // Metadata Card / Recuadro
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: lightBg },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        spacing: { before: 100, after: 60 },
                        children: [
                          new TextRun({ text: '• Proyecto: ', bold: true, color: primaryColor }),
                          new TextRun({ text: 'Catálogo Web y Sistema de Ventas Hobby Bolivia' }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 0, after: 60 },
                        children: [
                          new TextRun({ text: '• Dominio Oficial: ', bold: true, color: primaryColor }),
                          new TextRun({ text: 'https://hobbybolivia.com / https://www.hobbybolivia.com' }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 0, after: 60 },
                        children: [
                          new TextRun({ text: '• Base de Datos: ', bold: true, color: primaryColor }),
                          new TextRun({ text: 'MariaDB / MySQL (dariasdigital_hobbybolivia)' }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { before: 0, after: 100 },
                        children: [
                          new TextRun({ text: '• Momento de Ejecución: ', bold: true, color: accentColor }),
                          new TextRun({
                            text: 'Realizar estos pasos una vez concluida la subida de imágenes y el enlace de base de datos.',
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Separador
          new Paragraph({ spacing: { before: 300, after: 100 }, children: [] }),

          // SECCIÓN 1: INTRODUCCIÓN
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: '1. Resumen: Qué Seguridad ya está Activa en el Código',
                bold: true,
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 150 },
            children: [
              new TextRun({
                text: 'El código fuente y las APIs de Hobby Bolivia ya cuentan con un blindaje completo de nivel empresarial validado con pruebas de calidad (QA). Todo esto se encuentra subido y disponible en GitHub (rama main):',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Interceptor en Servidor (proxy.ts): ', bold: true }),
              new TextRun({ text: 'Bloquea el acceso al panel /admin/* en el servidor antes de generar HTML. Expulsa a usuarios sin sesión válida.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Protección Anti-Fuerza Bruta en Login: ', bold: true }),
              new TextRun({ text: 'Bloquea temporalmente durante 15 minutos a cualquier IP tras 5 intentos fallidos consecutivos.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Sanitización Estricta contra XSS: ', bold: true }),
              new TextRun({ text: 'Neutraliza código HTML/scripts en pedidos y en el libro de reclamaciones antes de guardarse en base de datos.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Consultas Parametrizadas contra SQL Injection: ', bold: true }),
              new TextRun({ text: 'Todas las consultas SQL utilizan marcadores de posición (?) impidiendo manipulación de tablas.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({ text: 'Compresor Automático de Imágenes Sharp: ', bold: true }),
              new TextRun({ text: 'Convierte fotos a WebP (máx. 1000px y nunca más de 250 KB) y almacena solo rutas de texto, sin binarios BLOB.' }),
            ],
          }),

          // SECCIÓN 2: PASOS EN PLESK
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({
                text: '2. Pasos Detallados a Configurar en Plesk',
                bold: true,
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 150 },
            children: [
              new TextRun({
                text: 'Sigue cada uno de estos 5 pasos en tu panel de administración Plesk para que la infraestructura en la nube quede perfectamente asegurada:',
              }),
            ],
          }),

          // PASO 1
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'Paso 1: Instalar Certificado SSL Gratuito (Let\'s Encrypt) y Forzar HTTPS',
                bold: true,
                size: 24,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Objetivo: ', bold: true }),
              new TextRun({ text: 'Asegurar que todas las transferencias de datos, contraseñas y pedidos viajen cifradas bajo el protocolo seguro HTTPS con candado verde.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Ruta en Plesk: ', bold: true }),
              new TextRun({ text: 'Websites & Domains  ➔  hobbybolivia.com  ➔  SSL/TLS Certificates' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({ text: 'Instrucciones: ' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: '1. Haz clic en el botón ' }),
              new TextRun({ text: '"Install"', bold: true }),
              new TextRun({ text: ' en la tarjeta de Let\'s Encrypt.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: '2. Selecciona las casillas para incluir tanto ' }),
              new TextRun({ text: 'hobbybolivia.com', bold: true }),
              new TextRun({ text: ' como ' }),
              new TextRun({ text: 'www.hobbybolivia.com', bold: true }),
              new TextRun({ text: '.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: '3. Ingresa tu correo para recibir notificaciones de renovación automática.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({ text: '4. Una vez emitido, activa la casilla ' }),
              new TextRun({ text: '"Redirect from HTTP to HTTPS"', bold: true, color: accentColor }),
              new TextRun({ text: ' para que cualquier persona que escriba http:// sea redirigida automáticamente a la versión segura.' }),
            ],
          }),

          // PASO 2
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'Paso 2: Ajuste Seguro de Document Root y Application Root en Node.js',
                bold: true,
                size: 24,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Objetivo: ', bold: true }),
              new TextRun({ text: 'Prevenir que archivos confidenciales (como .env, package.json o código fuente del backend) sean accesibles directamente desde el navegador.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Ruta en Plesk: ', bold: true }),
              new TextRun({ text: 'Websites & Domains  ➔  hobbybolivia.com  ➔  Node.js' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({ text: 'Configuración recomendada:' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: 'Application Root: ', bold: true }),
              new TextRun({ text: '/hobbybolivia.com  (directorio donde se ubica el proyecto completo)' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: 'Document Root: ', bold: true }),
              new TextRun({ text: '/hobbybolivia.com/public  (directorio estrictamente para imágenes y estáticos públicos)' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: 'Application Mode: ', bold: true }),
              new TextRun({ text: 'production' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({ text: 'Application Startup File: ', bold: true }),
              new TextRun({ text: 'server.js  (o el archivo de arranque de Node.js configurado)' }),
            ],
          }),

          // PASO 3
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'Paso 3: Carga de Variables de Entorno en Node.js',
                bold: true,
                size: 24,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            children: [
              new TextRun({ text: 'Ruta en Plesk: ', bold: true }),
              new TextRun({ text: 'Node.js on hobbybolivia.com  ➔  Pestaña "Environment"' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            children: [
              new TextRun({ text: 'Agrega cada una de las siguientes variables para que el sistema opere con tu base de datos MariaDB:' }),
            ],
          }),

          // Tabla de Variables de Entorno
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: primaryColor },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Variable', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: primaryColor },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Valor Sugerido / Producción', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { fill: primaryColor },
                    borders: tableBorder,
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Descripción / Propósito', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'NODE_ENV', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'production' })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Activa caché, cabeceras HSTS y modo optimizado.' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'DB_HOST', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'localhost' })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Conexión local interna directa al MariaDB.' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'DB_PORT', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: '3306' })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Puerto estándar de MariaDB/MySQL.' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'DB_NAME', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'dariasdigital_hobbybolivia' })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Nombre de la base de datos creada en Plesk.' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'DB_USER', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'dariasdigital_hobbybolivia' })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Usuario con permisos exclusivos sobre la BD.' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'DB_PASSWORD', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: '[Tu contraseña de BD en Plesk]' })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Contraseña generada al crear el usuario en Plesk.' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'AUTH_SECRET', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'hb_sec_9f7a8b3e2c1d0f5e8a7c4b6d' })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Clave criptográfica para firmas de tokens HMAC.' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'SUPERADMIN_USER', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'darinka.arias18@gmail.com' })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'Correo del Superadmin con privilegios totales.' })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'NEXT_PUBLIC_APP_URL', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'https://hobbybolivia.com' })] })] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ children: [new TextRun({ text: 'URL base del catálogo y tienda.' })] })] }),
                ],
              }),
            ],
          }),

          // PASO 4
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 80 },
            children: [
              new TextRun({
                text: 'Paso 4: Restricción del Usuario MariaDB solo a Conexiones Locales',
                bold: true,
                size: 24,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Objetivo: ', bold: true }),
              new TextRun({ text: 'Evitar que cualquier persona o bot en internet pueda intentar conectarse remotamente a tu base de datos MariaDB a través del puerto 3306.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Ruta en Plesk: ', bold: true }),
              new TextRun({ text: 'Databases  ➔  User Management  ➔  Editar usuario "dariasdigital_hobbybolivia"' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({ text: 'Instrucciones: ' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: 'En la sección ' }),
              new TextRun({ text: '"Access control" (Control de acceso)', bold: true }),
              new TextRun({ text: ', verifica que esté marcada la opción: ' }),
              new TextRun({ text: '"Allow local connections only" (Permitir solo conexiones locales).', bold: true, color: secondaryColor }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({ text: 'Asegúrate de que ' }),
              new TextRun({ text: 'NO', bold: true, color: accentColor }),
              new TextRun({ text: ' esté marcada la opción "Allow remote connections from any host" (%) ya que expondría tu servidor a escaneos y ataques externos.' }),
            ],
          }),

          // PASO 5
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: 'Paso 5: Configurar Respaldo Automático Programado (Backup)',
                bold: true,
                size: 24,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Objetivo: ', bold: true }),
              new TextRun({ text: 'Tener una copia de seguridad recuperable ante cualquier imprevisto técnico o error accidental.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: 'Ruta en Plesk: ', bold: true }),
              new TextRun({ text: 'Websites & Domains  ➔  hobbybolivia.com  ➔  Backup Manager' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({ text: 'Instrucciones: ' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: '1. Haz clic en ' }),
              new TextRun({ text: '"Schedule" (Programar)', bold: true }),
              new TextRun({ text: ' y activa la casilla ' }),
              new TextRun({ text: '"Activate this backup task"', bold: true }),
              new TextRun({ text: '.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: '2. En frecuencia, selecciona ' }),
              new TextRun({ text: '"Daily" (Diario)', bold: true }),
              new TextRun({ text: ' en un horario de baja concurrencia (ej. 03:00 AM).' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({ text: '3. En qué respaldar, asegúrate de marcar: ' }),
              new TextRun({ text: 'Base de datos dariasdigital_hobbybolivia', bold: true }),
              new TextRun({ text: ' y ' }),
              new TextRun({ text: 'Archivos de la web (especialmente /public/uploads con las fotos).', bold: true }),
            ],
          }),

          // SECCIÓN 3: CHECKLIST FINAL
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({
                text: '3. Checklist Rápido de Validación Final',
                bold: true,
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 150 },
            children: [
              new TextRun({
                text: 'Marca cada una de estas casillas una vez que hayas completado la configuración:',
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: '[   ] ', bold: true, color: accentColor }),
              new TextRun({ text: 'Certificado Let\'s Encrypt instalado y visible con candado en https://hobbybolivia.com' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: '[   ] ', bold: true, color: accentColor }),
              new TextRun({ text: 'Redirección permanente HTTP a HTTPS activada en Plesk.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: '[   ] ', bold: true, color: accentColor }),
              new TextRun({ text: 'Document Root configurado a /hobbybolivia.com/public para proteger archivos fuente.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: '[   ] ', bold: true, color: accentColor }),
              new TextRun({ text: 'Variables de entorno (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, AUTH_SECRET) configuradas.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: '[   ] ', bold: true, color: accentColor }),
              new TextRun({ text: 'Control de acceso del usuario MariaDB configurado estrictamente como "Allow local connections only".' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: '[   ] ', bold: true, color: accentColor }),
              new TextRun({ text: 'Copia de seguridad (Backup diario) programada en Plesk Backup Manager.' }),
            ],
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({ text: '[   ] ', bold: true, color: accentColor }),
              new TextRun({ text: 'Acceso verificado a https://hobbybolivia.com/login y carga correcta del catálogo de productos.' }),
            ],
          }),

          // Firma / Pie
          new Paragraph({
            spacing: { before: 400, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Documento generado automáticamente por el Agente de Ciberseguridad y QA para Hobby Bolivia.',
                size: 18,
                italics: true,
                color: '64748B',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const outputPath = path.resolve(
    process.cwd(),
    'GUIA_SEGURIDAD_Y_CONFIGURACION_PLESK_HOBBY_BOLIVIA.docx'
  );

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ Documento Word generado exitosamente en: ${outputPath}`);
}

generateDocx().catch((err) => {
  console.error('❌ Error generando docx:', err);
  process.exit(1);
});
