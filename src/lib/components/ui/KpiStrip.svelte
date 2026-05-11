<script>
  let { children, class: className = '', style = '' } = $props();
</script>

<div class={`kpis ${className}`.trim()} {style}>
  {@render children?.()}
</div>

<style>
  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 0;
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }

  @media (max-width: 768px) {
    .kpis {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 380px) {
    .kpis {
      grid-template-columns: 1fr;
    }
  }
</style>
