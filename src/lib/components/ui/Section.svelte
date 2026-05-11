<script>
  let { children, class: className = '' } = $props();
</script>

<section class={`section ${className}`.trim()}>
  {@render children?.()}
</section>

<style>
  .section {
    padding: 28px 0;
    border-top: 1px solid var(--rule);
  }

  .section:first-child {
    border-top: 0;
    padding-top: 0;
  }
  /* When non-section content (e.g., PageHeader, KpiStrip, Tabs) precedes
     the first Section, suppress the redundant top rule but keep the
     padding so there's breathing room above the section heading. */
  .section:first-of-type:not(:first-child) {
    border-top: 0;
  }

  .section :global(h2) {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 24px;
    letter-spacing: -0.015em;
    margin: 0 0 14px;
  }

  .section :global(.sub) {
    color: var(--ink-3);
    margin-top: -8px;
    margin-bottom: 16px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    .section {
      padding: 20px 0;
    }

    .section :global(h2) {
      font-size: 20px;
    }

    .section :global(.sub) {
      font-size: 12px;
    }
  }
</style>
