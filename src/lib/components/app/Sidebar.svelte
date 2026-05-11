<script>
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { Divider } from '$lib/components/ui/index.js';
  import { Icons } from '$lib/components/ui/icons.js';
  import { clearDemoRole } from '$lib/state/demo-role.js';

  let {
    route = 'overview',
    viewMode = 'plan',
    theme = 'light',
    navigate = () => {},
    setTheme = () => {},
    mobileOpen = false,
    onMobileClose = () => {}
  } = $props();

  const navMeetWorkspace = [
    { id: 'overview', label: 'Overview', icon: Icons.alert, badge: '2' },
    { id: 'portfolio', label: 'Portfolio', icon: Icons.home },
    { id: 'insights', label: 'AI Insights', icon: Icons.bulb, badge: '4' }
  ];

  const navMeetInvestments = [
    { id: 'alts', label: 'Alternatives', icon: Icons.spark, badge: '6' },
    { id: 'structured', label: 'Structured Products', icon: Icons.table, badge: 'RFQ' },
    { id: 'fx', label: 'FX', icon: Icons.fx, disabled: true }
  ];

  const navPlanWorkspace = [
    { id: 'overview', label: 'Overview', icon: Icons.home },
    { id: 'clients', label: 'Clients', icon: Icons.users },
    { id: 'insights', label: 'AI Insights', icon: Icons.bulb, badge: '4' }
  ];

  const navPlanInvestments = [
    { id: 'alts', label: 'Alternatives', icon: Icons.spark, badge: '6' },
    { id: 'structured', label: 'Structured Products', icon: Icons.table, badge: 'RFQ' },
    { id: 'fx', label: 'FX', icon: Icons.fx, disabled: true }
  ];

  const lockupLight = `${base}/brand/slate-lockup-light.png?v=2`;
  const lockupDark = `${base}/brand/slate-lockup-dark.png?v=2`;
  const poweredBySrc = $derived(
    `${base}/brand/powered-by-slate-${theme === 'dark' ? 'dark' : 'light'}.png?v=1`
  );

  const handleNav = (id) => {
    navigate(id);
  };
</script>

{#if mobileOpen}
  <button type="button" class="sidebar-backdrop" onclick={onMobileClose} aria-label="Close menu"></button>
{/if}

<aside class="sidebar" class:mobile-open={mobileOpen}>
  <div class="sidebar-top-row">
    <div class="brand">
      <div class="brand-lockup-wrap" aria-label="Slate Private Wealth">
        {#if theme === 'dark'}
          <img class="brand-lockup-img" src={lockupDark} alt="" width="286" height="72" decoding="async" />
        {:else}
          <img class="brand-lockup-img" src={lockupLight} alt="" width="286" height="72" decoding="async" />
        {/if}
      </div>
    </div>
  </div>

  {#if viewMode === 'plan'}
    <div class="nav-section">
      <div class="h font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Workspace</div>
      {#each navPlanWorkspace as item}
        <button class:active={route === item.id} class="nav-item" onclick={() => handleNav(item.id)}>
          {@html item.icon}
          <span>{item.label}</span>
          {#if item.badge}<span class="badge">{item.badge}</span>{/if}
        </button>
      {/each}
    </div>
    <div class="nav-section">
      <div class="h font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Investments</div>
      {#each navPlanInvestments as item}
        <button class:active={route === item.id} class="nav-item" disabled={item.disabled}
          aria-disabled={item.disabled || undefined}
          onclick={() => !item.disabled && handleNav(item.id)}>
          {@html item.icon}
          <span>{item.label}</span>
          {#if item.badge}<span class="badge">{item.badge}</span>{/if}
        </button>
      {/each}
    </div>
  {:else}
    <div class="nav-section">
      <div class="h font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Workspace</div>
      {#each navMeetWorkspace as item}
        <button class:active={route === item.id} class="nav-item" onclick={() => handleNav(item.id)}>
          {@html item.icon}
          <span>{item.label}</span>
          {#if item.badge}<span class="badge">{item.badge}</span>{/if}
        </button>
      {/each}
    </div>
    <div class="nav-section">
      <div class="h font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Investments</div>
      {#each navMeetInvestments as item}
        <button class:active={route === item.id} class="nav-item" disabled={item.disabled}
          aria-disabled={item.disabled || undefined}
          onclick={() => !item.disabled && handleNav(item.id)}>
          {@html item.icon}
          <span>{item.label}</span>
          {#if item.badge}<span class="badge">{item.badge}</span>{/if}
        </button>
      {/each}
    </div>
  {/if}

  <div class="mt-auto flex flex-col gap-2">
    <Divider />
    <button
      type="button"
      class="nav-item choose-experience-framed"
      onclick={() => {
        clearDemoRole();
        goto('/');
      }}
    >
      {@html Icons.arrow}
      <span>Choose experience</span>
    </button>
    <div class="sidebar-tools">
      <button type="button" class="sidebar-tool" onclick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        title={theme === 'dark' ? 'Switch to Dawn Mode' : 'Switch to Dusk Mode'}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        {@html theme === 'dark' ? Icons.sun : Icons.moon}
        <span>{theme === 'dark' ? 'Dawn mode' : 'Dusk mode'}</span>
      </button>
      <button type="button" class="sidebar-tool" disabled aria-disabled="true" title="Download Report">
        {@html Icons.download}
        <span>Download report</span>
      </button>
    </div>
    <a class="powered-by-img-wrap" href="https://viaslate.com" target="_blank" rel="noopener noreferrer">
      <img class="powered-by-img" src={poweredBySrc} alt="Powered by Slate" decoding="async" />
    </a>
  </div>
</aside>

<style>
  .sidebar {
    border-right: 1px solid var(--rule);
    background: var(--surface);
    padding: 18px 14px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  .sidebar-top-row {
    display: contents;
  }

  .brand {
    display: flex;
    align-items: center;
    padding: 4px 2px;
  }

  .brand-lockup-wrap {
    line-height: 0;
    width: 100%;
    max-width: 168px;
  }

  .brand-lockup-img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
    object-position: left center;
  }

  .nav-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-section .h {
    padding: 6px 8px 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 8px;
    border-radius: var(--r-md);
    color: var(--ink-2);
    cursor: pointer;
    font-size: 13.5px;
    white-space: nowrap;
    border: 0;
    background: transparent;
    width: 100%;
    text-align: left;
  }

  .nav-item > span:nth-child(2) {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-item:hover {
    background: var(--surface-2);
    color: var(--ink);
  }

  .nav-item:disabled,
  .nav-item[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .nav-item:disabled:hover,
  .nav-item[aria-disabled="true"]:hover {
    background: transparent;
    color: var(--ink-3);
  }

  .nav-item.active {
    background: var(--surface-2);
    color: var(--ink);
    font-weight: 500;
    box-shadow: inset 2px 0 0 var(--accent);
  }

  .nav-item :global(.ic) {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    opacity: 0.85;
  }

  .nav-item .badge {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 10px;
    background: var(--neg-soft);
    color: var(--neg);
    padding: 1px 6px;
    border-radius: 99px;
  }

  .choose-experience-framed {
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    background: var(--surface);
    box-shadow: 0 1px 2px color-mix(in oklch, var(--ink) 4%, transparent);
    justify-content: center;
    text-align: center;
  }
  .choose-experience-framed > span:nth-child(2) {
    flex: 0 0 auto;
  }
  .choose-experience-framed:hover {
    border-color: var(--rule);
    background: var(--surface-2);
  }

  .powered-by-img-wrap {
    display: block;
    padding: 4px 2px 2px;
    text-decoration: none;
    border-radius: var(--r-md);
    transition: background 0.12s;
  }
  .powered-by-img-wrap:hover {
    background: var(--surface-2);
  }
  .powered-by-img {
    display: block;
    width: 100%;
    max-width: 176px;
    height: auto;
    margin: 0 auto;
  }

  .sidebar-tools {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  @media (min-width: 769px) {
    .sidebar-tools {
      display: none;
    }
  }
  .sidebar-tool {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 8px;
    border-radius: var(--r-md);
    color: var(--ink-2);
    cursor: pointer;
    font-size: 13.5px;
    border: 0;
    background: transparent;
    text-align: left;
  }
  .sidebar-tool:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .sidebar-tool:disabled,
  .sidebar-tool[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .sidebar-tool:disabled:hover,
  .sidebar-tool[aria-disabled="true"]:hover {
    background: transparent;
    color: var(--ink-2);
  }
  .sidebar-tool :global(.ic) {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    opacity: 0.85;
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      top: 0;
      bottom: 0;
      right: 0;
      left: auto;
      width: min(86vw, 300px);
      transform: translateX(100%);
      transition: transform .22s ease;
      z-index: 1100;
      border-right: 0;
      border-left: 1px solid var(--rule);
      box-shadow: -16px 0 48px rgba(0, 0, 0, 0.18);
    }
    .sidebar.mobile-open {
      transform: translateX(0);
    }
  }
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(10, 12, 18, 0.45);
    border: 0;
    padding: 0;
    cursor: pointer;
    z-index: 1099;
    backdrop-filter: blur(2px);
  }
  @media (min-width: 769px) {
    .sidebar-backdrop {
      display: none;
    }
  }
</style>
