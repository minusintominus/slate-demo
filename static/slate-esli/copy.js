/**
 * Slate — user-facing copy (source of truth for strings).
 * Organised by screen → component → state. Dynamic fragments are functions where noted.
 * @see Slate Private Wealth Platform UX spec v1.0
 */
(function () {
  window.Slate = window.Slate || {};

  /** @type {Record<string, unknown>} */
  const Copy = {
    global: {
      product: 'Slate',
      tagline: 'Private Wealth Platform',
      toneNote: 'Professional, direct, present tense, active voice — zero filler.',
    },

    navigation: {
      breadcrumbTwoLevels: true,
      search: {
        placeholder: 'Search clients, households, holdings…',
        kbdHint: '⌘K',
      },
      searchGroups: {
        clients: 'Households',
        routes: 'Go to screen',
      },
      /** Command jumps — max 7; last entry is rewritten to last-open household (see DemoTourStrip) */
      commandJumps: [
        { id: 'directory', label: 'Client directory', hash: 'clients' },
        { id: 'marchetti', label: 'Marchetti — pulse', hash: 'clients/marchetti/pulse' },
        { id: 'alts', label: 'Alternatives · book', hash: 'alts-global' },
        { id: 'insights', label: 'Insights', hash: 'clients/marchetti/pulse?drawer=insights' },
        { id: 'cashflow', label: 'Cashflow', hash: 'clients/marchetti/portfolio?sub=cashflow' },
        { id: 'structured', label: 'Structured', hash: 'structured' },
        { id: 'intake', label: 'Statement intake', hash: 'upload' },
      ],
      stripLabel: 'Command jumps',
    },

    dashboard: {
      pageTitleGreet: (name, greet) => `${greet}, ${name}`,

      hero: {
        metaEyebrow: 'BOOK OVERVIEW',
        /** One line — triage → momentum → drill (no “optimization” framing) */
        lede:
          'Triage what needs attention, scan trailing momentum for the window you pick, then open households for detail.',
        addClient: '+ Add client',
        clients: 'Clients',
        moreRoutes: 'More routes',
        structuredDesk: 'Structured desk',
        statementIntake: 'Statements & onboarding',
      },

      northStar: {
        sectionEyebrow: 'NORTH STAR · BOOK',
        title: 'Headline book economics',
        subtitle: 'Assets and advisory economics — YTD where noted.',
        aumLabel: 'Total AUM',
        aumCaption: (rangeLabel) => `vs start of ${rangeLabel}`,
        feeLabel: 'Advisory economics (YTD)',
        feeCaption: 'Illustrative accrual (wrap / planning / custody lift)',
      },

      bookGrowth: {
        sectionEyebrow: (rangeLabel) => `BOOK GROWTH · ${String(rangeLabel).toUpperCase()}`,
        title: 'New relationships and the existing book',
        subtitle:
          'Trailing net new money shown as new funded households vs expansion on relationships already on the book — modeled split for this demo.',
        newLabel: 'New funded relationships',
        newDetail: (n, nnm) => `${n} funded in window · ${nnm} attributed NNM (modeled)`,
        existingLabel: 'Expansion on existing book',
        existingDetail: (nnm) => `${nnm} attributed NNM (modeled)`,
        modeledNote: 'Split is illustrative from window NNM and new-household count.',
      },

      drivers: {
        sectionEyebrow: 'DRIVERS',
        title: 'Outcomes, coverage, and investment activity',
        subtitle: 'Context for client outcomes and coverage — not a substitute for household files.',
        roiTitle: (bench) => `Book vs ${bench}`,
        roiHint: 'Household-weighted excess return (bps)',
        engagementTitle: 'Engagement coverage',
        engagementHint: (pct, modeled, days) =>
          `${pct}% of ${modeled} modeled households with contact in last ${days} days`,
        vehiclesTitle: 'Investment vehicles & desk',
        vehiclesHint: (rfq, alts) => {
          const r = `${rfq} open structured RFQ${rfq === 1 ? '' : 's'}`;
          if (!alts) return r;
          return `${r} · ${alts} alt program${alts === 1 ? '' : 's'} on book watchlist`;
        },
      },

      cadence: {
        sectionEyebrow: 'EXECUTION',
        title: 'Cadence & desk',
        subtitle: 'Operational pulse — reviews, drift, structured desk, and directory scale.',
        pulseAria: 'Cadence and desk signals',
      },

      momentum: {
        sectionEyebrow: (rangeLabel) => `TRAILING · ${String(rangeLabel).toUpperCase()}`,
        title: 'Momentum',
        subtitle: (bench) =>
          `Net flows by sub-period with value-add vs ${bench} (bps) on the same window.`,
        legendFlows: 'Net flows',
        legendValueAdd: (bench) => `Value-add vs ${bench}`,
      },

      rail: {
        ariaLabel: 'Book KPIs',
        title: 'Book KPIs',
        segmentTitle: 'Mix by segment',
        segmentHint: 'Modeled AUM share by household count',
        feeMini: 'Advisory economics (YTD)',
        newFundedProgress: 'New funded (annual)',
      },

      /** Pulse chips — values are numeric; labels describe the signal */
      pulse: {
        households: { label: 'Households on book', hint: 'relationship directory' },
        structuredRfqs: { label: 'Structured RFQs', hintLive: 'desk · open' },
        reviewsOverdue: { label: 'Reviews overdue', hintOk: 'cadence on track', hintPrioritize: 'prioritize diary' },
        driftWatches: { label: 'Drift watches', hintOk: 'policy on track', hintFlag: 'sleeves outside band' },
      },

      growthGoals: {
        sectionEyebrow: 'ANNUAL PLAN · YTD',
        title: 'Growth goals vs plan',
        subtitle: 'Progress against annual net new money and new funded household targets.',
        progressLabel: 'PROGRESS STRIP',
        openDirectory: 'Open directory',
      },

      trajectory: {
        sectionEyebrow: (rangeLabel) => `SAME WINDOW · ${String(rangeLabel).toUpperCase()}`,
        title: 'Book trajectory & economics pacing',
        subtitle: 'Aggregate book vs IPS blend and monthly advisory accrual (illustrative).',
        glideTitle: 'Book vs policy glide',
        feeTitle: 'Economics pacing',
        feeDisclaim: 'Monthly accrual — cash settlement may trail custodian credits.',
        feeCrossRef: '',
        legendBook: 'Book',
        legendPolicy: 'IPS / policy blend',
      },

      flows: {
        sectionEyebrow: (rangeLabel) => `FLOWS · ${String(rangeLabel).toUpperCase()}`,
        title: 'Inflows and capacity',
        subtitle: 'Net new money by slice; households in scope for the same window.',
        nnmBySlice: 'Net new money by slice',
        householdsCovered: 'Households in scope',
        householdsDirectoryNote: (n) => `${n} households in directory`,
      },

      concentration: {
        sectionEyebrow: 'CONCENTRATION',
        title: 'Largest relationships',
        subtitle: 'Where the book concentrates by household size (where AUM is available).',
        mixTitle: 'Mix by segment',
        mixMeta: 'directory',
        largestTitle: 'Largest relationships',
        largestMeta: (n) => `top ${n} by AUM`,
        emptyLargest: 'Import statements to compare relationship size.',
      },

      markets: {
        sectionEyebrow: 'CAPITAL MARKETS',
        title: 'IPO, auction and issuance calendar',
        subtitle: 'Deal flow that may affect public and private allocations.',
        detailsSummary: 'Capital markets context',
        detailsHint:
          'Tape and deal flow with illustrative household relevance tags — expand when planning sleeve transitions or client conversations.',
        clientsCol: 'Clients',
        clientsEligible: (n) => `${n} eligible`,
        clientsOpen: 'Open directory',
        clientsDash: '—',
      },

      kpiRail: {
        ariaLabel: 'Headline book metrics',
        totalAum: 'Total AUM',
        netNewAssets: 'Net new assets',
        newFunded: 'New funded relationships',
        bookVsBench: (bench) => `Book vs ${bench}`,
        captionNnm: (rangeLabel) => `Funding and transfers net of outflows · ${rangeLabel}`,
        captionNewHh: (rangeLabel) => `First funded in ${rangeLabel}`,
        captionBps: 'Household-weighted excess return (bps)',
      },

      alertStrip: {
        intro: (shown, total) =>
          `${total} ${total === 1 ? 'item' : 'items'} need attention today:`,
        more: (n) => `+ ${n} more`,
        hideWhenClean: true,
      },

      footer: {
        whyFourTitle: 'How this view stacks',
        whyFourBody: (bench) =>
          `AUM and advisory economics summarize the book; trailing growth splits new funded names from expansion on existing relationships; vs ${bench}, engagement coverage, and structured plus alternatives desk activity add context — use the pulse row and household files for execution.`,
        pipelineLabel: 'Pipeline funnel',
        pipelineSub:
          'CRM stages with illustrative stage-to-stage conversion — optional snapshot when you want funnel visibility.',
        viewClients: 'View clients',
      },

      empty: {
        noFlows: 'No flows recorded in this window.',
        growthNoPlan: 'No annual plan set — open Goals from Pulse to baseline targets.',
        bookNoDrift: 'No sleeve drift flagged on IPS targets.',
      },
      loadingAria: 'Loading book overview…',
    },

    clients: {
      eyebrow: 'RELATIONSHIP DIRECTORY',
      title: 'Clients',
      lede: (households, aum, uhnw, fo, hnw) =>
        `${households} households · ${aum} book AUM · ${uhnw} UHNW · ${fo} FO · ${hnw} HNW`,
      ledeWm:
        'AUM, health, review cadence, and advisory economics across the households in Christine’s book.',
      bookDashboard: 'Book dashboard',
      addClient: '+ Add client',
      empty: 'Add a client to list them here alongside the sample book.',
      footnote: 'Sample households are illustrative except Marchetti. New clients appear until you import statements.',
      table: {
        household: 'Client / household',
        groupAdvisory: 'Advisory',
        groupNonAdvisory: 'Non-advisory',
        totalAum: 'Total AUM',
        client: 'Client',
        type: 'Type',
        aum: 'AUM',
        ytd: 'YTD',
        drift: 'Drift',
        fee: 'Fee',
        lastContact: 'Last contact',
        review: 'Review',
        nextAction: 'Next action',
        awaitingImport: 'Awaiting statement import',
        newBadge: 'NEW',
        uploadStatements: 'Upload statements',
        uploadStatementsRail: 'Upload financial statements',
        uploadStatementsSub:
          'Import PDF brokerage or custody statements to populate advisory columns, drift, and fees.',
        pendingReview: 'Pending docs',
        pendingDrift: '—',
        open: 'Open',
        driftOnTarget: 'Aligned',
        overdue: 'Overdue',
        dash: '—',
      },
      intakeHint:
        'Households below need custodian statements before AUM, drift, and reviews populate — open the row or use Upload statements.',
    },

    /**
     * Client workspace (`clients/:id/:tab`) — WM + member chrome, empty states, intake.
     */
    workspace: {
      backToClients: '← All clients',
      allClients: 'All clients',
      notFound: {
        title: 'Client not found',
        cta: 'Back to clients',
      },
      eyebrow: {
        wm: 'CLIENT WORKSPACE',
      },
      intake: {
        eyebrow: 'NEW CLIENT INTAKE',
        h1Client: 'Your portfolio setup',
        shellReady: 'Workspace shell ready for statement intake and portfolio review.',
        importStatementsHeader: 'Import statements',
        metaNoPortfolio: (custodians) => `No portfolio data yet · primary custodian ${custodians || '—'}`,
        householdDocs: 'Household & documents',
        altInvestments: 'Alternative investments',
        structuredProducts: 'Structured products',
      },
      /** Lightweight sample household (non-Marchetti) */
      liteSample: {
        /** Member H1 when household is lite sample (WM still uses household name). */
        h1Client: 'Portfolio',
        clientLead: 'This view uses a lighter sample book.',
        openFullDemo: 'Open the full demo portfolio',
        clientSuffix: 'for the complete experience.',
        wmLead: 'Illustrative household — open',
        wmOpenFull: 'the full demo household',
        wmSuffix: 'to continue.',
      },
      /** WM-only subline under H1 (member uses meta line elsewhere) */
      wmSubline: {
        overview: 'Pulse · AUM, outcomes, diary & issuer desk',
        pulse: 'Pulse · KPIs, attention, IPS bridge & deep dives',
        messages: 'Touchpoints · clients & external parties',
        goals: 'Progress vs IPS & pacing envelope',
      },
      wmSublineSegment: (row) => `${row.acctCount} accounts · ${row.custodians} · ${row.familyType}`,
      wmSublineDefault: (row) => `${row.acctCount} accounts · ${row.custodians}`,

      askSlateOpen: 'Ask Slate',
      /** WM canonical surface tabs — Pulse / Portfolio / Alts & structured */
      wmTabStrip: {
        pulse: 'Pulse',
        portfolio: 'Portfolio',
        alts: 'Alts & structured',
      },
      wmDrawerLinks: [
        { id: 'insights', label: 'Insights' },
        { id: 'goals', label: 'Goals & outcomes' },
        { id: 'messages', label: 'Communication' },
        { id: 'events', label: 'Upcoming events' },
        { id: 'documents', label: 'Documents' },
        { id: 'status', label: 'Overall status' },
        { id: 'refresh', label: 'Refresh data' },
      ],
      wmDrawerAria: 'Workspace deep dives',
      wmProductBuilderJump: '+ Build structured offer',

      /** Primary tab strip — ids match WORKSPACE_TABS */
      tabLabels: {
        overview: 'Overview',
        pulse: 'Pulse',
        portfolio: 'Aggregated portfolio',
        insights: 'Insights',
        events: 'Upcoming events',
        documents: 'Documents',
        status: 'Overall status',
        alts: 'Alternatives',
        structured: 'Structured products',
        goals: 'Goals & outcomes',
        messages: 'Communication',
        refresh: 'Refresh data',
      },
      /** Member-facing H1 per tab (when shell shows title) */
      pageTitleMember: {
        overview: 'Overview',
        portfolio: 'Portfolio',
        insights: 'Insights',
        events: 'Upcoming events',
        documents: 'Documents',
        status: 'Overall status',
        goals: 'Goals & outcomes',
        messages: 'Communication',
        alts: 'Alternative investments',
        structured: 'Structured products',
        refresh: 'Refresh data',
      },
      pending: {
        portfolio: {
          title: 'Portfolio not imported yet',
          body:
            'Import a statement package to populate holdings, accounts, insights, and exception review. After parse review, this tab shows the aggregated book.',
        },
        overview: {
          title: 'Client overview',
          body:
            'After import, household AUM, outcomes vs IPS, diary risk, issuer RFQs, and open follow-ups consolidate here.',
          showImport: false,
        },
        insights: {
          title: 'Insights after first import',
          body:
            'Slate builds concentration, tax, cash-drag, and IPS-drift insights once statements are parsed and the book is aggregated.',
        },
        goals: {
          title: 'Goals & outcomes',
          body: 'IPS pacing, liquidity runway, and return vs benchmark appear once positions and policy are on file.',
          showImport: false,
        },
        messages: {
          title: 'Communication',
          body: 'Touchpoint history and notes attach here — link calls and emails to custody actions for audit.',
          showImport: false,
        },
        events: {
          title: 'Upcoming events',
          body: 'Relationship and compliance milestones will appear here once the household has an active portfolio.',
          showImport: false,
        },
        documents: {
          title: 'No statements on file',
          body: 'Import custodian PDFs from the Portfolio tab or via Refresh data. Document inventory grows with each ingest.',
        },
        status: {
          householdLabel: 'Household',
          yourHousehold: 'Your household',
          parsedBookLabel: 'Parsed book',
          parsedBookBody:
            'No ingest yet. Net worth, parser confidence, and review cadence will appear after the first successful import.',
        },
        alts: {
          title: 'Alternatives',
          body: 'Private funds and structured products surface here once positions are parsed and classified.',
        },
        structured: {
          title: 'Structured products',
          body: 'Your structured notes and any new ideas your advisor is reviewing appear here once positions are classified.',
        },
      },
      emptyCard: {
        importCta: 'Import statements',
      },
      wmPulse: {
        kpiNw: 'Net worth',
        kpiLiq: 'Liquid',
        kpiUg: 'Unrealised gain',
        kpiYtdInc: 'YTD income',
        attentionCard: 'Attention needed',
        allocCardTitle: 'Allocation vs IPS targets',
        perfJump: 'Open portfolio overview',
        deepDiveTitle: 'Deep dives',
      },
      wmEmptyStates: {
        bookNoRfqs: 'No open issuer RFQs on the desk.',
        altsNoOffers: 'No open offers staged for households.',
        hhNoHoldings: 'Import statements to recognise holdings.',
        searchNoHits: 'No matches — tighten your query.',
        entitiesNoHoldings: 'Nothing in scope — widen entities or restore filters.',
      },
    },

    portfolio: {
      subnavAria: 'Household portfolio',
      tabs: {
        summary: 'Overview',
        holdings: 'Holdings',
        diversification: 'Diversification',
        accounts: 'Accounts',
        cashflow: 'Cashflow',
      },
      performanceSub: 'Vs. 60/40 blend — illustrative household curve.',
    },

    productBuilder: {
      pageEyebrow: 'STRUCTURED PRODUCTS',
      pageTitle: 'Product builder',
      pageSubline: 'Step through terms, eligibility, and opt-in outreach before send.',
      breadcrumb: 'Product builder',
      step1Short: 'Product',
      step2Short: 'Terms',
      step3Short: 'Eligibility',
      step4Short: 'Review',
      stepTitles: ['Product details', 'Terms & structure', 'Eligibility & clients', 'Review & send'],
      step1Lead: 'Name the issuer concept and headline economics.',
      productName: 'Product name',
      productType: 'Product type',
      typeIncomeNote: 'Income note',
      typePrincipalProtected: 'Principal protected note',
      typeAutocall: 'Autocall',
      tenor: 'Tenor',
      currency: 'Currency',
      next: 'Continue',
      back: 'Back',
      coupon: 'Indicative coupon (% p.a.)',
      tvpi: 'Target TVPI',
      barrier: 'Barrier / downside',
      eligibleLine: 'Pre-check qualified households vs IPS sleeve room.',
      reviewFactsheetLead: 'Open factsheet preview before outreach — compliance requires review-first.',
      factsheetPreview: 'Open factsheet preview',
      composeOptIn: 'Opt-in note to clients',
      optInPlaceholder: 'Short opt-in framing for email…',
      sendCta: (n) => `Send opt-in to ${n} clients`,
      successTitle: 'Outreach queued',
      successBody: 'Return to Alts & structured to monitor responses.',
      returnAlts: 'Back to household alts tab',
      prevHash: 'clients/marchetti/alts',
      bookSummarySelected: (n, am) => `${n} clients selected · estimated book allocation ${am}`,
      exit: 'Exit builder',
      suggestedBySlate: 'Suggested by Slate',
    },

    askSlateWm: {
      title: 'Ask Slate',
      contextLine: (name) => `Context · ${name}`,
      disclaimer:
        'Slate summarizes portfolio telemetry and onboarding status in-app. Nothing here is suitability, tax, or execution advice.',
      placeholder: 'Ask about this client…',
      footnoteSources: 'Answer compiled from Slate household snapshot + ingest metadata.',
      outOfScope: 'That topic sits outside ingested Slate data — check custodian feeds or escalate to specialist teams.',
      promptChips: [
        'Where is IPS drift widest?',
        'Summarize diary and review risk.',
        'List top three issuer follow-ups.',
        'What liquidity is callable in 30d?',
      ],
    },

    wmAlerts: {
      regulatory: (shortName) => `${shortName} KYC artefacts pending MLRO review`,
      opportunityIpo: (ticker, d, n) => `${ticker} IPO in ${fmtRelDaysFn(d)} — ${n} households eligible`,
    },
  };

  function fmtRelDaysFn(d) {
    const n = Math.abs(Number(d) || 0);
    return `${n}d`;
  }

  window.Slate.Copy = Copy;
})();
