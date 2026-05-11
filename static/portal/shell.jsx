// Slate — App Shell (sidebar, topbar, router, entity filter)

const { Icons, fmt, ACCOUNTS } = window.Slate;
const ReactDOM = window.ReactDOM;
const BRAND = window.Slate.BRAND || {
  lockupLight: '../brand/slate-lockup-light.png?v=2',
  lockupDark: '../brand/slate-lockup-dark.png?v=2',
  poweredByLight: '../brand/powered-by-slate-light.png?v=1',
  poweredByDark: '../brand/powered-by-slate-dark.png?v=1',
  faviconLight: '../brand/favicon.png',
  faviconDark: '../brand/favicon-dark.png',
  appleTouchIcon: '../brand/apple-touch-icon.png',
};

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',       icon: Icons.home },
  { id: 'clients',     label: 'Clients',         icon: Icons.users },
  { id: 'structured',  label: 'Structured',      icon: Icons.table, badge: 'RFQ' },
  { id: 'upload',      label: 'Intake',          icon: Icons.upload },
];


function navActive(navId, route) {
  const norm = (window.Slate.Book && window.Slate.Book.normalizeSlateRoute)
    ? window.Slate.Book.normalizeSlateRoute(route)
    : String(route || '').replace(/^\/+/, '');
  const path = norm.split('?')[0];
  if (navId === 'compliance/inbox') {
    return path === 'compliance' || path === 'compliance/inbox' || route.startsWith('compliance/inbox?');
  }
  if (navId.includes('/')) {
    return path === navId || route.startsWith(navId + '?');
  }
  if (navId === 'clients') return path === 'clients' || path.startsWith('clients/');
  if (navId === 'alts-global') return path === 'alts-global';
  if (navId === 'insights') return path === 'insights' || path.startsWith('insights/');
  if (navId === 'upload') return path === 'upload' || path === 'parsing' || path === 'review';
  if (navId === 'compliance') return path === 'compliance' || path.startsWith('compliance/');
  return navId === path;
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-logo-wrap">
        <img className="brand-logo-img brand-lockup-light" src={BRAND.lockupLight} alt="Slate Private Wealth" width={286} height={72} decoding="async"/>
        <img className="brand-logo-img brand-lockup-dark" src={BRAND.lockupDark} alt="" width={286} height={72} decoding="async" aria-hidden="true"/>
      </div>
    </div>
  );
}

function Sidebar({ route, navigate, mobileOpen, onMobileClose, navItems, onChooseExperience, theme = 'light' }) {
  const close = () => onMobileClose && onMobileClose();
  const handleNav = (id) => {
    navigate(id);
    close();
  };
  const grouped =
    navItems &&
    typeof navItems === 'object' &&
    !Array.isArray(navItems) &&
    navItems.grouped &&
    Array.isArray(navItems.sections);
  const flatItems = Array.isArray(navItems) && navItems.length ? navItems : NAV;
  const showExperienceBlock = typeof onChooseExperience === 'function';
  const poweredBySrc =
    theme === 'dark'
      ? (BRAND.poweredByDark || '../brand/powered-by-slate-dark.png?v=1')
      : (BRAND.poweredByLight || '../brand/powered-by-slate-light.png?v=1');

  const renderNavLink = (n) => (
    <div
      key={n.id}
      className={`nav-item ${navActive(n.id, route) ? 'active' : ''}`}
      onClick={() => handleNav(n.id)}
    >
      <span dangerouslySetInnerHTML={{ __html: n.icon }} />
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.label}</span>
      {n.badge ? <span className="badge">{n.badge}</span> : null}
    </div>
  );

  return (
    <React.Fragment>
      <div className={`sidebar-backdrop ${mobileOpen ? 'show' : ''}`} onClick={close}/>
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-top-row">
          <Brand/>
          <button type="button" className="btn ghost icon sidebar-close-btn" onClick={close} title="Close menu" aria-label="Close menu">
            <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
          </button>
        </div>
        {grouped ? (
          navItems.sections.map((section, si) => (
            <div key={section.heading || si} className="nav-section nav-section--group">
              <div className="h label nav-section__heading">{section.heading}</div>
              {(section.items || []).map(renderNavLink)}
            </div>
          ))
        ) : (
          <div className="nav-section">
            <div className="h label">Navigate</div>
            {flatItems.map(renderNavLink)}
          </div>
        )}
        <div style={{ marginTop: 'auto', display:'flex', flexDirection:'column', gap:8 }}>
          <hr className="divider"/>
          {showExperienceBlock ? (
            <React.Fragment>
              <button
                type="button"
                className="nav-item sidebar-choose-experience sidebar-choose-experience--bordered"
                onClick={() => { onChooseExperience(); close(); }}
                aria-label="Choose experience or switch demo role"
              >
                <span dangerouslySetInnerHTML={{ __html: Icons.arrow }} />
                <span>Choose experience</span>
              </button>
              <a
                className="sidebar-powered-by"
                href="https://viaslate.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
              >
                <img
                  className="sidebar-powered-by-img"
                  src={poweredBySrc}
                  alt="Powered by Slate"
                  decoding="async"
                />
              </a>
            </React.Fragment>
          ) : null}
        </div>
      </aside>
    </React.Fragment>
  );
}

/** Topbar tooltips: portal to body + clamp to viewport (avoids topbar clipping). */
function ModeTipWrap({ tip, children }) {
  const wrapRef = React.useRef(null);
  const floaterRef = React.useRef(null);
  const [show, setShow] = React.useState(false);
  const [pos, setPos] = React.useState(null);

  const place = React.useCallback(() => {
    const wrap = wrapRef.current;
    const el = floaterRef.current;
    if (!wrap || !el) return;
    const r = wrap.getBoundingClientRect();
    const tw = el.offsetWidth;
    const th = el.offsetHeight;
    const pad = 8;
    const gap = 10;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - tw - pad));
    let top = r.bottom + gap;
    if (top + th > window.innerHeight - pad) top = Math.max(pad, r.top - gap - th);
    setPos({ top, left });
  }, []);

  React.useLayoutEffect(() => {
    if (!show) return;
    place();
  }, [show, tip, place]);

  React.useEffect(() => {
    if (!show) return;
    const fn = () => place();
    window.addEventListener('scroll', fn, true);
    window.addEventListener('resize', fn);
    return () => {
      window.removeEventListener('scroll', fn, true);
      window.removeEventListener('resize', fn);
    };
  }, [show, place]);

  return (
    <span
      ref={wrapRef}
      className="mode-tip-anchor"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => { setShow(false); setPos(null); }}
    >
      {children}
      {show && ReactDOM.createPortal(
        <div
          ref={floaterRef}
          className="mode-tip-floater"
          role="tooltip"
          style={
            pos
              ? { position: 'fixed', top: pos.top, left: pos.left, zIndex: 10000, opacity: 1, pointerEvents: 'none' }
              : { position: 'fixed', top: -9999, left: 0, zIndex: 10000, opacity: 0, pointerEvents: 'none' }
          }
        >
          {tip}
        </div>,
        document.body
      )}
    </span>
  );
}

function topbarSearchRowMv(row) {
  if (!row) return 0;
  if (typeof row.displayAum === 'number') return row.displayAum;
  if (!row.demoFull && typeof row.aum === 'number') return row.aum;
  const P = window.Slate.POSITIONS;
  if (row.demoFull && Array.isArray(P)) return P.reduce((a, p) => a + (p.mv || 0), 0);
  return typeof row.aum === 'number' ? row.aum : 0;
}

function Topbar({ crumbs, onTheme, theme, onMobileMenu, navigate, profile, role }) {
  const prof = profile || { initials: 'CH', name: 'Christine Holloway', title: 'Relationship Manager' };
  const Nav = window.Slate.Copy?.navigation;
  const sc = (Nav && Nav.search) || {};
  const sg = (Nav && Nav.searchGroups) || { clients: 'Households', routes: 'Screens' };
  const CLIENT_BOOK = window.Slate.CLIENT_BOOK || [];
  const wmHouseholdLanding = window.Slate.Book && typeof window.Slate.Book.wmHouseholdLanding === 'function'
    ? window.Slate.Book.wmHouseholdLanding
    : id => `clients/${id}/pulse`;
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [disclaimerOpen, setDisclaimerOpen] = React.useState(false);
  const searchInputRef = React.useRef(null);
  const DisclaimerModal = window.Slate.DisclaimerModal;
  const searchEnabled = role === 'wm' && typeof navigate === 'function';
  const showAvatarMenu = role === 'client' || role === 'compliance';

  const placeholder = searchEnabled ? (sc.placeholder || 'Search clients, households, holdings…') : 'Search clients, holdings…';
  const kbdLabel = (sc && sc.kbdHint) || '⌘K';

  React.useEffect(() => {
    if (!searchEnabled) return undefined;
    const onDocKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', onDocKey);
    return () => document.removeEventListener('keydown', onDocKey);
  }, [searchEnabled]);

  React.useEffect(() => {
    if (!searchEnabled) return undefined;
    const open = () => setSearchOpen(true);
    document.addEventListener('slate-wm-open-search', open);
    return () => document.removeEventListener('slate-wm-open-search', open);
  }, [searchEnabled]);

  React.useEffect(() => {
    if (!searchOpen) return undefined;
    setQ('');
    const t = window.setTimeout(() => {
      try { searchInputRef.current?.focus(); } catch (e) {}
    }, 10);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  const qLow = q.trim().toLowerCase();
  let clientHits = [];
  let routeHits = [];
  if (searchEnabled && searchOpen && qLow) {
    clientHits = CLIENT_BOOK.filter(row => {
      const nm = String(row.name || '').toLowerCase();
      const id = String(row.id || '').toLowerCase();
      return nm.includes(qLow) || id.includes(qLow);
    }).slice(0, 12);
    const jumps = [...(Nav && Nav.commandJumps ? Nav.commandJumps : [])].slice(0, 24);
    routeHits = jumps.filter(j => String(j.label || '').toLowerCase().includes(qLow)).slice(0, 12);
  }

  return (
    <React.Fragment>
    <div className="topbar">
      <button type="button" className="btn ghost icon mobile-menu-btn" onClick={onMobileMenu} title="Menu" aria-label="Open menu">
        <span dangerouslySetInnerHTML={{ __html: Icons.menu }} />
      </button>
      <a className="topbar-brand" href="#" onClick={(e) => { e.preventDefault(); navigate && navigate('dashboard'); }} role="link" tabIndex={0} aria-label="Slate Private Wealth · Home">
        <span className="topbar-brand-logo-wrap">
          <img className="topbar-brand-logo topbar-lockup-light" src={BRAND.lockupLight} alt="" width={264} height={68} decoding="async"/>
          <img className="topbar-brand-logo topbar-lockup-dark" src={BRAND.lockupDark} alt="" width={264} height={68} decoding="async" aria-hidden="true"/>
        </span>
      </a>
      <div className="crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'last' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      {searchEnabled ? (
        <button
          type="button"
          className="btn ghost icon topbar-search-wm-mobile"
          onClick={() => setSearchOpen(true)}
          title={placeholder}
          aria-label={placeholder}
        >
          <span dangerouslySetInnerHTML={{ __html: Icons.search }} />
        </button>
      ) : null}
      <div
        className={`search topbar-search${searchEnabled ? ' topbar-search--wm' : ''}`}
        onClick={() => searchEnabled && setSearchOpen(true)}
        role={searchEnabled ? 'button' : undefined}
        tabIndex={searchEnabled ? 0 : undefined}
        onKeyDown={searchEnabled ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSearchOpen(true); }
        } : undefined}
        aria-expanded={searchEnabled ? searchOpen : undefined}
      >
        <span dangerouslySetInnerHTML={{ __html: Icons.search }} />
        <input
          readOnly={searchEnabled}
          placeholder={placeholder}
          title={searchEnabled ? `${placeholder} · ${kbdLabel}` : placeholder}
          aria-label={placeholder}
          onFocus={searchEnabled ? (e) => { e.preventDefault(); setSearchOpen(true); } : undefined}
          onClick={searchEnabled ? (e) => { e.stopPropagation(); setSearchOpen(true); } : undefined}
        />
        <span className="kbd">{kbdLabel}</span>
      </div>
      <div className="spacer"/>
      <div className="topbar-right-cluster">
        <button
          type="button"
          className="demo-pill"
          onClick={() => setDisclaimerOpen(true)}
          aria-label="Demo environment disclaimer"
        >
          <span className="demo-pill-dot" aria-hidden="true" />
          <span className="demo-pill-label">Demo environment</span>
        </button>
        <div className="topbar-tools-kit">
          <ModeTipWrap tip={theme === 'dark' ? 'Switch to Dawn Mode' : 'Switch to Dusk Mode'}>
            <button
              type="button"
              className="btn ghost icon"
              onClick={onTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span dangerouslySetInnerHTML={{ __html: theme === 'dark' ? Icons.sun : Icons.moon }} />
            </button>
          </ModeTipWrap>
          <ModeTipWrap tip="Download Report">
            <button type="button" className="btn ghost icon topbar-download-btn" title="Download report" aria-label="Download report (demo)">
              <span dangerouslySetInnerHTML={{ __html: Icons.download }} />
            </button>
          </ModeTipWrap>
        </div>
        {showAvatarMenu ? (
          <div className="avatar-menu topbar-avatar-menu">
            <span className="avatar avatar-trigger topbar-avatar" aria-label={`${prof.name}, open account menu`}>
              {prof.initials}
            </span>
            <div className="avatar-dropdown" role="menu" aria-label="Account">
              <div className="avatar-dropdown-inner">
                <div className="avatar-dropdown-header">
                  <div className="avatar-dropdown-header-name">{prof.name}</div>
                  <div className="avatar-dropdown-header-role">{prof.title}</div>
                </div>
                <hr className="avatar-dropdown-divider" />
                <button type="button" className="avatar-dropdown-item" disabled aria-disabled="true" role="menuitem">
                  <span dangerouslySetInnerHTML={{ __html: Icons.users }} /> Profile
                </button>
                <button type="button" className="avatar-dropdown-item" disabled aria-disabled="true" role="menuitem">
                  <span dangerouslySetInnerHTML={{ __html: Icons.inbox }} /> Notifications
                </button>
                <button type="button" className="avatar-dropdown-item" disabled aria-disabled="true" role="menuitem">
                  <span dangerouslySetInnerHTML={{ __html: Icons.table }} /> Preferences
                </button>
              </div>
            </div>
          </div>
        ) : (
          <span className="avatar topbar-avatar topbar-avatar--plain" title={`${prof.name} · ${prof.title}`}>{prof.initials}</span>
        )}
      </div>

      {searchEnabled && searchOpen ? (
        <React.Fragment>
          <div className="slate-search-backdrop" role="presentation" aria-hidden="true" onClick={() => setSearchOpen(false)} />
          <div className="slate-search-modal" role="dialog" aria-modal="true" aria-label={placeholder}>
            <div className="slate-search-modal__head row gap-10" style={{ alignItems: 'center' }}>
              <span dangerouslySetInnerHTML={{ __html: Icons.search }} />
              <input
                ref={searchInputRef}
                className="slate-search-modal__input"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={placeholder}
              />
              <button type="button" className="btn ghost icon" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
              </button>
            </div>
            <div className="slate-search-modal__body">
              {!q.trim() ? (
                <p className="text-3 slate-helper-copy" style={{ margin: '8px 0 0', fontSize: 12 }}>Type to filter households and command jumps.</p>
              ) : (
                <div className="slate-search-groups stack stack-3">
                  {clientHits.length ? (
                    <div>
                      <div className="slate-search-group-label label">{sg.clients || 'Households'}</div>
                      <ul className="slate-search-list">
                        {clientHits.map(row => (
                          <li key={row.id}>
                            <button
                              type="button"
                              className="slate-search-hit-btn"
                              onClick={() => { setSearchOpen(false); navigate(wmHouseholdLanding(row.id)); }}
                            >
                              {row.name}<span className="text-3 slate-helper-copy" style={{ marginLeft: 8, fontWeight: 400 }}>
                                {' · '}{fmt.money(topbarSearchRowMv(row), { compact: true })} book AUM
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {routeHits.length ? (
                    <div>
                      <div className="slate-search-group-label label">{sg.routes || 'Go to screen'}</div>
                      <ul className="slate-search-list">
                        {routeHits.map(j => (
                          <li key={j.id || j.hash}>
                            <button type="button" className="slate-search-hit-btn" onClick={() => { setSearchOpen(false); navigate(j.hash); }}>
                              {j.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {!clientHits.length && !routeHits.length ? (
                    <p className="text-3 slate-helper-copy" style={{ marginTop: 8 }}>No matching results.</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </React.Fragment>
      ) : null}
    </div>
    {DisclaimerModal && disclaimerOpen ? (
      <DisclaimerModal onClose={() => setDisclaimerOpen(false)} />
    ) : null}
    </React.Fragment>
  );
}

function FilterBar({ selected, setSelected }) {
  const all = selected.length === 0;
  const toggle = id => {
    if (selected.includes(id)) setSelected(selected.filter(x => x !== id));
    else setSelected([...selected, id]);
  };
  return (
    <div className="filter-bar">
      <span className="label">Filter</span>
      <span className={`chip ${all ? 'on' : ''}`} onClick={() => setSelected([])}>All entities</span>
      {ACCOUNTS.map(a => {
        const on = selected.includes(a.id);
        return (
          <span key={a.id} className={`chip ${on ? 'on' : ''}`} onClick={() => toggle(a.id)}>
            {on ? '✓ ' : ''}{a.entity} · {a.name}
          </span>
        );
      })}
    </div>
  );
}

window.Slate.Shell = { Sidebar, Topbar, Brand, FilterBar };
