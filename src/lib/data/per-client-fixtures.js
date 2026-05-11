// Synthetic per-client variants for the major fixtures. Marchetti's data
// stays in fixtures.js (it's the canonical demo); this file fills in the
// other four households so meet-mode pages render real-looking content
// instead of falling back to Marchetti.

// ─── AL-KHALID FAMILY OFFICE ─────────────────────────────────────────
// FO · on-target · ~$185M · Pershing + Goldman · 6 accounts.

export const AL_KHALID_ACCOUNTS = [
  { id: 'pershing-master', name: 'Master Trust', custodian: 'Pershing', entity: 'Al-Khalid 2010 Trust', type: 'trust' },
  { id: 'pershing-op',     name: 'Operating LLC', custodian: 'Pershing', entity: 'AK Holdings LLC',      type: 'taxable' },
  { id: 'goldman-priv',    name: 'Private Bank',  custodian: 'Goldman',  entity: 'Khalid Al-Khalid',     type: 'taxable' },
  { id: 'goldman-foundation', name: 'Foundation', custodian: 'Goldman',  entity: 'Al-Khalid Foundation', type: 'foundation' },
  { id: 'pershing-childtrust', name: 'Children\'s Trust', custodian: 'Pershing', entity: 'AK Children\'s Trust', type: 'trust' },
  { id: 'goldman-coinvest',    name: 'Co-invest Vehicle',  custodian: 'Goldman', entity: 'AK GP LLC', type: 'taxable' }
];

export const AL_KHALID_POSITIONS = [
  { id: 'akp1', symbol: 'VOO',  name: 'Vanguard S&P 500 ETF',     account: 'pershing-master', assetClass: 'us_equity',    sector: 'broad',  qty: 145000, price: 480.00, mv: 69_600_000, cost: 52_000_000 },
  { id: 'akp2', symbol: 'VEA',  name: 'Vanguard Developed Mkts',  account: 'pershing-master', assetClass: 'intl_equity',  sector: 'broad',  qty: 240000, price:  56.50, mv: 13_560_000, cost: 11_800_000 },
  { id: 'akp3', symbol: 'EEMV', name: 'iShares MSCI EM Min Vol',  account: 'goldman-priv',    assetClass: 'em_equity',    sector: 'broad',  qty:  90000, price:  68.20, mv:  6_138_000, cost:  5_900_000 },
  { id: 'akp4', symbol: 'AGG',  name: 'iShares Core US Agg Bond', account: 'pershing-master', assetClass: 'fixed_income', sector: 'broad',  qty: 320000, price:  98.40, mv: 31_488_000, cost: 31_200_000 },
  { id: 'akp5', symbol: 'MUB',  name: 'iShares National Muni',    account: 'pershing-childtrust', assetClass: 'munis',    sector: 'broad',  qty: 110000, price: 106.20, mv: 11_682_000, cost: 11_500_000 },
  { id: 'akp6', symbol: 'GS-DL', name: 'GS Direct Lending IV',    account: 'goldman-coinvest', assetClass: 'alts',         sector: 'private_credit', qty: 1, price: 14_500_000, mv: 14_500_000, cost: 12_000_000 },
  { id: 'akp7', symbol: 'GS-RE', name: 'GS Infrastructure Partners', account: 'goldman-coinvest', assetClass: 'alts',     sector: 'real_assets',    qty: 1, price:  8_200_000, mv:  8_200_000, cost:  7_500_000 },
  { id: 'akp8', symbol: 'CASH', name: 'USD Treasury MMF',         account: 'pershing-op',     assetClass: 'cash',         sector: 'cash',   qty: 12_500_000, price: 1.00, mv: 12_500_000, cost: 12_500_000 },
  { id: 'akp9', symbol: 'AED',  name: 'AED Operating Cash',       account: 'pershing-op',     assetClass: 'cash',         sector: 'cash',   qty:  4_200_000, price: 1.00, mv:  4_200_000, cost:  4_200_000 },
  { id: 'akp10', symbol: 'EFAX', name: 'EUR Hedged DM Bonds',     account: 'goldman-foundation', assetClass: 'fixed_income', sector: 'broad', qty:  85000, price:  43.20, mv:  3_672_000, cost:  3_600_000 },
  { id: 'akp11', symbol: 'BX',  name: 'Blackstone Inc',           account: 'goldman-priv',    assetClass: 'us_equity',    sector: 'fin',    qty:  35000, price: 195.00, mv:  6_825_000, cost:  4_500_000 },
  { id: 'akp12', symbol: 'GOOGL', name: 'Alphabet Inc Class A',   account: 'goldman-priv',    assetClass: 'us_equity',    sector: 'tech',   qty:  18000, price: 175.50, mv:  3_159_000, cost:  2_400_000 }
];

export const AL_KHALID_BRIEFING = {
  family: {
    primary: { name: 'Khalid Al-Khalid',     role: 'Patriarch',  age: 64 },
    spouse:  { name: 'Layla Al-Khalid',      role: 'Spouse',     age: 60 },
    children: [
      { name: 'Yousef Al-Khalid', age: 32, status: 'Operating partner · AK Industries' },
      { name: 'Mariam Al-Khalid', age: 28, status: 'INSEAD MBA · 2025' },
      { name: 'Tariq Al-Khalid',  age: 22, status: 'Imperial College · final year' }
    ]
  },
  team: [
    { role: 'Wealth Manager',         name: 'Christine Holloway', primary: true },
    { role: 'Investment Specialist',  name: 'David Chen' },
    { role: 'International Tax Lead', name: 'Sophie Renault' },
    { role: 'Pershing FX Desk',       name: 'Marcus Howell' }
  ],
  external: [
    { role: 'Family Attorney',  name: 'Linklaters · Omar Idris' },
    { role: 'CPA',              name: 'Deloitte UAE · Hassan Saleh' },
    { role: 'Foundation Counsel', name: 'Withers · Eleanor Park' }
  ],
  nextMeeting: {
    type: 'Quarterly review',
    date: '2026-07-08',
    time: '10:00 GST',
    location: 'Dubai · DIFC office',
    attendees: ['Khalid Al-Khalid', 'Yousef Al-Khalid', 'Christine Holloway'],
    agenda: [
      'Northwind Climate Infrastructure subscription',
      'EUR / GBP cash sweep policy update',
      'Foundation grant disbursement schedule',
      'Mariam\'s post-MBA capital allocation'
    ]
  },
  lastMeeting: {
    type: 'Annual review',
    date: '2026-04-12',
    attendees: ['Khalid Al-Khalid', 'Layla Al-Khalid', 'Christine Holloway', 'David Chen'],
    summary: 'Confirmed IPS targets unchanged. Approved Atlas Direct Lending VII at $5M. Follow-up on FX overlay program approval.'
  },
  followUps: [
    { status: 'open',      priority: 'high',   due: '2026-06-15', commit: 'Confirm Atlas DL VII subscription docs returned' },
    { status: 'open',      priority: 'medium', due: '2026-06-30', commit: 'Send Mariam\'s draft IPS for review' },
    { status: 'completed', priority: 'low',    due: '2026-05-01', commit: 'File foundation 2025 990-PF (filed 2026-04-28)' }
  ],
  upcoming: [
    { date: '2026-06-30', label: 'Atlas Direct Lending VII — final close', kind: 'subscription', priority: 'high' },
    { date: '2026-07-08', label: 'Quarterly review (Dubai office)',        kind: 'meeting',      priority: 'medium' },
    { date: '2026-08-22', label: 'Northwind Climate — close',              kind: 'subscription', priority: 'medium' },
    { date: '2026-09-15', label: 'Foundation Q3 disbursement window',      kind: 'compliance',   priority: 'low' }
  ],
  contactLog: [
    { date: '2026-05-04', kind: 'email',   with: 'Khalid',          subject: 'Atlas DL VII subscription docs · sent for sig' },
    { date: '2026-05-01', kind: 'call',    with: 'Yousef',          subject: 'FX overlay program · 30 min call with Pershing' },
    { date: '2026-04-22', kind: 'meeting', with: 'Eleanor (Withers)', subject: 'Foundation grant policy · annual refresh' },
    { date: '2026-04-12', kind: 'meeting', with: 'Khalid, Layla',   subject: 'Annual review' },
    { date: '2026-04-04', kind: 'note',    with: '—',               subject: 'Khalid mentioned Riyadh real estate co-invest interest' }
  ],
  news: [
    { date: '2026-05-05', position: 'EUR',     impact: 'mixed',    headline: 'ECB · Q2 dovish hold, EUR weakens vs USD on guidance' },
    { date: '2026-05-02', position: 'GS-INFRA', impact: 'positive', headline: 'GS Infrastructure II · refinancing distribution announced' },
    { date: '2026-04-29', position: 'OIL',     impact: 'caution',  headline: 'Brent crude flat — Gulf-correlated equity exposure flagged' },
    { date: '2026-04-25', position: 'TOTL',    impact: 'positive', headline: 'EM debt fund · April spread tightening drives MTD outperformance' }
  ],
  personalNotes: [
    'Mariam graduating INSEAD May 2025 — discuss post-MBA capital allocation',
    'Tariq Imperial College final year — UK residency status to confirm with Linklaters',
    'Family foundation pivoting toward education grants in MENA region'
  ]
};

export const AL_KHALID_CASHFLOW = [
  { q: '2026Q3', dividends:  220000, bondCoupons: 280000, structuredCoupons:     0, cashInterest: 195000, altDistributions:        0, altCalls: -2_500_000, fees: -185000, taxes: -180000, lifestyle: -350000 },
  { q: '2026Q4', dividends:  215000, bondCoupons: 290000, structuredCoupons:     0, cashInterest: 195000, altDistributions:        0, altCalls:  -800_000, fees: -185000, taxes:       0, lifestyle: -350000 },
  { q: '2027Q1', dividends:  225000, bondCoupons: 280000, structuredCoupons:     0, cashInterest: 180000, altDistributions:  1_200_000, altCalls: -1_400_000, fees: -195000, taxes: -300000, lifestyle: -350000 },
  { q: '2027Q2', dividends:  220000, bondCoupons: 290000, structuredCoupons:     0, cashInterest: 180000, altDistributions:        0, altCalls: -1_200_000, fees: -195000, taxes: -150000, lifestyle: -350000 },
  { q: '2027Q3', dividends:  225000, bondCoupons: 280000, structuredCoupons:     0, cashInterest: 180000, altDistributions:        0, altCalls: -2_100_000, fees: -210000, taxes: -150000, lifestyle: -350000 }
];

export const AL_KHALID_ALT_STRATEGY_MIX = [
  { key: 'buyout',      label: 'Private Equity (Buyout)', target: 30, actual: 18, mvActual:  4_100_000 },
  { key: 'credit',      label: 'Private Credit',          target: 30, actual: 47, mvActual: 14_500_000 },
  { key: 'real_assets', label: 'Real Assets / Infra',     target: 20, actual: 27, mvActual:  8_200_000 },
  { key: 'venture',     label: 'Venture',                 target: 10, actual:  3, mvActual:    900_000 },
  { key: 'secondaries', label: 'PE Secondaries',          target: 10, actual:  5, mvActual:  1_500_000 }
];

export const AL_KHALID_ALT_JCURVE = [
  { q: '2022Q4', called:  4_000_000, distributed:        0, nav:  3_700_000 },
  { q: '2023Q2', called:  8_500_000, distributed:        0, nav:  8_200_000 },
  { q: '2023Q4', called: 12_500_000, distributed:    300_000, nav: 12_900_000 },
  { q: '2024Q2', called: 16_000_000, distributed:    900_000, nav: 17_400_000 },
  { q: '2024Q4', called: 19_000_000, distributed:  1_900_000, nav: 21_600_000 },
  { q: '2025Q2', called: 22_000_000, distributed:  3_400_000, nav: 25_800_000 },
  { q: '2025Q4', called: 25_500_000, distributed:  5_500_000, nav: 28_500_000 },
  { q: '2026Q2', called: 28_000_000, distributed:  7_800_000, nav: 30_200_000 }
];

export const AL_KHALID_ALT_CASHFLOW = [
  { q: '2026Q3', calls: -2_500_000, dist:        0, notes: 'Atlas DL VII initial draw' },
  { q: '2026Q4', calls:  -800_000, dist:        0, notes: 'Northwind Climate — yr-1 commitment' },
  { q: '2027Q1', calls: -1_400_000, dist:  1_200_000, notes: 'GS Infra partial dist · Northwind yr-2 draw' },
  { q: '2027Q2', calls: -1_200_000, dist:        0, notes: 'Atlas DL VII follow-on' },
  { q: '2027Q3', calls: -2_100_000, dist:        0, notes: 'Multi-fund draw quarter' },
  { q: '2027Q4', calls:        0, dist:  2_400_000, notes: 'GS Infra II refinancing dist.' },
  { q: '2028Q1', calls: -1_000_000, dist:    600_000, notes: 'Pacing-plan rolling draws + dist.' }
];

export const AL_KHALID_UNFUNDED_LADDER = [
  { bucket: '0–6 mo',   amount: 3_300_000, instrument: 'T-Bill MMF + 3-mo bills',     yield: 5.10, covers: '2026 calls — Atlas DL VII initial, Northwind yr-1' },
  { bucket: '6–18 mo',  amount: 4_700_000, instrument: '6–12 mo T-Bills (laddered)',  yield: 4.85, covers: '2027 calls — Northwind yr-2, Atlas follow-on' },
  { bucket: '18–30 mo', amount: 3_200_000, instrument: '1–2 yr Treasuries',           yield: 4.65, covers: '2028 calls — multi-fund pacing' },
  { bucket: '30 mo+',   amount: 1_800_000, instrument: '2–3 yr Treasuries',           yield: 4.45, covers: '2029+ — long-tail draws' }
];

// ─── WHITMORE LIVING TRUST ────────────────────────────────────────────
// HNW · fixed-income heavy · ~$42M · Schwab · 2 accounts.

export const WHITMORE_ACCOUNTS = [
  { id: 'schwab-trust', name: 'Whitmore Living Trust', custodian: 'Schwab', entity: 'Whitmore 2008 Trust',  type: 'trust' },
  { id: 'schwab-roth',  name: 'Roth IRA',              custodian: 'Schwab', entity: 'Theodore Whitmore',    type: 'retirement' }
];

export const WHITMORE_POSITIONS = [
  { id: 'wmp1', symbol: 'MUB',   name: 'iShares National Muni',     account: 'schwab-trust', assetClass: 'munis',        sector: 'broad', qty:  82_000, price: 106.20, mv:  8_708_400, cost:  8_500_000 },
  { id: 'wmp2', symbol: 'NY5L',  name: 'NY GO 5% 2034',             account: 'schwab-trust', assetClass: 'munis',        sector: 'state', qty:   3_500_000, price: 1.04, mv:  3_640_000, cost:  3_500_000 },
  { id: 'wmp3', symbol: 'CA4M',  name: 'CA GO 4% 2030',             account: 'schwab-trust', assetClass: 'munis',        sector: 'state', qty:   2_800_000, price: 1.02, mv:  2_856_000, cost:  2_800_000 },
  { id: 'wmp4', symbol: 'GOVT',  name: 'iShares US Treasury Bond',  account: 'schwab-trust', assetClass: 'fixed_income', sector: 'broad', qty: 110_000, price:  22.50, mv:  2_475_000, cost:  2_400_000 },
  { id: 'wmp5', symbol: 'VTI',   name: 'Vanguard Total Stock Mkt',  account: 'schwab-trust', assetClass: 'us_equity',    sector: 'broad', qty:  35_000, price: 248.00, mv:  8_680_000, cost:  6_200_000 },
  { id: 'wmp6', symbol: 'SCHD',  name: 'Schwab US Dividend Equity', account: 'schwab-trust', assetClass: 'us_equity',    sector: 'div',   qty:  60_000, price:  82.30, mv:  4_938_000, cost:  4_300_000 },
  { id: 'wmp7', symbol: 'BIL',   name: 'SPDR 1-3 Mo T-Bill',        account: 'schwab-trust', assetClass: 'cash',         sector: 'cash',  qty:  35_000, price:  91.50, mv:  3_202_500, cost:  3_200_000 },
  { id: 'wmp8', symbol: 'BND',   name: 'Vanguard Total Bond Market',account: 'schwab-roth',  assetClass: 'fixed_income', sector: 'broad', qty:  50_000, price:  74.80, mv:  3_740_000, cost:  3_650_000 },
  { id: 'wmp9', symbol: 'VTI-R', name: 'Vanguard Total Stock Mkt',  account: 'schwab-roth',  assetClass: 'us_equity',    sector: 'broad', qty:  16_000, price: 248.00, mv:  3_968_000, cost:  2_900_000 }
];

export const WHITMORE_BRIEFING = {
  family: {
    primary: { name: 'Theodore Whitmore', role: 'Settlor',     age: 78 },
    spouse:  { name: 'Margaret Whitmore', role: 'Co-trustee',  age: 75 },
    children: [
      { name: 'David Whitmore',  age: 48, status: 'Successor trustee · Boston' },
      { name: 'Sarah Whitmore-Reyes', age: 44, status: 'Beneficiary · Seattle' }
    ]
  },
  team: [
    { role: 'Wealth Manager',  name: 'Christine Holloway', primary: true },
    { role: 'Trust Officer',   name: 'James Whitman' },
    { role: 'Tax Specialist',  name: 'Ramona Patel' }
  ],
  external: [
    { role: 'Trust Attorney', name: 'Choate Hall · Eleanor Pierce' },
    { role: 'CPA',            name: 'BDO · Henry Mead' }
  ],
  nextMeeting: {
    type: 'Annual trustee review',
    date: '2026-05-22',
    time: '14:00 ET',
    location: 'Slate office · video call',
    attendees: ['Theodore Whitmore', 'Margaret Whitmore', 'David Whitmore', 'Christine Holloway'],
    agenda: [
      'Review overdue — file 2025 trustee report within grace window',
      'Bond ladder duration drift (currently 8.2y vs 6y target)',
      'Q4 distribution planning',
      'Successor trustee transition checklist'
    ]
  },
  lastMeeting: {
    type: 'Trust planning call',
    date: '2025-04-15',
    attendees: ['Theodore Whitmore', 'Christine Holloway', 'James Whitman'],
    summary: 'Approved 30y muni reinvestment from Feb maturities. Confirmed annual distribution at 4% of trailing-3yr NAV.'
  },
  followUps: [
    { status: 'open',      priority: 'high',   due: '2026-05-15', commit: 'Compile trustee meeting pack and circulate' },
    { status: 'open',      priority: 'high',   due: '2026-05-30', commit: 'Begin ladder rebalance — sell $4M of 30y munis' },
    { status: 'open',      priority: 'medium', due: '2026-06-30', commit: 'Update beneficiary contact info if changed' },
    { status: 'completed', priority: 'medium', due: '2026-04-01', commit: '2025 K-1s issued to beneficiaries (issued 2026-03-28)' }
  ],
  upcoming: [
    { date: '2026-05-22', label: 'Annual trustee review (overdue grace window)', kind: 'compliance', priority: 'high' },
    { date: '2026-08-01', label: 'Aug muni coupon receipts',                     kind: 'cashflow',   priority: 'low' },
    { date: '2026-12-15', label: 'Q4 trust distribution ($420k)',                kind: 'cashflow',   priority: 'medium' },
    { date: '2027-02-01', label: 'Feb muni coupon receipts',                     kind: 'cashflow',   priority: 'low' }
  ],
  contactLog: [
    { date: '2026-05-02', kind: 'email',   with: 'James Whitman',  subject: 'Trustee review pack · draft sent for review' },
    { date: '2026-04-28', kind: 'call',    with: 'Theodore',       subject: 'Successor-trustee transition · 20 min' },
    { date: '2026-04-15', kind: 'meeting', with: 'Theodore',       subject: 'Trust planning call' },
    { date: '2026-03-28', kind: 'email',   with: 'beneficiaries',  subject: '2025 K-1s issued (3 packets)' }
  ],
  news: [
    { date: '2026-05-04', position: 'NY5L',  impact: 'mixed',   headline: 'NY GO 5% 2034 · spreads tighten on state revenue beat' },
    { date: '2026-05-02', position: 'BONDS', impact: 'mixed',   headline: 'Fed minutes · 2026 cut path more dovish than priced' },
    { date: '2026-04-29', position: 'MUB',   impact: 'positive', headline: 'Muni broad index · 30-day yield holds 3.45% post-rebalance' },
    { date: '2026-04-22', position: 'GOVT', impact: 'caution', headline: 'Treasury auction · 10y demand softer, watch reinvestment yield' }
  ],
  personalNotes: [
    'Theodore (76) — health stable; successor trustee planning is current priority',
    'Income-generating sleeve must support $1.7M / yr distribution to beneficiaries',
    'Trust amendment under review with Hartwell — split between two granddaughters'
  ]
};

export const WHITMORE_CASHFLOW = [
  { q: '2026Q3', dividends:  72000, bondCoupons: 220000, structuredCoupons: 0, cashInterest:  42000, altDistributions: 0, altCalls: 0, fees: -52000, taxes:  -45000, lifestyle: -105000 },
  { q: '2026Q4', dividends:  72000, bondCoupons: 240000, structuredCoupons: 0, cashInterest:  42000, altDistributions: 0, altCalls: 0, fees: -52000, taxes:       0, lifestyle: -420000 },
  { q: '2027Q1', dividends:  74000, bondCoupons: 220000, structuredCoupons: 0, cashInterest:  40000, altDistributions: 0, altCalls: 0, fees: -55000, taxes: -100000, lifestyle: -105000 },
  { q: '2027Q2', dividends:  72000, bondCoupons: 240000, structuredCoupons: 0, cashInterest:  40000, altDistributions: 0, altCalls: 0, fees: -55000, taxes:  -50000, lifestyle: -105000 },
  { q: '2027Q3', dividends:  74000, bondCoupons: 220000, structuredCoupons: 0, cashInterest:  40000, altDistributions: 0, altCalls: 0, fees: -58000, taxes:  -50000, lifestyle: -105000 }
];

export const WHITMORE_ALT_STRATEGY_MIX = [
  { key: 'buyout',      label: 'Private Equity (Buyout)', target:  0, actual:  0, mvActual: 0 },
  { key: 'credit',      label: 'Private Credit',          target:  0, actual:  0, mvActual: 0 },
  { key: 'real_assets', label: 'Real Assets / Infra',     target:  0, actual:  0, mvActual: 0 },
  { key: 'venture',     label: 'Venture',                 target:  0, actual:  0, mvActual: 0 }
];
export const WHITMORE_ALT_JCURVE = [];
export const WHITMORE_ALT_CASHFLOW = [];
export const WHITMORE_UNFUNDED_LADDER = [];

// ─── MONTEIRO & PARTNERS (FAMILY OFFICE) ─────────────────────────────
// FO · multi-currency · ~$315M · Pershing + Schwab + UBS · 8 accounts.

export const MONTEIRO_ACCOUNTS = [
  { id: 'pershing-holdings', name: 'Holdings LLC',        custodian: 'Pershing', entity: 'Monteiro Holdings LLC',   type: 'taxable' },
  { id: 'pershing-foundation', name: 'Foundation',         custodian: 'Pershing', entity: 'Monteiro Foundation',     type: 'foundation' },
  { id: 'schwab-joint',      name: 'Joint Brokerage',     custodian: 'Schwab',   entity: 'A. & P. Monteiro',         type: 'taxable' },
  { id: 'schwab-roth-ana',   name: 'Roth IRA · Ana',      custodian: 'Schwab',   entity: 'Ana Monteiro',             type: 'retirement' },
  { id: 'schwab-roth-pedro', name: 'Roth IRA · Pedro',    custodian: 'Schwab',   entity: 'Pedro Monteiro',           type: 'retirement' },
  { id: 'ubs-lisbon',        name: 'Lisbon Operating',    custodian: 'UBS',      entity: 'Monteiro Iberica Lda',     type: 'taxable' },
  { id: 'ubs-trust-eu',      name: 'EU Trust',            custodian: 'UBS',      entity: 'Monteiro EU Discretionary',type: 'trust' },
  { id: 'pershing-children', name: 'Children\'s Trust',   custodian: 'Pershing', entity: 'Monteiro Children\'s Trust',type: 'trust' }
];

export const MONTEIRO_POSITIONS = [
  { id: 'mnp1',  symbol: 'VOO',  name: 'Vanguard S&P 500 ETF',        account: 'pershing-holdings', assetClass: 'us_equity',   sector: 'broad', qty: 215_000, price: 480.00, mv: 103_200_000, cost:  78_000_000 },
  { id: 'mnp2',  symbol: 'VEA',  name: 'Vanguard Developed Markets',  account: 'ubs-trust-eu',     assetClass: 'intl_equity', sector: 'broad', qty: 480_000, price:  56.50, mv:  27_120_000, cost:  24_500_000 },
  { id: 'mnp3',  symbol: 'EWP',  name: 'iShares MSCI Spain ETF',      account: 'ubs-lisbon',       assetClass: 'intl_equity', sector: 'iberia',qty: 320_000, price:  31.40, mv:  10_048_000, cost:   9_800_000 },
  { id: 'mnp4',  symbol: 'EZU',  name: 'iShares MSCI Eurozone ETF',   account: 'ubs-trust-eu',     assetClass: 'intl_equity', sector: 'broad', qty: 340_000, price:  47.20, mv:  16_048_000, cost:  15_200_000 },
  { id: 'mnp5',  symbol: 'AGG',  name: 'iShares Core US Agg Bond',    account: 'pershing-holdings', assetClass: 'fixed_income', sector: 'broad', qty: 410_000, price:  98.40, mv:  40_344_000, cost:  40_000_000 },
  { id: 'mnp6',  symbol: 'BNDX', name: 'Vanguard Total Intl Bond',    account: 'ubs-trust-eu',     assetClass: 'fixed_income', sector: 'broad', qty: 380_000, price:  48.20, mv:  18_316_000, cost:  18_000_000 },
  { id: 'mnp7',  symbol: 'PE-1', name: 'Carlyle Europe V',            account: 'pershing-holdings', assetClass: 'alts',        sector: 'private_equity', qty: 1, price: 12_500_000, mv: 12_500_000, cost: 10_000_000 },
  { id: 'mnp8',  symbol: 'PC-1', name: 'Permira Credit III',          account: 'pershing-holdings', assetClass: 'alts',        sector: 'private_credit', qty: 1, price:  9_400_000, mv:  9_400_000, cost:  8_500_000 },
  { id: 'mnp9',  symbol: 'INF-1',name: 'Brookfield Infra V',          account: 'ubs-trust-eu',     assetClass: 'alts',        sector: 'real_assets',    qty: 1, price:  6_800_000, mv:  6_800_000, cost:  6_000_000 },
  { id: 'mnp10', symbol: 'EUR',  name: 'EUR Operating Cash',          account: 'ubs-lisbon',       assetClass: 'cash',        sector: 'cash',  qty:  8_200_000, price: 1.00, mv:  8_200_000, cost:  8_200_000 },
  { id: 'mnp11', symbol: 'USD',  name: 'USD Treasury MMF',            account: 'pershing-holdings', assetClass: 'cash',        sector: 'cash',  qty: 26_000_000, price: 1.00, mv: 26_000_000, cost: 26_000_000 },
  { id: 'mnp12', symbol: 'NVDA', name: 'NVIDIA Corporation',          account: 'schwab-joint',     assetClass: 'us_equity',   sector: 'tech',  qty:   8_000, price: 920.00, mv:   7_360_000, cost:   3_200_000 },
  { id: 'mnp13', symbol: 'GOOGL',name: 'Alphabet Inc Class A',        account: 'schwab-joint',     assetClass: 'us_equity',   sector: 'tech',  qty:  16_500, price: 175.50, mv:   2_895_750, cost:   2_100_000 },
  { id: 'mnp14', symbol: 'MUB',  name: 'iShares National Muni',       account: 'pershing-foundation', assetClass: 'munis',    sector: 'broad', qty:  85_000, price: 106.20, mv:   9_027_000, cost:   8_900_000 },
  { id: 'mnp15', symbol: 'BIL',  name: 'SPDR 1-3 Mo T-Bill',          account: 'schwab-roth-ana',  assetClass: 'cash',        sector: 'cash',  qty:  20_000, price:  91.50, mv:   1_830_000, cost:   1_830_000 },
  { id: 'mnp16', symbol: 'VTI-R',name: 'Vanguard Total Stock Mkt',    account: 'schwab-roth-pedro',assetClass: 'us_equity',   sector: 'broad', qty:  16_000, price: 248.00, mv:   3_968_000, cost:   2_400_000 }
];

export const MONTEIRO_BRIEFING = {
  family: {
    primary: { name: 'Ana Monteiro',   role: 'Matriarch', age: 62 },
    spouse:  { name: 'Pedro Monteiro', role: 'Spouse',    age: 65 },
    children: [
      { name: 'Catarina Monteiro', age: 31, status: 'Operating partner · Lisbon' },
      { name: 'Tiago Monteiro',    age: 28, status: 'Stanford GSB · 2025' }
    ]
  },
  team: [
    { role: 'Wealth Manager',         name: 'Christine Holloway', primary: true },
    { role: 'International Tax Lead', name: 'Sophie Renault' },
    { role: 'UBS FX Desk',            name: 'Lukas Brunner' },
    { role: 'Foundation Counsel',     name: 'Withers · Eleanor Park' }
  ],
  external: [
    { role: 'Family Attorney', name: 'Cuatrecasas · Joana Silva' },
    { role: 'CPA (US)',        name: 'BDO · Henry Mead' },
    { role: 'CPA (Portugal)',  name: 'PwC Lisbon · Rui Costa' }
  ],
  nextMeeting: {
    type: 'Quarterly review',
    date: '2026-06-18',
    time: '15:00 WET',
    location: 'Lisbon · Av. da Liberdade office',
    attendees: ['Ana Monteiro', 'Pedro Monteiro', 'Christine Holloway'],
    agenda: [
      'EUR/USD hedge roll (expires Jun 6)',
      'Cash consolidation across 3 custodians',
      'IPS attestation refresh',
      'Tiago\'s Stanford post-grad capital plan'
    ]
  },
  lastMeeting: {
    type: 'Annual review',
    date: '2026-03-04',
    attendees: ['Ana Monteiro', 'Pedro Monteiro', 'Christine Holloway', 'Sophie Renault'],
    summary: 'Approved Carlyle Europe V re-up at $12.5M. Set 2026 distribution policy. Discussed succession of Catarina into operating role.'
  },
  followUps: [
    { status: 'open',      priority: 'medium', due: '2026-06-06', commit: 'Roll EUR forward at 1.0915 (UBS)' },
    { status: 'open',      priority: 'medium', due: '2026-06-15', commit: 'Schedule IPS attestation signing call' },
    { status: 'open',      priority: 'low',    due: '2026-07-15', commit: 'Sweep Pershing + UBS USD cash to Schwab MMF' },
    { status: 'completed', priority: 'medium', due: '2026-04-15', commit: 'US 1040 filed · Portugal IRS filed' }
  ],
  upcoming: [
    { date: '2026-06-06', label: 'EUR/USD hedge roll',                kind: 'fx',         priority: 'medium' },
    { date: '2026-06-18', label: 'Quarterly review (Lisbon)',         kind: 'meeting',    priority: 'medium' },
    { date: '2026-09-30', label: 'Foundation Q3 disbursement window', kind: 'compliance', priority: 'low' },
    { date: '2026-12-31', label: 'IPS attestation due',               kind: 'compliance', priority: 'low' }
  ],
  contactLog: [
    { date: '2026-05-06', kind: 'email',   with: 'Ana',                  subject: 'Carlyle Europe V re-up · capital call schedule shared' },
    { date: '2026-05-01', kind: 'call',    with: 'Pedro',                subject: 'EUR hedge roll mechanics · 25 min' },
    { date: '2026-04-23', kind: 'meeting', with: 'Sophie (Tax)',         subject: 'Cross-border tax review · Portugal NHR transition' },
    { date: '2026-03-04', kind: 'meeting', with: 'Ana, Pedro',           subject: 'Annual review' },
    { date: '2026-02-18', kind: 'note',    with: '—',                    subject: 'Pedro flagged Brazilian tech co-investment opportunity' }
  ],
  news: [
    { date: '2026-05-05', position: 'EUR',     impact: 'mixed',    headline: 'ECB · Q2 dovish hold; EUR exposure repositioned ahead of Jun roll' },
    { date: '2026-05-03', position: 'CARL5',   impact: 'positive', headline: 'Carlyle Europe V · Fund IV markup +14% reported' },
    { date: '2026-04-29', position: 'AI',      impact: 'caution',  headline: 'Sequoia AI Growth III · pricing pushed up amid late-stage demand' },
    { date: '2026-04-26', position: 'PSE',     impact: 'positive', headline: 'Iberian utilities — Q1 earnings beat lifts EU equity sleeve' }
  ],
  personalNotes: [
    'Tiago at Stanford GSB — graduating 2027; capital plan being formed',
    'Catarina taking over Lisbon operations 2026Q4 — succession in motion',
    'Family considers Algarve property purchase Q3'
  ]
};

export const MONTEIRO_CASHFLOW = [
  { q: '2026Q3', dividends: 280000, bondCoupons: 350000, structuredCoupons: 0, cashInterest: 240000, altDistributions:        0, altCalls: -2_800_000, fees: -240000, taxes: -380000, lifestyle: -650000 },
  { q: '2026Q4', dividends: 275000, bondCoupons: 360000, structuredCoupons: 0, cashInterest: 240000, altDistributions:        0, altCalls: -1_500_000, fees: -240000, taxes:       0, lifestyle: -650000 },
  { q: '2027Q1', dividends: 285000, bondCoupons: 350000, structuredCoupons: 0, cashInterest: 220000, altDistributions:  1_800_000, altCalls: -2_200_000, fees: -255000, taxes: -480000, lifestyle: -650000 },
  { q: '2027Q2', dividends: 280000, bondCoupons: 360000, structuredCoupons: 0, cashInterest: 220000, altDistributions:        0, altCalls: -1_800_000, fees: -255000, taxes: -240000, lifestyle: -650000 },
  { q: '2027Q3', dividends: 285000, bondCoupons: 350000, structuredCoupons: 0, cashInterest: 220000, altDistributions:    900_000, altCalls: -3_500_000, fees: -270000, taxes: -240000, lifestyle: -650000 }
];

export const MONTEIRO_ALT_STRATEGY_MIX = [
  { key: 'buyout',      label: 'Private Equity (Buyout)', target: 35, actual: 43, mvActual: 12_500_000 },
  { key: 'credit',      label: 'Private Credit',          target: 25, actual: 32, mvActual:  9_400_000 },
  { key: 'real_assets', label: 'Real Assets / Infra',     target: 20, actual: 23, mvActual:  6_800_000 },
  { key: 'venture',     label: 'Venture',                 target: 15, actual:  2, mvActual:    600_000 },
  { key: 'secondaries', label: 'PE Secondaries',          target:  5, actual:  0, mvActual:          0 }
];

export const MONTEIRO_ALT_JCURVE = [
  { q: '2021Q4', called:  6_000_000, distributed:        0, nav:  5_400_000 },
  { q: '2022Q2', called: 11_000_000, distributed:        0, nav: 10_200_000 },
  { q: '2022Q4', called: 16_000_000, distributed:    400_000, nav: 16_200_000 },
  { q: '2023Q2', called: 20_000_000, distributed:    900_000, nav: 21_400_000 },
  { q: '2023Q4', called: 23_500_000, distributed:  1_900_000, nav: 24_800_000 },
  { q: '2024Q2', called: 26_500_000, distributed:  3_400_000, nav: 27_800_000 },
  { q: '2024Q4', called: 28_500_000, distributed:  5_500_000, nav: 29_400_000 },
  { q: '2025Q2', called: 30_000_000, distributed:  7_900_000, nav: 30_500_000 },
  { q: '2026Q2', called: 31_500_000, distributed: 10_200_000, nav: 31_300_000 }
];

export const MONTEIRO_ALT_CASHFLOW = [
  { q: '2026Q3', calls: -2_800_000, dist:        0, notes: 'Carlyle Europe V re-up · Permira yr-3 draw' },
  { q: '2026Q4', calls: -1_500_000, dist:        0, notes: 'Brookfield Infra V yr-2 commitment' },
  { q: '2027Q1', calls: -2_200_000, dist:  1_800_000, notes: 'Carlyle dist · multi-fund draws' },
  { q: '2027Q2', calls: -1_800_000, dist:        0, notes: 'Permira IV initial draw' },
  { q: '2027Q3', calls: -3_500_000, dist:    900_000, notes: 'Multi-fund draw quarter · partial exits' },
  { q: '2027Q4', calls:        0, dist:  3_200_000, notes: 'Carlyle Europe IV refinancing dist.' }
];

export const MONTEIRO_UNFUNDED_LADDER = [
  { bucket: '0–6 mo',   amount: 4_300_000, instrument: 'T-Bill MMF + 3-mo bills',     yield: 5.10, covers: '2026 calls — Carlyle, Brookfield' },
  { bucket: '6–18 mo',  amount: 5_700_000, instrument: '6–12 mo T-Bills (laddered)',  yield: 4.85, covers: '2027 calls — Permira IV, Carlyle yr-2' },
  { bucket: '18–30 mo', amount: 4_000_000, instrument: '1–2 yr Treasuries',           yield: 4.65, covers: '2028 calls — multi-fund pacing' },
  { bucket: '30 mo+',   amount: 2_000_000, instrument: '2–3 yr Treasuries',           yield: 4.45, covers: '2029+ — long-tail draws' }
];

// ─── SATO ENTERPRISES LLC ────────────────────────────────────────────
// UHNW · alts-overweight · ~$124M · JPM + Fidelity · 5 accounts.

export const SATO_ACCOUNTS = [
  { id: 'jpm-op',          name: 'Operating LLC',      custodian: 'JPM Private', entity: 'Sato Enterprises LLC',  type: 'taxable' },
  { id: 'jpm-alts',        name: 'Alts & Private',     custodian: 'JPM Private', entity: 'Sato Family Office LP', type: 'taxable' },
  { id: 'jpm-foundation',  name: 'Foundation',         custodian: 'JPM Private', entity: 'Sato Foundation',       type: 'foundation' },
  { id: 'fidelity-roth',   name: 'Roth IRA',           custodian: 'Fidelity',    entity: 'Kenji Sato',            type: 'retirement' },
  { id: 'fidelity-trust',  name: 'Family Trust',       custodian: 'Fidelity',    entity: 'Sato 2018 Trust',       type: 'trust' }
];

export const SATO_POSITIONS = [
  { id: 'stp1',  symbol: 'NVDA', name: 'NVIDIA Corporation',     account: 'jpm-op',         assetClass: 'us_equity',  sector: 'tech',           qty:  18_000, price: 920.00, mv: 16_560_000, cost:  4_500_000 },
  { id: 'stp2',  symbol: 'AAPL', name: 'Apple Inc.',             account: 'jpm-op',         assetClass: 'us_equity',  sector: 'tech',           qty:  35_000, price: 224.00, mv:  7_840_000, cost:  3_200_000 },
  { id: 'stp3',  symbol: 'MSFT', name: 'Microsoft Corporation',  account: 'jpm-op',         assetClass: 'us_equity',  sector: 'tech',           qty:  21_000, price: 432.00, mv:  9_072_000, cost:  4_900_000 },
  { id: 'stp4',  symbol: 'GOOGL',name: 'Alphabet Inc Class A',   account: 'jpm-op',         assetClass: 'us_equity',  sector: 'tech',           qty:  28_000, price: 175.50, mv:  4_914_000, cost:  3_400_000 },
  { id: 'stp5',  symbol: 'PR-2', name: 'Pine Ridge Opportunities II', account: 'jpm-alts', assetClass: 'alts',       sector: 'private_equity', qty: 1, price: 11_500_000, mv: 11_500_000, cost:  9_800_000 },
  { id: 'stp6',  symbol: 'AT-7', name: 'Atlas Direct Lending VII',    account: 'jpm-alts', assetClass: 'alts',       sector: 'private_credit', qty: 1, price:  8_400_000, mv:  8_400_000, cost:  7_500_000 },
  { id: 'stp7',  symbol: 'HE-T', name: 'Helios Tech Fund II',         account: 'jpm-alts', assetClass: 'alts',       sector: 'venture',        qty: 1, price:  6_900_000, mv:  6_900_000, cost:  5_500_000 },
  { id: 'stp8',  symbol: 'SQ-3', name: 'Sequoia Capital Growth III',  account: 'jpm-alts', assetClass: 'alts',       sector: 'venture',        qty: 1, price:  4_200_000, mv:  4_200_000, cost:  4_000_000 },
  { id: 'stp9',  symbol: 'BX',   name: 'Blackstone Inc',         account: 'jpm-op',         assetClass: 'us_equity',  sector: 'fin',            qty:  18_000, price: 195.00, mv:  3_510_000, cost:  2_200_000 },
  { id: 'stp10', symbol: 'AGG',  name: 'iShares Core US Agg Bond',account:'jpm-op',         assetClass: 'fixed_income', sector: 'broad',         qty:  85_000, price:  98.40, mv:  8_364_000, cost:  8_300_000 },
  { id: 'stp11', symbol: 'CASH', name: 'USD Treasury MMF',       account: 'jpm-op',         assetClass: 'cash',       sector: 'cash',           qty: 24_500_000, price: 1.00, mv: 24_500_000, cost: 24_500_000 },
  { id: 'stp12', symbol: 'TSLA', name: 'Tesla, Inc.',            account: 'fidelity-trust', assetClass: 'us_equity',  sector: 'tech',           qty:  12_000, price: 248.00, mv:  2_976_000, cost:  3_400_000 },
  { id: 'stp13', symbol: 'VOO',  name: 'Vanguard S&P 500 ETF',   account: 'fidelity-trust', assetClass: 'us_equity',  sector: 'broad',          qty:  18_000, price: 480.00, mv:  8_640_000, cost:  6_500_000 },
  { id: 'stp14', symbol: 'VTI-R',name: 'Vanguard Total Stock Mkt',account:'fidelity-roth',  assetClass: 'us_equity',  sector: 'broad',          qty:  12_000, price: 248.00, mv:  2_976_000, cost:  1_900_000 }
];

export const SATO_BRIEFING = {
  family: {
    primary: { name: 'Kenji Sato', role: 'Founder',   age: 54 },
    spouse:  { name: 'Yumi Sato',  role: 'Spouse',    age: 51 },
    children: [
      { name: 'Hiro Sato',  age: 22, status: 'CMU CS · 2025' },
      { name: 'Nori Sato',  age: 18, status: "Stanford '29" }
    ]
  },
  team: [
    { role: 'Wealth Manager',  name: 'Christine Holloway', primary: true },
    { role: 'Alts Specialist', name: 'David Chen' },
    { role: 'Tax Lead',        name: 'Ramona Patel' }
  ],
  external: [
    { role: 'Family Attorney', name: 'Latham & Watkins · Brooke Yamamoto' },
    { role: 'CPA',             name: 'KPMG · Daniel Park' }
  ],
  nextMeeting: {
    type: 'Alts pacing review',
    date: '2026-05-22',
    time: '11:00 PT',
    location: 'Slate office · Palo Alto',
    attendees: ['Kenji Sato', 'Christine Holloway', 'David Chen'],
    agenda: [
      'Pine Ridge II capital call ($1.6M, wire by May 22)',
      'Alts above policy target (26% vs 20%)',
      'Helios secondary sale at NAV − 4%',
      'Atlas issuer-concentration cap'
    ]
  },
  lastMeeting: {
    type: 'Quarterly review',
    date: '2026-02-12',
    attendees: ['Kenji Sato', 'Yumi Sato', 'Christine Holloway', 'David Chen'],
    summary: 'Approved Atlas Direct Lending VII subscription. Discussed venture sleeve trim (deferred). Tech concentration discussed but kept inside band.'
  },
  followUps: [
    { status: 'open',      priority: 'high',   due: '2026-05-22', commit: 'Wire Pine Ridge II call to JPM Alts' },
    { status: 'open',      priority: 'high',   due: '2026-06-05', commit: 'Pause new alts commitments until ratio in band' },
    { status: 'open',      priority: 'medium', due: '2026-06-12', commit: 'Sponsor call · Atlas re-up review' },
    { status: 'completed', priority: 'medium', due: '2026-04-05', commit: 'Helios secondary listing posted (open · 1 indication)' }
  ],
  upcoming: [
    { date: '2026-05-22', label: 'Pine Ridge II — final capital call ($1.6M)', kind: 'cashflow', priority: 'high' },
    { date: '2026-06-12', label: 'Atlas DL — sponsor re-up call',              kind: 'meeting',  priority: 'medium' },
    { date: '2026-09-15', label: 'Helios Tech yr-3 distribution window',       kind: 'cashflow', priority: 'medium' },
    { date: '2026-11-30', label: 'Annual Investment Policy Statement refresh', kind: 'compliance',priority: 'low' }
  ],
  contactLog: [
    { date: '2026-05-05', kind: 'email',   with: 'Kenji',           subject: 'Pine Ridge II wire instructions · sent' },
    { date: '2026-04-30', kind: 'call',    with: 'Yumi',            subject: 'Tech concentration · 25 min review of NVDA / MSFT band' },
    { date: '2026-04-18', kind: 'meeting', with: 'David Chen',      subject: 'Helios secondary listing strategy' },
    { date: '2026-02-12', kind: 'meeting', with: 'Kenji, Yumi',     subject: 'Quarterly review' }
  ],
  news: [
    { date: '2026-05-05', position: 'NVDA',  impact: 'caution',  headline: 'Export-control rumor on AI accelerators — monitor next week' },
    { date: '2026-05-04', position: 'AAPL',  impact: 'positive', headline: 'WSJ · Services growth driving Q2 outperformance' },
    { date: '2026-05-02', position: 'AI',    impact: 'mixed',    headline: 'Sequoia AI Growth III · cap raised on accelerated demand' },
    { date: '2026-04-29', position: 'MSFT',  impact: 'positive', headline: 'Azure AI revenue +38% YoY in Q1 results' }
  ],
  personalNotes: [
    'Hiro graduating CMU CS · 2025 — discuss equity-comp rollover into family LLC',
    'Nori starting Stanford fall 2026 — 529 disbursement plan to confirm',
    'Kenji actively reducing tech sleeve over next 18 months'
  ]
};

export const SATO_CASHFLOW = [
  { q: '2026Q3', dividends: 105000, bondCoupons:  72000, structuredCoupons: 36000, cashInterest:  315_000, altDistributions:        0, altCalls: -1_600_000, fees: -110000, taxes: -180000, lifestyle: -260_000 },
  { q: '2026Q4', dividends: 102000, bondCoupons:  72000, structuredCoupons: 36000, cashInterest:  315_000, altDistributions:        0, altCalls:  -900_000, fees: -110000, taxes:       0, lifestyle: -260_000 },
  { q: '2027Q1', dividends: 108000, bondCoupons:  72000, structuredCoupons: 36000, cashInterest:  290_000, altDistributions:  1_400_000, altCalls: -1_200_000, fees: -120000, taxes: -240000, lifestyle: -260_000 },
  { q: '2027Q2', dividends: 105000, bondCoupons:  72000, structuredCoupons:     0, cashInterest:  290_000, altDistributions:        0, altCalls: -1_500_000, fees: -120000, taxes: -120000, lifestyle: -260_000 },
  { q: '2027Q3', dividends: 108000, bondCoupons:  72000, structuredCoupons:     0, cashInterest:  290_000, altDistributions:    800_000, altCalls: -2_400_000, fees: -130000, taxes: -120000, lifestyle: -260_000 }
];

export const SATO_ALT_STRATEGY_MIX = [
  { key: 'buyout',      label: 'Private Equity (Buyout)', target: 25, actual: 38, mvActual: 11_500_000 },
  { key: 'credit',      label: 'Private Credit',          target: 25, actual: 28, mvActual:  8_400_000 },
  { key: 'real_assets', label: 'Real Assets / Infra',     target: 20, actual:  0, mvActual:          0 },
  { key: 'venture',     label: 'Venture',                 target: 25, actual: 37, mvActual: 11_100_000 },
  { key: 'secondaries', label: 'PE Secondaries',          target:  5, actual:  0, mvActual:          0 }
];

export const SATO_ALT_JCURVE = [
  { q: '2020Q4', called:  3_500_000, distributed:        0, nav:  3_300_000 },
  { q: '2021Q2', called:  6_500_000, distributed:        0, nav:  6_400_000 },
  { q: '2021Q4', called:  9_500_000, distributed:    200_000, nav: 10_200_000 },
  { q: '2022Q2', called: 13_000_000, distributed:    800_000, nav: 14_500_000 },
  { q: '2022Q4', called: 16_500_000, distributed:  1_700_000, nav: 18_200_000 },
  { q: '2023Q2', called: 19_500_000, distributed:  3_100_000, nav: 21_400_000 },
  { q: '2023Q4', called: 22_500_000, distributed:  4_900_000, nav: 24_900_000 },
  { q: '2024Q2', called: 25_000_000, distributed:  7_400_000, nav: 27_800_000 },
  { q: '2024Q4', called: 27_000_000, distributed: 10_200_000, nav: 29_400_000 },
  { q: '2025Q2', called: 28_500_000, distributed: 13_300_000, nav: 30_400_000 },
  { q: '2026Q2', called: 30_000_000, distributed: 17_100_000, nav: 31_000_000 }
];

export const SATO_ALT_CASHFLOW = [
  { q: '2026Q3', calls: -1_600_000, dist:        0, notes: 'Pine Ridge II — final call' },
  { q: '2026Q4', calls:  -900_000, dist:        0, notes: 'Atlas DL VII — yr-1 commitment' },
  { q: '2027Q1', calls: -1_200_000, dist:  1_400_000, notes: 'Helios Tech yr-3 dist · Atlas yr-2 draw' },
  { q: '2027Q2', calls: -1_500_000, dist:        0, notes: 'Multi-fund draw quarter' },
  { q: '2027Q3', calls: -2_400_000, dist:    800_000, notes: 'Sequoia follow-on · Helios partial dist.' },
  { q: '2027Q4', calls:        0, dist:  3_200_000, notes: 'Pine Ridge II refinancing dist.' }
];

export const SATO_UNFUNDED_LADDER = [
  { bucket: '0–6 mo',   amount: 2_500_000, instrument: 'T-Bill MMF + 3-mo bills',     yield: 5.10, covers: '2026 calls — Pine Ridge II final, Atlas yr-1' },
  { bucket: '6–18 mo',  amount: 3_700_000, instrument: '6–12 mo T-Bills (laddered)',  yield: 4.85, covers: '2027 calls — Atlas yr-2, Helios follow-on' },
  { bucket: '18–30 mo', amount: 1_900_000, instrument: '1–2 yr Treasuries',           yield: 4.65, covers: '2028 calls — Sequoia growth follow-on' },
  { bucket: '30 mo+',   amount: 1_100_000, instrument: '2–3 yr Treasuries',           yield: 4.45, covers: '2029+ — long-tail draws' }
];
