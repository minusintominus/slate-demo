/**
 * Cloudflare Workers static assets reject `/* /index.html 200` in _redirects (infinite-loop
 * validation). SPA fallback is already configured via wrangler `not_found_handling`.
 * SvelteKit copies `static/_redirects` into `build/` — strip it so CI deploy always works.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'build', '_redirects');
try {
  fs.unlinkSync(target);
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
}
