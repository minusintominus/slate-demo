<script>
  import { DESKS, countdownTone, formatCountdown } from './data.js';

  let { q, now, isBestCoupon = false, onEmail = () => {} } = $props();

  let menuOpen = $state(false);
  let rowEl = $state();

  $effect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (rowEl && !rowEl.contains(e.target)) menuOpen = false;
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  });

  const desk = $derived(DESKS.find((d) => d.id === q.deskId) || { label: q.deskId });
  const expiryMs = $derived(q.expiresAt ? q.expiresAt - now : 0);
  const expired = $derived(q.status === 'quoted' && expiryMs <= 0);
</script>

{#if q.status === 'pending'}
  <tr>
    <td>{desk.label}</td>
    <td class="num text-3">—</td>
    <td class="num text-3">—</td>
    <td class="num text-3">—</td>
    <td class="text-3">—</td>
    <td><span class="pending-dot"></span><span class="text-3">Pending</span></td>
    <td></td>
  </tr>
{:else}
  <tr class:best={isBestCoupon} class:expired>
    <td>{desk.label}</td>
    <td class="num quote-num">
      {q.coupon.toFixed(2)}%{#if isBestCoupon && !expired}<span class="star">★</span>{/if}
    </td>
    <td class="num quote-num">{q.capBarrier}%</td>
    <td class="num quote-num">{q.issuePrice.toFixed(2)}</td>
    <td>
      <span class="countdown {countdownTone(expiryMs)}">
        {expired ? 'Expired' : formatCountdown(expiryMs)}
      </span>
    </td>
    <td>
      <span class="tag {expired ? 'neg' : isBestCoupon ? 'pos' : ''}">
        {expired ? 'Stale' : isBestCoupon ? 'Best' : 'Quoted'}
      </span>
    </td>
    <td style="text-align:right">
      <span class="row-action" bind:this={rowEl}>
        <button type="button" class="dots" onclick={() => (menuOpen = !menuOpen)} title="More actions">⋯</button>
        {#if menuOpen}
          <div class="menu">
            <button type="button" onclick={() => (menuOpen = false)}>View term sheet</button>
            <button type="button" onclick={() => { menuOpen = false; onEmail(); }}>Email this quote to client</button>
            <button type="button" onclick={() => (menuOpen = false)}>Counter offer</button>
            <button type="button" onclick={() => (menuOpen = false)}>Star as preferred</button>
            <button type="button" onclick={() => (menuOpen = false)}>Mark as stale</button>
          </div>
        {/if}
      </span>
    </td>
  </tr>
{/if}

<style>
  .num {
    text-align: right;
    font-family: var(--font-mono);
    font-feature-settings: 'tnum';
  }
  .text-3 {
    color: var(--ink-3);
    font-size: 12px;
  }
  tr.best td {
    background: color-mix(in oklch, var(--pos) 14%, var(--surface));
  }
  tr.best:hover td {
    filter: brightness(0.97);
  }
  tr.expired td {
    opacity: 0.4;
  }
  tr.expired .quote-num {
    text-decoration: line-through;
  }
  .star {
    color: var(--warn);
    margin-left: 4px;
  }
  .pending-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--ink-3);
    animation: rfq-pulse 1.2s ease-in-out infinite;
    margin-right: 6px;
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
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    background: var(--surface-2);
    border-radius: var(--r-sm);
    font-size: 11px;
    font-weight: 500;
    color: var(--ink-2);
  }
  .tag.pos { background: var(--pos-soft); color: var(--pos); }
  .tag.neg { background: var(--neg-soft); color: var(--neg); }

  .row-action {
    position: relative;
    display: inline-block;
  }
  .dots {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 0;
    background: transparent;
    color: var(--ink-3);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
  }
  .dots:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .menu {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 4px;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-md);
    min-width: 220px;
    padding: 6px;
    z-index: 50;
  }
  .menu button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 8px 10px;
    border: 0;
    background: transparent;
    cursor: pointer;
    font: inherit;
    font-size: 13px;
    color: var(--ink);
    border-radius: var(--r-sm);
  }
  .menu button:hover {
    background: var(--surface-2);
  }
</style>
