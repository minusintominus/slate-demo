/**
 * Cloudflare Pages: serve the portal shell for deep links (e.g. /portal/dashboard).
 * _redirects proxy rules are not applied once Functions handle a URL; this middleware
 * keeps /portal/* client routes working regardless.
 */
// Include jsx/tsx — portal modules load as .jsx; without these, middleware served HTML for those URLs and Babel failed on "slate-bundle.jsx".
const STATIC_EXT =
  /\.(?:jsx|tsx|ts|js|mjs|cjs|css|html|htm|json|map|wasm|svg|png|jpe?g|gif|webp|ico|avif|woff2?|ttf|eot|otf|webmanifest|txt|xml)$/i;

/** @param {{ request: Request; next: (i?: Request | string, init?: RequestInit) => Promise<Response>; env: { ASSETS?: { fetch: typeof fetch } } }} context */
export async function onRequest(context) {
  const { request, next, env } = context;
  const method = request.method;
  if (method !== 'GET' && method !== 'HEAD') return next();

  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname === '/portal' || pathname === '/portal/') return next();
  if (!pathname.startsWith('/portal/')) return next();

  const lastSeg = pathname.split('/').filter(Boolean).pop() ?? '';
  const looksLikeStaticFile = lastSeg.includes('.') && STATIC_EXT.test(lastSeg);
  if (looksLikeStaticFile) return next();

  if (!env.ASSETS?.fetch) return next();

  const shell = new URL('/portal/', url);
  return env.ASSETS.fetch(new Request(shell, request));
}
