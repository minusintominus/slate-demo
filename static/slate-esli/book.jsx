// Slate — Book-level Dashboard, client directory, per-client workspace shell.

const {
  Icons, fmt, POSITIONS, ACCOUNTS, HOUSEHOLD, HOUSEHOLD_BRIEFING, STATEMENTS, INSIGHTS,
  BOOK_SUMMARY, BOOK_RM_TARGETS, BOOK_PIPELINE_COUNTS, CLIENT_BOOK: slateClientBook, MARKET_CALENDAR,
  SP_RFQ, SP_QUOTES, ALT_STRATEGY_MIX,
} = window.Slate;
const BRAND = window.Slate.BRAND || {
  lockupLight: '../brand/slate-lockup-light.png?v=2',
  lockupDark: '../brand/slate-lockup-dark.png?v=2',
  faviconLight: '../brand/favicon.png',
  faviconDark: '../brand/favicon-dark.png',
  appleTouchIcon: '../brand/apple-touch-icon.png',
};
const Charts = window.Slate.Charts;
const { HouseholdScreen, InsightsScreen, HoldingDetail } = window.Slate.Screens;
const AltsExports = window.Slate.AltsStructured || {};
const { AltsScreen, StructuredScreen, WmAltsStructuredUnifiedDesk } = AltsExports;
const { FilterBar } = window.Slate.Shell;

const SLATE_DEMO_ROLE_KEY = 'slate-demo-role';
const COMPLIANCE_DOC_STATE_KEY = 'slate-compliance-doc-state';
const COMPLIANCE_INJECTED_DOCS_KEY = 'slate-compliance-injected-docs';

const COMPLIANCE_ROUTE_RESERVED = new Set(['inbox', 'clients', 'pipeline', 'expiring', 'documents']);
const CLIENT_PORTAL_UPLOADS_KEY = 'slate-client-portal-uploads';
const CLIENT_ALERTS_DONE_KEY = 'slate-client-home-alerts-done';
const CLIENT_MEETING_NOTES_KEY = 'slate-client-meeting-notes';

function getDemoRole() {
  try {
    const r = localStorage.getItem(SLATE_DEMO_ROLE_KEY);
    if (r === 'wm' || r === 'client' || r === 'compliance') return r;
    return null;
  } catch (e) {
    return null;
  }
}

function setDemoRole(r) {
  try {
    localStorage.setItem(SLATE_DEMO_ROLE_KEY, r);
  } catch (e) { /* ignore */ }
}

function clearDemoRole() {
  try {
    localStorage.removeItem(SLATE_DEMO_ROLE_KEY);
  } catch (e) { /* ignore */ }
}

/** Strip a leading slash from URL route strings (same shape as legacy #hash routes). */
function normalizeSlateRoute(route) {
  if (route == null || route === '') return route;
  const s = String(route);
  const q = s.indexOf('?');
  const pathRaw = q >= 0 ? s.slice(0, q) : s;
  const path = pathRaw.replace(/^\/+/, '');
  const qs = q >= 0 ? s.slice(q) : '';
  return path + qs;
}

function slateGo(path) {
  window.SlateRoute.write(path);
}

/** Redirect disallowed paths per demo persona (single-household client = Marchetti only). */
function guardRouteForRole(role, route) {
  const norm = normalizeSlateRoute(route);
  const path = norm.split('?')[0];
  if (!role) return 'choose-role';
  if (path === 'choose-role') {
    if (role === 'compliance') return 'compliance/inbox';
    return 'dashboard';
  }
  if (role === 'compliance') {
    if (path === 'dashboard') return 'compliance/inbox';
    if (['upload', 'parsing', 'review', 'start', 'structured', 'alts-global'].includes(path)) return 'compliance/inbox';
    if (path === 'insights' || path.startsWith('insights/')) return 'compliance/inbox';
    if (path.startsWith('clients')) return 'compliance/inbox';
    if (path === 'compliance' || path.startsWith('compliance/')) return norm;
    return 'compliance/inbox';
  }
  if (role === 'client') {
    if (path === 'product-builder') return 'dashboard';
    if (path === 'insights' || path.startsWith('insights/')) return 'dashboard';
    if (['upload', 'parsing', 'review', 'start', 'structured', 'clients'].includes(path)) return 'dashboard';
    if (path === 'alts-global') return 'dashboard';
    if (path.startsWith('clients/') && !path.startsWith('clients/marchetti')) return 'dashboard';
    if (path.startsWith('compliance')) return 'dashboard';
    return norm;
  }
  if (role === 'wm') {
    if (path === 'compliance' || path.startsWith('compliance/')) return 'dashboard';
    if (path === 'product-builder') return norm;
    return norm;
  }
  return norm;
}

/** KYC / identity artefacts for sidebar counts and portal Documents tab (member household). */
function getMarchettiKycDocs() {
  const COMPLIANCE_KYC = window.Slate.COMPLIANCE_KYC || { clients: [] };
  const c = COMPLIANCE_KYC.clients.find(x => x.id === 'marchetti');
  return c && Array.isArray(c.docs) ? c.docs : [];
}

/** WM default household surface — Pulse; optional deep tab via `drawer` query. */
function wmHouseholdLanding(clientId, drawerId) {
  const id = String(clientId || '').trim() || 'marchetti';
  const base = `clients/${id}/pulse`;
  if (!drawerId) return base;
  return `${base}?drawer=${encodeURIComponent(drawerId)}`;
}

/**
 * Book pulse KPIs derived from the same merged directory + structured desk mocks
 * (replaces static BOOK_SUMMARY counters for WM dashboard tiles).
 */
function deriveBookWmPulseMetrics(mergedRows) {
  const rows = Array.isArray(mergedRows) ? mergedRows : [];
  const reviewsOverdueCount = rows.filter(r => r.reviewInDays != null && r.reviewInDays < 0).length;
  const driftWatchCount = rows.filter(r => r.driftTone === 'warn').length;
  const quotes = Array.isArray(SP_QUOTES) ? SP_QUOTES : [];
  const activeStructuredRfqs = quotes.filter(q => q && q.pending === true).length;
  return { reviewsOverdueCount, driftWatchCount, activeStructuredRfqs };
}

const WM_ENGAGEMENT_CONTACT_DAYS = 30;

/**
 * % of merged directory rows with `lastContact` within the last `windowDays` (inclusive).
 * Uses runtime "today" so the demo tracks fixture dates (ISO strings on CLIENT_BOOK rows).
 */
function deriveBookEngagementFromMerged(mergedRows, windowDays = WM_ENGAGEMENT_CONTACT_DAYS) {
  const rows = Array.isArray(mergedRows) ? mergedRows : [];
  const now = Date.now();
  const ms = Math.max(1, windowDays) * 86400000;
  let modeledHouseholds = 0;
  let contactedInWindow = 0;
  for (const r of rows) {
    modeledHouseholds += 1;
    const raw = r && r.lastContact;
    if (raw == null || String(raw).trim() === '') continue;
    const t = new Date(raw).getTime();
    if (!Number.isFinite(t)) continue;
    if (now - t >= 0 && now - t <= ms) contactedInWindow += 1;
  }
  const pctContacted30d = modeledHouseholds ? Math.round((1000 * contactedInWindow) / modeledHouseholds) / 10 : 0;
  return { modeledHouseholds, contactedInWindow, pctContacted30d, windowDays: Math.max(1, windowDays) };
}

/**
 * Illustrative split of trailing NNM into "new relationships" vs "existing book" for dashboard storytelling.
 * Heuristic: new funded households are weighted 5× a per-existing-household incremental share so small `newHh`
 * still produces a visible slice without exceeding total NNM.
 */
function illustrativeNnmSplit(netNewMoney, newHh, totalHouseholds) {
  const nnm = Math.max(0, Number(netNewMoney) || 0);
  const nNew = Math.max(0, Number(newHh) || 0);
  const total = Math.max(1, Number(totalHouseholds) || 1);
  const existing = Math.max(0, total - nNew);
  const wNew = nNew * 5;
  const wExist = existing > 0 ? existing : 1;
  const denom = wNew + wExist || 1;
  const fromNewRelationships = Math.min(nnm, Math.round((nnm * wNew) / denom));
  const fromExistingBook = nnm - fromNewRelationships;
  return { fromNewRelationships, fromExistingBook };
}

function getSidebarNavForRole(role) {
  const { Icons } = window.Slate;
  if (role === 'wm') {
    return {
      grouped: true,
      sections: [
        {
          heading: 'Book',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: Icons.home },
            { id: 'clients', label: 'Clients', icon: Icons.users },
          ],
        },
        {
          heading: 'Programs',
          items: [
            { id: 'structured', label: 'Structured', icon: Icons.table, badge: 'RFQ' },
            { id: 'alts-global', label: 'Alternatives · book view', icon: Icons.spark },
          ],
        },
        {
          heading: 'Operations',
          items: [
            { id: 'upload', label: 'Statements & onboarding', icon: Icons.upload },
          ],
        },
      ],
    };
  }
  if (role === 'client') {
    const insightCount = INSIGHTS.filter(x => (x.clientId || 'marchetti') === 'marchetti').length;
    const stmtCount = STATEMENTS.length;
    const kycCount = getMarchettiKycDocs().length;
    const docCount = stmtCount + kycCount;
    const altDealCount = window.Slate && Array.isArray(window.Slate.ALT_DEALS) ? window.Slate.ALT_DEALS.length : 0;
    return {
      grouped: true,
      sections: [
        {
          heading: 'Your space',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: Icons.home },
            { id: 'clients/marchetti/portfolio', label: 'Portfolio', icon: Icons.pie },
            { id: 'clients/marchetti/insights', label: `Insights (${insightCount})`, icon: Icons.bulb },
          ],
        },
        {
          heading: 'Investment options',
          items: [
            { id: 'clients/marchetti/alts', label: `Alternatives (${altDealCount})`, icon: Icons.spark },
            { id: 'clients/marchetti/structured', label: 'Structured products', icon: Icons.table, badge: 'RFQ' },
          ],
        },
        {
          heading: 'Records',
          items: [
            { id: 'clients/marchetti/documents', label: `Documents (${docCount})`, icon: Icons.file },
            { id: 'clients/marchetti/events', label: 'Events', icon: Icons.calendar },
            { id: 'clients/marchetti/refresh', label: 'Refresh data', icon: Icons.refreshIc },
          ],
        },
      ],
    };
  }
  if (role === 'compliance') {
    return [
      { id: 'compliance/inbox', label: 'KYC inbox', icon: Icons.inbox },
      { id: 'compliance/clients', label: 'All clients', icon: Icons.users },
      { id: 'compliance/pipeline', label: 'Pipeline', icon: Icons.spark },
      { id: 'compliance/expiring', label: 'Expiring IDs', icon: Icons.alert },
      { id: 'compliance/documents', label: 'Document register', icon: Icons.file },
    ];
  }
  return [];
}

function getSidebarProfileForRole(role) {
  if (role === 'client') {
    return { initials: 'MM', name: 'Marco Marchetti', title: 'Client' };
  }
  if (role === 'compliance') {
    return { initials: 'AR', name: 'Alex Rivera', title: 'MLRO' };
  }
  return { initials: 'CH', name: 'Christine Holloway', title: 'Wealth Manager' };
}

const WM_RANGE_LABELS = { '7D': '7D', '30D': '30D', '90D': '90D', '1Y': '1Y', 'ALL': 'All' };
/** Floor for headline "Net new assets" when window is 1Y (book-level demo). */
const WM_NNM_1Y_MIN = 37_000_000;
/** Anchor book size for scaling 1Y NNM vs AUM (~$214M demo book). */
const WM_NNM_REF_BOOK_AUM = 214_000_000;
/** Multiplier on 1Y NNM for the "All" window (multi-year cumulative flows). */
const WM_NNM_ALL_YEARS = 2.45;

/** Trailing net new money by range: prorated from annualized 1Y so windows stay internally consistent. */
function wmNetNewMoneyForRange(rangeKey, bookAum) {
  const nnm1y = Math.max(WM_NNM_1Y_MIN, Math.round((bookAum * WM_NNM_1Y_MIN) / WM_NNM_REF_BOOK_AUM));
  const f = {
    '7D': 7 / 365,
    '30D': 30 / 365,
    '90D': 90 / 365,
    '1Y': 1,
    'ALL': WM_NNM_ALL_YEARS,
  }[rangeKey];
  if (f == null) return nnm1y;
  return Math.max(0, Math.round(nnm1y * f));
}

function wmRangePointCount(rangeKey) {
  return ({ '7D': 7, '30D': 12, '90D': 15, '1Y': 24, 'ALL': 36 }[rangeKey] || 24);
}

function seededU01(seed, i) {
  const x = Math.sin((seed + 1) * 12.9898 + i * 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

/** AUM curve over the selected window; ends at book total today. */
function buildAumSeriesForRange(endTotal, rangeKey) {
  const n = wmRangePointCount(rangeKey);
  const seed = { '7D': 1, '30D': 2, '90D': 3, '1Y': 4, 'ALL': 5 }[rangeKey] || 4;
  const startMul = { '7D': 0.9975, '30D': 0.992, '90D': 0.978, '1Y': 0.955, 'ALL': 0.88 }[rangeKey] || 0.95;
  const start = endTotal * startMul;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const base = start + (endTotal - start) * t;
    const wobble = endTotal * 0.0012 * (seededU01(seed, i) - 0.5) * 2;
    pts.push(Math.round(base + wobble));
  }
  pts[n - 1] = Math.round(endTotal);
  return pts;
}

function seriesPctChange(pts) {
  if (!pts || pts.length < 2) return 0;
  const a = pts[0];
  const b = pts[pts.length - 1];
  if (!a) return 0;
  return (b - a) / a;
}

/** Illustrative net new money per sub-period (bars). When `windowNnm` is set, bar values sum to that headline trailing NNM. */
function buildNetFlowBarsForRange(rangeKey, endTotal, windowNnm) {
  const count = { '7D': 7, '30D': 5, '90D': 6, '1Y': 8, 'ALL': 10 }[rangeKey] || 6;
  const seed = { '7D': 11, '30D': 22, '90D': 33, '1Y': 44, 'ALL': 55 }[rangeKey] || 33;
  const mult = { '7D': 0.00008, '30D': 0.00025, '90D': 0.00055, '1Y': 0.001, 'ALL': 0.003 }[rangeKey] || 0.001;
  const base = endTotal * mult;
  const labels = [];
  for (let i = 0; i < count; i++) {
    if (rangeKey === '7D') labels.push(['M', 'T', 'W', 'T', 'F', 'S', 'S'][i] || `D${i + 1}`);
    else labels.push(`${i + 1}`);
  }

  const useNnm = windowNnm != null && windowNnm > 0;
  const weights = [];
  let wsum = 0;
  for (let i = 0; i < count; i++) {
    const w = 0.35 + seededU01(seed + 3, i) * 1.65;
    weights.push(w);
    wsum += w;
  }

  const bars = [];
  if (useNnm) {
    for (let i = 0; i < count; i++) {
      bars.push({
        label: labels[i] || String(i + 1),
        value: Math.round((windowNnm * weights[i]) / wsum),
      });
    }
    const drift = windowNnm - bars.reduce((a, b) => a + b.value, 0);
    bars[bars.length - 1].value += drift;
  } else {
    for (let i = 0; i < count; i++) {
      const v = Math.round(base * (0.5 + seededU01(seed, i)));
      bars.push({ label: labels[i] || String(i + 1), value: v });
    }
  }
  return bars;
}

/** Headline WM metrics for the range (illustrative deltas). */
function wmHeadlineMetrics(rangeKey, totalHouseholds, bookAum) {
  const aumPts = buildAumSeriesForRange(bookAum, rangeKey);
  const aumDelta = seriesPctChange(aumPts);
  const netNewMoney = wmNetNewMoneyForRange(rangeKey, bookAum);
  const newHh = { '7D': 0, '30D': 1, '90D': 1, '1Y': 2, 'ALL': Math.max(0, totalHouseholds - 3) }[rangeKey] ?? 0;
  const bench = HOUSEHOLD.benchmark || '60/40';
  const bookVsBenchBps = { '7D': 8, '30D': 22, '90D': 38, '1Y': 71, 'ALL': 120 }[rangeKey] || 40;
  return { aumDelta, netNewMoney, newHh, bench, bookVsBenchBps, aumPts };
}

/** KPI spark helper — illustrative net new money trajectory over `rangeKey`. */
function buildWmSparkNnmSeries(rangeKey, endNnm) {
  const n = wmRangePointCount(rangeKey);
  const seed = 61;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const curved = endNnm * Math.pow(t, 0.88);
    const noise = endNnm * 0.02 * (seededU01(seed, i) - 0.5);
    pts.push(Math.max(0, Math.round(curved + noise)));
  }
  pts[n - 1] = endNnm;
  return pts;
}

/** KPI spark helper — illustrative outperformance streak in bps. */
function buildWmSparkBenchBpsSeries(rangeKey, endBps) {
  const n = wmRangePointCount(rangeKey);
  const seed = 62;
  const start = Math.round(endBps * 0.35);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const v = start + (endBps - start) * t + (seededU01(seed, i) - 0.5) * 6;
    pts.push(Math.round(v));
  }
  pts[n - 1] = endBps;
  return pts;
}

/** KPI spark helper — funded relationships added over the window. */
function buildWmSparkNewHhSeries(rangeKey, endHh) {
  const n = wmRangePointCount(rangeKey);
  if (endHh <= 0) return Array.from({ length: n }, () => 0);
  const seed = 63;
  const start = Math.max(0, endHh - Math.max(1, Math.ceil(endHh * 0.65)));
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const v = start + (endHh - start) * t + (seededU01(seed, i) - 0.5) * 0.35;
    pts.push(Math.max(0, v));
  }
  pts[n - 1] = endHh;
  return pts;
}

/** Dual series: book AUM vs illustrative policy glide (same window as range toggle). */
function buildWmBookVsPolicySeries(bookAum, rangeKey) {
  const bookPts = buildAumSeriesForRange(bookAum, rangeKey);
  const seed = 71;
  const policyPts = bookPts.map((v, i) => {
    const glide = 0.988 + 0.004 * Math.sin(i * 0.35 + (seed % 7));
    const noise = 1 + (seededU01(seed, i) - 0.5) * 0.0045;
    return Math.round(v * glide * noise);
  });
  policyPts[policyPts.length - 1] = Math.round(bookPts[bookPts.length - 1] * 0.991);
  return { bookPts, policyPts };
}

/** Month-to-date advisory accrual bars; sums to `ytdTotal` (illustrative weights). */
function buildWmFeePaceMonthlyYtd(ytdTotal) {
  const monthCount = Math.min(new Date().getMonth() + 1, 12);
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const n = Math.max(1, monthCount);
  const weights = [];
  for (let i = 0; i < n; i++) {
    weights.push(0.82 + 0.36 * seededU01(88, i));
  }
  const wsum = weights.reduce((a, b) => a + b, 0);
  const bars = weights.map((w, i) => ({ label: labels[i] || `M${i + 1}`, value: Math.round((ytdTotal * w) / wsum) }));
  const sum = bars.reduce((a, b) => a + b.value, 0);
  if (bars.length && sum !== ytdTotal) {
    bars[bars.length - 1].value += ytdTotal - sum;
  }
  return bars;
}

/** Illustrative household count ending at `endCount`. */
function buildHouseholdCountTrend(endCount) {
  const n = 12;
  const start = Math.max(1, endCount - 4);
  const pts = [];
  for (let i = 0; i < n; i++) {
    pts.push(Math.round(start + (endCount - start) * (i / (n - 1))));
  }
  pts[n - 1] = endCount;
  return pts;
}

function buildHouseholdCountTrendForRange(endCount, rangeKey) {
  const n = wmRangePointCount(rangeKey);
  const drop = Math.max(1, Math.min(4, Math.floor(n / 4)));
  const start = Math.max(1, endCount - drop);
  const pts = [];
  for (let i = 0; i < n; i++) {
    pts.push(Math.round(start + (endCount - start) * (i / Math.max(1, n - 1))));
  }
  pts[n - 1] = endCount;
  return pts;
}

/** Client dashboard: household value curve ending at `endTotal` today. */
const CLIENT_CHART_RANGES = ['30D', '90D', '6M', '1Y', '5Y'];
const CLIENT_CHART_LABELS = { '30D': '30D', '90D': '90D', '6M': '6M', '1Y': '1Y', '5Y': '5Y' };

function clientChartPointCount(rangeKey) {
  return ({ '30D': 14, '90D': 20, '6M': 24, '1Y': 30, '5Y': 48 }[rangeKey] || 24);
}

/** Subtitle copy for "Trailing … · vs. benchmarks" on portfolio screens. */
const CLIENT_CHART_TRAILING_LABEL = { '30D': '30 days', '90D': '90 days', '6M': '6 months', '1Y': '12 months', '5Y': '5 years' };

/** Bottom-axis ticks for the performance chart — horizon-aware labels. */
function getClientChartXAxisTicks(rangeKey, nPoints) {
  const last = Math.max(0, nPoints - 1);
  if (last < 1) return [{ index: 0, label: 'Now' }];
  const at = (f, label) => ({ index: Math.round(Math.min(1, Math.max(0, f)) * last), label });
  const raw = {
    '30D': [at(0, 'Start'), at(1 / 3, '~10d'), at(2 / 3, '~20d'), at(1, 'Now')],
    '90D': [at(0, 'Start'), at(1 / 3, '~1M'), at(2 / 3, '~2M'), at(1, 'Now')],
    '6M': [at(0, 'Start'), at(0.34, '~2M'), at(0.67, '~4M'), at(1, 'Now')],
    '1Y': [at(0, 'Start'), at(0.34, '~4M'), at(0.67, '~8M'), at(1, 'Now')],
    '5Y': [at(0, '2021'), at(0.25, '2022'), at(0.5, '2024'), at(0.75, '2025'), at(1, '2026')],
  }[rangeKey] || [at(0, 'Start'), at(0.5, 'Mid'), at(1, 'Now')];
  const seen = new Set();
  const out = [];
  for (const t of raw) {
    const idx = Math.min(last, Math.max(0, t.index));
    if (seen.has(idx)) continue;
    seen.add(idx);
    out.push({ index: idx, label: t.label });
  }
  return out;
}

/** Demo metrics row — 1Y matches reference card; other windows use nearby illustrative numbers. */
const CLIENT_PERF_METRICS_BY_RANGE = {
  '30D': [
    { label: '1M', value: '+0.3%', positive: true },
    { label: 'YTD', value: '+1.1%', positive: true },
    { label: '1Y', value: '+10.9%', positive: true },
    { label: '3Y ANN.', value: '+8.85%', positive: true },
  ],
  '90D': [
    { label: '1M', value: '+0.5%', positive: true },
    { label: 'YTD', value: '+2.4%', positive: true },
    { label: '1Y', value: '+11.1%', positive: true },
    { label: '3Y ANN.', value: '+8.88%', positive: true },
  ],
  '6M': [
    { label: '1M', value: '+0.6%', positive: true },
    { label: 'YTD', value: '+2.9%', positive: true },
    { label: '1Y', value: '+11.25%', positive: true },
    { label: '3Y ANN.', value: '+8.89%', positive: true },
  ],
  '1Y': [
    { label: '1M', value: '+0.8%', positive: true },
    { label: 'YTD', value: '+3.27%', positive: true },
    { label: '1Y', value: '+11.40%', positive: true },
    { label: '3Y ANN.', value: '+8.90%', positive: true },
  ],
  '5Y': [
    { label: '1M', value: '+0.7%', positive: true },
    { label: 'YTD', value: '+3.1%', positive: true },
    { label: '1Y', value: '+11.35%', positive: true },
    { label: '3Y ANN.', value: '+8.90%', positive: true },
  ],
};

/**
 * Reference-style comparison: 60/40 and S&P vs portfolio (solid).
 * Normalized curves are scaled so the portfolio leg ends exactly at `endTotal`.
 */
function buildClientPerformanceComparisonSeries(endTotal, rangeKey) {
  const n = clientChartPointCount(rangeKey);
  const seed = { '30D': 31, '90D': 32, '6M': 33, '1Y': 34, '5Y': 35 }[rangeKey] || 34;
  const drama = { '30D': 0.2, '90D': 0.38, '6M': 0.62, '1Y': 1, '5Y': 1.06 }[rangeKey] ?? 1;
  const portN = [];
  const benchN = [];
  const spxN = [];

  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const u1 = seededU01(seed, i);
    const u2 = seededU01(seed + 7, i + 3);

    const dipP = 0.065 * drama * Math.exp(-Math.pow((t - 0.14) / 0.095, 2));
    const riseP = Math.pow(Math.max(0, t - 0.05), 1.08) * 0.98 + t * 0.08;
    const port = 0.782 + riseP - dipP + 0.011 * Math.sin(t * Math.PI * 7) + 0.012 * (u1 - 0.5);

    const bench = 0.848 + 0.098 * Math.pow(t, 0.94) + 0.006 * Math.sin(t * Math.PI * 3.5);

    const rally = 0.125 * drama * Math.sin(Math.min(1, t / 0.71) * (Math.PI / 2));
    const ddCenter = 0.772;
    const drawdown = 0.135 * drama * Math.exp(-Math.pow((t - ddCenter) / 0.052, 2));
    let spx = 0.815 + rally - drawdown + 0.018 * Math.sin(t * Math.PI * 8.5) + 0.009 * (u2 - 0.5);
    if (t > 0.8) spx += (t - 0.8) * 0.14 * drama;

    portN.push(port);
    benchN.push(bench);
    spxN.push(spx);
  }

  /** Map each series to a [lo,hi] band (0–1 scale) so shapes stay, endpoints are sane for dollars. */
  const stretchNorm = (arr, lo, hi) => {
    const a0 = arr[0];
    const a1 = arr[n - 1];
    const span = a1 - a0 || 1;
    return arr.map(v => lo + ((v - a0) / span) * (hi - lo));
  };

  const port = stretchNorm(portN, 0.78, 1).map(v => Math.round(v * endTotal));
  const bench = stretchNorm(benchN, 0.85, 0.945).map(v => Math.round(v * endTotal));
  const spx = stretchNorm(spxN, 0.805, 0.972).map(v => Math.round(v * endTotal));
  port[n - 1] = Math.round(endTotal);

  let annIdx = Math.round(0.77 * (n - 1));
  let minV = Infinity;
  const i0 = Math.max(1, Math.floor(0.52 * (n - 1)));
  const i1 = Math.min(n - 2, Math.ceil(0.9 * (n - 1)));
  for (let i = i0; i <= i1; i++) {
    if (spx[i] < minV) {
      minV = spx[i];
      annIdx = i;
    }
  }

  const metricsStrip = CLIENT_PERF_METRICS_BY_RANGE[rangeKey] || CLIENT_PERF_METRICS_BY_RANGE['1Y'];

  return {
    series: [
      { name: '60/40 benchmark', color: 'var(--ink-2)', points: bench, dashed: true, width: 1.6 },
      { name: 'S&P 500', color: 'var(--ink-4)', points: spx, dashed: true, width: 1.6 },
      { name: 'Portfolio', color: 'var(--ink)', points: port, dashed: false, width: 2.5 },
    ],
    annotationData: {
      seriesIndex: 1,
      pointIndex: annIdx,
      label: 'Mar drawdown',
      color: 'var(--warn)',
    },
    metricsStrip,
    portfolioPoints: port,
  };
}

/** Donut slices: `{ pct, color, label }` where `pct` is a relative weight (count per segment). */
function segmentCountsForDonut(mergedRows) {
  const counts = {};
  for (const r of mergedRows) {
    const k = r.familyType || 'Other';
    counts[k] = (counts[k] || 0) + 1;
  }
  const palette = {
    UHNW: 'var(--accent)',
    FO: 'var(--ink-2)',
    HNW: 'var(--pos)',
    'Family office': 'var(--warn)',
  };
  return Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([label, n]) => ({ pct: n, color: palette[label] || 'var(--ink-3)', label }))
    .sort((a, b) => b.pct - a.pct);
}

/** Demo "today" — aligned with MARKET_CALENDAR / screenshots (May 2026). */
const SLATE_DEMO_TODAY = new Date(2026, 4, 9);

/** Resample a numeric series to length `n` (linear interpolation on indices). */
function resampleSeriesToLength(pts, n) {
  const arr = Array.isArray(pts) ? pts : [];
  if (n <= 0) return [];
  if (arr.length === 0) return Array.from({ length: n }, () => 0);
  if (arr.length === n) return arr.slice();
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = n <= 1 ? 0 : i / (n - 1);
    const idx = t * (arr.length - 1);
    const j = Math.floor(idx);
    const f = idx - j;
    const a = arr[j];
    const b = arr[Math.min(j + 1, arr.length - 1)];
    out.push(Math.round((a ?? 0) + f * ((b ?? a) - (a ?? 0))));
  }
  return out;
}

/** Illustrative IPO/alts eligibility counts by calendar row (demo tagging). */
function wmMarketEligibleForRow(row) {
  if (!row || row.kind === 'Auction') return { n: null };
  const byId = { mc1: 3, mc2: 1, mc4: 2 };
  const n = byId[row.id];
  if (n != null) return { n };
  const h = String(row.ticker || row.id || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return { n: 1 + (h % 3) };
}

function wmDaysUntilCalendarDate(isoDate, fromDate = SLATE_DEMO_TODAY) {
  const ed = new Date(isoDate);
  const t0 = fromDate.getTime();
  const t1 = ed.getTime();
  if (!Number.isFinite(t1)) return null;
  return Math.ceil((t1 - t0) / 86400000);
}

/** Segment list for rail: counts + rough AUM share by household mix. */
function deriveSegmentRailLines(mergedRows, bookTotalAum, donutSeg) {
  const total = Math.max(1, (Array.isArray(mergedRows) ? mergedRows.length : 0) || 1);
  const ta = Math.max(0, Number(bookTotalAum) || 0);
  return (donutSeg || []).map(s => ({
    label: s.label,
    color: s.color,
    count: s.pct,
    approxAum: Math.round(ta * (s.pct / total)),
  }));
}

/** Subtext + badges for top operational pulse (matches triage mental model). */
function deriveDashboardPulseHighlights(mergedRows, wmPulse, bookSummary) {
  const rows = Array.isArray(mergedRows) ? mergedRows : [];
  const overdueRow = rows.find(r => r.reviewInDays != null && r.reviewInDays < 0);
  const driftRow = rows.find(r => r.driftTone === 'warn');
  const u = bookSummary && bookSummary.uhnwCount != null ? bookSummary.uhnwCount : 0;
  const fo = bookSummary && bookSummary.foCount != null ? bookSummary.foCount : 0;
  const hnw = bookSummary && bookSummary.hnwCount != null ? bookSummary.hnwCount : 0;
  const segBits = `${u} UHNW · ${fo} FO · ${hnw} HNW`;
  let driftSub = null;
  if (driftRow) {
    const name = shortHouseholdLabel(driftRow.name);
    const dl = String(driftRow.driftLabel || '').trim();
    driftSub = dl ? `${name} · ${dl}` : name;
  }
  return {
    reviewsBadge: overdueRow ? `${Math.abs(overdueRow.reviewInDays)}d` : null,
    reviewsSub: overdueRow ? `${shortHouseholdLabel(overdueRow.name)} · ${overdueRow.familyType || ''}`.replace(/\s*·\s*$/, '').trim() : null,
    driftBadge: wmPulse.driftWatchCount > 0
      ? `${wmPulse.driftWatchCount} ${wmPulse.driftWatchCount === 1 ? 'action' : 'actions'}`
      : null,
    driftSub,
    hhSub: segBits,
  };
}

function shortHouseholdLabel(name) {
  return String(name)
    .replace(/^The /, '')
    .replace(/ Family$/, '')
    .replace(/ Living Trust$/, '')
    .replace(/ & Partners$/, '')
    .replace(/ Enterprises LLC$/, '')
    .trim();
}

/**
 * Book-level triage alerts for the dashboard strip (severity sorting per UX spec).
 * Scores — overdue reviews 100 · regulatory/KYC pend 80 · drift + imminent review 70 · drift-only 60 · opportunities 70/50 by proximity.
 * @returns {{ items: { score: number, text: string, hash: string }[] }}
 */
function buildBookDashboardAlerts() {
  const CopyRoot = window.Slate.Copy;
  const wmA = CopyRoot && CopyRoot.wmAlerts;
  const rows = slateClientBook;
  const cal = MARKET_CALENDAR || [];
  const COMPLIANCE_KYC = window.Slate.COMPLIANCE_KYC || { clients: [] };
  const candidates = [];
  const overdue = new Set();

  const regLine = wmA && typeof wmA.regulatory === 'function' ? wmA.regulatory : sn => `${sn} KYC artefacts pending MLRO review`;

  const kycById = {};
  for (const c of COMPLIANCE_KYC.clients || []) {
    kycById[c.id] = c;
  }

  for (const row of rows) {
    if (row.reviewInDays != null && row.reviewInDays < 0) {
      const d = Math.abs(row.reviewInDays);
      overdue.add(row.id);
      candidates.push({
        score: 100,
        text: `${shortHouseholdLabel(row.name)} — review overdue (${fmt.relDays(d)})`,
        hash: wmHouseholdLanding(row.id, 'events'),
      });
    }
  }

  for (const row of rows) {
    if (overdue.has(row.id)) continue;
    const kyc = kycById[row.id];
    const regulatoryOpen = !!(kyc && Array.isArray(kyc.docs) && kyc.docs.some(d => d.status === 'pending'));
    const flagRegulatory = regulatoryOpen || row.regulatoryFlag === true;
    if (flagRegulatory) {
      candidates.push({
        score: 80,
        text: regLine(shortHouseholdLabel(row.name)),
        hash: wmHouseholdLanding(row.id, 'documents'),
      });
      continue;
    }
    if (row.driftTone === 'warn') {
      candidates.push({
        score: row.reviewInDays != null && row.reviewInDays <= 14 ? 70 : 60,
        text: `${shortHouseholdLabel(row.name)} — ${row.driftLabel.toLowerCase()}`,
        hash: wmHouseholdLanding(row.id),
      });
    }
  }

  const oppLine =
    wmA && typeof wmA.opportunityIpo === 'function'
      ? wmA.opportunityIpo
      : (tk, ds, nh) => `${tk} IPO in ${fmt.relDays(ds)} — ${nh} households eligible`;
  for (const ev of cal) {
    if (ev.kind !== 'IPO') continue;
    const ed = new Date(ev.date);
    const days = Math.ceil((ed.getTime() - SLATE_DEMO_TODAY.getTime()) / 86400000);
    if (days >= 0 && days <= 7) {
      candidates.push({
        score: days <= 2 ? 70 : 50,
        text: oppLine(ev.ticker, days, 3),
        hash: 'clients',
      });
      break;
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return { items: candidates };
}

function WmDashAlertStrip({ navigate }) {
  const CopyRoot = window.Slate.Copy;
  const alertCopy = CopyRoot && CopyRoot.dashboard && CopyRoot.dashboard.alertStrip;
  const { items } = buildBookDashboardAlerts();
  if (!items.length) return null;
  const top = items.slice(0, 3);
  const moreN = items.length - top.length;
  const moreLabel = alertCopy && typeof alertCopy.more === 'function' ? alertCopy.more(moreN) : `+ ${moreN} more`;
  const intro = alertCopy && typeof alertCopy.intro === 'function' ? alertCopy.intro(top.length, items.length) : null;

  return (
    <div className="slate-alert-strip slate-alert-strip--dashboard" role="region" aria-label="Book alerts">
      <div className="slate-alert-strip__inner">
        {intro ? (
          <span className="slate-alert-strip__intro">
            {intro}{' '}
          </span>
        ) : null}
        {top.map((a, i) => (
          <React.Fragment key={`${a.text}-${i}`}>
            {i > 0 ? <span className="slate-alert-strip__sep" aria-hidden> · </span> : null}
            <button type="button" className="slate-alert-strip__link" onClick={() => navigate(a.hash)}>
              {a.text}
            </button>
          </React.Fragment>
        ))}
        {moreN > 0 ? (
          <>
            <span className="slate-alert-strip__sep" aria-hidden> · </span>
            <button type="button" className="slate-alert-strip__more" onClick={() => navigate('clients')}>
              {moreLabel}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function topHouseholdBars(mergedRows, max = 5) {
  return [...mergedRows]
    .filter(r => clientAum(r) > 0)
    .sort((a, b) => clientAum(b) - clientAum(a))
    .slice(0, max)
    .map(r => {
      const short = r.name.replace(/^The /, '').trim();
      const label = short.length > 22 ? `${short.slice(0, 20)}…` : short;
      return { label, value: clientAum(r) };
    });
}

function DemoTourStrip({ navigate, variant = 'wm', className = '', stripLabel, onMessageChristine }) {
  const Nav = window.Slate.Copy && window.Slate.Copy.navigation;
  const baseWmItems =
    Nav && Nav.commandJumps ? [...Nav.commandJumps].slice(0, 7) : [
      { label: 'Client directory', hash: 'clients' },
      { label: 'Marchetti — pulse', hash: 'clients/marchetti/pulse' },
      { label: 'Alternatives', hash: 'clients/marchetti/alts' },
      { label: 'Insights', hash: 'clients/marchetti/pulse?drawer=insights' },
      { label: 'Cashflow', hash: 'clients/marchetti/portfolio?sub=cashflow' },
      { label: 'Structured', hash: 'structured' },
      { label: 'Statement intake', hash: 'upload' },
    ];
  let wmItems = baseWmItems;
  try {
    const lid = sessionStorage.getItem('slate-wm-last-client');
    if (lid && wmItems.length >= 2) {
      const row = slateClientBook.find(r => r.id === lid);
      const short = row ? shortHouseholdLabel(row.name || lid) : lid;
      const next = [...wmItems];
      next[1] = { ...next[1], label: `${short} — command center`, hash: `clients/${lid}/pulse` };
      wmItems = next.slice(0, 7);
    }
  } catch (e) { /* ignore */ }
  /** Deep links that take extra navigation vs hero CTAs — not one-tap staples like raw portfolio/doc list. */
  const clientItems = [
    { label: 'Message Christine', kind: 'message' },
    { label: 'Liquidity & cashflow', hash: 'clients/marchetti/portfolio?sub=cashflow' },
    { label: 'Available alternatives', hash: `clients/marchetti/alts?sub=deals` },
    { label: 'My structured notes', hash: 'clients/marchetti/structured?sub=book' },
  ];
  const items = variant === 'wm' ? wmItems : clientItems;
  return (
    <div className={`demo-tour-strip card${className ? ` ${className}` : ''}`}>
      <div className="demo-tour-inner row gap-10">
        <span className="label demo-tour-label">{stripLabel != null ? stripLabel : variant === 'wm' ? ((Nav && Nav.stripLabel) || 'Command jumps') : 'Shortcuts'}</span>
        <div className="demo-tour-chips row gap-8">
          {items.map(it => (
            <button
              key={it.kind === 'message' ? 'shortcut-message-christine' : it.hash}
              type="button"
              className="demo-tour-chip"
              onClick={() => {
                if (it.kind === 'message') {
                  onMessageChristine && onMessageChristine();
                  return;
                }
                navigate(it.hash);
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WmDashSection({ eyebrow, title, subtitle, aside, children, className = '' }) {
  return (
    <section className={`wm-dash-section${className ? ` ${className}` : ''}`}>
      <header className="wm-dash-section__header">
        <div className="wm-dash-section__intro">
          {eyebrow ? <p className="wm-dash-section__eyebrow slate-section-label">{eyebrow}</p> : null}
          {title ? <h2 className="wm-dash-section__title serif">{title}</h2> : null}
          {subtitle ? <p className="wm-dash-section__subtitle text-3">{subtitle}</p> : null}
        </div>
        {aside ? <div className="wm-dash-section__aside">{aside}</div> : null}
      </header>
      {children}
    </section>
  );
}

function WmDashPulseChip({ label, value, hint, subline, badge, urgent, onNavigate }) {
  const cls = `wm-dash-pulse-chip${urgent ? ' wm-dash-pulse-chip--urgent' : ''}${onNavigate ? ' wm-dash-pulse-chip--action' : ''}`;
  const inner = (
    <>
      <span className="wm-dash-pulse-chip__label-row">
        <span className="wm-dash-pulse-chip__label">{label}</span>
        {badge ? <span className="wm-dash-pulse-chip__badge">{badge}</span> : null}
      </span>
      <span className="wm-dash-pulse-chip__value">{value}</span>
      {subline ? <span className="wm-dash-pulse-chip__sub">{subline}</span> : null}
      {hint ? <span className="wm-dash-pulse-chip__hint">{hint}</span> : null}
    </>
  );
  if (onNavigate) {
    return (
      <button type="button" className={cls} onClick={onNavigate}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

function WmDashSkeleton() {
  const bar = (w = '72%') => <div className="wm-dash-sk-line" style={{ width: w }} />;
  const skCard = (
    <div className="wm-dash-sk-card">
      <span className="wm-dash-sk-line wm-dash-sk-line--sm" style={{ width: '46%' }} />
      <span className="wm-dash-sk-line wm-dash-sk-line--lg" style={{ width: '58%', marginTop: 10 }} />
      <span className="wm-dash-sk-line wm-dash-sk-line--xs" style={{ width: '72%', marginTop: 12 }} />
    </div>
  );
  return (
    <div className="wm-dash-sk" aria-busy="true">
      <header className="wm-dash-sk-block" style={{ marginBottom: 18 }}>
        {bar('32%')}
        {bar('58%')}
        {bar('78%')}
      </header>
      <div className="wm-dash-sk-pulse-row wm-dash-pulse--top" style={{ marginBottom: 20 }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="wm-dash-sk-pulse" />)}
      </div>
      <div className="wm-dash-page-body wm-dash-page-body--sk">
        <div className="wm-dash-primary-col">
          <div className="wm-dash-sk-chart wm-dash-sk-chart--tall" style={{ marginBottom: 18 }} />
          <div className="wm-dash-sk-cards" style={{ marginBottom: 18 }}>
            {skCard}
            {skCard}
          </div>
          <div className="wm-dash-sk-chart" style={{ minHeight: 180, marginBottom: 18 }} />
        </div>
        <aside className="wm-dash-book-rail" aria-hidden="true">
          <div className="wm-dash-sk-rail-stack">
            {bar('40%')}
            <div className="wm-dash-sk-card" style={{ minHeight: 120, marginTop: 12 }} />
            <div className="wm-dash-sk-card" style={{ minHeight: 88, marginTop: 12 }} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function RolePickerScreen({ onChoose, theme, onTheme }) {
  const pick = (r) => {
    setDemoRole(r);
    onChoose && onChoose(r);
  };
  return (
    <div className="page role-picker-page">
      {typeof onTheme === 'function' && (theme === 'light' || theme === 'dark') ? (
        <div className="role-picker-toolbar">
          <button type="button" className="btn ghost icon role-picker-theme-btn" onClick={onTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <span dangerouslySetInnerHTML={{ __html: theme === 'dark' ? Icons.sun : Icons.moon }} />
          </button>
        </div>
      ) : null}
      <div className="role-picker-hero">
        <div className="role-picker-brand" role="img" aria-label="Slate Private Wealth">
          <img className="role-picker-lockup role-picker-lockup-light" src={BRAND.lockupLight} alt="" width={300} height={75} decoding="async"/>
          <img className="role-picker-lockup role-picker-lockup-dark" src={BRAND.lockupDark} alt="" width={300} height={75} decoding="async" aria-hidden="true"/>
        </div>
        <h1 className="serif role-picker-title">Please choose an option.</h1>
      </div>
      <div className="role-picker-cards">
        <button type="button" className="card role-picker-card" onClick={() => pick('wm')}>
          <span className="role-picker-card-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: Icons.users }} />
          <h2 className="serif">Wealth manager</h2>
          <p className="text-2">Book-level AUM, flows, households, and pipeline. Full workspaces for relationship managers and intake.</p>
        </button>
        <button type="button" className="card role-picker-card" onClick={() => pick('client')}>
          <span className="role-picker-card-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: Icons.pie }} />
          <h2 className="serif">Client</h2>
          <p className="text-2">Household performance, advisor recommendations, and secure document exchange for you and your professional advisers.</p>
        </button>
        <button type="button" className="card role-picker-card" onClick={() => pick('compliance')}>
          <span className="role-picker-card-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: Icons.inbox }} />
          <h2 className="serif">Compliance (MLRO)</h2>
          <p className="text-2">KYC artefacts and essential facts only — review, approve, reject, or request clarification.</p>
        </button>
      </div>
    </div>
  );
}

function loadClientPortalUploads() {
  try {
    const raw = localStorage.getItem(CLIENT_PORTAL_UPLOADS_KEY);
    const arr = JSON.parse(raw || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveClientPortalUploads(list) {
  try {
    localStorage.setItem(CLIENT_PORTAL_UPLOADS_KEY, JSON.stringify(list));
  } catch (e) { /* ignore */ }
}

function loadClientAlertsDone() {
  try {
    const arr = JSON.parse(localStorage.getItem(CLIENT_ALERTS_DONE_KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveClientAlertsDone(ids) {
  try {
    localStorage.setItem(CLIENT_ALERTS_DONE_KEY, JSON.stringify(ids));
  } catch (e) { /* ignore */ }
}

function loadMeetingNotes() {
  try {
    return localStorage.getItem(CLIENT_MEETING_NOTES_KEY) || '';
  } catch (e) {
    return '';
  }
}

function saveMeetingNotes(s) {
  try {
    localStorage.setItem(CLIENT_MEETING_NOTES_KEY, s);
  } catch (e) { /* ignore */ }
}

const ASK_SLATE_DISCLAIMER =
  'Answers summarize your household snapshot. For material decisions, lean on your relationship manager.';

const ASK_SLATE_CHIP_QUESTIONS = [
  "What's my cash across entities?",
  'What are my biggest positions?',
  'Summarize what needs my signature.',
  'How am I doing vs my IPS cash target?',
  'When is my next review with the team?',
];

/** Tier A: deterministic answers over Slate fixtures (demo). */
function buildClientAskSlateSnapshot({
  POSITIONS, ACCOUNTS, HOUSEHOLD, INSIGHTS, HOUSEHOLD_BRIEFING,
}, marchettiRow, activeAlerts, chartExtras) {
  const householdNw = POSITIONS.reduce((a, p) => a + (p.mv || 0), 0);
  const cashMv = POSITIONS.filter(p => p.assetClass === 'cash').reduce((a, p) => a + (p.mv || 0), 0);
  const cashPct = householdNw ? cashMv / householdNw : 0;
  const ytdPct = marchettiRow ? marchettiRow.ytdPct : 0;
  const ipsCashTargetPct = HOUSEHOLD.ipsTargets && HOUSEHOLD.ipsTargets.cash != null
    ? HOUSEHOLD.ipsTargets.cash
    : 5;
  return {
    householdNw,
    cashMv,
    cashPct,
    ytdPct,
    POSITIONS,
    ACCOUNTS,
    HOUSEHOLD,
    INSIGHTS,
    activeAlerts,
    nextMeeting: HOUSEHOLD_BRIEFING && HOUSEHOLD_BRIEFING.nextMeeting,
    ipsCashTargetPct,
    rangeChangePct: chartExtras.rangeChangePct,
    rangeLabel: chartExtras.rangeLabel,
  };
}

function answerClientQuestion(question, snapshot, fmt) {
  const q = (question || '').trim().toLowerCase();
  const {
    householdNw, cashMv, cashPct, ytdPct, POSITIONS, ACCOUNTS, HOUSEHOLD, INSIGHTS, activeAlerts,
    nextMeeting, ipsCashTargetPct, rangeChangePct, rangeLabel,
  } = snapshot;

  const sources = [];
  const add = (label, hash) => {
    if (!sources.some(s => s.hash === hash)) sources.push({ label, hash });
  };

  if (!q) {
    return {
      answer: 'Ask about your household in plain language — try a suggestion above or type your own question.',
      sources,
    };
  }

  const any = (...words) => words.some(w => q.includes(w));

  if (any('biggest', 'largest', 'top position', 'top holdings', 'concentrate')) {
    const sorted = [...POSITIONS].sort((a, b) => (b.mv || 0) - (a.mv || 0));
    const top = sorted.slice(0, 3);
    const lines = top.map((p, i) => {
      const pct = householdNw ? (100 * (p.mv || 0)) / householdNw : 0;
      return `${i + 1}. ${p.symbol} — ${fmt.money(p.mv, { compact: true })} (${fmt.pct(pct, { dp: 1 })} of household)`;
    });
    add('Portfolio', 'clients/marchetti/portfolio');
    return {
      answer: `Your three largest holdings by market value:\n${lines.join('\n')}`,
      sources,
    };
  }

  if (any('cash') && any('across', 'entity', 'entities', 'account', 'where')) {
    const byAcct = {};
    for (const p of POSITIONS) {
      if (p.assetClass !== 'cash') continue;
      byAcct[p.account] = (byAcct[p.account] || 0) + (p.mv || 0);
    }
    const lines = ACCOUNTS.map(a => {
      const v = byAcct[a.id] || 0;
      return `• ${a.entity}: ${fmt.money(v, { compact: true })}`;
    }).filter((_, i) => (byAcct[ACCOUNTS[i].id] || 0) > 0);
    const totalLine = `Total cash and sweep: ${fmt.money(cashMv, { compact: true })} (${fmt.pct(100 * cashPct, { dp: 1 })} of household).`;
    add('Portfolio · cashflow', 'clients/marchetti/portfolio?sub=cashflow');
    add('Portfolio', 'clients/marchetti/portfolio');
    return {
      answer: lines.length ? `${totalLine}\n${lines.join('\n')}` : `${totalLine}`,
      sources,
    };
  }

  if (any('ips', 'policy') && any('cash', 'target', 'doing')) {
    add('Insights', 'clients/marchetti/insights');
    add('Portfolio', 'clients/marchetti/portfolio');
    const drift = (100 * cashPct) - ipsCashTargetPct;
    const qual = Math.abs(drift) <= 2 ? 'roughly aligned' : drift > 0 ? 'above target' : 'below target';
    return {
      answer: `IPS cash sleeve target is ${ipsCashTargetPct}%. You hold ${fmt.pct(100 * cashPct, { dp: 1 })} in cash — ${qual} on that metric.`,
      sources,
    };
  }

  if (any('cash', 'liquidity', 'sweep') && !any('across') && !any('ips', 'policy')) {
    add('Portfolio · cashflow', 'clients/marchetti/portfolio?sub=cashflow');
    add('Portfolio', 'clients/marchetti/portfolio');
    return {
      answer: `Liquidity is ${fmt.pct(100 * cashPct, { dp: 1 })} of household (${fmt.money(cashMv, { compact: true })} in cash / sweep). IPS cash sleeve target is ${ipsCashTargetPct}%.`,
      sources,
    };
  }

  if (any('signature', 'sign', 'attention', 'need me', 'needs my', 'open items', 'action', 'pending')) {
    const n = activeAlerts.length;
    const titles = activeAlerts.map(a => `• ${a.title}`);
    add('Documents', 'clients/marchetti/documents');
    add('Insights', 'clients/marchetti/insights');
    if (!n) {
      return {
        answer: 'Nothing critical is flagged on your home checklist right now. You can still upload documents or message your team anytime.',
        sources,
      };
    }
    return {
      answer: `${n} item${n === 1 ? '' : 's'} may need you this week:\n${titles.join('\n')}`,
      sources,
    };
  }

  if (any('net worth', 'household value', 'total value')) {
    add('Portfolio', 'clients/marchetti/portfolio');
    return {
      answer: `Consolidated household net worth is approximately ${fmt.money(householdNw, { compact: true })} across ${ACCOUNTS.length} accounts.`,
      sources,
    };
  }

  if (any('ytd', 'year to date', 'return')) {
    add('Portfolio', 'clients/marchetti/portfolio');
    return {
      answer: `Illustrative household YTD return is +${fmt.pct(100 * ytdPct, { dp: 1 })}. Benchmark reference in your materials is ${HOUSEHOLD.benchmark || '60/40'} — confirm interpretation with ${HOUSEHOLD.rm}.`,
      sources,
    };
  }

  if (any('next review', 'next meeting', 'when') && any('meeting', 'review', 'touch', 'team', 'rm')) {
    add('Events', 'clients/marchetti/events');
    if (nextMeeting && nextMeeting.date) {
      const line = `${nextMeeting.date}${nextMeeting.time ? ` · ${nextMeeting.time}` : ''} — ${nextMeeting.type || 'Scheduled review'}`;
      return {
        answer: `Next scheduled touch: ${line}.`,
        sources,
      };
    }
    return {
      answer: `Your relationship lead is ${HOUSEHOLD.rm}. Open Events for the household calendar.`,
      sources,
    };
  }

  if (any('relationship', 'wealth manager', 'who is my')) {
    add('Insights', 'clients/marchetti/insights');
    return {
      answer: `Your relationship manager is ${HOUSEHOLD.rm}. Use Insights to continue the thread with your team.`,
      sources,
    };
  }

  if (any('account', 'accounts', 'custodian')) {
    add('Portfolio', 'clients/marchetti/portfolio');
    const cust = [...new Set(ACCOUNTS.map(a => a.custodian))].join(', ');
    return {
      answer: `You have ${ACCOUNTS.length} accounts across ${cust}. Open Portfolio for holdings, entities, and custodians.`,
      sources,
    };
  }

  if (any('insight', 'discuss', 'recommend')) {
    const top = INSIGHTS.filter(x => (x.clientId || 'marchetti') === 'marchetti').slice(0, 3).map(i => `• ${i.title}`);
    add('Insights', 'clients/marchetti/insights');
    return {
      answer: `Highlighted themes from Insights:\n${top.join('\n')}`,
      sources,
    };
  }

  if (any('chart', 'growth', 'range') && any('portfolio', 'performance', 'how')) {
    add('Portfolio', 'clients/marchetti/portfolio');
    const dir = rangeChangePct >= 0 ? 'up' : 'down';
    return {
      answer: `Over ${rangeLabel}, your household value is ${dir} ${fmt.pct(100 * Math.abs(rangeChangePct), { dp: 2 })} vs the start of that window.`,
      sources,
    };
  }

  add('Portfolio', 'clients/marchetti/portfolio');
  add('Insights', 'clients/marchetti/insights');
  add('Documents', 'clients/marchetti/documents');
  return {
    answer: 'Try asking about cash across entities, largest positions, open items, net worth, YTD return, or your next review. You can also jump to Portfolio or Insights from the sources below.',
    sources,
  };
}

/** Home-screen prompts (demo) — id must stay stable for localStorage dismissal. */
const CLIENT_HOME_ALERTS = [
  {
    id: 'poa',
    tone: 'compliance',
    source: 'Compliance',
    title: 'Periodic update: Power of Attorney',
    body: 'As part of our scheduled KYC refresh, we need an updated PoA on file. Please upload a signed PDF.',
    cta: 'Upload PoA',
    kind: 'upload',
    uploadPurpose: 'PoA — Compliance (periodic)',
  },
  {
    id: 'sgd',
    tone: 'markets',
    source: 'Markets note',
    title: 'New SGD investment-grade bond',
    body: 'A new SGD-denominated IG issue is open for discussion. Let your team know if you want allocation reviewed before the window closes.',
    cta: 'Reply to team',
    kind: 'reply',
    replySubject: 'SGD IG bond — interest',
  },
  {
    id: 'optin',
    tone: 'wm',
    source: HOUSEHOLD.rm,
    title: 'Opt-in: new structured income sleeve',
    body: 'We are inviting qualified households to review a new income note. Confirm if you would like the prospectus and a sizing conversation.',
    cta: 'Respond',
    kind: 'reply',
    replySubject: 'Structured income — prospectus request',
  },
  {
    id: 'meeting',
    tone: 'meeting',
    source: 'Upcoming review',
    title: 'Portfolio discussion — bring your topics',
    body: 'Use the space below for themes to cover with your wealth manager — e.g. alts pacing, tax-lot harvesting, trust distributions, liquidity buffer.',
    cta: 'Add notes',
    kind: 'meeting',
  },
];

/** Client home — portfolio, growth, interventions, WM discussion. */
function ClientDashboardScreen({ navigate }) {
  const marchettiRow = slateClientBook.find(r => r.id === 'marchetti');
  const householdNw = POSITIONS.reduce((a, p) => a + p.mv, 0);
  const ytdPct = marchettiRow ? marchettiRow.ytdPct : 0;
  const cashMv = POSITIONS.filter(p => p.assetClass === 'cash').reduce((a, p) => a + p.mv, 0);
  const cashPct = householdNw ? cashMv / householdNw : 0;
  const [chartRange, setChartRange] = React.useState('1Y');
  const chartPerf = buildClientPerformanceComparisonSeries(householdNw, chartRange);
  const rangeChangePct = seriesPctChange(chartPerf.portfolioPoints);
  const rangeLabel = CLIENT_CHART_LABELS[chartRange] || chartRange;
  const allChartPts = chartPerf.series.flatMap(s => s.points);
  const chartSeriesMin = allChartPts.length ? Math.min(...allChartPts) : householdNw;
  const chartSeriesMax = allChartPts.length ? Math.max(...allChartPts) : householdNw;
  const chartPad = Math.max(householdNw * 0.012, 15000);
  const chartYMin = Math.min(householdNw * 0.612, chartSeriesMin - chartPad);
  const chartYMax = Math.max(householdNw * 1.028, chartSeriesMax + chartPad);
  const chartXTicks = getClientChartXAxisTicks(chartRange, chartPerf.series[0].points.length);

  const reco = INSIGHTS.filter(x => (x.clientId || 'marchetti') === 'marchetti').slice(0, 2);
  const [uploads, setUploads] = React.useState(() => loadClientPortalUploads());
  const [alertsDone, setAlertsDone] = React.useState(() => loadClientAlertsDone());
  const [uploadModal, setUploadModal] = React.useState(null);
  const [replyModal, setReplyModal] = React.useState(null);
  const [replyText, setReplyText] = React.useState('');
  const [rmMessageOpen, setRmMessageOpen] = React.useState(false);
  const [rmMessageText, setRmMessageText] = React.useState('');
  const [meetingOpen, setMeetingOpen] = React.useState(false);
  const [meetingDraft, setMeetingDraft] = React.useState(() => loadMeetingNotes());
  const [askQuery, setAskQuery] = React.useState('');
  const [askResult, setAskResult] = React.useState(null);
  const [askPanelOpen, setAskPanelOpen] = React.useState(false);

  React.useEffect(() => {
    if (replyModal) setReplyText('');
  }, [replyModal]);

  React.useEffect(() => {
    if (!askPanelOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setAskPanelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [askPanelOpen]);

  React.useEffect(() => {
    if (!askPanelOpen) return undefined;
    document.body.classList.add('client-ask-panel-lock');
    const id = window.setTimeout(() => {
      const askInput = document.getElementById('client-ask-panel-input');
      if (askInput) askInput.focus();
    }, 50);
    return () => {
      document.body.classList.remove('client-ask-panel-lock');
      window.clearTimeout(id);
    };
  }, [askPanelOpen]);

  const rmFirst = (HOUSEHOLD.rm || 'Your team').split(' ')[0];

  const addUploads = (files, meta = {}) => {
    const next = Array.from(files || []).map(f => ({
      id: 'u_' + Math.random().toString(36).slice(2, 11),
      fileName: f.name,
      at: new Date().toISOString(),
      purpose: meta.purpose || 'General',
    }));
    if (!next.length) return;
    const merged = [...next, ...uploads].slice(0, 40);
    setUploads(merged);
    saveClientPortalUploads(merged);
  };

  const dismissAlert = (id) => {
    const next = alertsDone.includes(id) ? alertsDone : [...alertsDone, id];
    setAlertsDone(next);
    saveClientAlertsDone(next);
  };

  const activeAlerts = CLIENT_HOME_ALERTS.filter(a => !alertsDone.includes(a.id));

  const digestCompliance = activeAlerts.filter(a => a.tone === 'compliance').length;
  const digestOpportunities = activeAlerts.filter(a => a.tone === 'markets' || a.tone === 'wm').length;
  const digestPlanning = activeAlerts.filter(a => a.tone === 'meeting').length;

  const ipsCashTargetPct = HOUSEHOLD.ipsTargets && HOUSEHOLD.ipsTargets.cash != null ? HOUSEHOLD.ipsTargets.cash : 5;
  const cashDriftPctPts = 100 * cashPct - ipsCashTargetPct;
  const liquidityVsPolicy = Math.abs(cashDriftPctPts) <= 2 ? 'on track vs IPS cash sleeve' : cashDriftPctPts > 0 ? 'above IPS cash target' : 'below IPS cash target';

  const nextMeet = HOUSEHOLD_BRIEFING && HOUSEHOLD_BRIEFING.nextMeeting;
  const nextTouchShort = nextMeet && nextMeet.date
    ? `${nextMeet.date}${nextMeet.time ? ` · ${nextMeet.time}` : ''} · ${nextMeet.type || 'Review'}`
    : null;

  const askSnapshot = buildClientAskSlateSnapshot(
    { POSITIONS, ACCOUNTS, HOUSEHOLD, INSIGHTS, HOUSEHOLD_BRIEFING },
    marchettiRow,
    activeAlerts,
    { rangeChangePct, rangeLabel },
  );

  const runAsk = (text) => {
    const raw = text != null ? String(text) : askQuery;
    const t = raw.trim();
    if (text != null) setAskQuery(raw);
    setAskResult(answerClientQuestion(t, askSnapshot, fmt));
  };

  const alertToneIconHtml = (tone) => {
    if (tone === 'compliance') return Icons.alert;
    if (tone === 'markets') return Icons.spark;
    if (tone === 'wm') return Icons.mail;
    return Icons.calendar;
  };

  const insightKindIconHtml = (kind) => {
    const k = (kind || '').toLowerCase();
    if (k === 'concentration') return Icons.pie;
    if (k === 'tax') return Icons.percent;
    if (k === 'equity') return Icons.spark;
    if (k === 'cash') return Icons.wallet;
    if (k === 'cashflow') return Icons.table;
    return Icons.bulb;
  };

  const insightTeaser = (body) => {
    const s = (body || '').trim();
    if (!s) return '';
    const dot = s.indexOf('. ');
    if (dot >= 0 && dot <= 160) return s.slice(0, dot + 1);
    return s.length > 130 ? `${s.slice(0, 127)}…` : s;
  };

  const onAlertAction = (alert) => {
    if (alert.kind === 'upload') {
      setUploadModal({
        title: alert.title,
        purpose: alert.uploadPurpose,
        alertId: alert.id,
      });
    } else if (alert.kind === 'reply') {
      setReplyModal({
        alertId: alert.id,
        subject: alert.replySubject,
        title: alert.title,
      });
    } else if (alert.kind === 'meeting') {
      setMeetingDraft(loadMeetingNotes());
      setMeetingOpen(true);
    }
  };

  const submitUploadModal = (files) => {
    if (!uploadModal) return;
    addUploads(files, { purpose: uploadModal.purpose });
    if (uploadModal.alertId) dismissAlert(uploadModal.alertId);
    setUploadModal(null);
  };

  const submitReplyModal = (files, note) => {
    if (!replyModal) return;
    const purpose = `Message: ${replyModal.subject}`;
    let merged = uploads;
    if (note && note.trim()) {
      merged = [{
        id: 'm_' + Math.random().toString(36).slice(2, 11),
        fileName: `(message) ${replyModal.subject}.txt`,
        at: new Date().toISOString(),
        purpose,
        note: note.trim(),
      }, ...merged].slice(0, 40);
    }
    if (files && files.length) {
      const fileRows = Array.from(files).map(f => ({
        id: 'u_' + Math.random().toString(36).slice(2, 11),
        fileName: f.name,
        at: new Date().toISOString(),
        purpose,
      }));
      merged = [...fileRows, ...merged].slice(0, 40);
    }
    if ((note && note.trim()) || (files && files.length)) {
      setUploads(merged);
      saveClientPortalUploads(merged);
    }
    dismissAlert(replyModal.alertId);
    setReplyModal(null);
  };

  const submitRmMessage = (files) => {
    const note = rmMessageText.trim();
    const purpose = `Message: ${HOUSEHOLD.rm}`;
    let merged = uploads;
    if (note) {
      merged = [{
        id: 'm_' + Math.random().toString(36).slice(2, 11),
        fileName: `(message) ${HOUSEHOLD.rm}.txt`,
        at: new Date().toISOString(),
        purpose,
        note,
      }, ...merged].slice(0, 40);
    }
    if (files && files.length) {
      const fileRows = Array.from(files).map(f => ({
        id: 'u_' + Math.random().toString(36).slice(2, 11),
        fileName: f.name,
        at: new Date().toISOString(),
        purpose,
      }));
      merged = [...fileRows, ...merged].slice(0, 40);
    }
    if (note || (files && files.length)) {
      setUploads(merged);
      saveClientPortalUploads(merged);
    }
    setRmMessageOpen(false);
    setRmMessageText('');
  };

  const saveMeetingAndClose = () => {
    saveMeetingNotes(meetingDraft);
    dismissAlert('meeting');
    setMeetingOpen(false);
  };

  const uploadInputId = 'client-modal-upload-input';
  const rmMessageUploadId = 'client-rm-message-file';

  return (
    <div className="page client-dashboard">
      <DemoTourStrip
        navigate={navigate}
        variant="client"
        className="demo-tour-strip--client-dashboard-top"
        onMessageChristine={() => {
          setRmMessageText('');
          setRmMessageOpen(true);
        }}
      />

      <section className="client-dashboard-hero" aria-labelledby="client-hero-heading">
        <div className="client-dashboard-hero-top row gap-16">
          <div className="client-dashboard-hero-copy" style={{ flex: '1 1 auto', minWidth: 0 }}>
            <div className="eyebrow">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · your household</div>
            <h1 id="client-hero-heading" className="serif client-dashboard-hero-title">{HOUSEHOLD.name}</h1>
            <p className="client-dashboard-hero-headline tabular-nums">
              {fmt.pct(100 * ytdPct, { dp: 1 })} YTD · {fmt.money(householdNw, { compact: true })} net worth · {fmt.pct(100 * cashPct, { dp: 1 })} cash — {liquidityVsPolicy}.
            </p>
            <p className="client-dashboard-hero-lede text-2">
              {nextTouchShort
                ? <>Next touch: <span className="tabular-nums">{nextTouchShort}</span> — Ask anything for a quick read on the book, or message {HOUSEHOLD.rm} anytime.</>
                : <>Anything that needs you is summarized below — full portfolio detail stays one tap away.</>}
            </p>
          </div>
          <div className="client-dashboard-hero-cta row gap-10" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <button type="button" className="btn primary" onClick={() => navigate('clients/marchetti/portfolio')}>Full portfolio</button>
            <button type="button" className="btn ghost client-ask-hero-cta" onClick={() => setAskPanelOpen(true)}>
              Ask anything
            </button>
            <button type="button" className="btn ghost" onClick={() => navigate('clients/marchetti/insights')}>All insights</button>
          </div>
        </div>

        <div className="client-dashboard-display tabular-nums">
          {fmt.money(householdNw, { compact: true })}
        </div>
        <div className="client-dashboard-stat-row tabular-nums">
          <div className="client-dashboard-stat">
            <span className="client-dashboard-stat-label">YTD return</span>
            <span className="client-dashboard-stat-value" style={{ color: 'var(--pos)' }}>{fmt.pct(100 * ytdPct, { dp: 1 })}</span>
          </div>
          <div className="client-dashboard-stat">
            <span className="client-dashboard-stat-label">Liquidity</span>
            <span className="client-dashboard-stat-value">{fmt.pct(100 * cashPct, { dp: 1 })}</span>
            <span className="client-dashboard-stat-sub">{fmt.money(cashMv, { compact: true })} cash / sweep</span>
          </div>
          <div className="client-dashboard-stat">
            <span className="client-dashboard-stat-label">Relationship manager</span>
            <span className="client-dashboard-stat-value client-dashboard-stat-value--rm">{HOUSEHOLD.rm}</span>
            <span className="client-dashboard-stat-sub">IPS benchmark reference · {HOUSEHOLD.benchmark || '60/40'}</span>
          </div>
        </div>
      </section>

      <div className="client-dashboard-split">
        <section className="client-performance-section" aria-labelledby="client-performance-heading">
          <div className="client-action-digest-head client-performance-head row gap-12" style={{ flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2 id="client-performance-heading" className="serif client-section-title client-section-title--compact">Portfolio performance</h2>
              <p className="text-3 client-section-lede client-section-lede--tight">Household value over time with benchmark context.</p>
            </div>
            <div className="seg client-chart-range-seg client-chart-range-seg--compact" role="group" aria-label="Chart time range">
              {CLIENT_CHART_RANGES.map(k => (
                <button key={k} type="button" className={chartRange === k ? 'active' : ''} onClick={() => setChartRange(k)}>{CLIENT_CHART_LABELS[k]}</button>
              ))}
            </div>
          </div>
          <div className="card client-growth-card client-growth-card--split client-growth-card--chart-only">
            {Charts && Charts.LineChart ? (
              <Charts.LineChart
                height={168}
                yMin={chartYMin}
                yMax={chartYMax}
                series={chartPerf.series}
                annotationData={chartPerf.annotationData}
                xAxisTicks={chartXTicks}
              />
            ) : null}
            <div className="client-perf-legend" aria-label="Chart legend">
              <div className="client-perf-legend-item">
                <span className="client-perf-legend-line client-perf-legend-line--solid" aria-hidden="true" />
                <span>Portfolio</span>
              </div>
              <div className="client-perf-legend-item">
                <span className="client-perf-legend-line client-perf-legend-line--dash client-perf-legend-line--mid" aria-hidden="true" />
                <span>60/40 benchmark</span>
              </div>
              <div className="client-perf-legend-item">
                <span className="client-perf-legend-line client-perf-legend-line--dash client-perf-legend-line--lite" aria-hidden="true" />
                <span>S&amp;P 500</span>
              </div>
              <div className="client-perf-legend-item">
                <span className="client-perf-legend-dot client-perf-legend-dot--event" aria-hidden="true" />
                <span>Notable event</span>
              </div>
            </div>
            <div className="client-perf-metrics">
              {chartPerf.metricsStrip.map((m) => (
                <div key={m.label} className="client-perf-metric">
                  <div className="client-perf-metric-rule" aria-hidden="true" />
                  <div className="client-perf-metric-label">{m.label}</div>
                  <div className={`client-perf-metric-value${m.positive ? ' client-perf-metric-value--pos' : ' client-perf-metric-value--neg'}`}>{m.value}</div>
                </div>
              ))}
            </div>
            <p className="text-3 client-chart-foot client-chart-foot--compact">
              <strong>{rangeLabel}:</strong>{' '}
              <span style={{ color: rangeChangePct >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                {rangeChangePct >= 0 ? '▲' : '▼'} {fmt.pct(100 * Math.abs(rangeChangePct), { dp: 2 })} vs start of range
              </span>
            </p>
          </div>

          <section className="client-wm-discuss" aria-labelledby="client-wm-discuss-heading">
            <div className="client-action-digest-head client-wm-discuss-head row gap-12" style={{ flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <h2 id="client-wm-discuss-heading" className="serif client-section-title client-section-title--compact">Discuss with your wealth manager</h2>
                <p className="text-3 client-wm-discuss-liner">These are the highest-priority items; the rest of your insights are under <span className="tabular-nums">All insights</span>.</p>
              </div>
              <button type="button" className="btn ghost sm" onClick={() => navigate('clients/marchetti/insights')}>All insights</button>
            </div>
            <div className="client-alert-stack client-alert-stack--dense client-alert-stack--wm-discuss">
              {reco.map(i => {
                const kindLabel = (i.kind || '').replace(/_/g, ' ');
                const tone = (() => {
                  const k = (i.kind || '').toLowerCase();
                  if (k === 'concentration' || k === 'equity') return 'markets';
                  if (k === 'tax') return 'wm';
                  return 'markets';
                })();
                return (
                  <div key={i.id} className={`client-alert-row client-alert-row--dense client-alert-row--${tone}`}>
                    <div className="client-alert-row-main">
                      <span className="client-alert-ic" aria-hidden dangerouslySetInnerHTML={{ __html: insightKindIconHtml(i.kind) }} />
                      <span className="client-alert-one-line">
                        <span className="client-alert-insight-meta">
                          <span className={`client-dashboard-kind-pill client-dashboard-kind-pill--${tone}`}>{kindLabel.toUpperCase()}</span>
                          {i.priority === 'high' ? (
                            <span className={`client-dashboard-severity-inline client-dashboard-severity-inline--${tone}`}>HIGH</span>
                          ) : null}
                        </span>
                        <span className="client-alert-title-compact">{i.title}</span>
                      </span>
                    </div>
                    <div className="client-alert-actions client-alert-actions--dense">
                      <button type="button" className="btn sm" onClick={() => navigate(`clients/marchetti/insights/${i.id}`)}>Open</button>
                    </div>
                    <p className="client-alert-body-digest text-2">{insightTeaser(i.body)}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </section>

        <section className="client-intervention-section client-intervention-section--split" aria-labelledby="client-attention-heading">
          <div className="client-action-digest-head row gap-12" style={{ flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2 id="client-attention-heading" className="serif client-section-title client-section-title--compact">Needs your attention</h2>
              <p className="text-3 client-section-lede client-section-lede--tight">Each row shows context under the title — use the action button on the right.</p>
            </div>
            <div className="client-digest-chips row gap-8" role="status">
              {digestCompliance > 0 ? (
                <span className="client-digest-chip client-digest-chip--compliance">Compliance · {digestCompliance}</span>
              ) : null}
              {digestOpportunities > 0 ? (
                <span className="client-digest-chip client-digest-chip--opps">Opportunities · {digestOpportunities}</span>
              ) : null}
              {digestPlanning > 0 ? (
                <span className="client-digest-chip client-digest-chip--plan">Planning · {digestPlanning}</span>
              ) : null}
              {!digestCompliance && !digestOpportunities && !digestPlanning ? (
                <span className="client-digest-chip client-digest-chip--muted">No open checklist items</span>
              ) : null}
            </div>
          </div>
          <p className="client-action-count tabular-nums">
            {activeAlerts.length > 0
              ? <>{activeAlerts.length} item{activeAlerts.length === 1 ? '' : 's'} need you</>
              : 'You are caught up on home prompts'}
          </p>
          <div className="client-alert-stack client-alert-stack--dense">
            {activeAlerts.map(a => (
              <div key={a.id} className={`client-alert-row client-alert-row--dense client-alert-row--${a.tone}`}>
                <div className="client-alert-row-main">
                  <span className="client-alert-ic" aria-hidden dangerouslySetInnerHTML={{ __html: alertToneIconHtml(a.tone) }} />
                  <span className="client-alert-one-line">
                    <span className={`client-dashboard-kind-pill client-dashboard-kind-pill--${a.tone} client-dashboard-kind-pill--source`}>{a.source}</span>
                    <span className="client-alert-title-compact">{a.title}</span>
                  </span>
                </div>
                <div className="client-alert-actions client-alert-actions--dense">
                  <button type="button" className="btn sm" onClick={() => onAlertAction(a)}>{a.cta}</button>
                </div>
                <p className="client-alert-body-digest text-2">{a.body}</p>
              </div>
            ))}
            <div className="client-alert-row client-alert-row--dense client-alert-row--wm">
              <div className="client-alert-row-main">
                <span className="client-alert-ic" aria-hidden dangerouslySetInnerHTML={{ __html: Icons.upload }} />
                <span className="client-alert-one-line">
                  <span className="client-dashboard-kind-pill client-dashboard-kind-pill--wm client-dashboard-kind-pill--source">Wealth manager</span>
                  <span className="client-alert-title-compact">Financial documents</span>
                </span>
              </div>
              <div className="client-alert-actions client-alert-actions--dense">
                <button type="button" className="btn ghost sm" onClick={() => setUploadModal({ title: 'Document for your wealth manager', purpose: 'Financial — client upload', alertId: null })}>
                  Attach file
                </button>
              </div>
              <p className="client-alert-body-digest text-3">Share tax forms, account letters, or other files with {rmFirst} — attach in one step.</p>
            </div>
          </div>
        </section>
      </div>

      {askPanelOpen ? (
        <div
          className="client-ask-panel-backdrop"
          aria-hidden="true"
          onClick={() => setAskPanelOpen(false)}
        />
      ) : null}
      <aside
        className={`client-ask-panel${askPanelOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!askPanelOpen}
        aria-labelledby="ask-slate-heading"
      >
        <div className="client-ask-panel-header">
          <h2 id="ask-slate-heading" className="serif client-section-title client-section-title--compact client-ask-panel-title">Ask about your household</h2>
          <button
            type="button"
            className="btn ghost icon modal-close"
            onClick={() => setAskPanelOpen(false)}
            aria-label="Close ask panel"
          >
            <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
          </button>
        </div>
        <div className="client-ask-panel-scroll">
          <p className="text-3 client-section-lede client-section-lede--tight">Plain-language answers from your household snapshot — not personalized advice.</p>
          <div className="client-ask-panel-chips mt-12">
            {ASK_SLATE_CHIP_QUESTIONS.map(q => (
              <button key={q} type="button" className="client-ask-chip" onClick={() => runAsk(q)}>{q}</button>
            ))}
          </div>
          <form className="client-ask-form client-ask-panel-form row gap-10" onSubmit={e => { e.preventDefault(); runAsk(); }}>
            <label htmlFor="client-ask-panel-input" className="sr-only">Your question</label>
            <input id="client-ask-panel-input" type="text" className="client-ask-input" placeholder="e.g. How much cash is in the trust?" value={askQuery} onChange={e => setAskQuery(e.target.value)} autoComplete="off" />
            <button type="submit" className="btn primary client-ask-panel-submit">Ask</button>
          </form>
          {askResult ? (
            <div className="client-ask-result client-ask-panel-result mt-16">
              <div className="label client-ask-label">Answer</div>
              <p className="client-ask-answer text-2" style={{ whiteSpace: 'pre-line' }}>{askResult.answer}</p>
              {askResult.sources && askResult.sources.length > 0 ? (
                <div className="client-ask-sources mt-12">
                  <div className="label client-ask-label">Sources</div>
                  <div className="row gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
                    {askResult.sources.map((s) => (
                      <button key={s.hash + s.label} type="button" className="btn ghost sm" onClick={() => { setAskPanelOpen(false); navigate(s.hash); }}>{s.label}</button>
                    ))}
                  </div>
                </div>
              ) : null}
              <p className="client-ask-disclaimer text-3 mt-12">{ASK_SLATE_DISCLAIMER}</p>
            </div>
          ) : (
            <div className="client-ask-panel-answer-slot" aria-live="polite">
              <p className="text-3 client-ask-panel-answer-slot-hint">Pick a suggestion or type a question — answers will show here, with links to Portfolio, Insights, or Documents when relevant.</p>
            </div>
          )}
        </div>
      </aside>

      {uploadModal ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setUploadModal(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="client-upload-title" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2 id="client-upload-title" className="modal-title serif">{uploadModal.title}</h2>
              <button type="button" className="btn ghost icon modal-close" onClick={() => setUploadModal(null)} aria-label="Close">
                <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-2" style={{ fontSize: 13 }}>Demo only — files are not uploaded to a server.</p>
              <input id={uploadInputId} type="file" className="modal-file-input" multiple accept=".pdf,.png,.jpg,.jpeg,.zip" onChange={e => { submitUploadModal(e.target.files); e.target.value = ''; }} />
              <label htmlFor={uploadInputId} className="btn primary mt-12" style={{ display: 'inline-block' }}>Choose files</label>
              <button type="button" className="btn ghost mt-10" onClick={() => setUploadModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {rmMessageOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setRmMessageOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="client-rm-message-title" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2 id="client-rm-message-title" className="modal-title serif">Message Christine</h2>
              <button type="button" className="btn ghost icon modal-close" onClick={() => setRmMessageOpen(false)} aria-label="Close">
                <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-2" style={{ fontSize: 13 }}>Sent to your relationship manager ({HOUSEHOLD.rm}). Demo only — messages stay in this browser as activity history.</p>
              <label className="modal-label" htmlFor="client-rm-message-note">Your message</label>
              <textarea id="client-rm-message-note" className="modal-input modal-textarea" rows={4} placeholder={`Hi Christine, I'd like to…`} value={rmMessageText} onChange={e => setRmMessageText(e.target.value)} />
              <label className="modal-label mt-12" htmlFor={rmMessageUploadId}>Attach a file (optional)</label>
              <input id={rmMessageUploadId} type="file" className="modal-file-input" onChange={(e) => {
                submitRmMessage(e.target.files);
                e.target.value = '';
              }} />
              <div className="modal-actions row gap-10 mt-16" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" className="btn ghost" onClick={() => setRmMessageOpen(false)}>Cancel</button>
                <button type="button" className="btn primary" onClick={() => submitRmMessage(null)} disabled={!rmMessageText.trim()}>Send message</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {replyModal ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setReplyModal(null)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title serif">{replyModal.title}</h2>
              <button type="button" className="btn ghost icon modal-close" onClick={() => setReplyModal(null)} aria-label="Close">
                <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
              </button>
            </div>
            <div className="modal-body">
              <label className="modal-label" htmlFor="client-reply-note">Message to your team (optional)</label>
              <textarea id="client-reply-note" className="modal-input modal-textarea" rows={3} placeholder="E.g. I’d like to review sizing…" value={replyText} onChange={e => setReplyText(e.target.value)} />
              <label className="modal-label mt-12" htmlFor="client-reply-file">Attach supporting file (optional)</label>
              <input id="client-reply-file" type="file" className="modal-file-input" onChange={(e) => {
                submitReplyModal(e.target.files, replyText);
                e.target.value = '';
              }} />
              <div className="modal-actions row gap-10 mt-16" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button type="button" className="btn ghost" onClick={() => setReplyModal(null)}>Cancel</button>
                <button type="button" className="btn primary" onClick={() => submitReplyModal(null, replyText)}>Send to team</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {meetingOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setMeetingOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title serif">Topics for your portfolio review</h2>
              <button type="button" className="btn ghost icon modal-close" onClick={() => setMeetingOpen(false)} aria-label="Close">
                <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
              </button>
            </div>
            <div className="modal-body">
              <label className="modal-label" htmlFor="client-meeting-notes">Discussion points for {HOUSEHOLD.rm}</label>
              <textarea id="client-meeting-notes" className="modal-input modal-textarea" rows={6} value={meetingDraft} onChange={e => setMeetingDraft(e.target.value)} placeholder="Alts pacing, tax lots, trust distributions, liquidity target…" />
              <div className="modal-actions row gap-10 mt-16" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn ghost" onClick={() => setMeetingOpen(false)}>Cancel</button>
                <button type="button" className="btn primary" onClick={saveMeetingAndClose}>Save &amp; mark done</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function loadComplianceDocOverrides() {
  try {
    return JSON.parse(localStorage.getItem(COMPLIANCE_DOC_STATE_KEY) || '{}') || {};
  } catch (e) {
    return {};
  }
}

function saveComplianceDocOverrides(obj) {
  try {
    localStorage.setItem(COMPLIANCE_DOC_STATE_KEY, JSON.stringify(obj));
  } catch (e) { /* ignore */ }
}

function mergeDocStatus(doc, overrides) {
  const o = overrides[doc.id];
  if (!o) return doc;
  return { ...doc, status: o.status || doc.status, reviewComment: o.comment || '', reviewedAt: o.at };
}

function loadInjectedComplianceDocs() {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPLIANCE_INJECTED_DOCS_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch (e) {
    return {};
  }
}

function saveInjectedComplianceDocs(obj) {
  try {
    localStorage.setItem(COMPLIANCE_INJECTED_DOCS_KEY, JSON.stringify(obj));
  } catch (e) { /* ignore */ }
}

function mergeClientDocsForCompliance(clientId, client, overrides, injectedByClient) {
  const core = (client.docs || []).map(d => mergeDocStatus(d, overrides));
  const extra = ((injectedByClient && injectedByClient[clientId]) || []).map(d => mergeDocStatus(d, overrides));
  return [...core, ...extra];
}

function complianceKycStatusLabel(c, pending) {
  if (pending > 0) return 'In review';
  const k = c.kycStatus || '';
  if (k === 'clear') return 'Clear';
  if (k === 'prospect') return 'Prospect';
  return k.replace(/_/g, ' ') || '—';
}

function ComplianceHomeScreen({ navigate }) {
  const COMPLIANCE_KYC = window.Slate.COMPLIANCE_KYC || { clients: [] };
  const overrides = loadComplianceDocOverrides();
  const injected = loadInjectedComplianceDocs();
  const rows = COMPLIANCE_KYC.clients.map(c => {
    const docs = mergeClientDocsForCompliance(c.id, c, overrides, injected);
    const pending = docs.filter(d => d.status === 'pending').length;
    return { ...c, pending };
  }).filter(c => c.pending > 0);
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Compliance · MLRO</div>
          <h1 className="serif">KYC inbox</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 640 }}>
            Client identity and entity paperwork only. Approve, ask for more detail, or reject with a comment — no portfolios or holdings in this view.
          </p>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p className="text-2" style={{ margin: 0 }}>No pending files. Review periodic renewals under Expiring IDs or browse the full document register.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Client</th>
                <th>Segment</th>
                <th>RM</th>
                <th className="num">Pending files</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`compliance/${c.id}`)}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className="text-3" style={{ fontSize: 11 }}>{c.jurisdiction}</div>
                  </td>
                  <td><span className="tag">{c.segment}</span></td>
                  <td className="text-3" style={{ fontSize: 13 }}>{c.rm}</td>
                  <td className="num">{c.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ComplianceClientsDirectoryScreen({ navigate }) {
  const COMPLIANCE_KYC = window.Slate.COMPLIANCE_KYC || { clients: [] };
  const overrides = loadComplianceDocOverrides();
  const injected = loadInjectedComplianceDocs();
  const rows = COMPLIANCE_KYC.clients.map(c => {
    const docs = mergeClientDocsForCompliance(c.id, c, overrides, injected);
    const pending = docs.filter(d => d.status === 'pending').length;
    return { ...c, pending };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Compliance · MLRO</div>
          <h1 className="serif">All clients</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 640 }}>
            Directory of KYC records across the book. Open a row for file-level review — still no portfolio or holdings.
          </p>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Client</th>
              <th>Segment</th>
              <th>RM</th>
              <th>KYC status</th>
              <th className="num">Pending files</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`compliance/${c.id}`)}>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div className="text-3" style={{ fontSize: 11 }}>{c.jurisdiction}</div>
                </td>
                <td><span className="tag">{c.segment}</span></td>
                <td className="text-3" style={{ fontSize: 13 }}>{c.rm}</td>
                <td>{complianceKycStatusLabel(c, c.pending)}</td>
                <td className="num">{c.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompliancePipelineScreen({ navigate }) {
  const COMPLIANCE_KYC = window.Slate.COMPLIANCE_KYC || { clients: [] };
  const overrides = loadComplianceDocOverrides();
  const injected = loadInjectedComplianceDocs();
  const rows = COMPLIANCE_KYC.clients
    .filter(c => (c.lifecycle || '') === 'pipeline')
    .map(c => {
      const docs = mergeClientDocsForCompliance(c.id, c, overrides, injected);
      const pending = docs.filter(d => d.status === 'pending').length;
      return { ...c, pending };
    });
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Compliance · MLRO</div>
          <h1 className="serif">Pipeline</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 640 }}>
            Prospective relationships and onboarding queues. Illustrative only — no investment products or positions.
          </p>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Prospect / entity</th>
              <th>Segment</th>
              <th>RM</th>
              <th>Stage</th>
              <th className="num">Open KYC items</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`compliance/${c.id}`)}>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div className="text-3" style={{ fontSize: 11 }}>{c.jurisdiction}</div>
                </td>
                <td><span className="tag">{c.segment}</span></td>
                <td className="text-3" style={{ fontSize: 13 }}>{c.rm}</td>
                <td className="text-3" style={{ fontSize: 13 }}>{c.pending > 0 ? 'Files outstanding' : 'Awaiting intake'}</td>
                <td className="num">{c.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComplianceExpiringScreen({ navigate }) {
  const COMPLIANCE_KYC = window.Slate.COMPLIANCE_KYC || { clients: [] };
  const overrides = loadComplianceDocOverrides();
  const injected = loadInjectedComplianceDocs();
  const rows = [];
  for (const c of COMPLIANCE_KYC.clients) {
    const docs = mergeClientDocsForCompliance(c.id, c, overrides, injected);
    for (const d of docs) {
      if (d.expiresOn) rows.push({ client: c, doc: d });
    }
  }
  rows.sort((a, b) => String(a.doc.expiresOn).localeCompare(String(b.doc.expiresOn)));
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Compliance · MLRO</div>
          <h1 className="serif">Expiring IDs & renewals</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 640 }}>
            Documents with renewal dates, soonest first. Row opens the client KYC file.
          </p>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Client</th>
              <th>Document</th>
              <th>Type</th>
              <th>Status</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ client: c, doc: d }) => (
              <tr key={`${c.id}-${d.id}`} style={{ cursor: 'pointer' }} onClick={() => navigate(`compliance/${c.id}`)}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{d.fileName}</td>
                <td className="text-3" style={{ fontSize: 13 }}>{d.docType}</td>
                <td>
                  <span className={`tag ${d.status === 'approved' ? '' : d.status === 'rejected' ? 'neg' : d.status === 'more_info' ? 'warn' : ''}`}>{d.status.replace(/_/g, ' ')}</span>
                </td>
                <td className="mono" style={{ fontSize: 13 }}>{d.expiresOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComplianceDocumentsScreen({ navigate }) {
  const [statusFilter, setStatusFilter] = React.useState('all');
  const COMPLIANCE_KYC = window.Slate.COMPLIANCE_KYC || { clients: [] };
  const overrides = loadComplianceDocOverrides();
  const injected = loadInjectedComplianceDocs();
  const flat = [];
  for (const c of COMPLIANCE_KYC.clients) {
    const docs = mergeClientDocsForCompliance(c.id, c, overrides, injected);
    for (const d of docs) flat.push({ client: c, doc: d });
  }
  const filtered = statusFilter === 'all' ? flat : flat.filter(r => r.doc.status === statusFilter);
  const chips = ['all', 'pending', 'approved', 'more_info', 'rejected'];
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Compliance · MLRO</div>
          <h1 className="serif">Document register</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 640 }}>
            Flattened register across clients. Filter by status, then open the client workspace for decisions.
          </p>
        </div>
      </div>
      <div className="row gap-8 mb-16" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="label" style={{ marginRight: 4 }}>Status</span>
        {chips.map(ch => (
          <span
            key={ch}
            className={`chip ${statusFilter === ch ? 'on' : ''}`}
            onClick={() => setStatusFilter(ch)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setStatusFilter(ch); } }}
          >
            {ch === 'all' ? 'All' : ch.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Client</th>
              <th>File</th>
              <th>Type</th>
              <th>Status</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ client: c, doc: d }) => (
              <tr key={`${c.id}-${d.id}`} style={{ cursor: 'pointer' }} onClick={() => navigate(`compliance/${c.id}`)}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{d.fileName}</td>
                <td className="text-3" style={{ fontSize: 13 }}>{d.docType}</td>
                <td>
                  <span className={`tag ${d.status === 'approved' ? '' : d.status === 'rejected' ? 'neg' : d.status === 'more_info' ? 'warn' : ''}`}>{d.status.replace(/_/g, ' ')}</span>
                </td>
                <td className="text-3 mono" style={{ fontSize: 13 }}>{d.expiresOn || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComplianceClientScreen({ clientId, navigate }) {
  const COMPLIANCE_KYC = window.Slate.COMPLIANCE_KYC || { clients: [] };
  const client = COMPLIANCE_KYC.clients.find(c => c.id === clientId);
  const [overrides, setOverrides] = React.useState(() => loadComplianceDocOverrides());
  const [injectedMap, setInjectedMap] = React.useState(() => loadInjectedComplianceDocs());
  const [modal, setModal] = React.useState(null);
  const [note, setNote] = React.useState('');

  if (!client) {
    return (
      <div className="page">
        <p className="text-2">Client not found.</p>
        <button type="button" className="btn mt-16" onClick={() => navigate('compliance/inbox')}>Back to inbox</button>
      </div>
    );
  }

  const docs = mergeClientDocsForCompliance(client.id, client, overrides, injectedMap);
  const showRefreshCta = docs.length > 0 && docs.every(d => d.status === 'approved');

  const openModal = (docId, mode) => {
    setNote('');
    setModal({ docId: docId || null, mode });
  };

  const applyAction = (docId, status, comment) => {
    const next = { ...overrides, [docId]: { status, comment: comment || '', at: new Date().toISOString() } };
    saveComplianceDocOverrides(next);
    setOverrides(next);
    setModal(null);
    setNote('');
  };

  const submitRefreshRequest = () => {
    const v = note.trim();
    if (!v) return;
    const newId = `ck-refresh-${clientId}-${Date.now()}`;
    const row = {
      id: newId,
      fileName: 'Periodic refresh · package requested.pdf',
      docType: 'KYC · refresh',
      uploadedAt: new Date().toISOString().slice(0, 10),
      status: 'pending',
      reviewComment: `Requested: ${v}`,
    };
    const prev = loadInjectedComplianceDocs();
    const nextList = [...(prev[clientId] || []), row];
    const nextInjected = { ...prev, [clientId]: nextList };
    saveInjectedComplianceDocs(nextInjected);
    setInjectedMap(nextInjected);
    setModal(null);
    setNote('');
  };

  const submitModal = () => {
    if (!modal) return;
    if (modal.mode === 'refresh') {
      submitRefreshRequest();
      return;
    }
    const v = note.trim();
    if (!v) return;
    const status = modal.mode === 'reject' ? 'rejected' : 'more_info';
    applyAction(modal.docId, status, v);
  };

  return (
    <div className="page">
      <header className="page-header page-header--compliance-client">
        <button type="button" className="btn ghost sm compliance-client-back" onClick={() => navigate('compliance/inbox')}>← KYC inbox</button>
        <div className="page-header--compliance-client__intro">
          <h1 className="serif page-header--compliance-client__title">{client.name}</h1>
          <p className="text-2 compliance-client-tagline">{'KYC review — identity & entity documents only; no portfolio or holdings.'}</p>
          {showRefreshCta ? (
            <div className="compliance-client-header-cta">
              <button type="button" className="btn primary" onClick={() => openModal(null, 'refresh')}>Request updated documents</button>
            </div>
          ) : null}
        </div>
        <aside className="compliance-client-facts" aria-label="Client facts">
          <span className="compliance-client-facts__label">Profile</span>
          <dl className="compliance-client-facts__dl">
            <div className="compliance-client-facts__row"><dt>Segment</dt><dd>{client.segment}</dd></div>
            <div className="compliance-client-facts__row"><dt>Primary email</dt><dd className="mono">{client.primaryEmail}</dd></div>
            <div className="compliance-client-facts__row"><dt>Jurisdiction</dt><dd>{client.jurisdiction}</dd></div>
            <div className="compliance-client-facts__row"><dt>Relationship manager</dt><dd>{client.rm}</dd></div>
          </dl>
        </aside>
      </header>

      <section className="section compliance-files-section" aria-labelledby="compliance-files-title">
        <div className="card compliance-files-card">
          <div className="compliance-files-card__head">
            <h2 id="compliance-files-title" className="serif compliance-files-card__title">Files</h2>
            <p className="text-3 compliance-files-card__subtitle">Artifacts in scope for this compliance review.</p>
          </div>
          <div className="compliance-doc-list">
            {docs.map(d => (
              <div key={d.id} className="compliance-doc-block">
                <div className="compliance-doc-block__row">
                  <div className="compliance-doc-block__main">
                    <div className="compliance-doc-block__name">{d.fileName}</div>
                    <div className="text-3 compliance-doc-block__meta">{d.docType} · uploaded {d.uploadedAt}</div>
                    {d.reviewComment ? <div className="text-3 compliance-doc-block__note">Note: {d.reviewComment}</div> : null}
                  </div>
                  <span className={`tag compliance-doc-block__status ${d.status === 'approved' ? '' : d.status === 'rejected' ? 'neg' : d.status === 'more_info' ? 'warn' : ''}`}>{d.status.replace(/_/g, ' ')}</span>
                </div>
                {d.status === 'pending' ? (
                  <div className="compliance-doc-actions" role="group" aria-label={`Actions for ${d.fileName}`}>
                    <button type="button" className="btn primary compliance-doc-actions__approve" onClick={() => applyAction(d.id, 'approved', '')}>Approve</button>
                    <button type="button" className="btn compliance-doc-actions__secondary" onClick={() => openModal(d.id, 'more')}>Request details</button>
                    <button type="button" className="btn ghost compliance-doc-actions__reject" onClick={() => openModal(d.id, 'reject')}>Reject</button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {modal ? (
        <div className="modal-backdrop" role="presentation" onClick={() => { setModal(null); setNote(''); }}>
          <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2 className="modal-title serif">
                {modal.mode === 'reject' ? 'Reject file' : modal.mode === 'refresh' ? 'Request updated documents' : 'Request more detail'}
              </h2>
              <button type="button" className="btn ghost icon modal-close" onClick={() => { setModal(null); setNote(''); }} aria-label="Close">
                <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
              </button>
            </div>
            <div className="modal-body">
              <label className="modal-label" htmlFor="compliance-note">
                {modal.mode === 'refresh' ? 'Instructions for the RM / client (audit trail)' : 'Comment to client / RM'}
              </label>
              <textarea
                id="compliance-note"
                className="modal-input modal-textarea"
                rows={4}
                placeholder="Required for audit trail…"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <div className="modal-actions row gap-10 mt-16" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn ghost" onClick={() => { setModal(null); setNote(''); }}>Cancel</button>
                <button type="button" className="btn primary" onClick={submitModal} disabled={!note.trim()}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const HH_TABS = ['summary', 'holdings', 'diversification', 'accounts', 'cashflow'];

/** WM-only: surface tabs Pulse / Portfolio / Alts; deep tabs render in drawers. */
const WM_LEGACY_DRAWER_TABS = new Set(['insights', 'goals', 'messages', 'events', 'documents', 'status', 'refresh']);

const WORKSPACE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'portfolio', label: 'Aggregated portfolio' },
  { id: 'insights', label: 'Insights' },
  { id: 'events', label: 'Upcoming events' },
  { id: 'documents', label: 'Documents' },
  { id: 'status', label: 'Overall status' },
  { id: 'alts', label: 'Alternatives' },
  { id: 'structured', label: 'Structured products' },
  { id: 'goals', label: 'Goals & outcomes' },
  { id: 'messages', label: 'Communication' },
  { id: 'refresh', label: 'Refresh data' },
];

/** Legacy subset (sidebar modules that omitted alts / structured). Exported for tooling. */
const WORKSPACE_PORTFOLIO_TABS = WORKSPACE_TABS.filter(t => t.id !== 'alts' && t.id !== 'structured');

/** Wealth manager workspace strip — surface tabs plus deep routes via drawer/query. */
const WM_CLIENT_WORKSPACE_STRIP = [
  { id: 'pulse', label: 'Pulse' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'alts', label: 'Alts & structured' },
  { id: 'structured', label: 'Structured products' },
];

/** WM + custom household awaiting first ingest — surface tab strip aligned with member workspace shell. */
const WM_PENDING_INTAKE_TAB_ORDER = ['portfolio', 'insights', 'events', 'documents', 'status', 'alts', 'structured', 'refresh'];

/** Legacy multi-tab strip (exports / tooling); replaced at runtime by WM_CLIENT_WORKSPACE_STRIP when role wm. */

/** Workspace strip under Portfolio for members: sidebar carries Events & Refresh; strip stays lean. */
const CLIENT_LEAN_PORTFOLIO_STRIP_TABS = [];

/** Client workspace page title (member view). No eyebrow on core tabs — only H1; household name stays on home. */
const CLIENT_WORKSPACE_H1 = {
  overview: 'Overview',
  portfolio: 'Portfolio',
  insights: 'Insights',
  events: 'Upcoming events',
  documents: 'Documents',
  status: 'Overall status',
  goals: 'Goals & outcomes',
  messages: 'Communication',
  alts: 'Alternative investments',
  structured: 'Structured products',
  refresh: 'Refresh data',
};

function getWorkspaceCopy() {
  return (window.Slate.Copy && window.Slate.Copy.workspace) || {};
}

function workspaceTabLabel(tabId) {
  const m = getWorkspaceCopy().tabLabels || {};
  if (m[tabId]) return m[tabId];
  const t = WORKSPACE_TABS.find(x => x.id === tabId);
  return t ? t.label : tabId;
}

function workspaceMemberTitle(tabId) {
  const m = getWorkspaceCopy().pageTitleMember || {};
  if (m[tabId]) return m[tabId];
  return CLIENT_WORKSPACE_H1[tabId] || 'Portfolio';
}

/** @param {string} pendingKey */
function workspacePendingShowImport(pendingKey) {
  const b = (getWorkspaceCopy().pending || {})[pendingKey];
  if (!b || !Object.prototype.hasOwnProperty.call(b, 'showImport')) return true;
  return b.showImport;
}

/** @param {string} pendingKey */
function workspacePendingLine(pendingKey, field) {
  const b = (getWorkspaceCopy().pending || {})[pendingKey];
  return b && b[field] != null ? b[field] : '';
}
function clientScopedNavigate(clientId, path) {
  if (path.startsWith('household/')) {
    slateGo(`clients/${clientId}/holding/${path.slice(10)}`);
    return;
  }
  if (path.startsWith('household')) {
    const raw = path.split('?')[1] || 'summary';
    const sub = HH_TABS.includes(raw) ? raw : 'summary';
    slateGo(sub === 'summary' ? `clients/${clientId}/portfolio` : `clients/${clientId}/portfolio?sub=${sub}`);
    return;
  }
  if (path.startsWith('insights/')) {
    slateGo(`clients/${clientId}/insights/${path.slice(9)}`);
    return;
  }
  if (path === 'insights') {
    slateGo(`clients/${clientId}/insights`);
    return;
  }
  if (path === 'alts') {
    slateGo(`clients/${clientId}/alts`);
    return;
  }
  if (path === 'structured') {
    slateGo(`clients/${clientId}/structured`);
    return;
  }
  if (path.startsWith('clients/')) {
    slateGo(path);
    return;
  }
  slateGo(path);
}

function fmtShort(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getMergedClientBook() {
  const Store = window.Slate.ClientStore;
  const custom = Store ? Store.list() : [];
  return [...custom, ...slateClientBook];
}

function resolveBookRow(clientId) {
  const Store = window.Slate.ClientStore;
  if (Store) {
    const c = Store.get(clientId);
    if (c) return c;
  }
  return slateClientBook.find(x => x.id === clientId) || null;
}

/** Start global intake (upload → parse → review) attributed to a WM-created household. */
function startClientPortfolioIntake(clientId, displayName) {
  try {
    sessionStorage.setItem('slate-intake-client-id', clientId);
    if (displayName) sessionStorage.setItem('slate-intake-client-name', displayName);
    sessionStorage.removeItem('slate-post-review-hash');
  } catch (e) { /* ignore */ }
  slateGo('upload');
}

function clientAum(row) {
  if (row.isCustom) {
    if (!row.portfolioIngested) return 0;
    if (row.displayAum != null) return row.displayAum;
    return POSITIONS.reduce((a, p) => a + p.mv, 0);
  }
  if (row.demoFull) return POSITIONS.reduce((a, p) => a + p.mv, 0);
  return row.aum || 0;
}

/** Stable 0–1 from string for illustrative directory splits. */
function wmDirRowSeed(id) {
  let h = 0;
  const s = String(id || '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

/**
 * Advisory / non-advisory / fee columns for WM client directory (illustrative splits from total AUM).
 * @returns {{ pending?: true } | { pending: false, advAum: number, nonAum: number, advYtd: number, nonYtd: number|null, advDrift: string, nonDrift: string|null, advFee: string, nonFee: string|null }}
 */
function deriveWmClientDirectoryEconomics(row) {
  const total = clientAum(row);
  const isPending = row.isCustom && !row.portfolioIngested;
  if (isPending) return { pending: true };
  const seed = wmDirRowSeed(row.id);
  const advShare = 0.62 + (seed % 23) / 100;
  const advAum = Math.round(total * advShare);
  const nonAum = Math.max(0, total - advAum);
  const ytd = typeof row.ytdPct === 'number' ? row.ytdPct : 0;
  const advYtd = ytd + (seed % 7) / 10000 - 0.0025;
  const nonYtd = nonAum <= 0 ? null : Math.max(-0.99, ytd - (seed % 6) / 10000 - 0.001);
  const advDrift = row.driftLabel || '—';
  const nonDrift = nonAum <= 0 ? null : row.driftTone === 'warn' ? 'On target' : 'Aligned';
  const baseFeeFixed = 25000 + (seed % 55) * 2500;
  const advBps = 14 + (seed % 80) / 10;
  const advFee = `${fmt.money(baseFeeFixed, { compact: true })}; ${advBps.toFixed(2)}% p.a.`;
  const nonFee = nonAum <= 0 ? null : `${fmt.money(Math.round(baseFeeFixed * 0.22), { compact: true })}; 0.10% p.a.`;
  return {
    pending: false,
    advAum,
    nonAum,
    advYtd,
    nonYtd,
    advDrift,
    nonDrift,
    advFee,
    nonFee,
  };
}

function wmClientDirectoryReviewChip(row, isPendingCustom, Ct) {
  if (isPendingCustom) {
    return { text: Ct.pendingReview || 'Pending docs', cls: 'tag wm-review-chip wm-review-chip--pending-docs' };
  }
  if (row.reviewInDays == null) {
    return { text: '—', cls: 'tag wm-review-chip wm-review-chip--neutral' };
  }
  if (row.reviewInDays < 0) {
    const o = Ct.overdue || 'Overdue';
    return { text: o.toUpperCase(), cls: 'tag wm-review-chip wm-review-chip--overdue' };
  }
  const d = row.reviewInDays;
  let cls = 'tag wm-review-chip wm-review-chip--calm';
  if (d <= 14) cls = 'tag wm-review-chip wm-review-chip--soon';
  else if (d <= 45) cls = 'tag wm-review-chip wm-review-chip--okwindow';
  return { text: `${d}D`, cls };
}

const DOC_TYPE_OPTS = [
  { value: 'kyc', label: 'KYC' },
  { value: 'kyb', label: 'KYB' },
  { value: 'statement', label: 'Statement' },
];

const ADD_CLIENT_TYPES = ['HNW', 'UHNW', 'FO', 'Family office'];
const ADD_CLIENT_CUSTODIANS = ['Schwab', 'Fidelity', 'Pershing', 'JPM Private', 'BNY', 'Morgan Stanley'];

/** After parse review, land here (demo: full Marchetti workspace). */
const SLATE_POST_REVIEW_HASH_KEY = 'slate-post-review-hash';
const SLATE_INTAKE_CLIENT_NAME_KEY = 'slate-intake-client-name';
const SLATE_DEMO_AFTER_INTAKE_HASH = 'clients/marchetti/pulse';

function clearSlateIntakeLandingPrefs() {
  try {
    sessionStorage.removeItem(SLATE_POST_REVIEW_HASH_KEY);
    sessionStorage.removeItem(SLATE_INTAKE_CLIENT_NAME_KEY);
  } catch (e) { /* ignore */ }
}

function uid() {
  return 'd' + Math.random().toString(36).slice(2, 11);
}

const ADD_CLIENT_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @returns {string|null} Error message or null if valid. */
function validateAddClientFields({ firstName, lastName, email, relationshipSince, custodian }) {
  if (!firstName.trim()) return 'First name is required.';
  if (!lastName.trim()) return 'Last name is required.';
  const em = email.trim();
  if (!em) return 'Email is required.';
  if (!ADD_CLIENT_EMAIL_RE.test(em)) return 'Enter a valid email address.';
  if (!relationshipSince.trim()) return 'Relationship since is required.';
  if (!custodian.trim()) return 'Primary custodian is required.';
  return null;
}

/** WM-created client saved locally; open their workspace to import statements. */
function AddClientModal({ open, onClose, onComplete }) {
  const fileInputRef = React.useRef(null);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [clientType, setClientType] = React.useState('HNW');
  const [relationshipSince, setRelationshipSince] = React.useState(String(new Date().getFullYear()));
  const [email, setEmail] = React.useState('');
  const [custodian, setCustodian] = React.useState('');
  const [estAum, setEstAum] = React.useState('');
  const [notes, setNotes] = React.useState('');
  /** @type {[{ id: string, fileName: string, docType: string }]} */
  const [docs, setDocs] = React.useState([]);
  const [formError, setFormError] = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    setFirstName('');
    setLastName('');
    setClientType('HNW');
    setRelationshipSince(String(new Date().getFullYear()));
    setEmail('');
    setCustodian('');
    setEstAum('');
    setNotes('');
    setDocs([]);
    setFormError(null);
  }, [open]);

  if (!open) return null;

  const addFiles = (fileList, defaultType = 'statement') => {
    const next = Array.from(fileList || []).map(f => ({ id: uid(), fileName: f.name, docType: defaultType }));
    if (next.length) setDocs(d => [...d, ...next]);
  };

  const removeDoc = id => setDocs(d => d.filter(x => x.id !== id));

  const setDocType = (id, docType) => setDocs(d => d.map(x => (x.id === id ? { ...x, docType } : x)));

  const handleCreate = () => {
    const err = validateAddClientFields({ firstName, lastName, email, relationshipSince, custodian });
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      clientType,
      relationshipSince: relationshipSince.trim(),
      email: email.trim(),
      custodian: custodian.trim(),
      estAum: estAum.trim(),
      notes: notes.trim(),
      docs,
    };
    const Store = window.Slate.ClientStore;
    const rec = Store ? Store.addClient(payload) : null;
    onComplete && onComplete(rec || payload);
    onClose();
    if (rec) slateGo(`clients/${rec.id}/portfolio`);
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-client-title" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 id="add-client-title" className="modal-title serif">Add new client</h2>
            <p className="modal-sub text-2">Fields marked <span style={{ color: 'var(--neg)' }}>*</span> are required. Then import statements from the workspace to build the portfolio and insights.</p>
          </div>
          <button type="button" className="btn ghost icon modal-close" onClick={onClose} aria-label="Close">
            <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-grid-2">
            <div>
              <label className="modal-label" htmlFor="add-client-first">First name <span className="text-3" style={{ color: 'var(--neg)' }} aria-hidden="true">*</span></label>
              <input id="add-client-first" className="modal-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Marco" required autoComplete="given-name"/>
            </div>
            <div>
              <label className="modal-label" htmlFor="add-client-last">Last name <span className="text-3" style={{ color: 'var(--neg)' }} aria-hidden="true">*</span></label>
              <input id="add-client-last" className="modal-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Marchetti" required autoComplete="family-name"/>
            </div>
            <div>
              <label className="modal-label" htmlFor="add-client-type">Client type</label>
              <select id="add-client-type" className="modal-input" value={clientType} onChange={e => setClientType(e.target.value)}>
                {ADD_CLIENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label" htmlFor="add-client-since">Relationship since <span className="text-3" style={{ color: 'var(--neg)' }} aria-hidden="true">*</span></label>
              <input id="add-client-since" className="modal-input" value={relationshipSince} onChange={e => setRelationshipSince(e.target.value)} placeholder="2026" required/>
            </div>
          </div>
          <div className="mt-12">
            <label className="modal-label" htmlFor="add-client-email">Email <span className="text-3" style={{ color: 'var(--neg)' }} aria-hidden="true">*</span></label>
            <input id="add-client-email" type="email" className="modal-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="marco@example.com" required autoComplete="email"/>
          </div>
          <div className="modal-grid-2 mt-12">
            <div>
              <label className="modal-label" htmlFor="add-client-custodian">Primary custodian <span className="text-3" style={{ color: 'var(--neg)' }} aria-hidden="true">*</span></label>
              <select id="add-client-custodian" className="modal-input" value={custodian} onChange={e => setCustodian(e.target.value)} required>
                <option value="">Select custodian…</option>
                {ADD_CLIENT_CUSTODIANS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="modal-label">Estimated AUM</label>
              <input className="modal-input" value={estAum} onChange={e => setEstAum(e.target.value)} placeholder="$50M"/>
            </div>
          </div>
          <div className="mt-12">
            <label className="modal-label">Notes</label>
            <textarea className="modal-input modal-textarea" value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Investment objectives, risk profile, key concerns…"/>
          </div>

          <div className="mt-20">
            <div className="label" style={{ marginBottom: 8 }}>Upload documents (optional)</div>
            <p className="text-3" style={{ fontSize: 12, marginBottom: 12 }}>You can add more later from the client&apos;s <strong>Documents</strong> or <strong>Refresh data</strong> tabs.</p>
            <div
              className={`modal-dropzone ${docs.length ? 'has-files' : ''}`}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files, 'statement'); }}
            >
              <span dangerouslySetInnerHTML={{ __html: Icons.upload }} style={{ color: 'var(--accent)' }} />
              <div className="serif" style={{ fontSize: 16, fontWeight: 600 }}>Drop PDF statements, IPS, or KYC / KYB here</div>
              <div className="text-3" style={{ fontSize: 12 }}>
                or <button type="button" className="modal-link" onClick={() => fileInputRef.current && fileInputRef.current.click()}>browse</button>
                · set type per file below
              </div>
              <div className="text-3 mt-8" style={{ fontSize: 11 }}>Schwab · Fidelity · Pershing · JPM · BNY · Morgan Stanley</div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,application/pdf" className="modal-file-input" onChange={e => { addFiles(e.target.files, 'statement'); e.target.value = ''; }}/>
            </div>

            {docs.length > 0 && (
              <div className="modal-doc-list stack stack-2 mt-12">
                {docs.map(d => (
                  <div key={d.id} className="modal-doc-row row gap-10" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    <select className="modal-input modal-input-sm" value={d.docType} onChange={e => setDocType(d.id, e.target.value)} aria-label="Document type">
                      {DOC_TYPE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <span className="mono text-3" style={{ fontSize: 12, flex: 1, minWidth: 120 }}>{d.fileName}</span>
                    <button type="button" className="btn ghost sm" onClick={() => removeDoc(d.id)}>Remove</button>
                  </div>
                ))}
              </div>
            )}

            <div className="row gap-10 mt-12" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" className="btn ghost sm" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                + Add more PDFs
              </button>
              <span className="text-3" style={{ fontSize: 11 }}>Each file gets a type column — use multiple statements for each custodian PDF.</span>
            </div>
          </div>

          {formError && (
            <div className="card" role="alert" style={{ padding: 12, marginTop: 16, borderColor: 'var(--neg)', background: 'var(--neg-soft)', fontSize: 13 }}>
              {formError}
            </div>
          )}
        </div>

        <div className="modal-actions row gap-10" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn primary" onClick={handleCreate}>
            Create client <span dangerouslySetInnerHTML={{ __html: Icons.arrow }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ navigate }) {
  const [addClientOpen, setAddClientOpen] = React.useState(false);
  const [customN, setCustomN] = React.useState(() => (window.Slate.ClientStore ? window.Slate.ClientStore.list().length : 0));
  const [wmRange, setWmRange] = React.useState('1Y');
  const [dashReady, setDashReady] = React.useState(false);

  React.useEffect(() => {
    const t = window.setTimeout(() => setDashReady(true), 420);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const Store = window.Slate.ClientStore;
    if (!Store) return undefined;
    const on = () => { setCustomN(Store.list().length); };
    window.addEventListener(Store.EVENT_CHANGED, on);
    return () => window.removeEventListener(Store.EVENT_CHANGED, on);
  }, []);

  const totalHouseholds = BOOK_SUMMARY.activeClients + customN;
  const merged = getMergedClientBook();
  const wmM = wmHeadlineMetrics(wmRange, totalHouseholds, BOOK_SUMMARY.totalAum);
  const wmBookPolicy = buildWmBookVsPolicySeries(BOOK_SUMMARY.totalAum, wmRange);
  const wmFeePaceBars = buildWmFeePaceMonthlyYtd(BOOK_SUMMARY.revenueYtd);
  const wmSparkNnm = buildWmSparkNnmSeries(wmRange, wmM.netNewMoney);
  const wmSparkBenchBps = buildWmSparkBenchBpsSeries(wmRange, wmM.bookVsBenchBps);
  const aumTrend = wmM.aumPts;
  const flowBars = buildNetFlowBarsForRange(wmRange, BOOK_SUMMARY.totalAum, wmM.netNewMoney);
  const donutSeg = segmentCountsForDonut(merged);
  const barTop = topHouseholdBars(merged);
  const wmPulse = deriveBookWmPulseMetrics(merged);

  const greetingHour = new Date().getHours();
  const greet = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';
  const rangeLabel = WM_RANGE_LABELS[wmRange] || wmRange;
  const aumDeltaPct = wmM.aumDelta;

  const rangeAside = (
    <div className="row gap-12 wm-range-row wm-dash-range-tools" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <span className="label wm-dash-range-label">Window</span>
      <div className="seg wm-range-seg wm-dash-range-seg" role="group" aria-label="Time range">
        {['7D', '30D', '90D', '1Y', 'ALL'].map(k => (
          <button key={k} type="button" className={wmRange === k ? 'active' : ''} onClick={() => setWmRange(k)}>{WM_RANGE_LABELS[k] || k}</button>
        ))}
      </div>
    </div>
  );

  const DC = (window.Slate.Copy && window.Slate.Copy.dashboard) || {};
  const dh = DC.hero || {};
  const dp = DC.pulse || {};
  const dNS = DC.northStar || {};
  const dcad = DC.cadence || {};
  const dg = DC.growthGoals || {};
  const dt = DC.trajectory || {};
  const dco = DC.concentration || {};
  const dmk = DC.markets || {};
  const dfoot = DC.footer || {};
  const dk = DC.kpiRail || {};
  const dm = DC.momentum || {};
  const drail = DC.rail || {};
  const pulseHi = deriveDashboardPulseHighlights(merged, wmPulse, BOOK_SUMMARY);
  const momentumBpsLine = resampleSeriesToLength(wmSparkBenchBps, flowBars.length);
  const segRail = deriveSegmentRailLines(merged, BOOK_SUMMARY.totalAum, donutSeg);
  const loadingAria = (DC.loadingAria) || 'Loading book overview…';
  const pageTitleGreet = typeof DC.pageTitleGreet === 'function' ? DC.pageTitleGreet('Christine', greet) : `${greet}, Christine`;

  if (!dashReady) {
    return (
      <div className="page wm-page wm-page--dashboard" aria-busy="true" aria-label={loadingAria}>
        <AddClientModal
          open={addClientOpen}
          onClose={() => setAddClientOpen(false)}
          onComplete={() => {}}
        />
        <WmDashSkeleton />
      </div>
    );
  }

  return (
    <div className="page wm-page wm-page--dashboard wm-dash-page--compact">
      <AddClientModal
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
        onComplete={() => {}}
      />

      <WmDashAlertStrip navigate={navigate} />

      <header className="page-header wm-dash-hero wm-dash-hero--primary">
        <div>
          <p className="wm-dash-section__eyebrow slate-section-label">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {dh.metaEyebrow || 'Book overview'}
          </p>
          <h1 className="serif">{pageTitleGreet}</h1>
          <p className="wm-dash-hero-lede slate-body-copy">
            {dh.lede || 'Triage what needs attention, scan trailing momentum for the window you pick, then open households for detail.'}
          </p>
        </div>
        <div className="row gap-10 wm-dash-hero-cta" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <button type="button" className="btn primary" onClick={() => setAddClientOpen(true)}>
            {dh.addClient || '+ Add client'}
          </button>
          <button type="button" className="btn ghost sm" onClick={() => navigate('clients')}>{dh.clients || 'Clients'}</button>
          <details className="wm-dash-hero-more">
            <summary className="btn ghost sm wm-dash-hero-more-summary">{dh.moreRoutes || 'More routes'}</summary>
            <div className="wm-dash-hero-more-panel">
              <button type="button" className="wm-dash-hero-more-btn" onClick={() => navigate('structured')}>{dh.structuredDesk || 'Structured desk'}</button>
              <button type="button" className="wm-dash-hero-more-btn" onClick={() => navigate('upload')}>{dh.statementIntake || 'Statement intake'}</button>
            </div>
          </details>
        </div>
      </header>

      <div className="wm-dash-pulse wm-dash-pulse--top" role="navigation" aria-label={dcad.pulseAria || 'Book operational pulse'}>
        <WmDashPulseChip
          label={dp.reviewsOverdue.label}
          value={String(wmPulse.reviewsOverdueCount)}
          badge={pulseHi.reviewsBadge || undefined}
          subline={pulseHi.reviewsSub || undefined}
          hint={wmPulse.reviewsOverdueCount ? (dp.reviewsOverdue.hintPrioritize || '') : (dp.reviewsOverdue.hintOk || '')}
          urgent={wmPulse.reviewsOverdueCount > 0}
          onNavigate={() => navigate('clients')}
        />
        <WmDashPulseChip
          label={dp.driftWatches.label}
          value={String(wmPulse.driftWatchCount)}
          badge={pulseHi.driftBadge || undefined}
          subline={pulseHi.driftSub || undefined}
          hint={wmPulse.driftWatchCount ? (dp.driftWatches.hintFlag || '') : (dp.driftWatches.hintOk || '')}
          urgent={wmPulse.driftWatchCount > 0}
          onNavigate={() => navigate('clients')}
        />
        <WmDashPulseChip
          label={dp.structuredRfqs.label}
          value={String(wmPulse.activeStructuredRfqs)}
          hint={dp.structuredRfqs.hintLive}
          onNavigate={() => navigate('structured')}
        />
        <WmDashPulseChip
          label={dp.households.label}
          value={String(totalHouseholds)}
          subline={pulseHi.hhSub}
          hint={dp.households.hint}
          onNavigate={() => navigate('clients')}
        />
      </div>

      <div className="wm-dash-page-body">
        <div className="wm-dash-primary-col">
          <div className="wm-dash-main-stack">
        <WmDashSection
          eyebrow={typeof dm.sectionEyebrow === 'function' ? dm.sectionEyebrow(rangeLabel) : `TRAILING · ${rangeLabel}`}
          title={dm.title || 'Momentum'}
          subtitle={typeof dm.subtitle === 'function' ? dm.subtitle(wmM.bench) : ''}
          aside={rangeAside}
          className="wm-dash-section--momentum-chart"
        >
          <div className="card wm-dash-chart-card wm-dash-momentum-combo-card" style={{ padding: 22 }}>
            {Charts && Charts.ComboBarsLine && flowBars.length === momentumBpsLine.length ? (
              <Charts.ComboBarsLine
                barData={flowBars}
                linePoints={momentumBpsLine}
                height={248}
                barColor="#5a7cae"
                lineColor="var(--pos)"
                barLabel={dm.legendFlows || 'Net flows'}
                lineLabel={typeof dm.legendValueAdd === 'function' ? dm.legendValueAdd(wmM.bench) : `Value-add vs ${wmM.bench}`}
              />
            ) : null}
          </div>
        </WmDashSection>

        <WmDashSection
            eyebrow={dg.sectionEyebrow || 'ANNUAL PLAN · YTD'}
            title={dg.title || 'Growth goals vs plan'}
            subtitle={dg.subtitle || ''}
          >
            <div className="wm-dash-rm-targets card wm-dash-card-flat" style={{ padding: '16px 18px' }}>
              <div className="row wm-dash-rm-targets-head" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <p className="mono text-3 slate-section-label" style={{ fontSize: 10, letterSpacing: '0.12em', margin: 0 }}>{dg.progressLabel || 'PROGRESS STRIP'}</p>
                <button type="button" className="btn ghost sm" onClick={() => navigate('clients')}>{dg.openDirectory || 'Open directory'}</button>
              </div>
              <div className="wm-dash-rm-targets-grid wm-dash-rm-targets-grid--two">
                <div className="wm-dash-rm-target-cell">
                  <GoalBar
                    label="Net new money vs annual goal"
                    pct={(100 * BOOK_RM_TARGETS.nnmYtd) / BOOK_RM_TARGETS.nnmAnnualGoal}
                    detail={`${fmt.money(BOOK_RM_TARGETS.nnmYtd, { compact: true })} / ${fmt.money(BOOK_RM_TARGETS.nnmAnnualGoal, { compact: true })}`}
                    tone="ok"
                  />
                </div>
                <div className="wm-dash-rm-target-cell">
                  <GoalBar
                    label="New funded households vs target"
                    pct={(100 * BOOK_RM_TARGETS.newFundedYtd) / BOOK_RM_TARGETS.newFundedAnnualTarget}
                    detail={`${BOOK_RM_TARGETS.newFundedYtd} / ${BOOK_RM_TARGETS.newFundedAnnualTarget}`}
                    tone="ok"
                  />
                </div>
              </div>
            </div>
          </WmDashSection>

          <WmDashSection
            eyebrow={typeof dt.sectionEyebrow === 'function' ? dt.sectionEyebrow(rangeLabel) : `SAME WINDOW · ${rangeLabel}`}
            title={dt.title || 'Book trajectory & economics pacing'}
            subtitle={dt.subtitle || ''}
          >
            <div className="wm-dash-chart-row grid-2-1 wm-dash-traj-glide-row" style={{ gap: 20 }}>
              <div className="card wm-dash-vs-policy-card wm-dash-chart-card wm-dash-chart-card--accent-border" style={{ padding: 22 }}>
                <div className="row wm-dash-chart-head" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <p className="serif wm-dash-chart-card-title" style={{ margin: 0 }}>{dt.glideTitle || 'Book vs policy glide'}</p>
                  <div className="row gap-14 wm-dash-legend-keys" style={{ alignItems: 'center', flexWrap: 'wrap', fontSize: 11 }}>
                    <span className="wm-dash-legend"><i className="wm-dash-leg-dot wm-dash-leg-dot--book" aria-hidden /> {dt.legendBook || 'Book'}</span>
                    <span className="wm-dash-legend"><i className="wm-dash-leg-dash wm-dash-leg-dash--policy" aria-hidden /> {dt.legendPolicy || 'IPS / policy blend'}</span>
                    <span className="text-3 mono" style={{ fontSize: 11 }}>{rangeLabel}</span>
                  </div>
                </div>
                {Charts && Charts.LineChart ? (
                  <Charts.LineChart
                    height={260}
                    series={[
                      { name: 'Book', color: 'var(--accent)', points: wmBookPolicy.bookPts },
                      { name: 'Policy', color: 'var(--ink-3)', points: wmBookPolicy.policyPts, dashed: true },
                    ]}
                  />
                ) : null}
              </div>
              <div className="card wm-dash-fee-pace-card" style={{ padding: 18 }}>
                <div className="row wm-dash-chart-head" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <p className="serif wm-dash-chart-card-title" style={{ margin: 0 }}>{dt.feeTitle || 'Economics pacing'}</p>
                  <span className="text-3 mono" style={{ fontSize: 10, textAlign: 'right' }}>
                    {fmt.pct(100 * BOOK_SUMMARY.revenueYtdVsLy, { dp: 1 })} YoY · {fmt.money(BOOK_SUMMARY.revenueYtd, { compact: true })} YTD
                  </span>
                </div>
                <p className="text-3 wm-dash-fee-disclaim slate-helper-copy" style={{ fontSize: 11, margin: '0 0 10px', lineHeight: 1.45 }}>
                  {dt.feeDisclaim || 'Monthly accrual — cash settlement may trail custodian credits.'}
                </p>
                {dt.feeCrossRef ? (
                  <p className="text-3 slate-helper-copy" style={{ fontSize: 11, margin: '0 0 10px', lineHeight: 1.45, opacity: 0.92 }}>
                    {dt.feeCrossRef}
                  </p>
                ) : null}
                {Charts && Charts.Bars ? <Charts.Bars data={wmFeePaceBars} height={168} color="var(--ink-2)" /> : null}
                <div className="row wm-dash-fee-months mono text-3" style={{ fontSize: 9, gap: 0, justifyContent: 'space-between', marginTop: 6 }}>
                  {wmFeePaceBars.map(b => <span key={b.label}>{b.label}</span>)}
                </div>
              </div>
            </div>
          </WmDashSection>

        <WmDashSection
          eyebrow={dco.sectionEyebrow || 'CONCENTRATION'}
          title={dco.title || 'Largest relationships'}
          subtitle={dco.subtitle || ''}
        >
          <div className="card wm-dash-chart-card" style={{ padding: 22 }}>
            <div className="wm-dash-chart-card-head row" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <p className="serif wm-dash-chart-card-title" style={{ margin: 0 }}>{dco.largestTitle || 'Largest relationships'}</p>
              <span className="text-3 mono" style={{ fontSize: 11 }}>{typeof dco.largestMeta === 'function' ? dco.largestMeta(Math.min(5, barTop.length)) : `top ${Math.min(5, barTop.length)} by AUM`}</span>
            </div>
            {Charts && Charts.Bars && barTop.length ? <Charts.Bars data={barTop} height={200} color="var(--ink-3)" /> : (
              <p className="text-3" style={{ fontSize: 13 }}>{dco.emptyLargest || 'Import statements to compare relationship size.'}</p>
            )}
          </div>
        </WmDashSection>

        <details className="wm-dash-markets-details card">
          <summary className="wm-dash-markets-details-summary">
            <span className="mono text-3 slate-section-label" style={{ fontSize: 10, letterSpacing: '0.12em' }}>{dmk.sectionEyebrow || 'CAPITAL MARKETS'}</span>
            <span className="serif wm-dash-markets-details-summary-title">{dmk.detailsSummary || dmk.title || 'Capital markets context'}</span>
          </summary>
          <p className="text-3 slate-helper-copy wm-dash-markets-details-lede" style={{ fontSize: 12, marginTop: 8, lineHeight: 1.55 }}>
            {dmk.detailsHint || dmk.subtitle || ''}
          </p>
          <p className="serif wm-dash-markets-details-chart-title" style={{ fontSize: 15, margin: '14px 0 10px' }}>{dmk.title || 'IPO, auction and issuance calendar'}</p>
          <div className="table-wrap wm-dash-markets-wrap">
            <table className="tbl wm-dash-markets-tbl">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ticker</th>
                  <th>Event</th>
                  <th>Type</th>
                  <th className="num">Size</th>
                  <th>{dmk.clientsCol || 'Clients'}</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_CALENDAR.map(m => {
                  const elig = wmMarketEligibleForRow(m);
                  const dUntil = wmDaysUntilCalendarDate(m.date);
                  const soon = dUntil != null && dUntil >= 0 && dUntil <= 3;
                  return (
                    <tr key={m.id} className={soon ? 'wm-dash-market-row--imminent' : undefined}>
                      <td className="mono text-3" style={{ fontSize: 12 }}>{fmtShort(m.date)}</td>
                      <td className="mono slate-table-emphasis" style={{ fontSize: 12 }}>{m.ticker}</td>
                      <td>{m.label}</td>
                      <td>
                        <span className={`tag wm-dash-market-kind wm-dash-market-kind--${({
                          IPO: 'ipo',
                          Auction: 'auction',
                          Issuance: 'issuance',
                        }[m.kind] || 'other')}`}>{m.kind || '—'}</span>
                      </td>
                      <td className="num">{fmt.money(m.value, { compact: true })}</td>
                      <td>
                        {elig.n == null ? (
                          <span className="text-3">{dmk.clientsDash || '—'}</span>
                        ) : (
                          <button type="button" className="wm-dash-market-eligible-btn" onClick={() => navigate('clients')}>
                            {typeof dmk.clientsEligible === 'function' ? dmk.clientsEligible(elig.n) : `${elig.n} eligible`}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
          </div>
        </div>

        <aside className="wm-dash-book-rail" aria-label={drail.ariaLabel || 'Book KPIs'}>
          <div className="wm-dash-rail-head">
            <p className="mono text-3 slate-section-label" style={{ fontSize: 10, letterSpacing: '0.14em', margin: 0 }}>{drail.title || 'Book KPIs'}</p>
          </div>
          <div className="card wm-dash-rail-kpis wm-dash-kpi-rail kpis wm-dash-headline-kpis">
            <div className="kpi wm-dash-kpi">
              <div className="wm-dash-kpi-body">
                <span className="label">{dk.totalAum || 'Total AUM'}</span>
                <span className="v lg slate-metric-value">{fmt.money(BOOK_SUMMARY.totalAum, { compact: true })}</span>
                <span className="text-3 wm-dash-kpi-caption" style={{ fontSize: 12, color: aumDeltaPct >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                  {aumDeltaPct >= 0 ? '▲' : '▼'} {fmt.pct(100 * Math.abs(aumDeltaPct), { dp: 2 })} {typeof dNS.aumCaption === 'function' ? dNS.aumCaption(rangeLabel) : `vs start of ${rangeLabel}`}
                </span>
              </div>
              {Charts && Charts.Spark ? (
                <div className="wm-dash-spark-slot" aria-hidden="true">
                  <Charts.Spark points={aumTrend} height={30} color="var(--accent)" fill />
                </div>
              ) : null}
            </div>
            <div className="kpi wm-dash-kpi">
              <div className="wm-dash-kpi-body">
                <span className="label">{dk.netNewAssets || 'Net new assets'}</span>
                <span className="v lg slate-metric-value">{fmt.money(wmM.netNewMoney, { compact: true })}</span>
                <span className="text-3 wm-dash-kpi-caption" style={{ fontSize: 12 }}>
                  {typeof dk.captionNnm === 'function' ? dk.captionNnm(rangeLabel) : `Funding and transfers net of outflows · ${rangeLabel}`}
                </span>
              </div>
              {Charts && Charts.Spark ? (
                <div className="wm-dash-spark-slot" aria-hidden="true">
                  <Charts.Spark points={wmSparkNnm} height={30} color="#5a7cae" fill />
                </div>
              ) : null}
            </div>
            <div className="kpi wm-dash-kpi">
              <div className="wm-dash-kpi-body">
                <GoalBar
                  label={drail.newFundedProgress || 'New funded (annual)'}
                  pct={(100 * BOOK_RM_TARGETS.newFundedYtd) / BOOK_RM_TARGETS.newFundedAnnualTarget}
                  detail={`${BOOK_RM_TARGETS.newFundedYtd} / ${BOOK_RM_TARGETS.newFundedAnnualTarget}`}
                  tone="ok"
                />
                <span className="text-3 wm-dash-kpi-caption" style={{ fontSize: 12, marginTop: 6 }}>
                  {wmM.newHh} first funded in {rangeLabel} (trailing)
                </span>
              </div>
            </div>
            <div className="kpi wm-dash-kpi">
              <div className="wm-dash-kpi-body">
                <span className="label">{typeof dk.bookVsBench === 'function' ? dk.bookVsBench(wmM.bench) : `Book vs ${wmM.bench}`}</span>
                <span className="v lg slate-metric-value" style={{ color: 'var(--pos)' }}>{fmt.bps(wmM.bookVsBenchBps)}</span>
                <span className="text-3 wm-dash-kpi-caption" style={{ fontSize: 12 }}>{dk.captionBps || 'Household-weighted excess return (bps)'}</span>
              </div>
              {Charts && Charts.Spark ? (
                <div className="wm-dash-spark-slot" aria-hidden="true">
                  <Charts.Spark points={wmSparkBenchBps} height={30} color="var(--pos)" fill />
                </div>
              ) : null}
            </div>
            <div className="kpi wm-dash-kpi wm-dash-rail-fee-mini">
              <div className="wm-dash-kpi-body">
                <span className="label">{drail.feeMini || 'Fee revenue (YTD)'}</span>
                <span className="v slate-metric-value">{fmt.money(BOOK_SUMMARY.revenueYtd, { compact: true })}</span>
                <span className="text-3 wm-dash-kpi-caption" style={{ fontSize: 12 }}>{fmt.pct(100 * BOOK_SUMMARY.revenueYtdVsLy, { dp: 1 })} YoY</span>
              </div>
            </div>
          </div>

          <div className="card wm-dash-rail-segments" style={{ padding: '16px 18px' }}>
            <p className="label" style={{ marginBottom: 10 }}>{drail.segmentTitle || 'Mix by segment'}</p>
            <p className="text-3 slate-helper-copy" style={{ fontSize: 11, margin: '0 0 12px', lineHeight: 1.45 }}>{drail.segmentHint || ''}</p>
            <ul className="wm-dash-rail-seg-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {segRail.map(s => (
                <li key={s.label} className="row gap-8" style={{ alignItems: 'baseline', fontSize: 12, marginBottom: 10 }}>
                  <span className="demo-donut-swatch" style={{ background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <span className="mono text-3" style={{ fontSize: 11 }}>{s.count} · {fmt.money(s.approxAum, { compact: true })}</span>
                </li>
              ))}
            </ul>
          </div>

          <DemoTourStrip navigate={navigate} variant="wm" className="wm-dash-demo-strip wm-dash-rail-commands" stripLabel={((window.Slate.Copy && window.Slate.Copy.navigation && window.Slate.Copy.navigation.stripLabel) || 'Command jumps')} />
        </aside>
      </div>

      <div className="wm-dash-footer-deferred section" style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--rule)' }}>
        <p className="text-3 wm-metric-rationale slate-body-copy" style={{ fontSize: 12, marginTop: 16, marginBottom: 16, maxWidth: 900, lineHeight: 1.65 }}>
          <span className="slate-inline-label">{dfoot.whyFourTitle || 'How this view stacks'}:</span>{' '}
          {typeof dfoot.whyFourBody === 'function' ? dfoot.whyFourBody(wmM.bench) : `AUM and advisory economics summarize the book; trailing growth splits new funded names from expansion on existing relationships; vs ${wmM.bench}, engagement coverage, and desk activity add context — use the pulse row and household files for execution.`}
        </p>
        <div className="card wm-dash-pipeline-strip" style={{ padding: '14px 18px' }}>
          <div className="wm-dash-pipeline-head row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
            <div>
              <div className="label" style={{ marginBottom: 2 }}>{dfoot.pipelineLabel || 'Pipeline funnel'}</div>
              <div className="text-3 slate-helper-copy" style={{ fontSize: 12 }}>{dfoot.pipelineSub || ''}</div>
            </div>
            <button type="button" className="btn sm ghost" onClick={() => navigate('clients')}>{dfoot.viewClients || 'View clients'}</button>
          </div>
          <div className="wm-dash-pipeline-stages row">
            {[
              { key: 'lead', label: 'Lead', n: BOOK_PIPELINE_COUNTS.lead },
              { key: 'prospect', label: 'Prospect', n: BOOK_PIPELINE_COUNTS.prospect },
              { key: 'onboarding', label: 'Onboarding', n: BOOK_PIPELINE_COUNTS.onboarding },
              { key: 'funded', label: 'Funded', n: BOOK_PIPELINE_COUNTS.funded },
            ].flatMap((s, i, arr) => {
              const maxN = Math.max(...arr.map(x => x.n));
              const pct = Math.max(22, Math.round((s.n / maxN) * 100));
              const cell = (
                <div key={s.key} className={`wm-dash-pipeline-cell wm-dash-pipeline-cell--${s.key}`}>
                  <div className="wm-dash-pipeline-bar-track">
                    <div className="wm-dash-pipeline-bar" style={{ height: `${pct}%` }} title={`${s.n} households`} />
                  </div>
                  <span className="wm-dash-pipeline-label">{s.label}</span>
                  <span className="wm-dash-pipeline-count mono">{s.n}</span>
                </div>
              );
              if (i === arr.length - 1) return [cell];
              const next = arr[i + 1];
              const conv = s.n > 0 ? Math.round((100 * next.n) / s.n) : null;
              return [
                cell,
                <div key={`${s.key}-sep`} className="wm-dash-pipeline-sep">
                  <span className="wm-dash-pipeline-conv mono text-3">{conv != null ? `${conv}% conv.` : '—'}</span>
                  <span className="wm-dash-pipeline-chevron mono text-3" aria-hidden="true">→</span>
                </div>,
              ];
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientListScreen({ navigate, hasBook }) {
  const Store = window.Slate.ClientStore;
  const Cc = (window.Slate.Copy && window.Slate.Copy.clients) || {};
  const Ct = Cc.table || {};
  const [addClientOpen, setAddClientOpen] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!Store) return undefined;
    const on = () => setTick(t => t + 1);
    window.addEventListener(Store.EVENT_CHANGED, on);
    return () => window.removeEventListener(Store.EVENT_CHANGED, on);
  }, [Store]);

  const mergedUnsorted = getMergedClientBook();
  const customCount = Store ? Store.list().length : 0;
  const dirHouseholds = BOOK_SUMMARY.activeClients + customCount;
  const merged = React.useMemo(() => {
    const rows = [...mergedUnsorted];
    rows.sort((a, b) => {
      const aOver = a.reviewInDays != null && a.reviewInDays < 0 ? 0 : 1;
      const bOver = b.reviewInDays != null && b.reviewInDays < 0 ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      const aOnboard = a.isCustom && !a.portfolioIngested ? 0 : 1;
      const bOnboard = b.isCustom && !b.portfolioIngested ? 0 : 1;
      if (aOnboard !== bOnboard) return aOnboard - bOnboard;
      const ra = a.reviewInDays != null ? a.reviewInDays : 9999;
      const rb = b.reviewInDays != null ? b.reviewInDays : 9999;
      return ra - rb;
    });
    return rows;
  }, [mergedUnsorted, tick]);

  const pendingIngestCount = React.useMemo(
    () => merged.filter(r => r.isCustom && !r.portfolioIngested).length,
    [merged],
  );

  const canBrowse = hasBook || customCount > 0;
  const wmRole = getDemoRole() === 'wm';

  return (
    <div className="page wm-page wm-page--clients">
      <AddClientModal
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
        onComplete={() => {}}
      />
      <header className="page-header wm-clients-hero">
        <div>
          <p className="wm-dash-section__eyebrow slate-section-label">{Cc.eyebrow || 'RELATIONSHIP DIRECTORY'}</p>
          <h1 className="serif">{Cc.title || 'Clients'}</h1>
          {wmRole ? (
            <React.Fragment>
              <p className="wm-clients-lede text-2 slate-body-copy" style={{ fontSize: 14, marginTop: 12, maxWidth: 720, lineHeight: 1.62 }}>
                {Cc.ledeWm || 'AUM, health, review cadence, and advisory economics across the households in Christine’s book.'}
              </p>
              <p className="text-3 wm-clients-metrics-line mono slate-helper-copy" style={{ fontSize: 11, marginTop: 10, letterSpacing: 0.02 }}>
                {typeof Cc.lede === 'function'
                  ? Cc.lede(dirHouseholds, fmt.money(BOOK_SUMMARY.totalAum, { compact: true }), BOOK_SUMMARY.uhnwCount, BOOK_SUMMARY.foCount, BOOK_SUMMARY.hnwCount)
                  : `${dirHouseholds} households · ${fmt.money(BOOK_SUMMARY.totalAum, { compact: true })} book AUM · ${BOOK_SUMMARY.uhnwCount} UHNW · ${BOOK_SUMMARY.foCount} FO · ${BOOK_SUMMARY.hnwCount} HNW`}
              </p>
            </React.Fragment>
          ) : (
            <p className="wm-clients-lede text-3 slate-body-copy" style={{ fontSize: 13, marginTop: 10, maxWidth: 640, lineHeight: 1.65 }}>
              {typeof Cc.lede === 'function'
                ? Cc.lede(dirHouseholds, fmt.money(BOOK_SUMMARY.totalAum, { compact: true }), BOOK_SUMMARY.uhnwCount, BOOK_SUMMARY.foCount, BOOK_SUMMARY.hnwCount)
                : <>
                    {dirHouseholds} households · {fmt.money(BOOK_SUMMARY.totalAum, { compact: true })} book AUM · {BOOK_SUMMARY.uhnwCount} UHNW · {BOOK_SUMMARY.foCount} FO · {BOOK_SUMMARY.hnwCount} HNW
                  </>}
            </p>
          )}
          {wmRole && pendingIngestCount > 0 ? (
            <p className="wm-clients-intake-hint text-3 slate-body-copy" style={{ fontSize: 12, marginTop: 12, maxWidth: 720, lineHeight: 1.55 }}>
              {Cc.intakeHint ||
                'New households need custodian statements before metrics populate — use Upload statements from the list or open their workspace.'}
            </p>
          ) : null}
        </div>
        <div className="row gap-10" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn ghost" onClick={() => navigate('dashboard')}>{Cc.bookDashboard || 'Book dashboard'}</button>
          <button type="button" className="btn primary" onClick={() => setAddClientOpen(true)}>{Cc.addClient || '+ Add client'}</button>
        </div>
      </header>
      {wmRole ? <WmDashAlertStrip navigate={navigate} /> : null}
      {!canBrowse ? (
        <p className="text-2">{Cc.empty || 'Add a client to list them here alongside the sample book.'}</p>
      ) : (
        <div className="card wm-clients-tbl-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="wm-clients-tbl-scroll">
            <table className="tbl wm-clients-tbl wm-clients-tbl--book">
              <thead>
                <tr className="wm-clients-tbl-group-row">
                  <th rowSpan={2} className="wm-clients-th-household">{Ct.household || 'Client / household'}</th>
                  <th colSpan={4} className="wm-clients-th-group wm-clients-th-group--adv">{Ct.groupAdvisory || 'Advisory'}</th>
                  <th colSpan={3} className="wm-clients-th-group wm-clients-th-group--nadv">{Ct.groupNonAdvisory || 'Non-advisory'}</th>
                  <th rowSpan={2} className="num wm-clients-th-total">{Ct.totalAum || 'Total AUM'}</th>
                  <th rowSpan={2} className="wm-clients-th-review">{Ct.review || 'Review'}</th>
                </tr>
                <tr className="wm-clients-tbl-subhead">
                  <th className="num">{Ct.aum || 'AUM'}</th>
                  <th className="num">{Ct.ytd || 'YTD'}</th>
                  <th>{Ct.drift || 'Drift'}</th>
                  <th className="wm-clients-th-fee">{Ct.fee || 'Fee'}</th>
                  <th className="num">{Ct.aum || 'AUM'}</th>
                  <th className="num">{Ct.ytd || 'YTD'}</th>
                  <th className="wm-clients-th-fee">{Ct.fee || 'Fee'}</th>
                </tr>
              </thead>
              <tbody key={'book-' + tick}>
                {merged.map(row => {
                  const aumVal = clientAum(row);
                  const econ = deriveWmClientDirectoryEconomics(row);
                  const isPendingCustom = row.isCustom && !row.portfolioIngested;
                  const workspaceEntry = wmRole ? 'pulse' : 'portfolio';
                  const dash = Ct.dash || '—';
                  const openRow = () => {
                    if (!(row.isCustom || row.demoFull)) return;
                    navigate(`clients/${row.id}/${workspaceEntry}`);
                  };
                  const onUploadStatements = e => {
                    e.stopPropagation();
                    if (!row.isCustom) return;
                    startClientPortfolioIntake(row.id, row.name);
                  };
                  const reviewChip = wmClientDirectoryReviewChip(row, isPendingCustom, Ct);
                  const segClass =
                    row.familyType === 'UHNW' ? ' wm-seg-uhnw' : row.familyType === 'FO' ? ' wm-seg-fo' : row.familyType === 'HNW' ? ' wm-seg-hnw' : '';
                  const rowClass = [
                    row.reviewTone === 'urgent' && !isPendingCustom ? 'tbl-row--danger wm-clients-row--overdue' : '',
                    isPendingCustom ? 'wm-clients-row--onboarding' : '',
                    'wm-clients-row tbl-row-interactive',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  const advYtdStr = !econ.pending ? fmt.pct(100 * econ.advYtd, { dp: 1 }) : dash;
                  const advYtdPos = !econ.pending && econ.advYtd >= 0;
                  const nonEmpty = !econ.pending && econ.nonAum > 0;
                  const nonYtdStr = nonEmpty && econ.nonYtd != null ? fmt.pct(100 * econ.nonYtd, { dp: 1 }) : dash;
                  const nonYtdPos = nonEmpty && econ.nonYtd != null && econ.nonYtd >= 0;
                  return (
                    <tr
                      key={row.id}
                      onClick={openRow}
                      className={rowClass.trim()}
                      style={{ cursor: (row.isCustom || row.demoFull) ? 'pointer' : 'default', opacity: (row.isCustom || row.demoFull) ? 1 : 0.62 }}
                    >
                      <td className="wm-clients-td-household">
                        <div className="slate-client-name wm-clients-name">{row.name}</div>
                        <div className="text-3 wm-clients-custodian slate-helper-copy" style={{ fontSize: 11 }}>
                          {isPendingCustom ? (
                            <React.Fragment>
                              <span className="wm-clients-custodian-primary">{row.custodian || row.custodians || dash}</span>
                              <span className="wm-clients-onboarding-line"> · {Ct.awaitingImport || 'Awaiting statement import'}</span>
                            </React.Fragment>
                          ) : (
                            row.custodians
                          )}
                        </div>
                        <div className="wm-clients-seg-row row gap-6" style={{ flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
                          <span className={`tag${segClass}`}>{row.familyType}</span>
                          {isPendingCustom ? <span className="tag wm-tag-new">{Ct.newBadge || 'NEW'}</span> : null}
                          {(row.isCustom || row.demoFull) && !isPendingCustom ? (
                            <button type="button" className="btn linkish wm-clients-open-inline" onClick={e => { e.stopPropagation(); openRow(); }}>
                              {Ct.open || 'Open'}
                            </button>
                          ) : null}
                        </div>
                      </td>
                      {isPendingCustom ? (
                        <td colSpan={4} className="wm-clients-td-adv-rail">
                          <div
                            className="wm-clients-adv-rail"
                            role="group"
                            aria-label={Ct.uploadStatementsRail || 'Upload financial statements'}
                            onClick={e => e.stopPropagation()}
                          >
                            <p className="wm-clients-rail-title">{Ct.uploadStatementsRail || 'Upload financial statements'}</p>
                            <p className="text-3 wm-clients-rail-sub">{Ct.uploadStatementsSub || ''}</p>
                            <button type="button" className="btn sm primary wm-clients-upload-btn" onClick={onUploadStatements}>
                              <span dangerouslySetInnerHTML={{ __html: Icons.upload }} />
                              {Ct.uploadStatements || 'Upload statements'}
                            </button>
                          </div>
                        </td>
                      ) : (
                        <React.Fragment>
                          <td className="num mono wm-clients-td-num">{fmt.money(econ.advAum, { compact: true })}</td>
                          <td className={`num mono wm-clients-td-num wm-clients-ytd${advYtdPos ? ' wm-clients-ytd-pos' : ' wm-clients-ytd-neg'}`}>{advYtdStr}</td>
                          <td className="text-3 wm-clients-drift wm-clients-td-drift">{econ.advDrift}</td>
                          <td className="text-3 mono wm-clients-td-fee">{econ.advFee}</td>
                        </React.Fragment>
                      )}
                      {isPendingCustom ? (
                        <React.Fragment>
                          <td className="num mono wm-clients-td-num">{dash}</td>
                          <td className="num mono wm-clients-td-num">{dash}</td>
                          <td className="text-3 mono wm-clients-td-fee">{dash}</td>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <td className="num mono wm-clients-td-num">{nonEmpty ? fmt.money(econ.nonAum, { compact: true }) : dash}</td>
                          <td className={`num mono wm-clients-td-num wm-clients-ytd${nonEmpty ? (nonYtdPos ? ' wm-clients-ytd-pos' : ' wm-clients-ytd-neg') : ''}`}>{nonYtdStr}</td>
                          <td className="text-3 mono wm-clients-td-fee">{nonEmpty && econ.nonFee ? econ.nonFee : dash}</td>
                        </React.Fragment>
                      )}
                      <td className="num mono wm-clients-td-num wm-clients-td-total">{isPendingCustom ? dash : fmt.money(aumVal, { compact: true })}</td>
                      <td className="wm-clients-td-review"><span className={reviewChip.cls}>{reviewChip.text}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-3 mt-16 slate-helper-copy wm-clients-fn" style={{ fontSize: 12 }}>{Cc.footnote || ''}</p>
    </div>
  );
}

const WM_CLIENT_MSG_KEY = 'slate-wm-client-thread';

function readWmMsgExtras(clientId) {
  try {
    const raw = localStorage.getItem(`${WM_CLIENT_MSG_KEY}:${clientId}`);
    if (!raw) return [];
    const j = JSON.parse(raw);
    return Array.isArray(j) ? j : [];
  } catch (e) {
    return [];
  }
}

function writeWmMsgExtras(clientId, rows) {
  try {
    localStorage.setItem(`${WM_CLIENT_MSG_KEY}:${clientId}`, JSON.stringify(rows));
  } catch (e) { /* ignore */ }
}

/** WM book-level alternatives routing — links into household desks vs a hard-coded path. */
function AltsBookGlobalScreen({ navigate }) {
  const merged = getMergedClientBook();
  const ranked = [...merged].filter(r => r.demoFull || r.isCustom).sort((a, b) => clientAum(b) - clientAum(a));
  const primary = ranked[0];
  return (
    <div className="page wm-page wm-page--alts-global">
      <header className="page-header">
        <div>
          <p className="wm-dash-section__eyebrow slate-section-label">PROGRAMS · ALTERNATIVES</p>
          <h1 className="serif">Alternatives across the book</h1>
          <p className="text-2 slate-body-copy" style={{ fontSize: 13, marginTop: 10, maxWidth: 580 }}>
            Demo placeholder for a book-wide alts pipeline. In production this would roll up commitments, unfunded, and sponsor coverage.
            Use the relationship directory for households without a modeled sleeve.
          </p>
        </div>
        <div className="row gap-10" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn ghost" onClick={() => navigate('clients')}>Client directory</button>
          <button type="button" className="btn ghost" onClick={() => navigate('structured')}>Structured desk</button>
        </div>
      </header>
      <div className="card wm-dash-card-flat" style={{ padding: 20, maxWidth: 640 }}>
        <p className="label">Jump to a household desk</p>
        <p className="text-2" style={{ fontSize: 13, marginTop: 10 }}>
          {primary
            ? `Largest modeled relationship: ${primary.name} — open the alts & structured workspace for pacing and tickets.`
            : 'Add or import a household to open an alternatives workspace.'}
        </p>
        <div className="row gap-10 mt-16" style={{ flexWrap: 'wrap' }}>
          {primary ? (
            <button type="button" className="btn primary" onClick={() => navigate(`clients/${primary.id}/alts`)}>
              Open {shortHouseholdLabel(primary.name)} — alts
            </button>
          ) : null}
          <button type="button" className="btn ghost sm" onClick={() => navigate('clients/marchetti/alts')}>
            Open demo household (Marchetti)
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientOverviewTabWM({ clientId, row, navigate, accountIds, onOpenDrawer }) {
  const WC = getWorkspaceCopy();
  const Wp = WC.wmPulse || {};
  const Wlinks = WC.wmDrawerLinks || [];
  const analyticsApi = window.Slate.analytics;
  const tot = analyticsApi && typeof analyticsApi.totals === 'function' ? analyticsApi.totals(accountIds) : null;
  const aum = tot ? tot.mv : clientAum(row);
  const liqMv = tot ? Math.round(tot.mv * 0.88) : Math.round(aum * 0.88);
  const unreal = tot && tot.unreal != null ? tot.unreal : null;
  const briefing = HOUSEHOLD_BRIEFING;
  const ot = briefing && briefing.outcomeTargets;
  const policyBench = ot && ot.policyBenchmarkYtd != null ? ot.policyBenchmarkYtd : 0.038;
  const showIpsDeep = row.demoFull && clientId === 'marchetti';
  const ipsPct = showIpsDeep ? Math.min(100, Math.round((row.ytdPct / policyBench) * 100)) : null;
  const rhythmPct = row.reviewTone === 'urgent' ? 52 : row.reviewTone === 'warn' ? 71 : 92;
  const shareOfBook = BOOK_SUMMARY.totalAum > 0 ? aum / BOOK_SUMMARY.totalAum : 0;
  const hasBrief = clientId === 'marchetti' && briefing && briefing.nextMeeting;
  const openFollowUps = hasBrief && briefing.followUps ? briefing.followUps.filter(f => f.status !== 'completed').length : 0;
  const drawerGo = id => {
    if (typeof onOpenDrawer === 'function') onOpenDrawer(id);
    else navigate(wmHouseholdLanding(clientId, id));
  };

  return (
    <div className="stack stack-3" style={{ marginTop: 12 }}>
      <div className="wm-overview-kpis wm-pulse-kpi-row">
        <div className="card wm-overview-kpi">
          <span className="label">{Wp.kpiNw || 'Net worth'}</span>
          <span className="wm-overview-kpi-val slate-metric-value">{fmt.money(aum, { compact: true })}</span>
          <span className="text-3" style={{ fontSize: 12 }}>{row.acctCount} accounts · {row.custodians}</span>
        </div>
        <div className="card wm-overview-kpi">
          <span className="label">{Wp.kpiLiq || 'Liquid'}</span>
          <span className="wm-overview-kpi-val slate-metric-value">{fmt.money(liqMv, { compact: true })}</span>
          <span className="text-3" style={{ fontSize: 12 }}>{showIpsDeep ? 'Approximate sleeve inside 30d · demo curve' : 'Illustrative liquidity sleeve when positions are modeled'}</span>
        </div>
        <div className="card wm-overview-kpi">
          <span className="label">{Wp.kpiUg || 'Unrealised gain'}</span>
          <span className="wm-overview-kpi-val slate-metric-value">{unreal != null ? fmt.money(unreal, { compact: true }) : '—'}</span>
          <span className="text-3" style={{ fontSize: 12 }}>Aggregated across entities in scope</span>
        </div>
        <div className="card wm-overview-kpi">
          <span className="label">{Wp.kpiYtdInc || 'YTD income'}</span>
          <span className="wm-overview-kpi-val slate-metric-value">—</span>
          <span className="text-3" style={{ fontSize: 12 }}>Dividends &amp; coupons not modeled in this demo dataset</span>
        </div>
      </div>

      <div className="grid-2 wm-pulse-midrow" style={{ gap: 16 }}>
        <div className="card wm-pulse-attention">
          <p className="label">{Wp.attentionCard || 'Attention needed'}</p>
          <p className="text-2" style={{ fontSize: 13, marginTop: 10, lineHeight: 1.55 }}>
            {row.reviewTone === 'urgent'
              ? `Review overdue — ${fmt.relDays(Math.abs(row.reviewInDays || 0))} past cadence · ${row.nextAction || 'close diary loop.'}`
              : `${row.driftLabel}${row.nextAction ? ` · Next: ${row.nextAction}` : ''}`}
          </p>
          <button type="button" className="btn sm ghost mt-16" onClick={() => drawerGo('documents')}>Open documents drawer →</button>
        </div>
        <div className="card wm-pulse-allocation-teaser">
          <p className="label">{Wp.allocCardTitle || 'Allocation vs IPS targets'}</p>
          <p className="text-2 slate-body-copy" style={{ fontSize: 13, marginTop: 10 }}>
            {showIpsDeep
              ? 'Equities moderately above IPS sleeves — diversification tab shows issuer concentration flags.'
              : `${row.driftLabel} — sleeve-level IPS comparison is populated when this household mirrors the fully modeled demo book.`}
          </p>
          <button type="button" className="btn sm ghost mt-16" onClick={() => navigate(`clients/${clientId}/portfolio`)}>{Wp.perfJump || 'Open portfolio overview →'}</button>
        </div>
      </div>

      <div className="card wm-pulse-perf-mini">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="label">{showIpsDeep ? 'Performance vs IPS blend' : 'Trailing performance snapshot'}</p>
            <p className="text-3 slate-body-copy" style={{ fontSize: 13, margin: '10px 0 0', maxWidth: 560 }}>
              {showIpsDeep ? (
                <>Household fiscal YTD ≈ +{fmt.pct(100 * row.ytdPct, { dp: 2 })}, IPS blend illustrative +{fmt.pct(100 * policyBench, { dp: 2 })}.</>
              ) : (
                <>Household YTD ≈ +{fmt.pct(100 * row.ytdPct, { dp: 2 })} — policy benchmark not attached to this anonymized row in the fixture.</>
              )}
            </p>
          </div>
          <button type="button" className="btn ghost sm" onClick={() => navigate(`clients/${clientId}/portfolio`)}>Portfolio chart →</button>
        </div>
      </div>

      <div className="card wm-pulse-deep-dive wm-dash-card-flat">
        <p className="label">{Wp.deepDiveTitle || 'Deep dives'}</p>
        <div className="row gap-8 wm-pulse-deep-grid" style={{ flexWrap: 'wrap', marginTop: 14 }}>
          {Wlinks.map(link => (
            <button key={link.id} type="button" className="btn ghost sm" onClick={() => drawerGo(link.id)}>
              {(link.label || link.id)} →
            </button>
          ))}
        </div>
      </div>

      <div className="card wm-overview-book-strip">
        <div className="row wm-overview-book-strip-head" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div style={{ minWidth: 220 }}>
            <div className="label">Household ↔ book story</div>
            <p className="text-3" style={{ fontSize: 12, margin: '6px 0 0', lineHeight: 1.45, maxWidth: 520 }}>
              Slim linkage to the aggregated book dashboard — IPS outcomes stay here while KPI grids live on Dashboard.
            </p>
          </div>
          <button type="button" className="btn sm ghost" onClick={() => navigate('dashboard')}>Book dashboard</button>
        </div>
        <div className="wm-overview-book-strip-metrics">
          <div className="wm-overview-book-chip">
            <span className="label">Share of book AUM</span>
            <span className="mono wm-overview-book-chip-val">{fmt.pct(100 * shareOfBook, { dp: 1 })}</span>
            <span className="text-3" style={{ fontSize: 11 }}>{fmt.money(aum, { compact: true })} of {fmt.money(BOOK_SUMMARY.totalAum, { compact: true })}</span>
          </div>
          <div className="wm-overview-book-chip">
            <span className="label">Attribution · book NNM</span>
            <span className="mono wm-overview-book-chip-val">—</span>
            <span className="text-3" style={{ fontSize: 11 }}>
              {showIpsDeep ? 'Illustrative share of book NNM not wired to live ledger in this demo' : 'Not shown for anonymized book rows in the fixture'}
            </span>
          </div>
        </div>
        <div className="wm-overview-book-strip-gauges">
          {showIpsDeep && ipsPct != null ? (
            <GoalBar
              label="Policy outcomes vs IPS blend"
              pct={ipsPct}
              detail={`Household +${fmt.pct(100 * row.ytdPct, { dp: 1 })} vs blend +${fmt.pct(100 * policyBench, { dp: 1 })} (YTD)`}
              tone={row.ytdPct + 1e-6 >= policyBench ? 'ok' : 'warn'}
            />
          ) : null}
          <GoalBar
            label="Relationship trajectory"
            pct={rhythmPct}
            detail={row.reviewTone === 'urgent'
              ? 'Diary friction · drift flagged'
              : row.reviewTone === 'warn' ? 'Steady growth · watch drift' : 'Aligned cadence vs book narrative'}
            tone={row.reviewTone === 'urgent' ? 'warn' : 'ok'}
          />
        </div>
      </div>

      <div className="grid-2" style={{ gap: 16, alignItems: 'stretch' }}>
        {hasBrief ? (
          <div className="card" style={{ padding: 20 }}>
            <div className="label">Next touchpoint</div>
            <h3 className="serif" style={{ margin: '10px 0 6px', fontSize: 18 }}>{briefing.nextMeeting.type}</h3>
            <p className="text-2" style={{ fontSize: 13, margin: 0 }}>
              {briefing.nextMeeting.date} · {briefing.nextMeeting.time} · {briefing.nextMeeting.location}
            </p>
            <ul className="text-2 wm-overview-agenda" style={{ fontSize: 13, margin: '12px 0 0', paddingLeft: 18 }}>
              {(briefing.nextMeeting.agenda || []).slice(0, 4).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            <div className="row gap-10 mt-16" style={{ flexWrap: 'wrap' }}>
              <button type="button" className="btn sm primary" onClick={() => drawerGo('messages')}>Open communication log</button>
              <button type="button" className="btn sm ghost" onClick={() => navigate(`clients/${clientId}/alts`)}>Alts desk</button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 20 }}>
            <div className="label">Relationship rhythm</div>
            <p className="text-2 mt-12" style={{ fontSize: 13 }}>
              Add meeting notes and milestones after first portfolio import — or open the full demo household for a richer briefing model.
            </p>
          </div>
        )}
        <div className="card" style={{ padding: 20 }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div className="label">Open commitments</div>
            <span className="text-3 mono" style={{ fontSize: 11 }}>{openFollowUps} follow-ups</span>
          </div>
          <div className="stack stack-2 mt-12">
            {(hasBrief ? briefing.followUps : []).filter(f => f.status !== 'completed').slice(0, 5).map(f => (
              <div key={f.id} className="row gap-10" style={{ alignItems: 'flex-start', fontSize: 13, paddingBottom: 10, borderBottom: '1px dashed var(--rule-2)' }}>
                <span className="mono text-3" style={{ fontSize: 11, width: 76 }}>{fmtShort(f.due)}</span>
                <span style={{ flex: 1 }}>{f.commit}</span>
                <span className="tag">{f.owner}</span>
              </div>
            ))}
            {!hasBrief || openFollowUps === 0 ? (
              <p className="text-3" style={{ fontSize: 12 }}>No scripted follow-ups for this household — tasks roll up from CRM in production.</p>
            ) : null}
          </div>
          <button type="button" className="btn ghost sm mt-16" onClick={() => navigate(`clients/${clientId}/portfolio?sub=cashflow`)}>Liquidity &amp; flows →</button>
        </div>
      </div>

      <p className="text-3 wm-metric-rationale" style={{ fontSize: 11, maxWidth: 720 }}>
        Overview prioritises what an RM checks before a call: size of relationship, outcomes vs policy, diary risk, and issuer pipeline — not firm-wide aggregates.
      </p>
    </div>
  );
}

function GoalBar({ label, pct, detail, tone }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const fillVar = tone === 'warn' ? 'var(--warn)' : tone === 'neg' ? 'var(--neg)' : 'var(--accent)';
  return (
    <div className="wm-goal-bar-wrap">
      <div className="row gap-10" style={{ justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        <span className="text-3" style={{ fontSize: 11 }}>{detail}</span>
      </div>
      <div className="wm-goal-bar-track">
        <div className="wm-goal-bar-fill" style={{ width: `${clamped}%`, background: fillVar }} />
      </div>
    </div>
  );
}

function ClientGoalsTab({ clientId, row }) {
  const ot = HOUSEHOLD_BRIEFING && HOUSEHOLD_BRIEFING.outcomeTargets;
  const householdYtd = row.ytdPct;
  const bench = ot && ot.policyBenchmarkYtd != null ? ot.policyBenchmarkYtd : 0.038;
  const relToBench = bench > 0 ? Math.min(140, (householdYtd / bench) * 70) : 50;
  const altsPct = ot && ot.altsCommitmentTarget > 0 ? Math.round((100 * ot.altsFundedMv) / ot.altsCommitmentTarget) : 0;
  const liqPct = ot && ot.liquidityMonthsTarget > 0 ? Math.min(100, (ot.liquidityMonthsEstimate / ot.liquidityMonthsTarget) * 100) : 0;

  return (
    <div className="stack stack-3" style={{ marginTop: 12 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 className="serif" style={{ marginTop: 0 }}>Outcomes vs policy</h3>
        <p className="text-2" style={{ fontSize: 13 }}>
          {clientId === 'marchetti' && ot ? (
            <>
              Household return vs {ot.policyBenchmarkLabel}. Alts pacing vs stated commitment envelope. Liquidity vs IPS minimum runway — illustrative thresholds for demo narrative.
            </>
          ) : (
            <>Targets populate once the IPS and liquidity model are on file for this household.</>
          )}
        </p>
        {clientId === 'marchetti' && ot ? (
          <div className="stack stack-3 mt-16">
            <GoalBar
              label="Return vs IPS benchmark (YTD)"
              pct={relToBench}
              detail={`+${fmt.pct(100 * householdYtd, { dp: 1 })} vs +${fmt.pct(100 * bench, { dp: 1 })}`}
              tone={householdYtd >= bench ? 'ok' : 'warn'}
            />
            <GoalBar
              label="Alts pacing (funded ÷ commitment envelope)"
              pct={altsPct}
              detail={`${fmt.money(ot.altsFundedMv, { compact: true })} of ${fmt.money(ot.altsCommitmentTarget, { compact: true })}`}
              tone={altsPct >= 90 ? 'warn' : 'ok'}
            />
            <GoalBar
              label="Liquidity runway vs IPS minimum"
              pct={liqPct}
              detail={`~${ot.liquidityMonthsEstimate} mo estimated · target ≥ ${ot.liquidityMonthsTarget} mo`}
              tone={liqPct >= 100 ? 'ok' : 'warn'}
            />
          </div>
        ) : (
          <p className="text-3 mt-16" style={{ fontSize: 12 }}>Drift today: {row.driftLabel}</p>
        )}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <h3 className="serif" style={{ marginTop: 0 }}>Alternative sleeve shape</h3>
        <p className="text-3" style={{ fontSize: 12, marginBottom: 12 }}>IPS sub-allocations inside the alts bucket — where RM proposal work ties to client outcomes.</p>
        <div className="stack stack-2">
          {ALT_STRATEGY_MIX.map(s => (
            <GoalBar
              key={s.key}
              label={s.label}
              pct={s.target > 0 ? Math.min(100, Math.round((100 * s.actual) / s.target)) : 0}
              detail={`Actual ${s.actual}% · Target ${s.target}%`}
              tone={s.actual < s.target * 0.5 ? 'warn' : 'ok'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientCommunicationTab({ clientId, row }) {
  const seeded = (HOUSEHOLD_BRIEFING && clientId === 'marchetti' && HOUSEHOLD_BRIEFING.contactLog)
    ? HOUSEHOLD_BRIEFING.contactLog.map((e, i) => ({ ...e, _seed: `s-${i}` }))
    : [];
  const [extras, setExtras] = React.useState(() => readWmMsgExtras(clientId));
  const [kind, setKind] = React.useState('email');
  const [withWho, setWithWho] = React.useState('Marco');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');

  React.useEffect(() => {
    setExtras(readWmMsgExtras(clientId));
  }, [clientId]);

  const merged = React.useMemo(() => {
    const a = [
      ...extras.map((e, i) => ({ ...e, _id: e.id || `x-${i}`, sort: new Date(e.date).getTime() })),
      ...seeded.map(e => ({ ...e, _id: e._seed, sort: new Date(e.date).getTime() })),
    ];
    a.sort((p, q) => q.sort - p.sort);
    return a;
  }, [extras, seeded]);

  const logInteraction = () => {
    const subj = subject.trim() || '(no subject)';
    const line = {
      id: `wm-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      kind,
      with: withWho.trim() || '—',
      subject: body.trim() ? `${subj} — ${body.trim()}` : subj,
    };
    const next = [line, ...extras];
    setExtras(next);
    writeWmMsgExtras(clientId, next);
    setSubject('');
    setBody('');
  };

  return (
    <div className="grid-2 wm-comms-grid" style={{ gap: 20, marginTop: 12, alignItems: 'start' }}>
      <div className="card" style={{ padding: 20 }}>
        <div className="label">Log</div>
        <h3 className="serif" style={{ margin: '8px 0 16px', fontSize: 18 }}>{row.name}</h3>
        <div className="stack stack-2 wm-comms-thread">
          {merged.map(entry => (
            <div key={entry._id} className="wm-comms-row">
              <div className="row gap-8" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="mono text-3" style={{ fontSize: 11 }}>{fmtShort(entry.date)}</span>
                <span className="tag">{entry.kind}</span>
                <span className="text-3" style={{ fontSize: 11 }}>with {entry.with}</span>
              </div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{entry.subject}</div>
            </div>
          ))}
        </div>
        {merged.length === 0 ? <p className="text-3" style={{ fontSize: 12 }}>No history yet — log calls and emails after each touchpoint.</p> : null}
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="label">Record touchpoint</div>
        <p className="text-2 mt-8" style={{ fontSize: 13 }}>Demo: append to this browser&apos;s history (seeded entries stay fixed).</p>
        <div className="stack stack-2 mt-16">
          <div className="modal-grid-2">
            <div>
              <label className="modal-label" htmlFor="wm-msg-kind">Channel</label>
              <select id="wm-msg-kind" className="modal-input" value={kind} onChange={e => setKind(e.target.value)}>
                <option value="email">Email</option>
                <option value="call">Call</option>
                <option value="meeting">Meeting</option>
                <option value="note">Internal note</option>
              </select>
            </div>
            <div>
              <label className="modal-label" htmlFor="wm-msg-with">With</label>
              <input id="wm-msg-with" className="modal-input" value={withWho} onChange={e => setWithWho(e.target.value)} placeholder="Marco" />
            </div>
          </div>
          <div>
            <label className="modal-label" htmlFor="wm-msg-subj">Subject / headline</label>
            <input id="wm-msg-subj" className="modal-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Follow-up on RFQ…" />
          </div>
          <div>
            <label className="modal-label" htmlFor="wm-msg-body">Notes</label>
            <textarea id="wm-msg-body" className="modal-input modal-textarea" rows={4} value={body} onChange={e => setBody(e.target.value)} placeholder="What was agreed, next steps, issuer / counsel loops…" />
          </div>
          <button type="button" className="btn primary" onClick={logInteraction}>Save to thread</button>
        </div>
      </div>
    </div>
  );
}

function ClientEventsTab() {
  const b = HOUSEHOLD_BRIEFING;
  return (
    <div className="stack stack-3" style={{ marginTop: 8 }}>
      <div>
        <h3 className="serif" style={{ fontSize: 16, marginBottom: 8 }}>Relationship &amp; compliance</h3>
        <div className="card" style={{ padding: 0 }}>
          {b.upcoming.slice(0, 8).map((e, i) => (
            <div key={i} className="row" style={{ padding: '12px 16px', borderBottom: i < 7 ? '1px solid var(--rule-2)' : 'none', gap: 12 }}>
              <span className="mono text-3" style={{ width: 84 }}>{fmtShort(e.date)}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{e.label}</span>
              <span className="tag">{e.kind}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="serif" style={{ fontSize: 16, marginBottom: 8 }}>Structured &amp; trading</h3>
        <div className="card" style={{ padding: 0 }}>
          {MARKET_CALENDAR.map((m, i) => (
            <div key={m.id} className="row" style={{ padding: '12px 16px', borderBottom: i < MARKET_CALENDAR.length - 1 ? '1px solid var(--rule-2)' : 'none', gap: 12, fontSize: 13 }}>
              <span className="mono">{m.ticker}</span>
              <span style={{ flex: 1 }}>{m.label}</span>
              <span className="text-3">{fmtShort(m.date)}</span>
              <span className="tag accent">{m.kind}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function readClientDocumentsDocsTab(clientId) {
  const h = (window.SlateRoute && window.SlateRoute.read) ? window.SlateRoute.read() : location.hash.replace(/^#\/?/, '');
  const base = `clients/${clientId}/documents`;
  if (!h.startsWith(base)) return 'statements';
  const qi = h.indexOf('?');
  if (qi < 0) return 'statements';
  const d = new URLSearchParams(h.slice(qi)).get('docs');
  return d === 'kyc' ? 'kyc' : 'statements';
}

function ClientDocumentsTab({ navigate, clientId }) {
  const [docsTab, setDocsTab] = React.useState(() => readClientDocumentsDocsTab(clientId));
  React.useEffect(() => {
    const onNav = () => setDocsTab(readClientDocumentsDocsTab(clientId));
    window.addEventListener('hashchange', onNav);
    window.addEventListener('slate-route', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('slate-route', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, [clientId]);

  const kycDocs = getMarchettiKycDocs();
  const docsPath = `clients/${clientId}/documents`;

  const goTab = (t) => {
    const qs = t === 'kyc' ? '?docs=kyc' : '';
    navigate(docsPath + qs);
    setDocsTab(t);
  };

  return (
    <div className="client-documents-tab" style={{ marginTop: 8 }}>
      <div className="tabs client-documents-subtabs">
        <button type="button" className={docsTab === 'statements' ? 'active' : ''} onClick={() => goTab('statements')}>
          Financial statements ({STATEMENTS.length})
        </button>
        <button type="button" className={docsTab === 'kyc' ? 'active' : ''} onClick={() => goTab('kyc')}>
          KYC &amp; identity ({kycDocs.length})
        </button>
      </div>

      {docsTab === 'statements' ? (
        <React.Fragment>
          <p className="text-2 mb-12" style={{ fontSize: 13 }}>
            Custodian statements on file for your household. Upload more from <strong>Refresh data</strong>.
          </p>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr><th>File</th><th>Custodian</th><th className="num">Pages</th><th className="num">Extracted MV</th></tr>
              </thead>
              <tbody>
                {STATEMENTS.map(s => {
                  const acct = ACCOUNTS.find(a => a.id === s.account);
                  return (
                    <tr key={s.id}>
                      <td className="mono" style={{ fontSize: 12 }}>{s.file}</td>
                      <td>{acct ? acct.custodian : '—'}</td>
                      <td className="num">{s.pages}</td>
                      <td className="num">{fmt.money(s.value, { compact: true })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn ghost mt-16" onClick={() => navigate(`clients/${clientId}/refresh`)}>Upload additional statements →</button>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p className="text-2 mb-12" style={{ fontSize: 13 }}>
            Identity, tax, and entity documents your advisor keeps on file for regulatory review. Contact your RM if anything needs updating.
          </p>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Document</th><th>Type</th><th>Uploaded</th><th>Status</th></tr>
              </thead>
              <tbody>
                {kycDocs.map(d => (
                  <tr key={d.id}>
                    <td className="mono" style={{ fontSize: 12 }}>{d.fileName}</td>
                    <td className="text-3">{d.docType}</td>
                    <td className="text-3">{d.uploadedAt}</td>
                    <td><span className="tag">{String(d.status || '—').replace(/_/g, ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {kycDocs.length === 0 ? (
            <p className="text-2 mt-16" style={{ fontSize: 13 }}>No KYC artefacts on file in this demo.</p>
          ) : null}
        </React.Fragment>
      )}
    </div>
  );
}

function ClientStatusTab({ navigate, clientId }) {
  const b = HOUSEHOLD_BRIEFING;
  const nw = POSITIONS.reduce((a, p) => a + p.mv, 0);
  const flagged = POSITIONS.filter(p => p.flag).length;
  return (
    <div className="grid-2" style={{ gap: 16, marginTop: 8 }}>
      <div className="card" style={{ padding: 20 }}>
        <div className="label">Relationship snapshot</div>
        <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginTop: 6 }}>{getDemoRole() === 'client' ? 'Your household' : HOUSEHOLD.name}</div>
        <p className="text-2 mt-8" style={{ fontSize: 13, lineHeight: 1.55 }}>{HOUSEHOLD.segment} · since {HOUSEHOLD.founded} · RM {HOUSEHOLD.rm}</p>
        <hr className="divider dashed" style={{ margin: '14px 0' }}/>
        <div className="label">Next meeting</div>
        <div style={{ fontSize: 14, marginTop: 4 }}>{b.nextMeeting.type} · {fmtShort(b.nextMeeting.date)}</div>
      </div>
      <div className="card" style={{ padding: 20 }}>
        <div className="label">Data health</div>
        <div className="kpis" style={{ marginTop: 12, gridTemplateColumns: '1fr 1fr' }}>
          <div className="kpi"><span className="label">Net worth (parsed)</span><span className="v lg">{fmt.money(nw, { compact: true })}</span></div>
          <div className="kpi"><span className="label">Last ingest</span><span className="v lg" style={{ fontSize: 16 }}>6 May 2026</span></div>
          <div className="kpi"><span className="label">Parser confidence</span><span className="v lg" style={{ color: 'var(--pos)', fontSize: 18 }}>94%</span></div>
          <div className="kpi"><span className="label">Flagged positions</span><span className="v lg" style={{ color: flagged ? 'var(--warn)' : 'var(--pos)' }}>{flagged}</span></div>
        </div>
        <button type="button" className="btn sm mt-16" onClick={() => navigate(`clients/${clientId}/insights`)}>View insights</button>
      </div>
    </div>
  );
}

function ClientRefreshTab({ navigate, clientId, clientName }) {
  const [mode, setMode] = React.useState('merge');
  const onUploadClick = () => {
    const Store = window.Slate.ClientStore;
    if (Store && Store.get(clientId)) {
      startClientPortfolioIntake(clientId, clientName);
    } else {
      clearSlateIntakeLandingPrefs();
      navigate('upload');
    }
  };
  return (
    <div className="card client-refresh-card" style={{ padding: 24, marginTop: 8 }}>
      <h3 className="serif">Refresh from statements</h3>
      <p className="client-refresh-lede">
        Upload new PDFs to extend positions and tax lots, or run a clean refresh (rebuild from scratch — demo only).
      </p>
      <div className="client-refresh-options">
        <label className="client-refresh-option">
          <input type="radio" name="ingest" checked={mode === 'merge'} onChange={() => setMode('merge')} />
          <span><strong>Merge / append</strong> — add new periods and reconcile with existing holdings.</span>
        </label>
        <label className="client-refresh-option">
          <input type="radio" name="ingest" checked={mode === 'clean'} onChange={() => setMode('clean')} />
          <span><strong>Clean refresh</strong> — replace modeled book from new uploads (confirmation in production).</span>
        </label>
      </div>
      <div className="client-refresh-actions">
        <button type="button" className="btn primary" onClick={onUploadClick}>
          <span dangerouslySetInnerHTML={{ __html: Icons.upload }} /> Upload statements…
        </button>
        <button type="button" className="btn ghost" onClick={() => navigate(`clients/${clientId}/documents`)}>View documents</button>
      </div>
    </div>
  );
}

function ClientWorkspacePending({ clientId, row, navigate, activeTab, clientLeanIntake }) {
  const WC = getWorkspaceCopy();
  const Pe = WC.pending || {};
  const Ec = WC.emptyCard || {};
  const importLbl = Ec.importCta || 'Import portfolio files';
  const importNow = () => startClientPortfolioIntake(clientId, row.name);
  const line = (key, f, fb) => {
    const b = Pe[key];
    const v = b && b[f];
    return v != null && v !== '' ? v : fb;
  };
  const emptyCard = (title, body, showImport = true) => (
    <div className="card" style={{ padding: 28, marginTop: 8 }}>
      <p className="serif wm-dash-chart-card-title" style={{ marginTop: 0 }}>{title}</p>
      <p className="text-2" style={{ fontSize: 13, lineHeight: 1.55 }}>{body}</p>
      {showImport ? (
        <button type="button" className="btn primary mt-16" onClick={importNow}>
          <span dangerouslySetInnerHTML={{ __html: Icons.upload }} /> {importLbl}
        </button>
      ) : null}
    </div>
  );
  const St = Pe.status || {};

  return (
    <React.Fragment>
      {activeTab === 'portfolio' && (
        <div className="wm-pending-portfolio-hero card" style={{ marginTop: 8 }}>
          <div className="wm-pending-portfolio-hero__inner">
            <h2 className="wm-pending-portfolio-hero__title serif">{line('portfolio', 'title', 'Portfolio not imported yet')}</h2>
            <p className="text-2 wm-pending-portfolio-hero__lede">{line('portfolio', 'body', 'Import a statement package to populate holdings, accounts, insights, and exception review.')}</p>
            {workspacePendingShowImport('portfolio') ? (
              <button type="button" className="btn primary wm-pending-portfolio-hero__cta" onClick={importNow}>
                <span className="wm-pending-cta-icon" dangerouslySetInnerHTML={{ __html: Icons.upload }} />
                {importLbl}
              </button>
            ) : null}
          </div>
        </div>
      )}
      {!clientLeanIntake && (activeTab === 'overview' || activeTab === 'pulse') && emptyCard(
        line('overview', 'title', 'Client overview'),
        line('overview', 'body', 'After import, household AUM, outcomes vs IPS, diary risk, issuer RFQs, and open follow-ups consolidate here.'),
        workspacePendingShowImport('overview'),
      )}
      {!clientLeanIntake && activeTab === 'insights' && emptyCard(
        line('insights', 'title', 'Insights after first import'),
        line('insights', 'body', 'Slate builds concentration, tax, cash-drag, and IPS-drift insights once statements are parsed and the book is aggregated.'),
        workspacePendingShowImport('insights'),
      )}
      {!clientLeanIntake && activeTab === 'goals' && emptyCard(
        line('goals', 'title', 'Goals & outcomes'),
        line('goals', 'body', 'IPS pacing, liquidity runway, and return vs benchmark appear once positions and policy are on file.'),
        workspacePendingShowImport('goals'),
      )}
      {!clientLeanIntake && activeTab === 'messages' && emptyCard(
        line('messages', 'title', 'Communication'),
        line('messages', 'body', 'Touchpoint history and notes attach here — link calls and emails to custody actions for audit.'),
        workspacePendingShowImport('messages'),
      )}
      {!clientLeanIntake && activeTab === 'events' && emptyCard(
        line('events', 'title', 'Upcoming events'),
        line('events', 'body', 'Relationship and compliance milestones will appear here once the household has an active portfolio.'),
        workspacePendingShowImport('events'),
      )}
      {!clientLeanIntake && activeTab === 'documents' && emptyCard(
        line('documents', 'title', 'No statements on file'),
        line('documents', 'body', 'Import custodian PDFs from the Portfolio tab or via Refresh data. Document inventory grows with each ingest.'),
        workspacePendingShowImport('documents'),
      )}
      {!clientLeanIntake && activeTab === 'status' && (
        <div className="grid-2" style={{ gap: 16, marginTop: 8 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="label">{St.householdLabel || 'Household'}</div>
            <div className="serif slate-metric-value" style={{ fontSize: 20, fontWeight: 500, marginTop: 6 }}>{getDemoRole() === 'client' ? (St.yourHousehold || 'Your household') : row.name}</div>
            <p className="text-2 mt-8" style={{ fontSize: 13 }}>
              {row.familyType}{row.email ? ` · ${row.email}` : ''}{row.relationshipSince ? ` · since ${row.relationshipSince}` : ''}
            </p>
            {row.custodian ? <p className="text-3 mt-8" style={{ fontSize: 12 }}>Primary custodian · {row.custodian}</p> : null}
            {row.notes ? <p className="text-2 mt-12" style={{ fontSize: 12 }}>{row.notes}</p> : null}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="label">{St.parsedBookLabel || 'Parsed book'}</div>
            <p className="text-2 mt-8" style={{ fontSize: 13 }}>{St.parsedBookBody || 'No ingest yet. Net worth, parser confidence, and review cadence will appear after the first successful import.'}</p>
            <button type="button" className="btn primary mt-16" onClick={importNow}>{importLbl}</button>
          </div>
        </div>
      )}
      {activeTab === 'alts' && emptyCard(
        line('alts', 'title', 'Alternatives'),
        line('alts', 'body', 'Private funds and structured products surface here once positions are parsed and classified.'),
        workspacePendingShowImport('alts'),
      )}
      {activeTab === 'structured' && emptyCard(
        line('structured', 'title', 'Structured products'),
        line('structured', 'body', 'Your structured notes and any new ideas your advisor is reviewing appear here once positions are classified.'),
        workspacePendingShowImport('structured'),
      )}
      {!clientLeanIntake && activeTab === 'refresh' && (
        <ClientRefreshTab navigate={navigate} clientId={clientId} clientName={row.name} />
      )}
    </React.Fragment>
  );
}

const SLATE_WM_ASK_DISCLAIMER_KEY = 'slate-wm-ask-disclaimer-shown';

function WmWorkspaceDrawer({ tabId, title, onClose, clientId, row, wrapNav, navigate, accountIds, isClientRole }) {
  return (
    <React.Fragment>
      <div className="wm-drawer-backdrop" role="presentation" onClick={onClose} />
      <aside className="wm-drawer-panel" aria-label={title}>
        <div className="wm-drawer-head row gap-10" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <h2 className="serif wm-drawer-title" style={{ margin: 0 }}>{title}</h2>
          <button type="button" className="btn ghost icon wm-drawer-close" onClick={onClose} aria-label="Close">
            <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
          </button>
        </div>
        <div className="wm-drawer-body">
          {tabId === 'insights' ? (
            <InsightsScreen
              navigate={wrapNav}
              accountIds={accountIds}
              embedded
              clientView={isClientRole}
              bookInsightsMode={!isClientRole}
              workspaceClientId={isClientRole ? clientId : null}
            />
          ) : null}
          {tabId === 'goals' && !isClientRole ? <ClientGoalsTab clientId={clientId} row={row} /> : null}
          {tabId === 'messages' && !isClientRole ? <ClientCommunicationTab clientId={clientId} row={row} /> : null}
          {tabId === 'events' ? <ClientEventsTab /> : null}
          {tabId === 'documents' ? <ClientDocumentsTab navigate={navigate} clientId={clientId} /> : null}
          {tabId === 'status' ? <ClientStatusTab navigate={navigate} clientId={clientId} /> : null}
          {tabId === 'refresh' ? <ClientRefreshTab navigate={navigate} clientId={clientId} clientName={row.name} /> : null}
        </div>
      </aside>
    </React.Fragment>
  );
}

function answerWmClientQuestion(q, row) {
  const question = (q || '').trim().toLowerCase();
  const C = window.Slate.Copy && window.Slate.Copy.askSlateWm;
  const foot = (C && C.footnoteSources) || 'Compiled from Slate ingest + directory row.';
  const oos = (C && C.outOfScope) || 'Outside ingested Slate data.';
  if (!question) return { text: 'Try a suggestion chip or ask about drift, diary, liquidity, or IPS.', foot };
  if (question.includes('drift') || question.includes('ips')) {
    return { text: `Primary drift signal: ${row.driftLabel}. Open Portfolio to compare sleeves vs IPS.`, foot };
  }
  if (question.includes('diary') || question.includes('review')) {
    const line = row.reviewInDays == null ? 'No review date on file.' : row.reviewInDays < 0 ? `Review overdue · ${Math.abs(row.reviewInDays)}d` : `${row.reviewInDays}d to next review`;
    return { text: `Cadence: ${line}.`, foot };
  }
  if (question.includes('liquidity') || question.includes('30')) {
    return { text: 'Illustrative liquidity: see cashflow in Portfolio — callable balance modeled around $12M inside 30d (demo).', foot };
  }
  if (question.includes('issuer') || question.includes('follow')) {
    return { text: 'Issuer follow-ups roll from Pulse into Structured RFQ — desk queue shows live responses.', foot };
  }
  if (question.includes('tax') || question.includes('legal') || question.includes('suitability')) return { text: oos, foot };
  return { text: oos, foot };
}

function AskSlateWmDrawer({ row, onClose }) {
  const C = (window.Slate.Copy && window.Slate.Copy.askSlateWm) || {};
  const [q, setQ] = React.useState('');
  const [log, setLog] = React.useState(/** @type {{ q: string, a: string }[]} */ ([]));
  const [streaming, setStreaming] = React.useState(false);
  const [showDisclaimer, setShowDisclaimer] = React.useState(() => {
    try { return sessionStorage.getItem(SLATE_WM_ASK_DISCLAIMER_KEY) !== '1'; } catch (e) { return true; }
  });

  const runAsk = () => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setStreaming(true);
    const { text, foot } = answerWmClientQuestion(trimmed, row);
    window.setTimeout(() => {
      setLog(existing => [...existing, { q: trimmed, a: `${text}\n\n— ${foot}` }]);
      setStreaming(false);
      setQ('');
    }, 460 + Math.min(520, trimmed.length * 14));
  };

  return (
    <React.Fragment>
      <div className="wm-drawer-backdrop" role="presentation" onClick={onClose} />
      <aside className="wm-drawer-panel wm-ask-slate-panel" aria-label={C.title || 'Ask Slate'}>
        <div className="wm-drawer-head row gap-10" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="serif wm-drawer-title" style={{ margin: 0 }}>{C.title || 'Ask Slate'}</h2>
            <p className="text-3 wm-ask-context" style={{ margin: '8px 0 0', fontSize: 12 }}>
              {typeof C.contextLine === 'function' ? C.contextLine(row.name) : `Context · ${row.name}`}
            </p>
          </div>
          <button type="button" className="btn ghost icon wm-drawer-close" onClick={onClose} aria-label="Close">
            <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
          </button>
        </div>
        {showDisclaimer ? (
          <div className="card wm-ask-disclaimer slate-helper-copy">
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>{C.disclaimer || ''}</p>
            <button type="button" className="btn sm ghost mt-10" onClick={() => {
              try { sessionStorage.setItem(SLATE_WM_ASK_DISCLAIMER_KEY, '1'); } catch (e) {}
              setShowDisclaimer(false);
            }}>Dismiss for this session</button>
          </div>
        ) : null}
        <div className="wm-ask-chip-row row gap-8" style={{ flexWrap: 'wrap', marginBottom: 12 }}>
          {(C.promptChips || []).slice(0, 4).map(chip => (
            <button key={chip} type="button" className="btn ghost sm wm-ask-chip" onClick={() => { setQ(chip); }}>{chip}</button>
          ))}
        </div>
        <textarea className="modal-input wm-ask-input" rows={3} value={q} onChange={e => setQ(e.target.value)} placeholder={C.placeholder || ''} />
        <div className="row gap-10" style={{ marginTop: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn primary sm" onClick={runAsk} disabled={streaming || !q.trim()}>{streaming ? 'Typing…' : 'Send'}</button>
        </div>
        <div className="wm-ask-thread">
          {log.map((ln, idx) => (
            <div key={idx} className="wm-ask-exchange">
              <div className="wm-ask-q text-3 mono">{ln.q}</div>
              <div className="wm-ask-a" style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{ln.a}</div>
            </div>
          ))}
        </div>
        {streaming ? <div className="wm-ask-typing mono text-3" style={{ marginTop: 8 }}>Streaming response…</div> : null}
      </aside>
    </React.Fragment>
  );
}

function ClientWorkspaceScreen({ clientId, workspaceTab: wsProp, wmDrawerTab, tab: tabFallback, navigate, accountIds, entityFilter }) {
  const row = resolveBookRow(clientId);
  const showBackToBook = getDemoRole() !== 'client';
  const wrapNav = React.useCallback(p => clientScopedNavigate(clientId, p), [clientId]);
  const portfolioBase = `clients/${clientId}/portfolio`;
  const WC = getWorkspaceCopy();
  const Wn = WC.notFound || {};
  const Wi = WC.intake || {};
  const Wlite = WC.liteSample || {};
  const Wsub = WC.wmSubline || {};
  const Web = WC.eyebrow || {};

  React.useEffect(() => {
    if (getDemoRole() !== 'wm') return undefined;
    try {
      sessionStorage.setItem('slate-wm-last-client', clientId);
    } catch (e) { /* ignore */ }
    return undefined;
  }, [clientId]);

  const [askSlateOpen, setAskSlateOpen] = React.useState(false);

  if (!row) {
    return (
      <div className="page">
        <h1 className="serif">{Wn.title || 'Client not found'}</h1>
        <button type="button" className="btn" onClick={() => navigate('clients')}>{Wn.cta || 'Back to clients'}</button>
      </div>
    );
  }

  const isClientRole = getDemoRole() === 'client';
  const wmRole = getDemoRole() === 'wm';
  const isCustomPending = row.isCustom && !row.portfolioIngested;
  const wmPendingStrip = wmRole && isCustomPending;
  const wmSurfaceOk = tid =>
    wmPendingStrip ? WM_PENDING_INTAKE_TAB_ORDER.includes(tid) : ['pulse', 'portfolio', 'alts', 'structured'].includes(tid);
  const incoming = wsProp != null ? wsProp : tabFallback;
  const defaultWt = wmRole ? (wmPendingStrip ? 'portfolio' : 'pulse') : 'portfolio';
  const rawWt = wmRole
    ? incoming && wmSurfaceOk(incoming)
      ? incoming
      : defaultWt
    : WORKSPACE_TABS.some(t => t.id === incoming)
      ? incoming
      : defaultWt;
  const surfTab = isCustomPending && isClientRole && !['portfolio', 'alts', 'structured'].includes(rawWt) ? 'portfolio' : rawWt;
  const intakeMainTabs = isClientRole
    ? WORKSPACE_PORTFOLIO_TABS.filter(t => t.id === 'portfolio')
    : wmPendingStrip
      ? WM_PENDING_INTAKE_TAB_ORDER.map(tid => WORKSPACE_TABS.find(t => t.id === tid)).filter(Boolean)
      : WM_CLIENT_WORKSPACE_STRIP;

  if (isCustomPending) {
    const ft = row.familyType ? String(row.familyType) : '';
    const intakeEyebrow =
      wmRole && ft
        ? `${Web.wm || 'CLIENT WORKSPACE'} · ${ft}`
        : Wi.eyebrow || 'NEW CLIENT INTAKE';
    return (
      <div className="page wm-page wm-page--client-pending">
        <div className="page-header wm-pending-workspace-header">
          <div>
            <p className="eyebrow slate-section-label">{intakeEyebrow}</p>
            <h1 className="serif">{getDemoRole() === 'client' ? (Wi.h1Client || 'Your portfolio setup') : row.name}</h1>
            <p className="text-2 mt-8 slate-body-copy" style={{ fontSize: 13 }}>
              {wmRole
                ? (Wi.shellReady || 'Workspace shell ready for statement intake and portfolio review.')
                : typeof Wi.metaNoPortfolio === 'function'
                  ? Wi.metaNoPortfolio(row.custodians)
                  : `No portfolio data yet · primary custodian ${row.custodians || '—'}`}
            </p>
          </div>
          <div className="row gap-10 wm-pending-workspace-actions" style={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn primary wm-pending-import-header"
              onClick={() => startClientPortfolioIntake(clientId, row.name)}
            >
              <span dangerouslySetInnerHTML={{ __html: Icons.upload }} />
              {Wi.importStatementsHeader || 'Import statements'}
            </button>
            {showBackToBook ? (
              <button type="button" className="btn ghost" onClick={() => navigate('clients')}>{WC.backToClients || '← All clients'}</button>
            ) : null}
          </div>
        </div>
        <div className={`stack stack-2 wm-pending-tabs-outer${wmPendingStrip ? ' wm-pending-tabs-outer--wm' : ''}`} style={{ gap: 10, marginTop: 4 }}>
          <div>
            {wmPendingStrip ? null : (
              <div className="label" style={{ fontSize: 11, marginBottom: 6 }}>{Wi.householdDocs || 'Household & documents'}</div>
            )}
            <div className={`tabs client-workspace-tabs${wmPendingStrip ? ' client-workspace-tabs--wm-pending-intake' : ''}`} style={{ flexWrap: 'wrap' }}>
              {intakeMainTabs.map(t => (
                <button type="button" key={t.id} className={surfTab === t.id ? 'active' : ''} onClick={() => navigate(`clients/${clientId}/${t.id}`)}>
                  {workspaceTabLabel(t.id)}
                </button>
              ))}
              {isClientRole ? (
                <React.Fragment>
                  <button type="button" className={surfTab === 'alts' ? 'active' : ''} onClick={() => navigate(`clients/${clientId}/alts`)}>{Wi.altInvestments || 'Alternative investments'}</button>
                  <button type="button" className={surfTab === 'structured' ? 'active' : ''} onClick={() => navigate(`clients/${clientId}/structured`)}>{Wi.structuredProducts || 'Structured products'}</button>
                </React.Fragment>
              ) : null}
            </div>
          </div>
        </div>
        <ClientWorkspacePending clientId={clientId} row={row} navigate={navigate} activeTab={surfTab} clientLeanIntake={isClientRole} />
      </div>
    );
  }

  if (!row.isCustom && !row.demoFull) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="serif">{getDemoRole() === 'client' ? (Wlite.h1Client || 'Portfolio') : row.name}</h1>
          <p className="text-2 slate-body-copy">
            {getDemoRole() === 'client'
              ? (
                <>
                  {Wlite.clientLead || 'This view uses a lighter sample book.'}{' '}
                  <button type="button" className="btn linkish" style={{ padding: 0, border: 0, background: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('clients/marchetti/pulse')}>{Wlite.openFullDemo || 'Open the full demo portfolio'}</button>
                  {' '}{Wlite.clientSuffix || 'for the complete experience.'}
                </>
              )
              : (
                <>
                  {Wlite.wmLead || 'Illustrative household — open'}{' '}
                  <button type="button" className="btn linkish" style={{ padding: 0, border: 0, background: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('clients/marchetti/pulse')}>{Wlite.wmOpenFull || 'the full demo household'}</button>
                  {' '}{Wlite.wmSuffix || 'to continue.'}
                </>
              )}
          </p>
        </div>
        {showBackToBook ? (
          <button type="button" className="btn" onClick={() => navigate('clients')}>{WC.allClients || 'All clients'}</button>
        ) : null}
      </div>
    );
  }

  const clientShowMeta = isClientRole && surfTab === 'portfolio';
  const workspaceStripTabs = isClientRole ? CLIENT_LEAN_PORTFOLIO_STRIP_TABS : WM_CLIENT_WORKSPACE_STRIP;
  const wmStructuredEmbed = wmRole && surfTab === 'structured';
  const embedUsesOwnHeader = isClientRole && (surfTab === 'alts' || surfTab === 'structured');
  const wmAltsUnified = wmRole && surfTab === 'alts';

  const workspaceEyebrow = (() => {
    if (wmAltsUnified) return '';
    if (embedUsesOwnHeader) return '';
    if (!isClientRole) return Web.wm || 'CLIENT WORKSPACE';
    return '';
  })();

  const shellH1Hidden = (isClientRole && (surfTab === 'alts' || surfTab === 'structured')) || wmStructuredEmbed;
  const showWorkspaceHeaderMain = !(shellH1Hidden && isClientRole && !clientShowMeta);
  const omitShellPageHeader = embedUsesOwnHeader;

  const wmSublineText = () => {
    if (!wmRole) return null;
    if (typeof WC.wmSublineSegment === 'function') return WC.wmSublineSegment(row);
    return typeof WC.wmSublineDefault === 'function' ? WC.wmSublineDefault(row) : `${row.acctCount} accounts · ${row.custodians}`;
  };


  /** Close drawer: land on Pulse without drawer query when deep tab open. */
  const closeWmDrawer = () => {
    if (!wmRole || !wmDrawerTab) return;
    navigate(`clients/${clientId}/pulse`);
  };

  return (
    <div className="page">
      {!omitShellPageHeader ? (
      <div
        className={
          `${isClientRole && surfTab === 'portfolio' ? 'page-header page-header--client-portfolio' : 'page-header'}`
          + ((embedUsesOwnHeader || wmAltsUnified || wmStructuredEmbed) ? ' page-header--embed-child' : '')
          + ((embedUsesOwnHeader || wmAltsUnified || wmStructuredEmbed) && shellH1Hidden && !workspaceEyebrow && showBackToBook ? ' page-header--back-only' : '')
          + (wmRole ? ' page-header--wm-workspace' : '')
        }
      >
        {showWorkspaceHeaderMain ? (
          <div>
            {workspaceEyebrow ? <p className="eyebrow slate-section-label">{workspaceEyebrow}</p> : null}
            {!shellH1Hidden ? (
              <h1 className={`serif${wmRole && !isClientRole ? ' wm-workspace-client-h1' : ''}`}>{isClientRole ? workspaceMemberTitle(surfTab) : row.name}</h1>
            ) : null}
            {isClientRole ? (
              clientShowMeta ? (
                <p className="text-2 client-portfolio-header-meta slate-body-copy" style={{ fontSize: 13 }}>
                  {row.acctCount} accounts · {row.custodians}
                  {surfTab === 'portfolio' ? (
                    <span role="status">
                      <span className="client-portfolio-header-refresh"> · Last data refresh </span>
                      <time className="client-portfolio-header-refresh-date" dateTime="2026-05-06">6 May 2026</time>
                    </span>
                  ) : null}
                </p>
              ) : null
            ) : (
              <p className="text-2 mt-8 slate-body-copy wm-workspace-meta" style={{ fontSize: 13 }}>
                {wmSublineText()}
              </p>
            )}
          </div>
        ) : null}
        {showBackToBook ? (
          <div className="row wm-workspace-actions gap-10" style={{ flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
            {wmRole && !isClientRole ? (
              <React.Fragment>
                <button type="button" className="btn ghost sm wm-workspace-builder-jump" onClick={() => navigate('product-builder')}>
                  {WC.wmProductBuilderJump || '+ Build structured offer'}
                </button>
                <button type="button" className="btn wm-ask-slate-btn" onClick={() => setAskSlateOpen(true)}>
                  {WC.askSlateOpen || 'Ask Slate'}
                </button>
              </React.Fragment>
            ) : null}
            <button type="button" className="btn ghost" onClick={() => navigate('clients')}>{WC.backToClients || '← All clients'}</button>
          </div>
        ) : null}
      </div>
      ) : null}

      {wmAltsUnified ? null : workspaceStripTabs.length > 0 ? (
        <div className="tabs client-workspace-tabs client-workspace-tabs--wm" style={{ flexWrap: 'wrap' }}>
          {workspaceStripTabs.map(t => (
            <button type="button" key={t.id} className={surfTab === t.id ? 'active' : ''} onClick={() => navigate(`clients/${clientId}/${t.id}`)}>
              {typeof t.label === 'string' ? t.label : workspaceTabLabel(t.id)}
            </button>
          ))}
        </div>
      ) : null}

      {wmRole && row.demoFull ? (
        entityFilter ? (
          <FilterBar selected={entityFilter.selected} setSelected={entityFilter.setSelected} />
        ) : null
      ) : (
        entityFilter && surfTab === 'portfolio' ? (
          <FilterBar selected={entityFilter.selected} setSelected={entityFilter.setSelected} />
        ) : null
      )}

      {wmRole ? (
        <React.Fragment>
          {!isClientRole && surfTab === 'pulse' && (
            <ClientOverviewTabWM clientId={clientId} row={row} navigate={navigate} accountIds={accountIds} onOpenDrawer={(id) => navigate(wmHouseholdLanding(clientId, id))} />
          )}
          {surfTab === 'portfolio' && (
            <HouseholdScreen navigate={wrapNav} accountIds={accountIds} portfolioBase={portfolioBase} embedded wmHouseholdEmbed />
          )}
          {surfTab === 'alts' && typeof WmAltsStructuredUnifiedDesk === 'function' ? (
            <WmAltsStructuredUnifiedDesk navigate={navigate} clientId={clientId} />
          ) : surfTab === 'alts' ? (
            <div className="client-alts-embed">
              <AltsScreen clientView={false} />
            </div>
          ) : null}
          {surfTab === 'structured' && (
            <div className="client-structured-embed wm-structured-embed">
              <StructuredScreen clientView={false} />
            </div>
          )}
          {wmDrawerTab ? (
            <WmWorkspaceDrawer
              tabId={wmDrawerTab}
              title={workspaceTabLabel(wmDrawerTab)}
              onClose={closeWmDrawer}
              clientId={clientId}
              row={row}
              wrapNav={wrapNav}
              navigate={navigate}
              accountIds={accountIds}
              isClientRole={isClientRole}
            />
          ) : null}
          {askSlateOpen ? (
            <AskSlateWmDrawer
              row={row}
              onClose={() => setAskSlateOpen(false)}
            />
          ) : null}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {!isClientRole && (surfTab === 'overview' || surfTab === 'pulse') && (
            <ClientOverviewTabWM clientId={clientId} row={row} navigate={navigate} accountIds={accountIds} />
          )}
          {surfTab === 'portfolio' && (
            <HouseholdScreen navigate={wrapNav} accountIds={accountIds} portfolioBase={portfolioBase} embedded />
          )}
          {surfTab === 'insights' && (
            <InsightsScreen
              navigate={wrapNav}
              accountIds={accountIds}
              embedded
              clientView={isClientRole}
              bookInsightsMode={false}
              workspaceClientId={clientId}
            />
          )}
          {surfTab === 'events' && <ClientEventsTab />}
          {surfTab === 'documents' && <ClientDocumentsTab navigate={navigate} clientId={clientId} />}
          {surfTab === 'status' && <ClientStatusTab navigate={navigate} clientId={clientId} />}
          {surfTab === 'alts' && (
            <div className="client-alts-embed">
              <AltsScreen clientView={isClientRole} />
            </div>
          )}
          {surfTab === 'structured' && (
            <div className="client-structured-embed">
              <StructuredScreen clientView={isClientRole} />
            </div>
          )}
          {!isClientRole && surfTab === 'goals' && (
            <ClientGoalsTab clientId={clientId} row={row} />
          )}
          {!isClientRole && surfTab === 'messages' && (
            <ClientCommunicationTab clientId={clientId} row={row} />
          )}
          {surfTab === 'refresh' && <ClientRefreshTab navigate={navigate} clientId={clientId} clientName={row.name} />}
        </React.Fragment>
      )}
    </div>
  );
}

function ProductBuilderScreen({ navigate }) {
  const PB = (window.Slate.Copy && window.Slate.Copy.productBuilder) || {};
  const merged = getMergedClientBook().filter(r => r.demoFull || r.portfolioIngested !== false || r.aum !== 0 || r.isCustom);
  const titles = PB.stepTitles || ['Product details', 'Terms & structure', 'Eligibility & clients', 'Review & send'];
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState('Phoenix Barrier · income sleeve');
  const [ptype, setPtype] = React.useState('income');
  const [coupon, setCoupon] = React.useState('9.35');
  const [selected, setSelected] = React.useState(() => new Set(merged.filter(r => r.driftTone === 'warn').map(r => r.id)));
  const [optIn, setOptIn] = React.useState(
    PB.optInPlaceholder || 'Short opt-in framing for email…',
  );
  const [done, setDone] = React.useState(false);
  const toggle = id => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelected(n);
  };
  const nSel = selected.size;
  const bookAllocEst = fmt.money(nSel * 820_000, { compact: true });

  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(0, s - 1));

  if (done) {
    return (
      <div className="page wm-page wm-product-builder">
        <div className="card" style={{ padding: 32, maxWidth: 560 }}>
          <p className="slate-section-label mono" style={{ fontSize: 10 }}>{(titles[3] || '').toUpperCase()}</p>
          <h1 className="serif wm-pb-done-title">{PB.successTitle || 'Outreach queued'}</h1>
          <p className="text-2">{PB.successBody || ''}</p>
          <div className="row gap-10 mt-20" style={{ flexWrap: 'wrap' }}>
            <button type="button" className="btn ghost" onClick={() => navigate(PB.prevHash || 'clients/marchetti/alts')}>{PB.returnAlts || 'Return'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page wm-page wm-product-builder">
      <header className="page-header">
        <div>
          <p className="slate-section-label mono" style={{ fontSize: 10 }}>{PB.pageEyebrow || 'STRUCTURED PRODUCTS'}</p>
          <h1 className="serif">{PB.pageTitle || 'Product builder'}</h1>
          <p className="text-2 slate-body-copy" style={{ maxWidth: 640, marginTop: 8 }}>{PB.pageSubline || ''}</p>
        </div>
        <button type="button" className="btn ghost" onClick={() => navigate(PB.prevHash || 'clients/marchetti/alts')}>{PB.exit || 'Exit'}</button>
      </header>

      <div className="wm-pb-progress row gap-8" style={{ flexWrap: 'wrap', marginBottom: 20 }}>
        {titles.map((t, i) => (
          <span key={t} className={`wm-pb-step${i === step ? ' wm-pb-step--active' : ''}${i < step ? ' wm-pb-step--done' : ''}`}>
            <span className="mono text-3" style={{ fontSize: 11 }}>{i + 1}</span> {t}
          </span>
        ))}
      </div>

      <div className="card wm-pb-step-card" style={{ padding: 24 }}>
        {step === 0 && (
          <div className="stack stack-3">
            <p className="text-2">{PB.step1Lead || ''}</p>
            <div>
              <label className="modal-label" htmlFor="pb-name">{PB.productName || 'Name'}</label>
              <input id="pb-name" className="modal-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="modal-label" htmlFor="pb-type">{PB.productType || 'Type'}</label>
              <select id="pb-type" className="modal-input" value={ptype} onChange={e => setPtype(e.target.value)}>
                <option value="income">{PB.typeIncomeNote || 'Income note'}</option>
                <option value="ppn">{PB.typePrincipalProtected || 'Principal protected'}</option>
                <option value="autocall">{PB.typeAutocall || 'Autocall'}</option>
              </select>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="stack stack-3">
            {ptype === 'income' || ptype === 'autocall' ? (
              <div>
                <label className="modal-label">{PB.coupon || 'Coupon'}</label>
                <input className="modal-input" value={coupon} onChange={e => setCoupon(e.target.value)} />
              </div>
            ) : (
              <div>
                <label className="modal-label">{PB.barrier || 'Barrier'}</label>
                <input className="modal-input" defaultValue="82% european · memory" />
              </div>
            )}
            <div className="grid-2 modal-grid-2">
              <div>
                <label className="modal-label">{PB.tenor || 'Tenor'}</label>
                <input className="modal-input" defaultValue="3Y" />
              </div>
              <div>
                <label className="modal-label">{PB.currency || 'Currency'}</label>
                <input className="modal-input" defaultValue="USD" />
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="text-2 mb-12">{PB.eligibleLine || ''}</p>
            <div className="table-wrap">
              <table className="tbl wm-pb-client-tbl">
                <thead><tr><th /><th>Household</th><th>Type</th><th className="num">Book AUM</th></tr></thead>
                <tbody>
                  {merged.map(row => (
                    <tr key={row.id}>
                      <td>
                        <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} aria-label={`Select ${row.name}`} />
                        {row.reviewTone === 'warn' ? (
                          <span className="wm-pb-slate-chip text-3" style={{ marginLeft: 8, fontSize: 10 }}>{PB.suggestedBySlate || 'Slate'}</span>
                        ) : null}
                      </td>
                      <td className="slate-client-name">{row.name}</td>
                      <td><span className="tag">{row.familyType}</span></td>
                      <td className="num">{fmt.money(clientAum(row), { compact: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mono text-2 mt-12" style={{ fontSize: 13 }}>
              {typeof PB.bookSummarySelected === 'function' ? PB.bookSummarySelected(nSel, bookAllocEst) : `${nSel} clients · ~${bookAllocEst}`}
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="stack stack-3">
            <div className="card wm-dash-card-flat" style={{ padding: 16 }}>
              <p className="serif" style={{ fontSize: 16, fontWeight: 500, marginTop: 0 }}>{name}</p>
              <p className="text-3">{ptype} · {coupon}% · USD — factsheet attaches on send.</p>
            </div>
            <div>
              <p className="text-3 mb-8">{PB.reviewFactsheetLead || ''}</p>
              <button type="button" className="btn ghost sm">{PB.factsheetPreview || 'Factsheet preview'}</button>
            </div>
            <div>
              <label className="modal-label" htmlFor="pb-opt">{PB.composeOptIn || 'Opt-in note'}</label>
              <textarea id="pb-opt" rows={4} className="modal-input modal-textarea" value={optIn} onChange={e => setOptIn(e.target.value)} placeholder={PB.optInPlaceholder || ''} />
            </div>
          </div>
        )}

        <div className="row gap-10 mt-24 wm-pb-nav" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button type="button" className="btn ghost" onClick={prevStep} disabled={step <= 0}>{PB.back || 'Back'}</button>
          <div className="row gap-10" style={{ flexWrap: 'wrap' }}>
            {step < 3 ? (
              <button type="button" className="btn primary" onClick={nextStep}>{PB.next || 'Continue'}</button>
            ) : (
              <button type="button" className="btn primary" onClick={() => setDone(true)}>{typeof PB.sendCta === 'function' ? PB.sendCta(nSel) : `Send (${nSel})`}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function parseComplianceRoute(route) {
  const pathOnly = normalizeSlateRoute(route).split('?')[0];
  if (pathOnly === 'compliance' || pathOnly === 'compliance/inbox') {
    return { kind: 'complianceList' };
  }
  if (!pathOnly.startsWith('compliance/')) return null;
  const segs = pathOnly.slice('compliance/'.length).split('/').filter(Boolean);
  if (segs.length === 0) return { kind: 'complianceList' };
  const head = segs[0];
  if (COMPLIANCE_ROUTE_RESERVED.has(head)) {
    if (head === 'inbox') return { kind: 'complianceList' };
    if (head === 'clients') return { kind: 'complianceClients' };
    if (head === 'pipeline') return { kind: 'compliancePipeline' };
    if (head === 'expiring') return { kind: 'complianceExpiring' };
    if (head === 'documents') return { kind: 'complianceDocuments' };
  }
  return { kind: 'complianceDetail', clientId: head };
}

function parseClientRoute(route) {
  const normRaw = normalizeSlateRoute(route);
  const qIx = normRaw.indexOf('?');
  const pathOnly = (qIx >= 0 ? normRaw.slice(0, qIx) : normRaw).replace(/^\/+/, '');
  const qsRaw = qIx >= 0 ? normRaw.slice(qIx + 1) : '';
  const qp = qsRaw ? new URLSearchParams(qsRaw) : new URLSearchParams();
  const drawerFromQuery = qp.get('drawer');
  const role = getDemoRole();

  if (pathOnly === 'insights') return { kind: 'bookInsights' };
  const bookInsightDetail = pathOnly.match(/^insights\/([^/]+)$/);
  if (bookInsightDetail) return { kind: 'bookInsightDetail', insightId: bookInsightDetail[1] };

  if (pathOnly === 'clients') return { kind: 'list' };
  if (!pathOnly.startsWith('clients/')) return null;
  const segs = pathOnly.split('/').filter(Boolean);
  if (segs.length < 2) return { kind: 'list' };
  const id = segs[1];

  const ws = (workspaceTab, wmDrawerTab = null) => ({
    kind: 'workspace',
    clientId: id,
    workspaceTab,
    wmDrawerTab,
  });

  const drawerFiltered = drawerFromQuery && WM_LEGACY_DRAWER_TABS.has(drawerFromQuery) ? drawerFromQuery : null;

  const Store = window.Slate.ClientStore;
  const wmPendingIntakeClient = (() => {
    try {
      const c = Store && Store.get(id);
      return !!(c && c.isCustom && !c.portfolioIngested);
    } catch (e) {
      return false;
    }
  })();

  if (segs.length === 2) {
    if (role === 'wm') {
      if (wmPendingIntakeClient) return ws('portfolio', drawerFiltered);
      return ws('pulse', drawerFiltered);
    }
    return ws('portfolio', drawerFiltered);
  }

  const third = segs[2];
  if (third === 'holding' && segs[3]) return { kind: 'holding', clientId: id, symbol: decodeURIComponent(segs[3]) };
  if (third === 'insights' && segs[3]) return { kind: 'insightDetail', clientId: id, insightId: segs[3] };

  if (role !== 'wm') {
    if (third === 'portfolio') return ws('portfolio', drawerFiltered);
    if (WORKSPACE_TABS.some(t => t.id === third)) return ws(third, drawerFiltered);
    if (third === 'pulse') return ws('portfolio', drawerFiltered);
    return ws('portfolio', null);
  }

  // WM — new household intake: full workspace tabs on the surface (matches member-style shell).
  if (wmPendingIntakeClient) {
    if (third === 'pulse' || third === 'overview') return ws('portfolio', drawerFiltered);
    if (third === 'portfolio') return ws('portfolio', drawerFiltered);
    if (third === 'structured') return ws('structured', null);
    if (third === 'alts') return ws('alts', null);
    if (WORKSPACE_TABS.some(t => t.id === third)) return ws(third, null);
    return ws('portfolio', null);
  }

  // WM persona — pulse / portfolio / alts / structured (desk RFQ is its own surface)
  if (third === 'portfolio') return ws('portfolio', drawerFiltered);
  if (third === 'pulse' || third === 'overview') return ws('pulse', drawerFiltered);
  if (third === 'structured') return ws('structured', null);
  if (third === 'alts') return ws('alts', null);

  if (WM_LEGACY_DRAWER_TABS.has(third)) return ws('pulse', third);

  if (WORKSPACE_TABS.some(t => t.id === third)) {
    return ws('pulse', third === 'portfolio' ? null : third);
  }

  return ws('pulse', null);
}

window.Slate.Book = {
  RolePickerScreen,
  ClientDashboardScreen,
  ComplianceHomeScreen,
  ComplianceClientsDirectoryScreen,
  CompliancePipelineScreen,
  ComplianceExpiringScreen,
  ComplianceDocumentsScreen,
  ComplianceClientScreen,
  DashboardScreen,
  AltsBookGlobalScreen,
  ClientListScreen,
  ProductBuilderScreen,
  ClientWorkspaceScreen,
  ClientEventsTab,
  clientScopedNavigate,
  normalizeSlateRoute,
  parseClientRoute,
  parseComplianceRoute,
  WORKSPACE_TABS,
  WORKSPACE_PORTFOLIO_TABS,
  WM_CLIENT_WORKSPACE_STRIP,
  SLATE_POST_REVIEW_HASH_KEY,
  SLATE_DEMO_AFTER_INTAKE_HASH,
  SLATE_DEMO_ROLE_KEY,
  clearSlateIntakeLandingPrefs,
  startClientPortfolioIntake,
  resolveBookRow,
  getMergedClientBook,
  wmHouseholdLanding,
  deriveBookWmPulseMetrics,
  deriveBookEngagementFromMerged,
  illustrativeNnmSplit,
  getDemoRole,
  setDemoRole,
  clearDemoRole,
  guardRouteForRole,
  getSidebarNavForRole,
  getSidebarProfileForRole,
  buildClientPerformanceComparisonSeries,
  getClientChartXAxisTicks,
  CLIENT_CHART_RANGES,
  CLIENT_CHART_LABELS,
  CLIENT_CHART_TRAILING_LABEL,
  seriesPctChange,
};
