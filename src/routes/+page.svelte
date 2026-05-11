<script>
  import { onMount, tick } from 'svelte';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import { Button } from '$lib/components/ui/index.js';
  import { Icons } from '$lib/components/ui/icons.js';
  import { getDemoRole, setDemoRole } from '$lib/state/demo-role.js';
  import { setThemeValue, theme } from '$lib/state/app.js';

  /** @param {HTMLElement} node */
  function portalToBody(node) {
    document.body.appendChild(node);
    return {
      destroy() {
        node.parentNode?.removeChild(node);
      }
    };
  }

  const portalClientHome = `${base}/portal/dashboard`;
  const portalComplianceHome = `${base}/portal/compliance/inbox`;
  const lockupLight = `${base}/brand/slate-lockup-light.png?v=2`;
  const lockupDark = `${base}/brand/slate-lockup-dark.png?v=2`;

  const wmFeatures = [
    'Unified book management',
    'Instant pre-meeting briefs',
    'A unified view of held-away assets'
  ];
  const clientFeatures = [
    'Collaborative goal setting',
    'Secure document vault',
    'Real-time transparency for clients'
  ];
  const complianceFeatures = [
    'Automated KYC/AML',
    'Risk threshold alerts',
    'Audit-ready document trails'
  ];

  const currentDateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  onMount(() => {
    if (!browser) return;
    const r = getDemoRole();
    if (r === 'wm') {
      goto('/workspace/overview', { replaceState: true });
      return;
    }
    if (r === 'client') {
      window.location.replace(portalClientHome);
      return;
    }
    if (r === 'compliance') {
      window.location.replace(portalComplianceHome);
    }
  });

  function pickWm() {
    setDemoRole('wm');
    goto('/workspace/overview');
  }

  function pickClient() {
    setDemoRole('client');
    window.location.href = portalClientHome;
  }

  function pickCompliance() {
    setDemoRole('compliance');
    window.location.href = portalComplianceHome;
  }

  function toggleTheme() {
    setThemeValue(get(theme) === 'light' ? 'dark' : 'light');
  }

  let mobileNavOpen = $state(false);

  function toggleMobileNav() {
    mobileNavOpen = !mobileNavOpen;
  }

  function closeMobileNav() {
    mobileNavOpen = false;
  }

  let themeTipVisible = $state(false);
  let themeTipText = $state('');
  let themeTipStyle = $state('');
  let themeTipAnchor = $state(/** @type {HTMLDivElement | null} */ (null));
  let themeTipEl = $state(/** @type {HTMLDivElement | null} */ (null));

  function themeModeTipLabel() {
    return get(theme) === 'dark' ? 'Switch to Dawn Mode' : 'Switch to Dusk Mode';
  }

  function placeThemeTip() {
    if (!browser || !themeTipAnchor || !themeTipEl) return;
    const r = themeTipAnchor.getBoundingClientRect();
    const tw = themeTipEl.offsetWidth;
    const th = themeTipEl.offsetHeight;
    const pad = 8;
    const gap = 10;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - tw - pad));
    let top = r.bottom + gap;
    if (top + th > window.innerHeight - pad) top = Math.max(pad, r.top - gap - th);
    themeTipStyle = `top:${top}px;left:${left}px`;
  }

  async function openThemeTip() {
    themeTipText = themeModeTipLabel();
    themeTipVisible = true;
    await tick();
    placeThemeTip();
  }

  function closeThemeTip() {
    themeTipVisible = false;
  }

  onMount(() => {
    if (!browser) return;
    const onMove = () => {
      if (themeTipVisible) tick().then(placeThemeTip);
    };
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    const unsubTheme = theme.subscribe(() => {
      themeTipText = themeModeTipLabel();
      tick().then(placeThemeTip);
    });
    return () => {
      unsubTheme();
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  });
</script>

<div class="role-page">
  <header class="role-topbar-shell">
    <div class="role-topbar-inner">
      <div class="role-topbar-left">
        <a class="role-topbar-brand" href="{base}/" aria-label="Slate Private Wealth home">
          <span class="role-topbar-logo-frame">
            {#if $theme === 'dark'}
              <img class="role-topbar-logo" src={lockupDark} alt="" width="240" height="60" decoding="async" />
            {:else}
              <img class="role-topbar-logo" src={lockupLight} alt="" width="240" height="60" decoding="async" />
            {/if}
          </span>
        </a>
        <button
          type="button"
          class="role-nav-toggle"
          aria-expanded={mobileNavOpen}
          aria-controls="role-primary-nav"
          onclick={toggleMobileNav}
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
        >
          {#if mobileNavOpen}
            {@html Icons.close}
          {:else}
            {@html Icons.menu}
          {/if}
        </button>
        <nav
          id="role-primary-nav"
          class="role-nav"
          class:role-nav--open={mobileNavOpen}
          aria-label="Primary"
        >
          <a
            class="role-nav-link"
            href="https://viaslate.com/"
            target="_blank"
            rel="noopener noreferrer"
            onclick={closeMobileNav}>Main Website</a
          >
          <a
            class="role-nav-cta"
            href="https://cal.eu/connect"
            target="_blank"
            rel="noopener noreferrer"
            onclick={closeMobileNav}>Request Walkthrough</a
          >
        </nav>
      </div>
      <div class="role-topbar-right">
        <div
          class="role-theme-tip-anchor"
          bind:this={themeTipAnchor}
          role="group"
          aria-label="Appearance"
          onmouseenter={openThemeTip}
          onmouseleave={closeThemeTip}
        >
          <Button
            variant="ghost"
            icon
            onclick={toggleTheme}
            aria-label={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {@html $theme === 'dark' ? Icons.sun : Icons.moon}
          </Button>
        </div>
      </div>
    </div>
  </header>

  <main class="role-main">
    <section class="role-hero">
      <div class="role-hero-meta">{currentDateLabel} · Role selection</div>
      <h1 class="role-title">Welcome to Slate</h1>
      <p class="role-hero-sub">
        Experience the new era of wealth management. Select a workstation to begin.
      </p>
    </section>

    <div class="role-modules-shell">
      <div class="role-cards-grow">
        <div id="choose-path" class="role-cards">
          <button
            type="button"
            class="role-card role-card--wm"
            onclick={pickWm}
            aria-label="Open My Workstation"
          >
            <div class="role-card-body">
              <span class="role-card-pill">Recommended start</span>
              <div class="role-card-icon-wrap" aria-hidden="true">
                {@html Icons.table}
              </div>
              <h2 class="role-card-h">My Workstation</h2>
              <p class="role-card-p">Advisor mission control for meetings, portfolio health, and daily workflows.</p>
              <div class="role-module-list">
                {#each wmFeatures as line}
                  <div class="role-module-row">
                    <span class="role-module-row-label">{line}</span>
                  </div>
                {/each}
              </div>
              <span class="role-card-foot"
                >Enter workspace <span class="role-card-foot-arrow" aria-hidden="true">→</span></span
              >
            </div>
          </button>

          <button
            type="button"
            class="role-card role-card--client"
            onclick={pickClient}
            aria-label="Open Client Experience"
          >
            <div class="role-card-body">
              <span class="role-card-pill">You deliver this</span>
              <div class="role-card-icon-wrap" aria-hidden="true">
                {@html Icons.spark}
              </div>
              <h2 class="role-card-h">Client Experience</h2>
              <p class="role-card-p">White-labeled client portal for clarity and trust. You stay at the center.</p>
              <div class="role-module-list">
                {#each clientFeatures as line}
                  <div class="role-module-row">
                    <span class="role-module-row-label">{line}</span>
                  </div>
                {/each}
              </div>
              <span class="role-card-foot"
                >Enter client view <span class="role-card-foot-arrow" aria-hidden="true">→</span></span
              >
            </div>
          </button>

          <button
            type="button"
            class="role-card role-card--compliance"
            onclick={pickCompliance}
            aria-label="Open Compliance"
          >
            <div class="role-card-body">
              <span class="role-card-pill">Runs with you</span>
              <div class="role-card-icon-wrap" aria-hidden="true">
                {@html Icons.file}
              </div>
              <h2 class="role-card-h">Compliance</h2>
              <p class="role-card-p">Audit-ready signals and KYC/AML workflows running in the background.</p>
              <div class="role-module-list">
                {#each complianceFeatures as line}
                  <div class="role-module-row">
                    <span class="role-module-row-label">{line}</span>
                  </div>
                {/each}
              </div>
              <span class="role-card-foot"
                >Enter compliance <span class="role-card-foot-arrow" aria-hidden="true">→</span></span
              >
            </div>
          </button>
        </div>
      </div>
    </div>

    <footer class="role-bottom-strip" aria-label="Footer">
      <div class="role-bottom-disclaimer">
        <p class="role-footer-copy">
          Slate Private Wealth is a product demonstration. In production, your firm would connect identity, custody,
          and policy. This build uses synthetic data only.
        </p>
      </div>
      <p class="role-footer-util">
        <span>Custodian-agnostic workflows</span>
        <span class="role-footer-util-sep" aria-hidden="true">·</span>
        <span>Advisor-led access model</span>
      </p>
    </footer>
  </main>
</div>

{#if browser && themeTipVisible}
  <div
    class="role-tip-floater"
    use:portalToBody
    bind:this={themeTipEl}
    style={themeTipStyle}
    role="tooltip"
  >
    {themeTipText}
  </div>
{/if}

<style>
  .role-page {
    --role-pad-x: clamp(16px, 3vw, 28px);
    --role-nav-h: 72px;
    --role-body: var(--ink-2);
    position: relative;
    height: 100vh;
    max-height: 100vh;
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: none;
    background: var(--bg);
    color: var(--ink);
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .role-main {
    position: relative;
    z-index: 1;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    max-width: none;
    height: calc(100vh - var(--role-nav-h));
    max-height: calc(100vh - var(--role-nav-h));
    box-sizing: border-box;
    padding: clamp(1.25rem, 2.5vh, 2rem) var(--role-pad-x) clamp(1rem, 2vh, 1.5rem);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: clamp(1.5rem, 3vh, 2.25rem);
    overflow: hidden;
  }

  .role-topbar-shell {
    position: relative;
    z-index: 30;
    overflow: visible;
    width: 100%;
    max-width: none;
    flex: 0 0 var(--role-nav-h);
    height: var(--role-nav-h);
    min-height: var(--role-nav-h);
    box-sizing: border-box;
    border-bottom: 1px solid var(--rule);
    background: color-mix(in oklch, var(--surface) 88%, transparent);
  }

  :global([data-theme='dark']) .role-topbar-shell {
    background: color-mix(in oklch, var(--surface) 92%, transparent);
  }

  .role-topbar-inner {
    max-width: none;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 14px clamp(16px, 3vw, 28px);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
  }

  .role-topbar-left {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: clamp(8px, 2vw, 20px);
    min-width: 0;
    flex: 1 1 auto;
  }

  .role-nav-toggle {
    display: none;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 40px;
    margin-left: auto;
    padding: 0;
    border-radius: var(--r-md);
    border: 1px solid var(--rule);
    background: var(--surface);
    color: var(--ink);
    cursor: pointer;
    box-shadow: var(--shadow-sm);
  }

  .role-nav-toggle :global(.ic) {
    width: 20px;
    height: 20px;
  }

  .role-nav-toggle:hover {
    background: var(--surface-2);
    border-color: var(--rule-2);
  }

  .role-nav-toggle:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .role-topbar-brand {
    line-height: 0;
    flex: 0 0 auto;
    text-decoration: none;
    color: inherit;
  }

  .role-topbar-brand:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
    border-radius: 6px;
  }

  .role-topbar-logo-frame {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
    border-radius: 0;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .role-topbar-logo {
    display: block;
    height: clamp(40px, 4.5vw, 48px);
    width: auto;
    max-width: min(300px, 52vw);
    object-fit: contain;
    object-position: left center;
  }

  :global([data-theme='light']) .role-topbar-logo {
    filter: contrast(1.22) brightness(0.86);
  }

  .role-nav {
    display: flex;
    align-items: center;
    gap: 8px 2rem;
    flex-wrap: wrap;
    font-size: 14px;
    font-weight: 500;
  }

  .role-nav-link {
    color: var(--ink-2);
    text-decoration: none;
    padding: 4px 0;
    border-bottom: 2px solid transparent;
    font-weight: 500;
    transition: color 0.12s, border-color 0.12s;
  }

  .role-nav-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 14px;
    border-radius: var(--r-md);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-ui);
    line-height: 1.2;
    background: var(--ink);
    color: var(--bg);
    border: 1px solid var(--ink);
    text-decoration: none;
    white-space: nowrap;
    transition:
      opacity 0.12s ease,
      filter 0.12s ease;
  }

  .role-nav-cta:hover {
    opacity: 0.92;
    filter: brightness(1.02);
  }

  .role-nav-cta:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  .role-nav-link:hover {
    color: var(--ink);
    border-bottom-color: var(--rule-2);
  }

  .role-nav-link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
    border-radius: 2px;
  }

  .role-topbar-right {
    display: flex;
    align-items: center;
    gap: 0;
    flex: 0 0 auto;
    margin-left: auto;
    padding-left: 8px;
    flex-shrink: 0;
  }

  .role-topbar-right :global(.button.icon) {
    color: var(--ink-2);
  }

  .role-topbar-right :global(.button.icon:hover) {
    color: var(--ink);
  }

  .role-topbar-right :global(.ic) {
    width: 16px;
    height: 16px;
    opacity: 0.88;
  }

  .role-theme-tip-anchor {
    display: inline-flex;
    align-items: center;
  }

  :global(.role-tip-floater) {
    position: fixed;
    z-index: 10000;
    box-sizing: border-box;
    margin: 0;
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
    pointer-events: none;
    max-width: min(calc(100vw - 16px), 320px);
  }

  .role-hero {
    text-align: left;
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 0 4px;
    flex-shrink: 0;
    box-sizing: border-box;
  }

  .role-hero-meta {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-3);
    line-height: 1.35;
    margin: 0 0 6px;
  }

  .role-title {
    font-family: var(--font-display);
    font-size: clamp(1.85rem, 2.8vw + 0.5rem, 2.65rem);
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.025em;
    line-height: 1.08;
    color: var(--ink);
    text-wrap: balance;
  }

  .role-hero-sub {
    margin: 0.65rem 0 0;
    max-width: 42rem;
    font-family: var(--font-ui);
    font-size: clamp(14px, 0.5vw + 13px, 16px);
    font-weight: 400;
    line-height: 1.55;
    color: var(--role-body);
  }

  .role-modules-shell {
    flex: 1 1 0;
    min-height: 0;
    width: 100%;
    max-width: none;
    margin: 0 calc(-1 * var(--role-pad-x));
    padding: clamp(1rem, 2.5vh, 1.75rem) var(--role-pad-x) clamp(1rem, 2vh, 1.5rem);
    box-sizing: border-box;
    /* Match page --bg so hero, cards region, and footer read as one surface (no slab seam). */
    background: var(--bg);
    border-radius: var(--r-md);
    border: 1px solid transparent;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :global([data-theme='dark']) .role-modules-shell {
    background: var(--bg);
    border-color: transparent;
  }

  .role-cards-grow {
    flex: 1 1 0;
    min-height: 0;
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    box-sizing: border-box;
    overflow: hidden;
  }

  .role-cards {
    flex: 1 1 0;
    min-height: 0;
    width: 100%;
    display: grid;
    gap: 1.25rem;
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    align-items: stretch;
    align-content: start;
    justify-items: stretch;
    padding-top: 0;
    box-sizing: border-box;
    scroll-margin-top: 4px;
  }

  @media (min-width: 900px) {
    .role-cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      grid-auto-rows: auto;
    }
  }

  .role-card {
    --card-accent: var(--accent);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    min-width: 0;
    height: auto;
    align-self: stretch;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font: inherit;
    text-align: left;
    border-radius: var(--r-md);
    /* Inset stroke avoids hairline gaps between fill and border on hover (transform + radius). */
    border: 1px solid transparent;
    background: var(--surface);
    background-clip: padding-box;
    box-shadow: inset 0 0 0 1px var(--rule);
    cursor: pointer;
    /* Visible so hover elevation shadow is not clipped at the card edge. */
    overflow: visible;
    transition: box-shadow 0.18s ease;
    padding-bottom: 2rem;
  }

  .role-card--wm {
    --card-accent: var(--accent);
  }

  .role-card--client {
    --card-accent: var(--pos);
  }

  .role-card--compliance {
    --card-accent: var(--warn);
  }

  .role-card:hover {
    box-shadow:
      inset 0 0 0 1px color-mix(in oklch, var(--ink) 78%, var(--rule)),
      0 6px 20px color-mix(in oklch, var(--ink) 8%, transparent);
  }

  :global([data-theme='dark']) .role-card:hover {
    box-shadow:
      inset 0 0 0 1px color-mix(in oklch, var(--ink) 55%, var(--rule)),
      0 6px 20px color-mix(in oklch, var(--ink) 18%, transparent);
  }

  .role-card:active {
    box-shadow:
      inset 0 0 0 1px color-mix(in oklch, var(--ink) 72%, var(--rule)),
      0 3px 10px color-mix(in oklch, var(--ink) 5%, transparent);
  }

  :global([data-theme='dark']) .role-card:active {
    box-shadow:
      inset 0 0 0 1px color-mix(in oklch, var(--ink) 50%, var(--rule)),
      0 3px 10px color-mix(in oklch, var(--ink) 14%, transparent);
  }

  .role-card:focus-visible {
    outline: 2px solid var(--card-accent);
    outline-offset: 3px;
  }

  .role-card-body {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    box-sizing: border-box;
    padding: 1.5rem max(1.5rem, 6.25rem) 0 1.5rem;
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .role-card-pill {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 1;
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 9px 5px 10px;
    border-radius: 999px;
    color: var(--ink-3);
    background: color-mix(in oklch, var(--surface-2) 88%, var(--surface));
    border: 1px solid var(--rule-2);
    box-shadow: none;
  }

  :global([data-theme='dark']) .role-card-pill {
    background: color-mix(in oklch, var(--surface-2) 55%, var(--surface));
    color: var(--ink-3);
    border-color: var(--rule);
  }

  .role-card-icon-wrap {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--r-md);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-2);
    border: 1px solid var(--rule-2);
    color: var(--ink-2);
  }

  .role-card--wm .role-card-icon-wrap {
    background: color-mix(in oklch, var(--accent) 12%, var(--surface-2));
    border-color: color-mix(in oklch, var(--accent) 22%, var(--rule-2));
    color: var(--accent);
  }

  .role-card--client .role-card-icon-wrap {
    background: color-mix(in oklch, var(--pos) 12%, var(--surface-2));
    border-color: color-mix(in oklch, var(--pos) 24%, var(--rule-2));
    color: var(--pos);
  }

  .role-card--compliance .role-card-icon-wrap {
    background: color-mix(in oklch, var(--warn) 14%, var(--surface-2));
    border-color: color-mix(in oklch, var(--warn) 26%, var(--rule-2));
    color: var(--warn);
  }

  .role-card-icon-wrap :global(.ic) {
    width: 16px;
    height: 16px;
    opacity: 0.88;
  }

  .role-card-h {
    flex-shrink: 0;
    font-family: var(--font-display);
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    letter-spacing: -0.015em;
    line-height: 1.25;
    width: 100%;
    min-width: 0;
  }

  .role-card-p {
    margin: 0;
    font-size: clamp(13px, 0.35vw + 12px, 14px);
    color: var(--role-body);
    line-height: 1.5;
    width: 100%;
    min-width: 0;
  }

  .role-module-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    margin: 0;
  }

  .role-module-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 36px;
    border-bottom: 1px dashed var(--rule-2);
    font-size: 13px;
    color: var(--role-body);
  }

  .role-module-row:last-child {
    border-bottom: 0;
  }

  .role-module-row-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .role-card-foot {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    padding-top: 0.75rem;
    border-top: 1px solid color-mix(in oklch, var(--rule) 88%, transparent);
    font-size: 13px;
    font-weight: 700;
    color: var(--card-accent);
    font-family: var(--font-ui);
    width: 100%;
    min-width: 0;
  }

  .role-card-foot-arrow {
    transition: transform 0.15s ease;
  }

  .role-card:hover .role-card-foot-arrow {
    transform: translateX(3px);
  }

  .role-bottom-strip {
    flex-shrink: 0;
    width: 100%;
    max-width: 72rem;
    margin: 0 auto;
    margin-top: auto;
    padding: clamp(0.5rem, 1.2vh, 0.85rem) 0 0;
    border-top: none;
    background: transparent;
    box-sizing: border-box;
  }

  .role-bottom-disclaimer {
    text-align: center;
    padding: 0 0 6px;
    border-top: none;
  }

  .role-footer-copy {
    margin: 0 auto 0.35rem;
    max-width: 56rem;
    width: 100%;
    padding: 0 0.5rem;
    box-sizing: border-box;
    font-size: 12px;
    line-height: 1.6;
    text-align: center;
    color: var(--role-body);
    font-family: var(--font-ui);
  }

  .role-footer-util {
    margin: 0;
    padding: 6px 0 0;
    margin-top: 4px;
    border-top: 1px solid color-mix(in oklch, var(--rule) 45%, transparent);
    font-size: 12px;
    line-height: 1.45;
    color: var(--ink-3);
    font-family: var(--font-ui);
    text-align: center;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.35rem 0.5rem;
  }

  .role-footer-util-sep {
    opacity: 0.55;
    user-select: none;
  }

  :global([data-theme='dark']) .role-footer-util {
    border-top-color: color-mix(in oklch, var(--rule) 55%, transparent);
    color: var(--ink-3);
  }

  @media (max-width: 719px) {
    .role-topbar-inner {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      column-gap: 10px;
      row-gap: 0;
    }

    .role-topbar-left {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      grid-column: 1;
      width: 100%;
      min-width: 0;
      gap: 8px;
    }

    .role-topbar-brand {
      min-width: 0;
    }

    .role-nav-toggle {
      display: inline-flex;
      margin-left: auto;
    }

    .role-nav {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 40;
      display: none;
      flex-direction: column;
      align-items: stretch;
      gap: 2px 0;
      width: 100%;
      padding: 10px var(--role-pad-x) 14px;
      margin: 0;
      border-bottom: 1px solid var(--rule);
      background: color-mix(in oklch, var(--surface) 96%, var(--bg));
      box-shadow: var(--shadow-md);
    }

    .role-nav--open {
      display: flex;
    }

    .role-nav-link {
      padding: 10px 4px;
      border-bottom: none;
    }

    .role-nav-cta {
      width: 100%;
      justify-content: center;
      margin-top: 4px;
    }

    .role-topbar-right {
      grid-column: 2;
      grid-row: 1;
      margin-left: 0;
      align-self: center;
    }

    .role-title {
      font-size: clamp(1.35rem, 5.5vw + 0.45rem, 1.85rem);
    }

    .role-hero {
      max-width: none;
      width: 100%;
      padding-left: 0;
      padding-right: 0;
    }

    .role-card-body {
      padding-right: max(clamp(12px, 2.5vw, 18px), 5.75rem);
    }

    .role-footer-util {
      justify-content: flex-start;
      text-align: left;
    }
  }

  @media (min-width: 720px) {
    .role-topbar-inner {
      flex-wrap: nowrap;
    }

    .role-nav-toggle {
      display: none;
    }

    .role-nav {
      display: flex !important;
      flex-direction: row;
      align-items: center;
      padding-top: 0;
      margin-top: 0;
      border-top: none;
    }
  }
</style>
