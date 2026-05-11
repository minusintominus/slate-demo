<script>
  import { Button, Card, Tag } from '../../components/ui/index.js';
  import { ALT_DEALS, ALT_THESES } from '../../data/fixtures.js';
  import { money } from '../../domain/format.js';

  // Thesis filter — defaults to all keys on, click a chip to toggle.
  let activeTheses = $state(ALT_THESES.map((t) => t.key));
  const toggleThesis = (key) => {
    activeTheses = activeTheses.includes(key)
      ? activeTheses.filter((k) => k !== key)
      : [...activeTheses, key];
  };
  const filteredDeals = $derived(ALT_DEALS.filter((d) => activeTheses.includes(d.thesisKey)));
</script>

<div class="mb-4">
  <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3 mb-2">Active theses · click to toggle</div>
  <div class="chips">
    {#each ALT_THESES as thesis (thesis.key)}
      {@const on = activeTheses.includes(thesis.key)}
      <button type="button" class="thesis-tag" class:on
        onclick={() => toggleThesis(thesis.key)}>
        {#if on}<span class="tick">✓</span>{/if}
        {thesis.label}
      </button>
    {/each}
  </div>
</div>

{#if filteredDeals.length === 0}
  <Card class="p-8 text-center">
    <p class="text-ink2">No deals match the active theses. Toggle more chips above.</p>
  </Card>
{:else}
  <div class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6">
    {#each filteredDeals as deal (deal.id)}
      <Card as="article" class="p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{deal.sponsor}</div>
            <h3 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-1 text-2xl">{deal.name}</h3>
            <div class="text-ink3 text-xs">{deal.strategy} · vintage {deal.vintage}</div>
          </div>
          <div class="text-right">
            <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Fit Score</div>
            <div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em] text-3xl text-pos">{deal.fitScore}</div>
          </div>
        </div>
        <p class="margin-note mt-4 text-sm">{deal.why}</p>
        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:gap-4 xl:grid-cols-4 mt-5 gap-3">
          <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Target IRR</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{deal.target}</div></div>
          <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Term</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{deal.term}</div></div>
          <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Min</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{money(deal.minimum, { compact: true })}</div></div>
          <div><div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Mgmt/carry</div><div class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{deal.mgmt}% / {deal.carry}%</div></div>
        </div>
        <div class="deal-meta">
          <div class="deal-meta-left">
            <Tag tone={deal.status === 'Limited' ? 'warn' : 'default'}>{deal.status}</Tag>
            {#if deal.closeDate}<span>Closes {deal.closeDate}</span>{/if}
            {#if deal.commitments}<span>·</span><span>{deal.commitments}</span>{/if}
            {#if deal.gpCommit}<span>·</span><span>GP commit {deal.gpCommit}</span>{/if}
            {#if deal.coInvest}<span class="co-invest-tag">co-invest</span>{/if}
          </div>
          <Button size="sm">Pitch to client</Button>
        </div>
      </Card>
    {/each}
  </div>
{/if}

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .thesis-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 99px;
    border: 1px solid var(--rule-2);
    color: var(--ink-2);
    background: var(--surface);
    font: inherit;
    font-size: 11.5px;
    cursor: pointer;
    transition: all .12s;
    user-select: none;
  }
  .thesis-tag:hover {
    border-color: var(--ink-3);
  }
  .thesis-tag .tick {
    display: inline-block;
    font-weight: 600;
    margin-right: 1px;
  }
  .thesis-tag.on {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .deal-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    border-top: 1px dashed var(--rule-2);
    padding-top: 12px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  .deal-meta-left {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    font-size: 11.5px;
    color: var(--ink-3);
  }
  .co-invest-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border: 1px solid var(--accent);
    color: var(--accent);
    border-radius: var(--r-sm);
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: lowercase;
  }

  .margin-note {
    border-left: 2px solid var(--accent);
    padding: 6px 0 6px 14px;
    background: linear-gradient(to right, var(--accent-soft) 0, transparent 60%);
  }
</style>
