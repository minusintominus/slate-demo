<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Page, PageHeader, Tag } from '../../components/ui/index.js';
  import {
    ALT_CLOSED_DEALS,
    ALT_SUBSCRIPTIONS,
    CLIENT_BOOK
  } from '../../data/fixtures.js';
  import { money } from '../../domain/format.js';
  import AltsDealFlow from './AltsDealFlow.svelte';

  const tabSpec = [
    ['flow', 'Deal flow'],
    ['closed', 'Closed'],
    ['book', 'Book']
  ];
  const DEFAULT_TAB = 'flow';
  // Tab is URL-driven via ?tab=… so refreshes / share-links preserve it.
  const activeTab = $derived.by(() => {
    const q = page.url.searchParams.get('tab');
    return q && tabSpec.some(([id]) => id === q) ? q : DEFAULT_TAB;
  });
  const setActiveTab = (id) => {
    const url = new URL(page.url);
    if (id === DEFAULT_TAB) url.searchParams.delete('tab');
    else url.searchParams.set('tab', id);
    goto(url.pathname + url.search, { replaceState: false, keepFocus: true });
  };
  const counts = {
    closed: ALT_CLOSED_DEALS.length,
    book: ALT_SUBSCRIPTIONS.length
  };

  const clientName = (id) =>
    (CLIENT_BOOK.find((c) => c.id === id) || {}).name || id;

  const sortedSubs = [...ALT_SUBSCRIPTIONS].sort(
    (a, b) => (a.committedDate < b.committedDate ? 1 : -1)
  );
  const sortedClosed = [...ALT_CLOSED_DEALS].sort(
    (a, b) => (a.closedDate < b.closedDate ? 1 : -1)
  );
  const totalCommitted = ALT_SUBSCRIPTIONS.reduce((a, s) => a + s.commitment, 0);
</script>

<Page>
  <PageHeader>
    <div>
      <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">Curated · matched to active theses</div>
      <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Alternative Investments</h1>
      <p class="text-ink2 mt-2 max-w-[680px]">Curated deal flow across active investment theses, closed funds, and the book of client subscriptions.</p>
    </div>
  </PageHeader>

  <div class="tabs">
    {#each tabSpec as [id, label]}
      <button class={'tab' + (activeTab === id ? ' active' : '')} onclick={() => setActiveTab(id)}>
        {label}
        {#if counts[id] > 0}<span class="count">{counts[id]}</span>{/if}
      </button>
    {/each}
  </div>

  {#if activeTab === 'flow'}
    <AltsDealFlow />
  {:else if activeTab === 'closed'}
    <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6">
      {#each sortedClosed as deal (deal.id)}
        <article class="closed-card">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{deal.sponsor}</div>
              <h3 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-1 text-2xl">{deal.name}</h3>
              <div class="text-ink3 text-xs">{deal.strategy} · vintage {deal.vintage}</div>
            </div>
            <Tag tone="default">Closed {deal.closedDate}</Tag>
          </div>
          <p class="outcome mt-4 text-sm">{deal.outcome}</p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-5">
            <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Final raise</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{deal.finalRaise}</div></div>
            <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Target IRR</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{deal.target}</div></div>
            <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Term</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{deal.term}</div></div>
            <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">DPI to date</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-pos">{deal.dpi}</div></div>
          </div>
        </article>
      {/each}
    </div>
  {:else if activeTab === 'book'}
    <div class="book-summary">
      <div>
        <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Total committed</div>
        <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-2xl">{money(totalCommitted, { compact: true })}</div>
      </div>
      <div>
        <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Subscriptions</div>
        <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-2xl">{ALT_SUBSCRIPTIONS.length}</div>
      </div>
      <div>
        <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Households</div>
        <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-2xl">{new Set(ALT_SUBSCRIPTIONS.map((s) => s.clientId)).size}</div>
      </div>
    </div>

    <div class="book-card">
      <table class="book-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Deal</th>
            <th>Strategy</th>
            <th class="num">Commitment</th>
            <th>Committed</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {#each sortedSubs as sub (sub.id)}
            <tr>
              <td class="client">{clientName(sub.clientId)}</td>
              <td>
                <div class="deal-name">{sub.dealName}</div>
                <div class="sponsor">{sub.sponsor}</div>
              </td>
              <td class="text-3">{sub.strategy}</td>
              <td class="num">{money(sub.commitment, { compact: true })}</td>
              <td class="text-3 mono">{sub.committedDate}</td>
              <td><Tag tone={sub.status.startsWith('Funded') ? 'pos' : 'default'}>{sub.status}</Tag></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</Page>

<style>
  .tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--rule-2);
    margin-bottom: 24px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x;
    overscroll-behavior-x: contain;
  }
  .tabs::-webkit-scrollbar {
    display: none;
  }
  .tab {
    padding: 10px 16px;
    border: 0;
    background: transparent;
    color: var(--ink-3);
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    flex-shrink: 0;
    white-space: nowrap;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: color 0.15s, border-color 0.15s;
  }
  .tab:hover {
    color: var(--ink);
  }
  .tab.active {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }
  .count {
    font-family: var(--font-mono);
    font-size: 11px;
    background: var(--surface-2);
    color: var(--ink-2);
    padding: 1px 7px;
    border-radius: 99px;
  }
  .tab.active .count {
    background: var(--ink);
    color: var(--surface);
  }

  .closed-card {
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-lg);
    padding: 24px;
  }
  .outcome {
    color: var(--ink-2);
    border-left: 2px solid var(--rule-2);
    padding: 4px 0 4px 14px;
  }

  .book-summary {
    display: flex;
    gap: 32px;
    flex-wrap: wrap;
    padding: 18px 22px;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-lg);
    margin-bottom: 16px;
  }

  .book-card {
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-lg);
    overflow-x: auto;
  }
  .book-table {
    width: 100%;
    min-width: 720px;
    border-collapse: collapse;
    font-size: 13px;
  }
  .book-table thead th {
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
  .book-table thead th.num {
    text-align: right;
  }
  .book-table tbody td {
    padding: 14px 12px;
    border-bottom: 1px solid var(--rule-2);
    vertical-align: middle;
  }
  .book-table tbody td.num {
    text-align: right;
    font-family: var(--font-mono);
    font-feature-settings: 'tnum' on;
  }
  .book-table tbody td.mono {
    font-family: var(--font-mono);
    font-feature-settings: 'tnum' on;
    font-size: 12px;
  }
  .book-table tbody tr:last-child td {
    border-bottom: 0;
  }
  .client {
    font-weight: 600;
  }
  .deal-name {
    font-weight: 500;
  }
  .sponsor {
    color: var(--ink-3);
    font-size: 11.5px;
    margin-top: 2px;
  }
  .text-3 {
    color: var(--ink-3);
    font-size: 12px;
  }
</style>
