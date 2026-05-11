// Slate — Alternative Investments + Structured Products screens.
// Each is a tabbed page sized for the way an RM actually works through these books.

const { Icons, fmt, ALT_DEALS, ALT_THESES, ALT_STRATEGY_MIX, ALT_JCURVE,
        ALT_CASHFLOW, ALT_UNFUNDED_LADDER,
        SP_RFQ, SP_QUOTES, SP_TEMPLATES, SP_HISTORY, SP_BOOK, SP_CALENDAR,
        Charts, HOUSEHOLD } = window.Slate;

const STRUCTURED_OPPORTUNITY_OPTIN_KEY = 'slate-structured-opportunity-optin';

function slateRouteNorm() {
  return (window.SlateRoute && window.SlateRoute.read) ? window.SlateRoute.read() : location.hash.slice(1);
}

/** Client hub: your positions + one open opportunity with opt-in. */
function StructuredClientOverview({ setTab }) {
  const totalMtm = SP_BOOK.reduce((a, n) => a + n.mtm, 0);
  const totalNotional = SP_BOOK.reduce((a, n) => a + n.notional, 0);
  const couponYtd = SP_BOOK.reduce((a, n) => a + n.couponCollected, 0);
  const sortedQuotes = SP_QUOTES.filter(q => !q.pending && q.coupon != null).sort((a, b) => (b.coupon || 0) - (a.coupon || 0));
  const best = sortedQuotes[0];
  const pendingCt = SP_QUOTES.filter(q => q.pending).length;
  const returnedCt = SP_QUOTES.filter(q => !q.pending).length;
  const quoteTotal = SP_QUOTES.length;
  const [optin, setOptin] = React.useState(() => {
    try { return sessionStorage.getItem(STRUCTURED_OPPORTUNITY_OPTIN_KEY) || ''; } catch (e) { return ''; }
  });
  const saveOpt = v => {
    try { sessionStorage.setItem(STRUCTURED_OPPORTUNITY_OPTIN_KEY, v); } catch (e) { /* ignore */ }
    setOptin(v);
  };

  return (
    <div className="stack stack-3" style={{ gap: 24 }}>
      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="label">What you own</div>
          <h3 className="serif" style={{ margin: '10px 0 12px', fontSize: 18 }}>Structured notes</h3>
          <p className="text-2" style={{ fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
            {SP_BOOK.length} notes in your portfolio · mark-to-market {fmt.money(totalMtm, { compact: true })} · notional {fmt.money(totalNotional, { compact: true })} · coupons collected this year +{fmt.money(couponYtd, { compact: true })}
          </p>
          <button type="button" className="btn sm" onClick={() => setTab('book')}>View your notes</button>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="label">Open to you</div>
          <h3 className="serif" style={{ margin: '10px 0 6px', fontSize: 18, lineHeight: 1.25 }}>{SP_RFQ.type}</h3>
          <p className="text-3" style={{ fontSize: 12, marginBottom: 10 }}>
            {SP_RFQ.id} · underliers {SP_RFQ.underliersDisplay || SP_RFQ.underlier} · {fmt.money(SP_RFQ.notional, { compact: true })} · {SP_RFQ.tenorLabel || SP_RFQ.tenor}
          </p>
          {best ? (
            <p className="text-2" style={{ fontSize: 13, marginBottom: 14 }}>
              Leading quoted coupon <strong>{best.coupon.toFixed(2)}%</strong> from {best.issuer}. {returnedCt} of {quoteTotal} institutions have responded{pendingCt ? ` · ${pendingCt} still outstanding` : ''}.
            </p>
          ) : (
            <p className="text-2" style={{ fontSize: 13, marginBottom: 14 }}>Quotes are still arriving.</p>
          )}
          <p className="text-2" style={{ fontSize: 13, marginBottom: 16 }}>
            Review the payoff and side-by-side quotes when you are ready; your advisor can walk through trade-offs and next steps.
          </p>
          {!optin ? (
            <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
              <button type="button" className="btn primary sm" onClick={() => saveOpt('interested')}>I want to explore this</button>
              <button type="button" className="btn ghost sm" onClick={() => saveOpt('pass')}>Not now</button>
              <button type="button" className="btn ghost sm" onClick={() => setTab('rfq')}>See quotes</button>
            </div>
          ) : optin === 'interested' ? (
            <p className="text-3" style={{ fontSize: 13 }}>You flagged this for follow-up. Your advisor will connect on timing and terms.</p>
          ) : (
            <p className="text-3" style={{ fontSize: 13 }}>You skipped this for now. You can reopen it anytime under Quote comparison.</p>
          )}
        </div>
      </div>
      <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn ghost sm" onClick={() => setTab('rfq')}>Quote comparison</button>
        <button type="button" className="btn ghost sm" onClick={() => setTab('calendar')}>Calendar</button>
      </div>
    </div>
  );
}

/** @param {{ setTab: Function, clientView?: boolean }} props */
function AltsOverviewTab({ setTab, clientView = false }) {
  const totalCommitted = 25000000;
  const totalCalled = 8400000;
  const totalUnfunded = totalCommitted - totalCalled;
  const topDeal = ALT_DEALS.slice().sort((a, b) => b.fitScore - a.fitScore)[0];
  const allocatedRows = ALT_STRATEGY_MIX.filter(s => s.mvActual > 0);
  const buyoutHeavy = allocatedRows.length > 0 && allocatedRows.every(s => s.key === 'buyout');

  return (
    <div className="grid-2" style={{ gap: 20 }}>
      <div className="card" style={{ padding: 24 }}>
        <h3 className="serif" style={{ margin: '0 0 8px', fontSize: 18 }}>Commitments &amp; liquidity</h3>
        <p className="text-3" style={{ fontSize: 12, marginBottom:  16 }}>{clientView ? 'Your private-markets commitments — capital called so far and what remains unfunded.' : 'Your private-markets commitments — capital called so far and what remains unfunded (illustrative).'}</p>
        <div className="kpis kpis--commitments-strip" style={{ marginTop: 0 }}>
          <div className="kpi"><span className="label">Total committed</span><span className="v lg">{fmt.money(totalCommitted, { compact: true })}</span></div>
          <div className="kpi"><span className="label">Called to date</span><span className="v lg">{fmt.money(totalCalled, { compact: true })}</span></div>
          <div className="kpi" title="Capital still to be drawn by GPs."><span className="label">Unfunded</span><span className="v lg">{fmt.money(totalUnfunded, { compact: true })}</span></div>
        </div>
        <div className="row gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn ghost sm" onClick={() => setTab('cashflow')}>Cashflow plan</button>
          <button type="button" className="btn ghost sm" onClick={() => setTab('pacing')}>Pacing plan</button>
        </div>
      </div>
      <div className="card" style={{ padding: 24 }}>
        <h3 className="serif" style={{ margin: '0 0 8px', fontSize: 18 }}>Strategy &amp; opportunities</h3>
        <div className="margin-note" style={{ fontSize: 13, marginBottom: 12 }}>
          <div className="label" style={{ color: buyoutHeavy ? 'var(--warn)' : 'var(--ink-3)' }}>Posture</div>
          <div style={{ marginTop: 4 }}>
            {buyoutHeavy
              ? (clientView
                ? 'Most of your alternatives sleeve is in a single buyout fund. Strategy mix and pacing show how diversification may evolve over time.'
                : 'Alts sleeve is concentrated in a single Buyout vintage — IPS sub-weights are off. Review strategy mix and pacing.')
              : 'Allocation vs. IPS sub-targets is tracked on Strategy mix.'}
          </div>
        </div>
        {topDeal && (
          <div className="stack stack-2" style={{ fontSize: 13 }}>
            <div className="label">{clientView ? 'Opportunity under review' : 'Top-ranked open deal'}</div>
            <div className="serif" style={{ fontWeight: 600 }}>{topDeal.name}</div>
            <div className="text-3" style={{ fontSize: 12 }}>{topDeal.sponsor} · {clientView ? `alignment ${topDeal.fitScore}` : `fit ${topDeal.fitScore}`}</div>
          </div>
        )}
        <div className="row gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn ghost sm" onClick={() => setTab('strategy')}>Strategy mix</button>
          <button type="button" className="btn ghost sm" onClick={() => setTab('deals')}>{clientView ? 'Available opportunities' : 'Deal flow'}</button>
          <button type="button" className="btn ghost sm" onClick={() => setTab('holdings')}>Holdings</button>
        </div>
      </div>
    </div>
  );
}

/** @param {{ setTab: Function, clientView?: boolean }} props */
function StructuredOverviewTab({ setTab, clientView = false }) {
  if (clientView) {
    return <StructuredClientOverview setTab={setTab} />;
  }
  const totalMtm = SP_BOOK.reduce((a, n) => a + n.mtm, 0);
  const totalNotional = SP_BOOK.reduce((a, n) => a + n.notional, 0);
  const couponYtd = SP_BOOK.reduce((a, n) => a + n.couponCollected, 0);
  const sortedQuotes = SP_QUOTES.filter(q => !q.pending && q.coupon != null).sort((a, b) => (b.coupon || 0) - (a.coupon || 0));
  const bestCoupon = sortedQuotes[0];
  const pendingIssuers = SP_QUOTES.filter(q => q.pending).length;

  return (
    <div>
      <div className="kpis">
        <div className="kpi"><span className="label">Live RFQ</span><span className="v lg">{SP_RFQ.id}</span><span className="text-3" style={{ fontSize: 11 }}>{pendingIssuers ? (pendingIssuers === 1 ? '1 issuer pending' : `${pendingIssuers} issuers pending`) : 'All dealers in'}</span></div>
        <div className="kpi"><span className="label">Best indicative coupon</span><span className="v lg" style={{ color: 'var(--pos)' }}>{bestCoupon ? `${bestCoupon.coupon.toFixed(2)}%` : '—'}</span><span className="text-3" style={{ fontSize: 11 }}>{bestCoupon ? bestCoupon.issuer : ''}</span></div>
        <div className="kpi"><span className="label">Book · notes</span><span className="v lg">{SP_BOOK.length}</span><span className="text-3" style={{ fontSize: 11 }}>MTM {fmt.money(totalMtm, { compact: true })}</span></div>
        <div className="kpi"><span className="label">Book · notional</span><span className="v lg">{fmt.money(totalNotional, { compact: true })}</span><span className="text-3" style={{ fontSize: 11 }}>Coupon YTD +{fmt.money(couponYtd, { compact: true })}</span></div>
      </div>
      <div className="margin-note mt-16" style={{ fontSize: 13 }}>
        <div className="label" style={{ color: 'var(--accent)' }}>Suggested next step</div>
        <div style={{ marginTop: 4 }}>Compare issuer responses on the active RFQ, then cross-check barrier proximity on the existing book before execution.</div>
      </div>
      <div className="row gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn sm" onClick={() => setTab('active')}>Open active RFQ</button>
        <button type="button" className="btn ghost sm" onClick={() => setTab('book')}>View book</button>
        <button type="button" className="btn ghost sm" onClick={() => setTab('calendar')}>Event calendar</button>
      </div>
    </div>
  );
}

const ALTS_URL_SUBS = ['overview', 'deals', 'strategy', 'holdings', 'pacing', 'cashflow'];

function parseAltsTabFromHash() {
  const norm = slateRouteNorm();
  const pathOnly = norm.split('?')[0];
  if (!/\/alts$/.test(pathOnly)) return 'overview';
  const qi = norm.indexOf('?');
  if (qi < 0) return 'overview';
  const sub = new URLSearchParams(norm.slice(qi)).get('sub');
  return sub && ALTS_URL_SUBS.includes(sub) ? sub : 'overview';
}

/** @param {string} tab */
function syncAltsTabToHash(tab) {
  const norm = slateRouteNorm();
  const pathOnly = norm.split('?')[0];
  if (!/\/alts$/.test(pathOnly)) return;
  const next = tab === 'overview' ? pathOnly : `${pathOnly}?sub=${encodeURIComponent(tab)}`;
  if (slateRouteNorm() !== next) window.SlateRoute.write(next);
}

// ============ Alternative Investments ============
/** @param {{ clientView?: boolean }} props When clientView, copy and actions are household-facing (no RM sales tooling). */
function AltsScreen({ clientView = false }) {
  const [tab, setTabState] = React.useState(parseAltsTabFromHash);
  const setTab = React.useCallback((t) => {
    setTabState(t);
    syncAltsTabToHash(t);
  }, []);
  React.useEffect(() => {
    const onNav = () => setTabState(parseAltsTabFromHash());
    window.addEventListener('hashchange', onNav);
    window.addEventListener('slate-route', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('slate-route', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, []);
  return (
    <div className={`page${clientView ? ' alts-screen--client' : ''}`}>
      <div className="page-header">
        <div>
          {!clientView ? (
            <div className="eyebrow">Curated · matched to Marchetti IPS & theses</div>
          ) : null}
          <h1 className="serif">Alternative Investments</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 640 }}>
            {clientView
              ? 'Holdings, pacing, and cashflows for your alternatives sleeve — plus opportunities your advisor has flagged for you.'
              : 'Deal flow filtered against the household IPS, current allocation drift, and stated theses. Fit score blends sponsor track record, IPS fit, vintage timing, and diversification.'}
          </p>
        </div>
        <span className="tag accent">
          {clientView ? 'Target ~13% alternatives · ~12.2% today' : 'Alts target 13% · actual 12.2%'}
        </span>
      </div>

      <div className="tabs">
        <button type="button" className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}>Overview</button>
        <button type="button" className={tab==='deals'?'active':''} onClick={()=>setTab('deals')}>{clientView ? `Available to you (${ALT_DEALS.length})` : `Deal flow (${ALT_DEALS.length})`}</button>
        <button type="button" className={tab==='strategy'?'active':''} onClick={()=>setTab('strategy')}>Strategy mix</button>
        <button type="button" className={tab==='holdings'?'active':''} onClick={()=>setTab('holdings')}>Holdings</button>
        <button type="button" className={tab==='pacing'?'active':''} onClick={()=>setTab('pacing')}>Pacing plan</button>
        <button type="button" className={tab==='cashflow'?'active':''} onClick={()=>setTab('cashflow')}>Cashflow plan</button>
      </div>

      {tab === 'overview' && <AltsOverviewTab setTab={setTab} clientView={clientView}/>}
      {tab === 'deals'    && <AltsDealFlowTab clientView={clientView}/>}
      {tab === 'strategy' && <AltsStrategyMixTab clientView={clientView}/>}
      {tab === 'holdings' && <AltsHoldingsTab/>}
      {tab === 'pacing'   && <AltsPacingTab clientView={clientView}/>}
      {tab === 'cashflow' && <AltsCashflowTab clientView={clientView}/>}
    </div>
  );
}

// Deal flow — thesis chips + sorted-by-fit cards with fit-score breakdown.
function AltsDealFlowTab({ clientView = false }) {
  const [activeTheses, setActiveTheses] = React.useState(() => ALT_THESES.map(t => t.key));
  const [strategyFilter, setStrategyFilter] = React.useState('all');

  const toggleThesis = key => {
    setActiveTheses(s => s.includes(key) ? s.filter(x => x !== key) : [...s, key]);
  };

  const STRATS = [
    ['all', 'All strategies'],
    ['buyout', 'Buyout'],
    ['credit', 'Credit'],
    ['real_assets', 'Real Assets'],
    ['venture', 'Venture'],
    ['secondaries', 'Secondaries'],
  ];

  let deals = ALT_DEALS.slice();
  if (strategyFilter !== 'all') deals = deals.filter(d => d.strategyKey === strategyFilter);
  deals = deals.filter(d => activeTheses.includes(d.thesisKey));
  deals.sort((a, b) => b.fitScore - a.fitScore);

  return (
    <div>
      <div className="mb-16">
        <div className="label" style={{ marginBottom: 8 }}>{clientView ? 'Themes that matter to you · tap to filter' : 'Active theses · click to toggle'}</div>
        <div className="chips">
          {ALT_THESES.map(t => {
            const on = activeTheses.includes(t.key);
            return (
              <span key={t.key} className={`thesis-tag ${on ? 'on' : ''}`} onClick={() => toggleThesis(t.key)}>
                {on ? '✓ ' : ''}{t.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="row gap-12 mb-16" style={{ flexWrap:'wrap', alignItems:'center' }}>
        <div className="seg">
          {STRATS.map(([k, l]) => (
            <button key={k} className={strategyFilter===k?'active':''} onClick={()=>setStrategyFilter(k)}>{l}</button>
          ))}
        </div>
        <div className="spacer"/>
        <span className="text-3" style={{ fontSize: 12 }}>{deals.length} {clientView ? 'opportunities · ordered by fit to your priorities' : 'offerings · sorted by fit'}</span>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {deals.map(d => <DealCard key={d.id} d={d} clientView={clientView}/>)}
        {deals.length === 0 && (
          <div className="card" style={{ padding: 28, gridColumn:'1 / -1', textAlign:'center', color:'var(--ink-3)' }}>
            {clientView
              ? 'No opportunities match the selected themes. Try enabling another theme above.'
              : 'No deals match the active theses. Toggle more chips above.'}
          </div>
        )}
      </div>
    </div>
  );
}

function DealCard({ d, clientView = false }) {
  const [interest, setInterest] = React.useState('');
  const fitParts = [
    ['Sponsor track',    d.fit.sponsor,        30],
    [clientView ? 'Policy fit' : 'IPS fit', d.fit.ips, 35],
    ['Vintage timing',   d.fit.vintage,        20],
    ['Diversification',  d.fit.diversification,15],
  ];
  const thesisLabel = (ALT_THESES.find(t => t.key === d.thesisKey) || {}).label;

  return (
    <div className="card" style={{ padding: 24, display:'flex', flexDirection:'column', gap: 14 }}>
      <div className="row" style={{ justifyContent:'space-between', alignItems:'flex-start', gap: 16 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="eyebrow">{d.sponsor}</div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginTop: 2, lineHeight: 1.15, textWrap: 'balance' }}>{d.name}</div>
          <div className="text-3" style={{ fontSize: 12, marginTop: 6 }}>{d.strategy} · vintage {d.vintage}</div>
          {thesisLabel && <span className="tag accent" style={{ marginTop: 8 }}>thesis · {thesisLabel}</span>}
        </div>
        <div title={clientView ? 'Score vs. your policy and diversification goals (0–100).' : 'Fit score 0–100 — sum of sponsor track (/30), IPS fit (/35), vintage timing (/20), diversification (/15). Green at ≥85.'} style={{ textAlign:'right', minWidth: 90, cursor:'help' }}>
          <div className="label">{clientView ? 'Alignment' : 'Fit score'}</div>
          <div className="num" style={{ fontSize: 30, color: d.fitScore >= 85 ? 'var(--pos)' : 'var(--ink)' }}>{d.fitScore}</div>
          <div className="bar-track" style={{ width: 90, marginTop: 4 }}>
            <div className="bar-fill" style={{ width: d.fitScore + '%', background: d.fitScore >= 85 ? 'var(--pos)' : 'var(--ink-3)' }}/>
          </div>
        </div>
      </div>

      <div className="stack stack-2" style={{ paddingTop: 4 }}>
        {fitParts.map(([label, score, max]) => (
          <div key={label} className="row" style={{ alignItems:'center', gap: 10, fontSize: 11.5 }}>
            <span style={{ width: 110, color: 'var(--ink-3)' }}>{label}</span>
            <div className="bar-track" style={{ flex: 1, height: 4 }}>
              <div className="bar-fill" style={{ width: ((score / max) * 100) + '%' }}/>
            </div>
            <span className="num" style={{ width: 38, textAlign: 'right', color: 'var(--ink-2)' }}>{score}/{max}</span>
          </div>
        ))}
      </div>

      <div className="grid-4" style={{ gap: 12 }}>
        <div title="Target IRR — the annualized return the GP is targeting (range)." style={{ cursor:'help' }}><div className="label">Target IRR</div><div className="num" style={{ fontSize: 14 }}>{d.target}</div></div>
        <div title="Fund life — how long capital is locked up (years + possible extension)." style={{ cursor:'help' }}><div className="label">Term</div><div className="num" style={{ fontSize: 14 }}>{d.term}</div></div>
        <div title="Minimum LP commitment to enter the fund." style={{ cursor:'help' }}><div className="label">Min</div><div className="num" style={{ fontSize: 14 }}>{fmt.money(d.minimum, {compact:true})}</div></div>
        <div title="Annual management fee (% of committed capital) / carried interest (GP's share of profits, typically above an 8% hurdle)." style={{ cursor:'help' }}><div className="label">Mgmt / Carry</div><div className="num" style={{ fontSize: 14 }}>{d.mgmt}% / {d.carry}%</div></div>
      </div>

      <div className="margin-note" style={{ fontSize: 13 }}>
        <div className="label" style={{ color:'var(--accent)' }}>{clientView ? 'Summary' : 'Why it fits'}</div>
        <div style={{ marginTop: 2 }}>{d.why}</div>
      </div>

      <div className="row" style={{ justifyContent:'space-between', alignItems:'center', gap: 12, borderTop:'1px dashed var(--rule-2)', paddingTop: 12, flexWrap:'wrap' }}>
        <div className="text-3" style={{ fontSize: 11.5, display:'flex', flexWrap:'wrap', gap: 10, alignItems:'center' }}>
          <span className={`tag ${d.status === 'Limited' ? 'warn' : ''}`} title={d.status === 'Limited' ? 'Subscription nearly full — closing soon.' : 'Currently accepting new commitments.'} style={{ cursor:'help' }}>{d.status}</span>
          <span title="Final date to commit. Wires happen later via capital calls." style={{ cursor:'help' }}>Closes {d.closeDate}</span>
          <span>·</span>
          <span title="Capital raised so far / target fund size." style={{ cursor:'help' }}>{d.commitments}</span>
          <span>·</span>
          <span title="Share of fund committed by the GP from their own money — alignment indicator." style={{ cursor:'help' }}>GP commit {d.gpCommit}</span>
          {d.coInvest && <span className="tag" title="The GP may allow direct co-investment alongside the fund on select deals (terms vary)." style={{ borderColor:'var(--accent)', color:'var(--accent)', cursor:'help' }}>co-invest</span>}
        </div>
        {clientView ? (
          <div className="row gap-8" style={{ flex: '0 0 auto', alignItems: 'center', flexWrap: 'wrap' }}>
            {interest === 'interested' ? (
              <span className="text-3" style={{ fontSize: 12 }}>Saved — your advisor will follow up.</span>
            ) : interest === 'pass' ? (
              <span className="text-3" style={{ fontSize: 12 }}>Set aside for now.</span>
            ) : (
              <>
                <button type="button" className="btn primary sm" onClick={() => setInterest('interested')}>I am interested</button>
                <button type="button" className="btn ghost sm" onClick={() => setInterest('pass')}>Not for me</button>
              </>
            )}
          </div>
        ) : (
          <div className="row gap-8" style={{ flex: '0 0 auto' }}>
            <button type="button" className="btn ghost sm">Brief</button>
            <button type="button" className="btn sm">Log client convo</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Strategy mix — actual vs target across the alts sleeve, plus vintage diversification.
function AltsStrategyMixTab({ clientView = false }) {
  const totalActualMv = ALT_STRATEGY_MIX.reduce((a, s) => a + s.mvActual, 0);
  return (
    <div className="grid-2">
      <div className="card" style={{ padding: 28 }}>
        <h3 className="serif" style={{ margin: 0, fontSize: 18 }}>Sub-strategy targets</h3>
        <div className="text-3" style={{ fontSize: 12 }}>{clientView ? 'Within your alternatives sleeve. Bar = your allocation; tick = policy sub-target.' : 'Within the 13% alts sleeve. Bar = actual; tick = IPS sub-target.'}</div>
        <div className="stack stack-3 mt-16">
          {ALT_STRATEGY_MIX.map(s => (
            <div key={s.key}>
              <div className="row" style={{ justifyContent:'space-between' }}>
                <span style={{ fontSize: 13 }}>{s.label}</span>
                <span className="num" style={{ fontSize: 13 }}>
                  {s.actual.toFixed(0)}% <span className="text-3" style={{ fontSize: 11, marginLeft: 6 }}>tgt {s.target}%</span>
                </span>
              </div>
              <div className="bar-track with-target mt-8">
                <div className={`bar-fill ${Math.abs(s.actual - s.target) > 15 ? 'neg' : ''}`} style={{ width: Math.min(100, s.actual) + '%' }}/>
                <div className="target" style={{ left: s.target + '%' }}/>
              </div>
              <div className="text-3 mt-8" style={{ fontSize: 11 }}>{fmt.money(s.mvActual, { compact: true })} committed</div>
            </div>
          ))}
        </div>
      </div>

      <div className="stack stack-3" style={{ gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="label">Alts sleeve · committed</div>
          <div className="num" style={{ fontSize: 32, marginTop: 4 }}>{fmt.money(totalActualMv, { compact: true })}</div>
          <div className="text-3" style={{ fontSize: 12 }}>Pine Ridge II only · 100% Buyout</div>
          <hr className="divider dashed" style={{ margin: '16px 0' }}/>
          <div className="margin-note" style={{ fontSize: 13 }}>
            <div className="label" style={{ color:'var(--accent)' }}>Concentration risk</div>
            <div style={{ marginTop: 2 }}>
              {clientView
                ? 'Your private-markets capital is in one buyout fund today. Pacing shows how your team plans to add credit, real assets, and secondaries over time.'
                : 'All alts capital is in a single Buyout fund. The pacing plan begins diversifying into Credit, Real Assets, and Secondaries — see Pacing plan tab.'}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 className="serif" style={{ margin: 0, fontSize: 16 }}>Vintage diversification</h3>
          <div className="text-3" style={{ fontSize: 12 }}>Commitments by vintage year (existing + planned).</div>
          <div className="row gap-16 mt-8" style={{ flexWrap:'wrap', fontSize: 11, color:'var(--ink-3)' }}>
            <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:14, height:8, background:'var(--ink)' }}/> existing commitment</span>
            <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:14, height:8, background:'var(--ink-3)' }}/> planned (pacing plan)</span>
          </div>
          <div className="stack stack-2 mt-16">
            {[
              { y: 2019, mv: 10000000, kind: 'existing' },
              { y: 2026, mv: 7500000,  kind: 'planned'  },
              { y: 2027, mv: 7500000,  kind: 'planned'  },
            ].map(v => (
              <div key={v.y} className="row" style={{ alignItems:'center', gap: 10, fontSize: 13 }}>
                <span className="mono" style={{ width: 50 }}>{v.y}</span>
                <div className="bar-track" style={{ flex: 1 }}>
                  <div className="bar-fill" style={{ width: ((v.mv / 12000000) * 100) + '%', background: v.kind === 'existing' ? 'var(--ink)' : 'var(--ink-3)' }}/>
                </div>
                <span className="num" style={{ width: 60, textAlign:'right' }}>{fmt.money(v.mv, { compact: true })}</span>
                <span className="tag">{v.kind}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Holdings — existing alt commitments. Today: Pine Ridge II only.
function AltsHoldingsTab() {
  const stats = [
    { label: 'Commitment',          value: '$10.0M', tip: 'Total amount pledged to the fund. Drawn over time via capital calls.' },
    { label: 'Called',              value: '$8.4M', sub: '84%', tip: 'Capital actually wired so far. Remainder ($1.6M) called over Q3 2026.' },
    { label: 'Distributions (DPI)', value: '$3.1M', sub: '0.37×', tip: 'Distributions to Paid-In. Cash returned ÷ cash contributed. 0.37× = $0.37 back per $1 in.' },
    { label: 'NAV (RVPI)',          value: '$8.4M', sub: '1.00×', tip: 'Residual Value to Paid-In. Current fund value ÷ cash contributed. Still in the fund (unrealized).' },
    { label: 'Total value (TVPI)',  value: '$11.5M', sub: '1.37×', good: true, tip: 'Total Value to Paid-In = DPI + RVPI. Realized + unrealized return multiple.' },
    { label: 'Net IRR',             value: '14.8%',  good: true, tip: 'Internal rate of return — annualized return accounting for the timing of every cashflow, net of fees.' },
  ];
  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="row" style={{ justifyContent:'space-between', alignItems:'flex-start', gap: 16 }}>
        <div>
          <h3 className="serif" style={{ margin: 0, fontSize: 18 }}>Pine Ridge Opportunities II — LP</h3>
          <div className="text-3" style={{ fontSize: 12 }}>JPM Private · Marchetti Holding LLC · 2019 vintage · Buyout</div>
        </div>
        <span className="tag pos">Active · in distribution</span>
      </div>

      <div className="grid-3 mt-16" style={{ gap: 8 }}>
        {stats.map(s => (
          <div key={s.label} title={s.tip} style={{ borderTop:'1px dashed var(--rule-2)', paddingTop: 8, cursor: s.tip ? 'help' : 'default' }}>
            <div className="label">{s.label}</div>
            <div className="num" style={{ fontSize: 22, color: s.good ? 'var(--pos)' : 'var(--ink)' }}>{s.value}</div>
            {s.sub && <div className="text-3" style={{ fontSize: 11, color: s.good ? 'var(--pos)' : 'var(--ink-3)' }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <hr className="divider dashed" style={{ margin: '24px 0' }}/>
      <h4 className="serif" style={{ margin: 0, fontSize: 15 }}>J-curve · cumulative cashflows</h4>
      <div className="text-3" style={{ fontSize: 12 }}>
        Cumulative dollars in vs. out since inception. Quarter labels along the x-axis.
      </div>
      <div className="mt-16">
        <Charts.JCurve data={ALT_JCURVE} height={200}/>
      </div>
      <div className="row gap-16 mt-12" style={{ flexWrap:'wrap', fontSize: 11.5, color:'var(--ink-3)' }}>
        <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:14, height:2, background:'var(--ink)' }}/> Total value · NAV + distributions (upside)</span>
        <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:14, height:0, borderTop:'1.4px dashed var(--neg)' }}/> Capital called · cumulative, plotted negative</span>
      </div>

      <hr className="divider dashed" style={{ margin: '24px 0' }}/>
      <h4 className="serif" style={{ margin: 0, fontSize: 15 }}>Capital call schedule (projected)</h4>
      <div className="stack stack-2 mt-12" style={{ fontSize: 13 }}>
        {[['Q3 2026','$1.6M','Final call — operating'],['Q1 2027','$0','Distribution expected'],['Q4 2027','$0','Distribution expected — exit']].map(([d,a,n]) => (
          <div key={d} className="row" style={{ justifyContent:'space-between', borderBottom:'1px dashed var(--rule-2)', paddingBottom: 8 }}>
            <span className="mono" style={{ fontSize: 12, width: 90 }}>{d}</span>
            <span className="num" style={{ width: 60 }}>{a}</span>
            <span className="text-3" style={{ flex: 1, textAlign:'right' }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pacing plan — the 18-month commitment schedule with timeline visual.
function AltsPacingTab({ clientView = false }) {
  const plan = [
    { q:'Q3 2026', commit:5000000, deal:'Pine Ridge IV',           strategy:'Buyout',     pace:'On track' },
    { q:'Q4 2026', commit:2500000, deal:'Atlas Direct Lending VII',strategy:'Credit',     pace:'On track' },
    { q:'Q1 2027', commit:5000000, deal:'Northwind Climate Infra', strategy:'Real Assets',pace:'Discussion' },
    { q:'Q2 2027', commit:2500000, deal:'Helios Secondaries 2026', strategy:'Secondaries',pace:'Discussion' },
  ];
  const totalCommit = plan.reduce((a, p) => a + p.commit, 0);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="row" style={{ justifyContent:'space-between', alignItems:'flex-start', gap: 16 }}>
        <div>
          <h3 className="serif" style={{ margin: 0, fontSize: 18 }}>Capital deployment plan · 18 months</h3>
          <div className="text-3" style={{ fontSize: 12 }}>
            {clientView
              ? 'Planned deployment toward your ~13% alternatives target and broader vintage diversification. New commitments only when you choose to subscribe.'
              : 'Bring the alts sleeve from 12.2% → 13.0% IPS target while diversifying away from a single Buyout vintage.'}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div className="label">Total committed</div>
          <div className="num" style={{ fontSize: 24 }}>{fmt.money(totalCommit, { compact: true })}</div>
        </div>
      </div>

      <div className="row gap-16 mt-12" style={{ flexWrap:'wrap', fontSize: 11.5, color:'var(--ink-3)' }}>
        <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:10, height:10, borderRadius:'50%', background:'var(--pos)' }}/> On track · committed</span>
        <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:10, height:10, borderRadius:'50%', background:'var(--warn)' }}/> Discussion · not yet committed</span>
      </div>

      {/* timeline bar */}
      <div className="mt-16" style={{ position:'relative', height: 64 }}>
        <div style={{ position:'absolute', top: 26, left: 0, right: 0, height: 2, background: 'var(--rule)' }}/>
        {plan.map((p, i) => (
          <div key={p.q} style={{ position:'absolute', left: ((i + 0.5) / plan.length * 100) + '%', transform:'translateX(-50%)', textAlign:'center' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.pace === 'On track' ? 'var(--pos)' : 'var(--warn)', margin: '20px auto 0', border: '2px solid var(--surface)', boxShadow:'0 0 0 1px var(--rule-2)' }}/>
            <div className="mono" style={{ fontSize: 11, marginTop: 6 }}>{p.q}</div>
            <div className="num" style={{ fontSize: 11 }}>{fmt.money(p.commit, { compact: true })}</div>
          </div>
        ))}
      </div>

      <hr className="divider dashed" style={{ margin: '8px 0 16px' }}/>

      <div className="stack stack-3">
        {plan.map(p => (
          <div key={p.q} className="row" style={{ justifyContent:'space-between', alignItems:'center', borderBottom:'1px dashed var(--rule-2)', paddingBottom: 12, gap: 12, flexWrap:'wrap' }}>
            <span className="mono" style={{ fontSize: 13, width: 80 }}>{p.q}</span>
            <span className="num" style={{ width: 80 }}>{fmt.money(p.commit, { compact: true })}</span>
            <span style={{ flex: 1, fontWeight: 500, minWidth: 160 }}>{p.deal}</span>
            <span className="tag">{p.strategy}</span>
            <span className={`tag ${p.pace==='On track' ? 'pos' : 'warn'}`}>{p.pace}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cashflow plan — projects capital calls and distributions for next 12 quarters,
// then maps the unfunded commitment onto a duration-matched Treasury ladder.
function AltsCashflowTab({ clientView = false }) {
  const totalCommitted = 25000000;       // $10M Pine Ridge II + $15M pacing plan
  const totalCalled    = 8400000;
  const totalUnfunded  = totalCommitted - totalCalled;

  const ladderTotal    = ALT_UNFUNDED_LADDER.reduce((a,r)=>a+r.amount, 0);
  const weightedYield  = ALT_UNFUNDED_LADDER.reduce((a,r)=>a+r.amount*r.yield, 0) / ladderTotal;
  const ladderIncome   = ladderTotal * weightedYield / 100;
  const mmfBlendedRate = 4.50; // assumed avg MMF over horizon (Fed cut path)
  const mmfIncome      = ladderTotal * mmfBlendedRate / 100;
  const incomeLift     = ladderIncome - mmfIncome;

  return (
    <div>
      <div className="kpis">
        <div className="kpi" title="Sum of all alt-fund commitments — both wired and still to come." style={{ cursor:'help' }}>
          <span className="label">Total committed</span>
          <span className="v lg">{fmt.money(totalCommitted, {compact:true})}</span>
          <span className="text-3" style={{ fontSize: 12 }}>existing $10M + pacing $15M</span>
        </div>
        <div className="kpi" title="Capital actually wired to GPs to date." style={{ cursor:'help' }}>
          <span className="label">Already called</span>
          <span className="v lg">{fmt.money(totalCalled, {compact:true})}</span>
        </div>
        <div className="kpi" title="Committed but not yet called — the household has promised to wire this when GPs request it. Doesn't have to sit in overnight cash." style={{ cursor:'help' }}>
          <span className="label">Unfunded commitment</span>
          <span className="v lg">{fmt.money(totalUnfunded, {compact:true})}</span>
          <span className="text-3" style={{ fontSize: 12 }}>drawn 2026–2030</span>
        </div>
      </div>
      <div className="text-3 mt-12" style={{ fontSize: 12 }}>
        {clientView
          ? 'Capital calls, distributions, and how unfunded commitments can sit in short-dated high-quality instruments. Full household cashflows live under Portfolio → Cashflow.'
          : 'This tab focuses on the alts treasury workflow — call/distribution rhythm and the unfunded commitment ladder. For full household income vs. outflows across all sources, see Household → Cashflow.'}
      </div>

      <div className="section">
        <h2 className="serif">Capital calls vs. distributions · next 12 quarters</h2>
        <div className="sub">Drives how much liquidity is needed when. Bars below the line are wires out; bars above are cash coming in.</div>
        <div className="card mt-12" style={{ padding: 16 }}>
          <Charts.CashflowBars data={ALT_CASHFLOW} height={220}/>
          <div className="row gap-16 mt-12" style={{ flexWrap:'wrap', fontSize: 11.5, color:'var(--ink-3)' }}>
            <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:14, height:10, background:'var(--neg)', opacity:0.85 }}/> Capital calls (cash out)</span>
            <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:14, height:10, background:'var(--pos)', opacity:0.85 }}/> Distributions (cash in)</span>
          </div>
        </div>
        <div className="table-wrap mt-16">
          <table className="tbl">
            <thead>
              <tr>
                <th title="Quarter the cashflow occurs.">Quarter</th>
                <th className="num" title="Capital wired to GPs in this quarter (negative = out).">Calls</th>
                <th className="num" title="Cash returned from GPs in this quarter.">Distributions</th>
                <th className="num" title="Calls + distributions for the quarter.">Net</th>
                <th title="Which funds drive this quarter's flow.">Drivers</th>
              </tr>
            </thead>
            <tbody>
              {ALT_CASHFLOW.map(c => {
                const net = c.calls + c.dist;
                return (
                  <tr key={c.q}>
                    <td className="mono" style={{ fontSize: 12 }}>{c.q}</td>
                    <td className="num" style={{ color: c.calls < 0 ? 'var(--neg)' : 'var(--ink-3)' }}>{c.calls ? fmt.money(c.calls, {compact:true}) : '—'}</td>
                    <td className="num" style={{ color: c.dist > 0 ? 'var(--pos)' : 'var(--ink-3)' }}>{c.dist ? '+' + fmt.money(c.dist, {compact:true}) : '—'}</td>
                    <td className="num" style={{ fontWeight: 600, color: net < 0 ? 'var(--neg)' : net > 0 ? 'var(--pos)' : 'var(--ink-3)' }}>{net ? (net > 0 ? '+' : '') + fmt.money(net, {compact:true}) : '—'}</td>
                    <td className="text-3" style={{ fontSize: 12 }}>{c.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section grid-3-2">
        <div>
          <h2 className="serif">Unfunded commitment ladder</h2>
          <div className="sub">
            {clientView
              ? 'Reserve unfunded amounts in short maturities ahead of expected capital calls — plan this together with your advisor.'
              : 'Earmark each tranche to instruments maturing near the expected call. Locks in yield on the medium-term sleeve while staying liquid for the imminent calls.'}
          </div>
          <div className="card mt-12" style={{ padding: 0, overflow:'hidden' }}>
            {/* stacked bar showing tranche split */}
            <div className="row" style={{ height: 14, background:'var(--rule)' }}>
              {ALT_UNFUNDED_LADDER.map((r, i) => (
                <div key={r.bucket} title={r.bucket + ' · ' + fmt.money(r.amount, {compact:true})}
                  style={{
                    width: ((r.amount / ladderTotal) * 100) + '%',
                    background: ['var(--ink)', 'var(--ink-2)', 'var(--ink-3)', 'var(--ink-4)'][i],
                    borderRight: i < ALT_UNFUNDED_LADDER.length - 1 ? '1px solid var(--surface)' : 'none',
                  }}/>
              ))}
            </div>
            <table className="tbl" style={{ marginTop: 0 }}>
              <thead>
                <tr>
                  <th title="Time to expected use of the cash.">Bucket</th>
                  <th className="num" title="Amount earmarked to this maturity bucket.">Amount</th>
                  <th title="Indicative instrument the cash should sit in.">Instrument</th>
                  <th className="num" title="Indicative yield at current curve.">Yield</th>
                  <th title="Which calls this tranche covers.">Covers</th>
                </tr>
              </thead>
              <tbody>
                {ALT_UNFUNDED_LADDER.map((r, i) => (
                  <tr key={r.bucket}>
                    <td><span className="dot" style={{ background: ['var(--ink)', 'var(--ink-2)', 'var(--ink-3)', 'var(--ink-4)'][i] }}/> {r.bucket}</td>
                    <td className="num">{fmt.money(r.amount, {compact:true})}</td>
                    <td className="text-3" style={{ fontSize: 12 }}>{r.instrument}</td>
                    <td className="num">{r.yield.toFixed(2)}%</td>
                    <td className="text-3" style={{ fontSize: 11.5 }}>{r.covers}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 600 }}>
                  <td>Total / blended</td>
                  <td className="num">{fmt.money(ladderTotal, {compact:true})}</td>
                  <td className="text-3" style={{ fontSize: 12 }}>weighted by amount</td>
                  <td className="num">{weightedYield.toFixed(2)}%</td>
                  <td className="text-3" style={{ fontSize: 11.5 }}>full unfunded sleeve</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="stack stack-3" style={{ gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="label">Ladder vs all-MMF baseline</div>
            <div className="num" style={{ fontSize: 28, color:'var(--pos)', marginTop: 4 }}>+{fmt.money(incomeLift, {compact:true})}/yr</div>
            <div className="text-3" style={{ fontSize: 12, marginTop: 4 }}>
              Ladder earns ~{weightedYield.toFixed(2)}% × {fmt.money(ladderTotal, {compact:true})} = {fmt.money(ladderIncome, {compact:true})}/yr.
              Baseline ({mmfBlendedRate.toFixed(1)}% projected MMF avg over the call horizon) earns {fmt.money(mmfIncome, {compact:true})}/yr.
            </div>
            <hr className="divider dashed" style={{ margin:'14px 0' }}/>
            <div className="text-3" style={{ fontSize: 11.5 }}>
              Today's MMF (5.18%) earns slightly more in the short run; the ladder hedges the Fed-cut path and locks in income across the entire 36-month draw window.
            </div>
          </div>

          <div className="margin-note" style={{ fontSize: 13 }}>
            <div className="label" style={{ color:'var(--accent)' }}>Why this matters</div>
            <div style={{ marginTop: 4 }}>
              {clientView
                ? 'Unfunded commitments rarely need to sit entirely in overnight cash. GPs usually give notice before a capital call, so short-dated, liquid holdings can be matched to expected draw dates.'
                : 'An LP with $16.6M of unfunded commitments does not need $16.6M sitting in overnight cash. The GP gives ~10 business days notice for calls — long enough to mature short-dated paper. Matching maturity to expected use is standard institutional treasury practice.'}
            </div>
          </div>

          {clientView ? (
            <div className="margin-note" style={{ fontSize: 13 }}>
              <div className="label" style={{ color:'var(--ink-3)' }}>Timing note</div>
              <div style={{ marginTop: 4 }}>
                Calls and distributions can shift by a quarter or two. Exit amounts depend on realizations and may vary.
              </div>
            </div>
          ) : (
            <div className="margin-note" style={{ fontSize: 13 }}>
              <div className="label" style={{ color:'var(--ink-3)' }}>Forecast caveat</div>
              <div style={{ marginTop: 4 }}>
                Calls follow industry-typical drawdown patterns (timing variance ±1–2 quarters). Distributions are GP estimates and depend on actual exit events; expect material variance.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STRUCTURED_URL_SUBS_WM = ['new', 'templates', 'active', 'history', 'book', 'calendar'];
const STRUCTURED_URL_SUBS_CLIENT = ['overview', 'rfq', 'book', 'calendar'];

/** True when the route is the global desk or any household embedded structured surface. */
function structuredRouteMatch(pathRaw) {
  const p = String(pathRaw || '').replace(/^\/+/, '').replace(/\/+$/, '');
  if (!p) return false;
  if (p === 'structured') return true;
  return /(^|\/)clients\/[^/]+\/structured$/i.test(p);
}

function parseStructuredTabFromHash(clientView) {
  const norm = slateRouteNorm();
  const pathOnly = norm.split('?')[0].replace(/^\/+/, '').replace(/\/+$/, '');
  if (!structuredRouteMatch(pathOnly)) return clientView ? 'overview' : 'new';
  const allowed = clientView ? STRUCTURED_URL_SUBS_CLIENT : STRUCTURED_URL_SUBS_WM;
  const qi = norm.indexOf('?');
  if (qi < 0) return clientView ? 'overview' : 'new';
  const sub = new URLSearchParams(norm.slice(qi + 1)).get('sub');
  if (!sub) return clientView ? 'overview' : 'new';
  if (!clientView && sub === 'rfq') return 'active';
  if (!clientView && sub === 'overview') return 'new';
  if (sub && allowed.includes(sub)) return sub;
  return clientView ? 'overview' : 'new';
}

/** @param {string} tab @param {boolean} clientView */
function syncStructuredTabToHash(tab, clientView) {
  const norm = slateRouteNorm();
  const pathOnly = norm.split('?')[0].replace(/^\/+/, '').replace(/\/+$/, '');
  if (!structuredRouteMatch(pathOnly)) return;
  const allowed = clientView ? STRUCTURED_URL_SUBS_CLIENT : STRUCTURED_URL_SUBS_WM;
  const fallback = clientView ? 'overview' : 'new';
  const safe = tab && allowed.includes(tab) ? tab : fallback;
  const defaultPathTab = clientView ? 'overview' : 'new';
  const qi = norm.indexOf('?');
  const params = qi >= 0 ? new URLSearchParams(norm.slice(qi + 1)) : new URLSearchParams();
  if (safe === defaultPathTab) params.delete('sub');
  else params.set('sub', safe);
  const qStr = params.toString();
  const next = qStr ? `${pathOnly}?${qStr}` : pathOnly;
  const cur = slateRouteNorm().replace(/^\/+/, '').replace(/\/+$/, '');
  const nextNorm = next.replace(/^\/+/, '').replace(/\/+$/, '');
  if (cur !== nextNorm) window.SlateRoute.write(next);
}

// ============ Structured Products ============
/** @param {{ navigate?: Function, clientView?: boolean }} props */
function StructuredScreen({ clientView = false }) {
  const returnedCt = SP_QUOTES.filter(q => !q.pending).length;
  const quoteTotal = SP_QUOTES.length;
  const historyCt = Array.isArray(SP_HISTORY) ? SP_HISTORY.length : 0;
  const activeRfqsCt = 1;
  const [tab, setTabState] = React.useState(() => parseStructuredTabFromHash(clientView));
  const setTab = React.useCallback((t) => {
    setTabState(t);
    syncStructuredTabToHash(t, clientView);
  }, [clientView]);
  React.useEffect(() => {
    let raf = 0;
    const onNav = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        setTabState(parseStructuredTabFromHash(clientView));
      });
    };
    window.addEventListener('hashchange', onNav);
    window.addEventListener('slate-route', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('slate-route', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, [clientView]);
  return (
    <div className={`page${clientView ? ' structured-screen--client' : ''} sp-flow-page`}>
      <div className="page-header">
        <div>
          {!clientView ? (
            <div className="eyebrow">Multi-issuer RFQ · live</div>
          ) : null}
          <h1 className="serif">Structured Products</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 720 }}>
            {clientView
              ? 'Your structured notes, key dates, and any new income ideas your advisor is sizing with you — with comparable quotes in one place.'
              : 'Slate displays quotes from multiple issuers in parallel, normalizes terms for an apples-to-apples comparison and tracks fill quantity.'}
          </p>
        </div>
        <span className={clientView ? 'tag accent' : 'tag warn'}>
          {clientView
            ? `Quotes · ${returnedCt} of ${quoteTotal} back`
            : `Live RFQ · ${returnedCt} of ${quoteTotal} returned`}
        </span>
      </div>

      <div className="tabs">
        {clientView ? (
          <>
            <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button>
            <button type="button" className={tab === 'rfq' ? 'active' : ''} onClick={() => setTab('rfq')}>Quote comparison</button>
            <button type="button" className={tab === 'book' ? 'active' : ''} onClick={() => setTab('book')}>Your notes</button>
            <button type="button" className={tab === 'calendar' ? 'active' : ''} onClick={() => setTab('calendar')}>Calendar</button>
          </>
        ) : (
          <>
            <button type="button" className={tab === 'new' ? 'active' : ''} onClick={() => setTab('new')}>New RFQ</button>
            <button type="button" className={tab === 'templates' ? 'active' : ''} onClick={() => setTab('templates')}>Templates</button>
            <button type="button" className={tab === 'active' ? 'active' : ''} onClick={() => setTab('active')}>Active RFQs ({activeRfqsCt})</button>
            <button type="button" className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>History ({historyCt})</button>
            <button type="button" className={tab === 'book' ? 'active' : ''} onClick={() => setTab('book')}>Book ({SP_BOOK.length})</button>
            <button type="button" className={tab === 'calendar' ? 'active' : ''} onClick={() => setTab('calendar')}>Calendar</button>
          </>
        )}
      </div>

      {clientView ? (
        <>
          {tab === 'overview' && <StructuredOverviewTab setTab={setTab} clientView={clientView} />}
          {tab === 'rfq' && <RfqTab clientView={clientView} />}
          {tab === 'book' && <BookTab clientView={clientView} />}
          {tab === 'calendar' && <CalendarTab clientView={clientView} />}
        </>
      ) : (
        <>
          {tab === 'new' && <NewRfqTab setTab={setTab} />}
          {tab === 'templates' && <TemplatesTab setTab={setTab} />}
          {tab === 'active' && <RfqTab clientView={false} />}
          {tab === 'history' && <HistoryTab />}
          {tab === 'book' && <BookTab clientView={false} />}
          {tab === 'calendar' && <CalendarTab clientView={false} />}
        </>
      )}
    </div>
  );
}

const SP_NEW_RFQ_DESKS = ['JPM Markets', 'Morgan Stanley', 'Goldman Sachs', 'BNP Paribas', 'SocGen', 'UBS', 'Barclays', 'Citi'];

/** Phase 1–2 new RFQ (WM). */
function NewRfqTab({ setTab }) {
  const [phase, setPhase] = React.useState(1);
  const [productType, setProductType] = React.useState('autocallable');
  const [tickers, setTickers] = React.useState(['AAPL', 'MSFT', 'NVDA', 'GOOGL']);
  const [tickerInput, setTickerInput] = React.useState('');
  const [notionalStr, setNotionalStr] = React.useState('3,000,000');
  const [currency, setCurrency] = React.useState('USD');
  const [tenor, setTenor] = React.useState('2Y');
  const [solveFor, setSolveFor] = React.useState('coupon');
  const [strike, setStrike] = React.useState(100);
  const [autocallBar, setAutocallBar] = React.useState(100);
  const [couponBar, setCouponBar] = React.useState(65);
  const [capitalBar, setCapitalBar] = React.useState(55);
  const [memoryOn, setMemoryOn] = React.useState(false);
  const [obsFreq, setObsFreq] = React.useState('Quarterly');
  const [selectedDesks, setSelectedDesks] = React.useState(() => new Set(SP_NEW_RFQ_DESKS.slice(0, 5)));
  const [deadline, setDeadline] = React.useState('1h');
  const [deskNotes, setDeskNotes] = React.useState('');

  const addTicker = () => {
    const t = tickerInput.trim().toUpperCase().replace(/[^A-Z0-9.-]/g, '');
    if (!t || tickers.includes(t)) return;
    setTickers([...tickers, t]);
    setTickerInput('');
  };
  const removeTicker = t => setTickers(tickers.filter(x => x !== t));
  const toggleDesk = d => {
    const next = new Set(selectedDesks);
    if (next.has(d)) next.delete(d);
    else next.add(d);
    setSelectedDesks(next);
  };

  const slider = (label, v, setV) => (
    <div className="sp-rfq-slider-row">
      <label className="sp-rfq-field-label">{label}</label>
      <input type="range" min={40} max={100} value={v} onChange={e => setV(Number(e.target.value))} className="sp-rfq-range" />
      <span className="sp-rfq-slider-val mono">{v}%</span>
    </div>
  );

  return (
    <div className="sp-new-rfq">
      {phase === 1 ? (
        <div className="card sp-rfq-phase-card">
          <div className="sp-phase-kicker">Phase 1</div>
          <h2 className="serif sp-phase-title">Configure</h2>
          <div className="sp-rfq-two-col">
            <div className="sp-rfq-col">
              <div className="sp-rfq-field">
                <span className="sp-rfq-field-label">Type</span>
                <div className="sp-rfq-radio-stack">
                  {[
                    ['autocallable', 'Autocallable'],
                    ['reverse', 'Reverse Convertible'],
                    ['cpn', 'Capital Protected Note'],
                    ['buffer', 'Buffer Note'],
                  ].map(([k, lab]) => (
                    <label key={k} className="sp-rfq-radio">
                      <input type="radio" name="ptype" checked={productType === k} onChange={() => setProductType(k)} />
                      <span>{lab}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="sp-rfq-field">
                <span className="sp-rfq-field-label">Underlying</span>
                <div className="sp-rfq-chips">
                  {tickers.map(t => (
                    <span key={t} className="sp-chip">
                      {t}
                      <button type="button" className="sp-chip-x" onClick={() => removeTicker(t)} aria-label={`Remove ${t}`}>×</button>
                    </span>
                  ))}
                  <span className="sp-chip-input-wrap">
                    <input className="sp-chip-input" placeholder="+ add ticker" value={tickerInput} onChange={e => setTickerInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTicker())} />
                  </span>
                </div>
              </div>
              <div className="sp-rfq-field sp-rfq-inline">
                <div style={{ flex: 1 }}>
                  <span className="sp-rfq-field-label">Notional</span>
                  <input className="input sp-rfq-notional-input" value={notionalStr} onChange={e => setNotionalStr(e.target.value)} />
                </div>
                <div style={{ width: 100 }}>
                  <span className="sp-rfq-field-label">Currency</span>
                  <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </div>
              </div>
              <div className="sp-rfq-field">
                <span className="sp-rfq-field-label">Tenor</span>
                <div className="sp-pill-row">
                  {['1Y', '18M', '2Y', '3Y', '5Y'].map(t => (
                    <button key={t} type="button" className={`sp-pill ${tenor === t ? 'active' : ''}`} onClick={() => setTenor(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="sp-rfq-field">
                <span className="sp-rfq-field-label">Solve for</span>
                <div className="sp-rfq-radio-stack">
                  {[
                    ['coupon', 'Max coupon'],
                    ['capital', 'Best capital barrier'],
                    ['autocall', 'Lowest autocall barrier'],
                  ].map(([k, lab]) => (
                    <label key={k} className="sp-rfq-radio">
                      <input type="radio" name="solve" checked={solveFor === k} onChange={() => setSolveFor(k)} />
                      <span>{lab}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="sp-rfq-col sp-rfq-col-params">
              {slider('Strike', strike, setStrike)}
              {slider('Autocall barrier', autocallBar, setAutocallBar)}
              {slider('Coupon barrier', couponBar, setCouponBar)}
              {slider('Capital barrier', capitalBar, setCapitalBar)}
              <div className="sp-rfq-field sp-rfq-toggle-row">
                <span className="sp-rfq-field-label">Memory feature</span>
                <button type="button" className={`sp-toggle ${memoryOn ? 'on' : ''}`} onClick={() => setMemoryOn(!memoryOn)} aria-pressed={memoryOn}>
                  <span className="sp-toggle-knob" />
                </button>
              </div>
              <div className="sp-rfq-field">
                <span className="sp-rfq-field-label">Observation frequency</span>
                <select className="input" value={obsFreq} onChange={e => setObsFreq(e.target.value)}>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Semiannual</option>
                </select>
              </div>
              <div className="sp-rfq-indicative">
                <span className="sp-rfq-indicative-label">Indicative coupon (Bloomberg, midpoint)</span>
                <strong className="sp-rfq-indicative-val">8.05% p.a.</strong>
              </div>
            </div>
          </div>
          <div className="sp-rfq-phase-actions">
            <button type="button" className="btn primary" onClick={() => setPhase(2)}>
              Continue to send desks <span dangerouslySetInnerHTML={{ __html: Icons.arrow }} />
            </button>
          </div>
        </div>
      ) : (
        <div className="card sp-rfq-phase-card">
          <div className="sp-phase-kicker">Phase 2</div>
          <h2 className="serif sp-phase-title">Send to desks</h2>
          <div className="sp-rfq-field">
            <span className="sp-rfq-field-label">Counterparties ({selectedDesks.size} selected)</span>
            <div className="sp-desk-pills">
              {SP_NEW_RFQ_DESKS.map(d => (
                <button key={d} type="button" className={`sp-desk-pill ${selectedDesks.has(d) ? 'selected' : ''}`} onClick={() => toggleDesk(d)}>{d}</button>
              ))}
            </div>
          </div>
          <div className="sp-rfq-field">
            <span className="sp-rfq-field-label">Deadline</span>
            <div className="sp-rfq-radio-stack horizontal">
              {[
                ['30m', '30 minutes'],
                ['1h', '1 hour'],
                ['eod', 'End of day'],
              ].map(([k, lab]) => (
                <label key={k} className="sp-rfq-radio">
                  <input type="radio" name="deadline" checked={deadline === k} onChange={() => setDeadline(k)} />
                  <span>{lab}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="sp-rfq-field">
            <span className="sp-rfq-field-label">Notes for desks (optional)</span>
            <textarea className="input sp-rfq-textarea" rows={4} placeholder="e.g. Prefer European observation; client is rate-aware." value={deskNotes} onChange={e => setDeskNotes(e.target.value)} />
          </div>
          <hr className="divider" style={{ margin: '20px 0' }} />
          <div className="sp-rfq-send-footer">
            <button type="button" className="btn text">Save draft</button>
            <button type="button" className="btn ghost">Preview term sheet</button>
            <button type="button" className="btn primary" onClick={() => setTab('active')}>
              Send new RFQ <span dangerouslySetInnerHTML={{ __html: Icons.arrow }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  const rows = Array.isArray(SP_HISTORY) ? SP_HISTORY : [];
  return (
    <div className="sp-history">
      {rows.map(h => (
        <div key={h.id} className="card sp-active-rfq-card" style={{ marginBottom: 20 }}>
          <div className="sp-active-rfq-head">
            <div>
              <div className="serif sp-active-rfq-title">{h.id} {h.type}</div>
              <div className="text-3 sp-active-rfq-meta">{h.meta}</div>
            </div>
            <span className="sp-badge-muted">{h.badge}</span>
          </div>
          <div className="table-wrap">
            <table className="tbl sp-desk-tbl">
              <thead>
                <tr>
                  <th>Desk</th>
                  <th className="num">Coupon</th>
                  <th className="num">Cap barrier</th>
                  <th className="num">Issue price</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {h.quotes.map((q, i) => (
                  <tr key={i} className={q.stale ? 'sp-row-stale' : ''}>
                    <td><b>{q.desk}</b></td>
                    <td className="num">{q.stale ? <span className="sp-strike">{q.coupon.toFixed(2)}%</span> : `${q.coupon.toFixed(2)}%`}</td>
                    <td className="num">{q.capBarrierPct}%</td>
                    <td className="num">{q.stale ? <span className="sp-strike">{q.issuePrice.toFixed(2)}</span> : q.issuePrice.toFixed(2)}</td>
                    <td className="mono text-3">{q.expires}</td>
                    <td><span className="sp-status sp-status-stale">Stale</span></td>
                    <td className="text-3">⋯</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

/** WM active RFQ — desk comparison, payoff + email to client. */
function ActiveRfqTab() {
  const sortedQuotes = SP_QUOTES.slice().sort((a, b) => (b.coupon || -1) - (a.coupon || -1));
  const live = sortedQuotes.filter(q => !q.pending && q.coupon != null);
  const bestCouponRow = live.length ? live.reduce((a, b) => ((b.coupon || 0) > (a.coupon || 0) ? b : a)) : null;
  const protCandidates = live.filter(q => q.capBarrierPct != null);
  const bestProtRow = protCandidates.length ? protCandidates.reduce((a, b) => (b.capBarrierPct < a.capBarrierPct ? b : a)) : null;
  const [payoffOpen, setPayoffOpen] = React.useState(false);
  const [emailOpen, setEmailOpen] = React.useState(false);

  const deskLabel = q => q.desk || q.issuer;

  return (
    <div className="sp-active-rfq">
      <div className="card sp-active-rfq-card">
        <div className="sp-active-rfq-head">
          <div style={{ minWidth: 0 }}>
            <div className="serif sp-active-rfq-title">{SP_RFQ.id} {SP_RFQ.type}</div>
            <div className="text-3 sp-active-rfq-meta">
              {SP_RFQ.currency} {fmt.money(SP_RFQ.notional, { compact: true })} · {SP_RFQ.tenorLabel || SP_RFQ.tenor} · {SP_RFQ.desksTotal} desks · {SP_RFQ.quotedCount} of {SP_RFQ.desksTotal} quoted · sent {SP_RFQ.sentAt}
            </div>
          </div>
          <div className="sp-deadline-pill">
            <span className="sp-deadline-dot" /> {SP_RFQ.deadlineLabel}
          </div>
        </div>
        <div className="table-wrap">
          <table className="tbl sp-desk-tbl rfq-tbl">
            <thead>
              <tr>
                <th>Desk</th>
                <th className="num">Coupon</th>
                <th className="num">Cap barrier</th>
                <th className="num">Issue price</th>
                <th>Expires</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedQuotes.map(q => {
                const isBest = q.rfqStatus === 'best' || q.best === 'coupon';
                const statusLabel = q.pending ? 'Pending' : q.rfqStatus === 'best' ? 'Best' : 'Quoted';
                return (
                  <tr key={deskLabel(q)} className={`${q.pending ? 'pending' : ''} ${isBest && !q.pending ? 'best' : ''}`}>
                    <td>
                      <b>{deskLabel(q)}</b>
                      {isBest && !q.pending ? <span className="winner-tag">★</span> : null}
                    </td>
                    <td className="num" style={{ fontWeight: isBest && !q.pending ? 600 : 400 }}>{q.coupon != null ? `${q.coupon.toFixed(2)}%` : '—'}</td>
                    <td className="num">{q.capBarrierPct != null ? `${q.capBarrierPct}%` : '—'}</td>
                    <td className="num">{q.issuePrice != null ? q.issuePrice.toFixed(2) : '—'}</td>
                    <td className={`mono text-3 ${q.expires && q.expires.includes('h') ? 'sp-expires-warn' : ''}`} style={{ fontSize: 12 }}>{q.pending ? '—' : q.expires}</td>
                    <td>
                      {q.pending ? (
                        <span className="sp-status sp-status-pending">● Pending</span>
                      ) : statusLabel === 'Best' ? (
                        <span className="sp-status sp-status-best">Best</span>
                      ) : (
                        <span className="sp-status sp-status-quoted">Quoted</span>
                      )}
                    </td>
                    <td className="text-3" style={{ cursor: 'default' }}>⋯</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="sp-active-rfq-footer">
          <span>
            Best by coupon: <strong>{bestCouponRow ? `${deskLabel(bestCouponRow)} ${bestCouponRow.coupon.toFixed(2)}%` : '—'}</strong>
          </span>
          <span>
            Best by protection: <strong>{bestProtRow && bestProtRow.capBarrierPct != null ? `${deskLabel(bestProtRow)} ${bestProtRow.capBarrierPct}% barrier` : '—'}</strong>
          </span>
        </div>
      </div>

      <div className="action-bar sp-active-actions">
        <button type="button" className="btn ghost" onClick={() => setPayoffOpen(true)}>Visualize payoff</button>
        <button type="button" className="btn primary" onClick={() => setEmailOpen(true)}>
          <span className="row gap-8" style={{ alignItems: 'center' }}><span dangerouslySetInnerHTML={{ __html: Icons.mail }} /> Email quotes</span>
        </button>
      </div>

      {payoffOpen ? (
        <div className="sp-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sp-payoff-title">
          <div className="sp-modal card">
            <div className="sp-modal-kicker">Payoff diagram</div>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <h2 id="sp-payoff-title" className="serif" style={{ margin: 0, fontSize: 22 }}>{SP_RFQ.type}</h2>
              <span className="mono text-3" style={{ fontSize: 11 }}>{SP_RFQ.id}</span>
            </div>
            <p className="text-3" style={{ fontSize: 12, marginTop: 6 }}>At maturity · {SP_RFQ.currency} {fmt.money(SP_RFQ.notional, { compact: true })} · {SP_RFQ.tenorLabel || SP_RFQ.tenor}</p>
            <div className="sp-payoff-compare">
              {live.slice(0, 2).map((q, i) => (
                <div key={deskLabel(q)} className="sp-payoff-pane">
                  <Charts.PayoffDiagram shape="phoenix" barrierPct={q.capBarrierPct || 60} coupon={q.coupon || 8} height={160} label={deskLabel(q)} />
                  <div className="text-3 mono" style={{ fontSize: 11, marginTop: 8 }}>{q.coupon != null ? `${q.coupon.toFixed(2)}% coupon` : ''} · {q.capBarrierPct != null ? `${q.capBarrierPct}% barrier` : ''}</div>
                </div>
              ))}
            </div>
            <p className="text-3" style={{ fontSize: 11, marginTop: 12, color: 'var(--ink-3)' }}>Indicative payoff at maturity. Assumes the structure is held to maturity (no autocall trigger).</p>
            <div className="sp-modal-actions">
              <button type="button" className="btn primary" onClick={() => setPayoffOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      {emailOpen ? (
        <div className="sp-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="sp-email-title">
          <div className="sp-modal card sp-email-modal">
            <h2 id="sp-email-title" className="serif" style={{ margin: '0 0 4px', fontSize: 22 }}>Email quote comparison</h2>
            <p className="text-3" style={{ fontSize: 12, marginBottom: 16 }}>Indicative pricing valid until quote expiry.</p>
            <div className="sp-rfq-field">
              <span className="sp-rfq-field-label">To</span>
              <input className="input" placeholder="Type name or email…" />
            </div>
            <div className="sp-rfq-field">
              <span className="sp-rfq-field-label">Subject</span>
              <input className="input" defaultValue="Indicative quotes · structured product comparison" />
            </div>
            <div className="sp-rfq-field">
              <span className="sp-rfq-field-label">Message</span>
              <textarea className="input sp-rfq-textarea" rows={5} defaultValue={'Please find attached a comparison of indicative pricing from multiple counterparty desks.\n\nIndicative — not an offer. Final terms subject to confirmation.'} />
            </div>
            <div className="sp-rfq-field">
              <span className="sp-rfq-field-label">Attach</span>
              <label className="sp-check-row"><input type="checkbox" defaultChecked /> Term sheet ({SP_RFQ.id}.pdf)</label>
              <label className="sp-check-row"><input type="checkbox" defaultChecked /> Quote comparison ({live.length} desks)</label>
            </div>
            <div className="sp-modal-actions sp-email-actions">
              <button type="button" className="btn text" onClick={() => setEmailOpen(false)}>Cancel</button>
              <button type="button" className="btn primary" style={{ opacity: 0.85 }} onClick={() => setEmailOpen(false)}>Send</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---- RFQ tab — client: trade ticket + payoff + comparison; WM uses ActiveRfqTab above ----
function RfqTab({ clientView = false }) {
  if (!clientView) {
    return <ActiveRfqTab />;
  }
  const sortedQuotes = SP_QUOTES.slice().sort((a, b) => (b.coupon || -1) - (a.coupon || -1));
  const live = sortedQuotes.filter(q => !q.pending && q.coupon != null);
  const minCoupon = live.length ? Math.min(...live.map(q => q.coupon)) : 0;
  const maxCoupon = live.length ? Math.max(...live.map(q => q.coupon)) : 1;
  const bestLive = live.length ? live.reduce((a, b) => (((b.coupon || 0) > (a.coupon || 0)) ? b : a)) : null;
  const payoffCoupon = bestLive && bestLive.coupon != null ? bestLive.coupon : 8.5;
  const payoffLabel = bestLive && bestLive.coupon != null ? `Top quote ${bestLive.coupon.toFixed(2)}%` : 'Top quote';
  const deskLabel = q => q.desk || q.issuer;

  return (
    <div>
      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="row" style={{ justifyContent:'space-between', alignItems:'flex-start', gap: 24 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="label">{`Opportunity · ${SP_RFQ.id}`}</div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginTop: 2, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{SP_RFQ.type}</div>
              <div className="text-3" style={{ fontSize: 13, marginTop: 8 }}>Underlier: <span className="mono">{SP_RFQ.underliersDisplay || SP_RFQ.underlier}</span></div>
            </div>
            <div title="Notional — headline trade size." style={{ textAlign:'right', flex: '0 0 auto', cursor:'help' }}>
              <div className="label">Notional</div>
              <div className="num" style={{ fontSize: 26 }}>{fmt.money(SP_RFQ.notional, {compact:true})}</div>
            </div>
          </div>
          <div className="grid-4 mt-16">
            <div title="Tenor" style={{ cursor:'help' }}><div className="label">Tenor</div><div className="num" style={{ fontSize: 14 }}>{SP_RFQ.tenorLabel || SP_RFQ.tenor}</div></div>
            <div title="Observation" style={{ cursor:'help' }}><div className="label">Observation</div><div className="num" style={{ fontSize: 14 }}>{SP_RFQ.observation}</div></div>
            <div title="Protection" style={{ cursor:'help' }}><div className="label">Protection</div><div className="num" style={{ fontSize: 14 }}>{SP_RFQ.protection}</div></div>
            <div title="When your advisor sent this structure for pricing." style={{ cursor:'help' }}><div className="label">Sent</div><div className="num" style={{ fontSize: 14 }}>{SP_RFQ.sentAt}</div></div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h4 className="serif" style={{ margin: 0, fontSize: 16 }}>Payoff · per annum</h4>
          <div className="text-3" style={{ fontSize: 12 }}>
            Autocallable on NDX — quarterly observation. Indicative shape for discussion with your advisor.
          </div>
          <div className="mt-12">
            <Charts.PayoffDiagram shape="phoenix" barrierPct={65} coupon={payoffCoupon} height={180} label={payoffLabel}/>
          </div>
          <div className="row gap-12 mt-12" style={{ flexWrap:'wrap', fontSize: 11.5, color:'var(--ink-3)' }}>
            <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:14, height:2, background:'var(--ink)' }}/> Payoff</span>
            <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:14, height:0, borderTop:'2px dashed var(--neg)' }}/> Barrier</span>
            <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:14, height:0, borderTop:'1px dashed var(--ink-4)' }}/> Spot 100%</span>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
          <h2 className="serif" style={{ whiteSpace: 'nowrap', margin: 0 }}>Quoted levels</h2>
          <span className="text-3" style={{ fontSize: 12 }}>Sorted by coupon · ★ marks the strongest quote</span>
        </div>
        <div className="sub">The bar for each row shows where that coupon sits between the lowest and highest quote you received for this same structure.</div>
        <div className="table-wrap mt-12">
          <table className="tbl rfq-tbl">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Rating</th>
                <th className="num">Coupon</th>
                <th>vs best</th>
                <th>Barrier</th>
                <th className="num">MTM Day-1</th>
                <th>Returned</th>
              </tr>
            </thead>
            <tbody>
              {sortedQuotes.map(q => {
                const range = maxCoupon - minCoupon || 1;
                const widthPct = q.coupon ? ((q.coupon - minCoupon) / range) * 100 : 0;
                const isBest = q.best === 'coupon';
                const winnerLabel = q.best === 'coupon' ? 'top coupon' : q.best === 'protection' ? 'stronger protection' : null;
                return (
                  <tr key={deskLabel(q)} className={`${q.pending ? 'pending' : ''} ${isBest ? 'best' : ''}`}>
                    <td>
                      <b>{deskLabel(q)}</b>
                      {winnerLabel && <span className="winner-tag">★ {winnerLabel}</span>}
                    </td>
                    <td className="text-3">{q.rating}</td>
                    <td className="num" style={{ fontWeight: isBest ? 600 : 400 }}>{q.coupon ? q.coupon.toFixed(2) + '%' : '—'}</td>
                    <td>
                      {q.coupon ? (
                        <div className={`sparkbar ${isBest ? 'win' : ''}`} style={{ width: 100 }}>
                          <div style={{ width: Math.max(6, widthPct) + '%' }}/>
                        </div>
                      ) : <span className="text-3">—</span>}
                    </td>
                    <td className="text-3" style={{ fontSize: 12 }}>{q.barrier}</td>
                    <td className="num">{q.mtmDay1 ? q.mtmDay1.toFixed(2) : '—'}</td>
                    <td className="mono" style={{ fontSize: 12, color: q.pending ? 'var(--warn)' : 'var(--ink-3)' }}>{q.returnedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="action-bar" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn primary">Message {HOUSEHOLD.rm || 'Christine Holloway'} <span dangerouslySetInnerHTML={{__html: Icons.arrow}}/></button>
      </div>
    </div>
  );
}

// ---- Book tab — existing notes with barrier proximity ----
function BookTab({ clientView = false }) {
  const totalMtm = SP_BOOK.reduce((a, n) => a + n.mtm, 0);
  const totalNotional = SP_BOOK.reduce((a, n) => a + n.notional, 0);
  const couponYtd = SP_BOOK.reduce((a, n) => a + n.couponCollected, 0);
  const aggPlPct = totalNotional > 0
    ? ((SP_BOOK.reduce((a, n) => a + (n.mtm - n.notional), 0)) / totalNotional) * 100
    : 0;
  const SHAPE_TAG = {
    buffer: 'BUFFER',
    booster: 'BOOSTER',
    reverse_convertible: 'REVERSE CONVERTIBLE',
  };

  if (!clientView) {
    return (
      <div className="sp-book-wm">
        <div className="kpis sp-book-kpis">
          <div className="kpi"><span className="label">Notes outstanding</span><span className="v lg">{SP_BOOK.length}</span></div>
          <div className="kpi"><span className="label">Total notional</span><span className="v lg">{fmt.money(totalNotional, { compact: true })}</span></div>
          <div className="kpi"><span className="label">Mark-to-market</span><span className="v lg">{fmt.money(totalMtm, { compact: true })}</span></div>
          <div className="kpi"><span className="label">Aggregate P/L</span><span className="v lg" style={{ color: aggPlPct >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{aggPlPct >= 0 ? '+' : ''}{aggPlPct.toFixed(1)}%</span></div>
          <div className="kpi"><span className="label">Coupons collected</span><span className="v lg" style={{ color: 'var(--pos)' }}>{fmt.money(couponYtd, { compact: true })}</span></div>
        </div>
        <div className="table-wrap mt-20">
          <table className="tbl sp-book-wm-tbl">
            <thead>
              <tr>
                <th>Note</th>
                <th>Client</th>
                <th>Issuer</th>
                <th>Underlier</th>
                <th className="num">Notional</th>
                <th className="num">MTM</th>
                <th className="num">P/L</th>
                <th>Next event</th>
                <th>Maturity</th>
              </tr>
            </thead>
            <tbody>
              {SP_BOOK.map(n => (
                <tr key={n.id}>
                  <td>
                    <div className="sp-book-note-cell">
                      <span className="sp-note-type-tag">{SHAPE_TAG[n.shape] || n.shape}</span>
                      <div className="serif" style={{ fontWeight: 600, fontSize: 14 }}>{n.name}</div>
                      {n.coupon != null ? <div className="text-3" style={{ fontSize: 11 }}>{n.coupon.toFixed(2)}% coupon</div> : null}
                    </div>
                  </td>
                  <td>{n.clientName || '—'}</td>
                  <td>{n.issuer}</td>
                  <td>{n.underlier}</td>
                  <td className="num">{fmt.money(n.notional, { compact: true })}</td>
                  <td className="num">{fmt.money(n.mtm, { compact: true })}</td>
                  <td className="num" style={{ color: n.pnlPct >= 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 600 }}>{n.pnlPct >= 0 ? '+' : ''}{n.pnlPct.toFixed(1)}%</td>
                  <td className="text-3" style={{ fontSize: 12 }}>{String(n.nextEvent).replace(' · ', ' ')}</td>
                  <td className="text-3" style={{ fontSize: 12 }}>{fmt.shortDateFull ? fmt.shortDateFull(n.maturity) : n.maturity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-3 sp-book-footnote" style={{ fontSize: 11, marginTop: 16, maxWidth: 720 }}>
          Held positions reconciled overnight from custodian feeds. Click a row for the full lifecycle, observations, and counterparty exposure.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-2" style={{ fontSize: 14, marginBottom: 20, maxWidth: 720 }}>
        Notes held for your household — coupons, barriers, and where each underlier sits relative to protection.
      </p>
      <div className="kpis">
        <div className="kpi" title="Number of structured notes the household currently holds." style={{ cursor:'help' }}><span className="label">Notes outstanding</span><span className="v lg">{SP_BOOK.length}</span></div>
        <div className="kpi" title="Sum of headline trade sizes across the book." style={{ cursor:'help' }}><span className="label">Notional</span><span className="v lg">{fmt.money(totalNotional, { compact: true })}</span></div>
        <div className="kpi" title="Mark-to-market — current value of the book if sold today on the secondary market." style={{ cursor:'help' }}><span className="label">Mark-to-market</span><span className="v lg">{fmt.money(totalMtm, { compact: true })}</span></div>
        <div className="kpi" title="Coupon income collected this calendar year across the book." style={{ cursor:'help' }}><span className="label">Coupon ytd</span><span className="v lg" style={{ color:'var(--pos)' }}>+{fmt.money(couponYtd, { compact: true })}</span></div>
      </div>
      <div className="grid-2 mt-24" style={{ gap: 20 }}>
        {SP_BOOK.map(n => <BookNoteCard key={n.id} n={n} clientView={clientView}/>)}
      </div>
    </div>
  );
}

function BookNoteCard({ n, clientView = false }) {
  // Render an underlier-vs-barrier line. Span 50% to 130% of initial.
  const minPct = 50, maxPct = 130;
  const span = maxPct - minPct;
  const barrierLeft = ((n.barrierPct - minPct) / span) * 100;
  const spotLeft    = ((n.spotPct    - minPct) / span) * 100;
  const distance = (n.spotPct - n.barrierPct).toFixed(1);
  const inDanger = n.spotPct - n.barrierPct < 10;
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="row" style={{ justifyContent:'space-between', alignItems:'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="eyebrow">{n.issuer} · {n.underlier}</div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 600, marginTop: 4, lineHeight: 1.2, textWrap:'balance' }}>{n.name}</div>
          <div className="text-3" style={{ fontSize: 12, marginTop: 4 }}>Issued {n.issued} · Maturity {n.maturity}</div>
        </div>
        <div title="Mark-to-market: current value vs. issue price. Positive = note is worth more than what was paid." style={{ flex: '0 0 auto', textAlign:'right', cursor:'help' }}>
          <div className="label">MTM</div>
          <div className="num" style={{ fontSize: 22, color: n.pnlPct >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{(n.pnlPct >= 0 ? '+' : '') + n.pnlPct.toFixed(1)}%</div>
          <div className="text-3" style={{ fontSize: 11 }}>{fmt.money(n.mtm, { compact: true })}</div>
        </div>
      </div>

      <div className="grid-4 mt-16" style={{ gap: 12 }}>
        <div title="Headline size of this trade at issue." style={{ cursor:'help' }}><div className="label">Notional</div><div className="num" style={{ fontSize: 14 }}>{fmt.money(n.notional, { compact: true })}</div></div>
        <div title="Annualized coupon rate. Some shapes (e.g. boosters) pay no coupon." style={{ cursor:'help' }}><div className="label">Coupon</div><div className="num" style={{ fontSize: 14 }}>{n.coupon ? n.coupon.toFixed(1) + '%' : '—'}</div></div>
        <div title="Total coupon paid since issue." style={{ cursor:'help' }}><div className="label">Collected</div><div className="num" style={{ fontSize: 14 }}>{n.couponCollected ? fmt.money(n.couponCollected, { compact: true }) : '—'}</div></div>
        <div title="Barrier level + type. Hard = locked in the moment it's breached. Soft = only matters at maturity." style={{ cursor:'help' }}><div className="label">Barrier</div><div className="num" style={{ fontSize: 14 }}>{n.barrierPct}% · {n.barrierType}</div></div>
      </div>

      <div className="mt-16">
        <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline', marginBottom: 6 }}>
          <span className="label">Underlier vs barrier</span>
          <span className="text-3" style={{ fontSize: 10.5 }}>scale 50% → 130% of initial spot</span>
        </div>
        <div style={{ position:'relative', height: 32 }}>
          <div style={{ position:'absolute', left: 0, right: 0, top: 13, height: 4, background: 'var(--rule)', borderRadius: 99 }}/>
          <div style={{ position:'absolute', left: barrierLeft + '%', top: 6, bottom: 6, width: 2, background: 'var(--neg)' }}/>
          <div style={{ position:'absolute', left: barrierLeft + '%', top: -2, fontSize: 9, color: 'var(--neg)', fontFamily: 'var(--font-mono)', transform: 'translateX(-50%)' }}>{n.barrierPct}%</div>
          <div style={{ position:'absolute', left: spotLeft + '%', top: 8, width: 14, height: 14, borderRadius: '50%', background: inDanger ? 'var(--neg)' : 'var(--pos)', border: '2px solid var(--surface)', boxShadow:'0 0 0 1px var(--rule-2)', transform: 'translateX(-50%)' }}/>
          <div style={{ position:'absolute', left: spotLeft + '%', bottom: -1, fontSize: 9, color: inDanger ? 'var(--neg)' : 'var(--pos)', fontFamily: 'var(--font-mono)', transform: 'translateX(-50%)' }}>{n.spotPct.toFixed(1)}%</div>
        </div>
        <div className="row gap-12 mt-8" style={{ flexWrap:'wrap', fontSize: 10.5, color:'var(--ink-3)' }}>
          <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:2, height:10, background:'var(--neg)' }}/> barrier</span>
          <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:9, height:9, borderRadius:'50%', background:'var(--pos)' }}/> spot · safe</span>
          <span className="row gap-8" style={{ alignItems:'center' }}><span style={{ width:9, height:9, borderRadius:'50%', background:'var(--neg)' }}/> spot · within 10pp of barrier</span>
        </div>
        <div className="text-3 mt-8" style={{ fontSize: 11.5 }}>{Number(distance) >= 0 ? `+${distance}pp above barrier` : `${distance}pp through barrier`}</div>
      </div>

      <hr className="divider dashed" style={{ margin: '16px 0 12px' }}/>
      <div className="row" style={{ justifyContent:'space-between', alignItems:'center' }}>
        <div className="text-3" style={{ fontSize: 12 }}>Next: {n.nextEvent}</div>
        {!clientView ? <button type="button" className="btn ghost sm">Open ticket</button> : null}
      </div>
    </div>
  );
}

// ---- Calendar tab — observations / autocalls / coupons / maturities ----
function CalendarTab({ clientView = false }) {
  const events = SP_CALENDAR.slice().sort((a, b) => a.date.localeCompare(b.date));
  const buckets = {};
  for (const e of events) {
    const month = e.date.slice(0, 7);
    (buckets[month] = buckets[month] || []).push(e);
  }
  const monthLabel = m => {
    const [y, mm] = m.split('-');
    return new Date(Number(y), Number(mm) - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };
  const KIND_TAG = {
    observation:  { tag: 'tag',        label: 'observation' },
    autocall_obs: { tag: 'tag accent', label: 'autocall obs' },
    coupon:       { tag: 'tag pos',    label: 'coupon' },
    maturity:     { tag: 'tag warn',   label: 'maturity' },
    trade_date:   { tag: 'tag accent', label: 'trade date' },
  };
  return (
    <div className="stack stack-3" style={{ gap: 20 }}>
      <div className="card" style={{ padding: 16 }}>
        <div className="text-3" style={{ fontSize: 12 }}>
          {clientView
            ? `${events.length} dates across your ${SP_BOOK.length} notes and the current opportunity.`
            : `${events.length} upcoming events across ${SP_BOOK.length} held notes + 1 active RFQ.`}
        </div>
        <div className="row gap-12 mt-12" style={{ flexWrap:'wrap' }}>
          <span className="tag">observation · scheduled level check</span>
          <span className="tag accent">autocall obs · may redeem early</span>
          <span className="tag pos">coupon · cash payment</span>
          <span className="tag warn">maturity · final settlement</span>
          <span className="tag accent">{clientView ? 'trade date · decision window' : 'trade date · RFQ execution window'}</span>
        </div>
      </div>
      {Object.keys(buckets).map(m => (
        <div key={m} className="card" style={{ padding: 24 }}>
          <h3 className="serif" style={{ margin: 0, fontSize: 16 }}>{monthLabel(m)}</h3>
          <div className="stack stack-2 mt-12">
            {buckets[m].map((e, i) => {
              const note = e.noteId ? SP_BOOK.find(b => b.id === e.noteId) : null;
              const kind = KIND_TAG[e.kind] || KIND_TAG.observation;
              return (
                <div key={i} className="row" style={{ alignItems:'center', gap: 12, borderBottom:'1px dashed var(--rule-2)', paddingBottom: 8, flexWrap:'wrap' }}>
                  <span className="mono" style={{ fontSize: 12, width: 100, color: 'var(--ink-3)' }}>{e.date}</span>
                  <span className={kind.tag} style={{ minWidth: 110, justifyContent: 'center' }}>{kind.label}</span>
                  <span style={{ flex: 1, minWidth: 220, fontSize: 13 }}>{e.label}</span>
                  {note && <span className="text-3" style={{ fontSize: 11.5 }}>{note.issuer} · {note.underlier}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Templates tab — quick-start cards (WM) ----
function TemplatesTab({ setTab }) {
  const barrierFromProtection = (p) => {
    const m = String(p || '').match(/\d+/);
    return m ? parseInt(m[0], 10) : 65;
  };
  const couponNum = (c) => {
    if (c == null || c === '—') return 0;
    const n = parseFloat(String(c).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) ? n : 8;
  };
  return (
    <div className="sp-templates">
      <p className="text-2" style={{ fontSize: 14, marginBottom: 20, maxWidth: 720 }}>
        Quick-start configurations for common structures. Pick a template, tweak parameters, and send the RFQ.
      </p>
      <div className="sp-template-grid">
        {SP_TEMPLATES.map(t => {
          const barrierPct = barrierFromProtection(t.protection);
          const coupon = couponNum(t.coupon);
          return (
            <div key={t.id} className="card sp-template-card">
              <div className="sp-template-card-head">
                <span className="sp-template-cat">{t.category || 'Structure'}</span>
                <strong className="sp-template-headline">{t.headline || t.coupon}</strong>
              </div>
              <div className="serif sp-template-title">{t.name}</div>
              <div className="text-3 sp-template-terms">{t.terms || `${t.tenor} · ${t.protection}`}</div>
              <p className="text-3 sp-template-blurb">{t.blurb || t.use}</p>
              <div className="sp-template-diagram">
                <Charts.PayoffDiagram shape={t.shape} barrierPct={barrierPct} coupon={coupon} height={100} />
              </div>
              <button type="button" className="btn sm sp-template-cta" onClick={() => setTab && setTab('new')}>
                Use template <span dangerouslySetInnerHTML={{ __html: Icons.arrow }} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** WM Pulse tab 3 — active alts sleeve, issuer offers, subscription cadence (+ book toggle). */
function WmAltsStructuredUnifiedDesk({ navigate, clientId }) {
  const Pb = window.Slate.Copy && window.Slate.Copy.productBuilder;
  const WmE = window.Slate.Copy && window.Slate.Copy.workspace && window.Slate.Copy.workspace.wmEmptyStates;
  const [scope, setScope] = React.useState('client');
  const desk = scope === 'book';
  return (
    <div className="wm-uni-alts-stack stack stack-3" style={{ marginTop: 12 }}>
      <div className="row wm-uni-alts-toolbar gap-12" style={{ flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="mono slate-section-label" style={{ fontSize: 11 }}>ALTS · STRUCTURED</span>
        <div className="seg wm-uni-alts-scope">
          <button type="button" className={scope === 'client' ? 'active' : ''} onClick={() => setScope('client')}>This client view</button>
          <button type="button" className={scope === 'book' ? 'active' : ''} onClick={() => setScope('book')}>Book-wide view</button>
        </div>
      </div>
      <section className="card wm-uni-alts-section">
        <p className="mono slate-section-label" style={{ fontSize: 10, letterSpacing: '0.12em', margin: 0 }}>ACTIVE POSITIONS</p>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 10 }}>
          <h3 className="serif wm-uni-alts-h" style={{ margin: '10px 0 0', fontSize: 18, fontWeight: 500 }}>Private sleeves on file</h3>
          <button type="button" className="btn ghost sm">+ Add position</button>
        </div>
        <AltsHoldingsTab />
      </section>
      <section className="card wm-uni-alts-section">
        <p className="mono slate-section-label" style={{ fontSize: 10, letterSpacing: '0.12em', margin: 0 }}>OPEN OFFERS</p>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 10 }}>
          <h3 className="serif wm-uni-alts-h" style={{ margin: '10px 0 0', fontSize: 18, fontWeight: 500 }}>Issuer desk packaging</h3>
        </div>
        <p className="text-3 slate-helper-copy" style={{ fontSize: 12, margin: '12px 0', lineHeight: 1.5 }}>
          {(Pb && Pb.reviewFactsheetLead) || 'Open factsheet preview before outbound — compliance anchors review-first.'}
        </p>
        {desk ? (
          <p className="text-2" style={{ fontSize: 13 }}>{(WmE && WmE.altsNoOffers) || 'No open offers staged.'}</p>
        ) : (
          <StructuredOverviewTab
            clientView={false}
            setTab={(t) => navigate(`clients/${clientId}/structured?sub=${encodeURIComponent(t)}`)}
          />
        )}
        <div className="row gap-10 mt-16" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="btn ghost sm wm-factsheet-first" onClick={e => e.preventDefault()}>
            {(Pb && Pb.factsheetPreview) || 'Factsheet preview'}
          </button>
          <button type="button" className="btn primary sm" onClick={() => navigate('product-builder')}>
            Build offer
          </button>
        </div>
      </section>
      <section className="card wm-uni-alts-section">
        <p className="mono slate-section-label" style={{ fontSize: 10, letterSpacing: '0.12em', margin: 0 }}>SUBSCRIPTION HISTORY</p>
        <h3 className="serif wm-uni-alts-h" style={{ margin: '10px 0 10px', fontSize: 18, fontWeight: 500 }}>Capital calls · distributions</h3>
        <div className="text-3" style={{ fontSize: 12, lineHeight: 1.5 }}>
          {ALT_CASHFLOW.slice(0, 4).map(c => (
            <div key={c.q} style={{ padding: '10px 0', borderBottom: '1px dashed var(--rule-2)' }}>
              <span className="mono">{c.q}</span>
              {' · '}
              {fmt.money(c.calls + c.dist, { compact: true })}
              {' — '}{c.notes}
            </div>
          ))}
        </div>
        <p className="text-3 wm-uni-consent-note" style={{ fontSize: 11, marginTop: 14 }}>Opt-ins record consent timestamps on send — audit attaches to CRM.</p>
      </section>
    </div>
  );
}

window.Slate.AltsStructured = { AltsScreen, StructuredScreen, WmAltsStructuredUnifiedDesk };
