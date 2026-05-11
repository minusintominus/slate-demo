<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Bar, Button, Card, DataTable, Kpi, KpiStrip, Page, PageHeader, Section, Tabs, Tag } from '../../components/ui/index.js';
  import { Icons } from '../../components/ui/icons.js';
  import {
    CLIENT_BOOK,
    HOUSEHOLD,
    INSIGHTS_BY_CLIENT,
    SP_BOOK
  } from '../../data/fixtures.js';
  import { accountsFor, altCashflowFor, householdCashflowFor, positionsFor } from '../../domain/book.js';
  import { money, pct, sum, titleCase } from '../../domain/format.js';

  // ── Display labels and IPS targets per asset class ──────────────────
  const ASSET_LABELS = {
    us_equity: 'US Equity',
    intl_equity: 'International Equity',
    em_equity: 'EM Equity',
    fixed_income: 'Fixed Income',
    munis: 'Municipals',
    alts: 'Alternatives',
    structured: 'Structured Products',
    cash: 'Cash & MMF',
    private: 'Private Equity',
    hedge: 'Hedge Funds',
    real_assets: 'Real Assets'
  };
  const IPS_TARGETS = {
    us_equity: 30, intl_equity: 12, em_equity: 5,
    fixed_income: 22, munis: 8, alts: 12, structured: 5,
    cash: 4, private: 6, hedge: 2, real_assets: 4
  };
  const DONUT_COLORS = ['var(--ink)', 'var(--accent)', 'var(--ink-3)', 'var(--ink-4)', 'var(--pos)', 'var(--warn)', 'var(--neg)', '#a08aff', '#5b3acc', '#6b6963'];

  // ── Performance series (deterministic monthly walks) ────────────────
  const monthlyPath = (start, drift, vol, seed = 1) => {
    let v = start;
    const out = [v];
    for (let i = 0; i < 36; i++) {
      const r = (Math.sin(i * 1.7 + seed) + Math.cos(i * 0.6 + seed * 2)) * vol + drift;
      v *= 1 + r / 100;
      out.push(v);
    }
    return out;
  };

  // Drift / vol / display label for each per-client benchmark token. Equity
  // tickers carry typical equity vol; fixed-return targets are smooth lines.
  const BENCHMARK_PARAMS = {
    'SPX':         { drift: 0.55, vol: 1.2,  label: 'S&P 500' },
    'QQQ':         { drift: 0.78, vol: 1.7,  label: 'Nasdaq-100' },
    '7%':          { drift: 0.565, vol: 0.05, label: '7% target' },
    '12%':         { drift: 0.949, vol: 0.05, label: '12% target' },
    'T-bills +2%': { drift: 0.42, vol: 0.05, label: 'T-bills + 2%' },
    '60/40':       { drift: 0.45, vol: 0.9,  label: '60/40 benchmark' }
  };

  // SVG path helper for line / sparkline charts.
  const linePath = (points, w, h, padX = 0, padY = 4) => {
    let min = Infinity, max = -Infinity;
    for (const p of points) { if (p < min) min = p; if (p > max) max = p; }
    const range = max - min || 1;
    return points
      .map((p, i) => {
        const x = padX + (i / (points.length - 1)) * (w - 2 * padX);
        const y = padY + (1 - (p - min) / range) * (h - 2 * padY);
        return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
      })
      .join(' ');
  };

  // Performance chart geometry. The chart shares a Y scale across every
  // visible series so they all start at the same point ($10,000) and
  // remain directly comparable, and reserves padding for $-axis labels
  // on the left and date labels along the bottom.
  const PERF = { w: 720, h: 240, padLeft: 56, padRight: 8, padTop: 12, padBottom: 28 };
  const perfX = (i, n) =>
    PERF.padLeft + (i / (n - 1)) * (PERF.w - PERF.padLeft - PERF.padRight);
  const perfY = (val, yMin, yMax) => {
    const range = yMax - yMin || 1;
    return PERF.padTop + (1 - (val - yMin) / range) * (PERF.h - PERF.padTop - PERF.padBottom);
  };
  const perfLine = (points, yMin, yMax) =>
    points
      .map((p, i) => (i === 0 ? 'M' : 'L') + perfX(i, points.length).toFixed(1) + ',' + perfY(p, yMin, yMax).toFixed(1))
      .join(' ');
  // Round a raw step up to the nearest 1/2/5 × 10^n — gives nice round
  // gridlines like $1k / $2k / $5k.
  const niceStep = (rawStep) => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(1, rawStep))));
    const n = rawStep / magnitude;
    if (n < 1.5) return 1 * magnitude;
    if (n < 3) return 2 * magnitude;
    if (n < 7) return 5 * magnitude;
    return 10 * magnitude;
  };
  const fmtPerfAxis = (n) => '$' + Math.round(n).toLocaleString('en-US');

  // SVG donut wedge — outer arc + inner arc + close.
  const donutArc = (radius, inner, startA, endA) => {
    const cx = radius, cy = radius;
    const x1 = cx + radius * Math.cos(startA), y1 = cy + radius * Math.sin(startA);
    const x2 = cx + radius * Math.cos(endA), y2 = cy + radius * Math.sin(endA);
    const x3 = cx + inner * Math.cos(endA), y3 = cy + inner * Math.sin(endA);
    const x4 = cx + inner * Math.cos(startA), y4 = cy + inner * Math.sin(startA);
    const large = endA - startA > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${radius},${radius} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 ${large} 0 ${x4},${y4} Z`;
  };

  let { client = null, accountIds = [], navigate = () => {}, embedded = false } = $props();
  const householdName = $derived(client?.name || HOUSEHOLD.name);
  const householdId = $derived(client?.id || HOUSEHOLD.id);

  const tabs = [
    ['summary', 'Summary'],
    ['holdings', 'Holdings'],
    ['diversification', 'Diversification'],
    ['accounts', 'Accounts'],
    ['custodians', 'Custodians'],
    ['cashflow', 'Cashflow']
  ];

  // Sub-tab is URL-driven (?tab=…) in both embedded (workspace) and
  // standalone (meet) views — refreshes preserve the active tab.
  const tab = $derived.by(() => {
    const q = page.url.searchParams.get('tab');
    return q && tabs.some(([id]) => id === q) ? q : 'summary';
  });

  const onSelectTab = (id) => {
    const url = new URL(page.url);
    if (id === 'summary') url.searchParams.delete('tab');
    else url.searchParams.set('tab', id);
    goto(url.pathname + url.search, { replaceState: false, keepFocus: true });
  };
  const allPositions = $derived(positionsFor(householdId));
  const accounts = $derived(accountsFor(householdId));
  const cashflowSeries = $derived(householdCashflowFor(householdId));
  const positions = $derived(accountIds.length ? allPositions.filter((p) => accountIds.includes(p.account)) : allPositions);
  const total = $derived(sum(positions, (p) => p.mv));
  const basis = $derived(sum(positions, (p) => p.cost || p.mv));
  const gain = $derived(total - basis);
  const cash = $derived(sum(positions.filter((p) => p.assetClass === 'cash'), (p) => p.mv));

  // Advisory / non-advisory split from the household's CLIENT_BOOK row.
  const householdRow = $derived(CLIENT_BOOK.find((c) => c.id === householdId));
  const advisoryFrac = $derived(householdRow?.aumAdvisoryFrac ?? 1);
  const clientInsights = $derived(INSIGHTS_BY_CLIENT[householdId] || []);
  const aumAdvisory = $derived(total * advisoryFrac);
  const aumNonAdvisory = $derived(total * (1 - advisoryFrac));
  const hasNonAdvisory = $derived(advisoryFrac < 1);

  // Per-client performance walks. Advisory drift is seeded from the
  // household's YTD return so different clients have distinct curves; the
  // non-advisory line uses a lower-drift, lower-vol walk (typical of
  // held-away or unmanaged sleeves).
  const advisoryDrift = $derived(0.45 + (householdRow?.ytdAdvisoryPct ?? 0.04) * 5);
  const nonAdvisoryDrift = $derived(0.30 + (householdRow?.ytdNonAdvisoryPct ?? 0.025) * 5);
  const benchmarkParams = $derived(
    BENCHMARK_PARAMS[householdRow?.benchmark || HOUSEHOLD.benchmark] || BENCHMARK_PARAMS['60/40']
  );
  // Hypothetical "growth of $10,000" — every series starts at the same
  // dollar baseline so the lines are directly comparable on a shared
  // Y axis.
  const advisoryPath = $derived(monthlyPath(10000, advisoryDrift, 1.4, 1));
  const nonAdvisoryPath = $derived(monthlyPath(10000, nonAdvisoryDrift, 0.7, 5));
  const benchmarkPath = $derived(monthlyPath(10000, benchmarkParams.drift, benchmarkParams.vol, 3));

  // Series visibility toggles — clicking a legend item flips it.
  let showAdvisory = $state(true);
  let showNonAdvisory = $state(true);
  let showBenchmark = $state(true);

  // Active period for the performance chart. Drives the X slice + axis
  // labels. YTD = months elapsed in the current calendar year.
  const PERF_RANGES = ['1M', '3M', 'YTD', '1Y', '3Y', 'All'];
  let perfRange = $state('YTD');
  const perfMonthsBack = $derived.by(() => {
    if (perfRange === '1M') return 1;
    if (perfRange === '3M') return 3;
    if (perfRange === 'YTD') return Math.max(1, new Date().getMonth() + 1);
    if (perfRange === '1Y') return 12;
    return 36; // 3Y / All
  });

  // Slice the last N+1 points from a 37-point monthly walk and re-base
  // it to $10,000 at the new starting point so every period chart shows
  // a true "growth of $10,000" from that period's start.
  const sliceAndRebase = (path, monthsBack) => {
    const startIdx = Math.max(0, path.length - 1 - monthsBack);
    const slice = path.slice(startIdx);
    const base = slice[0] || 1;
    return slice.map((v) => (v / base) * 10000);
  };
  const advisoryViewPath = $derived(sliceAndRebase(advisoryPath, perfMonthsBack));
  const nonAdvisoryViewPath = $derived(sliceAndRebase(nonAdvisoryPath, perfMonthsBack));
  const benchmarkViewPath = $derived(sliceAndRebase(benchmarkPath, perfMonthsBack));

  // Shared Y scale across whichever series are toggled on. The $10,000
  // baseline is always pinned in range so the starting tick anchors the
  // chart even if every line drifts upward.
  const performanceScale = $derived.by(() => {
    const series = [];
    if (showAdvisory) series.push(advisoryViewPath);
    if (showNonAdvisory && hasNonAdvisory) series.push(nonAdvisoryViewPath);
    if (showBenchmark) series.push(benchmarkViewPath);
    let min = 10000, max = 10000;
    for (const s of series) {
      for (const p of s) {
        if (p < min) min = p;
        if (p > max) max = p;
      }
    }
    if (min === max) max = min + 1000;
    const step = niceStep((max - min) / 4);
    const niceMin = Math.floor(min / step) * step;
    const niceMax = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = niceMin; v <= niceMax + 1e-6; v += step) ticks.push(v);
    return { yMin: niceMin, yMax: niceMax, ticks };
  });

  // ~4 evenly-spaced X labels covering the active range, formatted as
  // "Mon YY". Counts back from today so labels track whatever range the
  // user picked (YTD shows months in the current year, 3Y shows years).
  // Anchors the first label to the left and the last to the right so
  // they don't clip past the SVG viewBox.
  const performanceXLabels = $derived.by(() => {
    const now = new Date();
    const totalPoints = perfMonthsBack + 1;
    const labelCount = Math.min(4, totalPoints);
    const out = [];
    for (let i = 0; i < labelCount; i++) {
      const monthIdx = Math.round((i * (totalPoints - 1)) / (labelCount - 1));
      const monthsAgo = perfMonthsBack - monthIdx;
      const d = new Date(now);
      d.setMonth(d.getMonth() - monthsAgo);
      out.push({
        monthIdx,
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        anchor: i === 0 ? 'start' : i === labelCount - 1 ? 'end' : 'middle'
      });
    }
    return out;
  });

  // Period stats track the advisory line — that's the line under management.
  const fmtPctSigned = (v) => (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
  const periodStats = $derived.by(() => {
    const ytd = (householdRow?.ytdAdvisoryPct ?? 0.0327) * 100;
    const m1 = ytd / 4; // YTD over a few months → rough 1M
    const y1 = ytd * 2.2; // YTD scaled forward to a 12-month figure
    const y3 = ytd * 1.7; // 3-yr annualized — slightly below 1y
    return [
      ['1M', fmtPctSigned(m1)],
      ['YTD', fmtPctSigned(ytd)],
      ['1Y', fmtPctSigned(y1)],
      ['3Y ann.', fmtPctSigned(y3)]
    ];
  });
  // ── Cashflow tab data ───────────────────────────────────────────────
  // Source definitions (color, sign, confidence) drive the stacked chart,
  // legend, and drilldown. Confidence: high = contractual/scheduled,
  // med = rate-/market-sensitive, low = depends on actual exit events.
  const HCF_SOURCES = [
    { key: 'dividends',         label: 'Equity dividends',           color: 'var(--ink)',    sign: 'in',  conf: 'med' },
    { key: 'bondCoupons',       label: 'Bond coupons',               color: 'var(--ink-2)',  sign: 'in',  conf: 'high' },
    { key: 'structuredCoupons', label: 'Structured product coupons', color: 'var(--ink-3)',  sign: 'in',  conf: 'med' },
    { key: 'cashInterest',      label: 'MMF / cash interest',        color: 'var(--ink-4)',  sign: 'in',  conf: 'med' },
    { key: 'altDistributions',  label: 'Alt distributions',          color: 'var(--pos)',    sign: 'in',  conf: 'low' },
    { key: 'altCalls',          label: 'Capital calls (alts)',       color: 'var(--neg)',    sign: 'out', conf: 'med' },
    { key: 'fees',              label: 'Investment fees',            color: 'var(--warn)',   sign: 'out', conf: 'high' },
    { key: 'taxes',             label: 'Estimated taxes',            color: 'var(--accent)', sign: 'out', conf: 'high' },
    { key: 'lifestyle',         label: 'Lifestyle withdrawals',      color: 'var(--ink-3)',  sign: 'out', conf: 'med' }
  ];
  const HCF_IN = HCF_SOURCES.filter((s) => s.sign === 'in');
  const HCF_OUT = HCF_SOURCES.filter((s) => s.sign === 'out');
  // How each source is attributed across the household's legal entities —
  // answers "which entity funds what?" in the per-entity rollup below.
  const HCF_SOURCE_ENTITY_SPLIT = {
    dividends:         { 'schwab-joint': 0.55, 'fidelity-roth': 0.40, 'pershing-trust': 0.05 },
    bondCoupons:       { 'pershing-trust': 1.00 },
    structuredCoupons: { 'pershing-trust': 0.41, 'schwab-joint': 0.59 },
    cashInterest:      { 'schwab-joint': 0.45, 'fidelity-roth': 0.04, 'pershing-trust': 0.51 },
    altDistributions:  { 'jpm-alts':       1.00 },
    altCalls:          { 'jpm-alts':       1.00 },
    fees:              { 'jpm-alts': 0.40, 'schwab-joint': 0.30, 'pershing-trust': 0.20, 'fidelity-roth': 0.10 },
    taxes:             { 'schwab-joint': 0.70, 'pershing-trust': 0.30 },
    lifestyle:         { 'schwab-joint': 1.00 }
  };
  const cashflowSourceContext = (key, q, value, altCf) => {
    if (key === 'altCalls' || key === 'altDistributions') {
      const ac = altCf.find((c) => c.q === q);
      return ac ? ac.notes : null;
    }
    if (key === 'bondCoupons') {
      const qNum = parseInt(q.slice(-1), 10);
      return qNum === 1 || qNum === 3
        ? 'UST 4.5% (Feb/Aug) + NY muni 5% (Jan/Jul)'
        : 'UST 4.25% (May/Nov) + CA muni 4% (Apr/Oct)';
    }
    if (key === 'structuredCoupons' && value > 0) {
      if (q === '2026Q3' || q === '2026Q4') return 'sp1 SPX Buffer ($30k) + sp3 AAPL Rev. Conv. ($43.5k)';
      if (q === '2027Q1') return 'sp1 SPX Buffer final coupon · sp3 matured Nov 2026';
      return null;
    }
    if (key === 'taxes' && value < 0) {
      if (q === '2027Q1' || q === '2028Q1') return 'April 15 prior-year settlement + Q1 federal estimate';
      return 'Federal quarterly estimate';
    }
    if (key === 'lifestyle') return 'Family withdrawals (~$2M/yr run-rate)';
    if (key === 'fees') return 'Pine Ridge II 1.75% mgmt + household advisory';
    if (key === 'cashInterest') return 'MMF + sweep on ~$11M idle cash';
    if (key === 'dividends') return 'US + Intl equity (~1.6% blended yield)';
    return null;
  };

  // Scenario toggles + selected quarter for the drilldown.
  let exitSlips = $state(false);
  let wedding = $state(false);
  let trustGift = $state(false);
  let selectedQ = $state(null);

  const altCashflow = $derived(altCashflowFor(householdId));
  const cashPositions = $derived(positions.filter((p) => p.assetClass === 'cash'));
  const startCash = $derived(sum(cashPositions, (p) => p.mv));

  // Apply scenarios on top of the base forecast.
  const cf = $derived.by(() => {
    const out = cashflowSeries.map((d) => ({ ...d }));
    if (exitSlips) {
      const q4 = out.find((c) => c.q === '2027Q4');
      const q2 = out.find((c) => c.q === '2028Q2');
      if (q4 && q2) { q2.altDistributions += 7000000; q4.altDistributions -= 7000000; }
    }
    if (wedding) {
      const q = out.find((c) => c.q === '2027Q2');
      if (q) q.lifestyle -= 1500000;
    }
    if (trustGift) {
      const q = out.find((c) => c.q === '2028Q1');
      if (q) q.lifestyle -= 2000000;
    }
    return out;
  });
  const cfRows = $derived(cf.map((d) => {
    const inflows = HCF_IN.reduce((a, s) => a + (d[s.key] || 0), 0);
    const outflows = HCF_OUT.reduce((a, s) => a + (d[s.key] || 0), 0);
    return { ...d, inflows, outflows, net: inflows + outflows };
  }));
  const balancePath = $derived.by(() => {
    let bal = startCash;
    return [startCash, ...cfRows.map((r) => { bal += r.net; return bal; })];
  });
  const monthsCovered = $derived.by(() => {
    const burn = Math.abs(cfRows.slice(0, 4).reduce((a, r) => a + r.net, 0)) / 12;
    return burn > 0 ? startCash / burn : 99;
  });
  const annualInflows = $derived(cfRows.reduce((a, r) => a + r.inflows, 0) / 2);
  const annualOutflows = $derived(Math.abs(cfRows.reduce((a, r) => a + r.outflows, 0)) / 2);
  const minBalance = $derived(Math.min(...balancePath));
  const minBalanceIdx = $derived(balancePath.indexOf(minBalance));
  const minBalanceQ = $derived(minBalanceIdx === 0 ? 'today' : (cf[minBalanceIdx - 1] || {}).q);
  const lowCashFlag = $derived(minBalance < 3_000_000);
  const anyScenario = $derived(exitSlips || wedding || trustGift);
  const scenarioDelta = $derived.by(() => {
    let baseBal = startCash, baseMin = startCash;
    for (const d of cashflowSeries) {
      const inS = HCF_IN.reduce((a, s) => a + (d[s.key] || 0), 0);
      const outS = HCF_OUT.reduce((a, s) => a + (d[s.key] || 0), 0);
      baseBal += inS + outS;
      if (baseBal < baseMin) baseMin = baseBal;
    }
    return minBalance - baseMin;
  });
  const selectedRow = $derived(cfRows.find((r) => r.q === (selectedQ ?? cfRows[0]?.q)));
  const effectiveSelectedQ = $derived(selectedRow?.q);

  const entityRollup = (entityId) => {
    let inflows = 0, outflows = 0;
    const sourceTotals = {};
    for (const d of cf) {
      for (const s of HCF_SOURCES) {
        const ratio = (HCF_SOURCE_ENTITY_SPLIT[s.key] || {})[entityId] || 0;
        if (ratio === 0) continue;
        const v = (d[s.key] || 0) * ratio;
        sourceTotals[s.key] = (sourceTotals[s.key] || 0) + v;
        if (s.sign === 'in') inflows += v; else outflows += v;
      }
    }
    const top = (sign) => Object.entries(sourceTotals)
      .filter(([k]) => HCF_SOURCES.find((s) => s.key === k).sign === sign)
      .filter(([, v]) => Math.abs(v) > 1)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 2)
      .map(([k, v]) => ({ src: HCF_SOURCES.find((s) => s.key === k), value: v }));
    return { inflows, outflows, net: inflows + outflows, topIn: top('in'), topOut: top('out') };
  };

  // Stacked cashflow chart geometry.
  const stackedChart = $derived.by(() => {
    const w = 720, h = 300;
    const pad = { l: 60, r: 8, t: 14, b: 28 };
    const totalIn = (d) => HCF_IN.reduce((a, s) => a + (d[s.key] || 0), 0);
    const totalOut = (d) => Math.abs(HCF_OUT.reduce((a, s) => a + (d[s.key] || 0), 0));
    const maxAbs = Math.max(...cf.map(totalIn), ...cf.map(totalOut)) || 1;
    const yScale = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v + maxAbs) / (2 * maxAbs));
    const zeroY = yScale(0);
    const stepX = (w - pad.l - pad.r) / cf.length;
    const barW = stepX * 0.55;

    const bars = [];
    cf.forEach((d, i) => {
      const cx = pad.l + (i + 0.5) * stepX;
      let posOff = 0, negOff = 0;
      HCF_IN.forEach((s) => {
        const val = d[s.key] || 0;
        if (val <= 0) return;
        const bh = (val / maxAbs) * (h - pad.t - pad.b) / 2;
        const y = zeroY - posOff - bh;
        posOff += bh;
        bars.push({ x: cx - barW / 2, y, w: barW, h: bh, fill: s.color, title: `${d.q} · ${s.label}: +${money(val, { compact: true })}` });
      });
      HCF_OUT.forEach((s) => {
        const val = d[s.key] || 0;
        if (val >= 0) return;
        const bh = (Math.abs(val) / maxAbs) * (h - pad.t - pad.b) / 2;
        const y = zeroY + negOff;
        negOff += bh;
        bars.push({ x: cx - barW / 2, y, w: barW, h: bh, fill: s.color, title: `${d.q} · ${s.label}: ${money(val, { compact: true })}` });
      });
    });

    const gridlines = [-1, -0.5, 0, 0.5, 1].map((t) => ({
      y: yScale(t * maxAbs),
      label: t === 0 ? null : (t >= 0 ? '+' : '') + (t * maxAbs / 1e6).toFixed(1) + 'M',
      isZero: t === 0
    }));
    const qLabels = cf.map((d, i) => ({ x: pad.l + (i + 0.5) * stepX, q: d.q }));
    return { w, h, bars, gridlines, qLabels, axisLeft: pad.l, axisRight: w - pad.r, axisBottom: h - 12 };
  });

  // Cash balance line chart geometry.
  const balanceChart = $derived.by(() => {
    const w = 800, h = 180;
    const pad = { l: 8, r: 8, t: 14, b: 22 };
    const mn = Math.min(...balancePath);
    const mx = Math.max(...balancePath);
    const range = mx - mn || 1;
    const stepX = (w - pad.l - pad.r) / (balancePath.length - 1);
    const yPx = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - mn) / range);
    const path = balancePath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pad.l + i * stepX} ${yPx(p)}`).join(' ');
    const gridlines = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: pad.t + (h - pad.t - pad.b) * t,
      isAxis: t === 1
    }));
    return { w, h, path, gridlines, axisLeft: pad.l, axisRight: w - pad.r };
  });

  const confLabel = (conf) => conf === 'high'
    ? 'Contractual / scheduled — high confidence'
    : conf === 'med'
      ? 'Rate- or market-sensitive — medium confidence'
      : 'Depends on actual exit events — low confidence (GP estimate)';

  const byAsset = $derived(Object.entries(
    positions.reduce((acc, position) => {
      acc[position.assetClass] = (acc[position.assetClass] || 0) + position.mv;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]));
  const bySector = $derived(Object.entries(
    positions.reduce((acc, position) => {
      acc[position.sector] = (acc[position.sector] || 0) + position.mv;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 10));
  const holdings = $derived([...positions].sort((a, b) => b.mv - a.mv));

  // ── Holdings tab — search / filter / sort ────────────────────────────
  let holdingsQuery = $state('');
  // Multi-select asset class filter — empty array means "All classes".
  let holdingsClassFilter = $state([]);
  const toggleClassFilter = (k) => {
    holdingsClassFilter = holdingsClassFilter.includes(k)
      ? holdingsClassFilter.filter((x) => x !== k)
      : [...holdingsClassFilter, k];
  };
  let holdingsSortKey = $state('mv');
  let holdingsSortDir = $state('desc');
  const setHoldingsSort = (k) => {
    if (holdingsSortKey === k) holdingsSortDir = holdingsSortDir === 'asc' ? 'desc' : 'asc';
    else { holdingsSortKey = k; holdingsSortDir = 'desc'; }
  };
  const HOLDINGS_FILTER_CLASSES = ['us_equity', 'intl_equity', 'em_equity', 'fixed_income', 'munis', 'alts', 'structured'];
  // 'alts' filter matches both legacy 'alternative' and 'alts' assetClass strings.
  const FILTER_CLASS_MATCH = {
    alts: ['alts', 'alternative'],
    structured: ['structured']
  };
  // Structured-product holdings come from SP_BOOK rather than per-client
  // POSITIONS — synthesize them as position-shaped rows so the Holdings
  // table can show them alongside equities, FI, etc.
  const NOTE_OWNER = { sp1: 'marchetti', sp2: 'whitmore', sp3: 'sato' };
  const structuredHoldings = $derived(
    SP_BOOK
      .filter((n) => NOTE_OWNER[n.id] === householdId)
      .map((n) => ({
        id: 'sp-' + n.id,
        symbol: n.id.toUpperCase(),
        name: n.name,
        account: n.account,
        cusip: '—',
        qty: null,
        price: null,
        mv: n.mtm,
        cost: n.notional,
        assetClass: 'structured',
        sector: n.issuer,
        flag: null
      }))
  );
  const holdingsPositions = $derived([...positions, ...structuredHoldings]);
  const holdingsRows = $derived.by(() => {
    const t = total + structuredHoldings.reduce((a, p) => a + p.mv, 0) || 1;
    let rows = holdingsPositions.map((p) => ({
      ...p,
      pctNW: (p.mv / t) * 100,
      unreal: p.mv - p.cost,
      unrealPct: p.cost ? ((p.mv - p.cost) / p.cost) * 100 : 0
    }));
    if (holdingsClassFilter.length > 0) {
      const allowed = new Set(
        holdingsClassFilter.flatMap((k) => FILTER_CLASS_MATCH[k] || [k])
      );
      rows = rows.filter((p) => allowed.has(p.assetClass));
    }
    const q = holdingsQuery.trim().toLowerCase();
    if (q) rows = rows.filter((p) => `${p.symbol} ${p.name}`.toLowerCase().includes(q));
    const dir = holdingsSortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[holdingsSortKey], bv = b[holdingsSortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
    });
    return rows;
  });
  const holdingsScopeTotal = $derived(holdingsRows.reduce((a, r) => a + r.mv, 0));

  // ── Diversification tab — single-name caps + equity sector breakdown ──
  // Top 10 non-cash positions by % of in-scope total, used to flag any name
  // breaching the IPS 7% concentration limit.
  const singleNameCaps = $derived.by(() => {
    const t = total || 1;
    return positions
      .filter((p) => p.assetClass !== 'cash')
      .map((p) => ({ ...p, pctNW: (p.mv / t) * 100 }))
      .sort((a, b) => b.pctNW - a.pctNW)
      .slice(0, 10);
  });
  // Equity sector breakdown — across US + International equity sleeves only.
  const equitySectors = $derived.by(() => {
    const eq = positions.filter((p) => p.assetClass === 'us_equity' || p.assetClass === 'intl_equity');
    const t = sum(eq, (p) => p.mv) || 1;
    const map = {};
    for (const p of eq) map[p.sector] = (map[p.sector] || 0) + p.mv;
    return Object.entries(map)
      .map(([sector, mv]) => ({ sector, mv, pct: (mv / t) * 100 }))
      .sort((a, b) => b.mv - a.mv);
  });
  const GEO_MIX = [
    { label: 'United States',  pct: 71, color: 'var(--ink)' },
    { label: 'Developed Intl', pct:  8, color: 'var(--ink-3)' },
    { label: 'Emerging Mkts',  pct:  9, color: 'var(--accent)' },
    { label: 'Multi-region',   pct: 12, color: 'var(--ink-4)' }
  ];

  // Donut wedges for the equity sector chart.
  const sectorDonutWedges = $derived.by(() => {
    let angle = -Math.PI / 2;
    return equitySectors.map((s, i) => {
      const sweep = (s.pct / 100) * 2 * Math.PI;
      const path = donutArc(75, 50, angle, angle + sweep);
      angle += sweep;
      return { ...s, path, color: DONUT_COLORS[i % DONUT_COLORS.length] };
    });
  });

  // ── Accounts tab — full per-account totals with cost / unrealized ────
  const accountCards = $derived.by(() => {
    const inScope = accounts;
    const filteredTotal = inScope.reduce((acc, a) => {
      const ps = positions.filter((p) => p.account === a.id);
      return acc + sum(ps, (p) => p.mv);
    }, 0) || 1;
    return inScope.map((a, i) => {
      const ps = positions.filter((p) => p.account === a.id);
      const mv = sum(ps, (p) => p.mv);
      const cost = sum(ps, (p) => p.cost || p.mv);
      return {
        ...a,
        positions: ps.length,
        mv,
        cost,
        unreal: mv - cost,
        pctScope: (mv / filteredTotal) * 100,
        spark: monthlyPath(100, 0.4 + i * 0.1, 1.2, i + 5)
      };
    });
  });
  const accountsScopeTotal = $derived(sum(accountCards, (a) => a.mv));

  // Custodian-level rollup — aggregate all in-scope accounts under their
  // custodian so the wealth manager can see counterparty concentration
  // and which accounts sit at each custodian.
  const custodianCards = $derived.by(() => {
    const map = new Map();
    for (const a of accountCards) {
      const key = a.custodian || '—';
      if (!map.has(key)) {
        map.set(key, { custodian: key, accounts: [], mv: 0, cost: 0, positions: 0 });
      }
      const c = map.get(key);
      c.accounts.push(a);
      c.mv += a.mv;
      c.cost += a.cost;
      c.positions += a.positions;
    }
    const total = accountsScopeTotal || 1;
    return [...map.values()]
      .map((c) => ({
        ...c,
        unreal: c.mv - c.cost,
        pctScope: (c.mv / total) * 100
      }))
      .sort((a, b) => b.mv - a.mv);
  });

  // SVG path for the small account spark line. 100 points → 100×40 viewBox.
  const sparkPath = (points, w = 100, h = 40) => {
    const mn = Math.min(...points), mx = Math.max(...points);
    const r = mx - mn || 1;
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (points.length - 1)) * w} ${h - ((p - mn) / r) * h * 0.9 - 1}`)
      .join(' ');
  };
  const sparkArea = (points, w = 100, h = 40) => `${sparkPath(points, w, h)} L ${w} ${h} L 0 ${h} Z`;

  // Allocation entries with IPS targets and stable colors.
  const allocation = $derived(
    byAsset.map(([key, mv], i) => ({
      key,
      label: ASSET_LABELS[key] || titleCase(key),
      mv,
      pctValue: total > 0 ? (mv / total) * 100 : 0,
      target: IPS_TARGETS[key] || 0,
      color: DONUT_COLORS[i % DONUT_COLORS.length]
    }))
  );
  const donutWedges = $derived.by(() => {
    let angle = -Math.PI / 2;
    return allocation.map((a) => {
      const sweep = (a.pctValue / 100) * 2 * Math.PI;
      const path = donutArc(75, 50, angle, angle + sweep);
      angle += sweep;
      return { ...a, path };
    });
  });

  // Account totals + sparkline series.
  const accountTotals = $derived(
    accounts.map((a, i) => {
      const accountPositions = allPositions.filter((p) => p.account === a.id);
      const mv = sum(accountPositions, (p) => p.mv);
      return {
        ...a,
        mv,
        ytd: [4.1, 5.3, 1.9, 0.0][i] ?? 2.5,
        spark: monthlyPath(100, 0.4 + i * 0.1, 1.2, i + 5).slice(-12)
      };
    })
  );
  const filteredAccounts = $derived(
    accountIds.length ? accountTotals.filter((a) => accountIds.includes(a.id)) : accountTotals
  );

  // Top concentrations — single-name positions sorted by MV.
  const concentrations = $derived(
    [...positions]
      .filter((p) => p.symbol)
      .sort((a, b) => b.mv - a.mv)
      .slice(0, 5)
      .map((p) => ({ ...p, pctNW: total > 0 ? (p.mv / total) * 100 : 0 }))
  );
</script>

{#snippet body()}
  <Tabs {tabs} selected={tab} onSelect={onSelectTab} variant={embedded ? 'pill' : 'underline'} />

  {#if tab === 'summary'}
    <KpiStrip>
      <Kpi label="AUM"
        value={money(total, { compact: true })}
        sub={`Adv ${money(aumAdvisory, { compact: true })} · Non-adv ${money(aumNonAdvisory, { compact: true })}`} />
      <Kpi label="YTD return" value={pct(3.27)} sub={money(total * 0.0327, { compact: true })} />
      <Kpi label="Unrealized gain" value={money(gain, { compact: true })} />
      <Kpi label="Cash" value={money(cash, { compact: true })} sub={`${((cash / total) * 100).toFixed(1)}% of portfolio`} />
    </KpiStrip>

    <Section class="grid grid-cols-1 gap-3.5 lg:grid-cols-[3fr_2fr] lg:gap-6">
      <!-- Performance -->
      <div>
        <div class="row-between mb-3">
          <div>
            <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 text-2xl">Performance</h2>
            <div class="text-ink3 text-xs mt-1">Hypothetical growth of $10,000 · {perfRange} · advisory vs. non-advisory vs. {benchmarkParams.label}</div>
            <div class="text-ink4 text-xs mt-1 italic">Demo · curves are deterministic synthetic walks seeded from the household's YTD figure, not actual returns.</div>
          </div>
          <div class="seg">
            {#each PERF_RANGES as r (r)}
              <button type="button" class:active={perfRange === r} onclick={() => (perfRange = r)}>{r}</button>
            {/each}
          </div>
        </div>
        <Card class="p-4">
          <svg viewBox={`0 0 ${PERF.w} ${PERF.h}`} class="w-full h-auto perf-chart">
            <!-- Y-axis gridlines + dollar labels -->
            {#each performanceScale.ticks as t (t)}
              {@const y = perfY(t, performanceScale.yMin, performanceScale.yMax)}
              <line
                x1={PERF.padLeft}
                y1={y}
                x2={PERF.w - PERF.padRight}
                y2={y}
                stroke="var(--rule)"
                stroke-width={t === 10000 ? '1' : '0.5'}
                stroke-dasharray={t === 10000 ? '0' : '2,3'} />
              <text
                x={PERF.padLeft - 8}
                y={y + 3}
                text-anchor="end"
                font-size="10"
                fill="var(--ink-3)"
                font-family="var(--font-mono)">{fmtPerfAxis(t)}</text>
            {/each}
            <!-- X-axis date labels -->
            {#each performanceXLabels as xl (xl.monthIdx)}
              {@const x = perfX(xl.monthIdx, perfMonthsBack + 1)}
              <text
                x={x}
                y={PERF.h - 8}
                text-anchor={xl.anchor}
                font-size="10"
                fill="var(--ink-3)"
                font-family="var(--font-mono)">{xl.label}</text>
            {/each}
            <!-- Series -->
            {#if showBenchmark}
              <path d={perfLine(benchmarkViewPath, performanceScale.yMin, performanceScale.yMax)} stroke="var(--ink-4)" stroke-width="1.25" stroke-dasharray="3,3" fill="none" />
            {/if}
            {#if showNonAdvisory && hasNonAdvisory}
              <path d={perfLine(nonAdvisoryViewPath, performanceScale.yMin, performanceScale.yMax)} stroke="var(--ink-3)" stroke-width="1.5" fill="none" />
            {/if}
            {#if showAdvisory}
              <path d={perfLine(advisoryViewPath, performanceScale.yMin, performanceScale.yMax)} stroke="var(--ink)" stroke-width="2" fill="none" />
            {/if}
          </svg>
          <div class="legend">
            <button type="button" class="legend-item" class:off={!showAdvisory}
              onclick={() => (showAdvisory = !showAdvisory)}>
              <span class="swatch swatch-line"></span> Advisory
            </button>
            {#if hasNonAdvisory}
              <button type="button" class="legend-item" class:off={!showNonAdvisory}
                onclick={() => (showNonAdvisory = !showNonAdvisory)}>
                <span class="swatch swatch-line muted"></span> Non-advisory
              </button>
            {/if}
            <button type="button" class="legend-item" class:off={!showBenchmark}
              onclick={() => (showBenchmark = !showBenchmark)}>
              <span class="swatch swatch-dash"></span> {benchmarkParams.label}
            </button>
          </div>
          <div class="period-stats mt-4">
            {#each periodStats as [k, v]}
              <div class="period-stat">
                <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">{k}</div>
                <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-lg">{v}</div>
              </div>
            {/each}
          </div>
        </Card>
      </div>

      <!-- Allocation -->
      <div>
        <h2>Allocation</h2>
        <div class="sub">Asset classes · vs. Investment Policy Statement targets</div>
        <Card class="p-4">
          <div class="alloc-card" style="display:flex; gap:18px; align-items:center; flex-wrap:nowrap;">
            <svg viewBox="0 0 150 150" class="donut" style="width:140px; height:140px; flex:0 0 140px;">
              {#each donutWedges as w (w.key)}
                <path d={w.path} fill={w.color} />
              {/each}
            </svg>
            <ul class="alloc-list" style="flex:1 1 0; min-width:0;">
              {#each allocation as a (a.key)}
                <li class="alloc-row">
                  <span class="dot" style:background={a.color}></span>
                  <span class="alloc-label">{a.label}</span>
                  <span class="alloc-pct">{a.pctValue.toFixed(1)}%</span>
                  <span class="alloc-target">tgt {a.target}%</span>
                </li>
              {/each}
            </ul>
          </div>
        </Card>
        {#if allocation[0]}
          <div class="margin-note mt-3">
            <div class="margin-note-label">Investment Policy Statement drift</div>
            <div class="margin-note-body">
              {(allocation[0].pctValue - allocation[0].target).toFixed(0)}pp overweight {allocation[0].label} vs target.
            </div>
          </div>
        {/if}
      </div>
    </Section>

    <!-- Accounts in scope -->
    <Section>
      <div class="row-between mb-3">
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 text-2xl">Accounts in scope</h2>
        <Button variant="ghost" size="sm" onclick={() => onSelectTab('accounts')}>Open accounts →</Button>
      </div>
      <DataTable>
        <thead>
          <tr>
            <th>Account</th>
            <th>Custodian</th>
            <th>Entity</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">Value</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">% of scope</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">YTD</th>
            <th>12-mo trend</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredAccounts as a (a.id)}
            <tr onclick={() => onSelectTab('accounts')}>
              <td><span class="font-semibold">{a.name}</span></td>
              <td class="text-ink3 text-xs">{a.custodian}</td>
              <td class="text-ink3 text-xs">{a.entity}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(a.mv, { compact: true })}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{((a.mv / total) * 100).toFixed(1)}%</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]"
                class:text-pos={a.ytd >= 0} class:text-neg={a.ytd < 0}>{pct(a.ytd, { dp: 1 })}</td>
              <td>
                <svg viewBox="0 0 90 24" class="spark">
                  <path d={linePath(a.spark, 90, 24, 0, 2)} stroke="var(--ink-3)" stroke-width="1.25" fill="none" />
                </svg>
              </td>
            </tr>
          {/each}
        </tbody>
      </DataTable>
    </Section>

    <!-- Top concentrations + Things to discuss -->
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6">
      <div>
        <div class="row-between mb-2">
          <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 text-2xl">Top concentrations</h2>
          <Button variant="ghost" size="sm" onclick={() => onSelectTab('holdings')}>All holdings →</Button>
        </div>
        <div class="text-ink3 text-xs">Largest single holdings · red bars exceed the 7% Investment Policy Statement single-name cap.</div>
        <Card class="mt-3 p-0">
          <table class="conc-table">
            <tbody>
              {#each concentrations as p (p.symbol)}
                <tr onclick={() => navigate(`/asset/${encodeURIComponent(p.symbol)}`)}>
                  <td class="conc-dot"><span class="dot" class:warn={p.pctNW > 7}></span></td>
                  <td>
                    <span class="font-semibold">{p.symbol}</span>
                    <div class="text-ink3 text-[11px]">{p.name}</div>
                  </td>
                  <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] num">{money(p.mv, { compact: true })}</td>
                  <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] num">{p.pctNW.toFixed(1)}%</td>
                  <td>
                    <div class="bar-track">
                      <div class="bar-fill" class:over={p.pctNW > 7}
                        style:width={Math.min(100, p.pctNW * 6) + '%'}></div>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </Card>
      </div>

      <div>
        <div class="row-between mb-2">
          <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 text-2xl">{clientInsights.length} things to discuss</h2>
          <Button variant="ghost" size="sm" onclick={() => navigate(embedded ? `clients/${householdId}/insights` : 'insights')}>Open insights →</Button>
        </div>
        <div class="flex flex-col space-y-3.5 mt-3">
          {#each clientInsights as ins (ins.id)}
            <button type="button" class="insight-card" onclick={() => navigate(embedded ? `clients/${householdId}/insights/${ins.id}` : `insights/${ins.id}`)}>
              <div class="row-between">
                <Tag tone={ins.priority === 'high' ? 'neg' : 'warn'}>{ins.kind}</Tag>
                <span class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">priority · {ins.priority}</span>
              </div>
              <div class="mt-2 font-semibold leading-snug">{ins.title}</div>
              <div class="text-ink3 text-xs mt-1">
                {#if ins.impact.taxSaved}tax saved {money(ins.impact.taxSaved, { compact: true })}{#if ins.impact.incomeLift || ins.impact.reposition} · {/if}{/if}
                {#if ins.impact.incomeLift}+{money(ins.impact.incomeLift, { compact: true })}/yr{/if}
                {#if ins.impact.reposition && !ins.impact.incomeLift}{money(ins.impact.reposition, { compact: true })} repositioned{/if}
              </div>
            </button>
          {/each}
        </div>
      </div>
    </Section>
  {:else if tab === 'holdings'}
    <div class="holdings-toolbar">
      <input class="holdings-search" placeholder="Search symbol or name…" bind:value={holdingsQuery} />
      <div class="holdings-filter">
        <button class:active={holdingsClassFilter.length === 0} onclick={() => (holdingsClassFilter = [])}>All classes</button>
        {#each HOLDINGS_FILTER_CLASSES as k}
          <button class:active={holdingsClassFilter.includes(k)} onclick={() => toggleClassFilter(k)}>{ASSET_LABELS[k]}</button>
        {/each}
      </div>
      <span class="holdings-count">{holdingsRows.length} positions · {money(holdingsScopeTotal, { compact: true })}</span>
      <button class="holdings-export">{@html Icons.download} Export CSV</button>
    </div>
    <div class="holdings-table-wrap">
      <table class="holdings-table">
        <thead>
          <tr>
            <th class="sort" onclick={() => setHoldingsSort('symbol')}>
              Security {#if holdingsSortKey === 'symbol'}{holdingsSortDir === 'asc' ? '↑' : '↓'}{/if}
            </th>
            <th title="Asset class — equity, fixed income, alternative, cash, etc.">Class</th>
            <th title="Custodian holding this position.">Account</th>
            <th class="sort num" onclick={() => setHoldingsSort('qty')}>
              Qty {#if holdingsSortKey === 'qty'}{holdingsSortDir === 'asc' ? '↑' : '↓'}{/if}
            </th>
            <th class="sort num" onclick={() => setHoldingsSort('price')}>
              Price {#if holdingsSortKey === 'price'}{holdingsSortDir === 'asc' ? '↑' : '↓'}{/if}
            </th>
            <th class="sort num" onclick={() => setHoldingsSort('mv')} title="Current market value: quantity × price.">
              Market Value {#if holdingsSortKey === 'mv'}{holdingsSortDir === 'asc' ? '↑' : '↓'}{/if}
            </th>
            <th class="sort num" onclick={() => setHoldingsSort('pctNW')} title="This position's share of the in-scope total.">
              % scope {#if holdingsSortKey === 'pctNW'}{holdingsSortDir === 'asc' ? '↑' : '↓'}{/if}
            </th>
            <th class="sort num" onclick={() => setHoldingsSort('unreal')} title="Unrealized gain or loss: market value − cost basis. Tax owed only when sold.">
              Unreal G/L {#if holdingsSortKey === 'unreal'}{holdingsSortDir === 'asc' ? '↑' : '↓'}{/if}
            </th>
            <th class="sort num" onclick={() => setHoldingsSort('unrealPct')} title="Unrealized G/L as a % of cost basis.">
              % {#if holdingsSortKey === 'unrealPct'}{holdingsSortDir === 'asc' ? '↑' : '↓'}{/if}
            </th>
          </tr>
        </thead>
        <tbody>
          {#each holdingsRows as p (p.id || p.symbol)}
            {@const acct = accounts.find((a) => a.id === p.account)}
            <tr onclick={() => navigate(`/asset/${encodeURIComponent(p.symbol)}`)}>
              <td>
                <div class="font-semibold">{p.symbol}</div>
                <div class="cf-label">{p.name}</div>
              </td>
              <td class="text-ink3 text-xs">{ASSET_LABELS[p.assetClass] || titleCase(p.assetClass)}</td>
              <td class="text-ink3 text-xs">{acct?.custodian || '—'}</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{p.qty == null ? '—' : p.qty.toLocaleString('en-US')}</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{p.price == null ? 'NAV' : p.price > 1000 ? p.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : p.price.toFixed(2)}</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(p.mv, { compact: true })}</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{p.pctNW.toFixed(2)}%</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]" class:text-pos={p.unreal >= 0} class:text-neg={p.unreal < 0}>{money(p.unreal, { compact: true })}</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]" class:text-pos={p.unrealPct >= 0} class:text-neg={p.unrealPct < 0}>{pct(p.unrealPct, { dp: 1 })}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else if tab === 'diversification'}
    <div class="div-grid">
      <Card class="p-6">
        <h3 class="div-title">Asset class vs Investment Policy Statement</h3>
        <div class="text-ink3 text-xs">Bar = actual; tick = target.</div>
        <div class="div-list mt-4">
          {#each allocation as a (a.key)}
            <div>
              <div class="row-between">
                <span><span class="cf-dot" style:background={a.color}></span>{a.label}</span>
                <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-sm">{a.pctValue.toFixed(1)}% <span class="text-ink3 text-xs ml-1">tgt {a.target}%</span></span>
              </div>
              <Bar class="mt-2"
                value={Math.min(100, a.pctValue)}
                target={a.target}
                tone={Math.abs(a.pctValue - a.target) > 5 ? 'neg' : 'default'} />
            </div>
          {/each}
        </div>
      </Card>
      <Card class="p-6">
        <h3 class="div-title">Single-name caps</h3>
        <div class="text-ink3 text-xs">Investment Policy Statement limits any single security to 7% of scope. Tick on each bar marks that 7% line; bar turns red past it.</div>
        <div class="conc-list mt-4">
          {#each singleNameCaps as p (p.id || p.symbol)}
            <div class="conc-row">
              <span class="conc-symbol">{p.symbol}</span>
              <Bar class="conc-bar"
                value={Math.min(100, p.pctNW * 6)}
                target={42}
                tone={p.pctNW > 7 ? 'neg' : 'default'} />
              <span class="conc-pct font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{p.pctNW.toFixed(2)}%</span>
            </div>
          {/each}
        </div>
      </Card>
      <Card class="p-6">
        <h3 class="div-title">Equity sector exposure</h3>
        <div class="text-ink3 text-xs">Across US + International equity sleeves.</div>
        <div class="sector-row mt-4">
          <svg viewBox="0 0 150 150" class="sector-donut">
            {#each sectorDonutWedges as w (w.sector)}
              <path d={w.path} fill={w.color} />
            {/each}
          </svg>
          <ul class="sector-legend">
            {#each sectorDonutWedges as s (s.sector)}
              <li>
                <span><span class="cf-dot" style:background={s.color}></span>{s.sector}</span>
                <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{s.pct.toFixed(1)}%</span>
              </li>
            {/each}
          </ul>
        </div>
      </Card>
      <Card class="p-6">
        <h3 class="div-title">Geographic mix</h3>
        <div class="text-ink3 text-xs">Look-through where available.</div>
        <div class="geo-grid mt-4">
          {#each GEO_MIX as g (g.label)}
            <div>
              <div class="cf-label">{g.label}</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-2xl mt-1">{g.pct}%</div>
              <Bar class="mt-2" value={g.pct} color={g.color} />
            </div>
          {/each}
        </div>
      </Card>
    </div>
  {:else if tab === 'accounts'}
    <div class="text-ink3 text-xs mb-4">{accountCards.length} accounts in scope · {money(accountsScopeTotal, { compact: true })}</div>
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
      {#each accountCards as a (a.id)}
        <Card class="p-6">
          <div class="row-between acct-head">
            <div>
              <div class="cf-label">{a.custodian} · {a.entity}</div>
              <div class="font-[var(--font-display)] acct-name">{a.name}</div>
            </div>
            <Tag>{a.type}</Tag>
          </div>
          <div class="acct-kpis">
            <div title="Total market value of positions in this account.">
              <div class="cf-label">Value</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] acct-num">{money(a.mv, { compact: true })}</div>
            </div>
            <div title="This account's share of the in-scope household total.">
              <div class="cf-label">% of scope</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] acct-num">{a.pctScope.toFixed(1)}%</div>
            </div>
            <div title="Number of distinct holdings in this account.">
              <div class="cf-label">Positions</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] acct-num">{a.positions}</div>
            </div>
            <div title="Account-level market value − cost basis.">
              <div class="cf-label">Unrealized</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] acct-num" class:text-pos={a.unreal >= 0} class:text-neg={a.unreal < 0}>{money(a.unreal, { compact: true })}</div>
            </div>
          </div>
          <div class="mt-4">
            <div class="cf-label mb-1">Value · trailing 36 months</div>
            <svg viewBox="0 0 100 48" class="acct-spark" preserveAspectRatio="none">
              <path d={sparkArea(a.spark, 100, 48)} fill="var(--ink-3)" opacity="0.08" />
              <path d={sparkPath(a.spark, 100, 48)} fill="none" stroke="var(--ink-3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </Card>
      {/each}
    </Section>
  {:else if tab === 'custodians'}
    <div class="text-ink3 text-xs mb-4">{custodianCards.length} custodian{custodianCards.length === 1 ? '' : 's'} in scope · {money(accountsScopeTotal, { compact: true })}</div>
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
      {#each custodianCards as c (c.custodian)}
        <Card class="p-6">
          <div class="row-between acct-head">
            <div>
              <div class="cf-label">Custodian</div>
              <div class="font-[var(--font-display)] acct-name">{c.custodian}</div>
            </div>
            <Tag>{c.accounts.length} acct{c.accounts.length === 1 ? '' : 's'}</Tag>
          </div>
          <div class="acct-kpis">
            <div title="Aggregate market value at this custodian.">
              <div class="cf-label">Value</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] acct-num">{money(c.mv, { compact: true })}</div>
            </div>
            <div title="Custodian's share of the in-scope household total.">
              <div class="cf-label">% of scope</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] acct-num">{c.pctScope.toFixed(1)}%</div>
            </div>
            <div title="Distinct holdings across this custodian's accounts.">
              <div class="cf-label">Positions</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] acct-num">{c.positions}</div>
            </div>
            <div title="Custodian-level market value − cost basis.">
              <div class="cf-label">Unrealized</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] acct-num" class:text-pos={c.unreal >= 0} class:text-neg={c.unreal < 0}>{money(c.unreal, { compact: true })}</div>
            </div>
          </div>
          <hr class="cust-divider" />
          <div class="cf-label mb-2">Accounts</div>
          <div class="cust-acct-list">
            {#each c.accounts as a (a.id)}
              <div class="cust-acct-row">
                <div class="cust-acct-name">
                  <span>{a.name}</span>
                  <span class="text-ink3 text-xs">{a.entity} · {a.type}</span>
                </div>
                <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] cust-acct-mv">{money(a.mv, { compact: true })}</span>
              </div>
            {/each}
          </div>
        </Card>
      {/each}
    </Section>
  {:else if tab === 'cashflow'}
    <!-- Scenario pills -->
    <Card class="p-4 mb-4 scenario-card">
      <div class="row-between scenario-row">
        <div>
          <span class="cf-label">Scenarios</span>
          <span class="text-ink3 text-xs cf-hint">Toggle to stress-test the forecast. Chart, balance, KPIs all update live.</span>
        </div>
        <div class="scenario-pills">
          <button class="scenario-pill" class:active={exitSlips}
            title="Pushes the projected $7M Pine Ridge II exit distribution from Q4 2027 to Q2 2028."
            onclick={() => (exitSlips = !exitSlips)}>{exitSlips ? '✓ ' : ''}Pine Ridge II exit slips 6 mo</button>
          <button class="scenario-pill" class:active={wedding}
            title="Adds a one-time $1.5M lifestyle outflow in Q2 2027."
            onclick={() => (wedding = !wedding)}>{wedding ? '✓ ' : ''}Family wedding · $1.5M Q2 2027</button>
          <button class="scenario-pill" class:active={trustGift}
            title="Adds a $2M family-governance distribution in Q1 2028 (gift to next generation)."
            onclick={() => (trustGift = !trustGift)}>{trustGift ? '✓ ' : ''}Next-gen gift · $2M Q1 2028</button>
          {#if anyScenario}
            <button class="scenario-clear"
              onclick={() => { exitSlips = false; wedding = false; trustGift = false; }}>Clear</button>
          {/if}
        </div>
      </div>
      {#if anyScenario}
        <div class="scenario-delta">
          ⚡ Forecast adjusted by scenario · <span class="font-semibold">delta to base min cash:</span>
          <span class={scenarioDelta < 0 ? 'text-neg' : 'text-pos'}>
            {scenarioDelta >= 0 ? '+' : ''}{money(scenarioDelta, { compact: true })}
            {scenarioDelta < 0 ? '(tighter)' : '(more buffer)'}
          </span>
        </div>
      {/if}
    </Card>

    <KpiStrip>
      <Kpi label="Starting cash" value={money(startCash, { compact: true })} sub={`${cashPositions.length} cash position${cashPositions.length === 1 ? '' : 's'}`} />
      <Kpi label="Liquidity coverage" value={`${monthsCovered.toFixed(1)} mo`} sub="at year-1 burn rate" />
      <Kpi label="Avg annual inflows" value={`+${money(annualInflows, { compact: true })}`} sub="div + coupons + interest + dist." />
      <Kpi label="Avg annual outflows" value={`−${money(annualOutflows, { compact: true })}`} sub="calls + fees + taxes + lifestyle" />
      <Kpi label="Min projected cash" value={money(minBalance, { compact: true })} sub={`at ${minBalanceQ}`} />
    </KpiStrip>

    <Section>
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Quarterly cashflow by source</h2>
      <div class="text-ink3 text-xs mt-1">Inflows above the line, outflows below. Bond coupons stay roughly flat (Treasury and muni schedules interleave); the visible spike is the Q4 2027 alt exit distribution.</div>
      <Card class="p-4 mt-3">
        <svg viewBox={`0 0 ${stackedChart.w} ${stackedChart.h}`} class="cf-chart" preserveAspectRatio="none">
          {#each stackedChart.gridlines as g}
            <line x1={stackedChart.axisLeft} x2={stackedChart.axisRight} y1={g.y} y2={g.y}
              stroke="var(--rule)" stroke-width="1" stroke-dasharray={g.isZero ? '0' : '2 4'} />
            {#if g.label}
              <text x={stackedChart.axisLeft - 6} y={g.y + 3}
                font-family="var(--font-mono)" font-size="9" fill="var(--ink-3)" text-anchor="end">{g.label}</text>
            {/if}
          {/each}
          {#each stackedChart.bars as b}
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} opacity="0.9">
              <title>{b.title}</title>
            </rect>
          {/each}
          {#each stackedChart.qLabels as q}
            <text x={q.x} y={stackedChart.axisBottom}
              font-family="var(--font-mono)" font-size="9" fill="var(--ink-3)" text-anchor="middle">{q.q}</text>
          {/each}
        </svg>
        <div class="cf-legend">
          {#each HCF_SOURCES as s}
            <span class="cf-legend-item" title={confLabel(s.conf)}>
              <span class="cf-swatch" style:background={s.color}></span>{s.label}
            </span>
          {/each}
        </div>
        <div class="cf-caveat">
          Forecast caveat: capital calls follow industry-typical drawdown patterns (±1–2 quarters of timing variance). Distributions, especially the Q4 2027 exit, are GP estimates — actual timing depends on M&amp;A or IPO of underlying companies and can shift materially.
        </div>
      </Card>
    </Section>

    <Section>
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Projected cash balance</h2>
      <div class="text-ink3 text-xs mt-1">Starting from today's cash, applying every projected inflow and outflow on its quarter.</div>
      <Card class="p-4 mt-3">
        <svg viewBox={`0 0 ${balanceChart.w} ${balanceChart.h}`} class="cf-line" preserveAspectRatio="none">
          {#each balanceChart.gridlines as g}
            <line x1={balanceChart.axisLeft} x2={balanceChart.axisRight} y1={g.y} y2={g.y}
              stroke="var(--rule)" stroke-width="1" stroke-dasharray={g.isAxis ? '0' : '2 4'} />
          {/each}
          <path d={balanceChart.path} fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="cf-balance-stats">
          <span>Today: <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(startCash, { compact: true })}</span></span>
          <span class="text-ink3">·</span>
          <span>Min: <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]" class:text-warn={lowCashFlag}>{money(minBalance, { compact: true })}</span> at {minBalanceQ}</span>
          <span class="text-ink3">·</span>
          <span>End ({cf[cf.length - 1].q}): <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(balancePath[balancePath.length - 1], { compact: true })}</span></span>
        </div>
        {#if lowCashFlag}
          <div class="cf-warn-note">
            <div class="cf-warn-label">Liquidity tightness</div>
            <div>
              Projected cash dips to {money(minBalance, { compact: true })} at {minBalanceQ} — driven mainly by Q3 2027's $3.25M of clustered calls (Pine Ridge IV yr-2 + Helios initial). Pine Ridge II's Q4 2027 exit distribution is the rebound. Buffer options: trim AAPL ahead of the dip, or hold extra T-Bill maturities into 2027Q3.
            </div>
          </div>
        {/if}
      </Card>
    </Section>

    <Section>
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Per-quarter detail</h2>
      <div class="text-ink3 text-xs mt-1">In, Out, Net, and the running cash balance after each quarter. Click any row to drill into that quarter's source-level breakdown below.</div>
      <DataTable class="mt-3">
        <thead>
          <tr>
            <th>Quarter</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">In</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Out</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Net</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Balance</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each cfRows as r, i}
            {@const isSelected = effectiveSelectedQ === r.q}
            <tr class="cf-row" class:selected={isSelected} onclick={() => (selectedQ = r.q)}>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-xs" class:font-semibold={isSelected}>{r.q}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-pos">+{money(r.inflows, { compact: true })}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-neg">{money(r.outflows, { compact: true })}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] font-semibold" class:text-neg={r.net < 0} class:text-pos={r.net >= 0}>{r.net >= 0 ? '+' : ''}{money(r.net, { compact: true })}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]" class:text-warn={balancePath[i + 1] < 3_000_000}>{money(balancePath[i + 1], { compact: true })}</td>
              <td class="text-ink3 text-xs text-right">{isSelected ? '◀ drilldown ↓' : 'open ▸'}</td>
            </tr>
          {/each}
        </tbody>
      </DataTable>
    </Section>

    {#if selectedRow}
      <Section>
        <div class="row-between drilldown-head">
          <div>
            <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0">{effectiveSelectedQ} drilldown</h2>
            <div class="text-ink3 text-xs mt-1">Every source contributing to this quarter's flow.</div>
          </div>
          <div class="drilldown-summary">
            <span>Net: <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]" class:text-neg={selectedRow.net < 0} class:text-pos={selectedRow.net >= 0}>{selectedRow.net >= 0 ? '+' : ''}{money(selectedRow.net, { compact: true })}</span></span>
            <span>·</span>
            <span>Ending balance: <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(balancePath[cfRows.indexOf(selectedRow) + 1], { compact: true })}</span></span>
          </div>
        </div>
        <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5 mt-3">
          <Card class="p-5">
            <div class="row-between drilldown-card-head">
              <span class="cf-label">Inflows</span>
              <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-2xl text-pos">+{money(selectedRow.inflows, { compact: true })}</span>
            </div>
            <hr class="cf-divider" />
            <div class="cf-source-list">
              {#each HCF_IN as s}
                {@const v = selectedRow[s.key] || 0}
                {@const ctx = v !== 0 ? cashflowSourceContext(s.key, effectiveSelectedQ, v, altCashflow) : null}
                <div class="cf-source-row" class:zero={v === 0}>
                  <div class="cf-source-name">
                    <span class="cf-dot" style:background={s.color}></span> {s.label}
                    {#if ctx}<div class="cf-source-ctx">{ctx}</div>{/if}
                  </div>
                  <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]" class:text-pos={v > 0} class:text-3={v === 0}>
                    {v === 0 ? '—' : '+' + money(v, { compact: true })}
                  </span>
                </div>
              {/each}
            </div>
          </Card>
          <Card class="p-5">
            <div class="row-between drilldown-card-head">
              <span class="cf-label">Outflows</span>
              <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-2xl text-neg">{money(selectedRow.outflows, { compact: true })}</span>
            </div>
            <hr class="cf-divider" />
            <div class="cf-source-list">
              {#each HCF_OUT as s}
                {@const v = selectedRow[s.key] || 0}
                {@const ctx = v !== 0 ? cashflowSourceContext(s.key, effectiveSelectedQ, v, altCashflow) : null}
                <div class="cf-source-row" class:zero={v === 0}>
                  <div class="cf-source-name">
                    <span class="cf-dot" style:background={s.color}></span> {s.label}
                    {#if ctx}<div class="cf-source-ctx">{ctx}</div>{/if}
                  </div>
                  <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]" class:text-neg={v < 0} class:text-3={v === 0}>
                    {v === 0 ? '—' : money(v, { compact: true })}
                  </span>
                </div>
              {/each}
            </div>
          </Card>
        </Section>
        <div class="text-ink3 text-xs mt-4">
          Tip: hover the colored segments in the chart above for quick per-source amounts without needing to click a row.
        </div>
      </Section>
    {/if}

    <Section>
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Cashflow by entity · 2-yr totals</h2>
      <div class="text-ink3 text-xs mt-1">Each entity's inflows, outflows, and net across the window.</div>
      <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5 mt-3">
        {#each accounts as a (a.id)}
          {@const t = entityRollup(a.id)}
          <Card class="p-5">
            <div class="row-between entity-head">
              <div>
                <div class="cf-label">{a.custodian} · {a.entity}</div>
                <div class="font-[var(--font-display)] entity-name">{a.name}</div>
                <span class="entity-tag"><Tag>{a.type}</Tag></span>
              </div>
              <div class="entity-net">
                <div class="cf-label">Net 2-yr</div>
                <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-2xl" class:text-neg={t.net < 0} class:text-pos={t.net >= 0}>{t.net >= 0 ? '+' : ''}{money(t.net, { compact: true })}</div>
              </div>
            </div>
            <div class="entity-flows">
              <div><div class="text-ink3 text-xs">Inflows</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-pos">+{money(t.inflows, { compact: true })}</div></div>
              <div><div class="text-ink3 text-xs">Outflows</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-neg">{money(t.outflows, { compact: true })}</div></div>
            </div>
            <hr class="cf-divider" />
            <div class="entity-tops">
              {#if t.topIn.length > 0}
                <div>
                  <span class="text-ink3">Top inflows: </span>
                  {#each t.topIn as it, i}
                    <span class="cf-dot" style:background={it.src.color}></span> {it.src.label}
                    <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">+{money(it.value, { compact: true })}</span>
                    {#if i < t.topIn.length - 1}<span class="text-ink3"> · </span>{/if}
                  {/each}
                </div>
              {/if}
              {#if t.topOut.length > 0}
                <div>
                  <span class="text-ink3">Top outflows: </span>
                  {#each t.topOut as it, i}
                    <span class="cf-dot" style:background={it.src.color}></span> {it.src.label}
                    <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(it.value, { compact: true })}</span>
                    {#if i < t.topOut.length - 1}<span class="text-ink3"> · </span>{/if}
                  {/each}
                </div>
              {/if}
            </div>
            <div class="entity-funding" class:warn={t.net < 0}>
              {t.net < 0 ? 'Funded by surplus entities or new liquidity.' : 'Surplus available to deploy.'}
            </div>
          </Card>
        {/each}
      </Section>
      <div class="text-ink3 text-xs mt-4">
        Sources attributed to their natural account home — bonds and cash sweep in trust, alt commits at JPM, equity dividends primarily in joint.
      </div>
    </Section>
  {/if}
{/snippet}

{#if embedded}
  {@render body()}
{:else}
  <Page>
    <PageHeader>
      <div>
        <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{HOUSEHOLD.segment} · relationship since {HOUSEHOLD.founded}</div>
        <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Portfolio · {householdName}</h1>
        <p class="text-ink2 mt-2 max-w-[720px]">Portfolio shape, concentration, account structure, and cashflow context for the current client relationship.</p>
      </div>
      <Tag tone="accent">{benchmarkParams.label}</Tag>
    </PageHeader>
    {@render body()}
  </Page>
{/if}

<style>
  .row-between {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  /* Segmented control for the time-period selector */
  .seg {
    display: inline-flex;
    background: var(--surface-2);
    border: 1px solid var(--rule);
    border-radius: var(--r-md);
    padding: 2px;
  }
  .seg button {
    background: transparent;
    border: 0;
    padding: 4px 10px;
    border-radius: calc(var(--r-md) - 2px);
    font: inherit;
    font-size: 11.5px;
    font-weight: 500;
    color: var(--ink-3);
    cursor: pointer;
  }
  .seg button:hover { color: var(--ink-2); }
  .seg button.active {
    background: var(--surface);
    color: var(--ink);
    box-shadow: var(--shadow-sm);
  }

  /* Performance chart legend + period stats */
  .legend {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    font-size: 11.5px;
    color: var(--ink-3);
    margin-top: 12px;
  }
  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 0;
    padding: 0;
    color: inherit;
    font: inherit;
    cursor: pointer;
    user-select: none;
    transition: opacity .12s;
  }
  .legend-item:hover {
    color: var(--ink);
  }
  .legend-item.off {
    opacity: 0.4;
    text-decoration: line-through;
  }
  .legend-item.off:hover {
    opacity: 0.7;
  }
  .swatch {
    display: inline-block;
    width: 14px;
    height: 2px;
    background: var(--ink);
  }
  .swatch.muted {
    background: var(--ink-3);
  }
  .swatch.swatch-dash {
    height: 0;
    border-top: 1.25px dashed var(--ink-3);
  }
  .swatch.swatch-dash.light {
    border-top-color: var(--ink-4);
  }
  .period-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .period-stat {
    border-top: 1px dashed var(--rule-2);
    padding-top: 8px;
    min-width: 0;
  }
  @media (max-width: 768px) {
    .period-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .period-stat :global(.text-lg) {
      font-size: 16px;
    }
  }

  /* Allocation donut + legend — donut on the left, legend on the right. */
  .alloc-card {
    display: flex;
    gap: 18px;
    align-items: center;
    flex-wrap: nowrap;
  }
  .donut {
    width: 140px;
    height: 140px;
    flex: 0 0 140px;
  }
  @media (max-width: 768px) {
    .alloc-card {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .donut {
      width: 120px !important;
      height: 120px !important;
      flex: 0 0 120px !important;
      margin: 0 auto;
    }
  }
  .alloc-list {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 13px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1 1 0;
    min-width: 0;
  }
  .alloc-row {
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr) auto auto;
    align-items: center;
    column-gap: 10px;
  }
  .alloc-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--ink);
  }
  .alloc-pct {
    font-family: var(--font-mono);
    font-feature-settings: 'tnum';
    text-align: right;
    color: var(--ink);
  }
  .alloc-target {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-3);
    white-space: nowrap;
  }
  .dot {
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--ink-3);
    flex-shrink: 0;
  }
  .dot.warn { background: var(--neg); }

  /* IPS drift note — dev2 style: accent left-bar with a soft fade. */
  .margin-note {
    border-left: 2px solid var(--accent);
    padding: 8px 0 8px 14px;
    background: linear-gradient(to right,
      color-mix(in oklch, var(--accent) 14%, transparent) 0%,
      transparent 60%);
  }
  .margin-note-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .margin-note-body {
    font-size: 13px;
    margin-top: 2px;
    color: var(--ink);
  }

  /* Sparklines in account rows */
  .spark {
    width: 90px;
    height: 24px;
    display: block;
  }

  /* Top concentrations table */
  .conc-table {
    width: 100%;
    border-collapse: collapse;
  }
  .conc-table tr {
    cursor: pointer;
  }
  .conc-table tr:hover td {
    background: var(--surface-2);
  }
  .conc-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--rule-2);
    font-size: 13px;
    vertical-align: middle;
  }
  .conc-table tr:last-child td {
    border-bottom: 0;
  }
  .conc-table .conc-dot {
    width: 24px;
    padding-right: 0;
  }
  .conc-table .num {
    text-align: right;
    white-space: nowrap;
  }
  @media (max-width: 768px) {
    .conc-table td {
      padding: 12px 8px;
      font-size: 12.5px;
    }
    .conc-table .conc-dot {
      width: 18px;
    }
    .conc-table .bar-track {
      width: 56px;
    }
  }

  .bar-track {
    width: 100px;
    height: 6px;
    background: var(--surface-2);
    border-radius: 99px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: var(--ink-3);
    border-radius: 99px;
  }
  .bar-fill.over {
    background: var(--neg);
  }

  /* Insight cards in the right column */
  .insight-card {
    display: block;
    width: 100%;
    text-align: left;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    padding: 14px 16px;
    cursor: pointer;
    font: inherit;
    color: inherit;
    transition: border-color .12s, box-shadow .12s;
  }
  .insight-card:hover {
    border-color: var(--ink-3);
    box-shadow: var(--shadow-sm);
  }

  /* ── Cashflow tab ─────────────────────────────────────────────────── */
  .cf-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .scenario-card {
    border-style: dashed;
  }
  .scenario-row {
    flex-wrap: wrap;
    gap: 12px;
  }
  .cf-hint {
    margin-left: 10px;
  }
  .scenario-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .scenario-pill {
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--rule-2);
    background: var(--surface);
    color: var(--ink);
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    transition: background .12s, color .12s, border-color .12s;
  }
  .scenario-pill:hover {
    border-color: var(--ink-3);
  }
  .scenario-pill.active {
    background: var(--ink);
    color: var(--surface);
    border-color: var(--ink);
  }
  .scenario-clear {
    font-size: 11.5px;
    padding: 5px 10px;
    border-radius: 999px;
    background: transparent;
    color: var(--ink-3);
    border: 1px solid var(--rule-2);
    cursor: pointer;
    font: inherit;
    font-size: 11.5px;
  }
  .scenario-clear:hover {
    color: var(--ink);
    border-color: var(--ink-3);
  }
  .scenario-delta {
    font-size: 12px;
    color: var(--accent);
    margin-top: 12px;
  }

  .cf-chart {
    display: block;
    width: 100%;
    height: 300px;
  }
  .cf-line {
    display: block;
    width: 100%;
    height: 180px;
  }
  .cf-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
    font-size: 11.5px;
    color: var(--ink-3);
  }
  .cf-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: help;
  }
  .cf-swatch {
    width: 12px;
    height: 12px;
    opacity: 0.9;
    border: 1px solid var(--rule-2);
    display: inline-block;
  }
  .cf-caveat {
    color: var(--ink-3);
    font-size: 11.5px;
    font-style: italic;
    margin-top: 12px;
  }

  .cf-balance-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
    margin-top: 12px;
  }
  .cf-warn-note {
    border-left: 2px solid var(--warn);
    background: linear-gradient(to right, var(--warn-soft), transparent 60%);
    padding: 10px 14px;
    margin-top: 16px;
    font-size: 13px;
    border-radius: 0 var(--r-md) var(--r-md) 0;
  }
  .cf-warn-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--warn);
    margin-bottom: 4px;
  }

  .cf-row {
    cursor: pointer;
  }
  .cf-row.selected {
    background: color-mix(in oklch, var(--accent) 6%, transparent);
  }
  .text-warn {
    color: var(--warn);
  }
  .text-3 {
    color: var(--ink-3);
  }

  .drilldown-head {
    flex-wrap: wrap;
    gap: 12px;
  }
  .drilldown-summary {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--ink-3);
  }
  .drilldown-card-head {
    align-items: baseline;
  }
  .cf-divider {
    border: 0;
    border-top: 1px dashed var(--rule-2);
    margin: 12px 0;
  }
  .cf-source-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .cf-source-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
    font-size: 13px;
    border-bottom: 1px dashed var(--rule-2);
    padding-bottom: 10px;
  }
  .cf-source-row.zero {
    opacity: 0.45;
    font-size: 12px;
    border-bottom: 0;
    padding-bottom: 6px;
  }
  .cf-source-row.zero:last-child {
    border-bottom: 0;
  }
  .cf-source-name {
    flex: 1;
    min-width: 0;
  }
  .cf-source-ctx {
    color: var(--ink-3);
    font-size: 11.5px;
    margin-top: 3px;
    margin-left: 18px;
  }
  .cf-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
  }

  .entity-head {
    align-items: flex-start;
    gap: 12px;
  }
  .entity-name {
    font-size: 17px;
    font-weight: 600;
    margin-top: 2px;
  }
  .entity-tag {
    display: inline-block;
    margin-top: 6px;
  }
  .entity-net {
    text-align: right;
  }
  .entity-flows {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    font-size: 12px;
  }
  .entity-tops {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 11.5px;
  }
  .entity-funding {
    color: var(--ink-3);
    font-size: 11.5px;
    font-style: italic;
    margin-top: 12px;
  }
  .entity-funding.warn {
    color: var(--warn);
  }

  /* ── Holdings tab ─────────────────────────────────────────────────── */
  .holdings-toolbar {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 16px;
  }
  .holdings-search {
    width: 100%;
    max-width: 280px;
    min-width: 0;
    flex: 1 1 200px;
    border: 1px solid var(--rule-2);
    background: var(--surface);
    border-radius: var(--r-md);
    padding: 8px 10px;
    font: inherit;
    color: var(--ink);
    outline: none;
  }
  .holdings-search:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .holdings-filter {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0;
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    overflow: hidden;
  }
  .holdings-filter button {
    padding: 7px 12px;
    border: 0;
    border-left: 1px solid var(--rule-2);
    background: var(--surface);
    color: var(--ink-2);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .holdings-filter button:first-child {
    border-left: 0;
  }
  @media (hover: hover) {
    .holdings-filter button:hover {
      background: var(--surface-2);
      color: var(--ink);
    }
  }
  .holdings-filter button.active {
    background: var(--ink);
    color: var(--surface);
  }
  @media (max-width: 768px) {
    .holdings-filter {
      flex-wrap: nowrap;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      max-width: 100%;
      touch-action: pan-x;
      overscroll-behavior-x: contain;
    }
    .holdings-filter::-webkit-scrollbar {
      display: none;
    }
    .holdings-filter button {
      flex-shrink: 0;
      white-space: nowrap;
    }
  }
  .holdings-count {
    color: var(--ink-3);
    font-size: 12px;
    margin-left: auto;
  }
  .holdings-export {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    background: var(--surface);
    color: var(--ink-2);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .holdings-export:hover {
    border-color: var(--ink-3);
    color: var(--ink);
  }
  .holdings-table-wrap {
    overflow-x: auto;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
  }
  .holdings-table {
    width: 100%;
    min-width: 920px;
    border-collapse: collapse;
    font-size: 13px;
  }
  .holdings-table thead th {
    text-align: left;
    padding: 10px 12px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-3);
    background: var(--surface-2);
    font-weight: 500;
    border-bottom: 1px solid var(--rule-2);
  }
  .holdings-table thead th.num {
    text-align: right;
  }
  .holdings-table thead th.sort {
    cursor: pointer;
    user-select: none;
  }
  .holdings-table thead th.sort:hover {
    color: var(--ink);
  }
  .holdings-table tbody td {
    padding: 12px;
    border-bottom: 1px solid var(--rule-2);
    vertical-align: middle;
  }
  .holdings-table tbody td.num {
    text-align: right;
  }
  .holdings-table tbody tr {
    cursor: pointer;
  }
  .holdings-table tbody tr:hover td {
    background: var(--surface-2);
  }
  .holdings-table tbody tr:last-child td {
    border-bottom: 0;
  }

  /* ── Diversification tab ──────────────────────────────────────────── */
  .div-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  @media (min-width: 768px) {
    .div-grid {
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
  }
  .div-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
  .div-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .conc-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .conc-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .conc-symbol {
    width: 70px;
    font-weight: 600;
    font-size: 13px;
  }
  :global(.conc-bar) {
    flex: 1;
  }
  .conc-pct {
    width: 60px;
    text-align: right;
    font-size: 13px;
  }
  .sector-row {
    display: flex;
    gap: 24px;
    align-items: center;
  }
  .sector-donut {
    width: 150px;
    height: 150px;
    flex: 0 0 150px;
  }
  .sector-legend {
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
    min-width: 0;
  }
  .sector-legend li {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
  @media (max-width: 768px) {
    .sector-row {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
    }
    .sector-donut {
      width: 130px;
      height: 130px;
      flex: 0 0 130px;
      align-self: center;
    }
  }
  .geo-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  /* ── Accounts tab ─────────────────────────────────────────────────── */
  .acct-head {
    align-items: flex-start;
    gap: 12px;
  }
  .acct-name {
    font-size: 22px;
    font-weight: 600;
    margin-top: 2px;
  }
  .acct-kpis {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .acct-num {
    font-size: 22px;
    margin-top: 2px;
  }
  .acct-spark {
    display: block;
    width: 100%;
    height: 48px;
  }

  /* Custodians tab */
  .cust-divider {
    border: 0;
    border-top: 1px dashed var(--rule-2);
    margin: 18px 0 12px;
  }
  .cust-acct-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .cust-acct-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    border-bottom: 1px dashed var(--rule-2);
    padding-bottom: 6px;
  }
  .cust-acct-row:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
  .cust-acct-name {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 13px;
  }
  .cust-acct-mv {
    flex-shrink: 0;
    font-size: 13px;
  }
</style>
