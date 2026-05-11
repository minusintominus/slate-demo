/**
 * Cloudflare Workers static assets reject some broad `_redirects` rules (infinite-loop validation).
 * Keep safe rules (e.g. `/portal/*` → portal shell) and drop only the problematic catch-all.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'build', '_redirects');

/** @param {string} line */
function isWorkersUnsafeSpaLine(line) {
  const t = line.trim();
  if (!t || t.startsWith('#')) return false;
  // Root catch-all to index.html breaks Workers + assets validation in some setups.
  return /^\*\/\s*\/?index\.html\s+200\s*$/i.test(t) || /^\s*\/\*\s+\/?index\.html\s+200\s*$/i.test(t);
}

try {
  const raw = fs.readFileSync(target, 'utf8');
  const kept = raw
    .split('\n')
    .filter((line) => !isWorkersUnsafeSpaLine(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
  if (!kept || kept.split('\n').every((l) => !l.trim() || l.trim().startsWith('#'))) {
    fs.unlinkSync(target);
  } else {
    fs.writeFileSync(target, kept + '\n');
  }
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
}
