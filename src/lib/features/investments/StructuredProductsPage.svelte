<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Page, PageHeader } from '../../components/ui/index.js';
  import {
    PRODUCT_TYPES,
    SIMULATED_QUOTES,
    SOLVE_OPTIONS,
    computeIndicative,
    isActiveRfq,
    nextRfqId,
    seedRfqs
  } from './rfq/data.js';
  import RfqCardHeader from './rfq/RfqCardHeader.svelte';
  import RfqConfigurePhase from './rfq/RfqConfigurePhase.svelte';
  import RfqEmailModal from './rfq/RfqEmailModal.svelte';
  import RfqPayoffModal from './rfq/RfqPayoffModal.svelte';
  import RfqBookTab from './rfq/RfqBookTab.svelte';
  import RfqQuoteBoard from './rfq/RfqQuoteBoard.svelte';
  import RfqSendPhase from './rfq/RfqSendPhase.svelte';
  import RfqTemplatesTab from './rfq/RfqTemplatesTab.svelte';
  import RfqTermSheetModal from './rfq/RfqTermSheetModal.svelte';

  let { client = null } = $props();

  // Default to Book tab when scoped to a single client (most relevant
  // in-meeting view); book-level page defaults to New RFQ. Tab is
  // URL-driven via ?tab=… so refreshes / share-links preserve it.
  const TAB_IDS = ['new', 'templates', 'active', 'expired', 'book'];
  const defaultTab = $derived(client ? 'book' : 'new');
  const activeTab = $derived.by(() => {
    const q = page.url.searchParams.get('tab');
    return q && TAB_IDS.includes(q) ? q : defaultTab;
  });
  const setActiveTab = (id) => {
    const url = new URL(page.url);
    if (id === defaultTab) url.searchParams.delete('tab');
    else url.searchParams.set('tab', id);
    goto(url.pathname + url.search, { replaceState: false, keepFocus: true });
  };
  let now = $state(Date.now());

  // Phase 1 — Configure
  let productType = $state('autocall');
  let underlyings = $state(['SPX']);
  let notional = $state('5,000,000');
  let currency = $state('USD');
  let tenor = $state('3Y');
  let strike = $state(100);
  let coupBarrier = $state(70);
  let capBarrier = $state(60);
  let autocallBarrier = $state(100);
  let memory = $state(true);
  let observation = $state('quarterly');
  let protection = $state(95);
  let upsideCap = $state(140);
  let buffer = $state(15);
  let barrierObs = $state('european');
  let solveFor = $state('coupon');

  // Phase 2 — Send
  let selectedDesks = $state(['jpm', 'ms', 'gs', 'bnp', 'socgen']);
  let deadline = $state('1h');
  let notes = $state('');

  // RFQ book + modals
  let rfqs = $state(seedRfqs());
  let emailTarget = $state(null);
  let previewOpen = $state(false);
  let payoffRfqId = $state(null);

  // Single ticker drives every countdown / "Xm ago" / Active vs Expired split.
  $effect(() => {
    const t = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(t);
  });

  let indicative = $derived(
    computeIndicative({
      productType, tenor, strike, capBarrier, coupBarrier, autocallBarrier,
      memory, underlyings, barrierObs, protection, upsideCap, buffer
    })
  );

  // When product changes, snap solveFor to a valid option for that type.
  $effect(() => {
    const valid = SOLVE_OPTIONS[productType] || [];
    if (!valid.find(([id]) => id === solveFor)) solveFor = valid[0][0];
  });

  let activeRfqs = $derived(rfqs.filter((r) => isActiveRfq(r, now)));
  let expiredRfqs = $derived(rfqs.filter((r) => !isActiveRfq(r, now)));
  let emailRfq = $derived(emailTarget ? rfqs.find((r) => r.id === emailTarget.rfqId) : null);
  let payoffRfq = $derived(payoffRfqId ? rfqs.find((r) => r.id === payoffRfqId) : null);

  let productLabel = $derived((PRODUCT_TYPES.find((t) => t.id === productType) || {}).label || productType);

  const sendRfq = () => {
    const sentAt = Date.now();
    const deadlineMins = deadline === '30m' ? 30 : deadline === '1h' ? 60 : 480;
    const newRfq = {
      id: nextRfqId(),
      sentAt,
      deadlineAt: sentAt + deadlineMins * 60 * 1000,
      config: {
        productLabel, productType,
        underlyings: [...underlyings],
        notional, currency, tenor,
        strike, coupBarrier, capBarrier, autocallBarrier, memory, observation,
        protection, upsideCap, buffer, barrierObs
      },
      quotes: selectedDesks.map((id) => ({
        deskId: id, status: 'pending',
        coupon: null, capBarrier: null, issuePrice: null,
        receivedAt: null, expiresAt: null, note: null
      }))
    };
    rfqs = [newRfq, ...rfqs];
    setActiveTab('active');
    SIMULATED_QUOTES.forEach((sim) => {
      if (!selectedDesks.includes(sim.desk)) return;
      setTimeout(() => {
        rfqs = rfqs.map((r) =>
          r.id !== newRfq.id
            ? r
            : {
                ...r,
                quotes: r.quotes.map((q) =>
                  q.deskId !== sim.desk
                    ? q
                    : {
                        ...q,
                        status: 'quoted',
                        coupon: sim.coupon,
                        capBarrier: sim.capBarrier,
                        issuePrice: sim.issuePrice,
                        receivedAt: Date.now(),
                        expiresAt: Date.now() + sim.validityMs,
                        note: sim.note
                      }
                )
              }
        );
      }, sim.delay);
    });
  };

  const tabSpec = [
    ['new', 'New RFQ'],
    ['templates', 'Templates'],
    ['active', 'Active RFQs'],
    ['expired', 'Expired'],
    ['book', 'Book']
  ];
  let counts = $derived({ active: activeRfqs.length, expired: expiredRfqs.length });

  // Pre-fill the New RFQ form from a template, then jump to the form.
  const applyTemplate = (t) => {
    const c = t.config;
    productType = c.productType;
    underlyings = [...c.underlyings];
    notional = c.notional;
    currency = c.currency;
    tenor = c.tenor;
    if (c.strike != null) strike = c.strike;
    if (c.coupBarrier != null) coupBarrier = c.coupBarrier;
    if (c.capBarrier != null) capBarrier = c.capBarrier;
    if (c.autocallBarrier != null) autocallBarrier = c.autocallBarrier;
    if (c.memory != null) memory = c.memory;
    if (c.observation != null) observation = c.observation;
    if (c.protection != null) protection = c.protection;
    if (c.upsideCap != null) upsideCap = c.upsideCap;
    if (c.buffer != null) buffer = c.buffer;
    if (c.barrierObs != null) barrierObs = c.barrierObs;
    if (c.solveFor != null) solveFor = c.solveFor;
    setActiveTab('new');
  };
</script>

<Page>
  <PageHeader>
    <div>
      <div class="eyebrow">{client ? `${client.name} · structured products` : 'Multi-issuer RFQ · LIVE'}</div>
      <h1>Structured Products</h1>
      <p class="text-2 mt-2">
        {client
          ? `${client.name}'s held structures alongside the live multi-issuer RFQ workflow.`
          : 'Slate displays quotes from multiple issuers in parallel, normalizes terms for an apples-to-apples comparison and tracks fill quantity.'}
      </p>
    </div>
  </PageHeader>

  <div class="tabs">
    {#each tabSpec as [id, label]}
      <button class={'tab' + (activeTab === id ? ' active' : '')} onclick={() => setActiveTab(id)}>
        {label}
        {#if (id === 'active' || id === 'expired') && counts[id] > 0}<span class="count">{counts[id]}</span>{/if}
      </button>
    {/each}
  </div>

  {#if activeTab === 'new'}
    <section class="card">
      <div class="phase-header">
        <span class="phase-num">PHASE 1</span>
        <span class="phase-title">Configure</span>
      </div>
      <RfqConfigurePhase
        bind:productType bind:underlyings bind:notional bind:currency bind:tenor
        bind:strike bind:coupBarrier bind:capBarrier bind:autocallBarrier
        bind:memory bind:observation bind:protection bind:upsideCap bind:buffer
        bind:barrierObs bind:solveFor
        {indicative}
      />
    </section>

    <section class="card mt-24">
      <div class="phase-header">
        <span class="phase-num">PHASE 2</span>
        <span class="phase-title">Send to desks</span>
      </div>
      <RfqSendPhase
        bind:selectedDesks bind:deadline bind:notes
        {sendRfq}
        onPreview={() => (previewOpen = true)}
        hasRfqs={rfqs.length > 0}
      />
    </section>
  {:else if activeTab === 'templates'}
    <RfqTemplatesTab onUseTemplate={applyTemplate} />
  {:else if activeTab === 'book'}
    <RfqBookTab clientId={client?.id} />
  {:else if activeTab === 'active'}
    {#if activeRfqs.length === 0}
      <div class="card empty">
        <h3>No active RFQs</h3>
        <p class="text-2 mt-2">RFQs appear here while desks respond or until the deadline passes.</p>
        <button type="button" class="btn primary mt-3" onclick={() => setActiveTab('new')}>+ New RFQ</button>
      </div>
    {:else}
      <div class="rfq-list">
        {#each [...activeRfqs].sort((a, b) => b.sentAt - a.sentAt) as rfq (rfq.id)}
          <section class="card">
            <RfqCardHeader {rfq} {now} isActive={true} />
            <RfqQuoteBoard {rfq} {now} isActive={true}
              setEmailTarget={(t) => (emailTarget = t)}
              onVisualize={() => (payoffRfqId = rfq.id)} />
          </section>
        {/each}
      </div>
    {/if}
  {:else if activeTab === 'expired'}
    {#if expiredRfqs.length === 0}
      <div class="card empty">
        <h3>No expired RFQs</h3>
        <p class="text-2 mt-2">Closed RFQs (expired deadline, no pending desks) appear here.</p>
      </div>
    {:else}
      <div class="rfq-list">
        {#each [...expiredRfqs].sort((a, b) => b.sentAt - a.sentAt) as rfq (rfq.id)}
          <section class="card">
            <RfqCardHeader {rfq} {now} isActive={false} />
            <RfqQuoteBoard {rfq} {now} isActive={false}
              setEmailTarget={(t) => (emailTarget = t)} />
          </section>
        {/each}
      </div>
    {/if}
  {/if}
</Page>

{#if emailTarget && emailRfq}
  <RfqEmailModal target={emailTarget} rfq={emailRfq} onClose={() => (emailTarget = null)} />
{/if}

{#if previewOpen}
  <RfqTermSheetModal
    config={{
      productType, underlyings, notional, currency, tenor,
      strike, coupBarrier, capBarrier, autocallBarrier,
      memory, observation, indicative,
      protection, upsideCap, buffer, barrierObs
    }}
    onClose={() => (previewOpen = false)}
  />
{/if}

{#if payoffRfq}
  <RfqPayoffModal rfq={payoffRfq} onClose={() => (payoffRfqId = null)} />
{/if}

<style>
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  h1 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 32px;
    line-height: 1.2;
    margin: 4px 0 0;
    letter-spacing: -0.015em;
  }
  .text-2 {
    color: var(--ink-2);
  }
  .mt-2 {
    margin-top: 8px;
  }
  .mt-3 {
    margin-top: 12px;
  }
  .mt-24 {
    margin-top: 24px;
  }

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
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    white-space: nowrap;
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

  .card {
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: var(--r-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
  }

  .phase-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .phase-num {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    color: var(--ink-3);
    letter-spacing: 0.08em;
  }
  .phase-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
  }

  .rfq-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .empty {
    padding: 56px 24px;
    text-align: center;
    color: var(--ink-3);
  }
  .empty h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 20px;
    margin: 0;
    color: var(--ink);
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
