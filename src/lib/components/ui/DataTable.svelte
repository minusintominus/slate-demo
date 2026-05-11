<script>
  let { children, tableClass = '', class: className = '' } = $props();
</script>

<div class={`table-wrap ${className}`.trim()}>
  <table class={tableClass}>
    {@render children?.()}
  </table>
</div>

<style>
  .table-wrap {
    overflow: auto;
    border: 1px solid var(--rule);
    border-radius: var(--r-md);
    background: var(--surface);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  table :global(thead th) {
    text-align: left;
    font-weight: 500;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-3);
    padding: 12px 14px;
    border-bottom: 1px solid var(--rule);
    background: var(--surface);
    position: sticky;
    top: 0;
  }

  table :global(tbody td) {
    padding: 12px 14px;
    border-bottom: 1px solid var(--rule);
    vertical-align: middle;
  }

  table :global(tbody tr:last-child td) {
    border-bottom: 0;
  }

  table :global(tbody tr) {
    cursor: pointer;
  }

  table :global(tbody tr:hover td) {
    background: var(--surface-2);
  }

  @media (max-width: 768px) {
    table,
    table :global(thead th),
    table :global(tbody td) {
      font-size: 12px;
    }

    table :global(thead th),
    table :global(tbody td) {
      padding: 10px;
    }
  }
</style>
