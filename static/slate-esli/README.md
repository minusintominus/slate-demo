# Slate · Wealth OS — a guided tour

Slate is a prototype workspace for a **Relationship Manager (RM)** at a wealth advisory firm. An RM is the person at the bank or advisory shop who handles wealthy families end-to-end: knows their goals, signs them up for the right investments, monitors what they own, prepares for every meeting, and writes the proposals that get put in front of them.

This README is written for someone who has never worked in wealth management. Each section first explains the **concepts** in plain English, then shows where they live in the UI so you can click around and see the ideas in action.

If you already know finance and want a code/UI walkthrough, jump to **[Stack notes](#stack-notes)** at the bottom.

---

## Table of contents

1. [The world Slate lives in](#1-the-world-slate-lives-in)
2. [Onboarding: how a portfolio gets in](#2-onboarding-how-a-portfolio-gets-in)
3. [The Household: looking at what the family owns](#3-the-household-looking-at-what-the-family-owns)
4. [AI Insights: the three things to talk about](#4-ai-insights-the-three-things-to-talk-about)
5. [Alternatives: private investments](#5-alternatives-private-investments)
6. [Structured Products: custom-shaped trades](#6-structured-products-custom-shaped-trades)
7. [Glossary](#glossary)
8. [Stack notes](#stack-notes)

---

## 1. The world Slate lives in

### The cast

- **Household** — one family treated as a single financial unit. The demo's household is the **Marchetti Family**, established 2014, classified UHNW (Ultra-High-Net-Worth, generally >$30M).
- **Account** — a numbered pot of money that lives at a particular **custodian** (Schwab, Fidelity, Pershing, JPM Private). The family typically has several. The Marchettis have four: a joint brokerage at Schwab, a Roth IRA at Fidelity, a family trust at Pershing, and an alts/private account at JPM Private.
- **Position** — a holding inside an account. "12,400 shares of AAPL in the Schwab joint account" is one position.
- **Custodian** — the institution that physically holds the assets. The advisor and the custodian are usually different firms; statements come from the custodian.
- **Relationship Manager (RM)** — Christine Holloway in the demo. She advises, but doesn't custody anything herself.

### The IPS — the rulebook

The **Investment Policy Statement** is a written agreement between the family and the advisor. It says things like:
- *"Aim for 38% US equity, 16% international equity, 28% fixed income, 13% alternatives, 5% cash."* These are **target allocations**.
- *"No single stock should be more than 7% of total wealth."* This is a **single-name cap**.
- *"For the trust, prefer floating-rate income."* This is a **mandate**.

**Drift** is when reality wanders away from the IPS — for example, AAPL ran up and now sits at 14.8% of household wealth, twice the 7% cap. RMs spend a lot of their time watching for drift and proposing trades that pull things back into line.

### Asset classes

A coarse taxonomy used everywhere:
- **US equity** — stocks of US companies (AAPL, MSFT, etc.).
- **International equity** — non-US stocks (developed and emerging).
- **Fixed income** — bonds (Treasuries, munis, corporates) — pay interest, return principal at maturity.
- **Alternatives** — private investments (see §5).
- **Cash & equivalents** — money-market funds, T-bills, sweep cash.
- **Commodity** — gold, oil, etc.

### Cost basis, unrealized gain, tax lots

When you buy a stock, what you paid is the **cost basis**. If you bought at $100 and it's now $180, you have an **unrealized gain** of $80 — you haven't sold, so you don't owe tax yet. The moment you sell, it becomes a **realized** gain and you owe capital gains tax.

A **tax lot** is one purchase batch. If you bought 100 shares in 2018, 100 more in 2022, and 100 more last week, that's three lots — each with its own basis, each independently **long-term** (held > 1 year, lower tax rate) or **short-term** (≤ 1 year, taxed as income).

This matters because RMs can be surgical: instead of "sell some AAPL," they can say "sell the high-basis 2022 lots and keep the low-basis 2018 ones for charitable donation," minimizing the tax hit.

---

## 1.5. Briefing — the daily landing page

`#briefing` — what an RM opens first thing. Designed so a colleague picking up the file (RM is on PTO) can read the relationship in 60 seconds.

Sections:

- **Header strip** — date, family name, segment, NW, days since last contact, days to next meeting (auto-flagged accent blue if within a week).
- **Needs attention** — overdue follow-ups + high-priority events within 14 days, color-coded.
- **Next meeting · Last meeting** — side-by-side cards. Next shows attendees, agenda, *Build prep deck* / *Reschedule* CTAs. Last shows the summary recap and follow-up close rate.
- **Open follow-ups** — full table of commitments with owner, due date (with overdue countdown), priority dot, status tag.
- **Upcoming · 30 days** — every dated obligation: deadlines, RFQ closes, deal closes, tax dates, observation dates, and personal events (Sofia's graduation).
- **Family · Team & advisors** — multi-generational family panel + Slate team + external advisors (attorney, CPA, insurance).
- **Recent contact · Portfolio news** — communication log + position-relevant headlines colored by impact.
- **Action bar** — *Open thread · Log contact · Build prep deck*.

This is the page that turns Slate from a portfolio viewer into the RM's actual workspace. The Marchetti family's Briefing surfaces: 1 overdue follow-up (Northwind brief due to attorney), 4 high-priority events this week, the May 19 review meeting with its agenda, and the AAPL exchange-fund analysis David Chen owes by May 15.

## 2. Onboarding: how a portfolio gets in

**The problem:** the family's wealth is scattered across four custodians who each send their own PDF statement on their own schedule. Nobody has a single view.

**Slate's pitch:** drop the PDFs, get a unified workspace.

The demo simulates this in three screens:

| Screen | What it shows | What concept it's teaching |
| --- | --- | --- |
| **Upload** (`#upload`) | Drag-and-drop empty state. Lists supported custodians and security badges. | Custodian fragmentation — why aggregation is needed in the first place. |
| **Parsing** (`#parsing`) | Animated 5-step progress: text extraction, custodian reconciliation, CUSIP matching, cost basis, anomaly detection. | The pipeline isn't just OCR — it's also matching **CUSIPs** (the 9-character security ID) to a security master, and reconciling positions across multiple statements. |
| **Parse review** (`#review`) | Table of every parsed position. Some rows are **flagged** because the parser couldn't auto-resolve them (missing tax lot dates, alt funds without a CUSIP, idle cash that crossed a threshold). | Real-world data is messy; the RM needs to confirm before the dashboards are trustworthy. |

Click *Confirm & build dashboard* and the workspace navigation unlocks.

---

## 3. The Household: looking at what the family owns

`#household` — four tabs.

### Summary tab

A one-page review of the family's financial position. Sections:

- **Net worth** — sum of all positions across all accounts. (If you've selected a subset of entities in the filter bar, this becomes "Filtered value.") The **delta** (▲ 3.27%) is period-over-period change.
- **Liquid** — what fraction can be turned into cash quickly. Alts and some structured products are not liquid.
- **Unrealized gain** — total of (market value − cost basis) across all positions. This is what you'd owe tax on if you sold everything today.
- **YTD income** — dividends + interest received this calendar year.
- **Performance chart** — three lines over 36 months. The thick black line is the household; the dashed lines are benchmarks (S&P 500, "60/40" = 60% stocks 40% bonds). Comparing to benchmarks tells you whether the portfolio is doing better or worse than a passive default.
- **Allocation donut** — what fraction sits in each asset class, with each slice's IPS target shown next to it. A drift note flags the largest overweight.
- **Accounts in scope** — one row per account showing value, % of total, YTD return, and a 12-month sparkline.
- **Top concentrations** — the five biggest single positions. Bars turn red past the 7% IPS cap. Click a row → holding detail.
- **3 things to discuss** — the AI Insights cards (see §4).

### Holdings tab

Sortable, filterable table over every position. Columns: Security, Class, Account, Quantity, Price, Market Value, % of scope, Unrealized G/L (gain or loss), %.

**Filter bar at the top of the page** lets you narrow scope to certain accounts (e.g., "only show what's in the trust"). Holdings, Diversification, Allocation, and Insights all respond to this filter.

### Diversification tab

The same allocation question, examined from four angles:

- **Asset class vs IPS** — the same data as the donut, but as bars. Tick = target, bar = actual. Bar turns red past 5pp drift. Easier to read precise numbers than a donut.
- **Single-name caps** — bars per top-10 position; turn red past 7% (the single-name cap).
- **Equity sector exposure** — within just the equity sleeves (US + international), which **sectors** (Technology, Financials, Healthcare…) dominate. Important because overweighting tech via index funds is invisible at the asset-class level but glaring here.
- **Geographic mix** — US vs developed international vs emerging markets, with look-through where available (e.g., a fund-of-funds that itself holds international names is split into its components).

### Accounts tab

One card per custodian account. Useful when you want to think about a single account's composition (the trust vs. the joint vs. the Roth often have different goals).

### Cashflow tab

Forward-looking 8-quarter view: where money comes from, where it goes, and what the running cash balance looks like.

**Why this matters:** the rest of the household tabs are snapshots — they tell you what the household *owns* today. Cashflow tells you whether they'll have *liquidity when they need it*, which is a different question. With $15M+ of new alt commitments queued up over the next 18 months against recurring net outflows of ~$1M/qtr, dips in cash balance are the real near-term risk; this tab surfaces them in advance.

Sections:
- **Scenario toggles** at the top of the tab: pill-style buttons for *"Pine Ridge II exit slips 6 months"*, *"Family wedding · $1.5M Q2 2027"*, *"Next-gen gift · $2M Q1 2028"*. Toggling any of them re-derives the entire chart, balance trajectory, table, drilldown, and KPIs live, plus shows the *delta* to the base-case minimum cash (e.g., "−$1.5M tighter"). This is what makes the page feel like a *tool* rather than a report — UHNW RMs constantly play "what if" with exit timing, lifestyle events, and family-governance distributions.
- **KPIs:** Starting cash, **liquidity coverage** (months of recurring net burn the current cash sustains — institutional-grade metric, flags amber under 12 months), average annual inflows, average annual outflows, **min projected cash** (auto-flagged amber if it dips below $3M — Marchettis hit $2.0M in Q3 2027 before the Pine Ridge II exit recovers it).
- **Quarterly cashflow chart** (`Charts.StackedCashflow`) — one bar per quarter, inflows above the zero line and outflows below, color-coded by source: equity dividends, bond coupons (Treasury and muni semi-annual schedules interleave so quarters stay roughly flat), structured-product coupons, MMF interest, alt distributions; capital calls, investment fees, estimated taxes, lifestyle withdrawals.
- **Cash balance trajectory** — line chart starting at today's cash, applying every projected flow on its quarter. Auto-generates a "Liquidity tightness" margin note when the trajectory crosses the warning threshold.
- **Per-quarter aggregate table** — In, Out, Net, running Balance for each of the 8 quarters. Rows are *clickable* — selecting one updates the drilldown panel below.
- **Per-quarter drilldown panel** — opens for the selected quarter, showing a complete source-by-source decomposition split into Inflows and Outflows cards. Each source line carries a contextual hint where it adds value (e.g., the alt-call rows pull `notes` from `ALT_CASHFLOW`, so 2026Q3's call shows "Pine Ridge II — final call"; bond-coupon rows note specific bond payment schedules; April-tax quarters note the prior-year settlement). Defaults to the first quarter on tab load.
- **Cashflow by entity** — 4 cards (Joint Brokerage, Roth IRA, Family Trust, JPM Alts), one per legal entity, each showing 2-yr inflows / outflows / net plus the top contributing sources to each side. Reflects how UHNW RMs actually think: "the trust generates $1M of surplus that funds JPM Private's capital calls; the joint account absorbs the tax and lifestyle outflows." Source-to-entity attribution uses each source's natural account home (bonds → trust, alt commits → JPM, equity dividends → primarily joint).
- **Cross-link** to Alternatives → Cashflow plan for the alts-specific treasury workflow.

**Realism caveat (also stated in the UI):** capital calls follow industry-typical drawdown patterns and are reasonably knowable. Alt distributions — especially exit distributions like Pine Ridge II's projected $7M in Q4 2027 — are *GP estimates*, with timing dependent on actual M&A or IPO of underlying companies. ±1–2 quarters of variance is normal; magnitude varies with exit valuation. The forecast is a planning input, not a fact.

### Holding detail (`#household/<symbol>`)

Click any row in Holdings or any row in Top concentrations. Shows:

- **Hero** with security name, asset class, sector, custodian/account, market value, % of household.
- **Flagged note** if the parser couldn't fully resolve this position.
- **KPIs**: quantity, cost basis, unrealized $ and %, average cost per share.
- **Price chart** — 36 months.
- **Tax lots table** — the position broken into purchase batches with date, qty, basis, unrealized, term (LT/ST). This is where surgical tax decisions get made.

---

## 4. AI Insights: the three things to talk about

`#insights`

The whole point of an RM meeting is to *do* something — surface a problem, propose a fix. Slate watches the household and surfaces the most actionable items. The demo has three:

1. **Concentration · high priority.** AAPL is 14.8% of net worth, IPS caps it at 7%. There's $4.1M of unrealized long-term gain so a clean sale is tax-inefficient. **Three suggested actions:** use a *351 exchange fund* (defer cap gains 7 years and instantly diversify), donate low-basis lots to the family foundation (no tax on appreciated gifts), run a *10b5-1 dribble plan* (a pre-set selling schedule that's legally insulated from insider-trading concerns).
2. **Tax · high priority.** $840k of *harvestable losses* in EM equity. Selling a position at a loss generates a deduction that offsets gains elsewhere — *tax-loss harvesting*. The trick is the **wash-sale rule**: if you re-buy the same security within 30 days, the loss is disallowed. The note says the wash-sale window is clean and recommends swapping into a similar-but-not-identical fund to maintain exposure.
3. **Cash drag · medium priority.** $5.8M sitting in a 0.4% sweep account. Moving it to a Treasury MMF at ~5.2% adds ~$278k/yr of income. There's a $1.8M capital call due Q3 (see §5), so $1.8M needs to stay liquid; the rest can move.

Each card carries quantified **impact**: dollars **repositioned**, dollars in **tax saved**, dollars per year of **income lift**. The summary banner at the bottom totals them all and frames it as *"a single 18-month plan."*

Click any card → detail page with the three suggested actions.

---

## 5. Alternatives: private investments

`#alts`

### What "alternatives" means

When most people say "investing" they mean publicly-traded stocks and bonds — anyone can buy them through a broker, prices update every second, you can sell tomorrow. Alternatives are the opposite: **private**, **illiquid**, **long-term**, and (usually) only available to wealthy investors due to regulation.

The main flavors:

| Strategy | What it is | Typical horizon | Typical return target |
| --- | --- | --- | --- |
| **Buyout (PE)** | A fund buys whole private companies, improves them, sells them years later. | 10 years | 15–22% |
| **Private credit** | Lending directly to mid-size companies (instead of via banks/bonds). Returns mostly come from interest, often **floating-rate** (rises with rates). | 5–7 years | 8–12% |
| **Real assets / infrastructure** | Solar farms, toll roads, multifamily housing — long-lived physical assets paying steady cash. | 8–15 years | 10–15% |
| **Venture capital** | Investing in early/late-stage private startups. High variance: a few huge winners pay for many losses. | 10+ years | 20%+ (with wide spread) |
| **Secondaries** | Buying *existing* LP interests from other investors who want out — typically at a discount. Lets you skip the early years of negative returns. | 5–7 years | 14–17% |

### How a private fund actually works

1. **Commitment.** You pledge to invest, say, $10M. You don't write the check yet.
2. **Capital calls.** Over the next 3–5 years, the fund manager (the **GP**, or General Partner — you're the **LP**, Limited Partner) calls capital in tranches. "Wire $1.5M by Friday."
3. **Investments.** The GP uses called capital to buy companies/loans/assets.
4. **Distributions.** As things get sold, cash comes back to LPs. Usually starts trickling in around year 4–6.
5. **Wind down.** Around year 10 the fund ends, the last assets are sold, the final distributions go out.

**Vintage** = the year the fund started investing. Vintages matter because returns depend heavily on what the economy was doing when the GP was deploying capital. A fund that bought during 2008 looks different from one that bought during 2021.

### The metrics

These come up everywhere in the alts UI:

- **Commitment** — total pledged, e.g., $10M.
- **Called** — how much has actually been drawn so far. "84% called" = $8.4M wired.
- **DPI** *(Distributions to Paid-In)* — cash you've gotten back ÷ cash you put in. **0.37×** means $0.37 returned for every $1 contributed. Above 1× means you've gotten your money back; further above is profit in hand.
- **RVPI** *(Residual Value to Paid-In)* — what's still in the fund, marked to its current value, ÷ cash you put in. 1.00× means there's still $1 of value sitting in the fund per $1 you contributed.
- **TVPI** *(Total Value to Paid-In)* = DPI + RVPI. Total return multiple — both what's been distributed and what's still there. **1.37×** means $1.37 of value (realized + unrealized) per $1 you put in.
- **IRR** — *internal rate of return*, an annualized %. Captures both magnitude and *timing* — getting $1.37 back after 5 years is much better than after 12.
- **The J-curve** — chart the cumulative cashflow. In year 1 you're deeply negative (wired in capital, no distributions yet). The curve dips down, bottoms out, climbs back through zero around year 4–6, then keeps climbing as distributions arrive. The shape literally looks like the letter J. It's why people who are new to PE feel terrified for years before things click.

### The fee structure

- **Management fee** — annual %, typically 1.25–2.0% of committed capital, paid to the GP regardless of performance.
- **Carry** *(carried interest)* — the GP's share of profits, typically 15–25%. Usually only paid above an **8% hurdle** (the LPs get the first 8% before carry kicks in).
- **GP commit** — how much of the GP's own money is in the fund, alongside LPs. Higher = more aligned. 2–5% is typical.
- **Co-invest** — sometimes the GP lets you invest in a single deal alongside the fund, often with no fees. Attractive for big LPs.

### A "fit score" for deals

When new offerings hit the desk, the RM has to decide which to pitch. Slate scores each deal 0–100 across four dimensions, summing to the headline score:

| Dimension | Out of | What it captures |
| --- | --- | --- |
| Sponsor track | 30 | Has this GP done well in prior funds? |
| IPS fit | 35 | Does this match the family's stated objectives? |
| Vintage timing | 20 | Is *now* a smart year to be investing in this strategy? |
| Diversification | 15 | Does this add to a gap, or pile onto something already heavy? |

### How the four Alternatives tabs map to all this

**Deal flow (`AltsDealFlowTab`)** — six offerings sorted by fit score. Filter by:
- **Theses** chips (US reshoring, Floating-rate income, AI infrastructure, IRA-driven climate, Sun Belt demographics, PE secondaries discount). A *thesis* is a stated investment view the household has subscribed to. Toggling chips off hides deals tagged with that thesis.
- **Strategy** segment buttons (All / Buyout / Credit / Real Assets / Venture / Secondaries).

Each card shows the four-part fit breakdown, target IRR, term, minimum check, fee terms, a one-line *"Why it fits,"* status (Open / Limited), close date, raise progress, GP commit, and a co-invest tag if available.

**Strategy mix (`AltsStrategyMixTab`)** — the *Marchetti's* alts sleeve broken down vs the IPS sub-targets within alts. Today the family has $8.4M committed to private investments — *all* of it in one Buyout fund (Pine Ridge II). The IPS calls for 35% Buyout, 25% Credit, 20% Real Assets, 10% Venture, 10% Secondaries. So they're 65pp overweight Buyout and 0% in everything else. Bars turn red past 15pp drift. The right column flags this as a concentration risk and points at the Pacing plan tab.

**Holdings (`AltsHoldingsTab`)** — detail page for the one fund they hold:
- Six PE return metrics in a strip (Commitment, Called, DPI, RVPI, TVPI, Net IRR).
- The **J-curve** chart over 11 quarters of history. Solid line = total value (NAV + cumulative distributions). Dashed red filled area = cumulative capital called, plotted negative. You can see the J: deeply negative early, climbing as distributions come in.
- Capital call schedule — when the next wires/distributions are expected.

**Pacing plan (`AltsPacingTab`)** — the proposed 18-month commitment schedule that fixes the concentration:
- $5M to Pine Ridge IV (Buyout) Q3 2026
- $2.5M to Atlas Direct Lending VII (Credit) Q4 2026
- $5M to Northwind Climate Infra (Real Assets) Q1 2027
- $2.5M to Helios Secondaries (Secondaries) Q2 2027

Diversifies across strategies *and* spreads vintages (2026 and 2027), reducing the bet that any one year was the wrong moment to deploy. Dots on the timeline are green for "On track," amber for "Discussion."

**Cashflow plan (`AltsCashflowTab`)** — the operational consequence of the Pacing plan: when does cash actually move?

The key concept is the **unfunded commitment**. When a household commits $10M to a private fund, they don't wire $10M on day one — the GP draws it over 3–5 years. So at any moment, you have a *promise* to wire money in the future. With the Marchettis' Pine Ridge II final call ($1.6M) plus $15M of new pacing-plan commitments still to be drawn, the household is sitting on **$16.6M of unfunded commitments**.

Naive answer: park $16.6M in overnight money-market funds so it's ready when GPs call. Better answer: match the *maturity* of where the cash sits to the *timing* of the call. A T-Bill maturing in March 2027 is just as available as overnight cash on March 1st 2027 — but it earns the 1-year yield instead of the overnight yield.

Tab shows:
- **KPI strip** — Total committed ($25M), Already called ($8.4M), Unfunded ($16.6M), Next 12-mo net cashflow.
- **Cashflow projection chart** (`Charts.CashflowBars`) — capital calls (red, downward bars) vs. distributions (green, upward bars) per quarter for 12 quarters. Drives intuition for *when* liquidity is actually needed.
- **Quarterly detail table** — same data as the chart in tabular form, with notes about which funds drive each quarter.
- **Unfunded ladder** — the $16.6M split into four maturity buckets (0–6 mo, 6–18 mo, 18–30 mo, 30 mo+) with a recommended instrument and indicative yield per bucket. A horizontal stacked bar shows the proportional split.
- **Income comparison** — laddered weighted yield (~4.79%) vs. assumed MMF average over the call horizon (~4.5%) → **+$48k/yr** lift, plus reinvestment-risk hedging.
- **Coverage check** — total expected calls ($15.35M) − total expected distributions ($11.50M) = $3.85M net to fund from outside the alts sleeve over 3 years.

This is **institutional treasury practice**, sometimes called "duration-matched cash management" or "unfunded commitment investment." Foundations, endowments, and family offices with material private allocations all do some version of this; for the typical UHNW household it's still under-utilized.

---

## 6. Structured Products: custom-shaped trades

`#structured`

### What a structured product is

A **structured note** is a bond issued by a bank with a derivative payout glued onto it. You give the bank money, the bank promises to pay you back with a return that depends on something else — usually a stock or stock index. Two ingredients always:

1. **Issuer credit.** The bank has to be solvent at maturity to pay you. So you care about the issuer's **credit rating** (A, A+, AA, etc.). If the issuer goes bankrupt, you're an unsecured creditor.
2. **Embedded derivative.** Options that shape your payoff — capping upside, providing partial downside protection, paying contingent coupons, etc.

Structured notes let an RM **shape risk**: turn a position you can't quite buy in cash markets ("I want most of S&P upside but limited downside, willing to give up a little on the upside in exchange") into one trade.

### The vocabulary

- **Underlier** — what the payoff depends on. Could be one stock (AAPL), an index (S&P 500), or a **basket**. A **worst-of basket** uses whichever underlier in the basket is performing worst at observation time — riskier (and therefore higher coupon) than a single name.
- **Notional** — the headline size, e.g., $5M. You give the bank this much.
- **Tenor** — how long, e.g., 2 years.
- **Coupon** — the income payment, usually annualized, typically paid quarterly. May be **contingent** (only paid if a condition is met).
- **Observation dates** — pre-scheduled dates when conditions get checked (typically quarterly).
- **Barrier** — a level on the underlier that decides what happens. Crucial concept; varieties below.
- **Soft vs hard barrier.**
  - *Soft (contingent) barrier* — only matters at maturity. Lets the underlier dip through the barrier mid-term and still pay full principal if it recovers by the end.
  - *Hard barrier* — locks in losses the moment it's breached.
- **European vs American observation.**
  - *European* — observed only at maturity / specific dates.
  - *American* — observed continuously. Riskier for the investor.
- **Autocall** — if the underlier is above a level on a scheduled observation date, the note "calls" — bank returns principal early plus accrued coupon. Caps your upside at the coupon you've earned, but you get out clean.
- **Memory feature** — if a coupon was missed in a prior period because the barrier was breached, but the barrier is back above the threshold now, you collect *all* the missed coupons. "Memory" because the note remembers what it owes you.
- **Mark-to-market (MTM)** — what the note is worth right now if you sold it on the secondary market. **Day-1 MTM** of 99.85 means at issue, the note's fair value is 99.85% of par — you've already paid a small embedded fee.

### The four payoff shapes

The Templates tab shows mini diagrams for each. They all plot **payoff (% of notional)** on the Y-axis vs **underlier performance (−50% to +50%)** on the X-axis.

- **Phoenix (income).** Flat coupon line above the barrier; if the underlier crashes through the barrier, you take the loss directly. Used for *yield enhancement* — you accept downside risk in exchange for a fat coupon.
- **Reverse convertible.** Similar to phoenix but more aggressive — coupon above the barrier; coupon *plus* underlier loss below. Highest income, scariest downside. Best on single names you wouldn't mind owning at a discount.
- **Buffer note (defensive).** Capped upside (≤25%); zero return inside the buffer band; 1-for-1 loss past the buffer. Trades upside for hard partial protection. Conservative.
- **Booster (growth).** 1.5× upside (capped, e.g., at 30%); zero in the cushion; 1-for-1 loss past the floor. Trades coupon for *amplified upside*. Used when an RM is bullish but wants protection on the downside.

### How an RFQ works

**RFQ = Request For Quote.** Each issuer (bank) prices the same note slightly differently because they have different inventories, hedging costs, and risk appetites. So instead of going to one issuer, the RM sends the same trade specification to 8–10 dealers in parallel and lets them compete.

The procedure:

1. RM defines the trade — underlier, notional, tenor, barrier, observation schedule. *(Trade ticket card.)*
2. The system sends the spec to N issuers simultaneously. *(Multi-issuer RFQ tag at top: "10 issuers · 8 returned · 2 pending.")*
3. Issuers reply with their indicative coupon and any term tweaks. *(Issuer responses table.)*
4. Slate normalizes the responses so they're comparable apples-to-apples. *(Same column layout for every issuer.)*
5. RM picks the winner — usually best coupon, but sometimes best protection if the family is more risk-averse. *(★ winner tags identify "best coupon" and "best protection" — they can be different issuers.)*
6. Execute. *(Execute with JPM button.)*

In the demo: best coupon goes to **JPM at 11.40%**. Best protection goes to **BNP at a 70% barrier** (tighter to par = more cushion) for slightly less coupon (10.80%). Two issuers (HSBC, Wells) are still pending. The RM picks based on which axis the family cares about more.

### Watching the existing book

A structured-product book is *not* a buy-and-forget asset. The events that matter are scheduled in advance:

- **Observation dates** — periodic check of where the underlier is.
- **Autocall observations** — same, but if the underlier is above the call level, the note ends and pays you out.
- **Coupon payments** — regular income from notes that have memory or contingent coupon features.
- **Maturity** — the final settlement.
- **Barrier proximity** — how close the underlier is to breaking the barrier *right now*. The single most important risk indicator on a live note.

### How the four Structured Products tabs map to all this

**Active RFQ (`RfqTab`)** — the live competitive auction.
- *Trade ticket card* — full spec of what's being quoted (worst-of AAPL/MSFT/NVDA Phoenix Memory, $5M, 2 years, quarterly observation, soft 65% European barrier).
- *Payoff diagram card* — exactly the curve described above for the phoenix shape, with the barrier marked and the best quoted coupon (11.40%) annotated.
- *Issuer responses table* — 10 dealers, 8 priced, 2 pending. Sorted by coupon. The "vs best" column is a sparkbar showing where each issuer sits between the worst and best live coupon. Best-coupon row highlighted, ★ tags identify per-axis winners.
- Action bar: Save RFQ / Re-quote / Execute with JPM.

**Book (`BookTab`)** — three notes the family already holds.
- KPI strip across the top: count, total notional, total MTM, YTD coupon collected.
- Card per note. The interesting visual is the **barrier-proximity bar** at the bottom of each card: a 50%–130% horizontal scale with a red barrier line and a colored dot at the underlier's current spot. Dot turns *red* when within 10pp of the barrier (= danger). The text below says either *"+8.4pp above barrier"* (safe) or *"-3.1pp through barrier"* (already breached).
  - SPX Buffer Note: spot 108.4% vs 90% barrier → 18.4pp safe. Green.
  - SPX Booster: spot 115.2% vs 80% floor → 35.2pp safe. Very green.
  - AAPL Reverse Convertible: spot 96.8% vs 70% barrier → 26.8pp safe but the underlier is below par so the position is at a small loss.

**Calendar (`CalendarTab`)** — every upcoming event from both the existing book and the live RFQ, grouped by month. Five event kinds, each color-coded: observation (neutral), autocall observation (accent), coupon (green), maturity (warn), trade date (accent). Helpful for the RM to plan the next 18 months — they know exactly when each note will pay, mature, or potentially autocall.

**Templates (`TemplatesTab`)** — the menu of strategy shapes the RM might want to pitch. Four cards: Income (Phoenix), Growth (1.5× Booster), Defensive (Buffer), Yield (Reverse Convertible). Each shows the indicative coupon range, protection level, and a mini payoff diagram. The *Send to RFQ* button would (in a real product) seed a new Active RFQ pre-filled with this template.

---

## Suggested tour for a first-time user

1. **Start cold:** open `index.html`, you land on `#upload`. Drop a fake "PDF" → watch the parsing animation → land on parse review with three flagged rows. Confirm. The dashboard appears.
2. **The big finding:** click into the AAPL row from "Top concentrations" on the Household summary. See the position deeply ITM with a 14.8% concentration. Back out, click the AAPL insight card — see the three remediation playbooks (351 exchange, foundation gift, 10b5-1).
3. **Pair the trades:** open the second insight (EM losses). Notice how the suggested actions explicitly mention pairing with the AAPL trim — using the losses to shelter the gains in the same tax year.
4. **Cash drag:** open the third insight. $5.8M idle. The fix carves out $1.8M for the Q3 capital call and moves the rest into a Treasury MMF.
5. **The capital call is real:** go to `#alts` → Holdings tab. Pine Ridge II shows 84% called, with the next call (Q3 2026, $1.6M) flagged in the schedule. That's the same $1.8M from step 4.
6. **Why diversify?** Go to Strategy mix. 100% Buyout. Read the concentration warning. Switch to Pacing plan — see four commitments across four strategies and two vintages.
7. **Live trade:** go to `#structured`. The phoenix RFQ has 8 returned quotes, JPM leading. Play with the Templates tab to see how each shape's payoff differs.
8. **The book itself:** Book tab. Look at the barrier-proximity bar on the AAPL Reverse Convertible — it's the most at-risk note (spot below par, watch the barrier closely).

By the end of this tour, you've seen every concept above acted out on the demo's data.

---

## Glossary

| Term | Meaning |
| --- | --- |
| **Autocall** | A structured note feature where, if the underlier is above a level on a scheduled date, the note redeems early at par + accrued coupon. |
| **Barrier (soft / hard)** | A level on the underlier that triggers loss/protection. Soft = checked at maturity only. Hard = locks in the moment it's breached. |
| **Basis (cost basis)** | What you originally paid for a position. Determines tax when you sell. |
| **Capital call** | A demand from a private fund GP for a piece of your committed capital. |
| **Carry / carried interest** | The GP's share of profits in a private fund (typ. 20%, above an 8% hurdle). |
| **Concentration risk** | One position being large enough to materially hurt the household if it falls. |
| **Custodian** | The institution that physically holds the assets (Schwab, Fidelity, etc.). |
| **DPI** | *Distributions to Paid-In*. Cash returned ÷ cash contributed in a private fund. |
| **Drift** | Distance between actual allocation and IPS target. |
| **GP / LP** | General Partner (the fund manager) / Limited Partner (you). |
| **IPS** | Investment Policy Statement — the family's rulebook. |
| **IRR** | Internal Rate of Return. Annualized return that accounts for both magnitude and timing. |
| **J-curve** | Cumulative cashflow shape in private funds — negative early, positive later. |
| **Long-term / short-term** | Tax classification of a gain. Held > 1 year = long-term (lower rate). |
| **Mark-to-market (MTM)** | Current market value of a position. |
| **Memory feature** | A structured-note feature where missed coupons are paid retroactively when conditions return to normal. |
| **NAV** | Net Asset Value. The fund manager's reported value of fund assets. |
| **Notional** | Headline size of a structured trade ($5M in the demo). |
| **Phoenix / booster / buffer / reverse convertible** | Four common payoff shapes for structured products. See §6. |
| **RFQ** | Request For Quote. A multi-dealer competitive pricing process. |
| **RVPI** | *Residual Value to Paid-In*. Current fund NAV ÷ cash contributed. |
| **Sleeve** | A sub-allocation. "The alts sleeve" = the slice of the portfolio in alternatives. |
| **Tenor** | Time to maturity. |
| **Tax lot** | One purchase batch of a security. Each has its own basis and term. |
| **Tax-loss harvesting** | Selling at a loss to offset gains; subject to wash-sale rules. |
| **Thesis** | A stated investment view (e.g., "AI infrastructure"). Used to filter deals. |
| **TVPI** | *Total Value to Paid-In*. DPI + RVPI. Total return multiple. |
| **Underlier** | The asset whose movement determines a structured note's payoff. |
| **Unfunded commitment** | Money the LP has *promised* to wire to a private fund but the GP hasn't *called* yet. The household carries the obligation but the cash is still theirs to invest in the meantime. |
| **Vintage** | The year a private fund started investing. |
| **Wash-sale rule** | If you re-buy the same security within 30 days of a loss sale, the loss is disallowed for tax purposes. |
| **Worst-of** | A basket of underliers where the payoff depends on whichever member is performing worst. |

---

## Stack notes

For the engineer who's going to extend this:

- **Static SPA, no build step.** Open `index.html`. Babel-standalone transpiles the JSX in-browser.
- **Globals on `window.Slate`.** Each file attaches its exports there: `Slate.Charts`, `Slate.Screens`, `Slate.AltsStructured`, `Slate.Intake`, `Slate.Shell`, `Slate.analytics`, plus all data fixtures.
- **Hash routing.** `#upload`, `#parsing`, `#review`, `#household`, `#household?holdings`, `#household/AAPL`, `#alts`, `#structured`, `#insights`, `#insights/i1`. Owned by `index.html`.
- **Persistence:** `localStorage` keys `slate-theme`, `slate-filter`, `slate-loaded`.

| File | Purpose |
| --- | --- |
| `index.html` | Bootstraps React, loads scripts, owns routing + persisted state. |
| `lib.js` | `Icons` (inline SVG strings), `fmt.money / fmt.pct / fmt.num`. |
| `data.js` | All fixture data. Mutating values here is how you reshape the demo. |
| `analytics.js` | Pure portfolio math. Functions take optional `accountIds` filter. |
| `charts.jsx` | SVG primitives: `LineChart`, `Spark`, `Donut`, `Bars`, `PayoffDiagram`, `JCurve`. |
| `shell.jsx` | `Sidebar`, `Topbar`, `FilterBar`. |
| `intake.jsx` | `UploadScreen`, `ParsingScreen`, `ReviewScreen`. |
| `screens.jsx` | `HouseholdScreen` (4 tabs), `HoldingDetail`, `InsightsScreen`, `InsightDetail`. |
| `alts-structured.jsx` | `AltsScreen` and `StructuredScreen`, both 4 tabs. |
| `styles.css` | Design tokens + layout primitives. |

Synthetic time-series come from `monthlyPath(start, drift, vol, seed)` in `screens.jsx` — deterministic, so the demo looks the same on every reload.

KPI numbers like "Liquid 71%", "YTD income $612k", and the period returns under the performance chart are hand-fixed in components, not derived from the data. If you change `POSITIONS` in `data.js` they won't move.
