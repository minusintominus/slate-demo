<script>
  import { TEMPLATES } from './data.js';

  let { onUseTemplate = () => {} } = $props();
</script>

<p class="lede">
  Quick-start configurations for common structures. Pick a template, tweak parameters, and send the RFQ.
</p>

<div class="grid">
  {#each TEMPLATES as t (t.id)}
    <article class="card template">
      <div class="head">
        <span class="kind">{t.productLabel}</span>
        <span class="indicative">{t.indicative}</span>
      </div>
      <h3>{t.name}</h3>
      <p class="terms mono">{t.keyTerms}</p>
      <p class="description">{t.description}</p>
      <button type="button" class="btn primary" onclick={() => onUseTemplate(t)}>
        Use template →
      </button>
    </article>
  {/each}
</div>

<style>
  .lede {
    color: var(--ink-2);
    font-size: 14px;
    margin: 0 0 20px;
    max-width: 640px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-lg);
    padding: 22px;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  .kind {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .indicative {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }
  h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 18px;
    line-height: 1.25;
    margin: 0;
  }
  .terms {
    color: var(--ink-2);
    font-size: 12px;
    margin: 0;
  }
  .mono {
    font-family: var(--font-mono);
  }
  .description {
    color: var(--ink-3);
    font-size: 13px;
    line-height: 1.5;
    margin: 0;
    flex: 1;
  }
  .btn {
    align-self: flex-start;
    margin-top: 6px;
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
  .btn.primary {
    background: var(--ink);
    color: var(--surface);
    border-color: var(--ink);
  }
  .btn.primary:hover {
    opacity: 0.9;
  }
</style>
