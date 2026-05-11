<script>
  import { Button } from '$lib/components/ui/index.js';
  import { Icons } from '$lib/components/ui/icons.js';

  let { onClose = () => {}, onPickExisting = () => {}, onPickProspect = () => {} } = $props();
</script>

<div class="backdrop" role="presentation" onmousedown={onClose}>
  <div class="modal" role="dialog" aria-modal="true" tabindex="-1" onmousedown={(e) => e.stopPropagation()}>
    <div class="head">
      <div>
        <div class="eyebrow">Schedule a meeting</div>
        <h2>Who are you meeting with?</h2>
        <p class="sub">Pick existing to scope the session to a household in the book; pick prospect to set up a new lead first.</p>
      </div>
      <button type="button" class="close-btn" onclick={onClose} aria-label="Cancel">{@html Icons.close}</button>
    </div>

    <div class="options">
      <button type="button" class="option" onclick={onPickExisting}>
        <div class="option-body">
          <div class="option-title">Existing client</div>
          <div class="option-sub">Load the household's portfolio, briefing, and insights into Meet mode.</div>
        </div>
        <span class="arrow">→</span>
      </button>
      <button type="button" class="option" onclick={onPickProspect}>
        <div class="option-body">
          <div class="option-title">New prospect</div>
          <div class="option-sub">Send an onboarding form or fill in the details first, then meet once they're onboarded.</div>
        </div>
        <span class="arrow">→</span>
      </button>
    </div>

    <div class="actions">
      <Button variant="ghost" onclick={onClose}>Cancel</Button>
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
    max-width: 520px;
    width: 100%;
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

  .options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 18px;
  }
  .option {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 14px 16px;
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    background: var(--surface);
    color: inherit;
    font: inherit;
    cursor: pointer;
    text-align: left;
    transition: border-color .12s, background .12s;
  }
  .option:hover {
    border-color: var(--accent);
    background: color-mix(in oklch, var(--accent) 6%, var(--surface));
  }
  .option:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .option-body {
    flex: 1;
    min-width: 0;
  }
  .option-title {
    font-weight: 500;
    color: var(--ink);
  }
  .option-sub {
    color: var(--ink-3);
    font-size: 12.5px;
    margin-top: 4px;
    line-height: 1.45;
  }
  .arrow {
    color: var(--ink-4);
    flex-shrink: 0;
    font-size: 16px;
  }

  .actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    justify-content: flex-end;
  }
</style>
