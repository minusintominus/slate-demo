<script>
  import AccountFilter from './AccountFilter.svelte';
  import Sidebar from './Sidebar.svelte';
  import Topbar from './Topbar.svelte';

  let {
    route = 'overview',
    crumbs = ['Christine', 'Overview'],
    theme = 'light',
    viewMode = 'plan',
    hasPortfolio = false,
    showFilter = false,
    selectedAccts = [],
    navigate = () => {},
    setTheme = () => {},
    setViewMode = () => {},
    setSelectedAccts = () => {},
    children
  } = $props();

  // Mobile sidebar drawer — opened from the topbar hamburger; closes when
  // the user taps the backdrop or picks a destination.
  let mobileNavOpen = $state(false);
  const closeMobileNav = () => (mobileNavOpen = false);
  const navigateAndClose = (id) => {
    closeMobileNav();
    navigate(id);
  };
</script>

<div class="app">
  <Sidebar
    {route}
    {viewMode}
    {theme}
    navigate={navigateAndClose}
    {setTheme}
    mobileOpen={mobileNavOpen}
    onMobileClose={closeMobileNav}
  />
  <main class="main">
    <Topbar
      {crumbs}
      {viewMode}
      {theme}
      {navigate}
      {setTheme}
      {setViewMode}
      onToggleMobileNav={() => (mobileNavOpen = !mobileNavOpen)}
    />
    {#if showFilter && hasPortfolio}
      <AccountFilter {selectedAccts} setSelectedAccts={setSelectedAccts} />
    {/if}
    {@render children?.()}
    <footer class="disclaimer">
      <div class="disclaimer-inner">
        <div class="disclaimer-head">
          <span class="disclaimer-mark">Slate</span>
          <span class="disclaimer-divider"></span>
          <span class="disclaimer-summary">Demo · synthetic data · no real client communication or transactions.</span>
        </div>
        <div class="disclaimer-body">
          <p>
            Slate is a technology provider; this environment exists only to demonstrate the software. Wealth-management firms that license Slate operate it in their own infrastructure — every household, account, holding, follow-up, RFQ, and forecast shown here is synthetic. In a production deployment, the licensee firm hosts and controls all client data; Slate does not store, process, transmit, or have visibility into it.
          </p>
          <p>
            Slate makes no representations or warranties about the accuracy, completeness, suitability, security, or confidentiality of any data, calculation, model output, or workflow shown. Nothing on this site is investment, tax, legal, or accounting advice, and no client communication, order, wire, or external request is actually sent from here.
          </p>
          <p>
            The features shown in this demo are exploratory and are being shared to gather feedback. They are not a commitment, roadmap, or specification — any production version, if ever built, may differ materially or omit these features entirely.
          </p>
          <p>
            Slate is not a registered investment adviser, broker-dealer, custodian, or other regulated financial institution in any jurisdiction. Nothing on this site is an offer, recommendation, or solicitation to buy or sell any security, fund, or instrument; performance lines, dealer quotes, multiples, and forecasts are hypothetical. Custodian names, dealer names, sponsors, tickers, indices, and benchmarks are used illustratively — no endorsement or relationship is implied, and all trademarks remain the property of their respective owners.
          </p>
          <p>
            Please do not enter real personal or sensitive data into form fields; this demo is not designed for live use and any input may persist in your browser's local storage. The build is shared for evaluation under confidence — please do not redistribute, screenshot publicly, or quote it without permission. Contents are a snapshot and may change between sessions.
          </p>
        </div>
      </div>
    </footer>
  </main>
</div>

<style>
  .app {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 100vh;
  }

  .main {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .disclaimer {
    margin-top: auto;
    border-top: 1px solid var(--rule);
    background: var(--surface);
    padding: 14px 36px 18px;
  }
  .disclaimer-inner {
    max-width: 1480px;
    margin: 0 auto;
  }
  .disclaimer-head {
    display: flex;
    align-items: center;
    gap: 14px;
    color: var(--ink-3);
    font-size: 11.5px;
    line-height: 1.6;
  }
  .disclaimer-mark {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--ink-2);
    flex-shrink: 0;
  }
  .disclaimer-divider {
    width: 1px;
    height: 12px;
    background: var(--rule-2);
    flex-shrink: 0;
  }
  .disclaimer-summary {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .disclaimer-body {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px dashed var(--rule-2);
    color: var(--ink-3);
    font-size: 11.5px;
    line-height: 1.65;
    columns: 2;
    column-gap: 40px;
  }
  .disclaimer-body p {
    margin: 0 0 10px;
    break-inside: avoid;
  }
  .disclaimer-body p:last-child {
    margin-bottom: 0;
  }
  @media (max-width: 768px) {
    .disclaimer {
      padding: 12px 14px 18px;
    }
    .disclaimer-summary {
      white-space: normal;
    }
    .disclaimer-body {
      columns: 1;
    }
  }

  @media (max-width: 1024px) {
    .app {
      grid-template-columns: 200px 1fr;
    }
  }

  @media (max-width: 768px) {
    .app {
      grid-template-columns: 1fr;
    }
  }
</style>
