import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/** Deep links like `/portal/dashboard` → `static/portal/index.html` (dev parity with prod worker). */
function portalSpaFallbackDev() {
  return {
    name: 'portal-spa-fallback-dev',
    enforce: 'pre',
    configureServer(server) {
      const root = server.config.root;
      const portalDir = path.join(root, 'static', 'portal');
      server.middlewares.use((req, _res, next) => {
        const full = req.url || '';
        const raw = full.split('?')[0] || '';
        if (!raw.startsWith('/portal')) return next();
        const rel =
          raw === '/portal' || raw === '/portal/' ? '' : raw.slice('/portal'.length).replace(/^\//, '');
        const q = full.includes('?') ? `?${full.split('?').slice(1).join('?')}` : '';
        if (!rel) {
          req.url = `/portal/index.html${q}`;
          return next();
        }
        if (rel === 'index.html') return next();
        const last = rel.split('/').pop() || '';
        if (/\.[a-z0-9]+$/i.test(last)) {
          try {
            if (fs.statSync(path.join(portalDir, rel)).isFile()) return next();
          } catch {
            /* missing asset */
          }
          return next();
        }
        req.url = `/portal/index.html${q}`;
        next();
      });
    },
    configurePreviewServer(server) {
      const root = server.config.root;
      const portalDir = path.join(root, 'build', 'portal');
      server.middlewares.use((req, _res, next) => {
        const full = req.url || '';
        const raw = full.split('?')[0] || '';
        if (!raw.startsWith('/portal')) return next();
        const rel =
          raw === '/portal' || raw === '/portal/' ? '' : raw.slice('/portal'.length).replace(/^\//, '');
        const q = full.includes('?') ? `?${full.split('?').slice(1).join('?')}` : '';
        if (!rel) {
          req.url = `/portal/index.html${q}`;
          return next();
        }
        if (rel === 'index.html') return next();
        const last = rel.split('/').pop() || '';
        if (/\.[a-z0-9]+$/i.test(last)) {
          try {
            if (fs.statSync(path.join(portalDir, rel)).isFile()) return next();
          } catch {
            /* missing */
          }
          return next();
        }
        req.url = `/portal/index.html${q}`;
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [tailwindcss(), portalSpaFallbackDev(), sveltekit()]
});
