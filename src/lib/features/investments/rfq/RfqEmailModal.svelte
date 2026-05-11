<script>
  import { deskLabel } from './data.js';
  import RfqRecipientCombobox from './RfqRecipientCombobox.svelte';

  let { target, rfq, onClose = () => {} } = $props();

  // Modal is remounted by the parent {#if} when target changes, so reading
  // props once at init is intentional. Wrap in a function so the compiler
  // sees the access inside a closure and doesn't warn about reactivity.
  function initialFromTarget(t) {
    return {
      isSingle: t.kind === 'single' && !!t.quote,
      quoteDeskLabel: t.kind === 'single' && t.quote ? deskLabel(t.quote.deskId) : null,
      quote: t.quote
    };
  }
  const initial = initialFromTarget(target);

  let recipients = $state([]);
  let subject = $state(
    initial.isSingle
      ? `Indicative quote · ${initial.quoteDeskLabel} ${initial.quote.coupon.toFixed(2)}%`
      : 'Indicative quotes · structured product comparison'
  );
  let message = $state(
    initial.isSingle
      ? `Indicative pricing from ${initial.quoteDeskLabel}.\n\n` +
          `Coupon: ${initial.quote.coupon.toFixed(2)}%\n` +
          `Capital barrier: ${initial.quote.capBarrier}%\n` +
          `Issue price: ${initial.quote.issuePrice.toFixed(2)}\n\n` +
          'Indicative — not an offer. Final terms subject to confirmation.'
      : 'Please find attached a comparison of indicative pricing from multiple counterparty desks.\n\n' +
          'Indicative — not an offer. Final terms subject to confirmation.'
  );
  let attachTermSheet = $state(true);
  let attachComparison = $state(!initial.isSingle);
  let sent = $state(false);

  let hasExternal = $derived(recipients.some((r) => r.kind === 'external'));
  let quotedCount = $derived(rfq.quotes.filter((q) => q.status === 'quoted').length);
  const heading = initial.isSingle ? `Email quote — ${initial.quoteDeskLabel}` : 'Email quote comparison';

  const onSend = () => {
    sent = true;
    setTimeout(onClose, 1500);
  };
</script>

<div class="backdrop" role="presentation" onmousedown={onClose}>
  <div class="modal" role="dialog" aria-modal="true" tabindex="-1" onmousedown={(e) => e.stopPropagation()}>
    {#if sent}
      <div class="success">
        <div class="success-title">✓ Sent to {recipients.length} recipient{recipients.length === 1 ? '' : 's'}</div>
        <p class="success-sub">Logged to RFQ {rfq.id} audit trail.</p>
      </div>
    {:else}
      <h2>{heading}</h2>
      <p class="sub">Indicative pricing valid until quote expiry.</p>

      <div class="stack">
        <div>
          <span class="field-label">To</span>
          <RfqRecipientCombobox bind:value={recipients} />
        </div>

        <div>
          <span class="field-label">Subject</span>
          <input class="input" bind:value={subject} />
        </div>

        <div>
          <span class="field-label">Message</span>
          <textarea class="input" rows="7" bind:value={message}></textarea>
        </div>

        <div>
          <span class="field-label">Attach</span>
          <div class="attach-stack">
            <label class="check">
              <input type="checkbox" bind:checked={attachTermSheet} />
              Term sheet ({rfq.id}.pdf)
            </label>
            <label class="check">
              <input type="checkbox" bind:checked={attachComparison} />
              Quote comparison ({quotedCount} desks)
            </label>
          </div>
        </div>

        {#if hasExternal}
          <div class="warn-banner">
            External recipients are logged but not linked to a client record.
          </div>
        {/if}
      </div>

      <div class="actions">
        <button type="button" class="btn ghost" onclick={onClose}>Cancel</button>
        <button type="button" class="btn primary" disabled={recipients.length === 0} onclick={onSend}>
          Send{recipients.length > 0 ? ` to ${recipients.length}` : ''}
        </button>
      </div>
    {/if}
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
    max-width: 580px;
    width: 100%;
    max-height: min(92vh, 900px);
    overflow-y: auto;
    padding: 28px;
  }
  h2 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 22px;
    line-height: 1.2;
    margin: 0;
  }
  .sub {
    color: var(--ink-2);
    font-size: 13px;
    margin: 4px 0 0;
  }
  .field-label {
    display: block;
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .stack {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .attach-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    cursor: pointer;
  }
  .check input {
    accent-color: var(--accent);
  }
  .input {
    width: 100%;
    padding: 9px 12px;
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 14px;
  }
  .input:focus {
    outline: 2px solid var(--accent);
    outline-offset: -1px;
  }
  textarea.input {
    resize: vertical;
  }
  .warn-banner {
    padding: 8px 12px;
    background: var(--warn-soft);
    color: var(--warn);
    border-radius: var(--r-md);
    font-size: 12px;
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 24px;
    justify-content: flex-end;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 14px;
    border: 1px solid var(--rule-2);
    background: var(--surface);
    color: var(--ink);
    border-radius: var(--r-md);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  .btn:hover {
    background: var(--surface-2);
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .btn.primary {
    background: var(--ink);
    color: var(--surface);
    border-color: var(--ink);
  }
  .btn.primary:hover {
    opacity: 0.9;
  }
  .btn.ghost {
    background: transparent;
    border-color: transparent;
  }
  .btn.ghost:hover {
    background: var(--surface-2);
  }
  .success {
    text-align: center;
    padding: 40px 0;
  }
  .success-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
  }
  .success-sub {
    color: var(--ink-2);
    margin-top: 12px;
  }
</style>
