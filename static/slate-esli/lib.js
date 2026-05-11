// Slate — shared icons, helpers, mock data
// Used by demo HTML. The Next.js handoff has these as TS modules in src/lib.
(function () {

const Icons = {
  search: '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  upload: '<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 16V4M6 10l6-6 6 6M4 20h16"/></svg>',
  file:   '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/></svg>',
  check:  '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4 10-10"/></svg>',
  alert:  '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/></svg>',
  arrow:  '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  arrowUp:'<svg class="ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  arrowDn:'<svg class="ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  filter: '<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>',
  download:'<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4v12m-6-6 6 6 6-6M4 20h16"/></svg>',
  sun:    '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
  moon:   '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>',
  // sidebar icons
  home:   '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 11 12 4l9 7v9h-6v-6h-6v6H3z"/></svg>',
  table:  '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18M9 4v16"/></svg>',
  pie:    '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v9h9a9 9 0 1 1-9-9z"/></svg>',
  spark:  '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m3 17 5-5 4 4 9-9"/></svg>',
  users:  '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="9" r="2.5"/><path d="M22 19a5 5 0 0 0-7-4.6"/></svg>',
  bulb:   '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c1 1 1.5 2 1.5 3.5h5c0-1.5.5-2.5 1.5-3.5A6 6 0 0 0 12 2z"/></svg>',
  calendar: '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  mail:   '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  percent:'<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 19 19 6"/><circle cx="8" cy="8" r="2" fill="none"/><circle cx="16" cy="16" r="2" fill="none"/></svg>',
  wallet: '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/><path d="M4 10h16"/><circle cx="15.5" cy="14" r="1" fill="currentColor"/></svg>',
  refreshIc: '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12a9 9 0 1 1-3-7"/><path d="M21 3v6h-6"/></svg>',
  inbox:  '<svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 13l3-9h12l3 9v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13h5l1 3h6l1-3h5"/></svg>',
  menu:   '<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close:  '<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

const fmtMoney = (n, opts = {}) => {
  if (n == null) return '—';
  const abs = Math.abs(n);
  if (opts.compact && abs >= 1e6) return (n < 0 ? '−' : '') + '$' + (abs / 1e6).toFixed(2) + 'M';
  if (opts.compact && abs >= 1e3) return (n < 0 ? '−' : '') + '$' + (abs / 1e3).toFixed(1) + 'K';
  return (n < 0 ? '−$' : '$') + abs.toLocaleString('en-US', { maximumFractionDigits: opts.dp ?? 0, minimumFractionDigits: opts.dp ?? 0 });
};
const fmtPct = (n, opts = {}) => {
  const v = typeof n === 'number' ? n : 0;
  const sign = opts.sign === false ? '' : v > 0 ? '+' : v < 0 ? '−' : '';
  const abs = Math.abs(v);
  return sign + abs.toFixed(opts.dp ?? 2) + '%';
};
const fmtNum = (n, opts = {}) => Number(n).toLocaleString('en-US', { maximumFractionDigits: opts.dp ?? 0 });
/** Signed basis points — `+71 bps` */
const fmtBps = (n, opts = {}) => {
  const v = Math.round(Number(n) || 0);
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return `${sign}${Math.abs(v)} bps`;
};
/** Relative day label e.g. 7d, 14d (spec windows) */
const fmtRelDays = (d) => {
  if (d == null || d === '') return '—';
  const n = Math.abs(Number(d));
  return `${n}d`;
};
/** Short ordinal date — 6 May 2026 */
const fmtShortDateFull = (d) => {
  if (d == null) return '—';
  try {
    return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return String(d);
  }
};

window.Slate = window.Slate || {};
window.Slate.Icons = Icons;
window.Slate.fmt = { money: fmtMoney, pct: fmtPct, num: fmtNum, bps: fmtBps, relDays: fmtRelDays, shortDateFull: fmtShortDateFull };
/** Paths relative to index.html */
/**
 * Paths relative to this SPA's index.html (`…/slate-esli/index.html`) so brand
 * assets resolve on the same host as the Kit app (../brand → site root /brand).
 */
window.Slate.BRAND = {
  lockupLight: '../brand/slate-lockup-light.png?v=2',
  lockupDark: '../brand/slate-lockup-dark.png?v=2',
  poweredByLight: '../brand/powered-by-slate-light.png?v=1',
  poweredByDark: '../brand/powered-by-slate-dark.png?v=1',
  faviconLight: '../brand/favicon.png',
  faviconDark: '../brand/favicon-dark.png',
  appleTouchIcon: '../brand/apple-touch-icon.png',
};

/**
 * Path-based URLs for http(s) (e.g. /insights, /clients/marchetti/pulse). Legacy #hash
 * bookmarks are migrated once. For file:// opens, routing stays on the hash so the
 * demo works without a dev server.
 */
window.SlateRoute = (function () {
  function isFile() {
    return typeof location !== 'undefined' && location.protocol === 'file:';
  }
  /** Raw route string without leading # or / — same shape the app used with hash routing. */
  function read() {
    if (isFile()) {
      var hf = location.hash || '';
      return hf.length > 1 ? hf.slice(1).replace(/^\/+/, '') : '';
    }
    if (location.hash && location.hash.length > 1) {
      var leg = location.hash.slice(1).replace(/^\/+/, '');
      var qix = leg.indexOf('?');
      var pOnly = qix >= 0 ? leg.slice(0, qix) : leg;
      var search = qix >= 0 ? leg.slice(qix) : '';
      history.replaceState(null, '', '/' + pOnly + search);
    }
    var path = (location.pathname || '/').replace(/^\/+/, '');
    if (path === '' || path === 'index.html') return '';
    return path + (location.search || '');
  }
  function write(route, replace) {
    var r = String(route || '').replace(/^#+/, '').replace(/^\/+/, '');
    if (isFile()) {
      if (!r) r = 'dashboard';
      location.hash = r;
      window.dispatchEvent(new Event('slate-route'));
      return;
    }
    if (!r) r = 'dashboard';
    var qix = r.indexOf('?');
    var pathOnly = qix >= 0 ? r.slice(0, qix) : r;
    var search = qix >= 0 ? r.slice(qix) : '';
    var href = '/' + pathOnly + search;
    if (replace) history.replaceState(null, '', href);
    else history.pushState(null, '', href);
    window.dispatchEvent(new Event('slate-route'));
  }
  return { read, write, isFile };
})();

})();
