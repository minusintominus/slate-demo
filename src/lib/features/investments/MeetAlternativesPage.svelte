<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Bar, Card, DataTable, Divider, Kpi, KpiStrip, Page, PageHeader, Section, Tabs, Tag } from '../../components/ui/index.js';
  import { ALT_CLOSED_DEALS, ALT_DEALS, ALT_SUBSCRIPTIONS, HOUSEHOLD } from '../../data/fixtures.js';
  import {
    altCashflowFor,
    altJCurveFor,
    altStrategyMixFor,
    altUnfundedLadderFor,
    positionsFor
  } from '../../domain/book.js';
  import { money } from '../../domain/format.js';
  import AltsDealFlow from './AltsDealFlow.svelte';

  let { client = null } = $props();
  const householdName = $derived(client?.name || HOUSEHOLD.name);
  const householdId = $derived(client?.id || HOUSEHOLD.id);

  // Meet mode scopes Book to this household only — other clients' commitments
  // stay hidden (matches search/topbar confidentiality pattern).
  const subs = $derived(ALT_SUBSCRIPTIONS.filter((s) => s.clientId === householdId));
  const tabs = $derived([
    ['deals', `Deal flow (${ALT_DEALS.length})`],
    ['closed', `Closed (${ALT_CLOSED_DEALS.length})`],
    ['book', `Book (${subs.length})`],
    ['strategy', 'Strategy mix'],
    ['holdings', 'Holdings'],
    ['pacing', 'Pacing plan'],
    ['cashflow', 'Cashflow plan']
  ]);
  // Tab is URL-driven via ?tab=… so refreshes / share-links preserve it.
  const tab = $derived.by(() => {
    const q = page.url.searchParams.get('tab');
    return q && tabs.some(([id]) => id === q) ? q : 'deals';
  });
  const onSelectTab = (id) => {
    const url = new URL(page.url);
    if (id === 'deals') url.searchParams.delete('tab');
    else url.searchParams.set('tab', id);
    goto(url.pathname + url.search, { replaceState: false, keepFocus: true });
  };

  const positions = $derived(positionsFor(householdId));
  const strategyMix = $derived(altStrategyMixFor(householdId));
  const jcurve = $derived(altJCurveFor(householdId));
  const altCashflow = $derived(altCashflowFor(householdId));
  const unfundedLadder = $derived(altUnfundedLadderFor(householdId));
  const alts = $derived(positions.filter((p) => p.assetClass === 'alts' || p.assetClass === 'alternative'));
  const totalAlts = $derived(alts.reduce((total, p) => total + p.mv, 0));
  const totalUnfunded = $derived(unfundedLadder.reduce((total, row) => total + row.amount, 0));
  const totalCommitted = $derived(subs.reduce((a, s) => a + s.commitment, 0));
  const sortedSubs = $derived([...subs].sort((a, b) => (a.committedDate < b.committedDate ? 1 : -1)));
  const sortedClosed = [...ALT_CLOSED_DEALS].sort((a, b) => (a.closedDate < b.closedDate ? 1 : -1));

  // Holdings KPIs derived from the latest J-curve point for this client.
  const sleeveStats = $derived.by(() => {
    if (!jcurve.length) return null;
    const last = jcurve[jcurve.length - 1];
    const called = last.called || 0;
    const dist = last.distributed || 0;
    const nav = last.nav || 0;
    const dpi = called ? dist / called : 0;
    const rvpi = called ? nav / called : 0;
    const tvpi = called ? (dist + nav) / called : 0;
    return { called, distributed: dist, nav, dpi, rvpi, tvpi };
  });
  // IRR — rough demo value tied to TVPI (cohorts mature faster when TVPI is high).
  const sleeveIrr = $derived(sleeveStats ? Math.max(8, Math.min(22, (sleeveStats.tvpi - 1) * 35 + 7)) : null);
  const sleeveCommitment = $derived(totalCommitted + (sleeveStats?.called || 0));

  // Strategy mix totals — sum committed market value across sub-strategies for
  // the "Alts sleeve · committed" headline on the strategy tab.
  const strategyMvTotal = $derived(strategyMix.reduce((a, s) => a + (s.mvActual || 0), 0));
  // Vintage diversification — bucket existing (jcurve start) and planned (subs).
  const vintageBuckets = $derived.by(() => {
    const buckets = new Map();
    if (jcurve.length) {
      // J-curve starts at the inception year; bucket "existing" by approx vintage.
      const startQ = jcurve[0]?.q || '';
      const yr = parseInt(startQ.slice(0, 4), 10);
      if (Number.isFinite(yr)) {
        buckets.set(yr, { y: yr, mv: (sleeveStats?.called || 0), kind: 'existing' });
      }
    }
    for (const s of subs) {
      const yr = parseInt((s.committedDate || '').slice(0, 4), 10);
      if (!Number.isFinite(yr)) continue;
      const prev = buckets.get(yr);
      buckets.set(yr, { y: yr, mv: (prev?.mv || 0) + s.commitment, kind: prev?.kind === 'existing' ? 'existing' : 'planned' });
    }
    return [...buckets.values()].sort((a, b) => a.y - b.y);
  });
  const vintageMax = $derived(vintageBuckets.reduce((m, v) => Math.max(m, v.mv), 1));

  // Pacing plan rows — subscriptions become an 18-month deployment schedule.
  const pacingRows = $derived(
    sortedSubs.map((s) => ({
      q: 'Q' + (Math.ceil((parseInt((s.committedDate || '').slice(5, 7), 10) || 1) / 3)) + ' ' + (s.committedDate || '').slice(0, 4),
      commit: s.commitment,
      deal: s.dealName,
      strategy: s.strategy.split(' · ')[0],
      pace: s.status.startsWith('Funded') ? 'On track' : 'Committed'
    }))
  );

  // Cashflow tab — totals + ladder math.
  const totalCalledNow = $derived(sleeveStats?.called || 0);
  const ladderTotal = $derived(unfundedLadder.reduce((a, r) => a + r.amount, 0));
  const ladderWeightedYield = $derived(
    ladderTotal ? unfundedLadder.reduce((a, r) => a + r.amount * r.yield, 0) / ladderTotal : 0
  );
  const ladderIncome = $derived(ladderTotal * ladderWeightedYield / 100);
  const MMF_BLENDED = 4.5;
  const mmfIncome = $derived(ladderTotal * MMF_BLENDED / 100);
  const incomeLift = $derived(ladderIncome - mmfIncome);

  // J-curve chart geometry — same shape as dev2's Charts.JCurve.
  const jcurveChart = $derived.by(() => {
    if (!jcurve.length) return null;
    const w = 600, h = 200, pad = { l: 8, r: 8, t: 14, b: 24 };
    const tv = jcurve.map((d) => (d.nav || 0) + (d.distributed || 0));
    const callOut = jcurve.map((d) => -(d.called || 0));
    const all = [...tv, ...callOut, 0];
    const mn = Math.min(...all), mx = Math.max(...all);
    const range = mx - mn || 1;
    const stepX = (w - pad.l - pad.r) / (jcurve.length - 1);
    const yPx = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - mn) / range);
    const lineFor = (arr) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad.l + i * stepX} ${yPx(v)}`).join(' ');
    const callPath = lineFor(callOut);
    const callFill = `${callPath} L ${pad.l + (jcurve.length - 1) * stepX} ${yPx(0)} L ${pad.l} ${yPx(0)} Z`;
    const tvPath = lineFor(tv);
    const labels = [0, Math.floor(jcurve.length / 2), jcurve.length - 1].map((i) => ({
      x: pad.l + i * stepX,
      anchor: i === 0 ? 'start' : i === jcurve.length - 1 ? 'end' : 'middle',
      q: jcurve[i].q
    }));
    return { w, h, zeroY: yPx(0), padL: pad.l, padR: w - pad.r, callPath, callFill, tvPath, labels };
  });

  // Cashflow bars chart geometry.
  const cashflowBars = $derived.by(() => {
    if (!altCashflow.length) return null;
    const w = 720, h = 220, pad = { l: 50, r: 8, t: 14, b: 28 };
    const allValues = altCashflow.flatMap((d) => [d.calls, d.dist]).filter((v) => v !== 0);
    const maxAbs = Math.max(...allValues.map(Math.abs), 1);
    const yScale = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v + maxAbs) / (2 * maxAbs));
    const stepX = (w - pad.l - pad.r) / altCashflow.length;
    const barW = stepX * 0.55;
    const zeroY = yScale(0);
    const gridlines = [-1, -0.5, 0, 0.5, 1].map((t) => ({
      y: yScale(t * maxAbs),
      label: t === 0 ? null : (t >= 0 ? '+' : '') + (t * maxAbs / 1e6).toFixed(1) + 'M',
      isZero: t === 0
    }));
    const bars = [];
    altCashflow.forEach((d, i) => {
      const cx = pad.l + (i + 0.5) * stepX;
      if (d.calls < 0) bars.push({ x: cx - barW / 2, y: zeroY, w: barW, h: Math.abs(yScale(d.calls) - zeroY), fill: 'var(--neg)' });
      if (d.dist > 0) bars.push({ x: cx - barW / 2, y: yScale(d.dist), w: barW, h: Math.abs(zeroY - yScale(d.dist)), fill: 'var(--pos)' });
    });
    const qLabels = altCashflow.map((d, i) => ({ x: pad.l + (i + 0.5) * stepX, q: d.q }));
    return { w, h, zeroY, axisLeft: pad.l, axisRight: w - pad.r, axisBottom: h - 12, gridlines, bars, qLabels };
  });

  const LADDER_COLORS = ['var(--ink)', 'var(--ink-2)', 'var(--ink-3)', 'var(--ink-4)'];
  // Capital call schedule — show next 4 quarters from altCashflow as a peek.
  const callSchedule = $derived(altCashflow.slice(0, 4).map((c) => ({
    q: c.q,
    amount: c.calls < 0 ? c.calls : c.dist > 0 ? c.dist : 0,
    note: c.notes
  })));
</script>

<Page>
  <PageHeader>
    <div>
      <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{householdName} · alts sleeve</div>
      <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Alternative Investments</h1>
      <p class="text-ink2 mt-2 max-w-[680px]">Curated deal flow alongside strategy posture, current holdings, capital deployment plan, and cashflow shape for the household's private-markets sleeve.</p>
    </div>
    <Tag tone="accent">Alts target 13%</Tag>
  </PageHeader>

  <Tabs {tabs} selected={tab} onSelect={onSelectTab} />

  {#if tab === 'deals'}
    <AltsDealFlow />
  {:else if tab === 'closed'}
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6">
      {#each sortedClosed as deal (deal.id)}
        <Card class="p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{deal.sponsor}</div>
              <h3 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-1 text-2xl">{deal.name}</h3>
              <div class="text-ink3 text-xs">{deal.strategy} · vintage {deal.vintage}</div>
            </div>
            <Tag tone="default">Closed {deal.closedDate}</Tag>
          </div>
          <p class="text-ink2 mt-4 text-sm border-l-2 border-[var(--rule-2)] pl-3.5 py-1">{deal.outcome}</p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-5">
            <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Final raise</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{deal.finalRaise}</div></div>
            <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Target IRR</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{deal.target}</div></div>
            <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Term</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{deal.term}</div></div>
            <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">DPI to date</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-pos">{deal.dpi}</div></div>
          </div>
        </Card>
      {/each}
    </Section>
  {:else if tab === 'book'}
    {#if sortedSubs.length === 0}
      <Card class="p-12 text-center">
        <div class="font-[var(--font-display)] text-xl">No alts subscriptions on record</div>
        <p class="text-ink2 mt-2">{householdName} has not committed to any deals from the curated flow.</p>
      </Card>
    {:else}
      <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6">
        <Card class="p-6">
          <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Total committed</div>
          <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] mt-1 text-4xl">{money(totalCommitted, { compact: true })}</div>
          <p class="text-ink2 mt-3">Across {sortedSubs.length} active subscription{sortedSubs.length === 1 ? '' : 's'} in the household's alts sleeve.</p>
        </Card>
        <Card class="p-6">
          <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Sponsors</div>
          <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] mt-1 text-4xl">{new Set(sortedSubs.map((s) => s.sponsor)).size}</div>
          <p class="text-ink2 mt-3">Diversification across GP relationships in the curated alts program.</p>
        </Card>
      </Section>
      <Section>
        <DataTable class="mt-3">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Strategy</th>
              <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Commitment</th>
              <th>Committed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each sortedSubs as sub (sub.id)}
              <tr>
                <td>
                  <div>{sub.dealName}</div>
                  <div class="text-ink3 text-xs">{sub.sponsor}</div>
                </td>
                <td class="text-ink3 text-xs">{sub.strategy}</td>
                <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{money(sub.commitment, { compact: true })}</td>
                <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-xs">{sub.committedDate}</td>
                <td><Tag tone={sub.status.startsWith('Funded') ? 'pos' : 'default'}>{sub.status}</Tag></td>
              </tr>
            {/each}
          </tbody>
        </DataTable>
      </Section>
    {/if}
  {:else if tab === 'strategy'}
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6">
      <Card class="p-7">
        <h3 class="alts-card-title">Sub-strategy targets</h3>
        <div class="text-ink3 text-xs mt-1">Within the alts sleeve. Bar = actual; tick = IPS sub-target.</div>
        <div class="flex flex-col gap-4 mt-4">
          {#each strategyMix as s (s.key || s.label)}
            <div>
              <div class="row-between baseline">
                <span class="text-sm">{s.label}</span>
                <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-sm">
                  {s.actual.toFixed(0)}% <span class="text-ink3 text-xs ml-1">tgt {s.target}%</span>
                </span>
              </div>
              <Bar class="mt-2"
                value={Math.min(100, s.actual)}
                target={s.target}
                tone={Math.abs(s.actual - s.target) > 15 ? 'neg' : 'default'} />
              {#if s.mvActual}
                <div class="text-ink3 text-xs mt-2">{money(s.mvActual, { compact: true })} committed</div>
              {/if}
            </div>
          {/each}
        </div>
      </Card>

      <div class="flex flex-col gap-5">
        <Card class="p-6">
          <div class="alts-eyebrow">Alts sleeve · committed</div>
          <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-big">{money(strategyMvTotal || totalAlts, { compact: true })}</div>
          <div class="text-ink3 text-xs mt-1">{strategyMix.length} sub-strategies in scope</div>
          <Divider dashed class="my-4" />
          <div class="alts-note">
            <div class="alts-note-label">Concentration risk</div>
            <div class="text-sm mt-1">
              {#if strategyMix.length === 1 || strategyMix.some((s) => s.actual >= 50)}
                Sleeve is concentrated in a single sub-strategy. The pacing plan diversifies sponsor, vintage, and strategy — see Pacing plan tab.
              {:else}
                Sleeve is diversified across sub-strategies. Pacing plan continues to balance vintage exposure — see Pacing plan tab.
              {/if}
            </div>
          </div>
        </Card>

        {#if vintageBuckets.length > 0}
          <Card class="p-6">
            <h3 class="alts-card-title-sm">Vintage diversification</h3>
            <div class="text-ink3 text-xs mt-1">Commitments by vintage year (existing + planned).</div>
            <div class="row gap-4 mt-2 vintage-legend">
              <span class="row gap-2 items-center"><span class="vintage-swatch" style="background:var(--ink)"></span> existing commitment</span>
              <span class="row gap-2 items-center"><span class="vintage-swatch" style="background:var(--ink-3)"></span> planned (pacing plan)</span>
            </div>
            <div class="flex flex-col gap-2 mt-4">
              {#each vintageBuckets as v (v.y)}
                <div class="row items-center gap-2 text-sm">
                  <span class="font-[var(--font-mono)] vintage-year">{v.y}</span>
                  <div class="vintage-bar">
                    <div class="vintage-fill" style:width={`${(v.mv / vintageMax) * 100}%`} style:background={v.kind === 'existing' ? 'var(--ink)' : 'var(--ink-3)'}></div>
                  </div>
                  <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] vintage-amt">{money(v.mv, { compact: true })}</span>
                  <span class="alts-tag">{v.kind}</span>
                </div>
              {/each}
            </div>
          </Card>
        {/if}
      </div>
    </Section>

  {:else if tab === 'holdings'}
    <Card class="p-7">
      <div class="row-between">
        <div>
          <h3 class="alts-card-title">{householdName} · alts sleeve</h3>
          <div class="text-ink3 text-xs">{strategyMix.length} sub-strategies · {jcurve.length ? `${jcurve[0].q} → ${jcurve[jcurve.length - 1].q}` : 'no inception'}</div>
        </div>
        <span class="alts-tag pos">Active · in distribution</span>
      </div>

      {#if sleeveStats}
        <div class="grid grid-cols-2 gap-2 md:grid-cols-3 mt-4">
          <div class="alts-stat" title="Total amount pledged across the sleeve. Drawn over time via capital calls.">
            <div class="alts-eyebrow">Commitment</div>
            <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-stat-num">{money(sleeveCommitment, { compact: true })}</div>
          </div>
          <div class="alts-stat" title="Capital actually wired so far. Remainder drawn over the pacing plan window.">
            <div class="alts-eyebrow">Called</div>
            <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-stat-num">{money(sleeveStats.called, { compact: true })}</div>
            <div class="text-ink3 text-xs">{sleeveCommitment ? Math.round((sleeveStats.called / sleeveCommitment) * 100) : 0}%</div>
          </div>
          <div class="alts-stat" title="Distributions to Paid-In. Cash returned ÷ cash contributed.">
            <div class="alts-eyebrow">Distributions (DPI)</div>
            <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-stat-num">{money(sleeveStats.distributed, { compact: true })}</div>
            <div class="text-ink3 text-xs">{sleeveStats.dpi.toFixed(2)}×</div>
          </div>
          <div class="alts-stat" title="Residual Value to Paid-In. Current fund value ÷ cash contributed.">
            <div class="alts-eyebrow">NAV (RVPI)</div>
            <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-stat-num">{money(sleeveStats.nav, { compact: true })}</div>
            <div class="text-ink3 text-xs">{sleeveStats.rvpi.toFixed(2)}×</div>
          </div>
          <div class="alts-stat" title="Total Value to Paid-In = DPI + RVPI. Realized + unrealized return multiple.">
            <div class="alts-eyebrow">Total value (TVPI)</div>
            <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-stat-num text-pos">{money(sleeveStats.distributed + sleeveStats.nav, { compact: true })}</div>
            <div class="text-pos text-xs">{sleeveStats.tvpi.toFixed(2)}×</div>
          </div>
          <div class="alts-stat" title="Internal rate of return — annualized return accounting for the timing of every cashflow, net of fees.">
            <div class="alts-eyebrow">Net IRR</div>
            <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-stat-num text-pos">{sleeveIrr ? sleeveIrr.toFixed(1) : '—'}%</div>
          </div>
        </div>
      {/if}

      <Divider dashed class="my-6" />
      <h4 class="alts-card-title-sm">J-curve · cumulative cashflows</h4>
      <div class="text-ink3 text-xs mt-1">Cumulative dollars in vs. out since inception. Quarter labels along the x-axis.</div>
      {#if jcurveChart}
        <svg viewBox={`0 0 ${jcurveChart.w} ${jcurveChart.h}`} class="alts-chart" preserveAspectRatio="none">
          <line x1={jcurveChart.padL} x2={jcurveChart.padR} y1={jcurveChart.zeroY} y2={jcurveChart.zeroY} stroke="var(--rule)" stroke-width="1" />
          <path d={jcurveChart.callFill} fill="var(--neg-soft)" opacity="0.7" />
          <path d={jcurveChart.callPath} fill="none" stroke="var(--neg)" stroke-width="1.4" stroke-dasharray="3 3" />
          <path d={jcurveChart.tvPath} fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          {#each jcurveChart.labels as l (l.x)}
            <text x={l.x} y={jcurveChart.h - 6} font-family="var(--font-mono)" font-size="9" fill="var(--ink-3)" text-anchor={l.anchor}>{l.q}</text>
          {/each}
        </svg>
      {/if}
      <div class="row gap-4 mt-3 alts-legend">
        <span class="row gap-2 items-center"><span class="vintage-swatch" style="background:var(--ink)"></span>Total value · NAV + distributions (upside)</span>
        <span class="row gap-2 items-center"><span class="dash-swatch"></span>Capital called · cumulative, plotted negative</span>
      </div>

      <Divider dashed class="my-6" />
      <h4 class="alts-card-title-sm">Capital call schedule (projected)</h4>
      <div class="flex flex-col gap-2 mt-3">
        {#each callSchedule as c (c.q)}
          <div class="row-between border-b border-dashed border-[var(--rule-2)] pb-2 text-sm">
            <span class="font-[var(--font-mono)] text-xs alts-call-q">{c.q}</span>
            <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-call-amt" class:text-neg={c.amount < 0} class:text-pos={c.amount > 0}>
              {c.amount === 0 ? '$0' : (c.amount > 0 ? '+' : '') + money(c.amount, { compact: true })}
            </span>
            <span class="text-ink3 text-xs alts-call-note">{c.note}</span>
          </div>
        {/each}
      </div>
    </Card>

  {:else if tab === 'pacing'}
    <Card class="p-6">
      <div class="row-between gap-4">
        <div>
          <h3 class="alts-card-title">Capital deployment plan · 18 months</h3>
          <div class="text-ink3 text-xs mt-1">Bring the alts sleeve toward IPS target while diversifying sponsor, vintage, and strategy.</div>
        </div>
        <div class="text-right">
          <div class="alts-eyebrow">Total committed</div>
          <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-num-lg">{money(totalCommitted, { compact: true })}</div>
        </div>
      </div>

      <div class="row gap-4 mt-3 alts-legend">
        <span class="row gap-2 items-center"><span class="dot pos"></span>On track · committed</span>
        <span class="row gap-2 items-center"><span class="dot warn"></span>Discussion · not yet committed</span>
      </div>

      {#if pacingRows.length > 0}
        <div class="pacing-timeline">
          <div class="pacing-rail"></div>
          {#each pacingRows as p, i (p.q + p.deal)}
            <div class="pacing-stop" style:left={`${((i + 0.5) / pacingRows.length) * 100}%`}>
              <div class={`pacing-dot ${p.pace === 'On track' ? 'pos' : 'warn'}`}></div>
              <div class="font-[var(--font-mono)] text-xs mt-1">{p.q}</div>
              <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-xs">{money(p.commit, { compact: true })}</div>
            </div>
          {/each}
        </div>

        <Divider dashed class="my-4" />

        <div class="flex flex-col gap-3">
          {#each pacingRows as p (p.q + p.deal)}
            <div class="pacing-row">
              <span class="font-[var(--font-mono)] text-sm pacing-q">{p.q}</span>
              <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] pacing-amt">{money(p.commit, { compact: true })}</span>
              <span class="pacing-deal">{p.deal}</span>
              <span class="alts-tag">{p.strategy}</span>
              <span class={`alts-tag ${p.pace === 'On track' ? 'pos' : 'warn'}`}>{p.pace}</span>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-ink3 text-sm mt-4">No subscriptions in flight for this household. Browse Deal flow to add one.</div>
      {/if}
    </Card>

  {:else}
    <KpiStrip>
      <Kpi label="Total committed" value={money(sleeveCommitment, { compact: true })} sub={`existing ${money(totalCalledNow, { compact: true })} + pacing ${money(totalCommitted, { compact: true })}`} />
      <Kpi label="Already called" value={money(totalCalledNow, { compact: true })} />
      <Kpi label="Unfunded commitment" value={money(ladderTotal, { compact: true })} sub="drawn over pacing window" />
    </KpiStrip>
    <div class="text-ink3 text-xs mt-3">
      This tab focuses on the alts treasury workflow — call/distribution rhythm and the unfunded commitment ladder. For full household income vs. outflows across all sources, see Portfolio → Cashflow.
    </div>

    <Section>
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Capital calls vs. distributions</h2>
      <div class="text-ink3 text-xs mt-1">Drives how much liquidity is needed when. Bars below the line are wires out; bars above are cash coming in.</div>
      <Card class="p-4 mt-3">
        {#if cashflowBars}
          <svg viewBox={`0 0 ${cashflowBars.w} ${cashflowBars.h}`} class="alts-chart" preserveAspectRatio="none">
            {#each cashflowBars.gridlines as g}
              <line x1={cashflowBars.axisLeft} x2={cashflowBars.axisRight} y1={g.y} y2={g.y}
                stroke="var(--rule)" stroke-width="1" stroke-dasharray={g.isZero ? '0' : '2 4'} />
              {#if g.label}
                <text x={cashflowBars.axisLeft - 6} y={g.y + 3} font-family="var(--font-mono)" font-size="9" fill="var(--ink-3)" text-anchor="end">{g.label}</text>
              {/if}
            {/each}
            {#each cashflowBars.bars as b}
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} opacity="0.85" />
            {/each}
            {#each cashflowBars.qLabels as q}
              <text x={q.x} y={cashflowBars.axisBottom} font-family="var(--font-mono)" font-size="9" fill="var(--ink-3)" text-anchor="middle">{q.q}</text>
            {/each}
          </svg>
        {/if}
        <div class="row gap-4 mt-3 alts-legend">
          <span class="row gap-2 items-center"><span class="cashflow-swatch" style="background:var(--neg)"></span>Capital calls (cash out)</span>
          <span class="row gap-2 items-center"><span class="cashflow-swatch" style="background:var(--pos)"></span>Distributions (cash in)</span>
        </div>
      </Card>
      <DataTable class="mt-4">
        <thead>
          <tr>
            <th title="Quarter the cashflow occurs.">Quarter</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]" title="Capital wired to GPs in this quarter.">Calls</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]" title="Cash returned from GPs in this quarter.">Distributions</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]" title="Calls + distributions for the quarter.">Net</th>
            <th title="Which funds drive this quarter's flow.">Drivers</th>
          </tr>
        </thead>
        <tbody>
          {#each altCashflow as c (c.q)}
            {@const net = c.calls + c.dist}
            <tr>
              <td class="font-[var(--font-mono)] text-xs">{c.q}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]" class:text-neg={c.calls < 0} class:text-3={c.calls === 0}>{c.calls ? money(c.calls, { compact: true }) : '—'}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]" class:text-pos={c.dist > 0} class:text-3={c.dist === 0}>{c.dist ? '+' + money(c.dist, { compact: true }) : '—'}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] font-semibold" class:text-neg={net < 0} class:text-pos={net > 0} class:text-3={net === 0}>{net ? (net > 0 ? '+' : '') + money(net, { compact: true }) : '—'}</td>
              <td class="text-ink3 text-xs">{c.notes}</td>
            </tr>
          {/each}
        </tbody>
      </DataTable>
    </Section>

    <Section class="grid grid-cols-1 gap-3.5 lg:grid-cols-[3fr_2fr] lg:gap-6">
      <div>
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Unfunded commitment ladder</h2>
        <div class="text-ink3 text-xs mt-1">Earmark each tranche to instruments maturing near the expected call. Locks in yield on the medium-term sleeve while staying liquid for the imminent calls.</div>
        <Card class="p-0 mt-3 overflow-hidden">
          <div class="ladder-stack">
            {#each unfundedLadder as r, i (r.bucket)}
              <div class="ladder-segment" style:width={`${(r.amount / (ladderTotal || 1)) * 100}%`} style:background={LADDER_COLORS[i % LADDER_COLORS.length]} title={`${r.bucket} · ${money(r.amount, { compact: true })}`}></div>
            {/each}
          </div>
          <DataTable>
            <thead>
              <tr>
                <th>Bucket</th>
                <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Amount</th>
                <th>Instrument</th>
                <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Yield</th>
                <th>Covers</th>
              </tr>
            </thead>
            <tbody>
              {#each unfundedLadder as r, i (r.bucket)}
                <tr>
                  <td><span class="dot" style:background={LADDER_COLORS[i % LADDER_COLORS.length]}></span> {r.bucket}</td>
                  <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{money(r.amount, { compact: true })}</td>
                  <td class="text-ink3 text-xs">{r.instrument}</td>
                  <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{r.yield.toFixed(2)}%</td>
                  <td class="text-ink3 text-xs">{r.covers}</td>
                </tr>
              {/each}
              <tr class="font-semibold">
                <td>Total / blended</td>
                <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{money(ladderTotal, { compact: true })}</td>
                <td class="text-ink3 text-xs">weighted by amount</td>
                <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{ladderWeightedYield.toFixed(2)}%</td>
                <td class="text-ink3 text-xs">full unfunded sleeve</td>
              </tr>
            </tbody>
          </DataTable>
        </Card>
      </div>

      <div class="flex flex-col gap-4">
        <Card class="p-5">
          <div class="alts-eyebrow">Ladder vs all-MMF baseline</div>
          <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] alts-big text-pos mt-1">
            {incomeLift >= 0 ? '+' : ''}{money(incomeLift, { compact: true })}/yr
          </div>
          <div class="text-ink3 text-xs mt-2">
            Ladder earns ~{ladderWeightedYield.toFixed(2)}% × {money(ladderTotal, { compact: true })} = {money(ladderIncome, { compact: true })}/yr. Baseline ({MMF_BLENDED.toFixed(1)}% projected MMF avg over the call horizon) earns {money(mmfIncome, { compact: true })}/yr.
          </div>
          <Divider dashed class="my-3" />
          <div class="text-ink3 text-xs">
            Today's MMF (~5.18%) earns slightly more in the short run; the ladder hedges the Fed-cut path and locks in income across the entire draw window.
          </div>
        </Card>
        <div class="alts-note">
          <div class="alts-note-label">Why this matters</div>
          <div class="text-sm mt-1">
            An LP with {money(ladderTotal, { compact: true })} of unfunded commitments doesn't need that much sitting in overnight cash. The GP gives ~10 business days notice for calls — long enough to mature short-dated paper. Matching maturity to expected use is standard institutional treasury practice.
          </div>
        </div>
        <div class="alts-note muted">
          <div class="alts-note-label muted">Forecast caveat</div>
          <div class="text-sm mt-1">
            Calls follow industry-typical drawdown patterns (timing variance ±1–2 quarters). Distributions are GP estimates and depend on actual exit events; expect material variance.
          </div>
        </div>
      </div>
    </Section>
  {/if}
</Page>

<style>
  .alts-eyebrow {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .alts-card-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
  .alts-card-title-sm {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 600;
    margin: 0;
  }
  .alts-big {
    font-size: 32px;
    margin-top: 4px;
    line-height: 1.1;
  }
  .alts-num-lg {
    font-size: 24px;
    margin-top: 2px;
  }
  .row-between {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .row-between.baseline { align-items: baseline; }
  .row { display: flex; }
  .row.items-center { align-items: center; }
  .text-right { text-align: right; }

  .alts-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    background: var(--surface-2);
    color: var(--ink-2);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-sm);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
  }
  .alts-tag.pos {
    background: color-mix(in oklch, var(--pos) 14%, var(--surface));
    color: var(--pos);
    border-color: color-mix(in oklch, var(--pos) 22%, var(--surface));
  }
  .alts-tag.warn {
    background: var(--warn-soft);
    color: var(--warn);
    border-color: var(--warn-soft);
  }

  .alts-note {
    border-left: 2px solid var(--accent);
    background: linear-gradient(to right, var(--accent-soft), transparent 60%);
    padding: 10px 14px;
    border-radius: 0 var(--r-md) var(--r-md) 0;
    font-size: 13px;
  }
  .alts-note.muted {
    border-left-color: var(--ink-4);
    background: linear-gradient(to right, var(--surface-2), transparent 60%);
  }
  .alts-note-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .alts-note-label.muted { color: var(--ink-3); }

  /* Vintage diversification */
  .vintage-legend {
    flex-wrap: wrap;
    font-size: 11px;
    color: var(--ink-3);
  }
  .vintage-swatch {
    display: inline-block;
    width: 14px;
    height: 8px;
  }
  .dash-swatch {
    display: inline-block;
    width: 14px;
    height: 0;
    border-top: 1.4px dashed var(--neg);
  }
  .vintage-year { width: 50px; }
  .vintage-bar {
    flex: 1;
    height: 6px;
    background: var(--rule);
    border-radius: 99px;
    overflow: hidden;
    position: relative;
  }
  .vintage-fill { height: 100%; }
  .vintage-amt { width: 60px; text-align: right; }

  /* Holdings stats grid */
  .alts-stat {
    border-top: 1px dashed var(--rule-2);
    padding: 10px 12px 6px 0;
    cursor: help;
  }
  .alts-stat-num {
    font-size: 22px;
    margin-top: 2px;
  }
  .alts-chart {
    display: block;
    width: 100%;
    margin-top: 14px;
  }
  .alts-legend {
    flex-wrap: wrap;
    font-size: 11.5px;
    color: var(--ink-3);
  }

  .alts-call-q { width: 90px; }
  .alts-call-amt { width: 60px; text-align: right; }
  .alts-call-note { flex: 1; text-align: right; }

  /* Pacing timeline */
  .pacing-timeline {
    position: relative;
    height: 64px;
    margin-top: 16px;
  }
  @media (max-width: 640px) {
    .pacing-timeline {
      display: none;
    }
  }
  .pacing-rail {
    position: absolute;
    top: 26px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--rule);
  }
  .pacing-stop {
    position: absolute;
    transform: translateX(-50%);
    text-align: center;
  }
  .pacing-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin: 20px auto 0;
    border: 2px solid var(--surface);
    box-shadow: 0 0 0 1px var(--rule-2);
  }
  .pacing-dot.pos { background: var(--pos); }
  .pacing-dot.warn { background: var(--warn); }
  .pacing-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed var(--rule-2);
    padding-bottom: 12px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .pacing-q { width: 80px; font-size: 13px; }
  .pacing-amt { width: 80px; }
  .pacing-deal { flex: 1; font-weight: 500; min-width: 160px; }

  /* Cashflow ladder */
  .ladder-stack {
    display: flex;
    height: 14px;
    background: var(--rule);
  }
  .ladder-segment {
    border-right: 1px solid var(--surface);
  }
  .ladder-segment:last-child {
    border-right: 0;
  }
  .cashflow-swatch {
    display: inline-block;
    width: 14px;
    height: 10px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .dot.pos { background: var(--pos); }
  .dot.warn { background: var(--warn); }
  .text-3 { color: var(--ink-3); }
  .text-pos { color: var(--pos); }
  .text-neg { color: var(--neg); }
  .gap-2 { gap: 8px; }
  .gap-4 { gap: 16px; }
  .mt-1 { margin-top: 4px; }
  .ml-1 { margin-left: 4px; }
  .mt-3 { margin-top: 12px; }
  .mt-4 { margin-top: 16px; }
  .my-6 { margin-top: 24px; margin-bottom: 24px; }
  .pb-2 { padding-bottom: 8px; }
  .overflow-hidden { overflow: hidden; }
  .border-b { border-bottom: 1px dashed var(--rule-2); }
  .text-sm { font-size: 13px; }
</style>

