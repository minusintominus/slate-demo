<script>
  import { Button, Card, Kpi, KpiStrip, Page, PageHeader, Section, Tag } from '../../components/ui/index.js';
  import {
    ACCOUNTS_BY_CLIENT,
    CLIENT_BOOK,
    POSITIONS_BY_CLIENT
  } from '../../data/fixtures.js';
  import { money, pct } from '../../domain/format.js';
  import { goto } from '$app/navigation';

  let { symbol = '' } = $props();

  // Pull every position with this symbol across the book; clients with no
  // matching position are skipped. Each row carries the client + account
  // so the holdings table can show "who holds it where".
  const holdings = $derived.by(() => {
    const out = [];
    for (const c of CLIENT_BOOK) {
      const positions = POSITIONS_BY_CLIENT[c.id] || [];
      const accounts = ACCOUNTS_BY_CLIENT[c.id] || [];
      for (const p of positions) {
        if (p.symbol !== symbol) continue;
        out.push({
          ...p,
          clientId: c.id,
          clientName: c.name,
          account: accounts.find((a) => a.id === p.account) || { id: p.account, name: p.account, custodian: '—' }
        });
      }
    }
    return out;
  });

  // Canonical security info comes from the first matching holding.
  const security = $derived(holdings[0] || null);
  const totalMv = $derived(holdings.reduce((a, h) => a + (h.mv || 0), 0));
  const totalCost = $derived(holdings.reduce((a, h) => a + (h.cost || 0), 0));
  const totalQty = $derived(holdings.every((h) => h.qty != null)
    ? holdings.reduce((a, h) => a + (h.qty || 0), 0)
    : null);
  const unrealized = $derived(totalMv - totalCost);
  const unrealizedPct = $derived(totalCost ? (unrealized / totalCost) * 100 : 0);
  const avgPrice = $derived(security?.price ?? null);

  // 36-month deterministic price walk seeded by the symbol — same shape
  // as dev2's HoldingDetail spark.
  const monthlyPath = (start, drift, vol, seed) => {
    let v = start;
    const out = [v];
    for (let i = 0; i < 36; i++) {
      const r = (Math.sin(i * 1.7 + seed) + Math.cos(i * 0.6 + seed * 2)) * vol + drift;
      v *= 1 + r / 100;
      out.push(v);
    }
    return out;
  };
  const priceSeries = $derived(symbol ? monthlyPath(80, 1.4, 2.4, symbol.length) : []);
  const priceChart = $derived.by(() => {
    if (priceSeries.length === 0) return null;
    const w = 720, h = 200;
    const pad = { l: 8, r: 8, t: 14, b: 22 };
    const mn = Math.min(...priceSeries);
    const mx = Math.max(...priceSeries);
    const range = mx - mn || 1;
    const stepX = (w - pad.l - pad.r) / (priceSeries.length - 1);
    const yPx = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - mn) / range);
    const path = priceSeries
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${pad.l + i * stepX} ${yPx(p)}`)
      .join(' ');
    const gridlines = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: pad.t + (h - pad.t - pad.b) * t,
      isAxis: t === 1
    }));
    return { w, h, path, gridlines, axisLeft: pad.l, axisRight: w - pad.r };
  });

  // Synthetic tax lots for the largest position — used as a demo of the
  // lot-level detail a real custodian feed would provide.
  const lotsFor = (h) => {
    if (!h?.qty) return [];
    return [
      { date: '2018-04-12', qty: Math.round(h.qty * 0.4), basis: h.cost * 0.32, term: 'LT' },
      { date: '2020-09-22', qty: Math.round(h.qty * 0.3), basis: h.cost * 0.28, term: 'LT' },
      { date: '2022-11-08', qty: Math.round(h.qty * 0.2), basis: h.cost * 0.24, term: 'LT' },
      { date: '2024-03-04', qty: Math.round(h.qty * 0.1), basis: h.cost * 0.16, term: 'ST' }
    ];
  };
  const largestHolding = $derived([...holdings].sort((a, b) => b.mv - a.mv)[0]);
  const lots = $derived(lotsFor(largestHolding));

  const ASSET_LABELS = {
    us_equity: 'US Equity',
    intl_equity: 'International Equity',
    em_equity: 'EM Equity',
    fixed_income: 'Fixed Income',
    munis: 'Municipals',
    alts: 'Alternatives',
    alternative: 'Alternatives',
    structured: 'Structured Products',
    cash: 'Cash & MMF',
    private: 'Private Equity',
    hedge: 'Hedge Funds',
    real_assets: 'Real Assets'
  };
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) window.history.back();
    else goto('/workspace/clients');
  };
</script>

<Page>
  <Button variant="ghost" size="sm" class="mb-4" onclick={goBack}>← Back</Button>
  {#if security}
    <PageHeader>
      <div class="hero">
        <div class="hero-mark">{security.symbol.slice(0, 2)}</div>
        <div>
          <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{ASSET_LABELS[security.assetClass] || security.assetClass} · {security.sector}</div>
          <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] hero-name">{security.name}</h1>
          <div class="hero-meta">
            <span>{security.symbol}</span>
            {#if security.cusip && security.cusip !== '—'}<span>·</span><span>{security.cusip}</span>{/if}
            <span>·</span>
            <span>Held by {holdings.length} household{holdings.length === 1 ? '' : 's'}</span>
          </div>
          {#if security.flag}
            <div class="margin-note">
              <div class="margin-note-label">Flagged</div>
              <div>{security.flag}</div>
            </div>
          {/if}
        </div>
      </div>
      <div class="hero-mv">
        <div class="cf-label">Market Value (book-wide)</div>
        <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] hero-mv-num">{money(totalMv, { compact: true })}</div>
        <div class="text-ink3 text-xs">{holdings.length} position{holdings.length === 1 ? '' : 's'}</div>
      </div>
    </PageHeader>

    <KpiStrip>
      <Kpi label="Quantity" value={totalQty == null ? '—' : totalQty.toLocaleString('en-US')} />
      <Kpi label="Cost basis" value={money(totalCost, { compact: true })} />
      <Kpi label="Unrealized" value={money(unrealized, { compact: true })} sub={pct(unrealizedPct, { dp: 1 })} />
      <Kpi label="Avg cost / share" value={totalQty && totalCost ? '$' + (totalCost / totalQty).toFixed(2) : '—'} />
      {#if avgPrice != null}
        <Kpi label="Last price" value={avgPrice > 1000 ? avgPrice.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '$' + avgPrice.toFixed(2)} />
      {/if}
    </KpiStrip>

    <Section class="grid grid-cols-1 gap-3.5 lg:grid-cols-[3fr_2fr] lg:gap-6">
      <div>
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Price · 36 months</h2>
        <Card class="p-4 mt-3">
          {#if priceChart}
            <svg viewBox={`0 0 ${priceChart.w} ${priceChart.h}`} class="price-chart" preserveAspectRatio="none">
              {#each priceChart.gridlines as g}
                <line x1={priceChart.axisLeft} x2={priceChart.axisRight} y1={g.y} y2={g.y}
                  stroke="var(--rule)" stroke-width="1" stroke-dasharray={g.isAxis ? '0' : '2 4'} />
              {/each}
              <path d={priceChart.path} fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {/if}
        </Card>
      </div>
      <div>
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Tax lots</h2>
        <Card class="p-4 mt-3">
          {#if lots.length === 0}
            <p class="text-ink3 text-sm">Lot-level detail unavailable for this position type.</p>
          {:else}
            <div class="text-ink3 text-xs mb-3">Largest position — {largestHolding?.clientName} · {largestHolding?.account.name}</div>
            <table class="lots-table">
              <thead>
                <tr>
                  <th title="Acquisition date — when this lot was purchased.">Acq date</th>
                  <th>Qty</th>
                  <th class="num" title="Cost basis for this lot — what was paid.">Basis</th>
                  <th class="num" title="Unrealized gain/loss on this lot at current price.">Unreal</th>
                  <th title="LT (long-term, held >1 year, lower rate); ST (short-term, ≤1 year, ordinary income).">Term</th>
                </tr>
              </thead>
              <tbody>
                {#each lots as l (l.date)}
                  {@const lotMv = largestHolding?.qty ? (l.qty / largestHolding.qty) * largestHolding.mv : 0}
                  {@const lotUnreal = lotMv - l.basis}
                  <tr>
                    <td class="font-[var(--font-mono)] text-xs">{l.date}</td>
                    <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{l.qty.toLocaleString('en-US')}</td>
                    <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(l.basis, { compact: true })}</td>
                    <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]" class:text-pos={lotUnreal >= 0} class:text-neg={lotUnreal < 0}>{money(lotUnreal, { compact: true })}</td>
                    <td><span class="lot-term">{l.term}</span></td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </Card>
      </div>
    </Section>

    <Section>
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Held by</h2>
      <div class="text-ink3 text-xs mt-1">Where this security sits across the book.</div>
      <div class="held-table-wrap mt-3">
        <table class="held-table">
          <thead>
            <tr>
              <th>Household</th>
              <th>Account</th>
              <th>Custodian</th>
              <th class="num">Quantity</th>
              <th class="num">Market Value</th>
              <th class="num">Cost Basis</th>
              <th class="num">Unrealized</th>
            </tr>
          </thead>
          <tbody>
            {#each holdings as h (h.clientId + ':' + h.account.id)}
              {@const u = h.mv - h.cost}
              <tr class="held-row" onclick={() => goto(`/workspace/clients/${h.clientId}/portfolio?tab=holdings`)}>
                <td class="font-semibold">{h.clientName}</td>
                <td>{h.account.name}</td>
                <td class="text-ink3 text-xs">{h.account.custodian}</td>
                <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{h.qty == null ? '—' : h.qty.toLocaleString('en-US')}</td>
                <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(h.mv, { compact: true })}</td>
                <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(h.cost, { compact: true })}</td>
                <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]" class:text-pos={u >= 0} class:text-neg={u < 0}>{money(u, { compact: true })}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Section>
  {:else}
    <PageHeader>
      <div>
        <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">Asset</div>
        <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">{symbol || 'Unknown'} not found</h1>
        <p class="text-ink2 mt-2">No household in the book holds this security.</p>
      </div>
    </PageHeader>
  {/if}
</Page>

<style>
  .cf-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }

  .hero {
    display: flex;
    gap: 18px;
    align-items: flex-start;
  }
  .hero-mark {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    border-radius: var(--r-md);
    background: color-mix(in oklch, var(--accent) 14%, var(--surface));
    color: var(--accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    letter-spacing: -0.02em;
  }
  .hero-name {
    font-size: 36px;
    font-weight: 600;
    margin-top: 2px;
    letter-spacing: -0.02em;
  }
  .hero-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    color: var(--ink-3);
    font-size: 12.5px;
    margin-top: 8px;
  }
  .hero-mv {
    text-align: right;
  }
  .hero-mv-num {
    font-size: 36px;
    margin-top: 2px;
    line-height: 1.1;
  }
  .margin-note {
    border-left: 2px solid var(--warn);
    background: linear-gradient(to right, var(--warn-soft), transparent 60%);
    padding: 8px 14px;
    margin-top: 12px;
    border-radius: 0 var(--r-md) var(--r-md) 0;
    font-size: 13px;
  }
  .margin-note-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--warn);
    margin-bottom: 2px;
  }

  .price-chart {
    display: block;
    width: 100%;
    height: 200px;
  }

  .lots-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .lots-table thead th {
    text-align: left;
    padding: 8px 10px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-3);
    font-weight: 500;
    border-bottom: 1px solid var(--rule-2);
  }
  .lots-table thead th.num { text-align: right; }
  .lots-table tbody td {
    padding: 10px;
    border-bottom: 1px dashed var(--rule-2);
    vertical-align: middle;
  }
  .lots-table tbody td.num { text-align: right; }
  .lots-table tbody tr:last-child td { border-bottom: 0; }
  .lot-term {
    display: inline-flex;
    align-items: center;
    padding: 1px 6px;
    background: var(--surface-2);
    color: var(--ink-2);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-sm);
    font-size: 10.5px;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
  }

  .held-table-wrap {
    overflow-x: auto;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
  }
  .held-table {
    width: 100%;
    min-width: 760px;
    border-collapse: collapse;
    font-size: 13px;
  }
  .held-table thead th {
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
  .held-table thead th.num { text-align: right; }
  .held-table tbody td {
    padding: 12px;
    border-bottom: 1px solid var(--rule-2);
    vertical-align: middle;
  }
  .held-table tbody td.num { text-align: right; }
  .held-table tbody tr.held-row {
    cursor: pointer;
  }
  .held-table tbody tr.held-row:hover td {
    background: var(--surface-2);
  }
  .held-table tbody tr:last-child td {
    border-bottom: 0;
  }
</style>
