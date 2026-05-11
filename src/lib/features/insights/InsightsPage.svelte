<script>
  import { Button, Card, Divider, Kpi, KpiStrip, Page, PageHeader, Section, Tag } from '../../components/ui/index.js';
  import { ALL_INSIGHTS, CLIENT_BOOK, INSIGHTS_BY_CLIENT } from '../../data/fixtures.js';
  import { money } from '../../domain/format.js';
  import { Icons } from '../../components/ui/icons.js';

  let { navigate = () => {}, detailId = null, clientId = null } = $props();

  const clientNameOf = (id) => (CLIENT_BOOK.find((c) => c.id === id) || {}).name || id;

  // In-page filter for the book-level view. Selecting from the picker sets
  // this; the URL stays at /workspace/insights.
  let filterClientId = $state(null);

  const insight = $derived(detailId ? ALL_INSIGHTS.find((item) => item.id === detailId) : null);
  const backPath = $derived(clientId ? `clients/${clientId}/insights` : 'insights');
  // Effective client for content: URL-bound clientId wins, then in-page filter.
  const effectiveClientId = $derived(clientId || filterClientId);
  const activeClient = $derived(effectiveClientId ? CLIENT_BOOK.find((c) => c.id === effectiveClientId) : null);
  // Client-scoped → only that client's insights. Book-level → all insights
  // across the book, each card tagged with which client it's for.
  const insightList = $derived(effectiveClientId ? INSIGHTS_BY_CLIENT[effectiveClientId] || [] : ALL_INSIGHTS);
  const eyebrow = $derived(activeClient ? `${activeClient.name} · review prep` : 'Book-wide signals');
  const lede = $derived(
    activeClient
      ? 'Portfolio facts and relationship actions that are useful for the next conversation.'
      : "Cross-household signals — drift, tax, cash drag, and Investment Policy Statement breaches across Christine's book."
  );

  // ── Client picker (typeable, mirrors topbar search) ─────────────────
  let pickerQuery = $state('');
  let pickerOpen = $state(false);
  let pickerEl = $state();

  const matches = $derived.by(() => {
    const q = pickerQuery.trim().toLowerCase();
    const list = CLIENT_BOOK;
    if (!q) return list;
    return list.filter((c) =>
      `${c.name} ${c.familyType || ''} ${c.custodians || ''}`.toLowerCase().includes(q)
    );
  });

  $effect(() => {
    const close = (e) => {
      if (pickerEl && !pickerEl.contains(e.target)) pickerOpen = false;
    };
    document.addEventListener('mousedown', close, true);
    return () => document.removeEventListener('mousedown', close, true);
  });

  const pickClient = (id) => {
    pickerQuery = '';
    pickerOpen = false;
    filterClientId = id;
  };

  const clearFilter = () => {
    filterClientId = null;
  };

  const onPickerKey = (e) => {
    if (e.key === 'Escape') {
      pickerQuery = '';
      pickerOpen = false;
      e.currentTarget.blur();
    } else if (e.key === 'Enter' && matches.length > 0) {
      e.preventDefault();
      pickClient(matches[0].id);
    }
  };
</script>

{#if insight}
  <Page>
    <Button variant="ghost" size="sm" class="mb-4" onclick={() => navigate(backPath)}>← All insights</Button>
    <PageHeader>
      <div>
        <Tag tone={insight.priority === 'high' ? 'neg' : 'warn'}>{insight.kind} · priority {insight.priority}</Tag>
        <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-3">{insight.title}</h1>
        <p class="text-ink2 mt-2 max-w-[720px]">{insight.body}</p>
      </div>
    </PageHeader>

    <KpiStrip>
      {#if insight.impact.reposition}<Kpi label="Repositioned" value={money(insight.impact.reposition, { compact: true })} />{/if}
      {#if insight.impact.taxSaved}<Kpi label="Tax saved" value={money(insight.impact.taxSaved, { compact: true })} valueClass="text-pos" />{/if}
      {#if insight.impact.incomeLift}<Kpi label="Income lift" value={`${money(insight.impact.incomeLift, { compact: true })}/yr`} valueClass="text-pos" />{/if}
      <Kpi label="Confidence" value="High" />
    </KpiStrip>

    <Section>
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Recommended actions</h2>
      <div class="flex flex-col space-y-3.5 mt-3">
        {#each insight.actions as action, index}
          <Card class="flex items-start gap-4 p-4">
            <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] min-w-8 text-xl text-ink3">0{index + 1}</div>
            <div class="flex-1">{action}</div>
            <Button size="sm">Add to plan</Button>
          </Card>
        {/each}
      </div>
    </Section>

    <div class="action-bar">
      <Button variant="ghost">Draft client memo</Button>
      <Button variant="primary">Add to proposal {@html Icons.arrow}</Button>
    </div>
  </Page>
{:else}
  <Page>
    <PageHeader>
      <div>
        <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{eyebrow}</div>
        <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">AI Insights</h1>
        <p class="text-ink2 mt-2 max-w-[680px]">{lede}</p>
      </div>
      {#if clientId}
        <!-- URL-scoped client view: contextual review tag, no picker. -->
        {#if activeClient && activeClient.reviewInDays != null}
          <Tag tone={activeClient.reviewTone === 'urgent' || activeClient.reviewTone === 'neg' ? 'neg' : activeClient.reviewTone === 'warn' ? 'warn' : 'default'}>
            {activeClient.reviewInDays < 0 ? 'Review overdue' : `Review in ${activeClient.reviewInDays}d`}
          </Tag>
        {/if}
      {:else if filterClientId}
        <!-- Book-level page filtered to one client. Show as removable chip. -->
        <button type="button" class="filter-chip" onclick={clearFilter} aria-label="Clear client filter">
          <span>{clientNameOf(filterClientId)}</span>
          <span class="filter-chip-x">×</span>
        </button>
      {:else}
        <!-- Book-level page, no filter: show typeable picker. -->
        <div class="client-picker" bind:this={pickerEl}>
          {@html Icons.search}
          <input
            type="text"
            placeholder="Filter by client…"
            bind:value={pickerQuery}
            onfocus={() => (pickerOpen = true)}
            onkeydown={onPickerKey}
          />
          {#if pickerOpen}
            <div class="picker-results">
              {#if matches.length === 0}
                <div class="picker-empty">No matches for &ldquo;{pickerQuery}&rdquo;</div>
              {:else}
                {#each matches as c (c.id)}
                  <button type="button" class="picker-result" onclick={() => pickClient(c.id)}>
                    <span class="picker-result-title">{c.name}</span>
                    <span class="picker-result-sub">{c.familyType || ''}{c.custodians ? ' · ' + c.custodians : ''}</span>
                  </button>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </PageHeader>

    <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
      {#each insightList as item (item.id)}
        <article
          class="flex flex-col gap-3 rounded-[var(--r-md)] border border-t-[3px] border-[var(--rule)] bg-surface p-[22px] transition hover:border-ink3 hover:shadow-[var(--shadow-md)] max-md:p-4"
          style:border-top-color={item.priority === 'high' ? 'var(--neg)' : item.priority === 'medium' ? 'var(--warn)' : 'var(--ink-3)'}
        >
          <div class="flex justify-between">
            <Tag tone={item.priority === 'high' ? 'neg' : 'warn'}>{item.kind}</Tag>
            <span class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">priority · {item.priority}</span>
          </div>
          {#if !clientId && !filterClientId && item.clientId}
            <button type="button" class="client-pill"
              onclick={() => pickClient(item.clientId)}>
              {clientNameOf(item.clientId)}
            </button>
          {/if}
          <h3 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-3 text-xl">{item.title}</h3>
          <p class="text-ink2 text-sm">{item.body}</p>
          <Divider dashed class="my-4"  />
          <div class="flex gap-4">
            {#if item.impact.reposition}<div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Reposition</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{money(item.impact.reposition, { compact: true })}</div></div>{/if}
            {#if item.impact.taxSaved}<div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Tax saved</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-pos">{money(item.impact.taxSaved, { compact: true })}</div></div>{/if}
            {#if item.impact.incomeLift}<div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Income lift</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-pos">{money(item.impact.incomeLift, { compact: true })}/yr</div></div>{/if}
          </div>
          <Button size="sm" class="mt-4" onclick={() => navigate(clientId ? `clients/${clientId}/insights/${item.id}` : `clients/${item.clientId}/insights/${item.id}`)}>Open thread</Button>
        </article>
      {/each}
    </div>
  </Page>
{/if}

<style>
  .filter-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: color-mix(in oklch, var(--accent) 14%, var(--surface));
    color: var(--accent);
    border: 0;
    border-radius: var(--r-md);
    padding: 7px 8px 7px 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background .12s;
  }
  .filter-chip:hover {
    background: color-mix(in oklch, var(--accent) 22%, var(--surface));
  }
  .filter-chip-x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 14px;
    line-height: 1;
    opacity: 0.7;
  }
  .filter-chip:hover .filter-chip-x {
    opacity: 1;
  }

  .client-pill {
    align-self: flex-start;
    background: var(--surface-2);
    border: 1px solid var(--rule-2);
    color: var(--ink-2);
    font-size: 11px;
    font-weight: 500;
    padding: 3px 9px;
    border-radius: 99px;
    cursor: pointer;
    transition: background .12s, color .12s, border-color .12s;
  }
  .client-pill:hover {
    background: var(--accent-soft);
    color: var(--accent);
    border-color: var(--accent-soft);
  }

  .client-picker {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface-2);
    border: 1px solid var(--rule);
    border-radius: var(--r-md);
    padding: 6px 10px;
    color: var(--ink-3);
    font-size: 13px;
    width: 240px;
    transition: border-color .12s, background .12s, box-shadow .12s;
  }
  .client-picker:hover {
    background: var(--surface);
    border-color: var(--rule-2);
  }
  .client-picker:focus-within {
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .client-picker input {
    border: 0;
    background: transparent;
    color: var(--ink);
    outline: none;
    flex: 1;
    font: inherit;
    min-width: 0;
  }

  .picker-results {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-md);
    max-height: 320px;
    overflow-y: auto;
    z-index: 20;
    padding: 6px;
  }
  .picker-empty {
    padding: 16px 12px;
    font-size: 13px;
    color: var(--ink-3);
    text-align: center;
  }
  .picker-result {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    background: transparent;
    border-radius: var(--r-sm);
    cursor: pointer;
    text-align: left;
    color: inherit;
    font-family: inherit;
  }
  .picker-result:hover {
    background: var(--surface-2);
  }
  .picker-result-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
  }
  .picker-result-sub {
    font-size: 11px;
    color: var(--ink-3);
    line-height: 1.3;
  }

  .action-bar {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    border-top: 1px solid var(--rule);
    background: color-mix(in oklch, var(--surface) 92%, transparent);
    padding: 14px 28px;
    backdrop-filter: blur(8px);
  }

  @media (max-width: 1024px) {
    .action-bar {
      padding: 14px 20px;
    }
  }

  @media (max-width: 768px) {
    .action-bar {
      gap: 8px;
      flex-wrap: wrap;
      padding: 10px 14px;
    }

    .action-bar :global(.button) {
      min-height: 38px;
      padding: 9px 12px;
      font-size: 12px;
    }
  }
</style>
