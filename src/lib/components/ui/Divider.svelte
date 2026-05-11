<script>
  let { dashed = false, class: className = '' } = $props();
</script>

<hr class={`divider ${dashed ? 'dashed' : ''} ${className}`.trim()} />

<style>
  .divider {
    height: 1px;
    background: var(--rule);
    border: 0;
  }

  .dashed {
    height: 0;
    background: transparent;
    border-top: 1px dashed var(--rule-2);
  }
</style>
