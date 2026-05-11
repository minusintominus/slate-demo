// Slate — mock data fixture (the Next.js package mirrors this as TS)
(function () {

const POSITIONS = [
  // Schwab Joint Brokerage
  { id:'p1',  symbol:'AAPL',  name:'Apple Inc.',         account:'schwab-joint',    cusip:'037833100', qty:46700,    price:218.42,  mv:10200214, cost:6100000,  assetClass:'us_equity',  sector:'Technology' },
  { id:'p2',  symbol:'MSFT',  name:'Microsoft',          account:'schwab-joint',    cusip:'594918104', qty:8150,     price:441.06,  mv:3594639,  cost:1955000,  assetClass:'us_equity',  sector:'Technology' },
  { id:'p3',  symbol:'BRK.B', name:'Berkshire Hathaway', account:'schwab-joint',    cusip:'084670702', qty:5200,     price:462.10,  mv:2402920,  cost:1872000,  assetClass:'us_equity',  sector:'Financials' },
  { id:'p4',  symbol:'GOOGL', name:'Alphabet',           account:'schwab-joint',    cusip:'02079K305', qty:6300,     price:172.40,  mv:1086120,  cost:792000,   assetClass:'us_equity',  sector:'Technology' },
  { id:'p5',  symbol:'AMZN',  name:'Amazon',             account:'schwab-joint',    cusip:'023135106', qty:4400,     price:185.10,  mv:814440,   cost:520000,   assetClass:'us_equity',  sector:'Consumer Disc.' },
  { id:'p6',  symbol:'V',     name:'Visa',               account:'schwab-joint',    cusip:'92826C839', qty:2800,     price:286.20,  mv:801360,   cost:512000,   assetClass:'us_equity',  sector:'Financials' },
  { id:'p7',  symbol:'UNH',   name:'UnitedHealth',       account:'schwab-joint',    cusip:'91324P102', qty:1900,     price:512.40,  mv:973560,   cost:840000,   assetClass:'us_equity',  sector:'Healthcare' },
  { id:'p8',  symbol:'COST',  name:'Costco',             account:'schwab-joint',    cusip:'22160K105', qty:1200,     price:840.10,  mv:1008120,  cost:560000,   assetClass:'us_equity',  sector:'Consumer Stap.' },
  { id:'p9',  symbol:'JPM',   name:'JPMorgan Chase',     account:'schwab-joint',    cusip:'46625H100', qty:3600,     price:218.50,  mv:786600,   cost:540000,   assetClass:'us_equity',  sector:'Financials' },
  { id:'p10', symbol:'LLY',   name:'Eli Lilly',          account:'schwab-joint',    cusip:'532457108', qty:1100,     price:880.00,  mv:968000,   cost:520000,   assetClass:'us_equity',  sector:'Healthcare' },
  { id:'p11', symbol:'XOM',   name:'Exxon Mobil',        account:'schwab-joint',    cusip:'30231G102', qty:7800,     price:118.20,  mv:921960,   cost:740000,   assetClass:'us_equity',  sector:'Energy' },
  { id:'p12', symbol:'AVGO',  name:'Broadcom',           account:'schwab-joint',    cusip:'11135F101', qty:850,      price:1640.00, mv:1394000,  cost:780000,   assetClass:'us_equity',  sector:'Technology' },
  { id:'p13', symbol:'CASH-S',name:'Cash Sweep (Schwab)',account:'schwab-joint',    cusip:'—',         qty:1,        price:5051000, mv:5051000,  cost:5051000,  assetClass:'cash',       sector:'Cash' },

  // Fidelity Roth
  { id:'p20', symbol:'NVDA',  name:'NVIDIA',             account:'fidelity-roth',   cusip:'67066G104', qty:3600,     price:128.30,  mv:461880,   cost:146000,   assetClass:'us_equity',  sector:'Technology', flag:'2 of 7 lots missing acquisition date' },
  { id:'p21', symbol:'META',  name:'Meta Platforms',     account:'fidelity-roth',   cusip:'30303M102', qty:2200,     price:498.10,  mv:1095820,  cost:580000,   assetClass:'us_equity',  sector:'Communications' },
  { id:'p22', symbol:'TSLA',  name:'Tesla',              account:'fidelity-roth',   cusip:'88160R101', qty:2400,     price:240.50,  mv:577200,   cost:480000,   assetClass:'us_equity',  sector:'Consumer Disc.' },
  { id:'p23', symbol:'MA',    name:'Mastercard',         account:'fidelity-roth',   cusip:'57636Q104', qty:1400,     price:466.00,  mv:652400,   cost:420000,   assetClass:'us_equity',  sector:'Financials' },
  { id:'p24', symbol:'IEFA',  name:'iShares Core Intl',  account:'fidelity-roth',   cusip:'46432F842', qty:14000,    price:78.40,   mv:1097600,  cost:1080000,  assetClass:'intl_equity',sector:'Diversified' },
  { id:'p25', symbol:'VWO',   name:'Vanguard Emerging',  account:'fidelity-roth',   cusip:'922042858', qty:18500,    price:43.10,   mv:797350,   cost:1077350, assetClass:'intl_equity',sector:'Emerging' },
  { id:'p26', symbol:'IEMG',  name:'iShares Core EM',    account:'fidelity-roth',   cusip:'46434G103', qty:21000,    price:53.20,   mv:1117200,  cost:1437200, assetClass:'intl_equity',sector:'Emerging' },
  { id:'p27', symbol:'EEM',   name:'iShares MSCI EM',    account:'fidelity-roth',   cusip:'464287234', qty:12000,    price:42.80,   mv:513600,   cost:753600,  assetClass:'intl_equity',sector:'Emerging' },
  { id:'p28', symbol:'GLD',   name:'SPDR Gold',          account:'fidelity-roth',   cusip:'78463V107', qty:3500,     price:240.00,  mv:840000,   cost:560000,   assetClass:'commodity',  sector:'Metals' },
  { id:'p29', symbol:'CASH-F',name:'Cash (Fidelity)',    account:'fidelity-roth',   cusip:'—',         qty:1,        price:432000,  mv:432000,   cost:432000,   assetClass:'cash',       sector:'Cash' },
  { id:'p30', symbol:'BIIB',  name:'Biogen',             account:'fidelity-roth',   cusip:'09062X103', qty:1100,     price:172.00,  mv:189200,   cost:248000,   assetClass:'us_equity',  sector:'Healthcare' },

  // Pershing Trust
  { id:'p40', symbol:'UST 4.25 11/34',name:'US Treasury 4.25% 11/15/2034', account:'pershing-trust', cusip:'91282CMA0', qty:5000000, price:98.71, mv:4935500, cost:4961250, assetClass:'fixed_income', sector:'Treasury' },
  { id:'p41', symbol:'UST 4.5 02/35', name:'US Treasury 4.5% 02/15/2035',  account:'pershing-trust', cusip:'91282CMB8', qty:3500000, price:99.40, mv:3479000, cost:3490000, assetClass:'fixed_income', sector:'Treasury' },
  { id:'p42', symbol:'NY MUNI 5 30',  name:'NY State GO 5% 2030',          account:'pershing-trust', cusip:'649791QU2', qty:2000000, price:104.20,mv:2084000, cost:2010000, assetClass:'fixed_income', sector:'Muni' },
  { id:'p43', symbol:'CA MUNI 4 28',  name:'CA GO 4% 2028',                account:'pershing-trust', cusip:'13063DGA8', qty:1500000, price:101.30,mv:1519500, cost:1500000, assetClass:'fixed_income', sector:'Muni' },
  { id:'p44', symbol:'VTI',    name:'Vanguard Total Stock', account:'pershing-trust', cusip:'922908769', qty:14800, price:285.40, mv:4223920, cost:2664000, assetClass:'us_equity', sector:'Diversified' },
  { id:'p45', symbol:'VEA',    name:'Vanguard Dev. Mkts',   account:'pershing-trust', cusip:'921943858', qty:9200,  price:52.40, mv:482080,  cost:460000,  assetClass:'intl_equity',sector:'Developed' },
  { id:'p46', symbol:'CASH-P', name:'Cash Sweep (Trust)',   account:'pershing-trust', cusip:'—',        qty:1,    price:5800000,mv:5800000,cost:5800000,assetClass:'cash',     sector:'Cash', flag:'$5.8M sweep cash idle 9 months' },

  // JPM Private — Alts
  { id:'p60', symbol:'PINE-RIDGE', name:'Pine Ridge Opportunities II — LP', account:'jpm-alts', cusip:'—', qty:null, price:null, mv:8400000, cost:5000000, assetClass:'alternative', sector:'Private Equity', flag:'No CUSIP — confirm holding entity', staleNAV:'2025-12-31' },
];

const ACCOUNTS = [
  { id:'schwab-joint',   name:'Joint Brokerage',  custodian:'Schwab',     entity:'M. & G. Marchetti',  type:'taxable' },
  { id:'fidelity-roth',  name:'Roth IRA',         custodian:'Fidelity',   entity:'M. Marchetti',       type:'retirement' },
  { id:'pershing-trust', name:'Family Trust',     custodian:'Pershing',   entity:'Marchetti 2019 Trust', type:'trust' },
  { id:'jpm-alts',       name:'Alts & Private',   custodian:'JPM Private',entity:'Marchetti Holding LLC', type:'taxable' },
];

const HOUSEHOLD = {
  id: 'marchetti',
  name: 'The Marchetti Family',
  founded: 2014,
  segment: 'Private wealth',
  rm: 'Christine Holloway',
  ipsTargets: { us_equity: 38, intl_equity: 16, fixed_income: 28, alternative: 13, cash: 5, commodity: 0 }, // %
  benchmark: '60/40',
};

const STATEMENTS = [
  { id:'s1', file:'Schwab_Mar2026_Joint.pdf',     pages:9,  account:'schwab-joint',    extracted:13, value:30002933, flagged:0 },
  { id:'s2', file:'Fidelity_Mar2026_Roth.pdf',    pages:11, account:'fidelity-roth',   extracted:11, value:7774250,  flagged:1 },
  { id:'s3', file:'Pershing_Mar2026_Trust.pdf',   pages:14, account:'pershing-trust',  extracted:7,  value:22524000, flagged:1 },
  { id:'s4', file:'JPMP_Q1_2026_Alts.pdf',        pages:4,  account:'jpm-alts',        extracted:1,  value:8400000,  flagged:1 },
];

const INSIGHTS = [
  { id:'i1', clientId:'marchetti', kind:'concentration', priority:'high', title:'AAPL is 14.8% of household net worth',
    body:'Up from 9.1% YoY. The IPS caps any single security at 7%. $4.1M of unrealized long-term gains makes a clean exit tax-inefficient.',
    impact: { reposition: 8600000, taxSaved: 199000, incomeLift: 0 },
    accountsAffected: ['schwab-joint'],
    actions: [
      'Use a 351 exchange fund — defer cap gains 7y, instant diversification',
      'Direct $1.2M of low-basis lots to the Pine Foundation pledge',
      'Run a 10b5-1 dribble plan over 18 months to clear the remainder',
    ],
  },
  { id:'i2', clientId:'marchetti', kind:'tax', priority:'high', title:'$840k of harvestable losses in EM equity',
    body:'12 long-term lots across VWO, IEMG, EEM. Wash-sale window is clean. Pairs naturally with the AAPL trim — offset $840k of realized gains in the same tax year.',
    impact: { reposition: 0, taxSaved: 199000, incomeLift: 0 },
    accountsAffected: ['fidelity-roth'],
    actions: [
      'Realize losses across 12 lots; stay in beta via swap to MSCI EM IMI alt',
      'Pair-execute with AAPL exchange-fund contribution for tax neutrality',
    ],
  },
  { id:'i3', clientId:'marchetti', kind:'cash', priority:'medium', title:'$5.8M sweep cash earning 0.4% in trust',
    body:'Idle for 9 months. Treasury MMF at 5.18% adds ~$278k/yr. No liquidity pull is scheduled until Q3 (Pine Ridge final capital call $1.6M).',
    impact: { reposition: 5800000, taxSaved: 0, incomeLift: 278000 },
    accountsAffected: ['pershing-trust'],
    actions: [
      'Move $4.2M to T-Bill MMF (BIL or SGOV) — settle T+1',
      'Hold $1.6M in operating sweep for Q3 capital call',
    ],
  },
  { id:'i4', clientId:'marchetti', kind:'cashflow', priority:'medium', title:'$16.6M of unfunded alts commitment can be laddered',
    body:'Alts commitments total $25M ($10M Pine Ridge II + $15M pacing plan); $8.4M is already wired, leaving $16.6M earmarked but not yet drawn. Holding all of it in 5.18% MMF works at today\'s rate but exposes the income stream to Fed cuts. A duration-matched Treasury ladder locks in ~4.79% blended through 2029 — small drag vs. today\'s MMF, meaningful lift vs. the projected average over the call horizon.',
    impact: { reposition: 16600000, taxSaved: 0, incomeLift: 48000 },
    accountsAffected: ['pershing-trust', 'jpm-alts'],
    actions: [
      'Earmark $2.85M in T-Bill MMF + 3-mo bills for 2026 calls (Pine Ridge II final, Pine Ridge IV initial)',
      'Build $7.0M of 6–12 mo T-Bill rungs against 2027 calls (Atlas, Northwind, Helios)',
      'Allocate $4.5M to 1–2yr Treasuries against yr-2/3 calls (2028)',
      'Park $2.25M in 2–3yr Treasuries for the long tail (2029+)',
    ],
  },
  { id:'i5', clientId:'monteiro', kind:'fx', priority:'medium', title:'EUR/USD hedge rolls in 14 days',
    body:'$8M notional forwards tied to operating cash in Lisbon SPVs. Roll cost is inside policy; confirm ISDA thresholds before the fixing window.',
    impact: { reposition: 8000000, taxSaved: 0, incomeLift: 0 },
    accountsAffected: [],
    actions: ['Refresh counterparty limits with UBS', 'Pair roll with treasury MMF rebalance memo'],
  },
  { id:'i6', clientId:'monteiro', kind:'cash', priority:'medium', title:'$3.2M cash split across 3 custodians earning sub-sweep rates',
    body:'Pershing operating, Schwab trust sweep, and a UBS CHF sleeve sit below posted MMF tiers. Consolidating to top-tier funds lifts carry with no IPS drift.',
    impact: { reposition: 3200000, taxSaved: 0, incomeLift: 148000 },
    accountsAffected: [],
    actions: ['Sweep Pershing + Schwab USD into agreed MMF ladder', 'Leave CHF sleeve for FX policy sleeve'],
  },
  { id:'i7', clientId:'monteiro', kind:'compliance', priority:'low', title:'Annual Investment Policy Statement attestation due in 30 days',
    body:'Signed IPS on file is dated May 2025. Compliance batch needs principal attestation before June board — attach alts pacing addendum from Q1.',
    impact: { reposition: 0, taxSaved: 0, incomeLift: 0 },
    accountsAffected: [],
    actions: ['Circulate attestation pack to Monteiro signatories', 'Archive signed PDF to document register'],
  },
  { id:'i8', clientId:'al-khalid', kind:'allocation', priority:'high', title:'Co-invest fits IPS — Northwind Climate Infrastructure',
    body:'IPS allows up to 4% sleeve to climate infra co-invests. GP invites $6M pro-rata; current funded sleeve is 1.2% — room inside policy with liquidity check on Q3 calls.',
    impact: { reposition: 0, taxSaved: 0, incomeLift: 0 },
    accountsAffected: [],
    actions: ['Confirm ADGM counsel sign-off', 'Size ticket vs unfunded ladder in trust'],
  },
  { id:'i9', clientId:'al-khalid', kind:'fx', priority:'medium', title:'$4.2M of multi-currency cash drag',
    body:'AED, EUR, and USD operating balances sit in sub-sweep tiers while hedges roll quarterly. Lifting yield on non-USD pools adds ~$156k/yr without changing hedge ratio.',
    impact: { reposition: 4200000, taxSaved: 0, incomeLift: 156000 },
    accountsAffected: [],
    actions: ['Move AED/EUR pools to agreed MMF', 'Keep hedge tenor matched to capital call ladder'],
  },
];

// Briefing context — the relationship details, meeting cadence, follow-ups,
// upcoming events, and contact log that an RM uses to prep for any client
// interaction. Distinct from positions/insights — this is the human side of
// the relationship.
const HOUSEHOLD_BRIEFING = {
  family: {
    primary: { name:'Marco Marchetti',  role:'Patriarch',   age:58 },
    spouse:  { name:'Giulia Marchetti', role:'Spouse',      age:56 },
    children: [
      { name:'Sofia Marchetti', age:24, status:"Brown '26 · post-grad TBD" },
      { name:'Luca Marchetti',  age:19, status:"MIT '29 · CS major" },
    ],
  },
  team: [
    { role:'Relationship Manager',     name:'Christine Holloway', primary:true },
    { role:'Investment Specialist',    name:'David Chen' },
    { role:'Wealth Advisor (Planning)',name:'Patricia Rao' },
    { role:'Trust Officer',            name:'James Whitman' },
  ],
  external: [
    { role:'Family Attorney', name:'Hartwell & Associates · Janet Hartwell' },
    { role:'CPA',             name:'Mendoza & Levy · Carlos Mendoza' },
    { role:'Insurance',       name:'Marsh Private · Annette Lee' },
  ],
  nextMeeting: {
    date:'2026-05-19', time:'10:00 ET',
    type:'Family review · 1:1',
    location:'Slate offices · 5th Ave',
    attendees:['Marco Marchetti','Giulia Marchetti','Christine Holloway','David Chen'],
    agenda:[
      'Alts pacing plan signoff ($15M / 4 commitments)',
      'AAPL exchange-fund options · vendor selection',
      'Q2 portfolio review',
      'Sofia post-grad funding plan',
    ],
  },
  lastMeeting: {
    date:'2026-04-22', type:'Q1 review',
    attendees:['Marco Marchetti','Giulia Marchetti','Christine Holloway'],
    summary:'Reviewed Q1 returns (+3.27%). Marco approved $15M pacing plan in principle. Giulia raised expanding charitable footprint. Sofia post-grad funding discussed.',
  },
  followUps: [
    { id:'fu1', commit:'Run AAPL exchange-fund analysis · 2 vendor options',  owner:'David Chen',    due:'2026-05-15', status:'in_progress', priority:'high' },
    { id:'fu2', commit:'Send Northwind Climate brief to Hartwell for review', owner:'Christine',     due:'2026-05-10', status:'open',        priority:'high' },
    { id:'fu3', commit:'351 exchange call with Eaton Vance',                  owner:'Christine',     due:'2026-05-12', status:'open',        priority:'med'  },
    { id:'fu4', commit:'Q1 estimated tax confirmation to Mendoza',            owner:'Patricia Rao',  due:'2026-04-15', status:'completed',   priority:'med'  },
    { id:'fu5', commit:'Sofia 529 disbursement plan for grad gap year',       owner:'Patricia Rao',  due:'2026-06-30', status:'open',        priority:'low'  },
  ],
  upcoming: [
    { date:'2026-05-10', kind:'deadline', priority:'high', label:'Northwind brief due to attorney' },
    { date:'2026-05-12', kind:'personal',                  label:"Sofia · Brown commencement (congrats card)" },
    { date:'2026-05-13', kind:'rfq',      priority:'high', label:'Phoenix Memory RFQ · execution window closes' },
    { date:'2026-05-15', kind:'deadline', priority:'high', label:'AAPL exchange-fund analysis due' },
    { date:'2026-05-19', kind:'meeting',  priority:'high', label:'Family review meeting · 10:00 ET' },
    { date:'2026-05-30', kind:'close',                     label:'Sequoia AI Growth III · close (capacity tightening)' },
    { date:'2026-06-15', kind:'tax',                       label:'Q2 federal estimated tax due' },
    { date:'2026-06-30', kind:'obs',                       label:'SPX Buffer Note · annual observation' },
  ],
  contactLog: [
    { date:'2026-05-03', kind:'email',   with:'Marco',         subject:'Pine Ridge IV term sheet · sent' },
    { date:'2026-04-29', kind:'call',    with:'Giulia',        subject:'Charitable strategy · 30 min' },
    { date:'2026-04-22', kind:'meeting', with:'Marco, Giulia', subject:'Q1 review' },
    { date:'2026-04-15', kind:'email',   with:'Patricia',      subject:'Q1 tax estimate filed' },
    { date:'2026-04-12', kind:'note',    with:'—',             subject:'Marco mentioned Tuscany RE interest (post-meeting)' },
  ],
  /** Illustrative policy benchmark & pacing lines for WM “Goals” tab (not a performance guarantee). */
  outcomeTargets: {
    policyBenchmarkLabel: 'IPS blend · 60/40',
    policyBenchmarkYtd: 0.038,
    riskToleranceLabel: 'Growth · moderate-high',
    altsCommitmentTarget: 25_000_000,
    altsFundedMv: 8_400_000,
    liquidityMonthsTarget: 36,
    liquidityMonthsEstimate: 41,
  },
  news: [
    { date:'2026-05-05', position:'AAPL',    impact:'positive', headline:'WSJ · Services growth driving Q2 outperformance' },
    { date:'2026-05-04', position:'PR2',     impact:'positive', headline:'Apex Industrial (PR2 portco) raised at +18% mark' },
    { date:'2026-05-02', position:'BONDS',   impact:'mixed',    headline:'Fed minutes · 2026 cuts more dovish than priced' },
    { date:'2026-04-30', position:'NVDA',    impact:'caution',  headline:'Export-control rumor · monitor next week' },
  ],
  personalNotes: [
    "Sofia graduating Brown — congrats from team scheduled May 12",
    'Marco interested in Tuscany real estate (mentioned post Apr 22 meeting)',
    'Family considering 2027 sabbatical; review trust liquidity ahead of decision',
    "Luca finishing freshman year at MIT — strong CS performance",
  ],
};

// ---- Alternative Investments deal flow (thesis-matched private offerings)
//   each deal carries a strategyKey (for the strategy-mix tab), vintage, gpCommit (GP's own $ in),
//   coInvest availability, and a fit breakdown (sponsor / IPS / vintage / diversification, /100)
const ALT_DEALS = [
  { id:'a1', name:'Pine Ridge Opportunities IV', sponsor:'Pine Ridge Capital', strategy:'Buyout · Industrials',
    strategyKey:'buyout', vintage:2026, gpCommit:'4.0%', coInvest:true,
    minimum:5000000, target:'18-22%', term:'10y + 2', mgmt:1.75, carry:20, fitScore:94, status:'Open',
    closeDate:'2026-07-15', commitments:'$420M / $600M', thesisKey:'reshoring',
    why:'Related to the reshoring theme in your investment policy. The sponsor’s prior fund (III) reported 2.4× DPI; past performance does not guarantee future results.',
    fit:{ sponsor:28, ips:34, vintage:18, diversification:14 } },
  { id:'a2', name:'Atlas Direct Lending Fund VII', sponsor:'Atlas Credit Partners', strategy:'Private Credit · Senior Secured',
    strategyKey:'credit', vintage:2026, gpCommit:'2.5%', coInvest:false,
    minimum:2500000, target:'10-12%', term:'6y', mgmt:1.25, carry:15, fitScore:88, status:'Open',
    closeDate:'2026-06-30', commitments:'$1.2B / $1.5B', thesisKey:'floating_income',
    why:'Aligned with your policy preference for floating-rate, senior-secured income in the trust sleeve.',
    fit:{ sponsor:24, ips:32, vintage:17, diversification:15 } },
  { id:'a3', name:'Northwind Climate Infrastructure', sponsor:'Northwind Partners', strategy:'Real Assets · Renewables',
    strategyKey:'real_assets', vintage:2026, gpCommit:'3.0%', coInvest:true,
    minimum:5000000, target:'12-15%', term:'12y', mgmt:1.5, carry:20, fitScore:82, status:'Open',
    closeDate:'2026-08-22', commitments:'$880M / $1.2B', thesisKey:'ira_climate',
    why:'Long-dated cash flows may suit a multi-year trust and estate time horizon.',
    fit:{ sponsor:22, ips:30, vintage:16, diversification:14 } },
  { id:'a4', name:'Sequoia AI Growth III', sponsor:'Sequoia Capital', strategy:'Venture · Late Stage',
    strategyKey:'venture', vintage:2026, gpCommit:'1.5%', coInvest:false,
    minimum:10000000, target:'25%+', term:'10y', mgmt:2.0, carry:25, fitScore:78, status:'Limited',
    closeDate:'2026-05-30', commitments:'$1.8B / $2.0B', thesisKey:'ai_infra',
    why:'Late-stage venture exposure tied to your AI infrastructure theme; would add concentration alongside large public tech holdings.',
    fit:{ sponsor:28, ips:24, vintage:18, diversification:8 } },
  { id:'a5', name:'Cornerstone Multifamily Fund VI', sponsor:'Cornerstone Realty', strategy:'Real Estate · Sun Belt MF',
    strategyKey:'real_assets', vintage:2026, gpCommit:'2.0%', coInvest:true,
    minimum:1000000, target:'14-16%', term:'8y', mgmt:1.5, carry:20, fitScore:71, status:'Open',
    closeDate:'2026-09-10', commitments:'$540M / $750M', thesisKey:'sun_belt',
    why:'Real assets sleeve can diversify inflation risk alongside a Treasury-heavy taxable book.',
    fit:{ sponsor:18, ips:26, vintage:14, diversification:13 } },
  { id:'a6', name:'Helios Secondaries 2026', sponsor:'Helios Capital', strategy:'PE Secondaries · GP-Led',
    strategyKey:'secondaries', vintage:2026, gpCommit:'5.0%', coInvest:false,
    minimum:2500000, target:'14-17%', term:'7y', mgmt:1.25, carry:12.5, fitScore:85, status:'Open',
    closeDate:'2026-07-01', commitments:'$680M / $1.0B', thesisKey:'pe_discount',
    why:'Secondaries can shorten the J-curve versus primary fund commitments (illustrative; depends on execution).',
    fit:{ sponsor:24, ips:28, vintage:19, diversification:14 } },
];

// Investment theses the household has explicitly subscribed to. Used as filter chips.
const ALT_THESES = [
  { key:'reshoring',       label:'US reshoring' },
  { key:'floating_income', label:'Floating-rate income' },
  { key:'ai_infra',        label:'AI infrastructure' },
  { key:'ira_climate',     label:'IRA-driven climate' },
  { key:'sun_belt',        label:'Sun Belt demographics' },
  { key:'pe_discount',     label:'PE secondaries discount' },
];

// IPS sub-allocation within the alts sleeve (each target = % of alts sleeve, not of NW).
// Actual % is computed against household alts holdings — currently only Pine Ridge II ($8.4M Buyout).
const ALT_STRATEGY_MIX = [
  { key:'buyout',      label:'Private Equity (Buyout)', target:35, actual:100, mvActual:8400000 },
  { key:'credit',      label:'Private Credit',          target:25, actual:0,   mvActual:0 },
  { key:'real_assets', label:'Real Assets / Infra',     target:20, actual:0,   mvActual:0 },
  { key:'venture',     label:'Venture',                 target:10, actual:0,   mvActual:0 },
  { key:'secondaries', label:'Secondaries',             target:10, actual:0,   mvActual:0 },
];

// J-curve cumulative cashflows for Pine Ridge Opportunities II (2019 vintage).
// Each entry: quarter, called (cumulative), distributed (cumulative), nav.
const ALT_JCURVE = [
  { q:'2019Q4', called:1500000, distributed:0,       nav:1450000 },
  { q:'2020Q2', called:3000000, distributed:0,       nav:2700000 },
  { q:'2020Q4', called:4500000, distributed:0,       nav:4100000 },
  { q:'2021Q2', called:5500000, distributed:200000,  nav:5800000 },
  { q:'2021Q4', called:6500000, distributed:600000,  nav:7200000 },
  { q:'2022Q2', called:7000000, distributed:1200000, nav:7900000 },
  { q:'2022Q4', called:7500000, distributed:1800000, nav:8100000 },
  { q:'2023Q2', called:8000000, distributed:2200000, nav:8400000 },
  { q:'2023Q4', called:8200000, distributed:2600000, nav:8500000 },
  { q:'2024Q2', called:8400000, distributed:2900000, nav:8400000 },
  { q:'2024Q4', called:8400000, distributed:3100000, nav:8400000 },
];

// ---- Alternatives cashflow forecast — capital calls and distributions projected
//   forward by quarter for the next 3 years. Calls are negative (money wired out);
//   distributions are positive (money returned). Sums of {Pine Ridge II final call} +
//   {pacing-plan new commitments drawn on typical industry schedules}.
const ALT_CASHFLOW = [
  { q:'2026Q3', calls:-1600000, dist:        0, notes:'Pine Ridge II — final call' },
  { q:'2026Q4', calls:-1250000, dist:        0, notes:'Pine Ridge IV — initial draw (yr-1)' },
  { q:'2027Q1', calls:-1500000, dist:  1500000, notes:'Atlas DL VII initial · Pine Ridge II partial dist.' },
  { q:'2027Q2', calls:-1500000, dist:        0, notes:'Northwind Climate — initial draw' },
  { q:'2027Q3', calls:-3250000, dist:        0, notes:'Pine Ridge IV yr-2 · Helios initial' },
  { q:'2027Q4', calls: -750000, dist:  7000000, notes:'Atlas yr-2 · Pine Ridge II exit distribution' },
  { q:'2028Q1', calls:-1500000, dist:        0, notes:'Northwind yr-2' },
  { q:'2028Q2', calls:-1750000, dist:        0, notes:'Pine Ridge IV yr-3 · Helios yr-2' },
  { q:'2028Q3', calls: -250000, dist:   500000, notes:'Atlas yr-3 · first Atlas distributions' },
  { q:'2028Q4', calls:-1000000, dist:        0, notes:'Northwind yr-3' },
  { q:'2029Q1', calls:-1000000, dist:  1000000, notes:'Pine Ridge IV yr-4 · Helios yr-3' },
  { q:'2029Q2', calls:        0, dist: 1500000, notes:'Atlas distributions ramp' },
];

// Unfunded commitment ladder — how to invest the $16.6M committed-but-not-called
// capital so each tranche matures roughly when the call is expected. Yields are
// indicative for the current curve; weighted blended yield is the headline.
const ALT_UNFUNDED_LADDER = [
  { bucket:'0–6 mo',   amount:2850000, instrument:'T-Bill MMF + 3-mo bills',      yield:5.10, covers:'2026 calls — Pine Ridge II final + Pine Ridge IV initial' },
  { bucket:'6–18 mo',  amount:7000000, instrument:'6–12 mo T-Bills (laddered)',   yield:4.85, covers:'2027 calls — Atlas, Northwind, Pine Ridge IV yr-2, Helios initial' },
  { bucket:'18–30 mo', amount:4500000, instrument:'1–2 yr Treasuries',            yield:4.65, covers:'2028 calls — Pine Ridge IV yr-3, Northwind yr-2/3, Helios yr-2' },
  { bucket:'30 mo+',   amount:2250000, instrument:'2–3 yr Treasuries',            yield:4.45, covers:'2029+ — Pine Ridge IV yr-4, long-tail draws' },
];

// Household cashflow forecast — quarterly inflows and outflows by source for
// the next 8 quarters. Positive = inflow; negative = outflow.
//
// Confidence varies by source:
//   high     — contractual coupons, scheduled fees, federal estimated taxes
//   medium   — equity dividends, MMF interest (rate-sensitive), planned capital calls
//   low      — alt distributions (timing depends on M&A / IPO of underlying companies)
//
// Bond coupons reflect actual position cashflows: UST 4.25% 11/34 pays May/Nov
// (Q2/Q4 = $107k); UST 4.5% 02/35 pays Feb/Aug (Q1/Q3 = $79k); NY muni 5% 30
// pays Jan/Jul (Q1/Q3 = $50k); CA muni 4% 28 pays Apr/Oct (Q2/Q4 = $30k).
// Q1/Q3 ≈ $130k, Q2/Q4 ≈ $140k. Total $530k/yr matches portfolio yield.
//
// Pine Ridge II $7M Q4 2027 distribution is a GP estimate and the single largest
// source of variance in the forecast.
const HOUSEHOLD_CASHFLOW = [
  { q:'2026Q3', dividends:152000, bondCoupons:130000, structuredCoupons:73500, cashInterest:145000, altDistributions:0,       altCalls:-1600000, fees:-136000, taxes:-250000, lifestyle:-500000 },
  { q:'2026Q4', dividends:148000, bondCoupons:140000, structuredCoupons:73500, cashInterest:145000, altDistributions:0,       altCalls:-1250000, fees:-136000, taxes:       0, lifestyle:-500000 },
  { q:'2027Q1', dividends:155000, bondCoupons:130000, structuredCoupons:30000, cashInterest:130000, altDistributions:1500000, altCalls:-1500000, fees:-141000, taxes:-400000, lifestyle:-500000 },
  { q:'2027Q2', dividends:152000, bondCoupons:140000, structuredCoupons:    0, cashInterest:130000, altDistributions:0,       altCalls:-1500000, fees:-141000, taxes:-200000, lifestyle:-500000 },
  { q:'2027Q3', dividends:155000, bondCoupons:130000, structuredCoupons:    0, cashInterest:130000, altDistributions:0,       altCalls:-3250000, fees:-155000, taxes:-200000, lifestyle:-500000 },
  { q:'2027Q4', dividends:158000, bondCoupons:140000, structuredCoupons:    0, cashInterest:130000, altDistributions:7000000, altCalls: -750000, fees:-155000, taxes:-200000, lifestyle:-500000 },
  { q:'2028Q1', dividends:162000, bondCoupons:130000, structuredCoupons:    0, cashInterest:120000, altDistributions:0,       altCalls:-1500000, fees:-170000, taxes:-650000, lifestyle:-500000 },
  { q:'2028Q2', dividends:160000, bondCoupons:140000, structuredCoupons:    0, cashInterest:120000, altDistributions:0,       altCalls:-1750000, fees:-170000, taxes:-200000, lifestyle:-500000 },
];

// ---- Structured Products quote book (multi-issuer RFQ)
const SP_RFQ = {
  id: 'SP-2026-0156',
  displayId: 'SP-2026-0156',
  underlier: 'NDX',
  underliersDisplay: 'AAPL · MSFT · NVDA · GOOGL',
  type: 'Autocallable on NDX',
  notional: 3000000,
  currency: 'USD',
  tenor: '2Y',
  tenorLabel: '2Y',
  observation: 'Quarterly',
  protection: 'Memory coupon · soft capital barrier',
  status: '4 desks · 2 of 4 quoted · sent 26m ago',
  sentAt: '26m ago',
  sentMinutesAgo: 26,
  desksTotal: 4,
  quotedCount: 2,
  deadlineMinutes: 34,
  deadlineLabel: '34m to deadline',
  bestBid: 'JPM Markets',
};
const SP_QUOTES = [
  { issuer: 'JPM', desk: 'JPM Markets', rating: 'A+', coupon: 8.85, capBarrierPct: 60, issuePrice: 100.05, expires: '3h 59m', callObs: 'Quarterly @ 100%', barrier: '60% soft · European', mtmDay1: 100.05, returnedAt: 'Live', best: 'coupon', pending: false, rfqStatus: 'best', deskContact: 'L. Okonkwo · equities struct', quoteQuality: 'Best coupon' },
  { issuer: 'Goldman', desk: 'Goldman Sachs', rating: 'A', coupon: 8.55, capBarrierPct: 55, issuePrice: 100.00, expires: '1h 29m', callObs: 'Quarterly @ 100%', barrier: '55% soft · European', mtmDay1: 100.00, returnedAt: 'Live', best: 'protection', pending: false, rfqStatus: 'quoted', deskContact: 'R. Sinclair · hybrids', quoteQuality: 'Stronger protection' },
  { issuer: 'BNP Paribas', desk: 'BNP Paribas', rating: 'A+', coupon: null, capBarrierPct: null, issuePrice: null, expires: '—', callObs: '—', barrier: '—', mtmDay1: null, returnedAt: 'pending', best: null, pending: true, rfqStatus: 'pending', deskContact: 'F. Martins · HY solutions', quoteQuality: 'Awaiting response' },
  { issuer: 'UBS', desk: 'UBS', rating: 'A+', coupon: null, capBarrierPct: null, issuePrice: null, expires: '—', callObs: '—', barrier: '—', mtmDay1: null, returnedAt: 'pending', best: null, pending: true, rfqStatus: 'pending', deskContact: 'H. Graf · SPM Zürich', quoteQuality: 'Awaiting response' },
];
const SP_TEMPLATES = [
  { id: 't-spx-phx', category: 'Autocallable', headline: '~9% p.a.', name: 'SPX Phoenix Memory Autocallable', terms: '3Y · 70/60 · memory', blurb: 'Quarterly autocall on S&P 500 with memory coupon. Mid-vol benchmark for HNW allocations.', shape: 'phoenix', coupon: '~9%', protection: '65% soft', tenor: '3y' },
  { id: 't-mag7', category: 'Autocallable', headline: '~14% p.a.', name: 'Worst-of MAG7 Tech Autocall', terms: '2Y · worst-of · 65/55', blurb: 'Concentrated tech sleeve with worst-of downside. For clients who understand gap risk.', shape: 'phoenix', coupon: '~14%', protection: '65/55', tenor: '2y' },
  { id: 't-aapl-rc', category: 'Reverse Convertible', headline: '~12% p.a.', name: 'AAPL Reverse Convertible', terms: '1Y · 70% barrier · European', blurb: 'Single-name yield with defined barrier observation. Fits tactical income sleeves.', shape: 'reverse_convertible', coupon: '~12%', protection: '70% soft', tenor: '1y' },
  { id: 't-spx-cpn', category: 'Capital Protected Note', headline: '~110% participation', name: '5Y Capital Protected SPX', terms: '5Y · 100% protected · capped 180%', blurb: 'Upside participation with full principal protection at maturity.', shape: 'buffer', coupon: '—', protection: '100% protected', tenor: '5y' },
  { id: 't-ndx-buf', category: 'Buffer Note', headline: '~95% participation', name: '3Y NDX Buffer Note', terms: '3Y · 15% buffer · 140% cap', blurb: 'Buffered downside on growth index with capped upside.', shape: 'buffer', coupon: '—', protection: '15% buffer', tenor: '3y' },
  { id: 't-eu-banks', category: 'Autocallable', headline: '~11% p.a.', name: 'Worst-of EU Banks Autocall', terms: '2Y · worst-of · 75/55', blurb: 'Regional bank basket for yield buyers comfortable with sector concentration.', shape: 'phoenix', coupon: '~11%', protection: '75/55', tenor: '2y' },
];
const SP_HISTORY = [
  {
    id: 'SP-2026-0142',
    type: 'Reverse Convertible on TSLA',
    badge: 'Closed · 3d ago',
    meta: 'USD 2,000,000 · 1Y · 3 desks · 3 of 3 quoted · sent 3d ago',
    quotes: [
      { desk: 'Goldman Sachs', coupon: 11.20, capBarrierPct: 70, issuePrice: 100.00, expires: 'Expired', stale: true },
      { desk: 'JPM Markets', coupon: 11.50, capBarrierPct: 65, issuePrice: 100.05, expires: 'Expired', stale: true },
      { desk: 'Morgan Stanley', coupon: 10.95, capBarrierPct: 70, issuePrice: 100.00, expires: 'Expired', stale: true },
    ],
  },
];

// ---- Structured Products — existing book held across the household
//   barrierPct = soft barrier or hard floor as % of initial spot;
//   spotPct = current underlier vs initial spot (>100 = up, <100 = down)
const SP_BOOK = [
  { id:'sp1', issuer:'JPM', shape:'buffer', name:'SPX Buffer Note 2025-A', clientName: 'The Marchetti Family',
    underlier:'S&P 500', account:'pershing-trust', notional:3000000, mtm:3105000,
    coupon:4.0, couponCollected:120000, barrierPct:90, barrierType:'hard', spotPct:108.4,
    issued:'2025-04-12', maturity:'2027-04-12', nextEvent:'2026-10-12 · Annual obs.',
    pnlPct:3.5 },
  { id:'sp2', issuer:'Goldman', shape:'booster', name:'SPX 1.5× Booster 2024-J', clientName: 'Whitmore Living Trust',
    underlier:'S&P 500', account:'jpm-alts', notional:2500000, mtm:2855000,
    coupon:null, couponCollected:0, barrierPct:80, barrierType:'hard', spotPct:115.2,
    issued:'2024-07-22', maturity:'2027-07-22', nextEvent:'2027-07-22 · Maturity',
    pnlPct:14.2 },
  { id:'sp3', issuer:'Barclays', shape:'reverse_convertible', name:'AAPL Reverse Convertible 2025-Q4', clientName: 'Sato Enterprises LLC',
    underlier:'AAPL', account:'schwab-joint', notional:1200000, mtm:1188000,
    coupon:14.5, couponCollected:43500, barrierPct:70, barrierType:'soft', spotPct:96.8,
    issued:'2025-11-04', maturity:'2026-11-04', nextEvent:'2026-08-04 · Quarterly obs.',
    pnlPct:-1.0 },
];

// ---- Upcoming events from the existing book + the pending RFQ.
//   Each event is: date, kind (observation|autocall_obs|coupon|maturity|trade_date),
//   noteId, label.
const SP_CALENDAR = [
  { date:'2026-05-13', kind:'trade_date',     noteId:null,  label:'SP-2026-0156 — RFQ execution window closes' },
  { date:'2026-06-30', kind:'observation',    noteId:'sp1', label:'SPX Buffer Note · annual observation' },
  { date:'2026-08-04', kind:'observation',    noteId:'sp3', label:'AAPL Rev. Convertible · Q3 observation (autocall)' },
  { date:'2026-08-04', kind:'coupon',         noteId:'sp3', label:'AAPL Rev. Convertible · coupon $43.5k' },
  { date:'2026-10-12', kind:'observation',    noteId:'sp1', label:'SPX Buffer Note · final observation' },
  { date:'2026-11-04', kind:'maturity',       noteId:'sp3', label:'AAPL Rev. Convertible · maturity' },
  { date:'2027-04-12', kind:'maturity',       noteId:'sp1', label:'SPX Buffer Note · maturity' },
  { date:'2027-07-22', kind:'maturity',       noteId:'sp2', label:'SPX 1.5× Booster · maturity' },
];

/** Marchetti row uses live position roll-up in UI when demoFull is true. */
const CLIENT_BOOK = [
  { id:'marchetti', name:'The Marchetti Family', familyType:'UHNW', demoFull: true, ytdPct: 0.052, driftLabel:'US equities 9pp above IPS target', driftTone:'warn', reviewInDays: 7, reviewTone:'warn', custodians:'Schwab · Fidelity · Pershing · JPM', acctCount: 4, lastContact: '2026-05-01', nextAction: 'Prep quarterly review deck', regulatoryFlag: true },
  { id:'al-khalid', name:'Al-Khalid Family Office', familyType:'FO', demoFull: false, aum: 0, ytdPct: 0.041, driftLabel:'Aligned with IPS', driftTone:'ok', reviewInDays: 60, reviewTone:'ok', custodians:'Pershing · Goldman', acctCount: 6, lastContact: '2026-04-12', nextAction: 'Send IPS amendment draft' },
  { id:'whitmore', name:'Whitmore Living Trust', familyType:'HNW', demoFull: false, aum: 0, ytdPct: 0.028, driftLabel:'Fixed income modestly overweight', driftTone:'warn', reviewInDays: -3, reviewTone:'urgent', custodians:'Schwab', acctCount: 2, lastContact: '2026-03-28', nextAction: 'Close annual review — overdue', regulatoryFlag: true },
  { id:'monteiro', name:'Monteiro & Partners', familyType:'FO', demoFull: false, aum: 0, ytdPct: 0.055, driftLabel:'Aligned with IPS', driftTone:'ok', reviewInDays: 30, reviewTone:'warn', custodians:'Pershing · Schwab · UBS', acctCount: 8, lastContact: '2026-04-22', nextAction: 'Deliver performance letter batch' },
  { id:'sato', name:'Sato Enterprises LLC', familyType:'UHNW', demoFull: false, aum: 0, ytdPct: 0.033, driftLabel:'Alts pacing above IPS sleeve', driftTone:'warn', reviewInDays: 14, reviewTone:'warn', custodians:'JPM · Fidelity', acctCount: 5, lastContact: '2026-04-30', nextAction: 'Confirm capital call timings' },
];

/** Book total shown on dashboard; illustrative rows split the remainder after Marchetti (sum of POSITIONS mv). */
const BOOK_AUM_TARGET = 214_000_000;
const _bookAumMarchetti = POSITIONS.reduce((a, p) => a + (p.mv || 0), 0);
(function scaleIllustrativeBookAum() {
  const ill = CLIENT_BOOK.filter(c => !c.demoFull);
  const weights = [189, 42, 315, 124]; // relative size vs prior illustrative book (al-khalid … sato)
  const pool = Math.max(0, BOOK_AUM_TARGET - _bookAumMarchetti);
  const wsum = weights.reduce((s, w) => s + w, 0);
  let acc = 0;
  ill.forEach((row, i) => {
    if (i === ill.length - 1) {
      row.aum = pool - acc;
    } else {
      const part = Math.round((pool * weights[i]) / wsum);
      row.aum = part;
      acc += part;
    }
  });
})();
const BOOK_TOTAL_AUM = _bookAumMarchetti + CLIENT_BOOK.filter(c => !c.demoFull).reduce((a, c) => a + c.aum, 0);

const _bookCounts = {
  activeClients: CLIENT_BOOK.length,
  uhnwCount: CLIENT_BOOK.filter(c => c.familyType === 'UHNW').length,
  hnwCount: CLIENT_BOOK.filter(c => c.familyType === 'HNW').length,
  foCount: CLIENT_BOOK.filter(c => c.familyType === 'FO').length,
};

// ---- Book-level demo: aggregated RM view (Dashboard + client directory).
const BOOK_SUMMARY = {
  totalAum: BOOK_TOTAL_AUM,
  aumMtdPct: 0.032,
  activeClients: _bookCounts.activeClients,
  uhnwCount: _bookCounts.uhnwCount,
  hnwCount: _bookCounts.hnwCount,
  foCount: _bookCounts.foCount,
  /** Wrap + planning fees scale ~60–90 bps on aggregate advisory AUM; YTD ≈ Jan–May / 12 of run-rate. */
  revenueYtd: 658_000,
  revenueYtdVsLy: 0.062,
};

/** Book-level RM targets (illustrative) — consumed only by WM `DashboardScreen` in `book.jsx`. */
const BOOK_RM_TARGETS = {
  nnmAnnualGoal: 48_000_000,
  nnmYtd: 37_200_000,
  newFundedAnnualTarget: 8,
  newFundedYtd: 5,
};

/** Pipeline pulse counts for WM book dashboard (illustrative). */
const BOOK_PIPELINE_COUNTS = {
  lead: 14,
  prospect: 9,
  onboarding: 5,
  funded: 4,
};

const DASHBOARD_TASKS = [
  { id:'d1', label:'Northwind brief — attorney deadline', when:'Today', tone:'urgent' },
  { id:'d2', label:'Send Q1 performance letters — batch 2', when:'3d', tone:'warn' },
  { id:'d3', label:'Annual IPS review · Whitmore trust', when:'Overdue', tone:'urgent' },
  { id:'d4', label:'RFQ follow-up · Phoenix Memory (trade date May 13)', when:'6d', tone:'neutral' },
];

const MARKET_CALENDAR = [
  { id:'mc1', ticker:'NTRL', label:'Naturalia Labs Inc.', date:'2026-05-12', value: 420_000_000, kind:'IPO' },
  { id:'mc2', ticker:'QNTM', label:'QuantumSi Holdings', date:'2026-05-19', value: 1_100_000_000, kind:'IPO' },
  { id:'mc3', ticker:'US-T-3Y', label:'US Treasury 3y reopening', date:'2026-05-28', value: 38_000_000_000, kind:'Auction' },
  { id:'mc4', ticker:'MENA', label:'MENA Infra Trust', date:'2026-06-02', value: 2_400_000_000, kind:'Issuance' },
];

/** MLRO demo: KYC file queue + lifecycle (no portfolio or holdings). */
const COMPLIANCE_KYC = {
  clients: [
    {
      id: 'marchetti',
      name: 'The Marchetti Family',
      segment: 'UHNW',
      rm: 'Christine Holloway',
      lifecycle: 'active',
      kycStatus: 'in_review',
      primaryEmail: 'm.marchetti@example.com',
      jurisdiction: 'United States · New York',
      docs: [
        { id: 'ck-m1', fileName: 'Passport · Marco Marchetti.pdf', docType: 'KYC · identity', uploadedAt: '2026-04-28', status: 'pending' },
        { id: 'ck-m2', fileName: 'W-9 · Marchetti 2019 Trust.pdf', docType: 'KYC · tax', uploadedAt: '2026-04-29', status: 'pending' },
        { id: 'ck-m3', fileName: 'Source of wealth attestation.pdf', docType: 'KYC · SoW', uploadedAt: '2026-05-02', status: 'pending' },
      ],
    },
    {
      id: 'whitmore',
      name: 'Whitmore Living Trust',
      segment: 'HNW',
      rm: 'Christine Holloway',
      lifecycle: 'active',
      kycStatus: 'in_review',
      primaryEmail: 'trustee@whitmore-family.example.com',
      jurisdiction: 'United States · California',
      docs: [
        { id: 'ck-w1', fileName: 'Trust deed · Whitmore.pdf', docType: 'KYC · entity', uploadedAt: '2026-05-04', status: 'pending' },
        { id: 'ck-w2', fileName: 'Driver license · J. Whitmore.pdf', docType: 'KYC · identity', uploadedAt: '2026-05-05', status: 'pending' },
      ],
    },
    {
      id: 'sato',
      name: 'Sato Enterprises LLC',
      segment: 'UHNW',
      rm: 'Daniel Okonkwo',
      lifecycle: 'active',
      kycStatus: 'in_review',
      primaryEmail: 'ops@sato-enterprises.example.com',
      jurisdiction: 'Japan · Tokyo (US filings)',
      docs: [
        { id: 'ck-s1', fileName: 'KYB · certificate of registration.pdf', docType: 'KYB', uploadedAt: '2026-05-01', status: 'pending' },
      ],
    },
    {
      id: 'al-khalid',
      name: 'Al-Khalid Family Office',
      segment: 'FO',
      rm: 'Daniel Okonkwo',
      lifecycle: 'active',
      kycStatus: 'clear',
      primaryEmail: 'coo@alkhalid-fo.example.com',
      jurisdiction: 'United Arab Emirates · ADGM',
      docs: [
        { id: 'ck-ak1', fileName: 'Passport · managing director.pdf', docType: 'KYC · identity', uploadedAt: '2025-06-02', status: 'approved', expiresOn: '2026-06-02' },
        { id: 'ck-ak2', fileName: 'ADGM incorporation · FO SPV.pdf', docType: 'KYB · entity', uploadedAt: '2025-06-03', status: 'approved', expiresOn: '2026-07-07' },
        { id: 'ck-ak3', fileName: 'CRS · self-certification.pdf', docType: 'KYC · tax', uploadedAt: '2026-01-10', status: 'approved', expiresOn: '2026-06-28' },
      ],
    },
    {
      id: 'monteiro',
      name: 'Monteiro & Partners',
      segment: 'FO',
      rm: 'Christine Holloway',
      lifecycle: 'active',
      kycStatus: 'clear',
      primaryEmail: 'compliance@monteiro.partners.example.com',
      jurisdiction: 'Brazil · São Paulo',
      docs: [
        { id: 'ck-mo1', fileName: 'National ID · lead partner.pdf', docType: 'KYC · identity', uploadedAt: '2025-03-01', status: 'approved', expiresOn: '2026-06-22' },
        { id: 'ck-mo2', fileName: 'Proof of address · HQ.pdf', docType: 'KYC · address', uploadedAt: '2026-03-01', status: 'approved', expiresOn: '2027-03-01' },
        { id: 'ck-mo3', fileName: 'UBO chart · Monteiro holdings.pdf', docType: 'KYB · structure', uploadedAt: '2025-11-20', status: 'approved', expiresOn: '2026-08-06' },
      ],
    },
    {
      id: 'pipeline-aurora',
      name: 'Aurora Founders SPV',
      segment: 'Prospect · UHNW',
      rm: 'Christine Holloway',
      lifecycle: 'pipeline',
      kycStatus: 'prospect',
      primaryEmail: '—',
      jurisdiction: 'United States · Delaware (pending onboarding)',
      docs: [
        { id: 'ck-pa1', fileName: 'Formation docs · charter (draft).pdf', docType: 'KYB · preliminary', uploadedAt: '2026-05-07', status: 'pending' },
      ],
    },
    {
      id: 'pipeline-kestrel',
      name: 'Kestrel Mobility Ltd',
      segment: 'Prospect · HNW',
      rm: 'Daniel Okonkwo',
      lifecycle: 'pipeline',
      kycStatus: 'prospect',
      primaryEmail: '—',
      jurisdiction: 'United Kingdom · onboarding queue',
      docs: [
        { id: 'ck-pk1', fileName: 'KYB excerpt · Companies House.pdf', docType: 'KYB · preliminary', uploadedAt: '2026-05-06', status: 'pending' },
      ],
    },
    {
      id: 'pipeline-lang',
      name: 'Lang & Co. Household',
      segment: 'Prospect · UHNW',
      rm: 'Christine Holloway',
      lifecycle: 'pipeline',
      kycStatus: 'prospect',
      primaryEmail: '—',
      jurisdiction: 'Referral · intro call booked',
      docs: [],
    },
  ],
};

window.Slate = window.Slate || {};
Object.assign(window.Slate, {
  POSITIONS, ACCOUNTS, HOUSEHOLD, HOUSEHOLD_BRIEFING, STATEMENTS, INSIGHTS,
  ALT_DEALS, ALT_THESES, ALT_STRATEGY_MIX, ALT_JCURVE, ALT_CASHFLOW, ALT_UNFUNDED_LADDER, HOUSEHOLD_CASHFLOW,
  SP_RFQ, SP_QUOTES, SP_TEMPLATES, SP_HISTORY, SP_BOOK, SP_CALENDAR,
  BOOK_SUMMARY, BOOK_RM_TARGETS, BOOK_PIPELINE_COUNTS, CLIENT_BOOK, DASHBOARD_TASKS, MARKET_CALENDAR,
  COMPLIANCE_KYC,
});

})();
