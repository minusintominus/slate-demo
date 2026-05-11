<script>
  let { children, class: className = '' } = $props();
</script>

<div class={`page ${className}`.trim()}>
  {@render children?.()}
</div>

<style>
  .page {
    width: 100%;
    max-width: 1480px;
    margin: 0 auto;
    padding: 28px 36px 60px;
    animation: fadein .18s ease;
  }

  @keyframes fadein {
    from {
      opacity: 0;
      transform: translateY(2px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (max-width: 1024px) {
    .page {
      padding: 24px 24px 60px;
    }
  }

  @media (max-width: 768px) {
    .page {
      padding: 16px 14px 100px;
    }
  }
</style>
