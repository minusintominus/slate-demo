<script>
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/index.js';
  import { Icons } from '$lib/components/ui/icons.js';

  let { onClose = () => {} } = $props();

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  let mode = $state('email'); // 'manual' | 'email'
  let toAddr = $state('');
  let ccAddr = $state('');
  let sent = $state(false);

  const ccList = $derived(
    ccAddr
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean)
  );

  const ccValid = $derived(ccList.every((c) => EMAIL_RE.test(c)));
  const toValid = $derived(EMAIL_RE.test(toAddr.trim()));
  const canSend = $derived(toValid && ccValid);

  const submit = () => {
    if (mode === 'manual') {
      onClose();
      goto('/workspace/clients');
      return;
    }
    if (!canSend) return;
    // Demo: skip actual send, show success state, then close.
    sent = true;
    setTimeout(onClose, 1600);
  };
</script>

<div class="backdrop" role="presentation" onmousedown={onClose}>
  <div class="modal" role="dialog" aria-modal="true" tabindex="-1" onmousedown={(e) => e.stopPropagation()}>
    {#if sent}
      <div class="success">
        <div class="success-title">✓ Onboarding form sent</div>
        <p class="success-sub">
          {toAddr.trim()} will receive an email with the form
          {#if ccList.length}(CC: {ccList.join(', ')}){/if}.
          A draft client record is queued in your book.
        </p>
      </div>
    {:else}
      <div class="head">
        <div>
          <div class="eyebrow">New household</div>
          <h2>Add a client</h2>
          <p class="sub">Send the client an onboarding form to complete themselves, or fill in their details.</p>
        </div>
        <button type="button" class="close-btn" onclick={onClose} aria-label="Cancel">{@html Icons.close}</button>
      </div>

      <div class="options">
        <label class="option" class:active={mode === 'email'}>
          <input type="radio" name="onboard-mode" value="email" bind:group={mode} />
          <div class="option-body">
            <div class="option-title">Email an onboarding form</div>
            <div class="option-sub">Slate sends a secure form. The client fills KYC, contacts, and statement uploads. Returns ready-to-review.</div>
          </div>
        </label>
        <label class="option disabled" aria-disabled="true">
          <input type="radio" name="onboard-mode" value="manual" disabled />
          <div class="option-body">
            <div class="option-title">Fill in details manually</div>
            <div class="option-sub">Enter the client record yourself — useful when you already have a KYC pack or are creating a placeholder.</div>
          </div>
        </label>
      </div>

      {#if mode === 'email'}
        <div class="email-fields">
          <div class="field">
            <label for="onboard-to" class="field-label">To <span class="required">*</span></label>
            <input id="onboard-to" type="email" class="input" bind:value={toAddr}
              placeholder="client@example.com" autocomplete="off" />
          </div>
          <div class="field">
            <label for="onboard-cc" class="field-label">CC <span class="optional">(optional)</span></label>
            <input id="onboard-cc" type="text" class="input" bind:value={ccAddr}
              placeholder="advisor@firm.com, attorney@firm.com" autocomplete="off" />
            <span class="hint">Comma-separated. Common: family attorney, CPA, co-trustee.</span>
          </div>
          {#if ccList.length > 0 && !ccValid}
            <div class="error">One or more CC addresses are invalid.</div>
          {/if}
        </div>
      {/if}

      <div class="demo-note">Demo · no email is actually sent.</div>

      <div class="actions">
        <Button variant="ghost" onclick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          disabled={mode === 'email' || !canSend}
          aria-disabled={mode === 'email' || !canSend}
          onclick={submit}
        >
          {mode === 'email' ? 'Send onboarding form' : 'Continue'}
        </Button>
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
    max-width: 560px;
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

  .options {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 18px;
  }
  .option {
    display: flex;
    gap: 12px;
    padding: 14px 16px;
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: border-color .12s, background .12s;
  }
  .option:hover {
    border-color: var(--ink-3);
  }
  .option.active {
    border-color: var(--accent);
    background: color-mix(in oklch, var(--accent) 6%, var(--surface));
  }
  .option.disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
  .option.disabled:hover {
    border-color: var(--rule-2);
  }
  .option input {
    margin-top: 4px;
    accent-color: var(--accent);
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

  .email-fields {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .field-label {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .required {
    color: var(--neg);
  }
  .optional {
    text-transform: none;
    letter-spacing: 0;
    color: var(--ink-4);
    font-weight: 400;
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
  .hint {
    display: block;
    color: var(--ink-3);
    font-size: 11px;
    margin-top: 4px;
  }
  .error {
    background: var(--neg-soft);
    color: var(--neg);
    padding: 8px 12px;
    border-radius: var(--r-md);
    font-size: 12px;
  }

  .demo-note {
    margin-top: 16px;
    padding: 8px 12px;
    border: 1px dashed var(--rule-2);
    border-radius: var(--r-sm);
    background: var(--surface-2);
    color: var(--ink-3);
    font-size: 11.5px;
  }
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    justify-content: flex-end;
  }

  .success {
    text-align: center;
    padding: 36px 0;
  }
  .success-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 600;
  }
  .success-sub {
    color: var(--ink-2);
    margin-top: 12px;
    line-height: 1.5;
  }
</style>
