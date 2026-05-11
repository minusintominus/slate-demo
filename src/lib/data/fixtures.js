// Slate — mock data fixture.

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
  segment: 'UHNW',
  rm: 'Christine Holloway',
  investmentPolicyStatementTargets: { us_equity: 38, intl_equity: 16, fixed_income: 28, alternative: 13, cash: 5, commodity: 0 }, // %
  benchmark: '60/40',
};

const STATEMENTS = [
  { id:'s1', file:'Schwab_Mar2026_Joint.pdf',     date:'2026-03-31', pages:9,  account:'schwab-joint',    extracted:13, value:30002933, flagged:0 },
  { id:'s2', file:'Fidelity_Mar2026_Roth.pdf',    date:'2026-03-31', pages:11, account:'fidelity-roth',   extracted:11, value:7774250,  flagged:1 },
  { id:'s3', file:'Pershing_Mar2026_Trust.pdf',   date:'2026-03-31', pages:14, account:'pershing-trust',  extracted:7,  value:22524000, flagged:1 },
  { id:'s4', file:'JPMP_Q1_2026_Alts.pdf',        date:'2026-03-31', pages:4,  account:'jpm-alts',        extracted:1,  value:8400000,  flagged:1 },
];

const INSIGHTS = [
  { id:'i1', clientId:'marchetti', kind:'concentration', priority:'high', title:'AAPL is 14.8% of household net worth',
    body:'Up from 9.1% YoY. The Investment Policy Statement caps any single security at 7%. $4.1M of unrealized long-term gains makes a clean exit tax-inefficient.',
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
];

// Per-client insights for the other households. Each set reflects the
// drift, family type, and review status from CLIENT_BOOK.
const INSIGHTS_AL_KHALID = [
  { id:'ak1', clientId:'al-khalid', kind:'allocation', priority:'high',
    title:'Co-invest fits IPS — Northwind Climate Infrastructure',
    body:'IPS targets 8–12% real-asset allocation; current 4.1%. Northwind closes Aug 22 with $2.5M minimum. Renewables sleeve aligns with the family ESG charter. Pine Ridge II distribution due Q3 frees ~$3.8M for the commitment.',
    impact: { reposition: 2500000, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Allocate $2.5M to Northwind Climate Infrastructure',
      'Hold $1.3M from the Pine Ridge II distribution for Q4 redeployment',
      'Schedule sponsor call with Northwind partner before Aug 1 cut-off',
    ],
  },
  { id:'ak2', clientId:'al-khalid', kind:'fx', priority:'medium',
    title:'$4.2M of multi-currency cash drag',
    body:'AED, EUR, and GBP balances earning local sweep rates well below USD MMF. Family living expenses settle in USD; Pershing FX desk can sweep monthly with a forward overlay.',
    impact: { reposition: 4200000, taxSaved: 0, incomeLift: 156000 },
    actions: [
      'Convert AED / EUR / GBP balances to USD MMF on a rolling 30d cadence',
      'Layer a 6-month forward to cover the Dubai property tax cycle (Jul / Jan)',
      'Move to the Pershing currency-overlay program — saves ~18bps vs spot',
    ],
  },
  { id:'ak3', clientId:'al-khalid', kind:'allocation', priority:'medium',
    title:'Direct lending sleeve under-allocated by $6M',
    body:'Atlas Direct Lending Fund VII closes Jun 30. IPS allows up to 15% private credit; current sleeve at 9.1%. Defensive vintage with senior secured floating-rate exposure pairs with the family\'s rate-sensitive view.',
    impact: { reposition: 6000000, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Subscribe to Atlas Direct Lending VII at the $5M minimum',
      'Side-pocket the existing Goldman direct loans into the new sleeve to clean reporting',
    ],
  },
];

const INSIGHTS_WHITMORE = [
  { id:'wm1', clientId:'whitmore', kind:'compliance', priority:'high',
    title:'Annual trustee review 3 days overdue',
    body:'State trust statute requires annual review documentation. Last review filed Apr 2025. The trustee meeting needs to be scheduled and minutes circulated within 7 days to stay inside the 30-day grace window.',
    impact: { reposition: 0, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Send a trustee meeting invite for next Tuesday',
      'Compile a 12-month performance + IPS adherence pack',
      'Update beneficiary contact info if anything changed since 2025',
    ],
  },
  { id:'wm2', clientId:'whitmore', kind:'risk', priority:'high',
    title:'Bond ladder duration drifted to 8.2y vs 6y target',
    body:'40% of fixed income now sits past the 7-year mark after the 30y muni reinvestment in February. With Fed cuts pricing in by Q3, mark-to-market exposure is asymmetric. The trust target band is 5–7y for the trust horizon.',
    impact: { reposition: 14000000, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Sell $4M of 30y muni positions; reinvest in the 5–7y belly',
      'Layer 1y T-Bills for the callable-portion replacement',
      'Set quarterly ladder rebalances going forward',
    ],
  },
  { id:'wm3', clientId:'whitmore', kind:'cashflow', priority:'medium',
    title:'Q4 trust distribution — coupon timing mismatch',
    body:'$420k distribution due Dec 15. The largest coupon receipts land Nov 1 (NY muni 5%) and Feb 1, leaving a ~3 week cash bridge unless the calendar is smoothed.',
    impact: { reposition: 0, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Sell down a 0.4y T-Bill ladder rung in early December',
      'Rebalance the coupon calendar: shift one position to the Aug / Feb cycle',
      'Maintain a $500k minimum cash buffer in trust',
    ],
  },
];

const INSIGHTS_MONTEIRO = [
  { id:'mn1', clientId:'monteiro', kind:'fx', priority:'medium',
    title:'EUR/USD hedge rolls in 14 days',
    body:'$8M notional EUR hedge expires Jun 6. UBS desk has quoted 1.0915 on the 6m forward. The family\'s Lisbon obligations (~€2.8M / yr) will be unhedged after this rolls.',
    impact: { reposition: 8000000, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Roll the existing $8M EUR forward at 1.0915 (6m)',
      'Layer a ladder of 3-6-9 month forwards going forward',
      'Re-evaluate the hedge ratio against the next Lisbon disbursement',
    ],
  },
  { id:'mn2', clientId:'monteiro', kind:'cash', priority:'medium',
    title:'$3.2M cash split across 3 custodians earning sub-sweep rates',
    body:'Pershing 0.4%, Schwab 0.6%, UBS 0.5%. Consolidating into Schwab Treasury Direct adds ~$148k / yr. No specific liquidity need — Q3 capital call ($1.1M) is already earmarked at JPM.',
    impact: { reposition: 3200000, taxSaved: 0, incomeLift: 148000 },
    actions: [
      'Sweep Pershing + UBS cash to Schwab MMF',
      'Document the custodian-of-record change in the IPS appendix',
    ],
  },
  { id:'mn3', clientId:'monteiro', kind:'compliance', priority:'low',
    title:'Annual Investment Policy Statement attestation due in 30 days',
    body:'IPS signed Jun 2025 — refresh required for trust governance. No material drift since the last review; mostly an admin-and-signatures cycle.',
    impact: { reposition: 0, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Pre-fill the attestation pack with the 2025 performance summary',
      'Schedule the signing call with Ana Monteiro before Jun 15',
      'File the signed copy with each custodian',
    ],
  },
];

const INSIGHTS_SATO = [
  { id:'st1', clientId:'sato', kind:'allocation', priority:'high',
    title:'Alts allocation 6pp above policy target',
    body:'Current 26% vs IPS target 20% (band 15–25%). The recent Helios Tech distribution went unfunded, pushing the sleeve out of band. Two paths: trim early, or revise the IPS upward and document the rationale.',
    impact: { reposition: 4500000, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Pause new alts commitments until the ratio re-enters the band',
      'Sell Helios Tech secondary on the JPM tape — currently at NAV minus 4%',
      'Document an IPS amendment if the family wants to keep the current weight',
    ],
  },
  { id:'st2', clientId:'sato', kind:'cashflow', priority:'high',
    title:'Pine Ridge II capital call — wire by May 22',
    body:'$1.6M call notice received. Funds sit at JPM Alts; cash sweep at 5.18% so opportunity cost is small but the wiring window is fixed.',
    impact: { reposition: 1600000, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Confirm wire instructions with JPM ops',
      'Move $1.6M from MMF to the settlement account by May 21',
      'Update the unfunded ladder model after settlement',
    ],
  },
  { id:'st3', clientId:'sato', kind:'risk', priority:'medium',
    title:'Single-issuer concentration in private credit',
    body:'$5.2M (≈3.8% of portfolio) sits with a single Atlas BDC vehicle. The IPS caps single-issuer credit at 5%, but the underwriting team has flagged tightening on the senior tranche. Worth a re-up review before the next subscription.',
    impact: { reposition: 5200000, taxSaved: 0, incomeLift: 0 },
    actions: [
      'Pause the Atlas re-up until the next sponsor call (Jun 12)',
      'Diversify the next $3M into Atlas Fund VII or a peer name',
      'Set an issuer-concentration alert at 4.5% in the dashboard',
    ],
  },
];

const INSIGHTS_BY_CLIENT = {
  marchetti: INSIGHTS,
  'al-khalid': INSIGHTS_AL_KHALID,
  whitmore: INSIGHTS_WHITMORE,
  monteiro: INSIGHTS_MONTEIRO,
  sato: INSIGHTS_SATO,
};

const ALL_INSIGHTS = [
  ...INSIGHTS,
  ...INSIGHTS_AL_KHALID,
  ...INSIGHTS_WHITMORE,
  ...INSIGHTS_MONTEIRO,
  ...INSIGHTS_SATO,
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
    { role:'Wealth Manager',           name:'Christine Holloway', primary:true },
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
    why:'Matches reshoring thesis; sponsor delivered 2.4× DPI on Fund III.',
    fit:{ sponsor:28, investmentPolicyStatement:34, vintage:18, diversification:14 } },
  { id:'a2', name:'Atlas Direct Lending Fund VII', sponsor:'Atlas Credit Partners', strategy:'Private Credit · Senior Secured',
    strategyKey:'credit', vintage:2026, gpCommit:'2.5%', coInvest:false,
    minimum:2500000, target:'10-12%', term:'6y', mgmt:1.25, carry:15, fitScore:88, status:'Open',
    closeDate:'2026-06-30', commitments:'$1.2B / $1.5B', thesisKey:'floating_income',
    why:'Trust Investment Policy Statement calls for floating-rate income. Defensive vintage.',
    fit:{ sponsor:24, investmentPolicyStatement:32, vintage:17, diversification:15 } },
  { id:'a3', name:'Northwind Climate Infrastructure', sponsor:'Northwind Partners', strategy:'Real Assets · Renewables',
    strategyKey:'real_assets', vintage:2026, gpCommit:'3.0%', coInvest:true,
    minimum:5000000, target:'12-15%', term:'12y', mgmt:1.5, carry:20, fitScore:82, status:'Open',
    closeDate:'2026-08-22', commitments:'$880M / $1.2B', thesisKey:'ira_climate',
    why:'Long-dated cashflows pair well with Trust horizon.',
    fit:{ sponsor:22, investmentPolicyStatement:30, vintage:16, diversification:14 } },
  { id:'a4', name:'Sequoia AI Growth III', sponsor:'Sequoia Capital', strategy:'Venture · Late Stage',
    strategyKey:'venture', vintage:2026, gpCommit:'1.5%', coInvest:false,
    minimum:10000000, target:'25%+', term:'10y', mgmt:2.0, carry:25, fitScore:78, status:'Limited',
    closeDate:'2026-05-30', commitments:'$1.8B / $2.0B', thesisKey:'ai_infra',
    why:'High-conviction AI thesis; concentration if combined with public AAPL/MSFT/NVDA.',
    fit:{ sponsor:28, investmentPolicyStatement:24, vintage:18, diversification:8 } },
  { id:'a5', name:'Cornerstone Multifamily Fund VI', sponsor:'Cornerstone Realty', strategy:'Real Estate · Sun Belt MF',
    strategyKey:'real_assets', vintage:2026, gpCommit:'2.0%', coInvest:true,
    minimum:1000000, target:'14-16%', term:'8y', mgmt:1.5, carry:20, fitScore:71, status:'Open',
    closeDate:'2026-09-10', commitments:'$540M / $750M', thesisKey:'sun_belt',
    why:'Inflation hedge; complements Treasury-heavy Trust book.',
    fit:{ sponsor:18, investmentPolicyStatement:26, vintage:14, diversification:13 } },
  { id:'a6', name:'Helios Secondaries 2026', sponsor:'Helios Capital', strategy:'PE Secondaries · GP-Led',
    strategyKey:'secondaries', vintage:2026, gpCommit:'5.0%', coInvest:false,
    minimum:2500000, target:'14-17%', term:'7y', mgmt:1.25, carry:12.5, fitScore:85, status:'Open',
    closeDate:'2026-07-01', commitments:'$680M / $1.0B', thesisKey:'pe_discount',
    why:'J-curve mitigation; quicker DPI than primary commitments.',
    fit:{ sponsor:24, investmentPolicyStatement:28, vintage:19, diversification:14 } },
];

// Recently closed funds — final raise complete, no longer pitchable.
// Surface in Alternatives → Closed for context (sponsor track record, vintage).
const ALT_CLOSED_DEALS = [
  { id:'ac1', name:'Pine Ridge Opportunities III', sponsor:'Pine Ridge Capital',
    strategy:'Buyout · Industrials', vintage:2023, closedDate:'2024-09-30',
    finalRaise:'$580M / $580M', target:'18-22%', term:'10y + 2',
    minimum:5000000, mgmt:1.75, carry:20,
    outcome:'Oversubscribed · final close above target', dpi:'2.4×' },
  { id:'ac2', name:'Atlas Direct Lending Fund VI', sponsor:'Atlas Credit Partners',
    strategy:'Private Credit · Senior Secured', vintage:2023, closedDate:'2024-12-15',
    finalRaise:'$1.4B / $1.4B', target:'9-11%', term:'6y',
    minimum:2500000, mgmt:1.25, carry:15,
    outcome:'Hard cap reached · LP allocations cut by 12%', dpi:'1.3×' },
  { id:'ac3', name:'Northwind Climate Infra II', sponsor:'Northwind Partners',
    strategy:'Real Assets · Renewables', vintage:2022, closedDate:'2023-11-20',
    finalRaise:'$920M / $1.0B', target:'11-13%', term:'12y',
    minimum:5000000, mgmt:1.5, carry:20,
    outcome:'Closed below target · IRA tailwind underestimated', dpi:'1.1×' },
  { id:'ac4', name:'Cornerstone Multifamily V', sponsor:'Cornerstone Realty',
    strategy:'Real Estate · Sun Belt MF', vintage:2022, closedDate:'2023-08-08',
    finalRaise:'$485M / $500M', target:'13-15%', term:'8y',
    minimum:1000000, mgmt:1.5, carry:20,
    outcome:'Final close below cap · slower deployment vs plan', dpi:'1.2×' },
  { id:'ac5', name:'Helios Secondaries 2024', sponsor:'Helios Capital',
    strategy:'PE Secondaries · GP-Led', vintage:2023, closedDate:'2024-04-25',
    finalRaise:'$760M / $750M', target:'13-16%', term:'7y',
    minimum:2500000, mgmt:1.25, carry:12.5,
    outcome:'Oversubscribed · 102% of target', dpi:'1.6×' },
];

// Subscriptions the book has placed across alts deals. Joins onto CLIENT_BOOK
// and ALT_DEALS / ALT_CLOSED_DEALS by clientId / dealId.
const ALT_SUBSCRIPTIONS = [
  { id:'s1', clientId:'marchetti', dealId:'a1', dealName:'Pine Ridge Opportunities IV',
    sponsor:'Pine Ridge Capital', strategy:'Buyout · Industrials',
    commitment:7500000, currency:'USD', committedDate:'2026-04-12', status:'Committed' },
  { id:'s2', clientId:'marchetti', dealId:'a6', dealName:'Helios Secondaries 2026',
    sponsor:'Helios Capital', strategy:'PE Secondaries · GP-Led',
    commitment:5000000, currency:'USD', committedDate:'2026-04-22', status:'Committed' },
  { id:'s3', clientId:'al-khalid', dealId:'a3', dealName:'Northwind Climate Infrastructure',
    sponsor:'Northwind Partners', strategy:'Real Assets · Renewables',
    commitment:12000000, currency:'USD', committedDate:'2026-04-30', status:'Committed' },
  { id:'s4', clientId:'al-khalid', dealId:'a2', dealName:'Atlas Direct Lending Fund VII',
    sponsor:'Atlas Credit Partners', strategy:'Private Credit · Senior Secured',
    commitment:8500000, currency:'USD', committedDate:'2026-04-18', status:'Funded · 32%' },
  { id:'s5', clientId:'monteiro', dealId:'a4', dealName:'Sequoia AI Growth III',
    sponsor:'Sequoia Capital', strategy:'Venture · Late Stage',
    commitment:10000000, currency:'USD', committedDate:'2026-04-08', status:'Committed' },
  { id:'s6', clientId:'monteiro', dealId:'a6', dealName:'Helios Secondaries 2026',
    sponsor:'Helios Capital', strategy:'PE Secondaries · GP-Led',
    commitment:6000000, currency:'USD', committedDate:'2026-04-25', status:'Committed' },
  { id:'s7', clientId:'sato', dealId:'a4', dealName:'Sequoia AI Growth III',
    sponsor:'Sequoia Capital', strategy:'Venture · Late Stage',
    commitment:15000000, currency:'USD', committedDate:'2026-04-15', status:'Committed' },
  { id:'s8', clientId:'sato', dealId:'a1', dealName:'Pine Ridge Opportunities IV',
    sponsor:'Pine Ridge Capital', strategy:'Buyout · Industrials',
    commitment:5000000, currency:'USD', committedDate:'2026-04-28', status:'Committed' },
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
  id:'rfq-2026-0506-01',
  underlier:'AAPL · MSFT · NVDA · worst-of',
  type:'Autocallable Phoenix Memory',
  notional:5000000,
  tenor:'2 years',
  observation:'Quarterly',
  protection:'Soft barrier 65% (European)',
  status:'10 issuers · 8 returned · 2 pending',
  sentAt:'14:02 ET',
  bestBid:'JPM',
};
const SP_QUOTES = [
  { issuer:'JPM',          rating:'A',   coupon:11.40, callObs:'Quarterly @ 100%', barrier:'65% European', mtmDay1:99.85, returnedAt:'14:08', best:'coupon' },
  { issuer:'Goldman',      rating:'A',   coupon:11.10, callObs:'Quarterly @ 100%', barrier:'65% European', mtmDay1:99.70, returnedAt:'14:09' },
  { issuer:'Morgan Stanley',rating:'A',  coupon:10.95, callObs:'Quarterly @ 100%', barrier:'65% European', mtmDay1:99.78, returnedAt:'14:11' },
  { issuer:'BNP Paribas',  rating:'A+',  coupon:10.80, callObs:'Quarterly @ 100%', barrier:'70% European', mtmDay1:99.92, returnedAt:'14:07', best:'protection' },
  { issuer:'Barclays',     rating:'A',   coupon:10.60, callObs:'Quarterly @ 100%', barrier:'65% American', mtmDay1:99.62, returnedAt:'14:13' },
  { issuer:'Citi',         rating:'A',   coupon:10.40, callObs:'Quarterly @ 100%', barrier:'65% European', mtmDay1:99.55, returnedAt:'14:12' },
  { issuer:'Société Gén.', rating:'A',   coupon:10.25, callObs:'Quarterly @ 100%', barrier:'65% European', mtmDay1:99.48, returnedAt:'14:14' },
  { issuer:'UBS',          rating:'A+',  coupon:10.10, callObs:'Quarterly @ 100%', barrier:'70% European', mtmDay1:99.81, returnedAt:'14:16' },
  { issuer:'HSBC',         rating:'A+',  coupon:null,  callObs:'—',                barrier:'—',            mtmDay1:null, returnedAt:'pending', pending:true },
  { issuer:'Wells Fargo',  rating:'A',   coupon:null,  callObs:'—',                barrier:'—',            mtmDay1:null, returnedAt:'pending', pending:true },
];
const SP_TEMPLATES = [
  { id:'t1', name:'Income — Worst-of Phoenix',     tenor:'2y', coupon:'10–12%', protection:'65% soft', use:'Yield enhancement on equity exposure', shape:'phoenix' },
  { id:'t2', name:'Growth — 1.5× Booster',         tenor:'3y', coupon:'—',      protection:'80% hard', use:'Levered upside, cap on downside',     shape:'booster' },
  { id:'t3', name:'Defensive — Buffer Note',       tenor:'2y', coupon:'4%',     protection:'90% hard', use:'Sub-50 vol, principal-friendly',      shape:'buffer'  },
  { id:'t4', name:'Yield — Reverse Convertible',   tenor:'1y', coupon:'14–18%', protection:'70% soft', use:'Tactical income, single name',        shape:'reverse_convertible' },
];

// ---- Structured Products — existing book held across the household
//   barrierPct = soft barrier or hard floor as % of initial spot;
//   spotPct = current underlier vs initial spot (>100 = up, <100 = down)
const SP_BOOK = [
  { id:'sp1', issuer:'JPM', shape:'buffer', name:'SPX Buffer Note 2025-A',
    underlier:'S&P 500', strike:5500, currentSpot:5950, account:'pershing-trust', notional:3000000, mtm:3105000,
    coupon:4.0, couponCollected:120000, barrierPct:90, barrierType:'hard', spotPct:108.2,
    levels:[{ kind:'buffer', pct:90, obs:'European' }],
    issued:'2025-04-12', maturity:'2027-04-12', nextEvent:'2026-10-12 · Annual obs.',
    pnlPct:3.5 },
  { id:'sp2', issuer:'Goldman', shape:'booster', name:'SPX 1.5× Booster 2024-J',
    underlier:'S&P 500', strike:5200, currentSpot:5950, account:'jpm-alts', notional:2500000, mtm:2855000,
    coupon:null, couponCollected:0, barrierPct:80, barrierType:'hard', spotPct:114.4,
    levels:[
      { kind:'knock-out', pct:80, obs:'Continuous' },
      { kind:'cap', pct:135 }
    ],
    issued:'2024-07-22', maturity:'2027-07-22', nextEvent:'2027-07-22 · Maturity',
    pnlPct:14.2 },
  { id:'sp3', issuer:'Barclays', shape:'reverse_convertible', name:'AAPL Reverse Convertible 2025-Q4',
    underlier:'AAPL', strike:230, currentSpot:222.50, account:'schwab-joint', notional:1200000, mtm:1188000,
    coupon:14.5, couponCollected:43500, barrierPct:70, barrierType:'soft', spotPct:96.7,
    levels:[{ kind:'knock-in', pct:70, obs:'Continuous' }],
    issued:'2025-11-04', maturity:'2026-11-04', nextEvent:'2026-08-04 · Quarterly obs.',
    pnlPct:-1.0 },
];

// ---- Upcoming events from the existing book + the pending RFQ.
//   Each event is: date, kind (observation|autocall_obs|coupon|maturity|trade_date),
//   noteId, label.
const SP_CALENDAR = [
  { date:'2026-05-13', kind:'trade_date',     noteId:null,  label:'Phoenix Memory RFQ — execution window closes' },
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
  { id:'marchetti', name:'The Marchetti Family', familyType:'UHNW', demoFull: true, driftLabel:'US Equity ▲9pp', driftTone:'warn', reviewInDays: 7, reviewTone:'warn', custodians:'Schwab · Fidelity · Pershing · JPM', acctCount: 4, aumAdvisoryFrac: 0.78, ytdAdvisoryPct: 0.052, ytdNonAdvisoryPct: 0.031, benchmark:'SPX', feeAdvisory:['50,000 USD', '0.20% p.a.'], feeNonAdvisory:['12,500 USD'] },
  { id:'al-khalid', name:'Al-Khalid Family Office', familyType:'FO', demoFull: false, aum: 0, driftLabel:'On target', driftTone:'ok', reviewInDays: 60, reviewTone:'ok', custodians:'Pershing · Goldman', acctCount: 6, aumAdvisoryFrac: 0.65, ytdAdvisoryPct: 0.041, ytdNonAdvisoryPct: 0.028, benchmark:'T-bills +2%', feeAdvisory:['100,000 USD', '0.15% p.a.'], feeNonAdvisory:['8,000 USD'] },
  { id:'whitmore', name:'Whitmore Living Trust', familyType:'HNW', demoFull: false, aum: 0, driftLabel:'Fixed income ▲4pp', driftTone:'warn', reviewInDays: -3, reviewTone:'urgent', custodians:'Schwab', acctCount: 2, aumAdvisoryFrac: 1.0, ytdAdvisoryPct: 0.028, ytdNonAdvisoryPct: null, benchmark:'7%', feeAdvisory:['0.75% p.a.'], feeNonAdvisory:['—'] },
  { id:'monteiro', name:'Monteiro & Partners', familyType:'FO', demoFull: false, aum: 0, driftLabel:'On target', driftTone:'ok', reviewInDays: 30, reviewTone:'warn', custodians:'Pershing · Schwab · UBS', acctCount: 8, aumAdvisoryFrac: 0.55, ytdAdvisoryPct: 0.055, ytdNonAdvisoryPct: 0.034, benchmark:'12%', feeAdvisory:['75,000 USD', '0.18% p.a.'], feeNonAdvisory:['15,000 USD'] },
  { id:'sato', name:'Sato Enterprises LLC', familyType:'UHNW', demoFull: false, aum: 0, driftLabel:'Alts ▲6pp', driftTone:'warn', reviewInDays: 14, reviewTone:'warn', custodians:'JPM · Fidelity', acctCount: 5, aumAdvisoryFrac: 1.0, ytdAdvisoryPct: 0.033, ytdNonAdvisoryPct: null, benchmark:'QQQ', feeAdvisory:['0.25% p.a.'], feeNonAdvisory:['—'] },
];

// Per-client AUM is the rolled-up market value of that client's positions.
// Marchetti uses POSITIONS via demoFull → clientAum; the rest get their
// `aum` filled in here so the Clients table, dashboard rollups, and the
// workspace/meet portfolio pages all agree.
const _bookAumMarchetti = POSITIONS.reduce((a, p) => a + (p.mv || 0), 0);
(function setIllustrativeBookAum() {
  const sumMv = (arr) => arr.reduce((a, p) => a + (p.mv || 0), 0);
  const aumByClient = {
    'al-khalid': sumMv(AL_KHALID_POSITIONS),
    'whitmore':  sumMv(WHITMORE_POSITIONS),
    'monteiro':  sumMv(MONTEIRO_POSITIONS),
    'sato':      sumMv(SATO_POSITIONS)
  };
  for (const row of CLIENT_BOOK) {
    if (!row.demoFull && aumByClient[row.id] != null) row.aum = aumByClient[row.id];
  }
})();
const BOOK_TOTAL_AUM = _bookAumMarchetti + CLIENT_BOOK.filter(c => !c.demoFull).reduce((a, c) => a + c.aum, 0);

const BOOK_AUM_BRIDGE = {
  start: BOOK_TOTAL_AUM - 5_400_000,
  market: 4_800_000,
  inflows: 2_100_000,
  outflows: -1_500_000,
  pending: 6_300_000,
};

const _bookCounts = {
  activeClients: CLIENT_BOOK.length,
  uhnwCount: CLIENT_BOOK.filter(c => c.familyType === 'UHNW').length,
  hnwCount: CLIENT_BOOK.filter(c => c.familyType === 'HNW').length,
  foCount: CLIENT_BOOK.filter(c => c.familyType === 'FO').length,
};

const BOOK_SUMMARY = {
  totalAum: BOOK_TOTAL_AUM,
  aumYtdPct: 0.032,
  horizon: 'May 2026',
  firmContext: 'Northeast UHNW desk',
  feeableAum: Math.round(BOOK_TOTAL_AUM * 0.84),
  heldAwayAum: Math.round(BOOK_TOTAL_AUM * 0.09),
  cashAndSweep: Math.round(BOOK_TOTAL_AUM * 0.045),
  advisoryExcludedAum: Math.round(BOOK_TOTAL_AUM * 0.025),
  mtdNetFlow: BOOK_AUM_BRIDGE.inflows + BOOK_AUM_BRIDGE.outflows,
  expectedNetFlow: BOOK_AUM_BRIDGE.inflows + BOOK_AUM_BRIDGE.outflows + BOOK_AUM_BRIDGE.pending,
  annualizedRevenue: 1_160_000,
  avgFeeBps: 54,
  activeClients: _bookCounts.activeClients,
  uhnwCount: _bookCounts.uhnwCount,
  hnwCount: _bookCounts.hnwCount,
  foCount: _bookCounts.foCount,
  flaggedPortfolios: 2,
  reviewsOverdue: 1,
  activeRfqs: 2,
  revenueYtd: 387_000,
  revenueYtdVsLastYear: 0.084,
};

const BOOK_FLOW_EVENTS = [
  { id:'bf1', household:'Marchetti', type:'inflow',  amount:1_300_000, timing:'May', confidence:'high', driver:'Alts funding transfer into JPM Private' },
  { id:'bf2', household:'Al-Khalid', type:'inflow',  amount:900_000,   timing:'May', confidence:'med',  driver:'New trust sleeve pending transfer' },
  { id:'bf3', household:'Monteiro',  type:'outflow', amount:-750_000,  timing:'May', confidence:'high', driver:'Real estate escrow draw' },
  { id:'bf4', household:'Sato',      type:'inflow',  amount:620_000,   timing:'June', confidence:'med', driver:'Private credit distribution expected' },
  { id:'bf5', household:'Whitmore',  type:'outflow', amount:-420_000,  timing:'May', confidence:'high', driver:'Estimated tax payment' },
];

const DASHBOARD_TASKS = [
  { id:'d1', label:'Northwind brief — attorney deadline', when:'Today', tone:'urgent' },
  { id:'d2', label:'Send Q1 performance letters — batch 2', when:'3d', tone:'warn' },
  { id:'d3', label:'Annual Investment Policy Statement review · Whitmore trust', when:'Overdue', tone:'urgent' },
  { id:'d4', label:'RFQ follow-up · Phoenix Memory (trade date May 13)', when:'6d', tone:'neutral' },
];

const MARKET_CALENDAR = [
  { id:'mc1', ticker:'NTRL', label:'Naturalia Labs Inc.', date:'2026-05-12', value: 420_000_000, kind:'IPO' },
  { id:'mc2', ticker:'QNTM', label:'QuantumSi Holdings', date:'2026-05-19', value: 1_100_000_000, kind:'IPO' },
  { id:'mc3', ticker:'US-T-3Y', label:'US Treasury 3y reopening', date:'2026-05-28', value: 38_000_000_000, kind:'Auction' },
  { id:'mc4', ticker:'MENA', label:'MENA Infra Trust', date:'2026-06-02', value: 2_400_000_000, kind:'Issuance' },
];

// ── Per-client fixture maps ──────────────────────────────────────────
// Marchetti's data lives above (the canonical demo); the others come from
// per-client-fixtures.js. Resolvers in domain/book.js consume these.
import {
  AL_KHALID_ACCOUNTS, AL_KHALID_POSITIONS, AL_KHALID_BRIEFING, AL_KHALID_CASHFLOW,
  AL_KHALID_ALT_STRATEGY_MIX, AL_KHALID_ALT_JCURVE, AL_KHALID_ALT_CASHFLOW, AL_KHALID_UNFUNDED_LADDER,
  WHITMORE_ACCOUNTS, WHITMORE_POSITIONS, WHITMORE_BRIEFING, WHITMORE_CASHFLOW,
  WHITMORE_ALT_STRATEGY_MIX, WHITMORE_ALT_JCURVE, WHITMORE_ALT_CASHFLOW, WHITMORE_UNFUNDED_LADDER,
  MONTEIRO_ACCOUNTS, MONTEIRO_POSITIONS, MONTEIRO_BRIEFING, MONTEIRO_CASHFLOW,
  MONTEIRO_ALT_STRATEGY_MIX, MONTEIRO_ALT_JCURVE, MONTEIRO_ALT_CASHFLOW, MONTEIRO_UNFUNDED_LADDER,
  SATO_ACCOUNTS, SATO_POSITIONS, SATO_BRIEFING, SATO_CASHFLOW,
  SATO_ALT_STRATEGY_MIX, SATO_ALT_JCURVE, SATO_ALT_CASHFLOW, SATO_UNFUNDED_LADDER
} from './per-client-fixtures.js';

const POSITIONS_BY_CLIENT = {
  marchetti: POSITIONS,
  'al-khalid': AL_KHALID_POSITIONS,
  whitmore: WHITMORE_POSITIONS,
  monteiro: MONTEIRO_POSITIONS,
  sato: SATO_POSITIONS
};
const ACCOUNTS_BY_CLIENT = {
  marchetti: ACCOUNTS,
  'al-khalid': AL_KHALID_ACCOUNTS,
  whitmore: WHITMORE_ACCOUNTS,
  monteiro: MONTEIRO_ACCOUNTS,
  sato: SATO_ACCOUNTS
};
const HOUSEHOLD_BRIEFING_BY_CLIENT = {
  marchetti: HOUSEHOLD_BRIEFING,
  'al-khalid': AL_KHALID_BRIEFING,
  whitmore: WHITMORE_BRIEFING,
  monteiro: MONTEIRO_BRIEFING,
  sato: SATO_BRIEFING
};
const HOUSEHOLD_CASHFLOW_BY_CLIENT = {
  marchetti: HOUSEHOLD_CASHFLOW,
  'al-khalid': AL_KHALID_CASHFLOW,
  whitmore: WHITMORE_CASHFLOW,
  monteiro: MONTEIRO_CASHFLOW,
  sato: SATO_CASHFLOW
};
const ALT_STRATEGY_MIX_BY_CLIENT = {
  marchetti: ALT_STRATEGY_MIX,
  'al-khalid': AL_KHALID_ALT_STRATEGY_MIX,
  whitmore: WHITMORE_ALT_STRATEGY_MIX,
  monteiro: MONTEIRO_ALT_STRATEGY_MIX,
  sato: SATO_ALT_STRATEGY_MIX
};
const ALT_JCURVE_BY_CLIENT = {
  marchetti: ALT_JCURVE,
  'al-khalid': AL_KHALID_ALT_JCURVE,
  whitmore: WHITMORE_ALT_JCURVE,
  monteiro: MONTEIRO_ALT_JCURVE,
  sato: SATO_ALT_JCURVE
};
const ALT_CASHFLOW_BY_CLIENT = {
  marchetti: ALT_CASHFLOW,
  'al-khalid': AL_KHALID_ALT_CASHFLOW,
  whitmore: WHITMORE_ALT_CASHFLOW,
  monteiro: MONTEIRO_ALT_CASHFLOW,
  sato: SATO_ALT_CASHFLOW
};
const ALT_UNFUNDED_LADDER_BY_CLIENT = {
  marchetti: ALT_UNFUNDED_LADDER,
  'al-khalid': AL_KHALID_UNFUNDED_LADDER,
  whitmore: WHITMORE_UNFUNDED_LADDER,
  monteiro: MONTEIRO_UNFUNDED_LADDER,
  sato: SATO_UNFUNDED_LADDER
};

export {
  POSITIONS, ACCOUNTS, HOUSEHOLD, HOUSEHOLD_BRIEFING, STATEMENTS, INSIGHTS,
  INSIGHTS_BY_CLIENT, ALL_INSIGHTS,
  ALT_DEALS, ALT_CLOSED_DEALS, ALT_SUBSCRIPTIONS,
  ALT_THESES, ALT_STRATEGY_MIX, ALT_JCURVE, ALT_CASHFLOW, ALT_UNFUNDED_LADDER, HOUSEHOLD_CASHFLOW,
  POSITIONS_BY_CLIENT, ACCOUNTS_BY_CLIENT, HOUSEHOLD_BRIEFING_BY_CLIENT, HOUSEHOLD_CASHFLOW_BY_CLIENT,
  ALT_STRATEGY_MIX_BY_CLIENT, ALT_JCURVE_BY_CLIENT, ALT_CASHFLOW_BY_CLIENT, ALT_UNFUNDED_LADDER_BY_CLIENT,
  SP_RFQ, SP_QUOTES, SP_TEMPLATES, SP_BOOK, SP_CALENDAR,
  BOOK_SUMMARY, BOOK_AUM_BRIDGE, BOOK_FLOW_EVENTS, CLIENT_BOOK, DASHBOARD_TASKS, MARKET_CALENDAR,
};
