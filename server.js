const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const rawPort = process.env.PORT || '3000';
const isNamedPipeOrSocket = isNaN(Number(rawPort));
const port = isNamedPipeOrSocket ? rawPort : parseInt(rawPort, 10);

const app = next({
  dev,
  hostname: 'localhost',
  port: isNamedPipeOrSocket ? 3000 : port
});
const handle = app.getRequestHandler();

const MIME_TYPES = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const pathname = parsedUrl.pathname || '';

      // Servir uploads directamente del disco para velocidad instantánea (0ms) en producción
      if (pathname.startsWith('/uploads/')) {
        const cleanPath = decodeURIComponent(pathname).replace(/^(\.\.[\/\\])+/, '');
        const candidate1 = path.join(process.cwd(), 'public', cleanPath);
        const candidate2 = path.join(process.cwd(), cleanPath);
        const filePath = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : null);

        if (filePath) {
          const ext = path.extname(filePath).toLowerCase();
          res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return fs.createReadStream(filePath).pipe(res);
        }
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error('Server error on listen:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Servidor Hobby Bolivia listo en puerto/socket: ${port}`);
    });
}).catch((err) => {
  console.error('CRITICAL: Error preparing Next.js application:', err);
  process.exit(1);
});


