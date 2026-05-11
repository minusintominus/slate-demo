<script>
  import { Button, Card, Page, PageHeader, Section } from '../../components/ui/index.js';
  import { STATEMENTS } from '../../data/fixtures.js';
  import { money } from '../../domain/format.js';
  import { Icons } from '../../components/ui/icons.js';

  let {
    clientName = 'household',
    positions = [],
    accounts = [],
    onConfirm = () => {}
  } = $props();

  // Three-stage local flow — upload, parsing, review — driven by stepper.
  let stage = $state('upload');
  const STAGES = [
    { id: 'upload', label: 'Upload' },
    { id: 'parsing', label: 'Parsing' },
    { id: 'review', label: 'Review' }
  ];
  const stageIndex = $derived(STAGES.findIndex((s) => s.id === stage));

  // Parsing animation: 5 substeps that advance every ~850ms; auto-advances
  // to Review when the last substep completes.
  const PARSE_STEPS = [
    'Extracting text from 38 pages…',
    'Reconciling 4 custodians…',
    'Matching CUSIPs to security master…',
    'Computing cost basis & lots…',
    'Running anomaly detection…'
  ];
  let parseStep = $state(0);
  $effect(() => {
    if (stage !== 'parsing') {
      parseStep = 0;
      return;
    }
    if (parseStep >= PARSE_STEPS.length) {
      const t = setTimeout(() => (stage = 'review'), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => (parseStep += 1), 850);
    return () => clearTimeout(t);
  });
  const parsePct = $derived(Math.min(100, ((parseStep + 1) / PARSE_STEPS.length) * 100));

  // Review: filter + flagged subset.
  let reviewFilter = $state('all');
  const flaggedPositions = $derived(positions.filter((p) => p.flag));
  const visiblePositions = $derived(reviewFilter === 'flagged' ? flaggedPositions : positions);
  const positionsValue = $derived(positions.reduce((a, p) => a + (p.mv || 0), 0));

  // Drag state for the upload dropzone.
  let dragOver = $state(false);

  const startParsing = () => (stage = 'parsing');
</script>

<Page>
  <PageHeader>
    <div>
      <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">Intake · {clientName}</div>
      <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Import statements</h1>
      <p class="text-ink2 mt-2 max-w-[680px]">Drop the custodian statement package, watch positions and exceptions get extracted, then confirm the workspace.</p>
    </div>
    {#if stage === 'review'}
      <div class="meta" title="Slate's confidence that the parsed positions match the source statements.">
        <span class="cf-label">Confidence</span>
        <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] text-2xl">94%</span>
        <span class="cf-label">{positions.length} positions · {money(positionsValue, { compact: true })}</span>
      </div>
    {/if}
  </PageHeader>

  <ol class="stepper" aria-label="Import progress">
    {#each STAGES as s, i}
      {@const state = i < stageIndex ? 'done' : i === stageIndex ? 'current' : 'pending'}
      <li class={`step ${state}`}>
        <button type="button" class="step-btn" onclick={() => (stage = s.id)}
          aria-current={state === 'current' ? 'step' : undefined}>
          <span class="step-num">{i < stageIndex ? '✓' : i + 1}</span>
          <span class="step-label">{s.label}</span>
        </button>
        {#if i < STAGES.length - 1}<span class="step-bar"></span>{/if}
      </li>
    {/each}
  </ol>

  {#if stage === 'upload'}
    <div
      class={`dropzone ${dragOver ? 'over' : ''}`}
      role="button"
      tabindex="0"
      ondragover={(e) => { e.preventDefault(); dragOver = true; }}
      ondragleave={() => (dragOver = false)}
      ondrop={(e) => { e.preventDefault(); dragOver = false; startParsing(); }}
      onclick={startParsing}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startParsing(); } }}
    >
      <span class="dropzone-icon">{@html Icons.upload}</span>
      <div class="dropzone-title">Drop PDF statements here</div>
      <div class="dropzone-sub">or <button type="button" class="link" onclick={(e) => { e.stopPropagation(); startParsing(); }}>browse files</button>. Up to 200 MB total.</div>
      <div class="dropzone-tags">
        <span class="tag">256-bit encryption</span>
        <span class="tag">SOC 2 Type II</span>
        <span class="tag">Audit log</span>
      </div>
      <div class="dropzone-demo">
        Demo · drops are simulated against fixed sample statements. In a real deployment, parsing runs inside the licensee firm's environment.
      </div>
    </div>

    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-5 mt-6">
      <Card class="p-5">
        <div class="cf-label">Step 1</div>
        <div class="font-[var(--font-display)] mini-step-title">Upload</div>
        <p class="text-ink2 text-sm mt-2">Drop a PDF — any custodian. Multi-page, scanned, or native. We handle them all.</p>
      </Card>
      <Card class="p-5">
        <div class="cf-label">Step 2</div>
        <div class="font-[var(--font-display)] mini-step-title">Parse</div>
        <p class="text-ink2 text-sm mt-2">Slate extracts positions, reconciles custodians, and runs anomaly checks in seconds.</p>
      </Card>
      <Card class="p-5">
        <div class="cf-label">Step 3</div>
        <div class="font-[var(--font-display)] mini-step-title">Review &amp; confirm</div>
        <p class="text-ink2 text-sm mt-2">Eyeball flagged rows — names that didn't auto-match, lots without cost basis — then confirm.</p>
      </Card>
    </Section>
  {:else if stage === 'parsing'}
    <div class="parse-wrap">
      <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">Step 2 of 3 · Parsing</div>
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] parse-title">Reading {STATEMENTS.length} statements.</h2>
      <p class="text-ink2 mt-1">Should take about six seconds.</p>

      <div class="progress mt-6"><div style:width={`${parsePct}%`}></div></div>

      <div class="parse-steps mt-6">
        {#each PARSE_STEPS as label, i}
          <div class="parse-step" class:done={i < parseStep} class:active={i === parseStep}>
            <span class="parse-bullet">
              {#if i < parseStep}
                <span class="parse-check">{@html Icons.check}</span>
              {:else if i === parseStep}
                <span class="parse-pulse"></span>
              {/if}
            </span>
            <span>{label}</span>
          </div>
        {/each}
      </div>

      <div class="file-chips mt-8">
        {#each STATEMENTS as s (s.file)}
          <div class="file-chip">
            <span class="file-chip-icon">{@html Icons.file}</span>
            <div class="file-chip-body">
              <div class="file-chip-name">{s.file}</div>
              <div class="cf-label">{s.pages}p · {money(s.value, { compact: true })}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="review-toolbar">
      <div class="seg">
        <button class:active={reviewFilter === 'all'} onclick={() => (reviewFilter = 'all')}>All · {positions.length}</button>
        <button class:active={reviewFilter === 'flagged'} onclick={() => (reviewFilter = 'flagged')}>Flagged · {flaggedPositions.length}</button>
      </div>
      <div class="custodian-chips">
        {#each accounts as a (a.id)}
          <span class="tag">{a.custodian} · {a.name}</span>
        {/each}
      </div>
    </div>

    <div class="review-table-wrap">
      <table class="review-table">
        <thead>
          <tr>
            <th></th>
            <th>Security</th>
            <th>Account</th>
            <th class="num">Quantity</th>
            <th class="num">Price</th>
            <th class="num">Market Value</th>
            <th class="num">Cost Basis</th>
            <th title="Parser confidence that the row matches the source statement. Flagged rows have lower confidence and need a human review.">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {#each visiblePositions.slice(0, 20) as p (p.id || p.symbol)}
            {@const acct = accounts.find((a) => a.id === p.account)}
            <tr class:flagged={!!p.flag}>
              <td><span class={`dot ${p.flag ? 'warn' : 'ink'}`}></span></td>
              <td>
                <div class="font-semibold">{p.symbol}</div>
                <div class="cf-label" class:flag-text={!!p.flag}>{p.flag || p.name}</div>
              </td>
              <td class="text-ink3 text-xs font-[var(--font-mono)]">{acct?.custodian || '—'}</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{p.qty == null ? '—' : p.qty.toLocaleString('en-US')}</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{p.price == null ? 'NAV' : p.price > 1000 ? p.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : p.price.toFixed(2)}</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(p.mv, { compact: true })}</td>
              <td class="num font-[var(--font-mono)] [font-feature-settings:'tnum'_on]">{money(p.cost, { compact: true })}</td>
              <td>
                <div class="confidence-bar">
                  <div class={`confidence-fill ${p.flag ? 'neg' : 'pos'}`} style:width={`${p.flag ? 50 : 100}%`}></div>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="action-bar">
      <span class="text-ink3 text-sm">{flaggedPositions.length} item{flaggedPositions.length === 1 ? '' : 's'} want a second pair of eyes — you can resolve later.</span>
      <Button variant="ghost">Resolve flagged</Button>
      <Button variant="primary" onclick={onConfirm}>Confirm &amp; build dashboard {@html Icons.arrow}</Button>
    </div>
  {/if}
</Page>

<style>
  .cf-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }

  /* ── Stepper ──────────────────────────────────────────────────────── */
  .stepper {
    list-style: none;
    margin: 0 0 24px;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 0;
  }
  .step {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--ink-3);
    font-size: 13px;
    flex: 0 0 auto;
  }
  .step-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: 0;
    padding: 4px 6px;
    margin: -4px -6px;
    border-radius: var(--r-md);
    color: inherit;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: background .12s, color .12s;
  }
  .step-btn:hover {
    background: var(--surface-2);
    color: var(--ink);
  }
  .step-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid var(--rule-2);
    background: var(--surface);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
  }
  .step-label {
    font-weight: 500;
  }
  .step-bar {
    width: 60px;
    height: 1px;
    background: var(--rule-2);
    margin: 0 14px;
  }
  .step.current { color: var(--ink); }
  .step.current .step-num {
    background: var(--ink);
    color: var(--surface);
    border-color: var(--ink);
  }
  .step.done { color: var(--ink-2); }
  .step.done .step-num {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }
  .step.done .step-bar { background: var(--accent); }

  /* ── Header meta block ────────────────────────────────────────────── */
  .meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: flex-end;
    cursor: help;
  }

  /* ── Upload stage ─────────────────────────────────────────────────── */
  .dropzone {
    border: 1.5px dashed var(--rule-2);
    border-radius: var(--r-lg);
    padding: 60px 24px;
    text-align: center;
    background: var(--surface);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    transition: border-color .12s, background .12s;
    cursor: pointer;
  }
  .dropzone.over,
  .dropzone:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .dropzone:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }
  .dropzone-icon {
    color: var(--accent);
    display: inline-flex;
  }
  .dropzone-icon :global(svg) {
    width: 32px;
    height: 32px;
  }
  .dropzone-title {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 600;
    text-wrap: balance;
  }
  .dropzone-sub {
    color: var(--ink-2);
    max-width: 520px;
    font-size: 13.5px;
  }
  .link {
    background: none;
    border: 0;
    padding: 0;
    color: var(--accent);
    text-decoration: underline;
    cursor: pointer;
    font: inherit;
  }
  .dropzone-tags {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .dropzone-demo {
    margin-top: 12px;
    color: var(--ink-3);
    font-size: 11.5px;
    max-width: 540px;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    background: var(--surface-2);
    color: var(--ink-2);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-sm);
    font-size: 11.5px;
    font-family: var(--font-mono);
  }
  .mini-step-title {
    font-size: 20px;
    font-weight: 600;
    margin-top: 4px;
  }

  /* ── Parsing stage ────────────────────────────────────────────────── */
  .parse-wrap {
    max-width: 760px;
    margin: 40px auto;
  }
  .parse-title {
    font-size: 38px;
    margin: 8px 0 4px;
  }
  .progress {
    height: 6px;
    background: var(--rule);
    border-radius: 99px;
    overflow: hidden;
  }
  .progress > div {
    height: 100%;
    background: var(--accent);
    transition: width .4s ease;
  }
  .parse-steps {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .parse-step {
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0.4;
    transition: opacity .2s;
  }
  .parse-step.done,
  .parse-step.active {
    opacity: 1;
  }
  .parse-bullet {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid var(--rule-2);
    background: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }
  .parse-step.done .parse-bullet {
    background: var(--pos);
    border-color: var(--pos);
  }
  .parse-step.active .parse-bullet {
    background: var(--surface);
    border-color: var(--rule-2);
  }
  .parse-check :global(svg) {
    width: 12px;
    height: 12px;
  }
  .parse-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: parsePulse 1s infinite;
  }
  @keyframes parsePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .file-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .file-chip {
    flex: 1 1 180px;
    min-width: 0;
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
  }
  .file-chip-icon {
    color: var(--ink-3);
    display: inline-flex;
  }
  .file-chip-body {
    flex: 1;
    min-width: 0;
  }
  .file-chip-name {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Review stage ─────────────────────────────────────────────────── */
  .review-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
    flex-wrap: wrap;
  }
  .seg {
    display: inline-flex;
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    padding: 2px;
    background: var(--surface);
    gap: 2px;
  }
  .seg button {
    background: transparent;
    border: 0;
    padding: 5px 11px;
    font-size: 12px;
    color: var(--ink-2);
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
    font: inherit;
    font-size: 12px;
  }
  .seg button.active {
    background: var(--surface-2);
    color: var(--ink);
    box-shadow: var(--shadow-sm);
  }
  .custodian-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .review-table-wrap {
    overflow-x: auto;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
  }
  .review-table {
    width: 100%;
    min-width: 880px;
    border-collapse: collapse;
    font-size: 13px;
  }
  .review-table thead th {
    text-align: left;
    padding: 10px 12px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-3);
    background: var(--surface-2);
    font-weight: 500;
    border-bottom: 1px solid var(--rule-2);
  }
  .review-table thead th.num { text-align: right; }
  .review-table tbody td {
    padding: 12px;
    border-bottom: 1px solid var(--rule-2);
    vertical-align: middle;
  }
  .review-table tbody td.num { text-align: right; }
  .review-table tbody tr:last-child td { border-bottom: 0; }
  .review-table tbody tr.flagged td {
    background: color-mix(in oklch, var(--warn-soft) 70%, var(--surface));
  }
  .flag-text {
    color: var(--warn);
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .dot.ink { background: var(--ink); }
  .dot.warn { background: var(--warn); }
  .confidence-bar {
    width: 80px;
    height: 6px;
    background: var(--rule);
    border-radius: 99px;
    overflow: hidden;
  }
  .confidence-fill {
    height: 100%;
  }
  .confidence-fill.pos { background: var(--pos); }
  .confidence-fill.neg { background: var(--neg); }

  .action-bar {
    position: sticky;
    bottom: 0;
    margin-top: 24px;
    background: color-mix(in oklch, var(--surface) 92%, transparent);
    backdrop-filter: blur(8px);
    border-top: 1px solid var(--rule);
    padding: 14px 0;
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  .action-bar > span:first-child {
    margin-right: auto;
  }
</style>
