export const money = (n, opts = {}) => {
  if (n == null || Number.isNaN(Number(n))) return '-';
  const abs = Math.abs(Number(n));
  const sign = Number(n) < 0 ? '-' : '';
  if (opts.compact && abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(opts.dp ?? 2)}B`;
  if (opts.compact && abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(opts.dp ?? 2)}M`;
  if (opts.compact && abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(opts.dp ?? 1)}k`;
  return `${Number(n) < 0 ? '-$' : '$'}${abs.toLocaleString('en-US', {
    maximumFractionDigits: opts.dp ?? 0,
    minimumFractionDigits: opts.dp ?? 0
  })}`;
};

export const signedMoney = (n, opts = {}) => {
  if (!n) return money(0, opts);
  return `${n > 0 ? '+' : ''}${money(n, opts)}`;
};

export const pct = (n, opts = {}) => {
  if (n == null || Number.isNaN(Number(n))) return '-';
  return `${Number(n) > 0 ? '+' : ''}${Number(n).toFixed(opts.dp ?? 2)}%`;
};

export const num = (n, opts = {}) => {
  if (n == null || Number.isNaN(Number(n))) return '-';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: opts.dp ?? 0 });
};

export const dateShort = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const dateLong = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export const daysFrom = (d, base = '2026-05-08') => {
  const ms = new Date(d).getTime() - new Date(base).getTime();
  return Math.round(ms / 86400000);
};

export const titleCase = (value = '') =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

export const sum = (rows, pick) => rows.reduce((total, row) => total + pick(row), 0);

