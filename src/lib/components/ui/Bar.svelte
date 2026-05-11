<script>
  let {
    value = 0,
    target = null,
    tone = 'default',
    color = '',
    class: className = ''
  } = $props();

  const width = $derived(Math.max(0, Math.min(100, value)));
  const fillClass = $derived(['bar-fill', tone !== 'default' ? tone : ''].filter(Boolean).join(' '));
</script>

<div class={`bar-track ${target == null ? '' : 'with-target'} ${className}`.trim()}>
  <div class={fillClass} style={`width:${width}%;${color ? ` background:${color};` : ''}`}></div>
  {#if target != null}
    <div class="target" style={`left:${target}%`}></div>
  {/if}
</div>

<style>
  .bar-track {
    height: 6px;
    background: var(--rule);
    border-radius: 99px;
    overflow: hidden;
    position: relative;
  }

  .bar-fill {
    height: 100%;
    background: var(--ink);
  }

  .accent {
    background: var(--accent);
  }

  .pos {
    background: var(--pos);
  }

  .neg {
    background: var(--neg);
  }

  .warn {
    background: var(--warn);
  }

  .with-target {
    overflow: visible;
  }

  .target {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    background: var(--ink-3);
  }
</style>
