<script>
  import { PRODUCT_TYPES, SOLVE_OPTIONS, TENORS } from './data.js';

  let {
    productType = $bindable(),
    underlyings = $bindable(),
    notional = $bindable(),
    currency = $bindable(),
    tenor = $bindable(),
    strike = $bindable(),
    coupBarrier = $bindable(),
    capBarrier = $bindable(),
    autocallBarrier = $bindable(),
    memory = $bindable(),
    observation = $bindable(),
    protection = $bindable(),
    upsideCap = $bindable(),
    buffer = $bindable(),
    barrierObs = $bindable(),
    solveFor = $bindable(),
    indicative
  } = $props();

  let newUnderlying = $state('');
  const addUnderlying = () => {
    const sym = newUnderlying.trim().toUpperCase();
    newUnderlying = '';
    if (!sym || underlyings.includes(sym)) return;
    underlyings = [...underlyings, sym];
  };
  const removeUnderlying = (sym) => {
    underlyings = underlyings.filter((s) => s !== sym);
  };
</script>

<div class="config-grid">
  <div>
    <h3>Product</h3>

    <div class="field">
      <span class="field-label">Type</span>
      <div class="radio-row">
        {#each PRODUCT_TYPES as t (t.id)}
          <label class="radio">
            <input type="radio" name="rfq-ptype" checked={productType === t.id} onchange={() => (productType = t.id)} />
            {t.label}
          </label>
        {/each}
      </div>
    </div>

    <div class="field">
      <span class="field-label">Underlying</span>
      <div class="chip-row">
        {#each underlyings as s (s)}
          <button type="button" class="chip on" onclick={() => removeUnderlying(s)}>
            {s}<span class="x">×</span>
          </button>
        {/each}
        <input class="input" style="width:140px;padding:6px 10px"
          bind:value={newUnderlying}
          placeholder="+ add ticker"
          onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUnderlying(); } }} />
      </div>
    </div>

    <div class="field">
      <span class="field-label">Notional</span>
      <div class="row gap-8">
        <input class="input mono" style="flex:1" bind:value={notional} />
        <select class="input" style="width:90px" bind:value={currency}>
          <option>USD</option><option>EUR</option><option>CHF</option><option>GBP</option>
        </select>
      </div>
    </div>

    <div class="field">
      <span class="field-label">Tenor</span>
      <div class="chip-row">
        {#each TENORS as t (t)}
          <button type="button" class={'chip' + (tenor === t ? ' on' : '')} onclick={() => (tenor = t)}>{t}</button>
        {/each}
      </div>
    </div>

    <div class="field">
      <span class="field-label">Solve for</span>
      <div class="radio-row">
        {#each SOLVE_OPTIONS[productType] || [] as opt (opt[0])}
          <label class="radio">
            <input type="radio" name="rfq-solve" checked={solveFor === opt[0]} onchange={() => (solveFor = opt[0])} />
            {opt[1]}
          </label>
        {/each}
      </div>
    </div>
  </div>

  <div>
    <h3>Parameters</h3>

    {#if productType === 'autocall'}
      <div class="field">
        <div class="slider-head"><span class="field-label">Strike</span><span class="mono v">{strike}%</span></div>
        <input type="range" min="50" max="130" bind:value={strike} />
      </div>
      <div class="field">
        <div class="slider-head"><span class="field-label">Autocall barrier</span><span class="mono v">{autocallBarrier}%</span></div>
        <input type="range" min="80" max="120" bind:value={autocallBarrier} />
      </div>
      <div class="field">
        <div class="slider-head"><span class="field-label">Coupon barrier</span><span class="mono v">{coupBarrier}%</span></div>
        <input type="range" min="40" max="100" bind:value={coupBarrier} />
      </div>
      <div class="field">
        <div class="slider-head"><span class="field-label">Capital barrier</span><span class="mono v">{capBarrier}%</span></div>
        <input type="range" min="30" max="90" bind:value={capBarrier} />
      </div>
      <div class="field">
        <span class="field-label">Memory feature</span>
        <button type="button" class={'toggle' + (memory ? ' on' : '')} onclick={() => (memory = !memory)}>
          <span class="track"><span class="knob"></span></span>
          {memory ? 'On' : 'Off'}
        </button>
      </div>
      <div class="field">
        <span class="field-label">Observation frequency</span>
        <select class="input" bind:value={observation}>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="semiannual">Semi-annual</option>
          <option value="annual">Annual</option>
        </select>
      </div>
    {:else if productType === 'revconv'}
      <div class="field">
        <div class="slider-head"><span class="field-label">Strike</span><span class="mono v">{strike}%</span></div>
        <input type="range" min="50" max="130" bind:value={strike} />
      </div>
      <div class="field">
        <div class="slider-head"><span class="field-label">Capital barrier</span><span class="mono v">{capBarrier}%</span></div>
        <input type="range" min="30" max="90" bind:value={capBarrier} />
      </div>
      <div class="field">
        <span class="field-label">Barrier observation</span>
        <div class="radio-row">
          <label class="radio">
            <input type="radio" name="rfq-bobs" checked={barrierObs === 'european'} onchange={() => (barrierObs = 'european')} />
            European (at maturity)
          </label>
          <label class="radio">
            <input type="radio" name="rfq-bobs" checked={barrierObs === 'continuous'} onchange={() => (barrierObs = 'continuous')} />
            Continuous (intra-day)
          </label>
        </div>
      </div>
    {:else if productType === 'capprot'}
      <div class="field">
        <div class="slider-head"><span class="field-label">Strike</span><span class="mono v">{strike}%</span></div>
        <input type="range" min="50" max="130" bind:value={strike} />
      </div>
      <div class="field">
        <div class="slider-head"><span class="field-label">Capital protection</span><span class="mono v">{protection}%</span></div>
        <input type="range" min="80" max="100" bind:value={protection} />
      </div>
      <div class="field">
        <div class="slider-head"><span class="field-label">Upside cap</span><span class="mono v">{upsideCap === 0 ? 'uncapped' : upsideCap + '%'}</span></div>
        <input type="range" min="0" max="250" bind:value={upsideCap} />
      </div>
      <p class="hint">Set cap to 0 for uncapped upside · usually costs ~10% of participation.</p>
    {:else}
      <div class="field">
        <div class="slider-head"><span class="field-label">Strike</span><span class="mono v">{strike}%</span></div>
        <input type="range" min="50" max="130" bind:value={strike} />
      </div>
      <div class="field">
        <div class="slider-head"><span class="field-label">Buffer</span><span class="mono v">{buffer}% loss absorbed</span></div>
        <input type="range" min="5" max="30" bind:value={buffer} />
      </div>
      <div class="field">
        <div class="slider-head"><span class="field-label">Upside cap</span><span class="mono v">{upsideCap === 0 ? 'uncapped' : upsideCap + '%'}</span></div>
        <input type="range" min="0" max="250" bind:value={upsideCap} />
      </div>
      <p class="hint">Buffer absorbs the first N% of underlying loss; below that, 1:1 downside.</p>
    {/if}

    <div class="indicative">
      <span>{indicative.label} (Bloomberg, midpoint)</span>
      <span class="v">{indicative.value}{indicative.unit}</span>
    </div>
  </div>
</div>

<style>
  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  @media (max-width: 800px) {
    .config-grid { grid-template-columns: 1fr; gap: 24px; }
  }
  h3 {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 16px;
    margin: 0 0 12px;
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
  .chip-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
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
  .chip .x {
    margin-left: 4px;
    opacity: 0.6;
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
  .mono {
    font-family: var(--font-mono);
  }
  .row {
    display: flex;
    align-items: center;
  }
  .gap-8 {
    gap: 8px;
  }
  .slider-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .slider-head .field-label {
    margin-bottom: 0;
  }
  .slider-head .v {
    font-size: 13px;
    font-weight: 600;
  }
  input[type='range'] {
    width: 100%;
    margin-top: 6px;
    accent-color: var(--accent);
  }
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    user-select: none;
    background: transparent;
    border: 0;
    color: var(--ink);
    font-family: inherit;
    padding: 0;
  }
  .toggle .track {
    width: 32px;
    height: 18px;
    background: var(--rule-2);
    border-radius: 999px;
    position: relative;
    transition: background 0.15s;
  }
  .toggle .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    background: var(--surface);
    border-radius: 50%;
    transition: left 0.15s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  .toggle.on .track {
    background: var(--ink);
  }
  .toggle.on .knob {
    left: 16px;
  }
  .hint {
    color: var(--ink-3);
    font-size: 11px;
    margin: -8px 0 16px;
  }
  .indicative {
    padding: 10px 12px;
    background: color-mix(in oklch, var(--accent) 10%, var(--surface));
    border-radius: var(--r-md);
    font-size: 12px;
    color: var(--accent);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }
  .indicative .v {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 14px;
  }
</style>
