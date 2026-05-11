// Root React tree — loaded last by boot.js after book.jsx registers window.Slate.Book.

try {
  const { Shell, Intake, Screens, AltsStructured } = window.Slate;
  const Book = window.Slate.Book;
  const ClientStore = window.Slate.ClientStore;
  const SlateRoute = window.SlateRoute || {
    read() {
      const h = location.hash || '';
      return h.length > 1 ? h.slice(1).replace(/^\/+/, '') : '';
    },
    write(route, replace) {
      const r = String(route || '').replace(/^#+/, '').replace(/^\/+/, '') || 'dashboard';
      location.hash = r;
      window.dispatchEvent(new Event('slate-route'));
    },
    isFile() {
      return true;
    },
  };

  function normRoute(r) {
    if (typeof Book.normalizeSlateRoute === 'function') return Book.normalizeSlateRoute(r);
    if (r == null || r === '') return r;
    const s = String(r);
    const q = s.indexOf('?');
    const path = (q >= 0 ? s.slice(0, q) : s).replace(/^\/+/, '');
    return path + (q >= 0 ? s.slice(q) : '');
  }

  /** Same-origin URL for the SvelteKit role landing (`/` or repo base when embedded under `/…/slate-esli/`). */
  function slateKitRolePickerUrl() {
    const custom = typeof window.__SLATE_KIT_HOME__ === 'string' ? window.__SLATE_KIT_HOME__.trim() : '';
    if (custom) {
      if (/^https?:\/\//i.test(custom)) return custom;
      const p = custom.startsWith('/') ? custom : `/${custom}`;
      return `${location.origin}${p.endsWith('/') ? p : `${p}/`}`;
    }
    const path = (location.pathname || '/').replace(/\/index\.html$/i, '');
    const m = path.match(/^(.*)\/slate-esli(?:\/|$)/i);
    const prefix = m ? m[1] || '' : '';
    return `${location.origin}${prefix}/`;
  }

  const TAB_LABELS = Object.fromEntries(Book.WORKSPACE_TABS.map(t => [t.id, t.label]));
  (Book.WM_CLIENT_WORKSPACE_STRIP || []).forEach(t => {
    TAB_LABELS[t.id] = t.label;
  });

  function resolveClientName(clientId) {
    const row = window.Slate.CLIENT_BOOK.find(c => c.id === clientId);
    if (row) return row.name;
    const c = ClientStore.get(clientId);
    return c ? c.name : clientId;
  }

  /** Top crumb for member portal — short household label (Marchetti), not product name. */
  function memberPortalRootCrumb() {
    const id = window.Slate.HOUSEHOLD && window.Slate.HOUSEHOLD.id;
    if (!id || typeof id !== 'string') return 'Marchetti';
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  class SlateErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
      return { error };
    }
    componentDidCatch(error, info) {
      console.error('Slate render error', error, info);
    }
    render() {
      if (this.state.error) {
        return (
          <div className="page" style={{ padding: 24, maxWidth: 640 }}>
            <h1 className="serif" style={{ fontSize: 22 }}>This screen hit an error</h1>
            <p className="text-2" style={{ marginTop: 12 }}>{String(this.state.error.message || this.state.error)}</p>
            <p className="text-3" style={{ marginTop: 16, color: 'var(--ink-3)' }}>Open DevTools → Console for the stack trace. Try a hard refresh or Safari/Chrome if this persists.</p>
          </div>
        );
      }
      return this.props.children;
    }
  }

  function App() {
    const [roleRev, setRoleRev] = React.useState(0);
    const [role, setRole] = React.useState(() => Book.getDemoRole());
    const [theme, setTheme] = React.useState(() => localStorage.getItem('slate-theme') || 'light');
    const [route, setRoute] = React.useState(() => {
      const raw = SlateRoute.read();
      const h = normRoute(raw);
      if (!h) {
        const hasRole = Book.getDemoRole();
        return hasRole ? 'dashboard' : 'choose-role';
      }
      return h;
    });
    const [hasPortfolio, setHasPortfolio] = React.useState(() => localStorage.getItem('slate-loaded') !== '0');
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const [selectedAccts, setSelectedAccts] = React.useState(() => {
      try { return JSON.parse(localStorage.getItem('slate-filter') || '[]'); } catch (e) { return []; }
    });

    const displayRoute = role ? Book.guardRouteForRole(role, route) : route;

    React.useEffect(() => {
      if (role && displayRoute !== route) {
        SlateRoute.write(displayRoute, true);
      }
    }, [role, route, displayRoute]);

    React.useEffect(() => {
      if (SlateRoute.isFile()) {
        const raw = location.hash.slice(1);
        const n = normRoute(raw);
        if (n !== raw && raw) location.hash = n;
        return;
      }
      const raw = SlateRoute.read();
      const n = normRoute(raw);
      if (n !== raw && raw) SlateRoute.write(n, true);
    }, []);

    React.useEffect(() => {
      if (SlateRoute.isFile()) {
        if (location.hash.length <= 1) {
          if (Book.getDemoRole()) SlateRoute.write('dashboard', true);
          else SlateRoute.write('choose-role', true);
        }
      } else {
        const p = (location.pathname || '').replace(/^\/+|\/+$/g, '');
        if ((!p || p === 'index.html') && (!location.hash || location.hash.length <= 1)) {
          if (Book.getDemoRole()) SlateRoute.write('dashboard', true);
          else SlateRoute.write('choose-role', true);
        }
      }
      if (localStorage.getItem('slate-loaded') == null) {
        localStorage.setItem('slate-loaded', '1');
      }
    }, []);

    React.useEffect(() => {
      const stored = Book.getDemoRole();
      const h = normRoute(SlateRoute.read() || '');
      if (!stored && h && h !== 'choose-role') {
        SlateRoute.write('choose-role', true);
        setRoute('choose-role');
      }
    }, []);

    React.useEffect(() => {
      if (role && route === 'choose-role') {
        SlateRoute.write(role === 'compliance' ? 'compliance/inbox' : 'dashboard', true);
      }
    }, [route, roleRev, role]);

    React.useEffect(() => { setMobileMenuOpen(false); }, [route]);

    React.useEffect(() => {
      document.body.dataset.theme = theme;
      localStorage.setItem('slate-theme', theme);
      const fav = document.getElementById('slate-favicon');
      const favShortcut = document.getElementById('slate-favicon-shortcut');
      const B = window.Slate.BRAND;
      if (!B) return;
      const path = (theme === 'dark' ? B.faviconDark : B.faviconLight) + '?v=4';
      let abs = path;
      try {
        abs = new URL(path, window.location.href).href;
      } catch (e) { /* keep path */ }
      if (fav) fav.href = abs;
      if (favShortcut) favShortcut.href = abs;
    }, [theme]);

    React.useEffect(() => {
      localStorage.setItem('slate-filter', JSON.stringify(selectedAccts));
    }, [selectedAccts]);

    const syncFromLocation = React.useCallback(() => {
      const h = normRoute(SlateRoute.read() || '') || (Book.getDemoRole() ? 'dashboard' : 'choose-role');
      const stored = Book.getDemoRole();
      setRoute(h);
      if (stored) setRole(stored);
      if (h === 'choose-role' && !stored) setRole(null);
    }, []);

    React.useEffect(() => {
      window.addEventListener('popstate', syncFromLocation);
      window.addEventListener('slate-route', syncFromLocation);
      window.addEventListener('hashchange', syncFromLocation);
      return () => {
        window.removeEventListener('popstate', syncFromLocation);
        window.removeEventListener('slate-route', syncFromLocation);
        window.removeEventListener('hashchange', syncFromLocation);
      };
    }, [syncFromLocation]);

    const navigate = React.useCallback((r) => {
      SlateRoute.write(normRoute(r));
    }, []);

    const bookInsightNavigate = React.useCallback((p) => {
      const s = String(p || '');
      if (s === 'insights') SlateRoute.write('insights');
      else if (s.startsWith('insights/')) SlateRoute.write(s);
      else if (s.startsWith('clients/')) SlateRoute.write(s);
      else SlateRoute.write(s);
    }, []);

    const onUpload = () => {
      try { sessionStorage.removeItem('slate-intake-client-name'); } catch (e) {}
      SlateRoute.write('parsing');
    };
    const onParsed = () => {
      setHasPortfolio(true);
      localStorage.setItem('slate-loaded', '1');
      SlateRoute.write('review');
    };
    const onConfirm = () => {
      let next = 'clients/marchetti/status';
      try {
        const intakeId = sessionStorage.getItem('slate-intake-client-id');
        if (intakeId) {
          sessionStorage.removeItem('slate-intake-client-id');
          sessionStorage.removeItem('slate-intake-client-name');
          if (ClientStore.get(intakeId)) {
            const mvSum = window.Slate.POSITIONS.reduce((a, p) => a + (p.mv || 0), 0);
            ClientStore.update(intakeId, {
              portfolioIngested: true,
              demoFull: true,
              displayAum: mvSum,
              acctCount: 4,
              custodians: 'Schwab · Fidelity · Pershing · JPM',
              ytdPct: 0.052,
              driftLabel: 'US Equity ▲9pp',
              driftTone: 'warn',
              reviewInDays: 7,
              reviewTone: 'warn',
            });
            next = 'clients/' + intakeId + '/pulse';
          }
        } else {
          const stored = sessionStorage.getItem('slate-post-review-hash');
          if (stored) {
            next = stored;
            sessionStorage.removeItem('slate-post-review-hash');
          }
        }
      } catch (e) {}
      SlateRoute.write(next);
    };

    const onOpenWorkspace = () => {
      setHasPortfolio(true);
      localStorage.setItem('slate-loaded', '1');
      SlateRoute.write('dashboard');
    };
    const onGoToToday = () => { SlateRoute.write('dashboard'); };

    const onSwitchRole = () => {
      Book.clearDemoRole();
      if (typeof SlateRoute.isFile === 'function' && SlateRoute.isFile()) {
        setRole(null);
        setRoleRev((x) => x + 1);
        SlateRoute.write('choose-role');
        return;
      }
      window.location.assign(slateKitRolePickerUrl());
    };

    const onRoleChosen = (picked) => {
      Book.setDemoRole(picked);
      if (picked === 'wm' && window.__SLATE_WM_HANDOFF_TO_KIT__) {
        window.location.assign('/workspace/overview');
        return;
      }
      setRole(picked);
      setRoleRev(x => x + 1);
      SlateRoute.write(picked === 'compliance' ? 'compliance/inbox' : 'dashboard');
    };

    const pc = Book.parseClientRoute(displayRoute);
    const pComp = Book.parseComplianceRoute(displayRoute);
    const displayPath = displayRoute.split('?')[0];
    const wmWorkspaceTab =
      pc && pc.kind === 'workspace' ? (pc.workspaceTab != null ? pc.workspaceTab : pc.tab) : null;
    const portfolioEntityInlineFilter =
      hasPortfolio &&
      pc &&
      pc.kind === 'workspace' &&
      pc.clientId === 'marchetti' &&
      Book.getDemoRole() === 'wm' &&
      wmWorkspaceTab &&
      ['pulse', 'portfolio', 'alts'].includes(wmWorkspaceTab);
    const workspaceAllowed = hasPortfolio || (pc && ClientStore.get(pc.clientId));
    const clientDeepAllowed = hasPortfolio;

    const clientNav = (clientId) => (path) => Book.clientScopedNavigate(clientId, path);

    const navItems = role ? Book.getSidebarNavForRole(role) : [];
    const sidebarProfile = role ? Book.getSidebarProfileForRole(role) : null;
    const showAppChrome = !!role && displayRoute !== 'choose-role';

    let body = null;
    let crumbs = ['Slate'];

    if (!role || displayRoute === 'choose-role') {
      body = <Book.RolePickerScreen onChoose={onRoleChosen} theme={theme} onTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />;
      crumbs = ['Slate', 'Choose role'];
    }
    else if (displayRoute === 'start') {
      body = <Intake.WorkspaceStartScreen hasPortfolio={hasPortfolio} onOpenWorkspace={onOpenWorkspace} onGoToToday={onGoToToday} onSimulateIntake={() => { Book.clearSlateIntakeLandingPrefs(); SlateRoute.write('upload'); }}/>;
      crumbs = ['Slate', 'Welcome'];
    }
    else if (displayRoute === 'upload') { body = <Intake.UploadScreen onUpload={onUpload}/>; crumbs = ['Slate', 'Intake','Upload']; }
    else if (displayRoute === 'parsing') { body = <Intake.ParsingScreen onDone={onParsed}/>; crumbs = ['Slate', 'Intake','Parsing']; }
    else if (displayRoute === 'review') { body = <Intake.ReviewScreen onConfirm={onConfirm}/>; crumbs = ['Slate', 'Intake','Review']; }
    else if (pComp && pComp.kind === 'complianceList') {
      body = <Book.ComplianceHomeScreen navigate={navigate}/>;
      crumbs = ['Slate', 'Compliance', 'KYC inbox'];
    }
    else if (pComp && pComp.kind === 'complianceClients') {
      body = <Book.ComplianceClientsDirectoryScreen navigate={navigate}/>;
      crumbs = ['Slate', 'Compliance', 'All clients'];
    }
    else if (pComp && pComp.kind === 'compliancePipeline') {
      body = <Book.CompliancePipelineScreen navigate={navigate}/>;
      crumbs = ['Slate', 'Compliance', 'Pipeline'];
    }
    else if (pComp && pComp.kind === 'complianceExpiring') {
      body = <Book.ComplianceExpiringScreen navigate={navigate}/>;
      crumbs = ['Slate', 'Compliance', 'Expiring IDs'];
    }
    else if (pComp && pComp.kind === 'complianceDocuments') {
      body = <Book.ComplianceDocumentsScreen navigate={navigate}/>;
      crumbs = ['Slate', 'Compliance', 'Document register'];
    }
    else if (pComp && pComp.kind === 'complianceDetail') {
      body = <Book.ComplianceClientScreen clientId={pComp.clientId} navigate={navigate}/>;
      crumbs = ['Slate', 'Compliance', resolveClientName(pComp.clientId)];
    }
    else if (displayRoute === 'dashboard') {
      if (role === 'client') {
        body = <Book.ClientDashboardScreen navigate={navigate}/>;
        crumbs = ['Slate', 'Dashboard'];
      } else {
        body = <Book.DashboardScreen navigate={navigate}/>;
        crumbs = ['Slate', 'Dashboard'];
      }
    }
    else if (pc && pc.kind === 'bookInsights' && role === 'wm') {
      body = (
        <Screens.InsightsScreen
          navigate={navigate}
          accountIds={[]}
          embedded={false}
          clientView={false}
          bookInsightsMode
          useBookInsightRoutes
        />
      );
      crumbs = ['Slate', 'AI Insights'];
    }
    else if (pc && pc.kind === 'bookInsightDetail' && role === 'wm') {
      body = <Screens.InsightDetail id={pc.insightId} navigate={bookInsightNavigate} clientView={false} />;
      crumbs = ['Slate', 'AI Insights', pc.insightId];
    }
    else if (pc && pc.kind === 'list') {
      body = <Book.ClientListScreen navigate={navigate} hasBook/>;
      crumbs = ['Slate', 'Clients'];
    }
    else if (pc && pc.kind === 'workspace' && workspaceAllowed) {
      body = (
        <Book.ClientWorkspaceScreen
          clientId={pc.clientId}
          workspaceTab={pc.workspaceTab}
          wmDrawerTab={pc.wmDrawerTab}
          tab={pc.workspaceTab ?? pc.tab}
          navigate={navigate}
          accountIds={selectedAccts}
          entityFilter={portfolioEntityInlineFilter ? { selected: selectedAccts, setSelected: setSelectedAccts } : null}
        />
      );
      crumbs =
        role === 'client'
          ? ['Slate', TAB_LABELS[pc.workspaceTab ?? pc.tab] || (pc.workspaceTab ?? pc.tab)]
          : role === 'wm'
            ? ['Slate', resolveClientName(pc.clientId)]
            : ['Slate', resolveClientName(pc.clientId), TAB_LABELS[pc.workspaceTab ?? pc.tab] || (pc.workspaceTab ?? pc.tab)];
    }
    else if (pc && pc.kind === 'holding' && clientDeepAllowed) {
      body = <Screens.HoldingDetail symbol={pc.symbol} navigate={clientNav(pc.clientId)} holdingBackPath={`clients/${pc.clientId}/portfolio?sub=holdings`}/>;
      crumbs = role === 'client'
        ? ['Slate', 'Holdings', decodeURIComponent(pc.symbol)]
        : ['Slate', resolveClientName(pc.clientId), 'Holdings', decodeURIComponent(pc.symbol)];
    }
    else if (pc && pc.kind === 'insightDetail' && clientDeepAllowed) {
      body = <Screens.InsightDetail id={pc.insightId} navigate={clientNav(pc.clientId)} clientView={role === 'client'} />;
      crumbs = role === 'client'
        ? ['Slate', 'Insights', pc.insightId]
        : ['Slate', resolveClientName(pc.clientId), 'Insights', pc.insightId];
    }
    else if (displayPath === 'product-builder') {
      if (role !== 'wm') {
        crumbs = ['Slate', 'Dashboard'];
      } else {
        const Pb = window.Slate.Copy?.productBuilder;
        body = <Book.ProductBuilderScreen navigate={navigate} />;
        crumbs = ['Slate', (Pb && Pb.breadcrumb) || 'Product builder'];
      }
    }
    else if (displayRoute === 'structured') {
      body = <AltsStructured.StructuredScreen navigate={navigate}/>;
      crumbs = ['Slate', 'Structured products'];
    }
    else if (displayPath === 'alts-global') {
      if (role === 'wm') {
        body = <Book.AltsBookGlobalScreen navigate={navigate} />;
        crumbs = ['Slate', 'Alternatives · book'];
      } else {
        body = <Book.DashboardScreen navigate={navigate} />;
        crumbs = ['Slate', 'Dashboard'];
      }
    }
    else {
      if (role === 'client') {
        body = <Book.ClientDashboardScreen navigate={navigate}/>;
      } else if (role === 'compliance') {
        body = <Book.ComplianceHomeScreen navigate={navigate}/>;
        crumbs = ['Slate', 'Compliance', 'KYC inbox'];
      } else {
        body = <Book.DashboardScreen navigate={navigate}/>;
      }
      crumbs = ['Slate', 'Dashboard'];
    }

    if (role === 'client' && Array.isArray(crumbs) && crumbs.length > 0 && crumbs[0] === 'Slate') {
      crumbs = [memberPortalRootCrumb(), ...crumbs.slice(1)];
    }

    return (
      <SlateErrorBoundary>
        <div className={`app${showAppChrome ? '' : ' app-no-sidebar'}`}>
          {showAppChrome ? (
            <Shell.Sidebar route={displayRoute.split('?')[0]} navigate={navigate}
              navItems={navItems}
              theme={theme}
              onChooseExperience={onSwitchRole}
              mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)}/>
          ) : null}
          <main className={`main ${!showAppChrome ? 'main-full' : ''}`}>
            {showAppChrome ? (
              <Shell.Topbar crumbs={crumbs} theme={theme}
                profile={sidebarProfile}
                role={role}
                onTheme={()=>setTheme(t => t === 'light' ? 'dark' : 'light')}
                onMobileMenu={() => setMobileMenuOpen(o => !o)}
                navigate={navigate}/>
            ) : null}
            {body}
          </main>
        </div>
      </SlateErrorBoundary>
    );
  }

  const rootEl = document.getElementById('root');
  if (rootEl && !rootEl._slateMounted) {
    rootEl._slateMounted = true;
    ReactDOM.createRoot(rootEl).render(<App/>);
  }
} catch (err) {
  console.error('Slate boot error', err);
  const el = document.getElementById('root');
  if (el) el.innerHTML = '<p style="padding:24px;font-family:system-ui,sans-serif;max-width:42em;line-height:1.5"><strong>Slate failed to start.</strong> ' + String(err && err.message ? err.message : err) + '</p><p style="padding:0 24px 24px;font-size:13px;color:#666">See the browser console for the full stack trace.</p>';
}
