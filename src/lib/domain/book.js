import {
  ACCOUNTS, ACCOUNTS_BY_CLIENT,
  ALT_CASHFLOW, ALT_CASHFLOW_BY_CLIENT,
  ALT_JCURVE, ALT_JCURVE_BY_CLIENT,
  ALT_STRATEGY_MIX, ALT_STRATEGY_MIX_BY_CLIENT,
  ALT_UNFUNDED_LADDER, ALT_UNFUNDED_LADDER_BY_CLIENT,
  CLIENT_BOOK,
  HOUSEHOLD_BRIEFING, HOUSEHOLD_BRIEFING_BY_CLIENT,
  HOUSEHOLD_CASHFLOW, HOUSEHOLD_CASHFLOW_BY_CLIENT,
  POSITIONS, POSITIONS_BY_CLIENT
} from '../data/fixtures.js';
import { loadClients, getClient } from '../data/client-store.js';
import { sum } from './format.js';

// Per-client resolvers — fall back to Marchetti's data when unknown.
export const positionsFor = (clientId) => POSITIONS_BY_CLIENT[clientId] || POSITIONS;
export const accountsFor = (clientId) => ACCOUNTS_BY_CLIENT[clientId] || ACCOUNTS;
export const briefingFor = (clientId) => HOUSEHOLD_BRIEFING_BY_CLIENT[clientId] || HOUSEHOLD_BRIEFING;
export const householdCashflowFor = (clientId) => HOUSEHOLD_CASHFLOW_BY_CLIENT[clientId] || HOUSEHOLD_CASHFLOW;
export const altStrategyMixFor = (clientId) => ALT_STRATEGY_MIX_BY_CLIENT[clientId] || ALT_STRATEGY_MIX;
export const altJCurveFor = (clientId) => ALT_JCURVE_BY_CLIENT[clientId] || ALT_JCURVE;
export const altCashflowFor = (clientId) => ALT_CASHFLOW_BY_CLIENT[clientId] || ALT_CASHFLOW;
export const altUnfundedLadderFor = (clientId) => ALT_UNFUNDED_LADDER_BY_CLIENT[clientId] || ALT_UNFUNDED_LADDER;

export const workspaceTabs = [
  { id: 'portfolio', label: 'Aggregated portfolio' },
  { id: 'insights', label: 'Insights' },
  { id: 'events', label: 'Upcoming events' },
  { id: 'documents', label: 'Documents' },
  { id: 'status', label: 'Overall status' },
  { id: 'refresh', label: 'Refresh data' }
];

export const parseClientRoute = (route = '') => {
  const clean = route.split('?')[0];
  const parts = clean.split('/');
  if (parts[0] !== 'clients') return null;
  if (parts.length === 1) return { kind: 'list' };
  const clientId = parts[1];
  if (!clientId) return { kind: 'list' };
  if (parts[2] === 'holding') return { kind: 'holding', clientId, symbol: decodeURIComponent(parts[3] || '') };
  if (parts[2] === 'insights' && parts[3]) return { kind: 'insightDetail', clientId, insightId: parts[3] };
  return { kind: 'workspace', clientId, tab: parts[2] || 'portfolio' };
};

export const clientAum = (row) => {
  if (!row) return 0;
  if (row.isCustom) {
    if (!row.portfolioIngested) return 0;
    if (row.displayAum != null) return row.displayAum;
    return sum(POSITIONS, (p) => p.mv);
  }
  if (row.demoFull) return sum(POSITIONS, (p) => p.mv);
  return row.aum || 0;
};

export const clientAumSplit = (row) => {
  const total = clientAum(row);
  const frac = row?.aumAdvisoryFrac != null ? row.aumAdvisoryFrac : 1;
  return { advisory: total * frac, nonAdvisory: total * (1 - frac) };
};

export const getMergedClientBook = () => [...loadClients(), ...CLIENT_BOOK];

export const resolveClient = (clientId) => getClient(clientId) || CLIENT_BOOK.find((row) => row.id === clientId) || null;

export const healthScore = (row) => {
  if (!row) return 0;
  let score = 88;
  if ((row.reviewInDays ?? 90) < 0) score -= 18;
  else if ((row.reviewInDays ?? 90) <= 14) score -= 9;
  if (row.driftTone === 'warn') score -= 10;
  if (row.driftTone === 'neg') score -= 16;
  if ((row.ytdAdvisoryPct ?? row.ytdPct ?? 0) < -0.01) score -= 8;
  if (row.familyType === 'FO') score += 2;
  return Math.max(52, Math.min(96, score));
};

export const healthTone = (score) => {
  if (score >= 85) return 'pos';
  if (score >= 72) return 'warn';
  return 'neg';
};

export const feeLines = (row) => {
  if (!row) return { advisory: 0, nonAdvisory: 0 };
  const split = clientAumSplit(row);
  return {
    advisory: split.advisory * ((row.feeBpsAdvisory ?? row.feeBps ?? 54) / 10000),
    nonAdvisory: split.nonAdvisory * ((row.feeBpsNonAdvisory ?? 12) / 10000)
  };
};
