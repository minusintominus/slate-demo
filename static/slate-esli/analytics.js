// Slate — analytics helpers (mirrors src/lib/analytics.ts in handoff)
(function () {

const { POSITIONS, ACCOUNTS, HOUSEHOLD, INSIGHTS } = window.Slate;

const sum = (arr, f = x => x) => arr.reduce((a, b) => a + f(b), 0);

// Global filter — accountIds: null means all
const filtered = (accountIds) => {
  if (!accountIds || accountIds.length === 0) return POSITIONS;
  return POSITIONS.filter(p => accountIds.includes(p.account));
};

const totals = (accountIds) => {
  const ps = filtered(accountIds);
  const mv = sum(ps, p => p.mv);
  const cost = sum(ps, p => p.cost);
  return { mv, cost, unreal: mv - cost, unrealPct: cost ? ((mv - cost) / cost) * 100 : 0 };
};

const allocation = (accountIds) => {
  const ps = filtered(accountIds);
  const total = sum(ps, p => p.mv) || 1;
  const map = {};
  for (const p of ps) map[p.assetClass] = (map[p.assetClass] || 0) + p.mv;
  const out = Object.entries(map).map(([k, v]) => ({
    key: k, mv: v, pct: (v / total) * 100, target: HOUSEHOLD.ipsTargets[k] || 0,
  }));
  return out.sort((a, b) => b.mv - a.mv);
};

const sectorBreakdown = (accountIds) => {
  const ps = filtered(accountIds);
  const eq = ps.filter(p => p.assetClass === 'us_equity' || p.assetClass === 'intl_equity');
  const total = sum(eq, p => p.mv) || 1;
  const map = {};
  for (const p of eq) map[p.sector] = (map[p.sector] || 0) + p.mv;
  return Object.entries(map).map(([k, v]) => ({ sector:k, mv:v, pct:(v/total)*100 }))
    .sort((a, b) => b.mv - a.mv);
};

const accountTotals = () => ACCOUNTS.map(a => {
  const ps = POSITIONS.filter(p => p.account === a.id);
  const mv = sum(ps, p => p.mv);
  const cost = sum(ps, p => p.cost);
  return { ...a, positions: ps.length, mv, cost, unreal: mv - cost };
});

const concentrations = (accountIds) => {
  const ps = filtered(accountIds);
  const total = sum(ps, p => p.mv) || 1;
  return ps
    .filter(p => p.assetClass !== 'cash')
    .map(p => ({ ...p, pctNW: (p.mv / total) * 100 }))
    .sort((a, b) => b.pctNW - a.pctNW)
    .slice(0, 10);
};

const ASSET_LABELS = {
  us_equity: 'US Equity',
  intl_equity: 'Intl Equity',
  fixed_income: 'Fixed Income',
  alternative: 'Alternatives',
  cash: 'Cash & Eq.',
  commodity: 'Commodity',
};

window.Slate.analytics = { totals, allocation, sectorBreakdown, accountTotals, concentrations, filtered, ASSET_LABELS, sum };

})();
