<script>
  let { children, as = 'div', class: className = '', ...rest } = $props();
</script>

<svelte:element this={as} class={`card ${className}`.trim()} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .card {
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: var(--r-md);
  }

  @media (max-width: 768px) {
    .card :global(svg) {
      height: auto;
    }
  }
</style>
