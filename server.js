const { createServer } = require('http');
const { parse } = require('url');
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

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Servidor Hobby Bolivia listo en puerto/socket: ${port}`);
    });
});


