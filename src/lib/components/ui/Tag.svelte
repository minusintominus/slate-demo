<script>
  let { children, tone = 'default', class: className = '' } = $props();

  const classes = $derived(['tag', tone !== 'default' ? tone : '', className].filter(Boolean).join(' '));
</script>

<span class={classes}>
  {@render children?.()}
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 7px;
    border: 1px solid var(--rule-2);
    border-radius: var(--r-sm);
    color: var(--ink-2);
    background: var(--surface);
  }

  .solid {
    background: var(--ink);
    color: var(--bg);
    border-color: var(--ink);
  }

  .accent {
    background: var(--accent-soft);
    color: var(--accent);
    border-color: var(--accent);
  }

  .warn {
    background: var(--warn-soft);
    color: var(--warn);
    border-color: var(--warn);
  }

  .pos {
    background: var(--pos-soft);
    color: var(--pos);
    border-color: var(--pos);
  }

  .neg {
    background: var(--neg-soft);
    color: var(--neg);
    border-color: var(--neg);
  }
</style>
