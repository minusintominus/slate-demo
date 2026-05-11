/**
 * Serves `build/` with SPA fallback (same idea as `serve -s` / Cloudflare _redirects).
 * Avoids tools that call `os.networkInterfaces()` (breaks some sandboxes / CI).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', 'build');
const port = Number(process.env.PORT || process.argv[2] || 4173);
/** 127.0.0.1 avoids some bind/firewall quirks; set HOST=0.0.0.0 for LAN access. */
const host = process.env.HOST || '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function existsFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function existsDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Map URL pathname to a path under `root`. Leading `/` must NOT be passed to path.join
 * (Node treats it as an absolute path and drops `root`).
 */
function safePathUnderRoot(urlPathname) {
  const decoded = decodeURIComponent(urlPathname.split('?')[0]);
  const rel = decoded.replace(/^\/+/, '');
  if (rel.includes('\0')) return null;
  const joined = path.normalize(path.join(root, rel));
  const relToRoot = path.relative(root, joined);
  if (relToRoot.startsWith('..') || path.isAbsolute(relToRoot)) return null;
  return joined;
}

function resolveFile(urlPath) {
  if (urlPath === '/' || urlPath === '') {
    const idx = path.join(root, 'index.html');
    return existsFile(idx) ? idx : null;
  }

  const base = safePathUnderRoot(urlPath);
  if (!base) return null;

  if (existsFile(base)) return base;
  if (existsDir(base)) {
    const idx = path.join(base, 'index.html');
    if (existsFile(idx)) return idx;
  }
  const html = base + '.html';
  if (existsFile(html)) return html;

  return null;
}

if (!existsDir(root)) {
  console.error('Missing build/ folder. Run: npm run build');
  process.exit(1);
}
if (!existsFile(path.join(root, 'index.html'))) {
  console.error('build/index.html missing. Run: npm run build');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  let urlPath = new URL(req.url || '/', 'http://127.0.0.1').pathname;
  if (urlPath.endsWith('/')) urlPath = urlPath.slice(0, -1) || '/';

  let file = resolveFile(urlPath);
  if (!file) {
    const fallback = path.join(root, 'index.html');
    if (existsFile(fallback)) file = fallback;
  }

  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(file);
  const type = MIME[ext] || 'application/octet-stream';

  if (req.method === 'HEAD') {
    res.writeHead(200, { 'Content-Type': type });
    res.end();
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Read error');
      return;
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(port, host, () => {
  const url = `http://${host === '0.0.0.0' ? '127.0.0.1' : host}:${port}/`;
  console.log(`Serving ${root}`);
  console.log(`Open ${url} (deep links like /workspace/overview use SPA fallback)`);
  if (host === '0.0.0.0') console.log(`Also bound on all interfaces — try http://<this-machine-LAN-IP>:${port}/`);
  console.log('Press Ctrl+C to stop.');
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try: PORT=${port + 1} npm run static`);
  } else {
    console.error(e.message);
  }
  process.exit(1);
});
