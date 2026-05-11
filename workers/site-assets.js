/**
 * Cloudflare Worker: try static asset, then portal SPA deep links, then 404 (Kit SPA is root fallback).
 */
function shouldServePortalSpaIndex(pathname) {
  const p = decodeURIComponent(pathname).replace(/\/+$/, '') || '/';
  const m = p.match(/^(.*?\/portal)\/(.+)$/i);
  if (!m) return false;
  const rest = m[2];
  if (rest === 'index.html') return false;
  const last = rest.split('/').pop() || '';
  return !/\.[a-z0-9]+$/i.test(last);
}

export default {
  /** @param {Request} request */
  async fetch(request, env, ctx) {
    let res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;

    const url = new URL(request.url);
    const pathname = url.pathname;
    const accept = request.headers.get('Accept') || '';
    const wantHtml = accept.includes('text/html');

    const isGetOrHead = request.method === 'GET' || request.method === 'HEAD';
    // Portal shell is HTML; do not require Accept: text/html (some clients send */* only).
    if (isGetOrHead && shouldServePortalSpaIndex(pathname)) {
      const m = decodeURIComponent(pathname).match(/^(.*?\/portal)\//i);
      if (m) {
        const idx = new URL(request.url);
        idx.pathname = `${m[1]}/index.html`;
        idx.search = '';
        idx.hash = '';
        const portalRes = await env.ASSETS.fetch(new Request(idx.toString(), request));
        if (portalRes.status === 200) return portalRes;
      }
    }

    if (wantHtml) {
      const kit = new URL(request.url);
      kit.pathname = '/index.html';
      kit.search = '';
      kit.hash = '';
      const kitRes = await env.ASSETS.fetch(new Request(kit.toString(), request));
      if (kitRes.status === 200) return kitRes;
    }

    return res;
  }
};
