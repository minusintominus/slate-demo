<script>
  let { children, class: className = '' } = $props();
</script>

<header class={`page-header ${className}`.trim()}>
  {@render children?.()}
</header>

<style>
  .page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    border-bottom: 1px solid var(--rule);
    padding-bottom: 20px;
    margin-bottom: 28px;
  }

  .page-header :global(h1) {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 44px;
    margin: 6px 0 0;
    letter-spacing: -0.025em;
    line-height: 1.05;
    text-wrap: balance;
  }

  .page-header :global(.meta) {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
    color: var(--ink-3);
    font-size: 12px;
  }

  @media (max-width: 1024px) {
    .page-header :global(h1) {
      font-size: 36px;
    }
  }

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }

    .page-header :global(h1) {
      font-size: 26px;
      line-height: 1.12;
      margin-top: 4px;
    }

    .page-header :global(.meta) {
      align-items: flex-start;
      text-align: left;
      width: 100%;
    }

    .page-header :global(.meta > *) {
      text-align: left !important;
    }

  }

  @media (max-width: 380px) {
    .page-header :global(h1) {
      font-size: 22px;
    }
  }
</style>
