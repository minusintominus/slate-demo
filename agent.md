# Agent Guide

## Project

Slate is a SvelteKit prototype for a Wealth Manager of Private Clients. The main experience is a calm WM workspace for business health, client roster, household context, insights, intake, and investment pages.

Read `design.md` before making visual or product changes. It is the source of truth for tone, density, colors, typography, and interaction posture.

## Stack

- SvelteKit SPA with real file routes.
- Svelte 5 runes syntax.
- Tailwind v4 through the Vite plugin.
- Static adapter with SPA fallback.
- No React/Babel/root `index.html` app remains.

Useful commands:

```sh
npm run check
npm run build
```

Use Playwright only for small smoke checks when UI behavior matters. Keep route-by-route testing minimal unless the change is routing-heavy.

## Structure

- `src/routes/**/+page.svelte`: route wrappers.
- `src/routes/+layout.svelte`: app shell wiring, breadcrumbs, view mode, persisted state.
- `src/lib/features/**/*.svelte`: feature pages.
- `src/lib/components/app/*.svelte`: app chrome.
- `src/lib/components/ui/*.svelte`: shared primitives only.
- `src/lib/data/fixtures.js`: demo fixtures.
- `src/lib/domain/*.js`: formatting and book/client helpers.
- `src/lib/state/app.js`: shared Svelte stores.
- `src/app.css`: Tailwind import, theme token mapping, design tokens, document defaults, and global SVG icon baseline only.

## Styling Rules

Default to inline Tailwind in Svelte markup while the product is changing quickly.

Create or keep a semantic component/class only when:

- the class list is long and repeated in the same component,
- the name captures a real UI concept like card, toolbar, tag, KPI, table, or bar,
- complex selectors, pseudo-elements, animations, or state interactions are awkward in Tailwind,
- separating structure from visual noise materially improves readability.

Otherwise, keep layout and spacing inline.

Do not put page-specific CSS in `src/app.css`. Put it in the owning component. Truly shared primitives belong in `src/lib/components/ui`.

## UI Conventions

- Use `Button`, `Card`, `Tag`, `Tabs`, `DataTable`, `Bar`, `KpiStrip`, `Kpi`, `Page`, `PageHeader`, and `Section` for repeated primitives.
- Use the existing tokens: `--ink`, `--ink-2`, `--ink-3`, `--rule`, `--surface`, `--accent`, `--pos`, `--neg`, `--warn`.
- Do not introduce new palette families without a strong reason.
- Keep mobile layouts clean. Avoid horizontal overflow.
- The hamburger/drawer is intentionally removed for now; on mobile the sidebar is hidden.

## Routing

Use real routes, not hash routes.

Core routes include:

- `/workspace/overview`
- `/workspace/clients`
- `/workspace/clients/[clientId]/portfolio`
- `/workspace/insights`
- `/meet/briefing`
- `/meet/household?tab=holdings`
- `/meet/household/holding/[symbol]`
- `/meet/insights/[insightId]`
- `/investments/alternatives`
- `/investments/structured-products`

## Data And Copy

- Keep fixture-driven UI deterministic.
- Use formatting helpers from `src/lib/domain/format.js`.
- Keep copy calm and direct. Do not over-explain UI behavior in the app.
- Dashboard dates should be generated dynamically, not hardcoded.

## Cleanup Expectations

- Do not recreate root-era React/Babel files.
- Remove unused code instead of preserving compatibility with the old app.
- Keep changes scoped to the current SvelteKit structure.
- Do not restart the dev server unless needed; the user often has it running already.

