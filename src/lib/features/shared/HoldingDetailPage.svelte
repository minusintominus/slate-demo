<script>
  import { Button, Card, Kpi, KpiStrip, Page, PageHeader, Section, Tag } from '../../components/ui/index.js';
  import { ACCOUNTS, POSITIONS } from '../../data/fixtures.js';
  import { money, pct } from '../../domain/format.js';

  let { symbol = '', backPath = 'portfolio?holdings', navigate = () => {} } = $props();

  const holding = $derived(POSITIONS.find((position) => position.symbol === symbol) || null);
  const total = $derived(POSITIONS.reduce((acc, position) => acc + position.mv, 0));
  const gain = $derived(holding ? holding.mv - holding.cost : 0);
</script>

<Page>
  <Button variant="ghost" size="sm" class="mb-4" onclick={() => navigate(backPath)}>← Back</Button>
  {#if holding}
    <PageHeader>
      <div>
        <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{holding.sector} · {holding.cusip}</div>
        <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">{holding.symbol} · {holding.name}</h1>
        <p class="text-ink2 mt-2 max-w-[680px]">{ACCOUNTS.find((account) => account.id === holding.account)?.name} · {holding.assetClass.replace('_', ' ')}</p>
      </div>
      {#if holding.flag}<Tag tone="warn">{holding.flag}</Tag>{/if}
    </PageHeader>
    <KpiStrip>
      <Kpi label="Market value" value={money(holding.mv, { compact: true })} />
      <Kpi label="Portfolio weight" value={`${((holding.mv / total) * 100).toFixed(1)}%`} />
      <Kpi label="Cost basis" value={money(holding.cost, { compact: true })} />
      <Kpi label="Unrealized" value={money(gain, { compact: true })} valueClass={gain >= 0 ? 'text-pos' : 'text-neg'} />
    </KpiStrip>
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6">
      <Card class="p-6">
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 text-2xl">Position detail</h2>
        <div class="flex flex-col space-y-2 mt-4">
          <div class="flex justify-between"><span>Quantity</span><span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{holding.qty?.toLocaleString?.() || '-'}</span></div>
          <div class="flex justify-between"><span>Price</span><span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{holding.price ? money(holding.price, { dp: 2 }) : '-'}</span></div>
          <div class="flex justify-between"><span>Return on cost</span><span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{pct((gain / holding.cost) * 100)}</span></div>
        </div>
      </Card>
      <Card class="p-6">
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] m-0 text-2xl">Planning lens</h2>
        <p class="text-ink2 mt-2">Use the holding view to decide whether the position belongs in tax-aware trimming, income replacement, or IPS rebalancing work.</p>
      </Card>
    </Section>
  {:else}
    <PageHeader><h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Holding not found</h1></PageHeader>
  {/if}
</Page>
