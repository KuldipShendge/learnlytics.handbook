// Local preview including the Drive PDF API. Run: node scripts/preview.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const pdfSample = require('../api/pdf-sample.js');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.pdf': 'application/pdf', '.webp': 'image/webp', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.wasm': 'application/wasm' };
const port = Number(process.env.PORT || 8766);
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/pdf-sample') return await pdfSample(req, res);
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    const pathname = decodeURIComponent(url.pathname);
    if (/^\/(api|scripts|tests)(\/|$)/.test(pathname)) { res.writeHead(404); return res.end(); }
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      if (path.extname(pathname)) { res.writeHead(404); return res.end(); }
      file = path.join(root, 'index.html');
    }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  } catch (error) {
    res.writeHead(500); res.end('Preview request failed.');
  }
}).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port}`));
