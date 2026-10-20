const path = require('path');
const express = require('express');

const app = express();
app.disable('x-powered-by');

const PORT = Number(process.env.PORT) || 3000;
// Bind to loopback by default: traffic arrives through the Cloudflare Tunnel.
const HOST = process.env.HOST || '127.0.0.1';

const PUBLIC_IMG_DIR = path.join(__dirname, 'img');
const INDEX_FILE = path.join(__dirname, 'index.html');

app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

// Allowlist: only the landing page and its images are served.
// Everything else (server.js, package.json, deploy/, README, node_modules) returns 404.
app.get('/', (req, res) => {
  res.sendFile(INDEX_FILE);
});

app.use(
  '/img',
  express.static(PUBLIC_IMG_DIR, {
    dotfiles: 'ignore',
    fallthrough: false,
    maxAge: '1d',
  })
);

app.use((req, res) => {
  res.status(404).type('text/plain').send('Not Found');
});

app.listen(PORT, HOST, () => {
  console.log(`Casario landing listening on http://${HOST}:${PORT}`);
});
