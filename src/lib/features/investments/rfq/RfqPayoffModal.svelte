<script>
  import { PAYOFF_COLORS, deskLabel, payoffAt } from './data.js';

  let { rfq, onClose = () => {} } = $props();

  let cfg = $derived(rfq.config);
  let pt = $derived(cfg.productType);
  let perDesk = $derived(pt === 'autocall' || pt === 'revconv');
  let validQuotes = $derived(rfq.quotes.filter((q) => q.status === 'quoted'));

  // Chart geometry
  const width = 620, height = 340;
  const xMin = 40, xMax = 160;
  const yMin = 0, yMax = 160;
  const pad = { left: 56, right: 24, top: 16, bottom: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const xScale = (x) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const yScale = (y) => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

  const buildPath = (productType, params) => {
    const segs = [];
    for (let x = xMin; x <= xMax; x += 0.5) {
      const y = Math.max(yMin, Math.min(yMax, payoffAt(productType, params, x)));
      segs.push([xScale(x), yScale(y)]);
    }
    return segs.map(([x, y], i) => (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
  };

  let lines = $derived(
    perDesk
      ? validQuotes.map((q, i) => ({
          key: q.deskId,
          label: deskLabel(q.deskId),
          color: PAYOFF_COLORS[i % PAYOFF_COLORS.length],
          d: buildPath(pt, { ...cfg, capBarrier: q.capBarrier, coupon: q.coupon })
        }))
      : [{ key: 'config', label: 'Configured terms', color: PAYOFF_COLORS[0], d: buildPath(pt, cfg) }]
  );

  const xTicks = [40, 60, 80, 100, 120, 140, 160];
  const yTicks = [0, 40, 80, 100, 120, 160];
</script>

<div class="backdrop" role="presentation" onmousedown={onClose}>
  <div class="modal" role="dialog" aria-modal="true" tabindex="-1" onmousedown={(e) => e.stopPropagation()}>
    <div class="head">
      <div>
        <div class="eyebrow">Payoff diagram</div>
        <h2>{cfg.productLabel} on {cfg.underlyings.join(' / ')}</h2>
        <p class="sub">At maturity · {cfg.currency} {cfg.notional} · {cfg.tenor}</p>
      </div>
      <span class="tag">{rfq.id}</span>
    </div>

    <div class="chart-wrap">
      <svg {width} {height} viewBox={'0 0 ' + width + ' ' + height} style="display:block;max-width:100%;height:auto">
        {#each xTicks as x}
          <line x1={xScale(x)} y1={pad.top} x2={xScale(x)} y2={pad.top + plotH}
            stroke="var(--rule-2)" stroke-dasharray="2,4" opacity="0.5" />
        {/each}
        {#each yTicks as y}
          <line x1={pad.left} y1={yScale(y)} x2={pad.left + plotW} y2={yScale(y)}
            stroke="var(--rule-2)" stroke-dasharray="2,4" opacity="0.5" />
        {/each}
        <line x1={pad.left} y1={yScale(100)} x2={pad.left + plotW} y2={yScale(100)}
          stroke="var(--ink-3)" stroke-dasharray="4,4" opacity="0.7" />
        <line x1={xScale(100)} y1={pad.top} x2={xScale(100)} y2={pad.top + plotH}
          stroke="var(--ink-3)" stroke-dasharray="4,4" opacity="0.7" />
        <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="var(--ink-3)" />
        <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="var(--ink-3)" />
        {#each xTicks as x}
          <text x={xScale(x)} y={pad.top + plotH + 16} font-size="11" text-anchor="middle"
            fill="var(--ink-3)" font-family="var(--font-mono)">{x}</text>
        {/each}
        {#each yTicks as y}
          <text x={pad.left - 8} y={yScale(y) + 4} font-size="11" text-anchor="end"
            fill="var(--ink-3)" font-family="var(--font-mono)">{y}</text>
        {/each}
        <text x={pad.left + plotW / 2} y={height - 6} font-size="11" text-anchor="middle" fill="var(--ink-2)">
          Underlying at maturity (% of strike)
        </text>
        <text x={14} y={pad.top + plotH / 2} font-size="11" text-anchor="middle" fill="var(--ink-2)"
          transform={'rotate(-90, 14, ' + (pad.top + plotH / 2) + ')'}>
          Payoff (% of notional)
        </text>
        {#each lines as l (l.key)}
          <path d={l.d} fill="none" stroke={l.color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        {/each}
      </svg>
    </div>

    {#if validQuotes.length > 0}
      <div class="legend">
        <div class="legend-label">{perDesk ? 'Desk quotes' : 'Configured payoff'}</div>
        <div class="legend-items">
          {#if perDesk}
            {#each validQuotes as q, i}
              <div class="legend-item">
                <span class="swatch" style:background={PAYOFF_COLORS[i % PAYOFF_COLORS.length]}></span>
                <span>
                  {deskLabel(q.deskId)} · <span class="mono">{q.coupon.toFixed(2)}%</span> coupon · <span class="mono">{q.capBarrier}%</span> barrier
                </span>
              </div>
            {/each}
          {:else}
            <div class="legend-item">
              <span class="swatch" style:background={PAYOFF_COLORS[0]}></span>
              <span>Configured terms</span>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <p class="footnote">
      Indicative payoff at maturity.
      {#if pt === 'autocall'}Assumes the structure is held to maturity (no autocall trigger).{/if}
      {#if pt === 'revconv'}Coupon paid regardless of barrier; capital at risk below the barrier.{/if}
      {#if pt === 'capprot'}Capital protection applies only at maturity.{/if}
      {#if pt === 'buffer'}Buffer absorbs the first N% of underlying loss; below that, 1:1 downside.{/if}
    </p>

    <div class="actions">
      <button type="button" class="btn primary" onclick={onClose}>Close</button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(10, 12, 18, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    overflow-y: auto;
  }
  .modal {
    background: var(--surface);
    color: var(--ink);
    border-radius: var(--r-lg);
    border: 1px solid var(--rule);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
    max-width: 720px;
    width: 100%;
    max-height: min(92vh, 900px);
    overflow-y: auto;
    padding: 28px;
  }
  .head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  h2 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    line-height: 1.2;
    margin: 4px 0 0;
  }
  .sub {
    color: var(--ink-2);
    font-size: 13px;
    margin: 4px 0 0;
  }
  .tag {
    background: var(--surface-2);
    color: var(--ink-2);
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 3px 8px;
    border-radius: var(--r-sm);
  }
  .chart-wrap {
    margin-top: 24px;
    background: var(--surface-2);
    border-radius: var(--r-md);
    padding: 12px;
    border: 1px solid var(--rule-2);
  }
  .legend {
    margin-top: 16px;
  }
  .legend-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .legend-items {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 8px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }
  .swatch {
    display: inline-block;
    width: 14px;
    height: 3px;
    border-radius: 2px;
  }
  .mono {
    font-family: var(--font-mono);
  }
  .footnote {
    color: var(--ink-3);
    font-size: 11px;
    margin-top: 16px;
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 24px;
    justify-content: flex-end;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 14px;
    border: 1px solid var(--rule-2);
    background: var(--surface);
    color: var(--ink);
    border-radius: var(--r-md);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  .btn.primary {
    background: var(--ink);
    color: var(--surface);
    border-color: var(--ink);
  }
  .btn.primary:hover {
    opacity: 0.9;
  }
</style>
