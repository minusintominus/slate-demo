<script>
  let { tabs = [], selected, onSelect = () => {}, variant = 'underline', class: className = '' } = $props();
</script>

<div class={`tabs ${variant === 'pill' ? 'pill' : ''} ${className}`.trim()}>
  {#each tabs as tab}
    {@const id = Array.isArray(tab) ? tab[0] : tab.id}
    {@const label = Array.isArray(tab) ? tab[1] : tab.label}
    <button class:active={selected === id} onclick={() => onSelect(id)}>{label}</button>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--rule);
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

  button {
    background: transparent;
    border: 0;
    padding: 10px 16px;
    cursor: pointer;
    color: var(--ink-3);
    font-size: 14px;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  button:hover {
    color: var(--ink-2);
  }

  button.active {
    color: var(--ink);
    border-bottom-color: var(--ink);
  }

  /* Pill variant — segmented control for sub-tabs (no underline). */
  .tabs.pill {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-wrap: wrap;
    background: var(--surface-2);
    border: 1px solid var(--rule);
    border-radius: var(--r-lg);
    border-bottom: 1px solid var(--rule);
    padding: 3px;
    margin-bottom: 24px;
  }
  .tabs.pill button {
    padding: 5px 14px;
    border-radius: calc(var(--r-lg) - 3px);
    font-size: 12.5px;
    color: var(--ink-3);
    border-bottom: 0;
    margin-bottom: 0;
    transition: background .12s, color .12s, box-shadow .12s;
  }
  .tabs.pill button:hover {
    color: var(--ink-2);
    background: color-mix(in oklch, var(--ink) 5%, transparent);
  }
  .tabs.pill button.active {
    background: var(--surface);
    color: var(--ink);
    box-shadow: var(--shadow-sm);
    border-bottom: 0;
  }

  @media (max-width: 768px) {
    .tabs.pill {
      display: flex;
      flex-wrap: nowrap;
    }

    button {
      padding: 10px 12px;
      font-size: 13px;
    }
  }
</style>
