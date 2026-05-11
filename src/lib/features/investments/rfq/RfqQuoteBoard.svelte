<script>
  import { deskLabel } from './data.js';
  import RfqQuoteRow from './RfqQuoteRow.svelte';

  let { rfq, now, isActive, setEmailTarget = () => {}, onVisualize = () => {} } = $props();

  let quoted = $derived(rfq.quotes.filter((q) => q.status === 'quoted'));
  let valid = $derived(quoted.filter((q) => q.expiresAt > now));
  let bestCoupon = $derived(valid.reduce((b, q) => (!b || q.coupon > b.coupon ? q : b), null));
  let bestProt = $derived(valid.reduce((b, q) => (!b || q.capBarrier < b.capBarrier ? q : b), null));
</script>

<div>
  <div class="table-shell">
    <table>
      <thead>
        <tr>
          <th>Desk</th>
          <th class="num">Coupon</th>
          <th class="num">Cap Barrier</th>
          <th class="num">Issue Price</th>
          <th>Expires</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each rfq.quotes as q (q.deskId)}
          <RfqQuoteRow {q} {now}
            isBestCoupon={bestCoupon && bestCoupon.deskId === q.deskId}
            onEmail={() => setEmailTarget({ kind: 'single', quote: q, rfqId: rfq.id })} />
        {/each}
      </tbody>
    </table>
  </div>

  {#if bestCoupon || bestProt}
    <div class="best-by">
      {#if bestCoupon}
        <div class="item">
          <span class="label">Best by coupon:</span>
          <span>{deskLabel(bestCoupon.deskId)} <span class="v">{bestCoupon.coupon.toFixed(2)}%</span></span>
        </div>
      {/if}
      {#if bestProt}
        <div class="item">
          <span class="label">Best by protection:</span>
          <span>{deskLabel(bestProt.deskId)} <span class="v">{bestProt.capBarrier}%</span> barrier</span>
        </div>
      {/if}
    </div>
  {/if}

  {#if isActive}
    <div class="action-bar">
      <button type="button" class="btn" disabled={quoted.length === 0} onclick={onVisualize}>
        Visualize payoff
      </button>
      <button type="button" class="btn primary" disabled={quoted.length === 0}
        onclick={() => setEmailTarget({ kind: 'comparison', rfqId: rfq.id })}>
        ✉ Email quotes
      </button>
    </div>
  {/if}
</div>

<style>
  .table-shell {
    border-radius: var(--r-md);
    border: 1px solid var(--rule-2);
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  thead th {
    text-align: left;
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-3);
    border-bottom: 1px solid var(--rule-2);
    background: var(--surface-2);
  }
  thead th.num {
    text-align: right;
  }
  table :global(td) {
    padding: 14px;
    border-bottom: 1px solid var(--rule-2);
    font-size: 14px;
    vertical-align: middle;
  }
  table :global(tbody tr:last-child td) {
    border-bottom: 0;
  }
  table :global(tbody tr:hover td) {
    background: var(--surface-2);
  }

  .best-by {
    display: flex;
    gap: 24px;
    padding: 12px 16px;
    background: var(--surface-2);
    border-radius: var(--r-md);
    margin-top: 12px;
    font-size: 13px;
    flex-wrap: wrap;
  }
  .best-by .item {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }
  .best-by .label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .best-by .v {
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .action-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--rule-2);
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
  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
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
