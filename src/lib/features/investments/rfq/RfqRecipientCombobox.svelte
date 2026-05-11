<script>
  import { EMAIL_RE, getRecipients } from './data.js';

  let { value = $bindable([]) } = $props();

  let input = $state('');
  let open = $state(false);
  let wrapEl = $state();
  let inputEl = $state();

  const recipients = getRecipients();

  // Capture-phase listener so we fire before any modal stopPropagation upstream.
  $effect(() => {
    const close = (e) => {
      if (wrapEl && !wrapEl.contains(e.target)) open = false;
    };
    document.addEventListener('mousedown', close, true);
    return () => document.removeEventListener('mousedown', close, true);
  });

  let inputLower = $derived(input.trim().toLowerCase());

  let matchingClients = $derived(
    recipients.filter((c) => {
      if (value.some((v) => v.kind === 'client' && v.id === c.id)) return false;
      if (!inputLower) return true;
      return c.name.toLowerCase().includes(inputLower) || c.email.toLowerCase().includes(inputLower);
    })
  );

  let isValidEmail = $derived(EMAIL_RE.test(input.trim()));
  let externalEmail = $derived(
    isValidEmail && !value.some((v) => v.email.toLowerCase() === input.trim().toLowerCase())
  );

  const addClient = (c) => {
    value = [...value, { kind: 'client', id: c.id, label: c.name, email: c.email }];
    input = '';
    open = false;
  };
  const addExternal = (email) => {
    value = [...value, { kind: 'external', label: email, email }];
    input = '';
    open = false;
  };
  const remove = (i) => {
    value = value.filter((_, idx) => idx !== i);
  };

  const onKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input) {
      e.preventDefault();
      if (matchingClients.length > 0) addClient(matchingClients[0]);
      else if (externalEmail) addExternal(input.trim());
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      remove(value.length - 1);
    }
  };

  const initials = (name) =>
    name
      .split(' ')
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
</script>

<div class="combobox" bind:this={wrapEl}>
  <div class="wrap" role="textbox" tabindex="-1" onmousedown={() => inputEl && inputEl.focus()}>
    {#each value as r, i}
      <span class="chip {r.kind === 'client' ? 'client' : 'external'}" title={r.email}
        role="button" tabindex="-1"
        onmousedown={(e) => {
          e.stopPropagation();
          remove(i);
        }}>
        {r.label}<span class="x">×</span>
      </span>
    {/each}
    <input bind:this={inputEl} bind:value={input}
      placeholder={value.length === 0 ? 'Type name or email…' : ''}
      onfocus={() => (open = true)}
      oninput={() => (open = true)}
      onkeydown={onKeyDown} />
  </div>

  {#if open && (matchingClients.length > 0 || externalEmail)}
    <div class="dropdown">
      {#if matchingClients.length > 0}
        <div class="section">Clients</div>
        {#each matchingClients.slice(0, 6) as c (c.id)}
          <button type="button" class="option" onclick={() => addClient(c)}>
            <span class="initial">{initials(c.name)}</span>
            <span>{c.name}</span>
            <span class="meta">{c.email}</span>
          </button>
        {/each}
      {/if}
      {#if externalEmail}
        <button type="button" class="option add-external" onclick={() => addExternal(input.trim())}>
          + Add &quot;{input.trim()}&quot; as external →
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .combobox {
    position: relative;
  }
  .wrap {
    min-height: 44px;
    padding: 6px;
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    background: var(--surface);
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    cursor: text;
  }
  .wrap:focus-within {
    outline: 2px solid var(--accent);
    outline-offset: -1px;
  }
  input {
    flex: 1;
    min-width: 140px;
    border: none;
    outline: none;
    padding: 6px 8px;
    font: inherit;
    font-size: 14px;
    background: transparent;
    color: var(--ink);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: var(--r-md);
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    border: 1px solid transparent;
  }
  .chip.client {
    background: color-mix(in oklch, var(--accent) 14%, var(--surface));
    color: var(--accent);
  }
  .chip.external {
    background: var(--surface);
    color: var(--ink-2);
    border: 1px dashed var(--rule);
  }
  .chip .x {
    margin-left: 2px;
    opacity: 0.6;
  }
  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-md);
    max-height: 280px;
    overflow: auto;
    z-index: 200;
    padding: 6px;
  }
  .section {
    padding: 6px 10px 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-4);
  }
  .option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--r-sm);
    cursor: pointer;
    font-size: 13px;
    width: 100%;
    background: transparent;
    border: 0;
    text-align: left;
    color: inherit;
    font-family: inherit;
  }
  .option:hover {
    background: var(--surface-2);
  }
  .option.add-external {
    color: var(--accent);
    border-top: 1px dashed var(--rule-2);
    margin-top: 4px;
    padding-top: 10px;
  }
  .initial {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: color-mix(in oklch, var(--accent) 14%, var(--surface));
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .meta {
    margin-left: auto;
    font-size: 11px;
    color: var(--ink-3);
    font-family: var(--font-mono);
  }
</style>
