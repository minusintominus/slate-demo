<script>
  import { DESKS } from './data.js';

  let {
    selectedDesks = $bindable(),
    deadline = $bindable(),
    notes = $bindable(),
    sendRfq = () => {},
    onPreview = () => {},
    hasRfqs = false
  } = $props();

  const toggleDesk = (id) => {
    selectedDesks = selectedDesks.includes(id)
      ? selectedDesks.filter((x) => x !== id)
      : [...selectedDesks, id];
  };
</script>

<div>
  <div class="field">
    <span class="field-label">Counterparties ({selectedDesks.length} selected)</span>
    <div class="chip-row">
      {#each DESKS as d (d.id)}
        <button type="button" class={'chip' + (selectedDesks.includes(d.id) ? ' on' : '')}
          onclick={() => toggleDesk(d.id)}>{d.label}</button>
      {/each}
    </div>
  </div>

  <div class="field">
    <span class="field-label">Deadline</span>
    <div class="radio-row">
      <label class="radio">
        <input type="radio" name="rfq-deadline" checked={deadline === '30m'} onchange={() => (deadline = '30m')} />
        30 minutes
      </label>
      <label class="radio">
        <input type="radio" name="rfq-deadline" checked={deadline === '1h'} onchange={() => (deadline = '1h')} />
        1 hour
      </label>
      <label class="radio">
        <input type="radio" name="rfq-deadline" checked={deadline === 'eod'} onchange={() => (deadline = 'eod')} />
        End of day
      </label>
    </div>
  </div>

  <div class="field">
    <span class="field-label">Notes for desks (optional)</span>
    <textarea class="input" rows="2" bind:value={notes}
      placeholder="e.g. Prefer European observation; client is rate-aware."></textarea>
  </div>

  <div class="rfq-demo-note">Demo · simulated dealer responses; no live RFQ is sent and no real desks are contacted.</div>

  <div class="action-bar">
    <button type="button" class="btn ghost">Save draft</button>
    <button type="button" class="btn" onclick={onPreview}>Preview term sheet</button>
    <span class="spacer"></span>
    <button type="button" class="btn primary" disabled={selectedDesks.length === 0} onclick={sendRfq}>
      {hasRfqs ? 'Send new RFQ →' : 'Send RFQ →'}
    </button>
  </div>
</div>

<style>
  .rfq-demo-note {
    margin-top: 8px;
    padding: 8px 12px;
    border: 1px dashed var(--rule-2);
    border-radius: var(--r-sm);
    background: var(--surface-2);
    color: var(--ink-3);
    font-size: 11.5px;
  }
  .field {
    display: block;
    margin-bottom: 18px;
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
  .chip-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 12px;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    font-size: 13px;
    font-family: inherit;
    color: var(--ink);
    cursor: pointer;
  }
  .chip:hover {
    border-color: var(--ink-3);
  }
  .chip.on {
    background: var(--ink);
    color: var(--surface);
    border-color: var(--ink);
  }
  .radio-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .radio {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
  }
  .radio input {
    margin: 0;
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
    resize: vertical;
  }
  .input:focus {
    outline: 2px solid var(--accent);
    outline-offset: -1px;
  }
  .action-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--rule-2);
  }
  .spacer {
    flex: 1;
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
</style>
