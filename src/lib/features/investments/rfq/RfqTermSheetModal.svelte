<script>
  import { PRODUCT_TYPES } from './data.js';

  let { config, onClose = () => {} } = $props();

  const fmtDate = (d) => d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  let tenorYears = $derived({ '1Y': 1, '18M': 1.5, '2Y': 2, '3Y': 3, '5Y': 5 }[config.tenor] || 3);
  let issueDate = $derived.by(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d;
  });
  let maturity = $derived.by(() => {
    const d = new Date(issueDate);
    d.setMonth(d.getMonth() + Math.round(tenorYears * 12));
    return d;
  });
  let productLabel = $derived((PRODUCT_TYPES.find((p) => p.id === config.productType) || {}).label || config.productType);
  let obsLabel = $derived((config.observation || '').charAt(0).toUpperCase() + (config.observation || '').slice(1));
</script>

<div class="backdrop" role="presentation" onmousedown={onClose}>
  <div class="modal" role="dialog" aria-modal="true" tabindex="-1" onmousedown={(e) => e.stopPropagation()}>
    <div class="head">
      <div>
        <div class="eyebrow">Indicative term sheet · DRAFT</div>
        <h2>{productLabel} on {config.underlyings.join(' / ')}</h2>
        <p class="sub">Pre-quote preview — no issuer assigned</p>
      </div>
      <span class="tag warn">Pre-quote</span>
    </div>

    <hr />

    <table>
      <tbody>
        <tr><td class="lbl">Product</td><td class="val">{productLabel}</td></tr>
        <tr><td class="lbl">Underlying</td><td class="val">{config.underlyings.join(', ')}</td></tr>
        <tr><td class="lbl">Notional</td><td class="val">{config.currency} {config.notional}</td></tr>
        <tr><td class="lbl">Issue date</td><td class="val">{fmtDate(issueDate)}</td></tr>
        <tr><td class="lbl">Maturity</td><td class="val">{fmtDate(maturity)} ({config.tenor})</td></tr>
      </tbody>
    </table>

    <hr class="dashed" />

    <table>
      <tbody>
        <tr><td class="lbl">Strike</td><td class="val">{config.strike}%</td></tr>
        {#if config.productType === 'autocall'}
          <tr><td class="lbl">Autocall barrier</td><td class="val">{config.autocallBarrier}%</td></tr>
          <tr><td class="lbl">Coupon barrier</td><td class="val">{config.coupBarrier}%</td></tr>
          <tr><td class="lbl">Capital barrier</td><td class="val">{config.capBarrier}% (European observation)</td></tr>
          <tr><td class="lbl">{config.indicative.label}</td><td class="val">{config.indicative.value}{config.indicative.unit}</td></tr>
          <tr><td class="lbl">Memory feature</td><td class="val">{config.memory ? 'On' : 'Off'}</td></tr>
          <tr><td class="lbl">Observation</td><td class="val">{obsLabel}</td></tr>
        {:else if config.productType === 'revconv'}
          <tr><td class="lbl">Capital barrier</td><td class="val">{config.capBarrier}%</td></tr>
          <tr><td class="lbl">Barrier observation</td><td class="val">{config.barrierObs === 'continuous' ? 'Continuous (intra-day)' : 'European (at maturity)'}</td></tr>
          <tr><td class="lbl">{config.indicative.label}</td><td class="val">{config.indicative.value}{config.indicative.unit}</td></tr>
        {:else if config.productType === 'capprot'}
          <tr><td class="lbl">Capital protection</td><td class="val">{config.protection}% of notional</td></tr>
          <tr><td class="lbl">Upside cap</td><td class="val">{config.upsideCap === 0 ? 'Uncapped' : config.upsideCap + '%'}</td></tr>
          <tr><td class="lbl">{config.indicative.label}</td><td class="val">{config.indicative.value}{config.indicative.unit}</td></tr>
        {:else if config.productType === 'buffer'}
          <tr><td class="lbl">Buffer</td><td class="val">{config.buffer}% loss absorbed</td></tr>
          <tr><td class="lbl">Upside cap</td><td class="val">{config.upsideCap === 0 ? 'Uncapped' : config.upsideCap + '%'}</td></tr>
          <tr><td class="lbl">{config.indicative.label}</td><td class="val">{config.indicative.value}{config.indicative.unit}</td></tr>
        {/if}
      </tbody>
    </table>

    <hr class="dashed" />

    <table>
      <tbody>
        <tr><td class="lbl">Settlement</td><td class="val">Cash · {config.currency}</td></tr>
        <tr><td class="lbl">Listing</td><td class="val">Unlisted</td></tr>
        <tr><td class="lbl">Issuer rating</td><td class="val">Min. A− (S&amp;P)</td></tr>
      </tbody>
    </table>

    <hr />

    <div class="risks">
      <div class="risks-label">Key risks</div>
      <ul>
        {#if config.productType === 'autocall' || config.productType === 'revconv'}
          <li>Loss of capital if the underlying breaches the {config.capBarrier}% barrier.</li>
        {:else if config.productType === 'capprot'}
          <li>Capital protection of {config.protection}% applies only at maturity, not before.</li>
        {:else if config.productType === 'buffer'}
          <li>Below the {config.buffer}% buffer, losses track the underlying 1:1.</li>
        {/if}
        <li>Issuer credit risk — full repayment depends on the counterparty's solvency.</li>
        <li>No guaranteed secondary market liquidity prior to maturity.</li>
        <li>Currency, interest rate, and underlying market risks apply throughout the term.</li>
      </ul>
    </div>

    <div class="disclaimer">
      Indicative pricing only — not an offer. Final terms, coupon, and fees are subject to confirmation by the issuing desk. Issuer assignment occurs when a quote is selected.
    </div>

    <div class="actions">
      <button type="button" class="btn ghost" onclick={onClose}>Close</button>
      <button type="button" class="btn primary">Download PDF</button>
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
    max-width: 640px;
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
  .tag.warn {
    background: var(--warn-soft);
    color: var(--warn);
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 3px 8px;
    border-radius: var(--r-sm);
  }
  hr {
    border: 0;
    border-top: 1px solid var(--rule-2);
    margin: 20px 0 4px;
  }
  hr.dashed {
    border-top: 1px dashed var(--rule-2);
    margin: 12px 0 4px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  td.lbl {
    padding: 7px 0;
    width: 42%;
    color: var(--ink-3);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }
  td.val {
    padding: 7px 0;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--ink);
  }
  .risks {
    margin-top: 16px;
  }
  .risks-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .risks ul {
    margin: 8px 0 0;
    padding-left: 20px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--ink-2);
  }
  .disclaimer {
    margin-top: 24px;
    padding: 12px;
    background: var(--surface-2);
    border-radius: var(--r-md);
    font-size: 12px;
    color: var(--ink-3);
    line-height: 1.5;
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
  .btn:hover {
    background: var(--surface-2);
  }
  .btn.primary {
    background: var(--ink);
    color: var(--surface);
    border-color: var(--ink);
  }
  .btn.primary:hover {
    opacity: 0.9;
  }
  .btn.ghost {
    background: transparent;
    border-color: transparent;
  }
  .btn.ghost:hover {
    background: var(--surface-2);
  }
</style>
