<script>
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '$lib/components/ui/index.js';
  import { Icons } from '$lib/components/ui/icons.js';
  import { ACCOUNTS, ALT_DEALS, CLIENT_BOOK } from '$lib/data/fixtures.js';
  import { accountsFor } from '$lib/domain/book.js';
  import DisclaimerModal from './DisclaimerModal.svelte';

  let disclaimerOpen = $state(false);

  let {
    crumbs = ['Christine', 'Overview'],
    theme = 'light',
    viewMode = 'plan',
    navigate = () => {},
    setTheme = () => {},
    setViewMode = () => {},
    onToggleMobileNav = () => {}
  } = $props();

  const lockupLight = `${base}/brand/slate-lockup-light.png?v=2`;
  const lockupDark = `${base}/brand/slate-lockup-dark.png?v=2`;

  const shortCrumbs = $derived(crumbs.length > 3 ? [crumbs[0], '...', crumbs[crumbs.length - 1]] : crumbs);

  // ── Search index ────────────────────────────────────────────────────
  // Built once from the live fixtures. Each entry has searchText pre-
  // lowercased so filtering is just a substring match.
  const fmtAum = (n) => {
    if (!n) return '';
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M';
    return '$' + (n / 1e3).toFixed(0) + 'k';
  };

  // Active meet client — when in meet mode the URL carries the clientId.
  const meetClientId = $derived(viewMode === 'meet' ? page.params.clientId || null : null);
  const meetClient = $derived(meetClientId ? CLIENT_BOOK.find((c) => c.id === meetClientId) : null);

  // In meet mode, search is scoped to just the active client + their
  // accounts (no other clients, no firm-wide alts deals — keeps the
  // session focused).
  const SEARCH_INDEX = $derived.by(() => {
    if (meetClient) {
      const accounts = accountsFor(meetClient.id);
      return [
        {
          kind: 'client',
          kindLabel: 'Client',
          id: meetClient.id,
          title: meetClient.name,
          subtitle: [meetClient.familyType, meetClient.custodians].filter(Boolean).join(' · '),
          href: `/meet/${meetClient.id}/overview`,
          searchText: `${meetClient.name} ${meetClient.familyType || ''} ${meetClient.custodians || ''}`.toLowerCase()
        },
        ...accounts.map((a) => ({
          kind: 'account',
          kindLabel: 'Account',
          id: a.id,
          title: a.name,
          subtitle: `${a.custodian} · ${a.entity} · ${a.type}`,
          href: `/meet/${meetClient.id}/portfolio?tab=accounts`,
          searchText: `${a.name} ${a.custodian} ${a.entity} ${a.type}`.toLowerCase()
        }))
      ];
    }
    // Plan mode: full book — every client, every account, every deal.
    return [
      ...CLIENT_BOOK.map((c) => ({
        kind: 'client',
        kindLabel: 'Client',
        id: c.id,
        title: c.name,
        subtitle: [c.familyType, c.custodians, c.aum ? fmtAum(c.aum) + ' AUM' : null].filter(Boolean).join(' · '),
        href: `/workspace/clients/${c.id}`,
        searchText: `${c.name} ${c.familyType || ''} ${c.custodians || ''}`.toLowerCase()
      })),
      ...ACCOUNTS.map((a) => ({
        kind: 'account',
        kindLabel: 'Account',
        id: a.id,
        title: a.name,
        subtitle: `${a.custodian} · ${a.entity} · ${a.type}`,
        href: '/workspace/clients/marchetti/portfolio',
        searchText: `${a.name} ${a.custodian} ${a.entity} ${a.type}`.toLowerCase()
      })),
      ...ALT_DEALS.map((d) => ({
        kind: 'alt',
        kindLabel: 'Alternatives',
        id: d.id,
        title: d.name,
        subtitle: `${d.sponsor} · ${d.strategy}`,
        href: '/investments/alternatives',
        searchText: `${d.name} ${d.sponsor} ${d.strategy} ${d.strategyKey || ''}`.toLowerCase()
      }))
    ];
  });

  // ── Search state ────────────────────────────────────────────────────
  let query = $state('');
  let open = $state(false);
  let searchEl = $state();
  let inputEl = $state();

  let results = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter((item) => item.searchText.includes(q)).slice(0, 12);
  });

  // Close the dropdown on any click outside the search container.
  $effect(() => {
    const close = (e) => {
      if (searchEl && !searchEl.contains(e.target)) open = false;
    };
    document.addEventListener('mousedown', close, true);
    return () => document.removeEventListener('mousedown', close, true);
  });

  const groupedResults = $derived.by(() => {
    const groups = { client: [], account: [], alt: [] };
    for (const r of results) groups[r.kind].push(r);
    return [
      ['client', 'Clients', groups.client],
      ['account', 'Accounts', groups.account],
      ['alt', 'Alternative investments', groups.alt]
    ].filter(([, , items]) => items.length > 0);
  });

  const select = (item) => {
    query = '';
    open = false;
    if (inputEl) inputEl.blur();
    goto(item.href);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      query = '';
      open = false;
      if (inputEl) inputEl.blur();
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      select(results[0]);
    }
  };
</script>

<div class:meet-mode={viewMode === 'meet'} class="topbar">
  <button type="button" class="topbar-brand" onclick={() => navigate('overview')} aria-label="Slate Private Wealth — Overview">
    <span class="topbar-lockup-wrap">
      {#if theme === 'dark'}
        <img class="topbar-lockup-img" src={lockupDark} alt="" width="264" height="68" decoding="async" />
      {:else}
        <img class="topbar-lockup-img" src={lockupLight} alt="" width="264" height="68" decoding="async" />
      {/if}
    </span>
  </button>
  <div class="crumbs topbar-crumbs">
    {#each shortCrumbs as crumb, i}
      {#if i > 0}<span class="sep">/</span>{/if}
      <span class:last={i === shortCrumbs.length - 1}>{crumb}</span>
    {/each}
  </div>
  <div class="search topbar-search" bind:this={searchEl}>
    {@html Icons.search}
    <input
      bind:this={inputEl}
      bind:value={query}
      placeholder={meetClient
        ? `Search ${meetClient.name}'s accounts…`
        : 'Search clients, accounts, alternative deals…'}
      onfocus={() => (open = true)}
      onkeydown={onKeyDown}
    />
    <span class="kbd">⌘K</span>

    {#if open && query.trim()}
      <div class="search-results">
        {#if results.length === 0}
          <div class="search-empty">No matches for &ldquo;{query}&rdquo;</div>
        {:else}
          {#each groupedResults as [kind, label, items] (kind)}
            <div class="search-group">
              <div class="search-group-label">{label}</div>
              {#each items as item (item.id)}
                <button type="button" class="search-result" onclick={() => select(item)}>
                  <span class="search-result-title">{item.title}</span>
                  <span class="search-result-sub">{item.subtitle}</span>
                </button>
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
  <div class="topbar-right">
    <button type="button" class="demo-pill" onclick={() => (disclaimerOpen = true)}>
      <span class="demo-pill-dot"></span>
      <span class="demo-pill-label">Demo environment</span>
    </button>
    <div class="topbar-tools flex items-center gap-0">
      <span class="mode-tip-wrap" data-tip={theme === 'dark' ? 'Switch to Dawn Mode' : 'Switch to Dusk Mode'}>
        <Button variant="ghost" icon onclick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {@html theme === 'dark' ? Icons.sun : Icons.moon}
        </Button>
      </span>
      <span class="mode-tip-wrap" data-tip="Download Report">
        <Button variant="ghost" icon class="topbar-download-btn" disabled aria-disabled="true">{@html Icons.download}</Button>
      </span>
    </div>
    <div class="view-toggle -ml-[7px]">
      <button class:active={viewMode === 'plan'} class="view-toggle-btn" onclick={() => setViewMode('plan')}>Plan</button>
      <button class:active={viewMode === 'meet'} class="view-toggle-btn meet-btn" onclick={() => setViewMode('meet')}>Meet</button>
    </div>
    <div class="avatar-menu">
      <span class="avatar avatar-trigger">CH</span>
      <div class="avatar-dropdown">
        <div class="avatar-dropdown-inner">
          <div class="avatar-dropdown-header">
            <div class="text-[13px] font-semibold">Christine Holloway</div>
            <div class="mt-0.5 text-[11px] text-ink3">Wealth Manager</div>
          </div>
          <hr class="avatar-dropdown-divider" />
          <button class="avatar-dropdown-item" disabled aria-disabled="true">{@html Icons.users} Profile</button>
          <button class="avatar-dropdown-item" disabled aria-disabled="true">{@html Icons.inbox} Notifications</button>
          <button class="avatar-dropdown-item" disabled aria-disabled="true">{@html Icons.table} Preferences</button>
        </div>
      </div>
    </div>
    <button type="button" class="topbar-mobile-nav" aria-label="Open menu" onclick={onToggleMobileNav}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>
  </div>
</div>

{#if disclaimerOpen}
  <DisclaimerModal onClose={() => (disclaimerOpen = false)} />
{/if}

<style>
  .topbar-mobile-nav {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 0;
    background: transparent;
    color: var(--ink-2);
    border-radius: var(--r-md);
    cursor: pointer;
    flex-shrink: 0;
  }
  .topbar-mobile-nav:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  @media (min-width: 769px) {
    .topbar-mobile-nav {
      display: none !important;
    }
  }

  .demo-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 12px;
    border: 1px solid var(--rule-2);
    background: var(--surface-2);
    color: var(--ink-2);
    border-radius: 999px;
    cursor: pointer;
    font: inherit;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    transition: border-color .12s, color .12s, background .12s;
  }
  .demo-pill:hover {
    border-color: var(--accent);
    color: var(--ink);
    background: color-mix(in oklch, var(--accent) 8%, var(--surface));
  }
  .demo-pill-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--accent) 28%, transparent);
    animation: demo-pulse 2.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  .demo-pill-label {
    text-transform: uppercase;
  }
  @keyframes demo-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
  }
  @media (max-width: 768px) {
    .demo-pill-label {
      display: none;
    }
    .demo-pill {
      padding: 6px;
    }
  }

  .topbar {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 28px;
    border-bottom: 1px solid var(--rule);
    background: color-mix(in oklch, var(--surface) 88%, transparent);
    backdrop-filter: saturate(180%) blur(10px);
    -webkit-backdrop-filter: saturate(180%) blur(10px);
    position: sticky;
    top: 0;
    z-index: 5;
  }

  .topbar.meet-mode {
    border-bottom-color: var(--accent);
  }

  .topbar-crumbs {
    flex: 1;
    overflow: hidden;
    min-width: 0;
    max-width: calc(50% - 210px);
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 14px;
    flex: 1;
    justify-content: flex-end;
  }

  .topbar-search {
    position: absolute !important;
    left: 50%;
    transform: translateX(-50%);
    width: 360px;
    flex: none !important;
  }

  /* The topbar sits inside the main column (right of the sidebar) and is
     its own containing block, so left:50% centers to the column rather
     than the viewport. Shift by the sidebar width on desktop so the
     search is centered to the page. Mobile (<769px) has no sidebar. */
  @media (min-width: 1025px) {
    .topbar-search {
      left: calc(50vw - 240px);
    }
  }
  @media (min-width: 769px) and (max-width: 1024px) {
    .topbar-search {
      left: calc(50vw - 200px);
    }
  }

  .crumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--ink-3);
    font-size: 13px;
    min-width: 0;
  }

  .crumbs .sep {
    color: var(--ink-4);
  }

  .crumbs .last {
    color: var(--ink);
    font-weight: 500;
  }

  .crumbs > span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .topbar-brand {
    display: none;
    align-items: center;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: var(--r-md);
    user-select: none;
    background: none;
    border: none;
    transition: background .12s;
    -webkit-tap-highlight-color: transparent;
  }

  .topbar-brand:hover {
    background: var(--surface-2);
  }

  .topbar-brand:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .topbar-lockup-wrap {
    display: block;
    line-height: 0;
    max-height: 28px;
    max-width: 140px;
  }

  .topbar-lockup-img {
    width: auto;
    height: 100%;
    max-height: 28px;
    max-width: 140px;
    object-fit: contain;
    object-position: left center;
    display: block;
  }

  .search {
    flex: 1;
    max-width: 420px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface-2);
    border: 1px solid var(--rule);
    border-radius: var(--r-md);
    padding: 6px 10px;
    color: var(--ink-3);
    font-size: 13px;
    transition: border-color .12s, background .12s, box-shadow .12s;
    position: relative;
  }

  .search-results {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-md);
    max-height: 420px;
    overflow-y: auto;
    z-index: 100;
    padding: 6px;
  }

  .search-empty {
    padding: 16px 12px;
    font-size: 13px;
    color: var(--ink-3);
    text-align: center;
  }

  .search-group + .search-group {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid var(--rule-2);
  }

  .search-group-label {
    padding: 8px 10px 4px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-4);
  }

  .search-result {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    background: transparent;
    border-radius: var(--r-sm);
    cursor: pointer;
    text-align: left;
    color: inherit;
    font-family: inherit;
  }

  .search-result:hover {
    background: var(--surface-2);
  }

  .search-result-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--ink);
  }

  .search-result-sub {
    font-size: 11px;
    color: var(--ink-3);
    line-height: 1.3;
  }

  .search:hover {
    background: var(--surface);
    border-color: var(--rule-2);
  }

  .search:focus-within {
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .search input {
    border: 0;
    background: transparent;
    color: var(--ink);
    outline: none;
    flex: 1;
    font: inherit;
    min-width: 0;
  }

  .kbd {
    border: 1px solid var(--rule-2);
    border-bottom-width: 1.5px;
    border-radius: 3px;
    background: var(--surface);
    padding: 1px 5px;
    color: var(--ink-3);
    font-family: var(--font-mono);
    font-size: 10.5px;
  }

  .mode-tip-wrap {
    position: relative;
    display: inline-flex;
  }

  .mode-tip-wrap::after {
    content: attr(data-tip);
    position: absolute;
    top: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) translateY(-4px);
    background: var(--surface);
    color: var(--ink-2);
    border: 1px solid var(--rule-2);
    box-shadow: var(--shadow-md);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    padding: 6px 12px;
    border-radius: var(--r-md);
    letter-spacing: 0.01em;
    opacity: 0;
    pointer-events: none;
    transition: opacity .15s, transform .15s;
    z-index: 51;
  }

  .mode-tip-wrap:hover::after {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .view-toggle {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    background: var(--surface-2);
    border: 1px solid var(--rule);
    border-radius: var(--r-md);
    padding: 2px;
  }

  .view-toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px 11px;
    border-radius: calc(var(--r-md) - 2px);
    font-size: 12px;
    font-weight: 500;
    color: var(--ink-3);
    transition: background .12s, color .12s, box-shadow .12s;
    white-space: nowrap;
  }

  .view-toggle-btn:not(.active):hover {
    background: var(--surface-2);
    color: var(--ink-2);
  }

  .view-toggle-btn.active {
    background: var(--surface);
    color: var(--ink);
    box-shadow: var(--shadow-sm);
  }

  .view-toggle-btn.meet-btn.active {
    background: var(--accent-soft);
    color: var(--accent);
  }

  .avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid var(--rule-2);
    background: var(--surface-2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-2);
    flex-shrink: 0;
  }

  .avatar-menu {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .avatar-trigger {
    cursor: pointer;
    transition: border-color .15s, background .15s, box-shadow .15s;
  }

  .avatar-menu:hover .avatar-trigger {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--accent) 15%, transparent);
  }

  .avatar-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 200px;
    padding-top: 10px;
    opacity: 0;
    pointer-events: none;
    transform: translateY(-4px);
    transition: opacity .15s, transform .15s;
    z-index: 50;
  }

  .avatar-dropdown-inner {
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-md);
    padding: 6px;
  }

  .avatar-menu:hover .avatar-dropdown {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  .avatar-dropdown-header {
    padding: 8px 10px 10px;
  }

  .avatar-dropdown-divider {
    border: none;
    border-top: 1px solid var(--rule);
    margin: 4px 0;
  }

  .avatar-dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    padding: 7px 10px;
    border-radius: var(--r-md);
    font-size: 13px;
    color: var(--ink-2);
    text-align: left;
    transition: background .1s, color .1s;
  }

  .avatar-dropdown-item:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .avatar-dropdown-item:disabled,
  .avatar-dropdown-item[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .avatar-dropdown-item:disabled:hover,
  .avatar-dropdown-item[aria-disabled="true"]:hover {
    background: transparent;
    color: var(--ink-2);
  }

  @media (max-width: 1024px) {
    .topbar {
      padding: 12px 20px;
    }
  }

  @media (max-width: 768px) {
    .topbar {
      padding: 10px 12px;
      gap: 6px;
    }

    .topbar-brand {
      display: inline-flex;
      flex: 0 0 auto;
      padding-right: 4px;
    }
    .topbar .crumbs {
      font-family: var(--font-display);
      font-size: 17px;
      font-weight: 500;
      letter-spacing: -0.02em;
      line-height: 1.2;
      flex: 0 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .topbar .crumbs .sep,
    .topbar .crumbs span:not(.last) {
      display: none;
    }

    .topbar-search,
    .topbar-tools,
    .avatar-menu {
      display: none;
    }

    .topbar-right {
      flex: 0 1 auto;
      gap: 10px;
      min-width: 0;
      margin-left: auto;
    }

    .view-toggle {
      margin-left: auto !important;
    }

    .view-toggle-btn {
      padding: 4px 9px;
      font-size: 11.5px;
    }
  }
</style>
