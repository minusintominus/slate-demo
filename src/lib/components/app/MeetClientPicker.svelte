<script>
  import { CLIENT_BOOK } from '$lib/data/fixtures.js';
  import { Icons } from '$lib/components/ui/icons.js';

  let { onPick = () => {}, onCancel = () => {} } = $props();

  let query = $state('');
  let inputEl = $state();

  $effect(() => {
    if (inputEl) inputEl.focus();
  });

  const matches = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CLIENT_BOOK;
    return CLIENT_BOOK.filter((c) =>
      `${c.name} ${c.familyType || ''} ${c.custodians || ''}`.toLowerCase().includes(q)
    );
  });

  const onKeyDown = (e) => {
    if (e.key === 'Escape') onCancel();
    else if (e.key === 'Enter' && matches.length > 0) {
      e.preventDefault();
      onPick(matches[0].id);
    }
  };
</script>

<div class="backdrop" role="presentation" onmousedown={onCancel}>
  <div class="modal" role="dialog" aria-modal="true" tabindex="-1" onmousedown={(e) => e.stopPropagation()}>
    <div class="head">
      <div>
        <div class="eyebrow">Switching to Meet mode</div>
        <h2>Which client are you meeting?</h2>
        <p class="sub">Meet mode locks the session to one household. Other clients, their accounts, and their custodians stay hidden across search and navigation.</p>
      </div>
      <button type="button" class="close-btn" onclick={onCancel} aria-label="Cancel">{@html Icons.close}</button>
    </div>

    <div class="search-wrap">
      <span class="icon">{@html Icons.search}</span>
      <input bind:this={inputEl} bind:value={query}
        placeholder="Search by client"
        onkeydown={onKeyDown}/>
    </div>

    {#if matches.length === 0}
      <div class="empty">No clients match &ldquo;{query}&rdquo;</div>
    {:else}
      <ul class="list">
        {#each matches as c (c.id)}
          <li>
            <button type="button" class="row" onclick={() => onPick(c.id)}>
              <span class="initial">{c.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()}</span>
              <span class="info">
                <span class="name">{c.name}</span>
                <span class="meta">{c.familyType || ''}{c.custodians ? ` · ${c.custodians}` : ''}</span>
              </span>
              <span class="arrow">→</span>
            </button>
          </li>
        {/each}
      </ul>
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

  .search-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    background: var(--surface-2);
    border: 1px solid var(--rule);
    border-radius: var(--r-md);
    padding: 8px 12px;
    color: var(--ink-3);
  }
  .search-wrap:focus-within {
    border-color: var(--accent);
    background: var(--surface);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .search-wrap input {
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--ink);
    font: inherit;
    min-width: 0;
  }
  .icon {
    display: inline-flex;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 16px 0 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    background: transparent;
    border: 0;
    border-radius: var(--r-md);
    padding: 10px 12px;
    cursor: pointer;
    text-align: left;
    color: inherit;
    font: inherit;
  }
  .row:hover {
    background: var(--surface-2);
  }
  .initial {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: color-mix(in oklch, var(--accent) 14%, var(--surface));
    color: var(--accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .name {
    font-weight: 500;
    color: var(--ink);
  }
  .meta {
    font-size: 11.5px;
    color: var(--ink-3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .arrow {
    color: var(--ink-4);
    flex-shrink: 0;
  }
  .empty {
    margin-top: 20px;
    padding: 24px;
    color: var(--ink-3);
    text-align: center;
    font-size: 13px;
  }
</style>
