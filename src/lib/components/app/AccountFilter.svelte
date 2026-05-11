<script>
  import { ACCOUNTS } from '$lib/data/fixtures.js';

  let { selectedAccts = [], setSelectedAccts = () => {} } = $props();

  const allSelected = $derived(selectedAccts.length === 0);

  const toggleAcct = (id) => {
    const next = selectedAccts.includes(id)
      ? selectedAccts.filter((item) => item !== id)
      : [...selectedAccts, id];
    setSelectedAccts(next);
  };
</script>

<div class="filterbar">
  <div class="filterbar-scroll">
    <button class:active={allSelected} class="filter-pill" onclick={() => setSelectedAccts([])}>All accounts</button>
    {#each ACCOUNTS as account}
      <button class:active={selectedAccts.includes(account.id)} class="filter-pill" onclick={() => toggleAcct(account.id)}>
        {account.name}
      </button>
    {/each}
  </div>
</div>

<style>
  .filterbar {
    border-bottom: 1px solid var(--rule);
    background: var(--surface);
    padding: 8px 28px;
  }

  .filterbar-scroll {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .filterbar-scroll::-webkit-scrollbar {
    display: none;
  }

  .filter-pill {
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    background: var(--surface);
    color: var(--ink-2);
    padding: 5px 10px;
    font-size: 12px;
    white-space: nowrap;
    cursor: pointer;
  }

  .filter-pill:hover,
  .filter-pill.active {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }

  @media (max-width: 768px) {
    .filterbar {
      padding: 8px 14px;
    }
  }
</style>
