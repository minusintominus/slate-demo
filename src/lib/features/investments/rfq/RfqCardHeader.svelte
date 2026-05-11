<script>
  import { countdownTone, fmtRelative, formatCountdown } from './data.js';

  let { rfq, now, isActive } = $props();

  let total = $derived(rfq.quotes.length);
  let quoted = $derived(rfq.quotes.filter((q) => q.status === 'quoted').length);
  let overallMs = $derived(rfq.deadlineAt - now);
  let ago = $derived(fmtRelative(rfq.sentAt, now));
</script>

<div class="summary">
  <div class="left">
    <div class="title-row">
      <span class="id mono">{rfq.id}</span>
      <span class="title">{rfq.config.productLabel} on {rfq.config.underlyings.join(' / ')}</span>
    </div>
    <div class="meta">
      {rfq.config.currency} {rfq.config.notional} · {rfq.config.tenor} · {total} desks · {quoted} of {total} quoted · sent {ago}
    </div>
  </div>
  <div class="status">
    {#if isActive}
      <span class="live-dot"></span>
      <span class="countdown {countdownTone(overallMs)}">{formatCountdown(overallMs)} to deadline</span>
    {:else}
      <span class="tag">Closed · {ago}</span>
    {/if}
  </div>
</div>

<style>
  .summary {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 14px 18px;
    margin: -24px -24px 18px;
    background: var(--surface-2);
    border-radius: var(--r-lg) var(--r-lg) 0 0;
    border-bottom: 1px solid var(--rule-2);
    flex-wrap: wrap;
  }
  .left {
    min-width: 0;
    flex: 1 1 320px;
  }
  .title-row {
    display: flex;
    gap: 12px;
    align-items: baseline;
    flex-wrap: wrap;
  }
  .id {
    font-weight: 600;
    font-size: 13px;
  }
  .mono {
    font-family: var(--font-mono);
  }
  .title {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 15px;
  }
  .meta {
    font-size: 12px;
    color: var(--ink-3);
    margin-top: 4px;
  }
  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--pos);
    animation: rfq-pulse 1.5s ease-in-out infinite;
  }
  @keyframes rfq-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .countdown {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .countdown.green { color: var(--pos); }
  .countdown.amber { color: var(--warn); }
  .countdown.red { color: var(--neg); font-weight: 600; }
  .countdown.gray { color: var(--ink-4); }
  .tag {
    font-family: var(--font-mono);
    font-size: 11px;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    color: var(--ink-2);
    padding: 3px 8px;
    border-radius: var(--r-sm);
  }
</style>
