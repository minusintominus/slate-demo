<script>
  import { CLIENT_BOOK, SP_BOOK } from '$lib/data/fixtures.js';

  // Optional clientId filter — when set, only that client's notes show
  // and the Client column is hidden (it would be redundant).
  let { clientId = null } = $props();

  // Demo: which client purchased each structure. In production this would
  // be derived from the account → household relationship.
  const NOTE_OWNER = {
    sp1: 'marchetti',
    sp2: 'whitmore',
    sp3: 'sato'
  };
  const clientName = (id) => (CLIENT_BOOK.find((c) => c.id === id) || {}).name || id;
  const ownerOf = (noteId) => clientName(NOTE_OWNER[noteId]);

  const visibleNotes = $derived(
    clientId ? SP_BOOK.filter((n) => NOTE_OWNER[n.id] === clientId) : SP_BOOK
  );

  const fmtMoney = (n) => {
    const sign = n < 0 ? '−' : '';
    const abs = Math.abs(n);
    if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(0) + 'k';
    return sign + '$' + abs.toFixed(0);
  };
  const fmtPct = (n) => (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  // Single-name tickers (all caps, no spaces) get a $ prefix and 2dp;
  // indices like "S&P 500" render as a plain index level.
  const isTicker = (u) => /^[A-Z]{1,6}$/.test(u);
  const fmtLevel = (underlier, value) => {
    if (value == null) return '';
    if (isTicker(underlier)) return '$' + value.toFixed(2);
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };
  const LEVEL_LABEL = {
    buffer: 'Buffer',
    'knock-in': 'Knock-in',
    'knock-out': 'Knock-out',
    autocall: 'Autocall',
    cap: 'Cap',
    floor: 'Floor'
  };
  const labelFor = (kind) => LEVEL_LABEL[kind] || kind;

  const SHAPE_LABEL = {
    buffer: 'Buffer',
    booster: 'Booster',
    reverse_convertible: 'Reverse Convertible',
    autocallable: 'Autocallable',
    capital_protected: 'Capital Protected'
  };

  let totalNotional = $derived(visibleNotes.reduce((a, n) => a + n.notional, 0));
  let totalMtm = $derived(visibleNotes.reduce((a, n) => a + n.mtm, 0));
  let weightedPnl = $derived(totalNotional > 0 ? ((totalMtm - totalNotional) / totalNotional) * 100 : 0);
  let couponYtd = $derived(visibleNotes.reduce((a, n) => a + (n.couponCollected || 0), 0));
</script>

<div class="summary">
  <div class="kpi">
    <span class="label">Notes outstanding</span>
    <span class="v">{visibleNotes.length}</span>
  </div>
  <div class="kpi">
    <span class="label">Total notional</span>
    <span class="v mono">{fmtMoney(totalNotional)}</span>
  </div>
  <div class="kpi">
    <span class="label">Mark-to-market</span>
    <span class="v mono">{fmtMoney(totalMtm)}</span>
  </div>
  <div class="kpi">
    <span class="label">Aggregate P/L</span>
    <span class="v mono" class:pos={weightedPnl >= 0} class:neg={weightedPnl < 0}>{fmtPct(weightedPnl)}</span>
  </div>
  <div class="kpi">
    <span class="label">Coupons collected</span>
    <span class="v mono">{fmtMoney(couponYtd)}</span>
  </div>
</div>

<div class="table-shell">
  <table>
    <thead>
      <tr>
        <th>Note</th>
        {#if !clientId}<th>Client</th>{/if}
        <th>Issuer</th>
        <th>Underlier</th>
        <th class="num">Notional</th>
        <th class="num">MTM</th>
        <th class="num">P/L</th>
        <th>Next event</th>
        <th>Maturity</th>
      </tr>
    </thead>
    <tbody>
      {#each visibleNotes as note (note.id)}
        <tr>
          <td>
            <div class="note-name">{note.name}</div>
            <div class="note-shape">
              <span class="tag">{SHAPE_LABEL[note.shape] || note.shape}</span>
              {#if note.coupon != null}
                <span class="coupon mono">{note.coupon.toFixed(2)}% coupon</span>
              {/if}
            </div>
          </td>
          {#if !clientId}<td class="client">{ownerOf(note.id)}</td>{/if}
          <td>{note.issuer}</td>
          <td>
            <div>{note.underlier}</div>
            {#if note.currentSpot != null}
              <div class="spot mono">
                <span class="spot-label">Spot</span> {fmtLevel(note.underlier, note.currentSpot)}
                <span class="spot-pct" class:pos={note.spotPct >= 100} class:neg={note.spotPct < 100}>
                  {fmtPct(note.spotPct - 100)}
                </span>
              </div>
            {/if}
            {#if note.strike != null}
              <div class="spot mono">
                <span class="spot-label">Strike</span> {fmtLevel(note.underlier, note.strike)}
              </div>
            {/if}
            {#if note.levels?.length && note.strike != null}
              {#each note.levels as level}
                <div class="spot mono">
                  <span class="spot-label">{labelFor(level.kind)}</span>
                  {fmtLevel(note.underlier, note.strike * level.pct / 100)}
                  <span class="spot-pct level-pct">{level.pct}%{level.obs ? ` · ${level.obs}` : ''}</span>
                </div>
              {/each}
            {/if}
          </td>
          <td class="num mono">{fmtMoney(note.notional)}</td>
          <td class="num mono">{fmtMoney(note.mtm)}</td>
          <td class="num mono" class:pos={note.pnlPct >= 0} class:neg={note.pnlPct < 0}>{fmtPct(note.pnlPct)}</td>
          <td class="next-event">{note.nextEvent}</td>
          <td class="mono maturity">{fmtDate(note.maturity)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<p class="footnote">
  Held positions reconciled overnight from custodian feeds. Click a row for the full lifecycle, observations, and counterparty exposure.
</p>

<style>
  .summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0;
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
    margin-bottom: 20px;
    background: var(--surface);
  }
  .kpi {
    padding: 16px 20px;
    border-left: 1px solid var(--rule-2);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .kpi:first-child {
    border-left: 0;
  }
  .kpi .label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .kpi .v {
    font-size: 20px;
    font-weight: 600;
    color: var(--ink);
  }
  .mono {
    font-family: var(--font-mono);
    font-feature-settings: 'tnum';
  }
  .pos { color: var(--pos); }
  .neg { color: var(--neg); }

  .table-shell {
    border-radius: var(--r-md);
    border: 1px solid var(--rule-2);
    overflow-x: auto;
  }
  table {
    width: 100%;
    min-width: 880px;
    border-collapse: collapse;
  }
  thead th {
    text-align: left;
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-3);
    border-bottom: 1px solid var(--rule-2);
    background: var(--surface-2);
  }
  thead th.num {
    text-align: right;
  }
  td {
    padding: 14px;
    border-bottom: 1px solid var(--rule-2);
    font-size: 14px;
    vertical-align: middle;
  }
  td.num {
    text-align: right;
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  tbody tr:hover td {
    background: var(--surface-2);
  }
  .note-name {
    font-weight: 600;
  }
  .note-shape {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    background: color-mix(in oklch, var(--accent) 12%, var(--surface));
    color: var(--accent);
    border-radius: var(--r-sm);
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .coupon {
    font-size: 11px;
    color: var(--ink-3);
  }
  .next-event {
    font-size: 12px;
    color: var(--ink-2);
  }
  .client {
    font-weight: 500;
  }
  .maturity {
    color: var(--ink-2);
    font-size: 12px;
  }
  .spot {
    margin-top: 3px;
    font-size: 11.5px;
    color: var(--ink-3);
  }
  .spot-label {
    font-family: var(--font-mono);
    font-size: 9.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-4);
    margin-right: 2px;
  }
  .spot-pct {
    margin-left: 6px;
    font-size: 10.5px;
  }
  .level-pct {
    color: var(--ink-4);
  }
  .footnote {
    color: var(--ink-3);
    font-size: 11px;
    margin: 12px 0 0;
  }
</style>
