<script>
  import { Bar, Button, Card, DataTable, Divider, Kpi, KpiStrip, Page, PageHeader, Section, Tabs, Tag } from '../../components/ui/index.js';
  import {
    ACCOUNTS,
    ALT_CASHFLOW,
    ALT_DEALS,
    HOUSEHOLD,
    HOUSEHOLD_BRIEFING,
    INSIGHTS_BY_CLIENT,
    POSITIONS,
    STATEMENTS
  } from '../../data/fixtures.js';
  import HouseholdPage from '../household/HouseholdPage.svelte';
  import { accountsFor, clientAum, clientAumSplit, feeLines, positionsFor, workspaceTabs } from '../../domain/book.js';
  import { money, pct, sum, titleCase, dateShort } from '../../domain/format.js';
  import { Icons } from '../../components/ui/icons.js';

  let { client = null, tab = 'portfolio', accountIds = [], navigate = () => {} } = $props();

  // Custom clients (added via the Add client flow) start without positions
  // until statements are ingested. Anyone with seeded per-client fixtures
  // gets the full workspace.
  const allPositions = $derived(client?.id ? positionsFor(client.id) : POSITIONS);
  const isDemo = $derived(allPositions.length > 0 && !(client?.isCustom && !client?.portfolioIngested));
  const positions = $derived(isDemo && accountIds.length
    ? allPositions.filter((position) => accountIds.includes(position.account))
    : isDemo
      ? allPositions
      : []);
  const total = $derived(positions.length ? sum(positions, (p) => p.mv) : clientAum(client));
  const split = $derived(clientAumSplit(client));
  const fees = $derived(feeLines(client));
  const byAsset = $derived(Object.entries(
    positions.reduce((acc, position) => {
      acc[position.assetClass] = (acc[position.assetClass] || 0) + position.mv;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]));
  const topHoldings = $derived([...positions].sort((a, b) => b.mv - a.mv).slice(0, 10));
  const clientName = $derived(client?.name || 'Client');
  let refreshMode = $state('merge');

  const openHolding = (symbol) => navigate(`clients/${client.id}/holding/${encodeURIComponent(symbol)}`);

  // HouseholdPage emits portfolio-relative paths ('portfolio/SYMBOL') that
  // make sense in meet mode but need remapping to /workspace/clients/<id>/…
  // when embedded here.
  const householdNavigate = (path) => {
    if (path.startsWith('portfolio/')) {
      return navigate(`clients/${client.id}/holding/${path.slice('portfolio/'.length)}`);
    }
    return navigate(path);
  };
</script>

<Page>
  <PageHeader>
    <div>
      <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">Client workspace · {client?.familyType || 'Household'}</div>
      <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">{clientName}</h1>
      <p class="text-ink2 mt-2 max-w-[720px]">
        {#if isDemo}
          {@const custodianList = (client?.custodians || client?.custodian || '').split('·').map((s) => s.trim()).filter(Boolean)}
          {@const parts = [
            `${client?.acctCount || 0} accounts`,
            custodianList.length ? `${custodianList.length} custodian${custodianList.length === 1 ? '' : 's'}` : null,
            ...custodianList
          ].filter(Boolean)}
          {parts.join(' · ')}
        {:else}
          Workspace shell ready for statement intake and portfolio review.
        {/if}
      </p>
    </div>
    <Button variant="primary" onclick={() => navigate(`/meet/${client.id}/import-statements`)}>{@html Icons.upload} Import statements</Button>
  </PageHeader>

  <Tabs tabs={workspaceTabs} selected={tab} onSelect={(id) => navigate(`clients/${client.id}/${id}`)} />

  {#if tab === 'portfolio'}
    {#if !isDemo}
      <Card class="p-7">
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 text-2xl">Portfolio not imported yet</h2>
        <p class="text-ink2 mt-2 max-w-[620px]">Import a statement package to populate holdings, accounts, insights, and exception review.</p>
        <Button variant="primary" class="mt-5" onclick={() => navigate(`/meet/${client.id}/import-statements`)}>{@html Icons.upload} Import statements</Button>
      </Card>
    {:else}
      <HouseholdPage embedded {client} {accountIds} navigate={householdNavigate} />
    {/if}
  {:else if tab === 'insights'}
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
      {#each INSIGHTS_BY_CLIENT[client?.id] || [] as insight (insight.id)}
        <article
          class="flex flex-col gap-3 rounded-[var(--r-md)] border border-t-[3px] border-[var(--rule)] bg-surface p-[22px] transition hover:border-ink3 hover:shadow-[var(--shadow-md)] max-md:p-4"
          style:border-top-color={insight.priority === 'high' ? 'var(--neg)' : insight.priority === 'medium' ? 'var(--warn)' : 'var(--ink-3)'}
        >
          <div class="flex justify-between">
            <Tag tone={insight.priority === 'high' ? 'neg' : 'warn'}>{insight.kind}</Tag>
            <span class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">priority · {insight.priority}</span>
          </div>
          <h3 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-3 text-xl">{insight.title}</h3>
          <p class="text-ink2 text-sm">{insight.body}</p>
          <Divider dashed class="my-4"  />
          <div class="flex gap-4">
            {#if insight.impact.reposition}
              <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Reposition</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{money(insight.impact.reposition, { compact: true })}</div></div>
            {/if}
            {#if insight.impact.taxSaved}
              <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Tax saved</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-pos">{money(insight.impact.taxSaved, { compact: true })}</div></div>
            {/if}
            {#if insight.impact.incomeLift}
              <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Income lift</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-pos">{money(insight.impact.incomeLift, { compact: true })}/yr</div></div>
            {/if}
          </div>
          <Button size="sm" class="mt-4" onclick={() => navigate(`clients/${client.id}/insights/${insight.id}`)}>Open thread</Button>
        </article>
      {/each}
    </Section>
  {:else if tab === 'events'}
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6">
      <div>
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Upcoming events</h2>
        <Card class="mt-3 p-0">
          {#each HOUSEHOLD_BRIEFING.upcoming as event}
            <div class="flex gap-3 border-b border-[var(--rule)] p-4">
              <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] w-20 text-xs text-ink3">{dateShort(event.date)}</span>
              <Tag tone={event.priority === 'high' ? 'warn' : 'default'}>{event.kind}</Tag>
              <span class="flex-1">{event.label}</span>
            </div>
          {/each}
        </Card>
      </div>
      <Card class="p-6">
        <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Next meeting</div>
        <div class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-1 text-2xl font-semibold">{HOUSEHOLD_BRIEFING.nextMeeting.type}</div>
        <div class="text-ink3 mt-2">{HOUSEHOLD_BRIEFING.nextMeeting.date} · {HOUSEHOLD_BRIEFING.nextMeeting.time}</div>
        <Divider dashed class="my-4"  />
        <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Agenda</div>
        <ul class="mt-2 space-y-2 pl-4">
          {#each HOUSEHOLD_BRIEFING.nextMeeting.agenda as item}<li>{item}</li>{/each}
        </ul>
      </Card>
    </Section>
  {:else if tab === 'documents'}
    <div class="mt-2">
      <p class="text-ink2 text-[13px] mb-3">
        Statements on file for {clientName}. Upload more from <strong>Refresh data</strong> or add a client.
      </p>
      <DataTable>
        <thead>
          <tr>
            <th>File</th>
            <th>Custodian</th>
            <th>Account</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Pages</th>
            <th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Statement date</th>
          </tr>
        </thead>
        <tbody>
          {#each STATEMENTS as statement (statement.id)}
            {@const acct = ACCOUNTS.find((a) => a.id === statement.account)}
            <tr>
              <td class="font-[var(--font-mono)] text-xs">{statement.file}</td>
              <td>{acct ? acct.custodian : '—'}</td>
              <td>{acct ? acct.name : '—'}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{statement.pages}</td>
              <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{statement.date ? dateShort(statement.date) : '—'}</td>
            </tr>
          {/each}
        </tbody>
      </DataTable>
      <Button variant="ghost" size="sm" class="mt-4" onclick={() => navigate(`clients/${client.id}/refresh`)}>
        Upload additional statements →
      </Button>
    </div>
  {:else if tab === 'status'}
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
      <Card class="p-6"><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Data completeness</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] mt-1 text-4xl">94%</div><p class="text-ink3 text-xs">Statements reconciled across four custodians.</p></Card>
      <Card class="p-6"><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Relationship cadence</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] mt-1 text-4xl">{client?.reviewInDays ?? 0}d</div><p class="text-ink3 text-xs">Next planned portfolio conversation.</p></Card>
      <Card class="p-6"><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Portfolio drift</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] mt-1 text-4xl">{client?.driftLabel || 'OK'}</div><p class="text-ink3 text-xs">Relative to current household target.</p></Card>
    </Section>
  {:else}
    <Card class="refresh-card p-6">
      <h3 class="refresh-title">Refresh from statements</h3>
      <p class="refresh-lede">Upload new PDFs to extend positions and tax lots, or run a clean refresh (rebuild from scratch — demo only).</p>
      <div class="refresh-options">
        <label class="refresh-option">
          <input type="radio" name="ingest" value="merge" bind:group={refreshMode} />
          <span><strong>Merge / append</strong> — add new periods and reconcile with existing holdings.</span>
        </label>
        <label class="refresh-option">
          <input type="radio" name="ingest" value="clean" bind:group={refreshMode} />
          <span><strong>Clean refresh</strong> — replace modeled book from new uploads (confirmation in production).</span>
        </label>
      </div>
      <div class="refresh-actions">
        <Button variant="primary" onclick={() => navigate(`/meet/${client.id}/import-statements`)}>{@html Icons.upload} Upload statements…</Button>
        <Button variant="ghost" onclick={() => navigate(`clients/${client.id}/documents`)}>View documents</Button>
      </div>
    </Card>
  {/if}
</Page>

<style>
  :global(.refresh-card) {
    margin-top: 8px;
  }
  .refresh-title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    line-height: 1.25;
    margin: 0 0 12px;
    letter-spacing: -0.015em;
  }
  .refresh-lede {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-2);
    margin: 0;
    max-width: 56rem;
  }
  .refresh-options {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 18px;
  }
  .refresh-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink);
    margin: 0;
  }
  .refresh-option input[type="radio"] {
    margin: 5px 0 0;
    flex-shrink: 0;
    accent-color: var(--accent);
  }
  .refresh-option span {
    flex: 1 1 auto;
    min-width: 0;
  }
  .refresh-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
  }
</style>
