// Slate · RFQ workflow shared data, helpers, and seed records.

import { CLIENT_BOOK } from '$lib/data/fixtures.js';

export const PRODUCT_TYPES = [
  { id: 'autocall', label: 'Autocallable' },
  { id: 'revconv',  label: 'Reverse Convertible' },
  { id: 'capprot',  label: 'Capital Protected Note' },
  { id: 'buffer',   label: 'Buffer Note' }
];

export const TENORS = ['1Y', '18M', '2Y', '3Y', '5Y'];

export const DESKS = [
  { id: 'jpm',    label: 'JPM Markets' },
  { id: 'ms',     label: 'Morgan Stanley' },
  { id: 'gs',     label: 'Goldman Sachs' },
  { id: 'bnp',    label: 'BNP Paribas' },
  { id: 'socgen', label: 'SocGen' },
  { id: 'ubs',    label: 'UBS' },
  { id: 'barc',   label: 'Barclays' },
  { id: 'citi',   label: 'Citi' }
];

// Per-product "Solve for" options. Each desk competes on these dimensions.
export const SOLVE_OPTIONS = {
  autocall: [
    ['coupon', 'Max coupon'],
    ['capBarrier', 'Best capital barrier'],
    ['acBarrier', 'Lowest autocall barrier']
  ],
  revconv: [
    ['coupon', 'Max coupon'],
    ['capBarrier', 'Best capital barrier']
  ],
  capprot: [
    ['participation', 'Highest participation'],
    ['cap', 'Highest cap'],
    ['protection', 'Highest protection']
  ],
  buffer: [
    ['participation', 'Highest participation'],
    ['cap', 'Highest cap'],
    ['buffer', 'Largest buffer']
  ]
};

// Simulated dealer responses. SocGen never responds — shows pending.
export const SIMULATED_QUOTES = [
  { desk: 'gs',  delay: 2200, coupon: 9.15, capBarrier: 55, issuePrice: 100.00, validityMs: 1.5 * 3600 * 1000, note: 'Better protection at expense of coupon.' },
  { desk: 'jpm', delay: 3700, coupon: 9.45, capBarrier: 60, issuePrice: 100.05, validityMs:   5 * 3600 * 1000, note: 'Memory feature included; quarterly observations.' },
  { desk: 'ms',  delay: 5400, coupon: 9.20, capBarrier: 60, issuePrice: 100.00, validityMs:   3 * 3600 * 1000, note: 'Standard terms.' },
  { desk: 'bnp', delay: 8000, coupon: 8.90, capBarrier: 65, issuePrice: 100.10, validityMs:   8 * 3600 * 1000, note: 'EOD validity. Bid against own retail flow.' }
];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function formatCountdown(ms) {
  if (ms <= 0) return 'Expired';
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function countdownTone(ms) {
  if (ms <= 0) return 'gray';
  const minutes = ms / 60000;
  if (minutes < 30) return 'red';
  if (minutes < 120) return 'amber';
  return 'green';
}

export const deskLabel = (id) => (DESKS.find((x) => x.id === id) || {}).label || id;

export function nextRfqId() {
  const yr = new Date().getFullYear();
  const seq = String(140 + Math.floor(Math.random() * 60)).padStart(4, '0');
  return `SP-${yr}-${seq}`;
}

// An RFQ is "active" while the overall deadline countdown is still running
// OR any desk hasn't responded yet. Otherwise it's closed → Expired.
export function isActiveRfq(rfq, now) {
  if (rfq.deadlineAt > now) return true;
  if (rfq.quotes.some((q) => q.status === 'pending')) return true;
  return false;
}

export function fmtRelative(ts, now) {
  const diff = now - ts;
  if (diff < 60 * 1000) return 'just now';
  if (diff < 60 * 60 * 1000) return Math.max(1, Math.round(diff / (60 * 1000))) + 'm ago';
  if (diff < 24 * 60 * 60 * 1000) return Math.round(diff / (60 * 60 * 1000)) + 'h ago';
  return Math.round(diff / (24 * 60 * 60 * 1000)) + 'd ago';
}

// Pull recipients from the live client book; synthesize emails when absent.
export function getRecipients() {
  const synth = (id, name) => {
    const slug = String(id || name || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return slug + '@example.com';
  };
  return (CLIENT_BOOK || []).map((c) => ({
    id: c.id,
    name: c.name,
    email: (c.email || synth(c.id, c.name)).toLowerCase()
  }));
}

// Seed RFQs so Active and Expired tabs aren't empty on first load.
export function seedRfqs() {
  const now = Date.now();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  return [
    {
      id: 'SP-2026-0156',
      sentAt: now - 25 * minute,
      deadlineAt: now + 35 * minute,
      config: {
        productLabel: 'Autocallable', productType: 'autocall',
        underlyings: ['NDX'], notional: '3,000,000', currency: 'USD', tenor: '2Y',
        strike: 100, autocallBarrier: 100, coupBarrier: 70, capBarrier: 60,
        memory: true, observation: 'quarterly'
      },
      quotes: [
        { deskId: 'jpm', status: 'quoted', coupon: 8.85, capBarrier: 60, issuePrice: 100.05, receivedAt: now - 22 * minute, expiresAt: now + 4 * hour, note: 'Memory feature included.' },
        { deskId: 'gs',  status: 'quoted', coupon: 8.55, capBarrier: 55, issuePrice: 100.00, receivedAt: now - 18 * minute, expiresAt: now + 90 * minute, note: 'Better protection.' },
        { deskId: 'bnp', status: 'pending', coupon: null, capBarrier: null, issuePrice: null, receivedAt: null, expiresAt: null, note: null },
        { deskId: 'ubs', status: 'pending', coupon: null, capBarrier: null, issuePrice: null, receivedAt: null, expiresAt: null, note: null }
      ]
    },
    {
      id: 'SP-2026-0142',
      sentAt: now - 3 * day,
      deadlineAt: now - 3 * day + hour,
      config: {
        productLabel: 'Reverse Convertible', productType: 'revconv',
        underlyings: ['TSLA'], notional: '2,000,000', currency: 'USD', tenor: '1Y',
        strike: 100, capBarrier: 70, barrierObs: 'european'
      },
      quotes: [
        { deskId: 'gs',  status: 'quoted', coupon: 11.20, capBarrier: 70, issuePrice: 100.00, receivedAt: now - 3 * day + 12 * minute, expiresAt: now - 3 * day + 6 * hour, note: 'Standard terms.' },
        { deskId: 'jpm', status: 'quoted', coupon: 11.50, capBarrier: 65, issuePrice: 100.05, receivedAt: now - 3 * day + 18 * minute, expiresAt: now - 3 * day + 6 * hour, note: 'Aggressive on coupon.' },
        { deskId: 'ms',  status: 'quoted', coupon: 10.95, capBarrier: 70, issuePrice: 100.00, receivedAt: now - 3 * day + 22 * minute, expiresAt: now - 3 * day + 6 * hour, note: 'European observation.' }
      ]
    }
  ];
}

// Indicative metric — what desks compete on. Different products have
// different headline numbers (coupon vs participation), so we return
// a { label, value, unit } object the band renders generically.
export function computeIndicative(state) {
  const { productType, tenor, strike, capBarrier, coupBarrier, autocallBarrier, memory, underlyings, barrierObs, protection, upsideCap, buffer } = state;
  const tenorYears = { '1Y': 1, '18M': 1.5, '2Y': 2, '3Y': 3, '5Y': 5 }[tenor] || 3;
  const undAdj = Math.max(0, (underlyings.length - 1) * 0.5);

  if (productType === 'autocall') {
    const t =
      7.5 +
      (capBarrier - 60) * 0.04 +
      (coupBarrier - 70) * 0.03 +
      (autocallBarrier - 100) * 0.03 +
      (tenorYears - 3) * 0.4 +
      (memory ? -0.2 : 0) +
      (100 - strike) * 0.02 +
      undAdj;
    return { label: 'Indicative coupon', value: Math.max(0.5, t).toFixed(2), unit: '% p.a.' };
  }
  if (productType === 'revconv') {
    const t =
      8.5 +
      (capBarrier - 60) * 0.05 +
      (tenorYears - 1) * 0.6 +
      (barrierObs === 'continuous' ? 0.5 : 0) +
      (100 - strike) * 0.03 +
      undAdj;
    return { label: 'Indicative coupon', value: Math.max(0.5, t).toFixed(2), unit: '% p.a.' };
  }
  if (productType === 'capprot') {
    const t = 100 - (protection - 95) * 4 + (tenorYears - 3) * 8 + (upsideCap > 0 ? 0 : -10) - undAdj * 5;
    return { label: 'Indicative participation', value: Math.max(20, t).toFixed(0), unit: '%' };
  }
  // buffer
  const t = 100 - buffer * 1.2 + (tenorYears - 3) * 5 + (upsideCap > 0 ? 0 : -8) - undAdj * 4;
  return { label: 'Indicative participation', value: Math.max(30, t).toFixed(0), unit: '%' };
}

// Pre-built templates for popular products. Selecting one prefills the
// New RFQ form so the WM can tweak and send in a few clicks.
export const TEMPLATES = [
  {
    id: 'spx-phoenix',
    name: 'SPX Phoenix Memory Autocallable',
    productLabel: 'Autocallable',
    indicative: '~9% p.a.',
    keyTerms: '3Y · 70/60 · memory',
    description: 'Quarterly autocall on S&P 500 with memory coupon. Mid-vol benchmark for HNW allocations.',
    config: {
      productType: 'autocall',
      underlyings: ['SPX'],
      tenor: '3Y',
      strike: 100,
      autocallBarrier: 100,
      coupBarrier: 70,
      capBarrier: 60,
      memory: true,
      observation: 'quarterly',
      notional: '5,000,000',
      currency: 'USD',
      solveFor: 'coupon'
    }
  },
  {
    id: 'worstof-mag7',
    name: 'Worst-of MAG7 Tech Autocall',
    productLabel: 'Autocallable',
    indicative: '~14% p.a.',
    keyTerms: '2Y · worst-of · 65/55',
    description: 'High-coupon worst-of basket on mega-cap tech. Heavy risk premium for concentration.',
    config: {
      productType: 'autocall',
      underlyings: ['AAPL', 'MSFT', 'NVDA', 'GOOGL'],
      tenor: '2Y',
      strike: 100,
      autocallBarrier: 100,
      coupBarrier: 65,
      capBarrier: 55,
      memory: true,
      observation: 'quarterly',
      notional: '3,000,000',
      currency: 'USD',
      solveFor: 'coupon'
    }
  },
  {
    id: 'aapl-revconv',
    name: 'AAPL Reverse Convertible',
    productLabel: 'Reverse Convertible',
    indicative: '~12% p.a.',
    keyTerms: '1Y · 70% barrier · European',
    description: 'Fixed coupon paid regardless. European barrier observed only at maturity.',
    config: {
      productType: 'revconv',
      underlyings: ['AAPL'],
      tenor: '1Y',
      strike: 100,
      capBarrier: 70,
      barrierObs: 'european',
      notional: '2,000,000',
      currency: 'USD',
      solveFor: 'coupon'
    }
  },
  {
    id: 'capprot-spx',
    name: '5Y Capital Protected SPX',
    productLabel: 'Capital Protected Note',
    indicative: '~110% participation',
    keyTerms: '5Y · 100% protected · capped 180%',
    description: 'Full capital protection at maturity. Variable participation in S&P upside.',
    config: {
      productType: 'capprot',
      underlyings: ['SPX'],
      tenor: '5Y',
      strike: 100,
      protection: 100,
      upsideCap: 180,
      notional: '5,000,000',
      currency: 'USD',
      solveFor: 'participation'
    }
  },
  {
    id: 'buffer-ndx',
    name: '3Y NDX Buffer Note',
    productLabel: 'Buffer Note',
    indicative: '~95% participation',
    keyTerms: '3Y · 15% buffer · 140% cap',
    description: 'First 15% of NDX losses absorbed; 1:1 below that. Modest upside cap.',
    config: {
      productType: 'buffer',
      underlyings: ['NDX'],
      tenor: '3Y',
      strike: 100,
      buffer: 15,
      upsideCap: 140,
      notional: '3,000,000',
      currency: 'USD',
      solveFor: 'participation'
    }
  },
  {
    id: 'worstof-eubanks',
    name: 'Worst-of EU Banks Autocall',
    productLabel: 'Autocallable',
    indicative: '~11% p.a.',
    keyTerms: '2Y · worst-of · 75/55',
    description: 'Worst-of basket of European bank names. Macro hedge with downside cushion.',
    config: {
      productType: 'autocall',
      underlyings: ['BNP', 'SAN', 'ING'],
      tenor: '2Y',
      strike: 100,
      autocallBarrier: 100,
      coupBarrier: 75,
      capBarrier: 55,
      memory: true,
      observation: 'semiannual',
      notional: '2,000,000',
      currency: 'EUR',
      solveFor: 'coupon'
    }
  }
];

export const PAYOFF_COLORS = ['var(--accent)', 'var(--pos)', 'var(--neg)', 'var(--warn)', 'var(--ink)'];

// x: underlying at maturity as % of strike (100 = at-the-money).
// Returns: payoff as % of notional.
export function payoffAt(productType, p, x) {
  if (productType === 'autocall') {
    if (x >= (p.capBarrier ?? 60)) return 100 + (p.coupon || 0);
    return x;
  }
  if (productType === 'revconv') {
    const c = p.coupon || 0;
    if (x >= (p.capBarrier ?? 70)) return 100 + c;
    return x + c;
  }
  if (productType === 'capprot') {
    const prot = p.protection ?? 95;
    const cap = p.upsideCap ?? 0;
    if (x <= 100) return Math.max(prot, x);
    return cap > 0 ? Math.min(x, cap) : x;
  }
  if (productType === 'buffer') {
    const buf = p.buffer ?? 15;
    const cap = p.upsideCap ?? 0;
    if (x >= 100) return cap > 0 ? Math.min(x, cap) : x;
    if (x >= 100 - buf) return 100;
    return x + buf;
  }
  return x;
}
