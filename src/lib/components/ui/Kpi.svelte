<script>
  let { label, value, sub = null, valueClass = '', children, class: className = '' } = $props();
</script>

<div class={`kpi ${className}`.trim()}>
  {#if label}<span class="label">{label}</span>{/if}
  {#if value}<span class={`value ${valueClass}`.trim()}>{value}</span>{/if}
  {#if sub}<span class="sub">{sub}</span>{/if}
  {@render children?.()}
</div>

<style>
  .kpi {
    padding: 22px 24px;
    border-left: 1px solid var(--rule);
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .kpi:first-child {
    border-left: 0;
    padding-left: 0;
  }

  .label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }

  .value {
    font-family: var(--font-mono);
    font-feature-settings: "tnum" on;
    font-size: 38px;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }

  .sub {
    color: var(--ink-3);
    font-size: 12px;
  }

  @media (max-width: 768px) {
    .kpi {
      padding: 14px 12px;
    }

    .kpi:first-child {
      padding-left: 12px;
    }

    .kpi:nth-child(odd) {
      border-left: 0;
      padding-left: 12px;
    }

    .kpi:nth-child(n+3) {
      border-top: 1px solid var(--rule);
    }

    .value {
      font-size: 26px;
    }

    .label {
      font-size: 9.5px;
    }
  }

  @media (max-width: 380px) {
    .kpi:nth-child(n) {
      border-left: 0;
      padding-left: 0;
    }

    .kpi:nth-child(n+2) {
      border-top: 1px solid var(--rule);
    }
  }
</style>
