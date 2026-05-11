<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import AppShell from '$lib/components/app/AppShell.svelte';
  import MeetClientPicker from '$lib/components/app/MeetClientPicker.svelte';
  import { HOUSEHOLD } from '$lib/data/fixtures.js';
  import { workspaceTabs, resolveClient } from '$lib/domain/book.js';
  import {
    hasPortfolio,
    initAppState,
    meetPickerOpen,
    selectedAccts,
    setSelectedAccounts,
    setThemeValue,
    theme
  } from '$lib/state/app.js';
  import { getDemoRole, isKitWealthManagerPath } from '$lib/state/demo-role.js';
  import '../app.css';

  let { children } = $props();

  const tabLabels = Object.fromEntries(workspaceTabs.map((tab) => [tab.id, tab.label]));

  // Meet routes look like /meet/[clientId]/<tab>/...
  const meetTabFromPath = (path) => {
    if (!path.startsWith('/meet/')) return null;
    const parts = path.split('/').filter(Boolean); // ['meet', 'clientId', 'tab', ...]
    return parts.length >= 3 ? parts[2] : null;
  };

  const MEET_TAB_TO_ROUTE = {
    overview: 'overview',
    portfolio: 'portfolio',
    insights: 'insights',
    alternatives: 'alts',
    'structured-products': 'structured',
    upload: 'upload',
    parsing: 'parsing',
    review: 'review'
  };

  const routeIdFromPath = (path) => {
    if (path.startsWith('/workspace/overview')) return 'overview';
    if (path.startsWith('/workspace/clients')) return 'clients';
    if (path.startsWith('/workspace/insights')) return 'insights';
    if (path.startsWith('/investments/alternatives')) return 'alts';
    if (path.startsWith('/investments/structured-products')) return 'structured';
    if (path.startsWith('/investments/fx')) return 'fx';
    const meetTab = meetTabFromPath(path);
    if (meetTab && MEET_TAB_TO_ROUTE[meetTab]) return MEET_TAB_TO_ROUTE[meetTab];
    return 'overview';
  };

  const clientName = (id) => resolveClient(id)?.name || id;

  const crumbsForPath = (path, params = {}) => {
    if (path.startsWith('/workspace/overview')) return ['Christine', 'Overview'];
    if (path === '/workspace/clients') return ['Christine', 'Clients'];
    if (path.startsWith('/workspace/clients/') && params.clientId && params.insightId) {
      return ['Christine', clientName(params.clientId), 'Insights', params.insightId];
    }
    if (path.startsWith('/workspace/clients/') && params.clientId && params.symbol) {
      return ['Christine', clientName(params.clientId), 'Holdings', decodeURIComponent(params.symbol)];
    }
    if (path.startsWith('/workspace/clients/') && params.clientId) {
      // Literal sibling folders (e.g. `insights`) don't populate params.tab,
      // so fall back to the 4th path segment.
      const tab = params.tab || path.split('/').filter(Boolean)[3] || 'portfolio';
      const label = tabLabels[tab] || tab.charAt(0).toUpperCase() + tab.slice(1);
      return ['Christine', clientName(params.clientId), label];
    }
    // Workspace insights are book-level — no specific client in scope.
    if (path.startsWith('/workspace/insights/') && params.insightId) return ['Christine', 'Insights', params.insightId];
    if (path.startsWith('/workspace/insights')) return ['Christine', 'Insights'];

    // Meet routes — /meet/[clientId]/<tab>/...
    // Lead crumb is "Meeting" (not "Christine") so the WM has a strong
    // visual cue that they're in meet mode rather than the workspace.
    if (path.startsWith('/meet/') && params.clientId) {
      const meetName = clientName(params.clientId);
      const tab = meetTabFromPath(path);
      if (tab === 'portfolio' && params.symbol) return ['Meeting', meetName, 'Holdings', decodeURIComponent(params.symbol)];
      if (tab === 'portfolio') return ['Meeting', meetName, 'Portfolio'];
      if (tab === 'overview') return ['Meeting', meetName, 'Overview'];
      if (tab === 'insights' && params.insightId) return ['Meeting', meetName, 'Insights', params.insightId];
      if (tab === 'insights') return ['Meeting', meetName, 'Insights'];
      if (tab === 'alternatives') return ['Meeting', meetName, 'Alternatives'];
      if (tab === 'structured-products') return ['Meeting', meetName, 'Structured Products'];
      if (tab === 'upload') return ['Meeting', meetName, 'Intake', 'Upload'];
      if (tab === 'parsing') return ['Meeting', meetName, 'Intake', 'Parsing'];
      if (tab === 'review') return ['Meeting', meetName, 'Intake', 'Review'];
      if (tab === 'import-statements') return ['Meeting', meetName, 'Import statements'];
    }

    if (path.startsWith('/asset/') && params.identifier) {
      return ['Christine', 'Asset', decodeURIComponent(params.identifier)];
    }
    if (path.startsWith('/investments/alternatives')) return ['Christine', 'Alternatives'];
    if (path.startsWith('/investments/structured-products')) return ['Christine', 'Structured Products'];
    if (path.startsWith('/investments/fx')) return ['Christine', 'FX'];
    return ['Christine', 'Overview'];
  };

  const pathForNav = (id, mode, meetId) => {
    const plan = {
      overview: '/workspace/overview',
      clients: '/workspace/clients',
      insights: '/workspace/insights',
      alts: '/investments/alternatives',
      structured: '/investments/structured-products',
      fx: '/investments/fx'
    };
    if (mode !== 'meet') return plan[id] || '/workspace/overview';
    if (!meetId) return '/workspace/overview';
    const meet = {
      overview: `/meet/${meetId}/overview`,
      portfolio: `/meet/${meetId}/portfolio`,
      insights: `/meet/${meetId}/insights`,
      alts: `/meet/${meetId}/alternatives`,
      structured: `/meet/${meetId}/structured-products`,
      fx: '/investments/fx',
      upload: `/meet/${meetId}/upload`,
      parsing: `/meet/${meetId}/parsing`,
      review: `/meet/${meetId}/review`
    };
    return meet[id] || `/meet/${meetId}/overview`;
  };

  const navigate = (id) => goto(pathForNav(id, viewMode, meetClientId));

  let pickerOpen = $state(false);
  // Tab the user was on when entering the picker — restored after they
  // pick a client so the toggle preserves their view.
  let pendingMeetRoute = $state(null);
  // Any page can trigger the picker via meetPickerOpen store.
  $effect(() => {
    if ($meetPickerOpen) {
      pickerOpen = true;
      meetPickerOpen.set(false);
    }
  });

  // Map a /workspace/clients/[id]/<subtab> path to its meet equivalent so
  // toggling Meet from inside a client workspace preserves the active tab.
  const CLIENT_SUBTAB_TO_MEET = {
    portfolio: 'portfolio',
    insights: 'insights',
    alts: 'alternatives'
  };

  const setViewMode = (mode) => {
    if (mode === 'plan') {
      // Portfolio is meet-only; preserve the client by jumping into the
      // workspace client's portfolio tab instead of the book overview.
      if (route === 'portfolio' && meetClientId) {
        goto(`/workspace/clients/${meetClientId}/portfolio`);
        return;
      }
      goto(pathForNav(route, 'plan'));
      return;
    }
    // Inside a client's workspace tab — preserve the subtab when there's a
    // meet equivalent; otherwise default to overview.
    if (pathname.startsWith('/workspace/clients/') && page.params.clientId) {
      const subtab = pathname.split('/').filter(Boolean)[3];
      const meetTab = CLIENT_SUBTAB_TO_MEET[subtab] || 'overview';
      goto(`/meet/${page.params.clientId}/${meetTab}`);
      return;
    }
    if (page.params.clientId) {
      goto(pathForNav(route, 'meet', page.params.clientId));
      return;
    }
    pendingMeetRoute = route;
    pickerOpen = true;
  };
  const onPickClient = (clientId) => {
    pickerOpen = false;
    const targetRoute = pendingMeetRoute || 'overview';
    pendingMeetRoute = null;
    goto(pathForNav(targetRoute, 'meet', clientId));
  };

  const pathname = $derived(page.url.pathname);
  const isRoleHome = $derived(pathname === '/');
  const esliEntry = `${base}/slate-esli/index.html`;

  $effect(() => {
    if (!browser) return;
    const path = page.url.pathname;
    const role = getDemoRole();
    if (isKitWealthManagerPath(path)) {
      if (!role) {
        goto('/', { replaceState: true });
        return;
      }
      if (role === 'client') {
        window.location.replace(`${esliEntry}#dashboard`);
        return;
      }
      if (role === 'compliance') {
        window.location.replace(`${esliEntry}#compliance/inbox`);
      }
    }
  });

  const route = $derived(routeIdFromPath(pathname));
  const viewMode = $derived(pathname.startsWith('/meet') ? 'meet' : 'plan');
  const meetClientId = $derived(viewMode === 'meet' ? page.params.clientId || null : null);
  // Account filter is meet-mode only — that's where the WM is in a single
  // client conversation and benefits from drilling into specific accounts.
  // The workspace portfolio page already has an Accounts sub-tab.
  const showFilter = $derived.by(() => {
    const tab = meetTabFromPath(pathname);
    return tab === 'household' || tab === 'insights';
  });
  const crumbs = $derived(crumbsForPath(pathname, page.params));

  onMount(initAppState);
</script>

{#if isRoleHome}
  {@render children()}
{:else}
  <AppShell
    {route}
    {crumbs}
    theme={$theme}
    {viewMode}
    hasPortfolio={$hasPortfolio}
    {showFilter}
    selectedAccts={$selectedAccts}
    {navigate}
    setTheme={setThemeValue}
    {setViewMode}
    setSelectedAccts={setSelectedAccounts}
  >
    {@render children()}
  </AppShell>
{/if}

{#if pickerOpen}
  <MeetClientPicker
    onPick={onPickClient}
    onCancel={() => (pickerOpen = false)}
  />
{/if}
