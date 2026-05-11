// Slate — Household screen (Summary · Holdings · Diversification · Accounts) +
// Holding detail · Insights · Insight detail. The household screen collapses what
// were three top-level pages (Overview, Portfolio, Accounts) into a single tabbed view.

const { Icons, fmt, POSITIONS, ACCOUNTS, HOUSEHOLD, HOUSEHOLD_BRIEFING, INSIGHTS, CLIENT_BOOK, HOUSEHOLD_CASHFLOW, ALT_CASHFLOW, Charts, analytics } = window.Slate;

// Today's date — synthetic but consistent with the rest of the demo (May 7, 2026).
// Used by Briefing and other date-aware logic.
const TODAY = '2026-05-07';
const daysFrom = (d) => Math.ceil((new Date(d) - new Date(TODAY)) / 86400000);
const isPast = (d) => d < TODAY;
const fmtShort = (d) => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric' });
const fmtLong  = (d) => new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
const { ASSET_LABELS } = analytics;

const COLORS = ['var(--ink)', 'var(--accent)', 'var(--ink-3)', 'var(--ink-4)', 'var(--pos)', 'var(--warn)'];
const HOUSEHOLD_TABS = ['summary', 'holdings', 'diversification', 'accounts', 'cashflow'];

// Per-source contextual hint shown in the per-quarter drilldown.
// Returns a short note (string) or null when no useful context applies.
const cashflowSourceContext = (key, q, value) => {
  if (key === 'altCalls' || key === 'altDistributions') {
    const ac = ALT_CASHFLOW.find(c => c.q === q);
    return ac ? ac.notes : null;
  }
  if (key === 'bondCoupons') {
    // UST 4.5 + NY muni land Q1/Q3; UST 4.25 + CA muni land Q2/Q4.
    const qNum = parseInt(q.slice(-1), 10);
    return (qNum === 1 || qNum === 3)
      ? 'UST 4.5% (Feb/Aug) + NY muni 5% (Jan/Jul)'
      : 'UST 4.25% (May/Nov) + CA muni 4% (Apr/Oct)';
  }
  if (key === 'structuredCoupons' && value > 0) {
    if (q === '2026Q3' || q === '2026Q4') return 'sp1 SPX Buffer ($30k) + sp3 AAPL Rev. Conv. ($43.5k)';
    if (q === '2027Q1') return 'sp1 SPX Buffer final coupon · sp3 matured Nov 2026';
    return null;
  }
  if (key === 'taxes' && value < 0) {
    if (q === '2027Q1' || q === '2028Q1') return 'April 15 prior-year settlement + Q1 federal estimate';
    return 'Federal quarterly estimate';
  }
  if (key === 'lifestyle') return 'Family withdrawals (~$2M/yr run-rate)';
  if (key === 'fees') return 'Pine Ridge II 1.75% mgmt + household advisory';
  if (key === 'cashInterest') return 'MMF + sweep on ~$11M idle cash';
  if (key === 'dividends') return 'US + Intl equity (~1.6% blended yield)';
  return null;
};

// How each cashflow source is attributed across the household's four legal entities.
// Used by the per-entity rollup section to answer "which entity funds what?"
const HCF_SOURCE_ENTITY_SPLIT = {
  dividends:         { 'schwab-joint': 0.55, 'fidelity-roth': 0.40, 'pershing-trust': 0.05 },
  bondCoupons:       { 'pershing-trust': 1.00 },
  structuredCoupons: { 'pershing-trust': 0.41, 'schwab-joint': 0.59 }, // sp1 in trust, sp3 in joint while paying
  cashInterest:      { 'schwab-joint': 0.45, 'fidelity-roth': 0.04, 'pershing-trust': 0.51 }, // by cash balance
  altDistributions:  { 'jpm-alts':       1.00 },
  altCalls:          { 'jpm-alts':       1.00 },
  fees:              { 'jpm-alts': 0.40, 'schwab-joint': 0.30, 'pershing-trust': 0.20, 'fidelity-roth': 0.10 },
  taxes:             { 'schwab-joint': 0.70, 'pershing-trust': 0.30 }, // Roth doesn't pay tax
  lifestyle:         { 'schwab-joint': 1.00 },
};

// Cashflow chart source definitions — colors + classification + confidence band.
const HCF_SOURCES = [
  { key:'dividends',         label:'Equity dividends',           color:'var(--ink)',     sign:'in',  conf:'med'  },
  { key:'bondCoupons',       label:'Bond coupons',               color:'var(--ink-2)',   sign:'in',  conf:'high' },
  { key:'structuredCoupons', label:'Structured product coupons', color:'var(--ink-3)',   sign:'in',  conf:'med'  },
  { key:'cashInterest',      label:'MMF / cash interest',        color:'var(--ink-4)',   sign:'in',  conf:'med'  },
  { key:'altDistributions',  label:'Alt distributions',          color:'var(--pos)',     sign:'in',  conf:'low'  },
  { key:'altCalls',          label:'Capital calls (alts)',       color:'var(--neg)',     sign:'out', conf:'med'  },
  { key:'fees',              label:'Investment fees',            color:'var(--warn)',    sign:'out', conf:'high' },
  { key:'taxes',             label:'Estimated taxes',            color:'var(--accent)',  sign:'out', conf:'high' },
  { key:'lifestyle',         label:'Lifestyle withdrawals',      color:'var(--ink-3)',   sign:'out', conf:'med'  },
];

const Delta = ({ v, dp = 2 }) => (
  <span className={`delta ${v >= 0 ? 'up' : 'dn'}`} style={{ color: v >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
    {v >= 0 ? '▲' : '▼'} {fmt.pct(v, { dp })}
  </span>
);

const monthlyPath = (start, drift, vol, seed = 1) => {
  let v = start, out = [v];
  for (let i = 0; i < 36; i++) {
    const r = (Math.sin(i * 1.7 + seed) + Math.cos(i * 0.6 + seed * 2)) * vol + drift;
    v *= 1 + r / 100; out.push(v);
  }
  return out;
};

function insightHouseholdId(i) {
  return i.clientId || 'marchetti';
}

function insightHouseholdName(i) {
  const id = insightHouseholdId(i);
  const book = CLIENT_BOOK || [];
  const row = book.find(c => c.id === id);
  return row ? row.name : id;
}

function slateRoutePath() {
  return (window.SlateRoute && window.SlateRoute.read) ? window.SlateRoute.read() : (location.hash || '').slice(1);
}

// ============ Household (tabbed) ============
/** @param {{ navigate: Function, accountIds: string[], portfolioBase?: string, embedded?: boolean, wmHouseholdEmbed?: boolean }} props When portfolioBase is set (e.g. clients/marchetti/portfolio), sub-tabs use ?sub=. */
function HouseholdScreen({ navigate, accountIds, portfolioBase, embedded, wmHouseholdEmbed }) {
  const BookRole = typeof window !== 'undefined' && window.Slate && window.Slate.Book;
  const embeddedClientSlim = Boolean(
    embedded && BookRole && BookRole.getDemoRole && BookRole.getDemoRole() === 'client',
  );
  const initialTab = () => {
    if (portfolioBase) {
      const h = slateRoutePath();
      const baseOnly = portfolioBase.split('?')[0];
      if (!h.startsWith(baseOnly)) return 'summary';
      const qi = h.indexOf('?');
      if (qi < 0) return 'summary';
      const sub = new URLSearchParams(h.slice(qi)).get('sub') || 'summary';
      return HOUSEHOLD_TABS.includes(sub) ? sub : 'summary';
    }
    const path = slateRoutePath();
    const after = path.indexOf('?');
    const t = after >= 0 ? path.slice(after + 1) : 'summary';
    return HOUSEHOLD_TABS.includes(t) ? t : 'summary';
  };
  const [tab, setTab] = React.useState(initialTab);

  React.useEffect(() => {
    const onNav = () => setTab(initialTab());
    window.addEventListener('hashchange', onNav);
    window.addEventListener('slate-route', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('slate-route', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, [portfolioBase]);

  const setTabUrl = t => {
    if (portfolioBase) {
      window.SlateRoute.write(t === 'summary' ? portfolioBase : portfolioBase + '?sub=' + t);
    } else {
      window.SlateRoute.write(t === 'summary' ? 'household' : 'household?' + t);
    }
    setTab(t);
  };

  const PortfolioCopy = window.Slate.Copy && window.Slate.Copy.portfolio;
  const pTab = PortfolioCopy && PortfolioCopy.tabs ? PortfolioCopy.tabs : {};

  return (
    <div
      className={
        embedded
          ? `household-embedded${embeddedClientSlim ? ' household-embedded--client-slim' : ''}${wmHouseholdEmbed ? ' household-embedded--wm-review' : ''}`
          : 'page'
      }
    >
      {!embedded && (
        <div className="page-header">
          <div>
            <div className="eyebrow">Household · est. {HOUSEHOLD.founded} · {HOUSEHOLD.segment} · {ACCOUNTS.length} accounts · 1 trust</div>
            <h1 className="serif">{HOUSEHOLD.name}</h1>
          </div>
          <div className="meta">
            <span className="label">As of 6 May 2026, 14:08 ET</span>
            <span style={{ maxWidth: 360, textAlign:'right' }}>RM · {HOUSEHOLD.rm}</span>
          </div>
        </div>
      )}
      <div className={`tabs${wmHouseholdEmbed ? ' household-subnav household-subnav--wm' : ''}`} role="tablist" aria-label={(PortfolioCopy && PortfolioCopy.subnavAria) || 'Household tabs'}>
        <button type="button" role="tab" className={tab==='summary'?'active':''} onClick={()=>setTabUrl('summary')}>{pTab.summary || 'Overview'}</button>
        <button type="button" role="tab" className={tab==='holdings'?'active':''} onClick={()=>setTabUrl('holdings')}>{pTab.holdings || 'Holdings'}</button>
        <button type="button" role="tab" className={tab==='diversification'?'active':''} onClick={()=>setTabUrl('diversification')}>{pTab.diversification || 'Diversification'}</button>
        <button type="button" role="tab" className={tab==='accounts'?'active':''} onClick={()=>setTabUrl('accounts')}>{pTab.accounts || 'Accounts'}</button>
        <button type="button" role="tab" className={tab==='cashflow'?'active':''} onClick={()=>setTabUrl('cashflow')}>{pTab.cashflow || 'Cashflow'}</button>
      </div>
      {tab === 'summary' && (
        <SummaryTab
          navigate={navigate}
          accountIds={accountIds}
          setTabUrl={setTabUrl}
          embeddedClientSlim={embeddedClientSlim}
          wmHouseholdEmbed={wmHouseholdEmbed}
        />
      )}
      {tab === 'holdings' && <HoldingsTab navigate={navigate} accountIds={accountIds}/>}
      {tab === 'diversification' && <DiversificationTab accountIds={accountIds}/>}
      {tab === 'accounts' && <AccountsTab accountIds={accountIds}/>}
      {tab === 'cashflow' && <CashflowTab navigate={navigate} accountIds={accountIds}/>}
    </div>
  );
}

// ---------- Summary tab ----------
function SummaryTab({ navigate, accountIds, setTabUrl, embeddedClientSlim, wmHouseholdEmbed }) {
  const total = analytics.totals(accountIds);
  const alloc = analytics.allocation(accountIds);
  const accts = analytics.accountTotals();
  const filteredAccts = accountIds && accountIds.length ? accts.filter(a => accountIds.includes(a.id)) : accts;
  const top = analytics.concentrations(accountIds).slice(0, 5);

  const BookApi = typeof window !== 'undefined' && window.Slate && window.Slate.Book;
  const [summaryChartRange, setSummaryChartRange] = React.useState('1Y');
  const chartPerf =
    BookApi && BookApi.buildClientPerformanceComparisonSeries
      ? BookApi.buildClientPerformanceComparisonSeries(total.mv, summaryChartRange)
      : null;
  const PerfCopy = window.Slate.Copy && window.Slate.Copy.portfolio;
  const seriesForChart =
    chartPerf && chartPerf.series
      ? (wmHouseholdEmbed ? chartPerf.series.filter(s => s.name === 'Portfolio' || (s.name && s.name.includes('60/40'))) : chartPerf.series)
      : [];
  const xTicks =
    chartPerf && BookApi.getClientChartXAxisTicks && seriesForChart.length
      ? BookApi.getClientChartXAxisTicks(summaryChartRange, seriesForChart[0].points.length)
      : null;
  const CLIENT_RANGES = (BookApi && BookApi.CLIENT_CHART_RANGES) || ['30D', '90D', '6M', '1Y', '5Y'];
  const CLIENT_LABELS = (BookApi && BookApi.CLIENT_CHART_LABELS) || {};
  const trailingPhrase =
    (BookApi && BookApi.CLIENT_CHART_TRAILING_LABEL && BookApi.CLIENT_CHART_TRAILING_LABEL[summaryChartRange]) || '';

  const rangeChangePct =
    chartPerf && BookApi.seriesPctChange ? BookApi.seriesPctChange(chartPerf.portfolioPoints) : 0;
  const rangeSegLabel = CLIENT_LABELS[summaryChartRange] || summaryChartRange;
  const clientPortalFootnote =
    BookApi && BookApi.getDemoRole && BookApi.getDemoRole() === 'client';
  const chartPadAmt = Math.max(total.mv * 0.012, 15000);
  let chartYMin = Math.min(total.mv * 0.612, total.mv - chartPadAmt);
  let chartYMax = Math.max(total.mv * 1.028, total.mv + chartPadAmt);
  if (seriesForChart.length) {
    const allPts = seriesForChart.flatMap(s => s.points);
    chartYMin = Math.min(total.mv * 0.612, Math.min(...allPts) - chartPadAmt);
    chartYMax = Math.max(total.mv * 1.028, Math.max(...allPts) + chartPadAmt);
  }

  return (
    <div className={embeddedClientSlim ? 'summary-tab-embedded-client' : undefined}>
      <div className="kpis">
        <div className="kpi" title="Total market value of every position, summed across in-scope accounts." style={{ cursor:'help' }}>
          <span className="label">{accountIds && accountIds.length ? 'Filtered value' : 'Net worth'}</span>
          <span className="v xl">{fmt.money(total.mv, { compact: true })}</span>
          <Delta v={3.27}/>
        </div>
        <div className="kpi" title="Portion of net worth that can be converted to cash within days. Excludes private alternatives and most structured products." style={{ cursor:'help' }}>
          <span className="label">Liquid</span>
          <span className="v lg">{fmt.money(total.mv * 0.88, { compact: true })}</span>
          <span className="text-3" style={{ fontSize: 12 }}>88% of scope</span>
        </div>
        <div className="kpi" title="Market value − cost basis, summed across positions. Tax is owed only when sold (realized)." style={{ cursor:'help' }}>
          <span className="label">Unrealized gain</span>
          <span className="v lg">{fmt.money(total.unreal, { compact: true })}</span>
          <Delta v={total.unrealPct} dp={1}/>
        </div>
        <div className="kpi" title="Year-to-date dividends + interest received across the household." style={{ cursor:'help' }}>
          <span className="label">YTD income</span>
          <span className="v lg">$612k</span>
          <span className="text-3" style={{ fontSize: 12 }}>div + interest</span>
        </div>
      </div>

      <div className="section perf-alloc-row">
        <div className="perf-alloc-perf">
          <div className="row gap-12" style={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2 className="serif">Performance</h2>
              <div className="sub">
                {wmHouseholdEmbed && PerfCopy && PerfCopy.performanceSub
                  ? PerfCopy.performanceSub
                  : trailingPhrase ? <>Trailing {trailingPhrase} · vs. 60/40 and S&amp;P 500</> : <>Vs. 60/40 and S&amp;P 500</>}
              </div>
            </div>
            <div className="seg" role="group" aria-label="Chart time range">
              {CLIENT_RANGES.map(k => (
                <button key={k} type="button" className={summaryChartRange === k ? 'active' : ''} onClick={() => setSummaryChartRange(k)}>
                  {CLIENT_LABELS[k] || k}
                </button>
              ))}
            </div>
          </div>
          <div className="card perf-alloc-stack" style={{ padding: 16, marginTop: 12 }}>
            {chartPerf && Charts && Charts.LineChart ? (
              <Charts.LineChart
                height={208}
                yMin={chartYMin}
                yMax={chartYMax}
                series={seriesForChart}
                annotationData={wmHouseholdEmbed ? null : chartPerf.annotationData}
                xAxisTicks={xTicks}
              />
            ) : null}
            <div className="client-perf-legend" aria-label="Chart legend">
              <div className="client-perf-legend-item">
                <span className="client-perf-legend-line client-perf-legend-line--solid" aria-hidden="true" />
                <span>Portfolio</span>
              </div>
              <div className="client-perf-legend-item">
                <span className="client-perf-legend-line client-perf-legend-line--dash client-perf-legend-line--mid" aria-hidden="true" />
                <span>60/40 benchmark</span>
              </div>
              {!wmHouseholdEmbed ? (
                <React.Fragment>
                  <div className="client-perf-legend-item">
                    <span className="client-perf-legend-line client-perf-legend-line--dash client-perf-legend-line--lite" aria-hidden="true" />
                    <span>S&amp;P 500</span>
                  </div>
                  <div className="client-perf-legend-item">
                    <span className="client-perf-legend-dot client-perf-legend-dot--event" aria-hidden="true" />
                    <span>Notable event</span>
                  </div>
                </React.Fragment>
              ) : null}
            </div>
            <div className="client-perf-metrics">
              {(chartPerf ? chartPerf.metricsStrip : []).map((m) => (
                <div key={m.label} className="client-perf-metric">
                  <div className="client-perf-metric-rule" aria-hidden="true" />
                  <div className="client-perf-metric-label">{m.label}</div>
                  <div className={`client-perf-metric-value${m.positive ? '' : ' client-perf-metric-value--neg'}`}>{m.value}</div>
                </div>
              ))}
            </div>
            <p className="text-3 client-chart-foot client-chart-foot--compact" style={{ marginTop: 10 }}>
              <strong>{rangeSegLabel}:</strong>{' '}
              <span style={{ color: rangeChangePct >= 0 ? 'var(--pos)' : 'var(--neg)' }}>
                {rangeChangePct >= 0 ? '▲' : '▼'} {fmt.pct(100 * Math.abs(rangeChangePct), { dp: 2 })} vs start of range{clientPortalFootnote ? '' : ' (illustrative)'}
              </span>
            </p>
          </div>
        </div>

        <div className="perf-alloc-alloc">
          <h2 className="serif">Allocation</h2>
          <div className="sub">Asset classes · vs. IPS targets</div>
          <div className="card perf-alloc-stack" style={{ padding: 16, marginTop: 12 }}>
            <div className="perf-alloc-donut-row">
              <Charts.Donut size={150} data={alloc.map((a, i) => ({ pct: a.pct, color: COLORS[i % COLORS.length] }))}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, display: 'grid', gridTemplateColumns: '1fr auto', columnGap: 12, rowGap: 8, alignItems: 'center' }}>
                  {alloc.map((a, i) => (
                    <React.Fragment key={a.key}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span className="dot" style={{ background: COLORS[i % COLORS.length] }}/> &nbsp; {ASSET_LABELS[a.key] || a.key}
                      </span>
                      <span style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                        <span className="num">{a.pct.toFixed(1)}%</span>
                        <span className="text-3" style={{ fontSize:11, marginLeft:6 }}>tgt {a.target}%</span>
                      </span>
                    </React.Fragment>
                  ))}
                </ul>
              </div>
            </div>
            <div className="margin-note" style={{ marginTop: 'auto', paddingTop: 14 }}>
              <div className="label" style={{ color:'var(--accent)' }}>IPS drift</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>{(alloc[0].pct - alloc[0].target).toFixed(0)}pp overweight {ASSET_LABELS[alloc[0].key]} vs target.</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`section${embeddedClientSlim ? ' summary-accounts-embedded' : ''}`}>
        <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
          <h2 className="serif">Accounts in scope</h2>
          <button className="btn ghost sm" style={{ whiteSpace: 'nowrap' }} onClick={() => setTabUrl('accounts')}>Open accounts <span dangerouslySetInnerHTML={{__html: Icons.arrow}}/></button>
        </div>
        <div className="table-wrap mt-12">
          <table className="tbl">
            <thead>
              <tr>
                <th>Account</th>
                {embeddedClientSlim ? null : (
                  <>
                    <th title="Institution physically holding the assets (Schwab, Fidelity, etc.).">Custodian</th>
                    <th title="Legal entity that owns the account — individual, joint, trust, or LLC.">Entity</th>
                  </>
                )}
                <th className="num" title="Total market value of positions in this account.">Value</th>
                <th className="num" title="This account's share of the in-scope total.">% of scope</th>
                {embeddedClientSlim ? null : <th className="num" title="Year-to-date return for this account.">YTD</th>}
                {embeddedClientSlim ? null : <th title="Sparkline of value over the last 12 months.">12-mo trend</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAccts.map((a, i) => (
                <tr key={a.id} onClick={() => setTabUrl('accounts')}>
                  <td><b>{a.name}</b></td>
                  {embeddedClientSlim ? null : (
                    <>
                      <td className="text-3">{a.custodian}</td>
                      <td className="text-3">{a.entity}</td>
                    </>
                  )}
                  <td className="num">{fmt.money(a.mv, { compact: true })}</td>
                  <td className="num">{((a.mv / total.mv) * 100).toFixed(1)}%</td>
                  {embeddedClientSlim ? null : (
                    <>
                      <td className="num"><Delta v={[4.1, 5.3, 1.9, 0.0][i] || 2.5} dp={1}/></td>
                      <td><div style={{ width: 90 }}><Charts.Spark points={monthlyPath(100, 0.4 + i * 0.1, 1.2, i + 5).slice(-12)} color="var(--ink-3)"/></div></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`section summary-split-balanced${embeddedClientSlim ? ' summary-split-balanced--solo' : ''}`}>
        <div className="summary-split-col">
          <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
            <h2 className="serif">Top concentrations</h2>
            <button className="btn ghost sm" style={{ whiteSpace:'nowrap' }} onClick={()=>setTabUrl('holdings')}>All holdings <span dangerouslySetInnerHTML={{__html: Icons.arrow}}/></button>
          </div>
          <div className="sub">Largest single holdings · red bars exceed the 7% IPS single-name cap.</div>
          <div className="card summary-conc-card mt-12">
            <table className="tbl">
              <tbody>
                {top.map(p => (
                  <tr key={p.id} onClick={() => navigate('household/' + encodeURIComponent(p.symbol))}>
                    <td style={{ width: 28 }}><span className={`dot ${p.pctNW > 7 ? 'warn' : 'ink'}`}/></td>
                    <td><b>{p.symbol}</b><div className="label" style={{ marginTop:2 }}>{p.name}</div></td>
                    <td className="num">{fmt.money(p.mv, { compact: true })}</td>
                    <td className="num">{p.pctNW.toFixed(1)}%</td>
                    <td>
                      <div className="bar-track" style={{ width: 100 }}>
                        <div className={`bar-fill ${p.pctNW > 7 ? 'neg' : ''}`} style={{ width: Math.min(100, p.pctNW * 6) + '%' }}/>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!embeddedClientSlim ? (
          <div className="summary-split-col">
            <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
              <h2 className="serif">{INSIGHTS.filter(i => insightHouseholdId(i) === 'marchetti').length} things to discuss</h2>
              <button className="btn ghost sm" style={{ whiteSpace:'nowrap' }} onClick={()=>navigate('insights')}>Open insights <span dangerouslySetInnerHTML={{__html: Icons.arrow}}/></button>
            </div>
            <div className="summary-insight-list">
              {INSIGHTS.filter(i => insightHouseholdId(i) === 'marchetti').map(i => {
                const pt = i.priority === 'high' ? 'high' : i.priority === 'medium' ? 'med' : 'low';
                const pl = i.priority === 'high' ? 'High' : i.priority === 'medium' ? 'Medium' : 'Low';
                const kc = i.priority === 'high' ? 'neg' : i.priority === 'medium' ? 'warn' : 'insight-kind-low';
                return (
                <div key={i.id} className="card" style={{ cursor:'pointer' }} onClick={()=>navigate('insights/' + i.id)}>
                  <div className="insight-card-head row gap-8" style={{ flexWrap: 'wrap' }}>
                    <span className={`tag ${kc}`}>{i.kind}</span>
                    <span className={`insight-priority-pill insight-priority-pill--${pt}`}>{pl}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginTop: 10 }}>{i.title}</div>
                  <div className="text-3" style={{ fontSize: 12, marginTop: 4 }}>
                    {[
                      i.impact.taxSaved ? `tax saved ${fmt.money(i.impact.taxSaved, { compact: true })}` : null,
                      i.impact.incomeLift ? `+${fmt.money(i.impact.incomeLift, { compact: true })}/yr` : null,
                      i.impact.reposition && !i.impact.incomeLift ? `${fmt.money(i.impact.reposition, { compact: true })} repositioned` : null,
                    ].filter(Boolean).join(' · ')}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------- Holdings tab ----------
function HoldingsTab({ navigate, accountIds }) {
  const [sortKey, setSortKey] = React.useState('mv');
  const [dir, setDir] = React.useState('desc');
  const [classFilter, setClassFilter] = React.useState('all');
  const [q, setQ] = React.useState('');

  const positions = analytics.filtered(accountIds);
  const total = positions.reduce((a,b) => a + b.mv, 0) || 1;

  let rows = positions.map(p => ({ ...p, pctNW: (p.mv/total)*100, unreal: p.mv - p.cost, unrealPct: p.cost ? ((p.mv - p.cost)/p.cost)*100 : 0 }));
  if (classFilter !== 'all') rows = rows.filter(p => p.assetClass === classFilter);
  if (q) rows = rows.filter(p => (p.symbol+p.name).toLowerCase().includes(q.toLowerCase()));
  rows.sort((a,b) => (a[sortKey] > b[sortKey] ? 1 : -1) * (dir === 'asc' ? 1 : -1));

  const setSort = k => { if (sortKey === k) setDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(k); setDir('desc'); } };
  const SortHead = ({k, children, num, title}) => (
    <th className={num ? 'num' : ''} onClick={()=>setSort(k)} title={title} style={{ cursor:'pointer', userSelect:'none' }}>
      {children} {sortKey === k && (dir === 'asc' ? '↑' : '↓')}
    </th>
  );

  return (
    <div>
      <div className="row gap-12 mb-16" style={{ flexWrap:'wrap', alignItems:'center' }}>
        <input className="input" placeholder="Search symbol or name…" value={q} onChange={e=>setQ(e.target.value)} style={{ width: '100%', maxWidth: 280, minWidth: 0, flex: '1 1 200px' }}/>
        <div className="seg">
          <button className={classFilter==='all'?'active':''} onClick={()=>setClassFilter('all')}>All classes</button>
          {Object.keys(ASSET_LABELS).slice(0,5).map(k => <button key={k} className={classFilter===k?'active':''} onClick={()=>setClassFilter(k)}>{ASSET_LABELS[k]}</button>)}
        </div>
        <div className="spacer"/>
        <span className="text-3" style={{ fontSize: 12 }}>{rows.length} positions · {fmt.money(rows.reduce((a,b)=>a+b.mv,0), {compact:true})}</span>
        <button className="btn sm"><span dangerouslySetInnerHTML={{__html: Icons.download}}/> Export CSV</button>
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <SortHead k="symbol">Security</SortHead>
              <th title="Asset class — equity, fixed income, alternative, cash, etc.">Class</th>
              <th title="Custodian holding this position.">Account</th>
              <SortHead k="qty" num>Qty</SortHead>
              <SortHead k="price" num>Price</SortHead>
              <SortHead k="mv" num title="Current market value: quantity × price.">Market Value</SortHead>
              <SortHead k="pctNW" num title="This position's share of the in-scope total.">% scope</SortHead>
              <SortHead k="unreal" num title="Unrealized gain or loss: market value − cost basis. Tax owed only when sold.">Unreal G/L</SortHead>
              <SortHead k="unrealPct" num title="Unrealized G/L as a % of cost basis.">%</SortHead>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => {
              const acct = ACCOUNTS.find(a => a.id === p.account);
              return (
                <tr key={p.id} onClick={() => navigate('household/' + encodeURIComponent(p.symbol))}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.symbol}</div>
                    <div className="label" style={{ marginTop:2 }}>{p.name}</div>
                  </td>
                  <td className="text-3" style={{ fontSize: 12 }}>{ASSET_LABELS[p.assetClass]}</td>
                  <td className="text-3" style={{ fontSize: 12 }}>{acct.custodian}</td>
                  <td className="num">{p.qty == null ? '—' : fmt.num(p.qty)}</td>
                  <td className="num">{p.price == null ? 'NAV' : (p.price > 1000 ? fmt.num(p.price) : p.price.toFixed(2))}</td>
                  <td className="num">{fmt.money(p.mv, { compact: true })}</td>
                  <td className="num">{p.pctNW.toFixed(2)}%</td>
                  <td className="num" style={{ color: p.unreal >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmt.money(p.unreal, { compact: true })}</td>
                  <td className="num" style={{ color: p.unrealPct >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmt.pct(p.unrealPct, { dp: 1 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Diversification tab (Allocation + Sectors merged) ----------
function DiversificationTab({ accountIds }) {
  const alloc = analytics.allocation(accountIds);
  const concentrations = analytics.concentrations(accountIds);
  const sectors = analytics.sectorBreakdown(accountIds);
  return (
    <div className="stack stack-3" style={{ gap: 28 }}>
      <div className="grid-2">
        <div className="card" style={{ padding: 24 }}>
          <h3 className="serif" style={{ margin: 0, fontSize: 18 }}>Asset class vs IPS</h3>
          <div className="text-3" style={{ fontSize: 12 }}>Bar = actual; tick = target.</div>
          <div className="stack stack-3 mt-16">
            {alloc.map((a, i) => (
              <div key={a.key}>
                <div className="row" style={{ justifyContent:'space-between' }}>
                  <span><span className="dot" style={{ background: COLORS[i % COLORS.length] }}/> &nbsp; {ASSET_LABELS[a.key]}</span>
                  <span className="num" style={{ fontSize: 13 }}>{a.pct.toFixed(1)}% <span className="text-3" style={{ fontSize: 11, marginLeft: 6 }}>tgt {a.target}%</span></span>
                </div>
                <div className="bar-track with-target mt-8">
                  <div className={`bar-fill ${Math.abs(a.pct - a.target) > 5 ? 'neg' : ''}`} style={{ width: a.pct + '%' }}/>
                  <div className="target" style={{ left: a.target + '%' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="serif" style={{ margin: 0, fontSize: 18 }}>Single-name caps</h3>
          <div className="text-3" style={{ fontSize: 12 }}>IPS limits any single security to 7% of scope. Tick on each bar marks that 7% line; bar turns red past it.</div>
          <div className="stack stack-2 mt-16">
            {concentrations.map(p => (
              <div key={p.id} className="row" style={{ alignItems:'center', gap: 12 }}>
                <span style={{ width: 70, fontWeight: 600, fontSize: 13 }}>{p.symbol}</span>
                <div className="bar-track with-target" style={{ flex: 1 }}>
                  <div className={`bar-fill ${p.pctNW > 7 ? 'neg' : ''}`} style={{ width: Math.min(100, p.pctNW * 6) + '%' }}/>
                  <div className="target" style={{ left: 42 + '%' }}/>
                </div>
                <span className="num" style={{ width: 60, textAlign:'right', fontSize: 13 }}>{p.pctNW.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ padding: 24 }}>
          <h3 className="serif" style={{ margin: 0, fontSize: 18 }}>Equity sector exposure</h3>
          <div className="text-3" style={{ fontSize: 12 }}>Across US + International equity sleeves.</div>
          <div className="row gap-24 mt-16" style={{ alignItems: 'center' }}>
            <Charts.Donut size={170} data={sectors.map((s, i) => ({ pct: s.pct, color: COLORS[i % COLORS.length] }))}/>
            <ul style={{ listStyle:'none', padding:0, margin:0, flex:1, display:'flex', flexDirection:'column', gap: 8, fontSize: 13 }}>
              {sectors.map((s, i) => (
                <li key={s.sector} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span><span className="dot" style={{ background: COLORS[i % COLORS.length] }}/> &nbsp; {s.sector}</span>
                  <span className="num">{s.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="serif" style={{ margin: 0, fontSize: 18 }}>Geographic mix</h3>
          <div className="text-3" style={{ fontSize: 12 }}>Look-through where available.</div>
          <div className="grid-2 mt-16" style={{ gap: 14 }}>
            {[['United States', 71, 'var(--ink)'], ['Developed Intl', 8, 'var(--ink-3)'], ['Emerging Mkts', 9, 'var(--accent)'], ['Multi-region', 12, 'var(--ink-4)']].map(([k, v, c]) => (
              <div key={k}>
                <div className="label">{k}</div>
                <div className="num" style={{ fontSize: 22, marginTop: 4 }}>{v}%</div>
                <div className="bar-track mt-8"><div className="bar-fill" style={{ width: v + '%', background: c }}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Accounts tab ----------
function AccountsTab({ accountIds }) {
  const accts = analytics.accountTotals();
  const filtered = accountIds && accountIds.length ? accts.filter(a => accountIds.includes(a.id)) : accts;
  const total = filtered.reduce((a, b) => a + b.mv, 0) || 1;
  return (
    <div>
      <div className="text-3 mb-16" style={{ fontSize: 12 }}>{filtered.length} accounts in scope · {fmt.money(total, {compact:true})}</div>
      <div className="grid-2">
        {filtered.map((a, i) => (
          <div key={a.id} className="card" style={{ padding: 24 }}>
            <div className="row" style={{ justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div className="label">{a.custodian} · {a.entity}</div>
                <div className="serif" style={{ fontSize: 24, fontWeight: 600, marginTop: 2 }}>{a.name}</div>
              </div>
              <span className="tag">{a.type}</span>
            </div>
            <div className="row gap-24 mt-16">
              <div title="Total market value of positions in this account." style={{ cursor:'help' }}><div className="label">Value</div><div className="num" style={{ fontSize: 26 }}>{fmt.money(a.mv, { compact: true })}</div></div>
              <div title="This account's share of the in-scope household total." style={{ cursor:'help' }}><div className="label">% of scope</div><div className="num" style={{ fontSize: 26 }}>{((a.mv/total)*100).toFixed(1)}%</div></div>
              <div title="Number of distinct holdings in this account." style={{ cursor:'help' }}><div className="label">Positions</div><div className="num" style={{ fontSize: 26 }}>{a.positions}</div></div>
              <div title="Account-level market value − cost basis." style={{ cursor:'help' }}><div className="label">Unrealized</div><div className="num" style={{ fontSize: 26, color: a.unreal >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{fmt.money(a.unreal, { compact: true })}</div></div>
            </div>
            <div className="mt-16">
              <div className="label" style={{ marginBottom: 4 }}>Value · trailing 36 months</div>
              <Charts.Spark points={monthlyPath(100, 0.4 + i * 0.1, 1.2, i+5)} color="var(--ink-3)" fill height={48}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Cashflow tab ----------
// Forward-looking household income & outflow view: where cash comes from,
// where it goes, and what the running balance looks like over the next 8 quarters.
// Surfaces the "liquidity dip → Pine Ridge II exit → recovery" pattern that's
// typical when a household is in active alts deployment.
function CashflowTab({ navigate, accountIds }) {
  const [selectedQ, setSelectedQ] = React.useState(HOUSEHOLD_CASHFLOW[0].q);
  const [exitSlips, setExitSlips] = React.useState(false);
  const [wedding, setWedding] = React.useState(false);
  const [trustGift, setTrustGift] = React.useState(false);

  const cashPositions = analytics.filtered(accountIds).filter(p => p.assetClass === 'cash');
  const startCash = cashPositions.reduce((a, p) => a + p.mv, 0);

  // Apply selected scenarios on top of the base forecast (deep-copy so toggling re-derives cleanly).
  const cf = HOUSEHOLD_CASHFLOW.map(d => ({ ...d }));
  if (exitSlips) {
    const q4 = cf.find(c => c.q === '2027Q4');
    const q2 = cf.find(c => c.q === '2028Q2');
    if (q4 && q2) { q2.altDistributions += 7000000; q4.altDistributions -= 7000000; }
  }
  if (wedding) {
    const q = cf.find(c => c.q === '2027Q2');
    if (q) q.lifestyle -= 1500000;
  }
  if (trustGift) {
    const q = cf.find(c => c.q === '2028Q1');
    if (q) q.lifestyle -= 2000000;
  }

  // Per-quarter rollups + running cash balance
  const rows = cf.map(d => {
    const inflows  = HCF_SOURCES.filter(s => s.sign === 'in').reduce((a, s)  => a + (d[s.key] || 0), 0);
    const outflows = HCF_SOURCES.filter(s => s.sign === 'out').reduce((a, s) => a + (d[s.key] || 0), 0);
    return { ...d, inflows, outflows, net: inflows + outflows };
  });
  let bal = startCash;
  const balancePath = [startCash, ...rows.map(r => { bal += r.net; return bal; })];

  // Per-entity rollups across the 8-quarter window. Uses HCF_SOURCE_ENTITY_SPLIT
  // to attribute each source's flow proportionally to the entities that own it.
  const entityRollup = (entityId) => {
    let inflows = 0, outflows = 0;
    const sourceTotals = {};
    for (const d of cf) {
      for (const s of HCF_SOURCES) {
        const ratio = (HCF_SOURCE_ENTITY_SPLIT[s.key] || {})[entityId] || 0;
        if (ratio === 0) continue;
        const v = (d[s.key] || 0) * ratio;
        sourceTotals[s.key] = (sourceTotals[s.key] || 0) + v;
        if (s.sign === 'in') inflows += v; else outflows += v;
      }
    }
    const top = (sign) => Object.entries(sourceTotals)
      .filter(([k]) => HCF_SOURCES.find(s => s.key === k).sign === sign)
      .filter(([, v]) => Math.abs(v) > 1)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 2)
      .map(([k, v]) => ({ src: HCF_SOURCES.find(s => s.key === k), value: v }));
    return { inflows, outflows, net: inflows + outflows, topIn: top('in'), topOut: top('out') };
  };

  // Liquidity coverage: months of typical net burn the current liquid cash sustains.
  const recurringMonthlyBurn = Math.abs(rows.slice(0, 4).reduce((a, r) => a + r.net, 0)) / 12;
  const monthsCovered = recurringMonthlyBurn > 0 ? startCash / recurringMonthlyBurn : 99;

  const annualInflows  = rows.reduce((a, r) => a + r.inflows, 0)  / 2; // 8 quarters = 2 years
  const annualOutflows = Math.abs(rows.reduce((a, r) => a + r.outflows, 0)) / 2;
  const minBalance     = Math.min(...balancePath);
  const minBalanceIdx  = balancePath.indexOf(minBalance);
  const minBalanceQ    = minBalanceIdx === 0 ? 'today' : (cf[minBalanceIdx - 1] || {}).q;
  const lowCashFlag    = minBalance < 3000000;

  const anyScenario = exitSlips || wedding || trustGift;
  const ScenarioPill = ({ active, onClick, label, hint }) => (
    <button onClick={onClick} title={hint}
      className="btn"
      style={{
        background: active ? 'var(--ink)' : 'var(--surface)',
        color: active ? 'var(--bg)' : 'var(--ink)',
        borderColor: active ? 'var(--ink)' : 'var(--rule-2)',
        fontSize: 12, padding: '6px 12px', borderRadius: 999,
      }}>
      {active ? '✓ ' : ''}{label}
    </button>
  );

  return (
    <div>
      <div className="card mb-16" style={{ padding: 16, borderStyle:'dashed' }}>
        <div className="row" style={{ justifyContent:'space-between', alignItems:'center', gap: 12, flexWrap:'wrap' }}>
          <div>
            <span className="label">Scenarios</span>
            <span className="text-3" style={{ fontSize: 12, marginLeft: 10 }}>Toggle to stress-test the forecast. Chart, balance, KPIs all update live.</span>
          </div>
          <div className="row gap-8" style={{ flexWrap:'wrap' }}>
            <ScenarioPill active={exitSlips} onClick={() => setExitSlips(!exitSlips)}
              label="Pine Ridge II exit slips 6 mo"
              hint="Pushes the projected $7M Pine Ridge II exit distribution from Q4 2027 to Q2 2028."/>
            <ScenarioPill active={wedding} onClick={() => setWedding(!wedding)}
              label="Family wedding · $1.5M Q2 2027"
              hint="Adds a one-time $1.5M lifestyle outflow in Q2 2027."/>
            <ScenarioPill active={trustGift} onClick={() => setTrustGift(!trustGift)}
              label="Next-gen gift · $2M Q1 2028"
              hint="Adds a $2M family-governance distribution in Q1 2028 (gift to next generation)."/>
            {anyScenario && (
              <button className="btn ghost" style={{ fontSize: 11.5, padding:'5px 10px', borderRadius: 999 }} onClick={() => { setExitSlips(false); setWedding(false); setTrustGift(false); }}>Clear</button>
            )}
          </div>
        </div>
        {anyScenario && (
          <div className="text-3 mt-12" style={{ fontSize: 12, color:'var(--accent)' }}>
            ⚡ Forecast adjusted by scenario · <span style={{ fontWeight: 600 }}>delta to base min cash:</span> {(() => {
              let baseBal = startCash, baseMin = startCash;
              for (const d of HOUSEHOLD_CASHFLOW) {
                const inS = HCF_SOURCES.filter(s=>s.sign==='in').reduce((a,s)=>a+(d[s.key]||0),0);
                const outS = HCF_SOURCES.filter(s=>s.sign==='out').reduce((a,s)=>a+(d[s.key]||0),0);
                baseBal += inS + outS;
                if (baseBal < baseMin) baseMin = baseBal;
              }
              const delta = minBalance - baseMin;
              return (
                <span style={{ color: delta < 0 ? 'var(--neg)' : 'var(--pos)' }}>
                  {delta >= 0 ? '+' : ''}{fmt.money(delta, {compact:true})} {delta < 0 ? '(tighter)' : '(more buffer)'}
                </span>
              );
            })()}
          </div>
        )}
      </div>

      <div className="kpis">
        <div className="kpi" title="Cash + cash equivalents across in-scope accounts today." style={{ cursor:'help' }}>
          <span className="label">Starting cash</span>
          <span className="v lg">{fmt.money(startCash, {compact:true})}</span>
          <span className="text-3" style={{ fontSize: 12 }}>{cashPositions.length} cash position{cashPositions.length === 1 ? '' : 's'}</span>
        </div>
        <div className="kpi" title="Months of year-1 burn rate that current liquid cash sustains. Flags amber below 12 months." style={{ cursor:'help' }}>
          <span className="label">Liquidity coverage</span>
          <span className="v lg" style={{ color: monthsCovered < 12 ? 'var(--warn)' : 'var(--ink)' }}>{monthsCovered.toFixed(1)} mo</span>
          <span className="text-3" style={{ fontSize: 12 }}>at year-1 burn rate</span>
        </div>
        <div className="kpi" title="Average annual inflows across the 8-quarter window: dividends + bond coupons + structured coupons + MMF interest + projected alt distributions." style={{ cursor:'help' }}>
          <span className="label">Avg annual inflows</span>
          <span className="v lg" style={{ color:'var(--pos)' }}>+{fmt.money(annualInflows, {compact:true})}</span>
          <span className="text-3" style={{ fontSize: 12 }}>div + coupons + interest + dist.</span>
        </div>
        <div className="kpi" title="Average annual outflows: capital calls + investment fees + estimated taxes + lifestyle withdrawals." style={{ cursor:'help' }}>
          <span className="label">Avg annual outflows</span>
          <span className="v lg" style={{ color:'var(--neg)' }}>−{fmt.money(annualOutflows, {compact:true})}</span>
          <span className="text-3" style={{ fontSize: 12 }}>calls + fees + taxes + lifestyle</span>
        </div>
        <div className="kpi" title={`Lowest projected cash balance over the next 8 quarters. Drives whether liquidity needs to be raised proactively.`} style={{ cursor:'help' }}>
          <span className="label">Min projected cash</span>
          <span className="v lg" style={{ color: lowCashFlag ? 'var(--warn)' : 'var(--ink)' }}>{fmt.money(minBalance, {compact:true})}</span>
          <span className="text-3" style={{ fontSize: 12 }}>at {minBalanceQ}</span>
        </div>
      </div>

      <div className="section">
        <h2 className="serif">Quarterly cashflow by source</h2>
        <div className="sub">Inflows above the line, outflows below. Bond coupons stay roughly flat (Treasury and muni schedules interleave); the visible spike is Pine Ridge II's projected Q4 2027 exit distribution.</div>
        <div className="card mt-12" style={{ padding: 16 }}>
          <Charts.StackedCashflow data={cf} sources={HCF_SOURCES} height={300} formatValue={v => fmt.money(v, {compact:true})}/>
          <div className="row gap-12 mt-12" style={{ flexWrap:'wrap', fontSize: 11.5, color:'var(--ink-3)' }}>
            {HCF_SOURCES.map(s => (
              <span key={s.key} className="row gap-8"
                title={s.conf === 'high' ? 'Contractual / scheduled — high confidence' : s.conf === 'med' ? 'Rate- or market-sensitive — medium confidence' : 'Depends on actual exit events — low confidence (GP estimate)'}
                style={{ alignItems:'center', cursor:'help' }}>
                <span style={{ width:12, height:12, background:s.color, opacity:0.9, border:'1px solid var(--rule-2)' }}/>
                {s.label}
              </span>
            ))}
          </div>
          <div className="text-3 mt-12" style={{ fontSize: 11.5, fontStyle:'italic' }}>
            Forecast caveat: capital calls follow industry-typical drawdown patterns (±1–2 quarters of timing variance). Distributions, especially the Pine Ridge II Q4 2027 exit, are GP estimates — actual timing depends on M&amp;A or IPO of underlying companies and can shift materially.
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="serif">Projected cash balance</h2>
        <div className="sub">Starting from today's cash, applying every projected inflow and outflow on its quarter.</div>
        <div className="card mt-12" style={{ padding: 16 }}>
          <Charts.LineChart series={[{ name:'Cash balance', points: balancePath, color:'var(--ink)', width: 2 }]} height={180}/>
          <div className="row gap-16 mt-12" style={{ flexWrap:'wrap', fontSize: 12 }}>
            <span>Today: <span className="num">{fmt.money(startCash, {compact:true})}</span></span>
            <span className="text-3">·</span>
            <span>Min: <span className="num" style={{ color: lowCashFlag ? 'var(--warn)' : 'var(--ink)' }}>{fmt.money(minBalance, {compact:true})}</span> at {minBalanceQ}</span>
            <span className="text-3">·</span>
            <span>End ({cf[cf.length-1].q}): <span className="num">{fmt.money(balancePath[balancePath.length-1], {compact:true})}</span></span>
          </div>
          {lowCashFlag && (
            <div className="margin-note mt-16" style={{ fontSize: 13, borderLeftColor:'var(--warn)', background:'linear-gradient(to right, var(--warn-soft), transparent 60%)' }}>
              <div className="label" style={{ color:'var(--warn)' }}>Liquidity tightness</div>
              <div style={{ marginTop: 2 }}>
                Projected cash dips to {fmt.money(minBalance, {compact:true})} at {minBalanceQ} — driven mainly by Q3 2027's $3.25M of clustered calls (Pine Ridge IV yr-2 + Helios initial). Pine Ridge II's Q4 2027 exit distribution is the rebound. Buffer options: trim AAPL ahead of the dip, or hold extra T-Bill maturities into 2027Q3.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <h2 className="serif">Per-quarter detail</h2>
        <div className="sub">In, Out, Net, and the running cash balance after each quarter. Click any row to drill into that quarter's source-level breakdown below.</div>
        <div className="table-wrap mt-12">
          <table className="tbl">
            <thead>
              <tr>
                <th>Quarter</th>
                <th className="num" title="All inflows for the quarter.">In</th>
                <th className="num" title="All outflows for the quarter.">Out</th>
                <th className="num" title="Inflows + outflows.">Net</th>
                <th className="num" title="Running cash balance after the quarter.">Balance</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const isSelected = selectedQ === r.q;
                return (
                  <tr key={r.q} onClick={() => setSelectedQ(r.q)} style={{ cursor:'pointer', background: isSelected ? 'var(--accent-soft, rgba(32, 64, 128, 0.06))' : undefined }}>
                    <td className="mono" style={{ fontSize: 12, fontWeight: isSelected ? 600 : 400 }}>{r.q}</td>
                    <td className="num" style={{ color:'var(--pos)' }}>+{fmt.money(r.inflows, {compact:true})}</td>
                    <td className="num" style={{ color:'var(--neg)' }}>{fmt.money(r.outflows, {compact:true})}</td>
                    <td className="num" style={{ fontWeight:600, color: r.net < 0 ? 'var(--neg)' : 'var(--pos)' }}>{r.net >= 0 ? '+' : ''}{fmt.money(r.net, {compact:true})}</td>
                    <td className="num" style={{ color: balancePath[i+1] < 3000000 ? 'var(--warn)' : 'var(--ink)' }}>{fmt.money(balancePath[i+1], {compact:true})}</td>
                    <td className="text-3" style={{ fontSize: 11, textAlign: 'right' }}>{isSelected ? '◀ drilldown ↓' : 'open ▸'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(() => {
        const selectedRow = rows.find(r => r.q === selectedQ);
        if (!selectedRow) return null;
        const inSrc = HCF_SOURCES.filter(s => s.sign === 'in');
        const outSrc = HCF_SOURCES.filter(s => s.sign === 'out');
        const renderRow = (s) => {
          const v = selectedRow[s.key] || 0;
          if (v === 0) return (
            <div key={s.key} className="row" style={{ justifyContent:'space-between', alignItems:'center', fontSize: 12, opacity: 0.45, paddingBottom: 6 }}>
              <span><span className="dot" style={{ background: s.color }}/> {s.label}</span>
              <span className="num text-3">—</span>
            </div>
          );
          const ctx = cashflowSourceContext(s.key, selectedQ, v);
          return (
            <div key={s.key} className="row" style={{ justifyContent:'space-between', alignItems:'baseline', gap: 12, fontSize: 13, borderBottom:'1px dashed var(--rule-2)', paddingBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div><span className="dot" style={{ background: s.color }}/> {s.label}</div>
                {ctx && <div className="text-3" style={{ fontSize: 11.5, marginTop: 3, marginLeft: 18 }}>{ctx}</div>}
              </div>
              <span className="num" style={{ flex: '0 0 auto', color: s.sign === 'in' ? 'var(--pos)' : 'var(--neg)' }}>{s.sign === 'in' ? '+' : ''}{fmt.money(v, {compact:true})}</span>
            </div>
          );
        };
        return (
          <div className="section">
            <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline', gap: 12, flexWrap:'wrap' }}>
              <div>
                <h2 className="serif" style={{ margin: 0 }}>{selectedQ} drilldown</h2>
                <div className="sub" style={{ marginTop: 4 }}>Every source contributing to this quarter's flow.</div>
              </div>
              <div className="row gap-12" style={{ fontSize: 12, color:'var(--ink-3)' }}>
                <span>Net: <span className="num" style={{ color: selectedRow.net < 0 ? 'var(--neg)' : 'var(--pos)' }}>{selectedRow.net >= 0 ? '+' : ''}{fmt.money(selectedRow.net, {compact:true})}</span></span>
                <span>·</span>
                <span>Ending balance: <span className="num">{fmt.money(balancePath[rows.indexOf(selectedRow) + 1], {compact:true})}</span></span>
              </div>
            </div>
            <div className="grid-2 mt-12" style={{ gap: 20 }}>
              <div className="card" style={{ padding: 20 }}>
                <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
                  <span className="label">Inflows</span>
                  <span className="num" style={{ fontSize: 22, color:'var(--pos)' }}>+{fmt.money(selectedRow.inflows, {compact:true})}</span>
                </div>
                <hr className="divider dashed" style={{ margin:'12px 0' }}/>
                <div className="stack stack-2">{inSrc.map(renderRow)}</div>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
                  <span className="label">Outflows</span>
                  <span className="num" style={{ fontSize: 22, color:'var(--neg)' }}>{fmt.money(selectedRow.outflows, {compact:true})}</span>
                </div>
                <hr className="divider dashed" style={{ margin:'12px 0' }}/>
                <div className="stack stack-2">{outSrc.map(renderRow)}</div>
              </div>
            </div>
            <div className="text-3 mt-16" style={{ fontSize: 12 }}>
              Tip: hover the colored segments in the chart above for quick per-source amounts without needing to click a row. For the alts-specific treasury workflow, see <a onClick={()=>navigate('alts')} style={{ color:'var(--accent)', cursor:'pointer', textDecoration:'underline' }}>Alternatives → Cashflow plan</a>.
            </div>
          </div>
        );
      })()}

      <div className="section">
        <h2 className="serif">Cashflow by entity · 2-yr totals</h2>
        <div className="sub">Each entity's inflows, outflows, and net across the window.</div>
        <div className="grid-2 mt-12" style={{ gap: 16 }}>
          {ACCOUNTS.map(a => {
            const t = entityRollup(a.id);
            const fundingHint = t.net < 0
              ? 'Funded by surplus entities or new liquidity.'
              : 'Surplus available to deploy.';
            return (
              <div key={a.id} className="card" style={{ padding: 20 }}>
                <div className="row" style={{ justifyContent:'space-between', alignItems:'flex-start', gap: 12 }}>
                  <div>
                    <div className="eyebrow">{a.custodian} · {a.entity}</div>
                    <div className="serif" style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>{a.name}</div>
                    <span className="tag" style={{ marginTop: 6 }}>{a.type}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="label">Net 2-yr</div>
                    <div className="num" style={{ fontSize: 22, color: t.net < 0 ? 'var(--neg)' : 'var(--pos)' }}>{t.net >= 0 ? '+' : ''}{fmt.money(t.net, {compact:true})}</div>
                  </div>
                </div>
                <div className="row gap-16 mt-12" style={{ fontSize: 12 }}>
                  <div><div className="text-3">Inflows</div><div className="num" style={{ color:'var(--pos)' }}>+{fmt.money(t.inflows, {compact:true})}</div></div>
                  <div><div className="text-3">Outflows</div><div className="num" style={{ color:'var(--neg)' }}>{fmt.money(t.outflows, {compact:true})}</div></div>
                </div>
                <hr className="divider dashed" style={{ margin:'12px 0' }}/>
                <div className="stack stack-2" style={{ fontSize: 11.5 }}>
                  {t.topIn.length > 0 && (
                    <div>
                      <span className="text-3">Top inflows: </span>
                      {t.topIn.map((it, i) => (
                        <span key={it.src.key}>
                          <span className="dot" style={{ background: it.src.color }}/> {it.src.label} <span className="num">+{fmt.money(it.value, {compact:true})}</span>
                          {i < t.topIn.length - 1 && <span className="text-3"> · </span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {t.topOut.length > 0 && (
                    <div>
                      <span className="text-3">Top outflows: </span>
                      {t.topOut.map((it, i) => (
                        <span key={it.src.key}>
                          <span className="dot" style={{ background: it.src.color }}/> {it.src.label} <span className="num">{fmt.money(it.value, {compact:true})}</span>
                          {i < t.topOut.length - 1 && <span className="text-3"> · </span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-3 mt-12" style={{ fontSize: 11.5, fontStyle:'italic', color: t.net < 0 ? 'var(--warn)' : 'var(--ink-3)' }}>
                  {fundingHint}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-3 mt-16" style={{ fontSize: 12 }}>
          Sources attributed to their natural account home — bonds and cash sweep in trust, alt commits at JPM, equity dividends primarily in joint.
        </div>
      </div>
    </div>
  );
}

// ============ Holding Detail ============
function HoldingDetail({ symbol, navigate, holdingBackPath = 'household?holdings' }) {
  const p = POSITIONS.find(x => x.symbol === decodeURIComponent(symbol));
  if (!p) return <div className="page"><h1 className="serif">Not found</h1><button type="button" className="btn" onClick={()=>navigate(holdingBackPath)}>Back to holdings</button></div>;
  const acct = ACCOUNTS.find(a => a.id === p.account);
  const total = POSITIONS.reduce((a,b)=>a+b.mv,0);
  const pctNW = (p.mv/total)*100;
  const path = monthlyPath(80, 1.4, 2.4, p.symbol.length);
  const lots = [
    { date: '2018-04-12', qty: Math.round((p.qty||0)*0.4), basis: p.cost*0.32, term: 'LT' },
    { date: '2020-09-22', qty: Math.round((p.qty||0)*0.3), basis: p.cost*0.28, term: 'LT' },
    { date: '2022-11-08', qty: Math.round((p.qty||0)*0.2), basis: p.cost*0.24, term: 'LT' },
    { date: '2024-03-04', qty: Math.round((p.qty||0)*0.1), basis: p.cost*0.16, term: 'ST' },
  ];

  return (
    <div className="page">
      <button type="button" className="btn ghost sm mb-16" onClick={() => navigate(holdingBackPath)}>← Holdings</button>
      <div className="holding-hero">
        <div className="holding-mark">{p.symbol.slice(0,2)}</div>
        <div>
          <div className="eyebrow">{ASSET_LABELS[p.assetClass]} · {p.sector}</div>
          <div className="serif" style={{ fontSize: 36, fontWeight: 600, letterSpacing:'-0.02em', marginTop: 2 }}>{p.name}</div>
          <div className="row gap-12 mt-8 text-3"><span>{p.symbol}</span><span>·</span><span>{p.cusip}</span><span>·</span><span>{acct.custodian} · {acct.name}</span></div>
          {p.flag && <div className="margin-note mt-12" style={{ borderLeftColor:'var(--warn)', background:'linear-gradient(to right, var(--warn-soft), transparent 60%)' }}>
            <div className="label" style={{ color:'var(--warn)' }}>Flagged</div>
            <div style={{ fontSize: 13, marginTop: 2 }}>{p.flag}</div>
          </div>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="label">Market Value</div>
          <div className="num" style={{ fontSize: 36, marginTop: 2 }}>{fmt.money(p.mv, { compact: true })}</div>
          <div className="text-3" style={{ fontSize: 12, marginTop: 4 }}>{pctNW.toFixed(2)}% of household</div>
        </div>
      </div>
      <div className="kpis mt-24">
        <div className="kpi" title="Number of shares (or units) held." style={{ cursor:'help' }}><span className="label">Quantity</span><span className="v">{p.qty == null ? '—' : fmt.num(p.qty)}</span></div>
        <div className="kpi" title="Cost basis — total amount originally paid for this position. Determines tax when sold." style={{ cursor:'help' }}><span className="label">Cost basis</span><span className="v">{fmt.money(p.cost, { compact: true })}</span></div>
        <div className="kpi" title="Market value − cost basis. Not yet taxable until realized via a sale." style={{ cursor:'help' }}><span className="label">Unrealized</span><span className="v" style={{ color: p.mv > p.cost ? 'var(--pos)' : 'var(--neg)' }}>{fmt.money(p.mv - p.cost, { compact: true })}</span><Delta v={((p.mv-p.cost)/p.cost)*100} dp={1}/></div>
        <div className="kpi" title="Average price paid per share across all tax lots." style={{ cursor:'help' }}><span className="label">Avg cost / share</span><span className="v">{p.qty ? '$' + (p.cost/p.qty).toFixed(2) : '—'}</span></div>
      </div>
      <div className="section grid-2">
        <div>
          <h2 className="serif">Price · 36 months</h2>
          <div className="card" style={{ padding: 16 }}><Charts.LineChart series={[{ name:'Price', points: path, color:'var(--ink)', width: 2 }]} height={200}/></div>
        </div>
        <div>
          <h2 className="serif">Tax lots</h2>
          <div className="card" style={{ padding: 16 }}>
            <table className="subtle-tbl">
              <thead><tr><th title="Acquisition date — when this lot was purchased.">Acq date</th><th>Qty</th><th className="num" title="Cost basis for this lot — what was paid.">Basis</th><th className="num" title="Unrealized gain/loss on this lot at current price.">Unreal</th><th title="Tax term: LT (long-term, held >1 year, lower rate); ST (short-term, ≤1 year, taxed as ordinary income).">Term</th></tr></thead>
              <tbody>
                {lots.map((l, i) => {
                  const lotMv = p.qty ? (l.qty / p.qty) * p.mv : 0;
                  return (
                    <tr key={i}>
                      <td className="mono" style={{ fontSize: 12 }}>{l.date}</td>
                      <td>{fmt.num(l.qty)}</td>
                      <td className="num">{fmt.money(l.basis, { compact: true })}</td>
                      <td className="num" style={{ color: lotMv > l.basis ? 'var(--pos)' : 'var(--neg)' }}>{fmt.money(lotMv - l.basis, { compact: true })}</td>
                      <td><span className="tag" style={{ padding:'1px 6px' }}>{l.term}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Insights ============
function InsightsScreen({ navigate, accountIds, embedded, clientView = false, bookInsightsMode = false, workspaceClientId = null, useBookInsightRoutes = false }) {
  const [bookClientFilter, setBookClientFilter] = React.useState(null);

  const bookClientPillIds = React.useMemo(() => {
    const ids = [...new Set(INSIGHTS.map(insightHouseholdId))];
    const book = CLIENT_BOOK || [];
    ids.sort((a, b) => {
      const na = book.find(c => c.id === a)?.name || a;
      const nb = book.find(c => c.id === b)?.name || b;
      return na.localeCompare(nb);
    });
    return ids;
  }, []);

  const filtered = React.useMemo(() => {
    if (bookInsightsMode) {
      let pool = INSIGHTS;
      if (bookClientFilter != null) {
        pool = pool.filter(i => insightHouseholdId(i) === bookClientFilter);
      }
      return pool;
    }
    let pool = INSIGHTS.filter(i => {
      if (workspaceClientId && insightHouseholdId(i) !== workspaceClientId) return false;
      return true;
    });
    if (accountIds && accountIds.length) {
      pool = pool.filter(i => (i.accountsAffected || []).some(a => accountIds.includes(a)));
    }
    return pool;
  }, [bookInsightsMode, bookClientFilter, accountIds, workspaceClientId]);

  const openInsightDetail = React.useCallback((i) => {
    if (bookInsightsMode && useBookInsightRoutes) {
      navigate(`insights/${i.id}`);
      return;
    }
    if (bookInsightsMode) {
      navigate(`clients/${insightHouseholdId(i)}/insights/${i.id}`);
      return;
    }
    navigate('insights/' + i.id);
  }, [bookInsightsMode, useBookInsightRoutes, navigate]);

  const total = filtered.reduce((acc, i) => ({
    reposition: acc.reposition + (i.impact.reposition || 0),
    taxSaved: acc.taxSaved + (i.impact.taxSaved || 0),
    incomeLift: acc.incomeLift + (i.impact.incomeLift || 0),
  }), { reposition: 0, taxSaved: 0, incomeLift: 0 });
  const headline = clientView
    ? (filtered.length === 1 ? '1 topic for your household.' : `${filtered.length} topics for your household.`)
    : bookInsightsMode
      ? (bookClientFilter == null
        ? (filtered.length === 1 ? '1 signal across the book.' : `${filtered.length} signals across the book.`)
        : (filtered.length === 1 ? '1 signal for this household.' : `${filtered.length} signals for this household.`))
      : (filtered.length === 1
        ? '1 thing to discuss with the client.'
        : `${filtered.length} things to discuss with the client.`);

  return (
    <div className={embedded ? 'insights-embedded' : 'page'}>
      {bookInsightsMode ? (
        <div className={`insights-book-head${embedded && bookInsightsMode ? ' insights-book-head--embedded' : ''}`}>
          <div className="insights-book-head-text">
            <div className="eyebrow">Book-wide signals</div>
            <h1 className={`serif${embedded && bookInsightsMode ? ' insights-book-h1-embedded' : ''}`}>AI Insights</h1>
            <p className="text-2 mt-8 insights-book-sub" style={{ maxWidth: 640 }}>
              Cross-household signals — drift, tax, cash drag, and IPS breaches across the book. Filter by client or review everyone at once.
            </p>
          </div>
          <div className="insights-book-pills row gap-8" role="group" aria-label="Filter insights by client">
            <button
              type="button"
              className={bookClientFilter == null ? 'btn sm' : 'btn ghost sm'}
              onClick={() => setBookClientFilter(null)}
            >
              All clients
            </button>
            {bookClientPillIds.map(cid => {
              const name = (CLIENT_BOOK || []).find(c => c.id === cid)?.name || cid;
              const active = bookClientFilter === cid;
              return (
                <button
                  key={cid}
                  type="button"
                  className={active ? 'btn sm' : 'btn ghost sm'}
                  onClick={() => setBookClientFilter(active ? null : cid)}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {!embedded && !bookInsightsMode && (
        <div className="page-header">
          <div>
            <div className="eyebrow">Household · review prep</div>
            <h1 className="serif">{headline}</h1>
            <p className="text-2 mt-8" style={{ maxWidth: 640 }}>
              Surfaced from the parsed statements. Each is independently sound; together they form a single 18-month plan.
            </p>
          </div>
          <span className="tag accent">For Mon 1:1</span>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card" style={{ padding: 28, textAlign:'center', color:'var(--ink-3)' }}>
          {bookInsightsMode
            ? (bookClientFilter == null
              ? 'No book-wide insights are available in this demo.'
              : 'No insights for that client with the current filter.')
            : <>No insights for the selected entities. Clear the filter to see all {INSIGHTS.length}.</>}
        </div>
      )}

      <div className={embedded && clientView ? 'insights-cards-stack' : 'grid-3'}>
        {filtered.map(i => {
          const priorityTier = i.priority === 'high' ? 'high' : i.priority === 'medium' ? 'med' : 'low';
          const priorityLabel = i.priority === 'high' ? 'High' : i.priority === 'medium' ? 'Medium' : 'Low';
          const kindTagClass = i.priority === 'high' ? 'neg' : i.priority === 'medium' ? 'warn' : 'insight-kind-low';
          return (
          <div key={i.id} className={`insight priority-${priorityTier}`}
               onClick={() => openInsightDetail(i)} style={{ cursor:'pointer' }}>
            <div className="insight-card-head row gap-8">
              <span className={`tag ${kindTagClass}`}>{String(i.kind).toUpperCase()}</span>
              <span className={`insight-priority-pill insight-priority-pill--${priorityTier}`}>{priorityLabel}</span>
            </div>
            {bookInsightsMode ? (
              <span className="tag accent insight-client-chip">{insightHouseholdName(i)}</span>
            ) : null}
            <h3 className="serif" style={{ margin: '4px 0 0', fontSize: 19, fontWeight: 600, lineHeight: 1.2 }}>{i.title}</h3>
            <p className="text-2" style={{ fontSize: 13, margin: 0 }}>{i.body}</p>
            <hr className="divider dashed"/>
            <div className="insight-card-foot row">
              <div className="row gap-16 insight-card-metrics">
                {i.impact.reposition ? (<div><div className="label">Repositioned</div><div className="num">{fmt.money(i.impact.reposition,{compact:true})}</div></div>) : null}
                {i.impact.taxSaved ? (<div><div className="label">Tax saved</div><div className="num" style={{ color: 'var(--pos)' }}>{fmt.money(i.impact.taxSaved,{compact:true})}</div></div>) : null}
                {i.impact.incomeLift ? (<div><div className="label">Income</div><div className="num" style={{ color: 'var(--pos)' }}>+{fmt.money(i.impact.incomeLift,{compact:true})}/yr</div></div>) : null}
              </div>
              <button type="button" className="btn sm insight-open-thread" onClick={(e) => { e.stopPropagation(); openInsightDetail(i); }}>
                Open thread <span dangerouslySetInnerHTML={{__html: Icons.arrow}}/>
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {filtered.length > 0 && !embedded ? (
        <div className="card mt-32" style={{ padding: 28, background: 'var(--ink)', color: 'var(--bg)', borderColor: 'var(--ink)' }}>
          <div className="label" style={{ color: 'var(--ink-4)' }}>{filtered.length > 1 ? 'Run together · 18-month plan' : 'Plan'}</div>
          <div className="serif" style={{ fontSize: 28, fontWeight: 600, marginTop: 6 }}>
            {fmt.money(total.reposition, {compact:true})} repositioned · {fmt.money(total.taxSaved, {compact:true})} tax saved · +{fmt.money(total.incomeLift, {compact:true})}/yr income.
          </div>
          <div className="row gap-12 mt-16">
            <button className="btn" style={{ background:'var(--bg)', color:'var(--ink)', borderColor:'var(--bg)' }}>Build proposal</button>
            <button className="btn ghost" style={{ background:'transparent', color:'var(--bg)', borderColor:'var(--ink-3)' }}>Draft client memo</button>
          </div>
        </div>
      ) : null}
      {filtered.length > 0 && embedded ? (
        <div className="card mt-32" style={{ padding: 24 }}>
          <div className="label">Combined impact</div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginTop: 8, lineHeight: 1.3 }}>
            {fmt.money(total.reposition, {compact:true})} repositioned · {fmt.money(total.taxSaved, {compact:true})} tax saved · +{fmt.money(total.incomeLift, {compact:true})}/yr income.
          </div>
          <p className="text-3 mt-12" style={{ fontSize: 13 }}>
            {clientView ? 'Your advisor can walk through how these ideas fit your plan.' : 'Open each card for details and next steps.'}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function InsightDetail({ id, navigate, clientView = false }) {
  const i = INSIGHTS.find(x => x.id === id);
  if (!i) return <div className="page"><h1 className="serif">Not found</h1><button type="button" className="btn" onClick={()=>navigate('insights')}>Back</button></div>;
  const priorityTier = i.priority === 'high' ? 'high' : i.priority === 'medium' ? 'med' : 'low';
  const priorityLabel = i.priority === 'high' ? 'High' : i.priority === 'medium' ? 'Medium' : 'Low';
  const kindTagClass = i.priority === 'high' ? 'neg' : i.priority === 'medium' ? 'warn' : 'insight-kind-low';
  const advisorName = HOUSEHOLD.rm || 'your advisor';

  return (
    <div className="page">
      <button type="button" className="btn ghost sm mb-16" onClick={() => navigate('insights')}>← {clientView ? 'Insights' : 'All insights'}</button>
      <div className="page-header">
        <div>
          <div className="insight-card-head row gap-8" style={{ flexWrap: 'wrap' }}>
            <span className={`tag ${kindTagClass}`}>{String(i.kind).toUpperCase()}</span>
            <span className={`insight-priority-pill insight-priority-pill--${priorityTier}`}>{priorityLabel}</span>
          </div>
          <h1 className="serif" style={{ marginTop: 12 }}>{i.title}</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 720 }}>{i.body}</p>
        </div>
      </div>
      <div className="kpis">
        {i.impact.reposition ? <div className="kpi" title="Capital being moved within the household as a result of this insight." style={{ cursor:'help' }}><span className="label">{clientView ? 'Illustrative repositioning' : 'Repositioned'}</span><span className="v lg">{fmt.money(i.impact.reposition,{compact:true})}</span></div> : null}
        {i.impact.taxSaved ? <div className="kpi" title="Estimated tax saved by acting on this insight (loss harvesting, deferral, charitable basis, etc.)." style={{ cursor:'help' }}><span className="label">Tax saved</span><span className="v lg" style={{ color:'var(--pos)' }}>{fmt.money(i.impact.taxSaved,{compact:true})}</span></div> : null}
        {i.impact.incomeLift ? <div className="kpi" title="Estimated additional annual income from this action." style={{ cursor:'help' }}><span className="label">Income lift</span><span className="v lg" style={{ color:'var(--pos)' }}>+{fmt.money(i.impact.incomeLift,{compact:true})}/yr</span></div> : null}
        <div className="kpi" title="Slate's confidence in the surfaced fact and recommended actions." style={{ cursor:'help' }}><span className="label">Confidence</span><span className="v lg">High</span></div>
      </div>
      <div className="section">
        <h2 className="serif">{clientView ? 'What your advisor may suggest' : 'Recommended actions'}</h2>
        {clientView ? (
          <p className="text-3 insight-detail-client-lede" style={{ fontSize: 13, marginTop: 4, maxWidth: 720 }}>
            These are example strategies {advisorName} might bring up—conversation starters for your next review, not steps to take on your own.
          </p>
        ) : null}
        <div className="stack stack-3 mt-12">
          {i.actions.map((a, idx) => (
            <div key={idx} className="card insight-detail-action-row" style={{ padding: 16, display:'flex', gap:14, alignItems:'flex-start' }}>
              <div className="num" style={{ fontSize: 22, color: 'var(--ink-3)', minWidth: 30 }}>0{idx+1}</div>
              <div style={{ flex: 1 }} dangerouslySetInnerHTML={{__html: a}}/>
              {clientView ? (
                <button type="button" className="btn ghost sm insight-detail-row-cta">Discuss with advisor</button>
              ) : (
                <button type="button" className="btn sm insight-detail-row-cta">Add to plan</button>
              )}
            </div>
          ))}
        </div>
      </div>
      {clientView ? (
        <div className="action-bar insight-detail-action-bar--client">
          <p className="insight-detail-action-bar__lede text-3">
            Want to go deeper? Ask {advisorName} how this fits your goals, taxes, and timeline.
          </p>
          <button type="button" className="btn primary">Message {advisorName}</button>
        </div>
      ) : (
        <div className="action-bar">
          <button type="button" className="btn">Draft client memo</button>
          <button type="button" className="btn primary">Add to proposal <span dangerouslySetInnerHTML={{__html: Icons.arrow}}/></button>
        </div>
      )}
    </div>
  );
}

// ============ Briefing ============
// The daily prep view. RM lands here first thing; it's what's open in the background
// during a client call. Designed so a colleague picking up the file (RM is on PTO)
// can read the relationship in 60 seconds.
function BriefingScreen({ navigate }) {
  const b = HOUSEHOLD_BRIEFING;
  const NW = POSITIONS.reduce((a, p) => a + p.mv, 0);
  const openFollowUps     = b.followUps.filter(f => f.status !== 'completed');
  const closedFollowUps   = b.followUps.filter(f => f.status === 'completed');
  const overdueFollowUps  = openFollowUps.filter(f => isPast(f.due));
  const thisWeekEvents    = b.upcoming.filter(e => daysFrom(e.date) <= 7 && daysFrom(e.date) >= 0);
  const highPriorityWeek  = thisWeekEvents.filter(e => e.priority === 'high');
  const nextMtgDays       = daysFrom(b.nextMeeting.date);
  const lastContactDays   = -daysFrom(b.contactLog[0].date);
  const KIND_TAG = {
    deadline:'tag warn', personal:'tag', rfq:'tag accent', meeting:'tag accent',
    close:'tag', tax:'tag warn', obs:'tag', email:'tag', call:'tag', note:'tag',
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">{fmtLong(TODAY)} · 14:08 ET</div>
          <h1 className="serif">Today · {HOUSEHOLD.name}</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 720 }}>
            {HOUSEHOLD.segment} · relationship since {HOUSEHOLD.founded} · {ACCOUNTS.length} accounts · NW {fmt.money(NW, {compact:true})} · RM {HOUSEHOLD.rm}.
          </p>
        </div>
        <div className="meta">
          <span className="label">Last contact</span>
          <span className="num" style={{ fontSize: 22 }}>{lastContactDays}d ago</span>
          <span className="label">Next meeting in</span>
          <span className="num" style={{ fontSize: 22, color: nextMtgDays <= 7 ? 'var(--accent)' : 'var(--ink)' }}>{nextMtgDays}d</span>
        </div>
      </div>

      <div className="section">
        <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
          <h2 className="serif">Needs attention</h2>
          <span className="text-3" style={{ fontSize: 12 }}>
            {overdueFollowUps.length} overdue · {highPriorityWeek.length} high-priority this week
          </span>
        </div>
        <div className="card mt-12" style={{ padding: 0 }}>
          {overdueFollowUps.map(f => (
            <div key={f.id} className="row" style={{ padding:'14px 18px', borderBottom:'1px solid var(--rule-2)', justifyContent:'space-between', alignItems:'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row gap-12" style={{ alignItems:'center' }}>
                  <span className="tag neg">overdue · {-daysFrom(f.due)}d</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{f.commit}</span>
                </div>
                <div className="text-3" style={{ fontSize: 11.5, marginTop: 4 }}>{f.owner} · was due {fmtShort(f.due)}</div>
              </div>
              <button className="btn ghost sm">Open</button>
            </div>
          ))}
          {b.upcoming.filter(e => e.priority === 'high' && daysFrom(e.date) <= 14 && daysFrom(e.date) >= 0).map((e, i) => (
            <div key={i} className="row" style={{ padding:'14px 18px', borderBottom: i < 99 ? '1px solid var(--rule-2)' : 'none', justifyContent:'space-between', alignItems:'center', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row gap-12" style={{ alignItems:'center' }}>
                  <span className="tag warn">in {daysFrom(e.date)}d</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{e.label}</span>
                </div>
                <div className="text-3" style={{ fontSize: 11.5, marginTop: 4 }}>{fmtShort(e.date)} · {e.kind}</div>
              </div>
              <button className="btn ghost sm">Open</button>
            </div>
          ))}
        </div>
      </div>

      <div className="section grid-2" style={{ gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
            <span className="label">Next meeting</span>
            <span className="text-3 mono" style={{ fontSize: 12 }}>in {nextMtgDays}d</span>
          </div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginTop: 6, lineHeight: 1.2 }}>{b.nextMeeting.type}</div>
          <div className="text-3 mt-8" style={{ fontSize: 13 }}>{fmtLong(b.nextMeeting.date)} · {b.nextMeeting.time}</div>
          <div className="text-3" style={{ fontSize: 13 }}>{b.nextMeeting.location}</div>
          <hr className="divider dashed" style={{ margin:'14px 0' }}/>
          <div className="label">Attendees</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>{b.nextMeeting.attendees.join(' · ')}</div>
          <div className="label mt-12">Agenda</div>
          <ul style={{ margin:'4px 0 0', paddingLeft: 16, fontSize: 13, lineHeight: 1.7 }}>
            {b.nextMeeting.agenda.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
          <div className="row gap-8 mt-16">
            <button className="btn">Build prep deck</button>
            <button className="btn ghost">Reschedule</button>
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
            <span className="label">Last meeting</span>
            <span className="text-3 mono" style={{ fontSize: 12 }}>{-daysFrom(b.lastMeeting.date)}d ago</span>
          </div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginTop: 6, lineHeight: 1.2 }}>{b.lastMeeting.type}</div>
          <div className="text-3 mt-8" style={{ fontSize: 13 }}>{fmtLong(b.lastMeeting.date)} · {b.lastMeeting.attendees.join(', ')}</div>
          <hr className="divider dashed" style={{ margin:'14px 0' }}/>
          <div className="text-2" style={{ fontSize: 13, lineHeight: 1.55 }}>{b.lastMeeting.summary}</div>
          <div className="text-3 mt-12" style={{ fontSize: 12 }}>
            {closedFollowUps.length} of {b.followUps.length} follow-ups closed since.
          </div>
        </div>
      </div>

      <div className="section">
        <div className="row" style={{ justifyContent:'space-between', alignItems:'baseline' }}>
          <h2 className="serif">Open follow-ups</h2>
          <span className="text-3" style={{ fontSize: 12 }}>{openFollowUps.length} open · {closedFollowUps.length} closed</span>
        </div>
        <div className="table-wrap mt-12">
          <table className="tbl">
            <thead>
              <tr>
                <th></th>
                <th>Commitment</th>
                <th>Owner</th>
                <th>Due</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {b.followUps.map(f => {
                const overdue = isPast(f.due) && f.status !== 'completed';
                return (
                  <tr key={f.id}>
                    <td style={{ width: 24 }}>
                      <span className={`dot ${f.status === 'completed' ? '' : overdue ? 'warn' : f.priority === 'high' ? 'neg' : 'ink'}`}/>
                    </td>
                    <td style={{ fontSize: 13, textDecoration: f.status === 'completed' ? 'line-through' : 'none', opacity: f.status === 'completed' ? 0.55 : 1 }}>{f.commit}</td>
                    <td className="text-3" style={{ fontSize: 12 }}>{f.owner}</td>
                    <td>
                      <div className="mono" style={{ fontSize: 12 }}>{fmtShort(f.due)}</div>
                      <div className="text-3" style={{ fontSize: 10.5, color: overdue ? 'var(--neg)' : 'var(--ink-3)' }}>
                        {f.status === 'completed' ? 'closed' : overdue ? `${-daysFrom(f.due)}d overdue` : daysFrom(f.due) === 0 ? 'today' : `in ${daysFrom(f.due)}d`}
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${f.status === 'completed' ? 'pos' : f.status === 'in_progress' ? 'accent' : overdue ? 'neg' : ''}`}>{f.status.replace('_', ' ')}</span>
                    </td>
                    <td><button className="btn ghost sm">Open</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2 className="serif">Upcoming · 30 days</h2>
        <div className="sub">Compliance dates, deal closes, observations, personal events.</div>
        <div className="card mt-12" style={{ padding: 0 }}>
          {b.upcoming.map((e, i) => (
            <div key={i} className="row" style={{ padding:'12px 18px', borderBottom: i < b.upcoming.length - 1 ? '1px solid var(--rule-2)' : 'none', alignItems:'center', gap: 12 }}>
              <span className="mono" style={{ fontSize: 12, width: 80, color:'var(--ink-3)' }}>{fmtShort(e.date)}</span>
              <span className={KIND_TAG[e.kind] || 'tag'} style={{ minWidth: 90, justifyContent:'center' }}>{e.kind}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{e.label}</span>
              <span className="text-3 mono" style={{ fontSize: 11, width: 70, textAlign:'right' }}>+{daysFrom(e.date)}d</span>
            </div>
          ))}
        </div>
      </div>

      <div className="section grid-2" style={{ gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="serif" style={{ margin: 0, fontSize: 16 }}>Family</h3>
          <hr className="divider dashed" style={{ margin:'12px 0' }}/>
          <div className="stack stack-2" style={{ fontSize: 13 }}>
            <div><b>{b.family.primary.name}</b><span className="text-3"> · {b.family.primary.role} · {b.family.primary.age}</span></div>
            <div><b>{b.family.spouse.name}</b><span className="text-3"> · {b.family.spouse.role} · {b.family.spouse.age}</span></div>
            {b.family.children.map((c, i) => (
              <div key={i}><b>{c.name}</b><span className="text-3"> · {c.age} · {c.status}</span></div>
            ))}
          </div>
          <hr className="divider dashed" style={{ margin:'16px 0 8px' }}/>
          <div className="label" style={{ marginBottom: 6 }}>Notes</div>
          <ul style={{ fontSize: 12, paddingLeft: 16, color:'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
            {b.personalNotes.slice(0, 3).map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="serif" style={{ margin: 0, fontSize: 16 }}>Team & advisors</h3>
          <hr className="divider dashed" style={{ margin:'12px 0' }}/>
          <div className="label">Slate team</div>
          <div className="stack stack-2 mt-8" style={{ fontSize: 13 }}>
            {b.team.map((t, i) => (
              <div key={i}><b>{t.name}</b><span className="text-3"> · {t.role}{t.primary ? ' · primary' : ''}</span></div>
            ))}
          </div>
          <hr className="divider dashed" style={{ margin:'16px 0 12px' }}/>
          <div className="label">External advisors</div>
          <div className="stack stack-2 mt-8" style={{ fontSize: 13 }}>
            {b.external.map((e, i) => (
              <div key={i}><b>{e.role}</b><span className="text-3"> · {e.name}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="section grid-2" style={{ gap: 20 }}>
        <div>
          <h2 className="serif">Recent contact</h2>
          <div className="sub">Last 30 days.</div>
          <div className="card mt-12" style={{ padding: 0 }}>
            {b.contactLog.map((c, i) => (
              <div key={i} className="row" style={{ padding:'12px 18px', borderBottom: i < b.contactLog.length - 1 ? '1px solid var(--rule-2)' : 'none', alignItems:'baseline', gap: 12 }}>
                <span className="mono" style={{ fontSize: 12, width: 60, color:'var(--ink-3)' }}>{fmtShort(c.date)}</span>
                <span className="tag" style={{ minWidth: 64, justifyContent:'center', fontSize: 10.5 }}>{c.kind}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{c.subject}<span className="text-3" style={{ fontSize: 11.5, marginLeft: 6 }}>· {c.with}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="serif">Portfolio news</h2>
          <div className="sub">Headlines on held positions.</div>
          <div className="card mt-12" style={{ padding: 0 }}>
            {b.news.map((n, i) => (
              <div key={i} className="row" style={{ padding:'12px 18px', borderBottom: i < b.news.length - 1 ? '1px solid var(--rule-2)' : 'none', alignItems:'baseline', gap: 12 }}>
                <span className="mono" style={{ fontSize: 12, width: 60, color:'var(--ink-3)' }}>{fmtShort(n.date)}</span>
                <span className={`tag ${n.impact === 'positive' ? 'pos' : n.impact === 'caution' ? 'warn' : ''}`} style={{ minWidth: 64, justifyContent:'center', fontSize: 10.5 }}>{n.position}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{n.headline}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button className="btn ghost">Open thread</button>
        <button className="btn ghost">Log contact</button>
        <button className="btn primary">Build prep deck <span dangerouslySetInnerHTML={{__html: Icons.arrow}}/></button>
      </div>
    </div>
  );
}

window.Slate.Screens = { HouseholdScreen, HoldingDetail, InsightsScreen, InsightDetail, BriefingScreen };
