// Slate — Intake screens: workspace entry, Upload (empty state), Parsing, Parse Review

const { Icons, fmt, STATEMENTS, POSITIONS, ACCOUNTS, HOUSEHOLD } = window.Slate;
const BRAND = window.Slate.BRAND || {
  lockupLight: '../brand/slate-lockup-light.png?v=2',
  lockupDark: '../brand/slate-lockup-dark.png?v=2',
  faviconLight: '../brand/favicon.png',
  faviconDark: '../brand/favicon-dark.png',
  appleTouchIcon: '../brand/apple-touch-icon.png',
};

/** First visit: minimal entry — logo + one decision, not a tutorial deck. */
function WorkspaceStartScreen({ hasPortfolio, onOpenWorkspace, onGoToToday, onSimulateIntake }) {
  if (hasPortfolio) {
    return (
      <div className="page workspace-start" style={{ maxWidth: 520, margin: '36px auto' }}>
        <div className="workspace-start-logo-wrap">
          <img src={BRAND.lockupLight} alt="" className="workspace-start-logo workspace-lockup-light" width={304} height={76} decoding="async"/>
          <img src={BRAND.lockupDark} alt="" className="workspace-start-logo workspace-lockup-dark" width={304} height={76} decoding="async" aria-hidden="true"/>
        </div>
        <h1 className="serif" style={{ marginTop: 18, textWrap: 'balance' }}>Continue to Today</h1>
        <p className="text-2 mt-8" style={{ lineHeight: 1.55 }}>
          {HOUSEHOLD.name} is loaded in this session.
        </p>
        <div className="row gap-12 mt-24" style={{ flexWrap: 'wrap' }}>
          <button type="button" className="btn primary" onClick={onGoToToday}>Today <span dangerouslySetInnerHTML={{ __html: Icons.arrow }}/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="page workspace-start" style={{ maxWidth: 560, margin: '32px auto' }}>
      <div className="workspace-start-logo-wrap">
        <img src={BRAND.lockupLight} alt="" className="workspace-start-logo workspace-lockup-light" width={328} height={82} decoding="async"/>
        <img src={BRAND.lockupDark} alt="" className="workspace-start-logo workspace-lockup-dark" width={328} height={82} decoding="async" aria-hidden="true"/>
      </div>
      <div className="eyebrow mt-16">Illustrative workspace</div>
      <h1 className="serif" style={{ marginTop: 6, textWrap: 'balance' }}>{HOUSEHOLD.name}</h1>
      <p className="text-2 mt-8" style={{ maxWidth: 480, lineHeight: 1.55 }}>
        {HOUSEHOLD.segment} · est. {HOUSEHOLD.founded} · {ACCOUNTS.length} accounts
      </p>

      <div className="row gap-12 mt-24" style={{ flexWrap: 'wrap' }}>
        <button type="button" className="btn primary" onClick={onOpenWorkspace}>Open workspace <span dangerouslySetInnerHTML={{ __html: Icons.arrow }}/></button>
        <button type="button" className="btn ghost" onClick={onSimulateIntake}>Statement intake</button>
      </div>
    </div>
  );
}

function UploadScreen({ onUpload }) {
  const [over, setOver] = React.useState(false);
  let intakeFor = null;
  try { intakeFor = sessionStorage.getItem('slate-intake-client-name'); } catch (e) { /* ignore */ }
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Step 1 of 3</div>
          <h1 className="serif">Bring in a portfolio.</h1>
          {intakeFor && (
            <p className="text-2" style={{ maxWidth: 620, marginTop: 8 }}>
              New household: <strong>{intakeFor}</strong> — add statements below to parse and open the workspace.
            </p>
          )}
          <p className="text-2" style={{ maxWidth: 620, marginTop: intakeFor ? 6 : 8 }}>
            Drop one or more PDF brokerage statements. Slate parses them in seconds, reconciles across custodians, and builds the dashboards.
          </p>
        </div>
        <div className="meta" style={{ maxWidth: 360 }}>
          <span className="label">Supported custodians</span>
          <span style={{ textAlign: 'right' }}>Schwab · Fidelity · Pershing<br/>JPM Private · BNY · Morgan Stanley</span>
        </div>
      </div>

      <div
        className={`dropzone ${over ? 'over' : ''}`}
        onDragOver={e => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); onUpload(); }}
      >
        <span dangerouslySetInnerHTML={{ __html: Icons.upload }} style={{ color: 'var(--accent)' }} />
        <div className="serif" style={{ fontSize: 26, fontWeight: 600, textWrap: 'balance' }}>Drop PDF statements here</div>
        <div className="text-2" style={{ maxWidth: 520 }}>
          or{' '}
          <button type="button" className="intake-browse-link" onClick={onUpload}>browse files</button>
          . Up to 200 MB total.
          Slate uses on-device OCR with no statements stored on disk.
        </div>
        <div className="row gap-8 mt-12">
          <span className="tag">256-bit encryption</span>
          <span className="tag">SOC 2 Type II</span>
          <span className="tag">Audit log</span>
        </div>
      </div>

      <div className="grid-3 mt-40">
        <div className="card" style={{ padding: 22 }}>
          <div className="label">Step 1</div>
          <div className="serif" style={{ fontSize: 20, marginTop: 4, fontWeight: 600 }}>Upload</div>
          <p className="text-2 mt-8" style={{ fontSize: 13 }}>Drop a PDF — any custodian. Multi-page, scanned, or native. We handle them all.</p>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="label">Step 2</div>
          <div className="serif" style={{ fontSize: 20, marginTop: 4, fontWeight: 600 }}>Review &amp; confirm</div>
          <p className="text-2 mt-8" style={{ fontSize: 13 }}>We surface anything we couldn't auto-resolve — alt funds, missing lots, duplicates.</p>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="label">Step 3</div>
          <div className="serif" style={{ fontSize: 20, marginTop: 4, fontWeight: 600 }}>Discuss with the client</div>
          <p className="text-2 mt-8" style={{ fontSize: 13 }}>Slate flags concentration, tax, and cash-drag opportunities before your next meeting.</p>
        </div>
      </div>
    </div>
  );
}

function ParsingScreen({ onDone }) {
  const [step, setStep] = React.useState(0);
  const steps = [
    'Extracting text from 38 pages…',
    'Reconciling 4 custodians…',
    'Matching CUSIPs to security master…',
    'Computing cost basis &amp; lots…',
    'Running anomaly detection…',
  ];
  React.useEffect(() => {
    if (step >= steps.length) { setTimeout(onDone, 600); return; }
    const t = setTimeout(() => setStep(s => s + 1), 850);
    return () => clearTimeout(t);
  }, [step]);

  const pct = Math.min(100, ((step + 1) / steps.length) * 100);

  return (
    <div className="page" style={{ maxWidth: 760, margin: '60px auto' }}>
      <div className="eyebrow">Step 2 of 3 · Parsing</div>
      <h1 className="serif" style={{ fontFamily:'var(--font-display)', fontSize: 38, margin:'8px 0 4px' }}>Reading 4 statements.</h1>
      <p className="text-2">Should take about six seconds.</p>
      <div className="progress mt-24"><div style={{ width: pct + '%' }}/></div>
      <div className="mt-24 stack stack-3">
        {steps.map((s, i) => (
          <div key={i} className="row gap-12" style={{ alignItems:'center', opacity: i <= step ? 1 : 0.4 }}>
            <div style={{
              width:18, height:18, borderRadius:'50%',
              border: '1px solid ' + (i < step ? 'var(--pos)' : 'var(--rule-2)'),
              background: i < step ? 'var(--pos)' : i === step ? 'var(--surface)' : 'transparent',
              display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'
            }}>
              {i < step && <span dangerouslySetInnerHTML={{__html: Icons.check}}/>}
              {i === step && <span style={{
                width:6, height:6, borderRadius:'50%', background:'var(--accent)',
                animation:'pulse 1s infinite'
              }}/>}
            </div>
            <span dangerouslySetInnerHTML={{__html: s}}/>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div className="row gap-8 mt-32">
        {STATEMENTS.map(s => (
          <div key={s.id} className="card" style={{ padding: 12, flex: 1, display:'flex', gap:10, alignItems:'center' }}>
            <span dangerouslySetInnerHTML={{__html: Icons.file}} style={{ color:'var(--ink-3)' }}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.file}</div>
              <div className="label">{s.pages}p · {fmt.money(s.value, {compact:true})}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewScreen({ onConfirm }) {
  const [filter, setFilter] = React.useState('all');
  const flagged = POSITIONS.filter(p => p.flag);
  const filtered = filter === 'flagged' ? flagged : POSITIONS;
  const total = POSITIONS.reduce((a, b) => a + b.mv, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Step 3 of 3 · Parse review</div>
          <h1 className="serif">We read 4 statements. Confirm what we found.</h1>
          <p className="text-2 mt-8" style={{ maxWidth: 640 }}>
            Pulled from PDFs uploaded today at 14:02. Highlighted rows need your eye — names that didn't auto-match, lots without cost basis, or values that crossed a threshold.
          </p>
        </div>
        <div className="meta" title="Slate's confidence that the parsed positions match the source statements." style={{ cursor:'help' }}>
          <span className="label">Confidence</span>
          <span className="num" style={{ fontSize: 22 }}>94%</span>
          <span className="label">{POSITIONS.length} positions · {fmt.money(total, {compact:true})}</span>
        </div>
      </div>

      <div className="row gap-12 mb-16" style={{ alignItems:'center' }}>
        <div className="seg">
          <button type="button" className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All · {POSITIONS.length}</button>
          <button type="button" className={filter==='flagged'?'active':''} onClick={()=>setFilter('flagged')}>Flagged · {flagged.length}</button>
        </div>
        <div className="row gap-8">
          {ACCOUNTS.map(a => <span key={a.id} className="tag">{a.custodian} · {a.name}</span>)}
        </div>
        <div className="spacer"/>
        <button type="button" className="btn"><span dangerouslySetInnerHTML={{__html: Icons.filter}}/> Filter</button>
      </div>

      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th></th>
              <th>Security</th>
              <th>Account</th>
              <th className="num">Quantity</th>
              <th className="num">Price</th>
              <th className="num">Market Value</th>
              <th className="num">Cost Basis</th>
              <th title="Parser confidence that the row matches the source statement. Flagged rows have lower confidence and need a human review.">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map(p => {
              const acct = ACCOUNTS.find(a => a.id === p.account);
              return (
                <tr key={p.id} className={p.flag ? 'flagged' : ''}>
                  <td><span className={`dot ${p.flag ? 'warn' : 'ink'}`}/></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.symbol}</div>
                    <div className="label" style={{ marginTop: 2 }}>
                      {p.flag ? <span style={{ color:'var(--warn)' }}>{p.flag}</span> : p.name}
                    </div>
                  </td>
                  <td className="text-3 mono" style={{ fontSize:12 }}>{acct ? acct.custodian : '—'}</td>
                  <td className="num">{p.qty == null ? '—' : fmt.num(p.qty)}</td>
                  <td className="num">{p.price == null ? 'NAV' : (p.price > 1000 ? fmt.num(p.price) : p.price.toFixed(2))}</td>
                  <td className="num">{fmt.money(p.mv, { compact: true })}</td>
                  <td className="num">{fmt.money(p.cost, { compact: true })}</td>
                  <td>
                    <div className="bar-track" style={{ width: 80 }}>
                      <div className={`bar-fill ${p.flag ? 'neg' : 'pos'}`} style={{ width: (p.flag ? 50 : 100) + '%' }}/>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="action-bar">
        <span className="text-3">3 items want a second pair of eyes — you can resolve later.</span>
        <button type="button" className="btn">Resolve flagged</button>
        <button type="button" className="btn primary" onClick={onConfirm}>Confirm &amp; build dashboard <span dangerouslySetInnerHTML={{__html: Icons.arrow}}/></button>
      </div>
    </div>
  );
}

window.Slate.Intake = { WorkspaceStartScreen, UploadScreen, ParsingScreen, ReviewScreen };
