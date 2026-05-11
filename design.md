# Slate · Design

A reference for the visual language, interaction patterns, and writing voice of Slate. Written for designers, engineers, and AI collaborators extending the product.

The audience this UI is built for is a relationship manager (RM) at a private bank or family office serving UHNW clients ($30M–$2B+). That audience has shaped every decision below.

---

## 1. Ethos

> **Calm density.** Information-rich without feeling crowded. Every pixel earns its place, but the page should never feel anxious.

Five principles that override everything else:

1. **Earned ink.** If a line, color, divider, or tag isn't doing semantic work, remove it. Defaults: no borders, no fills, no chrome.
2. **Editorial, not enterprise.** Slate looks closer to a thoughtful financial publication (FT Weekend, Stratechery, Lex columns) than to a dashboard. Serif display type, generous leading, and quiet hierarchy do the heavy lifting.
3. **Numbers are a first-class citizen.** Tabular numerals are non-negotiable. Currency, percentages, and dates are right-aligned in tables and use the mono family. Financial precision is a visual property, not just a data property.
4. **Speak the user's language.** RMs do not need to be told what concentration risk is or what an unfunded commitment is. Describe what's on screen; never lecture. (See §11.)
5. **Mobile parity.** The product must feel as considered on a 360px phone as on a 1920px monitor. Mobile is not a degraded view of desktop; it is a parallel composition with its own rhythm.

---

## 2. Who this is for

| | RM persona |
|---|---|
| Cover | 5–30 family relationships, AUM $30M–$2B per family |
| Day | Prep → meet → execute → log → repeat |
| Tools they touch hourly | Email, Excel, custodian portal, Bloomberg, internal portfolio system, CRM |
| What they're paid for | Relationship retention + opportunity sourcing + risk avoidance |
| What they hate | Re-keying data, screenshotting between systems, being unprepared, surprises |
| What they love | A briefing doc that anticipates the question, a tool their colleagues envy |

This persona drives the core design tension: **dense enough to be useful in their actual workflow, calm enough to not feel like another piece of enterprise software they hate**.

---

## 3. The aesthetic decision

We chose **editorial-meets-financial-terminal**. Concretely:

- **Editorial:** display serif for titles (Fraunces), generous whitespace, balanced text wrap, restrained color, type-driven hierarchy.
- **Financial terminal:** tabular numerals everywhere they appear, monospace for IDs/dates/amounts, dense tables, sparklines, tag pills for status.

What we rejected:
- **SaaS cheerful.** No gradients, no rounded illustrations, no playful empty states. UHNW clients are not charmed by a duck-themed loader.
- **Dashboard-y.** No giant donut charts, no "12 widgets in a 4×3 grid" page layouts. Pages have an editorial spine; widgets serve that spine.
- **Chart library look.** Every chart is hand-rolled SVG. Bars, lines, payoff diagrams, ladders. Library defaults bring chartjunk we don't want.
- **Iconography overload.** Icons are quiet, monochrome, 14–20px. Used to mark, not decorate.

---

## 4. Information architecture

The app is organized around the **RM's day**, not around the data:

| Workspace area | Job-to-be-done |
|---|---|
| **Briefing** | "What do I need to know about this family right now?" — daily landing |
| **Household** | "How do I think about their portfolio?" — analytics |
| **Alternatives** | "What's queued, what's in motion, what's the cashflow shape?" |
| **Structured Products** | "What's live, what's on the book, what's coming?" |
| **AI Insights** | "What should I be raising with them in the next conversation?" |
| **Intake** | "Get a portfolio in." — gated, pre-workspace |

Within each workspace, **tabs follow the RM's mental zoom**: from the ownership snapshot (Summary, Holdings) outward to thematic lenses (Diversification, Cashflow). Briefing is the only first-tab landing because it represents *time*, not data.

**Routing convention:**

- Top-level routes are real SvelteKit routes (e.g., `/meet/briefing`, `/investments/alternatives`, `/workspace/overview`).
- Tabs within a screen use route state or query params where deep-linking is useful (e.g., `/meet/household?tab=cashflow`).
- Detail views nest with path segments (e.g., `/meet/household/holding/AAPL`).

Every page should be deep-linkable.

---

## 5. Color system

Colors are tokenized in CSS custom properties under `:root` (light) and `[data-theme="dark"]` (dark). The palette is intentionally narrow.

### Neutrals — 5 levels of "ink" + 4 surfaces

| Token | Light | Dark | Use |
|---|---|---|---|
| `--ink` | `#14161a` | `#ececec` | Primary text, headlines, primary buttons |
| `--ink-2` | `#4a4d54` | `#b8bac0` | Secondary text, card body |
| `--ink-3` | `#767982` | `#8a8d95` | Captions, labels, axis text |
| `--ink-4` | `#b3b5bb` | `#565962` | Disabled, separators within text |
| `--rule` | `#e6e4dd` | `#272930` | Section dividers |
| `--rule-2` | `#d6d3ca` | `#353841` | Stronger borders, target ticks |
| `--bg` | `#fafaf7` | `#0e0f12` | Page background |
| `--surface` | `#ffffff` | `#16181c` | Card, table, sidebar |
| `--surface-2` | `#f5f4ef` | `#1d1f24` | Filter bar, hover state, sub-panels |

### Sign — three colors only, with soft variants

| Token | Light | Dark | Meaning |
|---|---|---|---|
| `--pos` | `#1d6b3a` | `#6ec38a` | Positive (gain, returned, success) |
| `--neg` | `#a23a1f` | `#d28774` | Negative (loss, overdue, breach, capital call) |
| `--warn` | `#8a6512` | `#d8b46a` | Warning (drift, needs attention, expiration soon) |

Each sign color has a `--*-soft` variant for backgrounds (e.g., `--neg-soft` for highlighted rows in tables).

### Accent — one only

| Token | Light | Dark |
|---|---|---|
| `--accent` | `#1f3d6e` (deep navy) | `#7aa2dc` |
| `--accent-soft` | `#e8edf5` | `#1a2638` |

Used sparingly: focus rings, the active sidebar item, important inline links, occasional callouts. **Never used for charts** (charts use ink levels for visual ordering).

### Discipline

- **Don't introduce new hues.** If something needs visual attention, use weight, scale, or one of the three sign colors.
- **Don't use brand-y blues except `--accent`.** UHNW software shouldn't look like Stripe.
- **Soft variants are for highlight rows, not for buttons.** A `var(--pos-soft)` background on an action button looks toy-like.

---

## 6. Typography system

Three families, each with a clear job:

| Family | Variable | Where |
|---|---|---|
| **Fraunces** (display serif) | `--font-display` / `.serif` | All headlines, brand wordmark, key product names. Sets the editorial tone. |
| **Inter Tight** (sans, OpenType `ss01 cv11`) | `--font-ui` (default body) | Body, UI, navigation, buttons. |
| **JetBrains Mono** (mono, `tnum` for tabular figures) | `--font-mono` / `.mono` / `.num` | All numerical values, dates, tickers, IDs, code-like text. |

### Scale

```
H1 (page-header)     44 → 36 → 26 → 22  /  serif, weight 600
H2 (section)         24                  /  serif, weight 600
H3 (card title)      18                  /  serif, weight 600
Body                 14                  /  sans, weight 400
Body small           13                  /  sans, weight 400
Body tiny            12                  /  sans, weight 400
Label                10.5  uppercase     /  mono, letter-spacing 0.12em
Eyebrow              11    uppercase     /  mono, letter-spacing 0.16em
Numerical (default)  inherits font-size  /  mono, tnum
KPI value (.v)       32                  /  mono, weight inherited
KPI value (.lg)      38                  /  mono
KPI value (.xl)      56                  /  mono — reserved for the page hero number
```

### Numerical type rules

- **Always** use `.num` or `.mono` for amounts, percentages, dates, IDs, count-of-things. The OpenType `tnum` feature makes columns of numbers visually align even with proportional digits.
- **Never** mix proportional and tabular numerals in the same table column.
- **Always** right-align numerical table cells (`.num` class on `<th>` and `<td>`).
- Compact format ($1.2M, $5.0k) for headlines and KPIs. Full format only when precision matters (transaction tickets, basis amounts in tax-lots).

### Typographic mood

- Letter-spacing is *negative* on display type (`-0.025em` on H1, `-0.015em` on H2/H3) for tighter, more confident headlines.
- `text-wrap: balance` on serif headlines so they wrap with even line lengths instead of "widowed last word" patterns.
- Labels are *uppercase mono* for visual separation from body text — they signal "this is a category, not a sentence."

---

## 7. Spacing & layout

A six-step rhythm: `4 / 8 / 12 / 16 / 24 / 28`.

- **Card padding:** 16 (compact tables), 20 (most cards), 24 (medium), 28 (hero-ish cards). Above 28 is an editorial choice, not a default.
- **Section spacing:** `.section { padding: 28px 0; border-top: 1px solid var(--rule); }`. Sections are visually separated by a hairline rule, not by extra padding alone.
- **Page padding:** `28px 36px` (desktop) → `24px 24px` (tablet) → `16px 14px` (mobile).
- **Grid gaps:** 16 (compact, mobile), 20 (standard), 24 (generous, between sections).

### Grid system

Predefined grids cover ~95% of layouts:

```
.grid-2        →  1fr 1fr                        (desktop)  →  1fr     (mobile)
.grid-3        →  repeat(3, 1fr)                 (desktop)  →  1fr     (mobile)
.grid-4        →  repeat(4, 1fr)                 (desktop)  →  2fr     (tablet)  →  1fr (small)
.grid-3-2      →  3fr | minmax(320px, 2fr)       (desktop)  →  1fr     (tablet+)
.kpis          →  repeat(auto-fit, minmax(170px, 1fr))      →  2 cols  (mobile)  →  1 col (tiny)
```

The `auto-fit` KPI grid is the system's signature responsive primitive — it works for 3, 4, 5, 6 KPIs without a single breakpoint adjustment.

### When to break the grid

- A hero section that wants a 1+2 ratio (`.grid-1-2` / `.grid-2-1`) for asymmetric emphasis.
- Custom layouts (the holding-detail hero, the alts deal card) get their own grid template — but they still respect the same gap rhythm.

---

## 8. Component vocabulary

Components are Svelte primitives plus inline Tailwind. Use a shared component only when the name captures a real repeated UI concept; otherwise keep fast-changing layout and spacing in the local Svelte markup.

### Buttons (`Button.svelte`)

- **Default:** light surface, ink text, 1px ruled border. Quiet.
- **`variant="primary"`** — solid ink with bg-color text. Reserved for the *one* most important action on a page (Confirm intake, Execute RFQ, Add to proposal).
- **`variant="accent"`** — solid accent (rarely used; for confirmation flows where primary feels too neutral).
- **`variant="ghost"`** — transparent, no border. Used in dense contexts (table rows, action-bar secondaries).
- **`size="sm"`** — smaller scale for secondary actions inside cards or rows.
- **`icon`** — square; for download / theme / hamburger.

**Touch targets on mobile:** >= 38px tall for default buttons, >= 32px for small buttons, >= 36px for icon buttons. Bumped inside the component media query.

### Cards (`Card.svelte`)

- White surface, 1px rule border, 6px radius.
- Padding is *always* set inline based on context (not via a default), because cards range from compact (`padding: 16`) to hero (`padding: 28`).
- **No shadows by default.** Hover shadows belong only on clearly clickable local surfaces; static cards stay flat.

### Tags (`Tag.svelte`)

- Mono, uppercase, small. Used for status, category, kind.
- Tone variants `pos / neg / warn / accent` use the soft color background + corresponding ink text + matching border. They're status pills, not buttons.

### Chips

- Round (border-radius: 99px), softer than tags. Used for **toggleable** selections: filter entities, theses, scenarios.
- Active state is solid ink fill with bg text.

### Segmented control

- A grouped row of mutually-exclusive options.
- The active button has a subtle inset (`box-shadow: var(--shadow-sm)`); the others are flat. Avoid heavy active-state styling (no full-color fill).
- On mobile, the seg becomes horizontally scrollable.


### Margin notes


- An accent-bordered, accent-soft-tinted callout for editorial commentary (the AAPL concentration note, the alts concentration warning).
- Treat them as the design's "footnote" — explanatory, not alarming. Use sparingly.


### Bars (`Bar.svelte`)

- Inline horizontal progress: 6px track, ink fill. Tone variants `pos / neg / accent`.
- `target` adds an absolute-positioned tick marker for "here's where you should be." Used for IPS targets, single-name caps.

### KPI strip (`KpiStrip.svelte` + `Kpi.svelte`)

- Top + bottom hairline borders span the full strip; vertical `1px` rules between KPIs.
- The first KPI has no left border on desktop; on mobile the strip becomes a 2-column grid where every odd KPI starts a new row with no left border.
- Number size should match context; reserve oversized figures for the single most important number on a page.

### Fit ring (`.fit-ring`)

- Custom small SVG progress ring, used for fit scores in Alts deal cards.
- Stroke matches the score color (`--pos` at ≥85, `--ink` otherwise).

---

## 9. Data visualization

Charts are hand-rolled SVG or lightweight Svelte/HTML primitives close to the feature that owns them. No charting library.


| Primitive | Used for |
|---|---|
| `LineChart` | Performance, holding price, cash balance trajectory |
| `Spark` | Inline 12–36 month sparklines in tables and account cards |
| `Donut` | Asset class allocation, sector exposure |
| `Bars` | Generic bar charts (rare) |
| `PayoffDiagram` | Structured product payoff shapes (phoenix / reverse_convertible / buffer / booster) |
| `JCurve` | Cumulative PE cashflows |
| `CashflowBars` | Quarterly capital calls vs distributions |
| `StackedCashflow` | Per-source income/outflow bars on the household cashflow tab |

### Chart conventions

- **Colors:** ink levels for nominal categories; sign colors for sign meaning (calls = `--neg`, distributions = `--pos`).
- **Axis labels:** mono, 9px, `--ink-3`. Minimal — only critical values labeled, never every tick.
- **Gridlines:** dashed `2 4` in `--rule`, except the zero line which is solid.
- **Annotations:** in-chart labels with a small dot marker and a 14px diagonal leader line. Used for "Mar drawdown" style call-outs.
- **Hover tooltips:** native SVG `<title>` elements on each segment. We don't build custom tooltips — the browser-native one is good enough and accessible.

### Legends

- Always placed *below* the chart, never on the side.
- Custom legend rows: 12×12 swatch with the chart color + ink-3 label. Same pattern repeats: payoff diagram, J-curve, stacked cashflow.

### Honesty principle

- **No 3D effects.** No drop shadows on charts. No gradient fills "for visual interest."
- **Distributed data is shown as a range or noted as estimate.** Future alt distributions are tagged "GP estimate · low confidence" in tooltips.
- Confidence indicators in legend tooltips (high / med / low) — see Cashflow tab.

---

## 10. Interaction patterns

### Hover

- **Tables:** rows lighten to `--surface-2` on hover when clickable.
- **Cards (clickable):** border darkens to `--ink-3`, subtle `--shadow-md` appears.
- **Buttons:** background lightens, border tightens.
- **Charts:** native browser tooltip on segment hover.

Hover **never** changes layout; it changes color and shadow only.

### Click → drill-down

- Top concentrations row → holding detail (`/meet/household/holding/<symbol>`).
- Insight card → insight detail (`/meet/insights/<id>` or `/workspace/insights/<id>`).
- Quarter row in cashflow → updates an inline drilldown panel below the table.
- Deal card → ideally would open a deal detail (placeholder).

### Tooltips for jargon

- Every column header containing finance jargon (DPI, RVPI, TVPI, MTM Day-1, vs best, etc.) has an HTML `title=` attribute with a one-sentence definition.
- Helper cursor `cursor: help` signals that the tooltip exists, without visual clutter.
- This is how we serve both finance natives (don't need the tooltip) and newcomers (hover to learn).

### Scenarios (Cashflow tab)

- Pill toggles at the top of the page. Active state = solid ink fill.
- Toggling re-derives every chart, KPI, and table on the page **live**, plus shows a "delta to base" badge so the impact of the scenario is quantified.
- Prefer pill toggles over checkboxes for UHNW workflows — they're more decisive.

### Page transitions

- A subtle fade-up (`@keyframes fadein` on `.page`, 180ms) on every route change. Just enough to feel intentional, never distracting.

---

## 11. Voice & tone (writing)

This is where most products fall down. Slate's writing rules:

### Describe what's on screen. Never lecture.

| Don't ❌ | Do ✓ |
|---|---|
| "UHNW families think entity-by-entity: which legal pot funds which obligation?" | "Each entity's inflows, outflows, and net across the window." |
| "Institutional treasury rule of thumb: keep at least 12 months on hand for HNW families with active alts deployment." | "Months of year-1 burn rate that current liquid cash sustains. Flags amber below 12 months." |
| "An LP with $16.6M of unfunded commitments doesn't need $16.6M sitting in overnight cash. The GP gives ~10 business days notice…" | (Move it out of the UI; let the data speak.) |

### Hierarchy: section header > subtitle > body

- **Section header** (H2): name the thing. *"Capital calls vs. distributions · next 12 quarters"*.
- **Subtitle** (`.sub`): one short factual line. *"Drives how much liquidity is needed when. Bars below the line are wires out; bars above are cash coming in."*
- **Body / context strings**: factual, terse. *"Pine Ridge II — final call."* Not *"This is the final remaining capital call to satisfy the original commitment of $10M."*

### When to use the editorial voice

The serif `H1` plus a `<p className="text-2 mt-8">` paragraph in the page-header is allowed an *editorial* register — it's setting up the page. Example:

> *"Quote one trade across 10 dealers in parallel. Slate normalizes terms so the comparison is apples-to-apples, tracks issuer fill quality, and watches the existing book's barriers and observation calendar."*

Inside the page (subtitles, tooltips, table cells), keep it tight.

### Numbers

- Currency uses `$` prefix, never `USD` suffix.
- Compact format ($1.2M, $5.0k) in headlines and most contexts; full format only where precision matters.
- Signed numbers: `+` prefix for positive deltas, `−` (real minus, not hyphen) for negative — already wired into `fmt.money`.

### Never

- Emoji in product copy. (One exception: lock/check icons in dense status cells where a glyph beats a word.)
- Loaded language ("amazing", "powerful", "groundbreaking"). RMs read past it.
- Conditional confidence ("might be useful", "could potentially"). Either show or don't.
- Marketing hedges ("subject to terms"). Use clear caveats: *"Distributions are GP estimates, ±1–2 quarters of timing variance."*

---

## 12. Mobile adaptations

Mobile is a parallel composition, not a degraded view.

### Layout shifts

| | Desktop | Tablet (≤1024) | Mobile (≤768) | Tiny (≤380) |
|---|---|---|---|---|
| Sidebar | 240px sticky rail | 200px rail | hidden behind hamburger | same |
| Topbar | Crumbs / search / theme / download / avatar | same, less padding | `[≡] [S Slate · Section] [☾]` | wordmark hides |
| H1 | 44 | 36 | 26 | 22 |
| KPI strip | `auto-fit minmax(170px, 1fr)` | same | 2 cols | 1 col |
| `.grid-2/3/3-2` | full | mostly stacked | 1 col | 1 col |

### Topbar on mobile

The trickiest piece. Brand presence is non-negotiable on mobile (it's the only place the wordmark appears once the sidebar is hidden). The pattern is:

```
[≡]  [S Slate · Briefing]                              [☾]
```

- Brand wordmark and section share the **same display font, same size (17px), same line-height (1.2)** — so they sit on the same baseline naturally without typography hacks.
- Differentiation is by **weight** (600 brand / 500 section) and **color** (ink / ink-2).
- Separator is a single middle dot `·` in `--ink-4`, baseline-aligned via flex.
- The brand is clickable — tap = go home (Briefing).

### Sidebar drawer

- Slides in from left (280px wide, max 86vw) with backdrop fade.
- Backdrop tap, in-drawer close button, *or any nav item tap* closes it.
- Auto-closes on route change (lifted state in `App`).
- z-index: drawer 100 > backdrop 99 > topbar 5 > action-bar 4.

### Touch targets

- All `.btn` ≥ 38px tall on mobile. `.btn.sm` ≥ 32px. `.btn.icon` ≥ 36px.
- Sidebar nav items get 12px vertical padding (~40px tap targets).
- Brand link gets 6px vertical padding (~38px target).

### Scroll patterns

- **Tabs** scroll horizontally on mobile (cleaner than two-row wrap).
- **Filter bar** scrolls horizontally.
- **Tables** scroll horizontally inside `.table-wrap`.
- **Seg controls** scroll horizontally.

In every case, **the scrollbar is hidden** (`scrollbar-width: none` + WebKit override) — mobile users discover the scroll affordance by trying. Native iOS/Android scroll behavior takes over.

---

## 13. Accessibility

The bar:

- **Color contrast.** Text-on-surface combinations are checked. `--ink-3` is the lowest text color used and meets WCAG AA on `--bg`.
- **Focus indicators.** All interactive elements get a visible focus ring (`:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` is the convention).
- **Keyboard.** Every clickable card / row should be focusable and activatable via Enter/Space (a known gap in this prototype — production must wire this up).
- **Semantics.** Use `<button>` for actions, `<a>` for navigation, `<table>` with `<thead>`/`<tbody>` for tabular data. Never use `<div onClick>` where a semantic element exists.
- **`title` tooltips.** Used liberally for jargon. Native browser tooltip is keyboard-reachable on focus.
- **Dark mode.** Full token coverage; toggle in topbar persists in `localStorage`.

---

## 14. What we explicitly choose NOT to do

This list matters as much as the do's:

- **No skeleton loaders.** This is a prototype; a real product would add them, but the skeleton-pulse aesthetic is jarring against editorial calm. If we add them, they'll be quiet — a single low-opacity placeholder, not a flickering shimmer.
- **No toasts / snackbars.** UHNW workflows benefit from durable, scannable feedback (a row in a log, an updated count). Toasts disappear; serious work needs receipts.
- **No modal-everywhere.** Drilldowns happen in-place (the cashflow per-quarter panel) or in a routed sub-view (holding detail), not in floating modals. The exception is destructive confirmation, where a modal is appropriate.
- **No left-rail filters.** Filters live at the *top* of the content, in a chip strip (FilterBar) or in the table-header row. Slate's spine is editorial, not Salesforce.
- **No hamburger on desktop.** The sidebar is always visible. Hamburger is mobile-only.
- **No empty states with illustrations.** Empty states get a quiet centered message in `--ink-3` — no "no results found 😢 here's a friendly raccoon".
- **No social/colored progress arcs.** Progress is a thin track and a fill, ink on rule. The aesthetic is "fine pencil drawing of progress," not "gauge dashboard."
- **No fully shadowed cards.** A card might gain a hover shadow if clickable; static cards are flat.
- **No animated decorative SVG.** Animation is reserved for state changes (page fade, sidebar slide, hover transitions). Loaders pulse, scenarios re-derive — but nothing animates "for fun."

---

## 15. Working with this design — for AI collaborators

If you're an AI extending Slate, here is the heuristic stack to apply, in order:

1. **Does the existing pattern cover this?** Look at how a sibling page solves the same problem before inventing. KPI strips, section headers, drilldown panels, tag pills, margin notes — these are the vocabulary.
2. **What's the right level of editorial copy?** Re-read §11. If a subtitle or tooltip is more than one sentence, it's probably preachy. Cut it.
3. **What's the responsive shape?** Picture the same layout on a 360px phone before declaring it done. Will the grid collapse cleanly? Does the page-header meta stack? Are touch targets ≥ 38px?
4. **Is the data honest?** If a number is a forecast or estimate, it should be tagged as such (confidence band in tooltip, italic caveat, or visual treatment).
5. **Does it follow the color discipline?** New accent? Probably not. New ink level? No. Use what's there.
6. **Would an RM open this and feel calmer or more anxious?** If the answer is more anxious, the design is wrong. Reduce, don't add.

A useful test for any new component or page:

> *Could this be on the cover of an FT Weekend money supplement and not look out of place?*

If yes, it probably fits Slate. If no, ask why not.

---

## Quick reference

```css
/* The five tokens used most often */
var(--ink)       /* primary text */
var(--ink-3)     /* labels, subtitles */
var(--rule)      /* horizontal hairlines */
var(--surface)   /* card / table background */
var(--accent)    /* one strong color, used sparingly */
```

```css
/* The three font usages */
font-family: var(--font-display)   /* serif headlines, brand */
font-family: var(--font-ui)        /* default body */
font-family: var(--font-mono)      /* numbers, dates, IDs */
```

```css
/* The two responsive primitives */
.kpis  /* auto-fit grid that handles 3–6 KPIs */
.tabs  /* horizontal-scroll on mobile */
```

That's most of Slate's design system in one page.
