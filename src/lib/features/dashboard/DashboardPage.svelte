<script>
  import {
    BOOK_AUM_BRIDGE,
    BOOK_SUMMARY,
    DASHBOARD_TASKS,
    MARKET_CALENDAR
  } from '../../data/fixtures.js';
  import AddClientModal from '$lib/components/app/AddClientModal.svelte';
  import NewMeetingModal from '$lib/components/app/NewMeetingModal.svelte';
  import { Bar, Button, Card, Divider, Kpi, KpiStrip, Page, PageHeader, Section } from '../../components/ui/index.js';
  import { clientAum, clientAumSplit, feeLines } from '../../domain/book.js';
  import { dateShort, money, pct, signedMoney, sum } from '../../domain/format.js';
  import { meetPickerOpen } from '$lib/state/app.js';

  let { clients = [], navigate = () => {} } = $props();
  let addClientOpen = $state(false);
  let newMeetingOpen = $state(false);

  const onPickExistingClient = () => {
    newMeetingOpen = false;
    meetPickerOpen.set(true);
  };
  const onPickNewProspect = () => {
    newMeetingOpen = false;
    addClientOpen = true;
  };

  const currentDateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());
  const sorted = $derived([...clients].sort((a, b) => clientAum(b) - clientAum(a)));
  const totalAum = $derived(sum(sorted, clientAum));
  const advisoryAum = $derived(sum(sorted, (c) => clientAumSplit(c).advisory));
  const nonAdvisoryAum = $derived(sum(sorted, (c) => clientAumSplit(c).nonAdvisory));
  const sortedByAdvisory = $derived([...clients].sort((a, b) => clientAumSplit(b).advisory - clientAumSplit(a).advisory));
  const top3Advisory = $derived(sum(sortedByAdvisory.slice(0, 3), (c) => clientAumSplit(c).advisory));
  const top3Share = $derived(advisoryAum ? top3Advisory / advisoryAum : 0);
  const flaggedPortfolios = $derived(
    sorted.filter((c) => (c.driftTone && c.driftTone !== 'ok') || (c.reviewInDays != null && c.reviewInDays <= 14)).length
  );
  const TYPE_ORDER = ['FO', 'UHNW', 'HNW'];
  const clientTypeBreakdown = $derived.by(() => {
    const counts = {};
    for (const c of clients) {
      const t = c.familyType || 'Other';
      counts[t] = (counts[t] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => {
        const ai = TYPE_ORDER.indexOf(a[0]);
        const bi = TYPE_ORDER.indexOf(b[0]);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
      .map(([type, n]) => `${n} ${type}`)
      .join(' · ');
  });
  const currentAum = $derived(totalAum || BOOK_SUMMARY.totalAum);
  const revenue = $derived(sum(sorted, (row) => feeLines(row).advisory + feeLines(row).nonAdvisory));
  const annualizedRevenue = $derived(revenue || BOOK_SUMMARY.annualizedRevenue);
  const feeableMix = $derived([
    { label: 'AUM under advisory', value: advisoryAum || Math.round(currentAum * 0.84), color: 'var(--ink)' },
    { label: 'Held-away / monitor', value: Math.round(currentAum * 0.09), color: 'var(--ink-3)' },
    { label: 'Cash / sweep', value: Math.round(currentAum * 0.045), color: 'var(--warn)' },
    { label: 'Advisory-excluded', value: Math.round(currentAum * 0.025), color: 'var(--ink-4)' }
  ]);
  const bridgeChart = $derived.by(() => {
    const width = 720;
    const height = 240;
    const pad = { l: 42, r: 14, t: 22, b: 42 };
    const start = currentAum - (BOOK_AUM_BRIDGE.market + BOOK_AUM_BRIDGE.inflows + BOOK_AUM_BRIDGE.outflows);
    const current = start + BOOK_AUM_BRIDGE.market + BOOK_AUM_BRIDGE.inflows + BOOK_AUM_BRIDGE.outflows;
    const expected = current + BOOK_AUM_BRIDGE.pending;
    const minY = Math.min(start, current) - Math.max(1_000_000, current * 0.025);
    const maxY = expected + Math.max(1_000_000, current * 0.02);
    const y = (value) => pad.t + (height - pad.t - pad.b) * (1 - (value - minY) / (maxY - minY));
    const items = [
      { label: 'Start', from: minY, to: start, total: true, amount: start },
      { label: 'Mkt', from: start, to: start + BOOK_AUM_BRIDGE.market, amount: BOOK_AUM_BRIDGE.market },
      { label: 'In', from: start + BOOK_AUM_BRIDGE.market, to: start + BOOK_AUM_BRIDGE.market + BOOK_AUM_BRIDGE.inflows, amount: BOOK_AUM_BRIDGE.inflows },
      { label: 'Out', from: start + BOOK_AUM_BRIDGE.market + BOOK_AUM_BRIDGE.inflows, to: current, amount: BOOK_AUM_BRIDGE.outflows },
      { label: 'Current', from: minY, to: current, total: true, amount: current },
      { label: 'Pending', from: current, to: expected, amount: BOOK_AUM_BRIDGE.pending },
      { label: 'Expected', from: minY, to: expected, total: true, amount: expected }
    ];
    const step = (width - pad.l - pad.r) / items.length;
    const barWidth = Math.min(54, step * 0.58);

    return {
      width,
      height,
      expected,
      gridlines: [minY, current, expected].map((value, index) => ({
        value,
        label: money(value, { compact: true }),
        y: y(value),
        baseline: index === 0
      })),
      bars: items.map((item, index) => {
        const cx = pad.l + step * index + step / 2;
        const top = y(Math.max(item.from, item.to));
        const barHeight = Math.max(2, Math.abs(y(item.from) - y(item.to)));
        const fill = item.total ? 'var(--ink)' : item.amount < 0 ? 'var(--neg)' : 'var(--pos)';
        return {
          ...item,
          cx,
          top,
          barHeight,
          fill,
          opacity: item.total ? 0.9 : 0.82,
          title: item.total ? money(item.amount, { compact: true }) : signedMoney(item.amount, { compact: true }),
          connectorX1: cx - step / 2,
          connectorX2: cx + step / 2,
          connectorY1: y(item.from),
          connectorY2: y(item.to),
          labelY: height - 21,
          valueY: top - 6
        };
      })
    };
  });
</script>

<Page>
  <PageHeader class="dashboard-header">
    <div>
      <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{currentDateLabel} · Book Overview</div>
      <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Welcome, Christine</h1>
      <p class="text-ink2 mt-2 max-w-[720px]">
        A monthly business-health view for planning, pacing, and keeping the book centered between client work.
      </p>
    </div>
    <div class="flex gap-2 flex-wrap">
      <Button variant="primary" onclick={() => (addClientOpen = true)}>+ Add client</Button>
      <Button onclick={() => (newMeetingOpen = true)}>+ New meeting</Button>
    </div>
  </PageHeader>

  <KpiStrip class="dashboard-kpis">
    <Kpi label="Active clients" value={String(clients.length)} sub={clientTypeBreakdown} />
    <Kpi label="Current AUM" value={money(totalAum, { compact: true })} sub={`${pct(BOOK_SUMMARY.aumYtdPct * 100)} YTD`} />
    <Kpi label="AUM under advisory" value={money(advisoryAum, { compact: true })} sub={`${money(nonAdvisoryAum, { compact: true })} non-advisory`} />
    <Kpi class="kpi-mobile-only" label="Top 3 AUM share" value={`${(top3Share * 100).toFixed(0)}%`} sub={money(top3Advisory, { compact: true })} />
    <Kpi label="Revenue YTD" value={money(BOOK_SUMMARY.revenueYtd, { compact: true })} sub={`${pct(BOOK_SUMMARY.revenueYtdVsLastYear * 100, { dp: 1 })} vs last year`} />
    <Kpi label="Portfolios flagged" value={String(flaggedPortfolios)} sub="Investment Policy Statement drift or review due" />
  </KpiStrip>

  <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6 md:mt-7">
    <Card class="p-6">
      <div class="row-between baseline">
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 text-lg">This week</h2>
        <span class="dash-eyebrow">Deadline</span>
      </div>
      <div class="dash-list mt-3">
        {#each DASHBOARD_TASKS as t (t.id)}
          <div class="dash-row">
            <span class="dash-label">{t.label}</span>
            <span class={`dash-tag ${t.tone === 'urgent' ? 'neg' : t.tone === 'warn' ? 'warn' : ''}`}>{t.when}</span>
          </div>
        {/each}
      </div>
    </Card>
    <Card class="p-6">
      <div class="row-between baseline">
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 text-lg">Market calendar</h2>
        <span class="dash-eyebrow">Issuance</span>
      </div>
      <div class="dash-list mt-3">
        {#each MARKET_CALENDAR as m (m.id)}
          <div class="dash-row">
            <span class="dash-ticker">{m.ticker}</span>
            <span class="dash-label">{m.label}</span>
            <span class="dash-date">{dateShort(m.date)}</span>
            <span class="dash-num">{money(m.value, { compact: true })}</span>
          </div>
        {/each}
      </div>
    </Card>
  </Section>

  <Section class="grid grid-cols-1 gap-3.5 lg:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)] lg:gap-6">
    <Card class="p-6">
      <div>
        <div class="flex items-baseline justify-between gap-3">
          <div>
            <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">AUM bridge</div>
            <h3 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 mt-1 text-lg">From starting book to expected month-end</h3>
          </div>
          <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-[13px]">{money(bridgeChart.expected, { compact: true })}</span>
        </div>

        <svg
          aria-label="AUM bridge chart"
          class="aum-bridge-chart"
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${bridgeChart.width} ${bridgeChart.height}`}
        >
          {#each bridgeChart.gridlines as line}
            <g>
              <line
                stroke="var(--rule)"
                stroke-dasharray={line.baseline ? '0' : '2 4'}
                stroke-width="1"
                x1="42"
                x2={bridgeChart.width - 14}
                y1={line.y}
                y2={line.y}
              />
              <text
                fill="var(--ink-3)"
                font-family="var(--font-mono)"
                font-size="9"
                text-anchor="end"
                x="35"
                y={line.y + 3}
              >
                {line.label}
              </text>
            </g>
          {/each}

          {#each bridgeChart.bars as bar}
            <g>
              <rect
                fill={bar.fill}
                height={bar.barHeight}
                opacity={bar.opacity}
                width="54"
                x={bar.cx - 27}
                y={bar.top}
              >
                <title>{bar.label}: {bar.title}</title>
              </rect>
              {#if !bar.total}
                <line
                  stroke="var(--ink-4)"
                  stroke-dasharray="2 3"
                  stroke-width="1"
                  x1={bar.connectorX1}
                  x2={bar.connectorX2}
                  y1={bar.connectorY1}
                  y2={bar.connectorY2}
                />
              {/if}
              <text
                fill="var(--ink-3)"
                font-family="var(--font-mono)"
                font-size="9"
                text-anchor="middle"
                x={bar.cx}
                y={bar.labelY}
              >
                {bar.label}
              </text>
              <text
                fill={bar.total ? 'var(--ink)' : bar.fill}
                font-family="var(--font-mono)"
                font-size="9"
                text-anchor="middle"
                x={bar.cx}
                y={bar.valueY}
              >
                {bar.title}
              </text>
            </g>
          {/each}
        </svg>

        <div class="bridge-legend flex gap-4 text-ink3 mt-3 flex-wrap text-xs">
          <span><span class="inline-block h-2 w-2 rounded-full bg-pos"></span> Market + inflows</span>
          <span><span class="inline-block h-2 w-2 rounded-full bg-neg"></span> Outflows</span>
          <span><span class="inline-block h-2 w-2 rounded-full bg-ink"></span> Totals</span>
        </div>
      </div>
    </Card>

    <Card class="p-6">
      <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Revenue</div>
      <div class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-1 text-2xl font-semibold">{money(annualizedRevenue, { compact: true })}</div>
      <div class="text-ink3 mt-1 text-xs">
        {BOOK_SUMMARY.avgFeeBps} bps across {money(Math.round(currentAum * 0.84), { compact: true })} feeable AUM.
      </div>
      <Divider dashed class="my-4" />
      <div class="flex flex-col space-y-3.5">
        {#each feeableMix as row}
          <div>
            <div class="flex items-baseline justify-between gap-3">
              <span class="text-ink2 text-[13px]">{row.label}</span>
              <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-xs">{money(row.value, { compact: true })}</span>
            </div>
            <Bar class="mt-2" value={(row.value / currentAum) * 100} color={row.color} />
          </div>
        {/each}
      </div>
    </Card>
  </Section>
</Page>

{#if newMeetingOpen}
  <NewMeetingModal
    onClose={() => (newMeetingOpen = false)}
    onPickExisting={onPickExistingClient}
    onPickProspect={onPickNewProspect}
  />
{/if}

{#if addClientOpen}
  <AddClientModal onClose={() => (addClientOpen = false)} />
{/if}

<style>
  /* Drop the page-header bottom rule on the dashboard; the KPI strip
     directly below has its own top rule, so the divider is redundant. */
  :global(.page-header.dashboard-header) {
    border-bottom: 0;
  }

  /* Dashboard KPI strip — fixed 6-track when there's room, otherwise
     drop to a clean 3 × 2 split, then 2 × 3 on phones, then a single
     column at the smallest sizes. Reset row-start cells' left border
     and add a top divider for cells in the second row so the grid lines
     stay clean across multi-row layouts. */
  :global(.dashboard-kpis) {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  @media (min-width: 768px) {
    :global(.dashboard-kpis) {
      grid-template-columns: repeat(3, 1fr) !important;
    }
    :global(.dashboard-kpis .kpi:nth-child(3n+1)) {
      border-left: 0 !important;
      padding-left: 0 !important;
    }
    :global(.dashboard-kpis .kpi:nth-child(n+4)) {
      border-top: 1px solid var(--rule);
    }
  }
  @media (min-width: 1180px) {
    :global(.dashboard-kpis) {
      grid-template-columns:
        minmax(120px, 0.7fr) repeat(3, minmax(170px, 1fr)) minmax(220px, 1.3fr) !important;
    }
    :global(.dashboard-kpis .kpi:nth-child(3n+1)) {
      border-left: 1px solid var(--rule) !important;
      padding-left: 24px !important;
    }
    :global(.dashboard-kpis .kpi:first-child) {
      border-left: 0 !important;
      padding-left: 0 !important;
    }
    :global(.dashboard-kpis .kpi:nth-child(n+4)) {
      border-top: 0;
    }
  }
  @media (max-width: 380px) {
    :global(.dashboard-kpis) {
      grid-template-columns: 1fr !important;
    }
  }
  @media (min-width: 769px) {
    :global(.dashboard-kpis .kpi.kpi-mobile-only) {
      display: none !important;
    }
  }

  .aum-bridge-chart {
    display: block;
    width: 100%;
    height: 240px;
    margin-top: 14px;
    overflow: visible;
  }

  .bridge-legend {
    align-items: center;
  }

  .bridge-legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  @media (max-width: 640px) {
    .aum-bridge-chart {
      height: 210px;
    }
  }

  /* This week + Market calendar panels */
  .row-between {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .row-between.baseline {
    align-items: baseline;
  }
  .dash-eyebrow {
    color: var(--ink-3);
    font-size: 11px;
  }
  .dash-list {
    display: flex;
    flex-direction: column;
  }
  .dash-row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    border-bottom: 1px dashed var(--rule-2);
    font-size: 13px;
  }
  .dash-row:last-child {
    border-bottom: 0;
  }
  .dash-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .dash-ticker {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-3);
    width: 56px;
    flex-shrink: 0;
  }
  .dash-date {
    font-family: var(--font-mono);
    font-feature-settings: 'tnum' on;
    font-size: 11px;
    color: var(--ink-3);
    flex-shrink: 0;
  }
  .dash-num {
    font-family: var(--font-mono);
    font-feature-settings: 'tnum' on;
    font-size: 12px;
    flex-shrink: 0;
  }
  .dash-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border: 1px solid var(--rule-2);
    background: var(--surface-2);
    color: var(--ink-2);
    border-radius: var(--r-sm);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }
  .dash-tag.warn {
    background: var(--warn-soft);
    color: var(--warn);
    border-color: var(--warn-soft);
  }
  .dash-tag.neg {
    background: var(--neg-soft);
    color: var(--neg);
    border-color: var(--neg-soft);
  }
</style>
