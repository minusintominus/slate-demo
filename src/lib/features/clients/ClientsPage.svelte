<script>
  import { Button, Page, PageHeader, Tag } from '../../components/ui/index.js';
  import AddClientModal from '$lib/components/app/AddClientModal.svelte';
  import { clientAum, clientAumSplit } from '../../domain/book.js';
  import { money, pct } from '../../domain/format.js';

  const fmtYtd = (n) => (n != null ? pct(100 * n, { dp: 1 }) : '—');

  let { clients = [], navigate = () => {} } = $props();

  let addClientOpen = $state(false);

  const sorted = $derived([...clients].sort((a, b) => clientAum(b) - clientAum(a)));
</script>

<Page>
  <PageHeader>
    <div>
      <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">Book roster</div>
      <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Clients</h1>
      <p class="text-ink2 mt-2 max-w-[680px]">AUM, health, review cadence, and advisory economics across the households in Christine's book.</p>
    </div>
    <Button variant="primary" onclick={() => (addClientOpen = true)}>+ Add client</Button>
  </PageHeader>

  <div class="book-card">
    <table class="book-table">
      <thead>
        <tr class="group-row">
          <th rowspan="2" class="anchor">Client</th>
          <th rowspan="2" class="anchor type-col">Type</th>
          <th rowspan="2" class="anchor num total-col">Total AUM</th>
          <th colspan="5" class="g-adv g-adv-start group-h">Advisory</th>
          <th colspan="3" class="g-na g-na-start g-na-end group-h">Non-Advisory</th>
          <th rowspan="2" class="anchor review-col">Review</th>
        </tr>
        <tr>
          <th class="num g-adv g-adv-start">AUM</th>
          <th class="num g-adv">YTD</th>
          <th class="g-adv">Drift</th>
          <th class="g-adv">Benchmark</th>
          <th class="g-adv">Fee</th>
          <th class="num g-na g-na-start">AUM</th>
          <th class="num g-na">YTD</th>
          <th class="g-na g-na-end">Fee</th>
        </tr>
      </thead>
      <tbody>
        {#each sorted as row (row.id)}
          {@const split = clientAumSplit(row)}
          {@const isPendingCustom = row.isCustom && !row.portfolioIngested}
          {@const hasData = !isPendingCustom && (row.demoFull || row.portfolioIngested || (row.aum || 0) > 0)}
          <tr class="clickable" onclick={() => navigate(`clients/${row.id}/portfolio`)}>
            <td>
              <div class="client-name">{row.name}{#if isPendingCustom}<span class="awaiting">· Awaiting import</span>{/if}</div>
              <div class="custodians">{row.custodians || row.custodian || '—'}</div>
            </td>
            <td class="type-col"><Tag>{row.familyType}</Tag></td>
            <td class="num total-col">{hasData ? money(split.advisory + split.nonAdvisory, { compact: true }) : '—'}</td>
            <td class="num g-adv g-adv-start">{hasData ? money(split.advisory, { compact: true }) : '—'}</td>
            <td class="num g-adv pos">{hasData ? fmtYtd(row.ytdAdvisoryPct) : '—'}</td>
            <td class="g-adv text-3">{row.driftLabel || '—'}</td>
            <td class="g-adv text-3 benchmark">{row.benchmark || '—'}</td>
            <td class="g-adv text-3 fee">
              {#if row.feeAdvisory && row.feeAdvisory.length}
                {#each row.feeAdvisory as line, i}
                  {#if i > 0}<span class="sep">;</span><br/>{/if}{line}
                {/each}
              {:else}
                <span class="text-3">—</span>
              {/if}
            </td>
            <td class="num g-na g-na-start">
              {#if hasData && split.nonAdvisory > 0}
                {money(split.nonAdvisory, { compact: true })}
              {:else}
                <span class="text-3">—</span>
              {/if}
            </td>
            <td class="num g-na pos">
              {#if hasData && row.ytdNonAdvisoryPct != null}
                {fmtYtd(row.ytdNonAdvisoryPct)}
              {:else}
                <span class="text-3">—</span>
              {/if}
            </td>
            <td class="g-na g-na-end text-3 fee">
              {#if row.feeNonAdvisory && row.feeNonAdvisory.length}
                {#each row.feeNonAdvisory as line, i}
                  {#if i > 0}<span class="sep">;</span><br/>{/if}{line}
                {/each}
              {:else}
                <span class="text-3">—</span>
              {/if}
            </td>
            <td class="review-col">
              <Tag tone={row.reviewTone === 'urgent' || row.reviewTone === 'neg' ? 'neg' : row.reviewTone === 'warn' ? 'warn' : 'default'}>
                {row.reviewInDays == null ? '—' : row.reviewInDays < 0 ? 'Overdue' : `${row.reviewInDays}d`}
              </Tag>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</Page>

{#if addClientOpen}
  <AddClientModal onClose={() => (addClientOpen = false)} />
{/if}

<style>
  /* ── Grouped book table ──────────────────────────────────────────── */
  .book-card {
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-lg);
    overflow-x: auto;
  }
  .book-table {
    width: 100%;
    min-width: 760px;
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
  .book-table thead th.group-h {
    text-align: center;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--ink-2);
    border-bottom: 1px solid var(--rule-2);
  }
  .book-table thead .group-row th.anchor {
    border-bottom: 1px solid var(--rule-2);
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
  .book-table tbody tr:last-child td {
    border-bottom: 0;
  }
  .book-table tbody tr.clickable {
    cursor: pointer;
  }
  .book-table tbody tr:hover td {
    background: var(--surface-2) !important;
  }

  .client-name {
    font-weight: 600;
  }
  .custodians {
    color: var(--ink-3);
    font-size: 11px;
    margin-top: 2px;
  }
  .awaiting {
    color: var(--ink-3);
    font-size: 11px;
    margin-left: 8px;
    font-weight: 400;
  }

  /* Column-group tints + dividers */
  .g-adv {
    background: color-mix(in oklch, var(--accent) 6%, var(--surface));
  }
  .g-na {
    background: color-mix(in oklch, var(--ink) 4%, var(--surface));
  }
  .g-adv-start {
    border-left: 2px solid color-mix(in oklch, var(--accent) 30%, var(--rule-2)) !important;
  }
  .g-na-start {
    border-left: 2px solid var(--rule-2) !important;
  }
  .g-na-end {
    border-right: 2px solid var(--rule-2) !important;
  }

  .review-col {
    padding-left: 24px;
  }
  .book-table thead .type-col,
  .book-table tbody .type-col {
    padding-left: 4px;
    padding-right: 4px;
  }
  .book-table thead .total-col,
  .book-table tbody .total-col {
    padding-right: 24px;
  }
  .pos {
    color: var(--pos);
  }
  .text-3 {
    color: var(--ink-3);
    font-size: 12px;
  }
  .fee {
    white-space: nowrap;
    line-height: 1.45;
  }
  .benchmark {
    font-family: var(--font-mono);
    font-feature-settings: 'tnum' on;
    white-space: nowrap;
  }
  .sep {
    color: var(--ink-4);
  }
</style>
