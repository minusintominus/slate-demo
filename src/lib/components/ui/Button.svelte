<script>
  let {
    children,
    variant = 'default',
    size = 'md',
    icon = false,
    type = 'button',
    class: className = '',
    ...rest
  } = $props();

  const classes = $derived([
    'button',
    variant !== 'default' ? variant : '',
    size !== 'md' ? size : '',
    icon ? 'icon' : '',
    className
  ].filter(Boolean).join(' '));
</script>

<button {type} class={classes} {...rest}>
  {@render children?.()}
</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    padding: 8px 14px;
    border: 1px solid var(--rule-2);
    background: var(--surface);
    color: var(--ink);
    border-radius: var(--r-md);
    cursor: pointer;
    font-size: 13px;
    transition: background .12s, border-color .12s, transform .04s;
  }

  .button:hover {
    background: var(--surface-2);
    border-color: var(--ink-3);
  }

  .button:active {
    transform: translateY(1px);
  }

  .button:disabled,
  .button[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .button:disabled:hover,
  .button[aria-disabled="true"]:hover {
    background: transparent;
    border-color: var(--rule-2);
    transform: none;
  }
  .button.ghost:disabled:hover,
  .button.ghost[aria-disabled="true"]:hover {
    border-color: transparent;
    background: transparent;
  }
  .button:disabled:active,
  .button[aria-disabled="true"]:active {
    transform: none;
  }

  .primary {
    background: var(--ink);
    color: var(--bg);
    border-color: var(--ink);
  }

  .primary:hover {
    opacity: 0.92;
    background: var(--ink);
  }

  .accent {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .accent:hover {
    opacity: 0.92;
    background: var(--accent);
  }

  .ghost {
    border-color: transparent;
  }

  .ghost:hover {
    border-color: var(--rule-2);
  }

  .sm {
    padding: 5px 10px;
    font-size: 12px;
  }

  .icon {
    padding: 7px;
  }

  @media (max-width: 768px) {
    .button {
      min-height: 38px;
      padding: 9px 14px;
    }

    .sm {
      min-height: 32px;
      padding: 7px 11px;
    }

    .icon {
      min-height: 36px;
    }
  }
</style>
