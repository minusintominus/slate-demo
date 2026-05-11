/**
 * Deep links like `/portal/dashboard` have no physical file; serve `portal/index.html`.
 * Used by `spa-static-server.mjs`, `workers/site-assets.js`, and Vite dev middleware.
 * @param {string} pathname URL pathname (no query), may be encoded
 */
export function shouldServePortalSpaIndex(pathname) {
  const p = decodeURIComponent(pathname).replace(/\/+$/, '') || '/';
  const m = p.match(/^(.*?\/portal)\/(.+)$/i);
  if (!m) return false;
  const rest = m[2];
  if (rest === 'index.html') return false;
  const last = rest.split('/').pop() || '';
  return !/\.[a-z0-9]+$/i.test(last);
}
