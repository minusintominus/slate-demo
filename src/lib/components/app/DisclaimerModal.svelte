<script>
  import { Button } from '$lib/components/ui/index.js';
  import { Icons } from '$lib/components/ui/icons.js';

  let { onClose = () => {} } = $props();
</script>

<div class="backdrop" role="presentation" onmousedown={onClose}>
  <div class="modal" role="dialog" aria-modal="true" aria-label="Demo environment disclaimer" tabindex="-1" onmousedown={(e) => e.stopPropagation()}>
    <div class="head">
      <div>
        <div class="eyebrow">Demo environment</div>
        <h2>This is a demonstration of Slate.</h2>
        <p class="sub">Read these notices before clicking around — they apply to every page in this build.</p>
      </div>
      <button type="button" class="close-btn" onclick={onClose} aria-label="Close">{@html Icons.close}</button>
    </div>

    <div class="body">
      <section class="row">
        <div class="row-label">Software vs. data</div>
        <p>
          Slate is a technology provider; this environment exists only to demonstrate the software. Wealth-management firms that license Slate operate it in their own infrastructure — every household, account, holding, follow-up, RFQ, and forecast shown here is synthetic. In a production deployment, the licensee firm hosts and controls all client data; Slate does not store, process, transmit, or have visibility into it.
        </p>
      </section>
      <section class="row">
        <div class="row-label">No warranty</div>
        <p>
          Slate makes no representations or warranties about the accuracy, completeness, suitability, security, or confidentiality of any data, calculation, model output, or workflow shown. Performance lines, cashflow forecasts, parser confidence figures, and benchmark comparisons are illustrative only.
        </p>
      </section>
      <section class="row">
        <div class="row-label">Not advice</div>
        <p>
          Nothing on this site is investment, tax, legal, or accounting advice, and nothing should be relied on for any financial decision. Engagement with a licensed wealth manager remains the licensee firm's responsibility.
        </p>
      </section>
      <section class="row">
        <div class="row-label">No live actions</div>
        <p>
          No client communication, order, wire, RFQ, or external request is actually sent from this demo. Buttons that appear to perform such actions are simulated; they show success states without invoking any real-world system.
        </p>
      </section>
      <section class="row">
        <div class="row-label">Feedback build</div>
        <p>
          The features shown here are exploratory and are being shared to gather feedback. They are not a commitment, roadmap, or specification — any production version, if ever built, may differ materially or omit these features entirely.
        </p>
      </section>
      <section class="row">
        <div class="row-label">Regulated activity</div>
        <p>
          Slate is not a registered investment adviser, broker-dealer, custodian, or other regulated financial institution in any jurisdiction. The workflows depicted (RFQs, onboarding, alternative-investment subscriptions, performance reporting, etc.) are how a licensee firm's authorised personnel would use the software — not activity Slate itself performs.
        </p>
      </section>
      <section class="row">
        <div class="row-label">No offer · hypothetical performance</div>
        <p>
          Nothing on this site is an offer, recommendation, or solicitation to buy or sell any security, fund, structured product, or other instrument in any jurisdiction. Performance lines, dealer quotes, IRRs, DPI / TVPI multiples, capital-call schedules, and benchmark comparisons are simulated and hypothetical — they are not actual or back-tested results and must not be relied on to set expectations.
        </p>
      </section>
      <section class="row">
        <div class="row-label">Trademarks</div>
        <p>
          Custodian names, dealer names, fund sponsors, ticker symbols, indices, and benchmarks shown are used for illustration only. Their inclusion does not imply endorsement of, partnership with, sponsorship by, or any relationship between Slate and the named entities. All trademarks remain the property of their respective owners.
        </p>
      </section>
      <section class="row">
        <div class="row-label">Don't enter real data</div>
        <p>
          Form fields in this demo (onboarding email addresses, RFQ notes, search input, etc.) are unprotected client-side inputs. Please do not submit real personal information, real client identifiers, or any sensitive data. The demo is not designed for live use and any data entered may persist in your browser's local storage.
        </p>
      </section>
      <section class="row">
        <div class="row-label">Confidential · evaluation only</div>
        <p>
          This build is shared for evaluation. Please do not redistribute, screenshot publicly, or quote it without permission. The contents are a snapshot and may change between sessions.
        </p>
      </section>
    </div>

    <div class="actions">
      <Button variant="primary" onclick={onClose}>Got it</Button>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(10, 12, 18, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    overflow-y: auto;
  }
  .modal {
    background: var(--surface);
    color: var(--ink);
    border-radius: var(--r-lg);
    border: 1px solid var(--rule);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
    max-width: 640px;
    width: 100%;
    max-height: min(86vh, 720px);
    overflow-y: auto;
    padding: 24px;
  }
  .head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
  }
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  h2 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    line-height: 1.2;
    margin: 4px 0 0;
  }
  .sub {
    color: var(--ink-2);
    font-size: 13px;
    margin: 4px 0 0;
  }
  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 0;
    background: transparent;
    color: var(--ink-3);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .close-btn:hover {
    background: var(--surface-2);
    color: var(--ink);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px dashed var(--rule-2);
  }
  .row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 16px;
    align-items: baseline;
  }
  .row-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .row p {
    margin: 0;
    color: var(--ink-2);
    font-size: 13px;
    line-height: 1.6;
  }
  @media (max-width: 600px) {
    .row {
      grid-template-columns: 1fr;
      gap: 4px;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 22px;
    justify-content: flex-end;
  }
</style>
