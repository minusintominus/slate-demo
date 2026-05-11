// Slate — demo disclaimer dialog (parity with SvelteKit DisclaimerModal)
(function initDisclaimerModal() {
  const { Icons } = window.Slate;

  function Row({ label, children }) {
    return (
      <section className="slate-disclaimer-row">
        <div className="slate-disclaimer-row-label">{label}</div>
        <div className="slate-disclaimer-row-body">{children}</div>
      </section>
    );
  }

  function DisclaimerModal({ onClose }) {
    return (
      <div className="slate-disclaimer-backdrop" role="presentation" onMouseDown={onClose}>
        <div
          className="slate-disclaimer-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Demo environment disclaimer"
          tabIndex={-1}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="slate-disclaimer-head">
            <div>
              <div className="slate-disclaimer-eyebrow">Demo environment</div>
              <h2 className="slate-disclaimer-title">This is a demonstration of Slate.</h2>
              <p className="slate-disclaimer-sub">
                Read these notices before clicking around — they apply to every page in this build.
              </p>
            </div>
            <button type="button" className="slate-disclaimer-close" onClick={onClose} aria-label="Close">
              <span dangerouslySetInnerHTML={{ __html: Icons.close }} />
            </button>
          </div>

          <div className="slate-disclaimer-body">
            <Row label="Software vs. data">
              <p>
                Slate is a technology provider; this environment exists only to demonstrate the software.
                Wealth-management firms that license Slate operate it in their own infrastructure — every
                household, account, holding, follow-up, RFQ, and forecast shown here is synthetic. In a production
                deployment, the licensee firm hosts and controls all client data; Slate does not store, process,
                transmit, or have visibility into it.
              </p>
            </Row>
            <Row label="No warranty">
              <p>
                Slate makes no representations or warranties about the accuracy, completeness, suitability,
                security, or confidentiality of any data, calculation, model output, or workflow shown.
                Performance lines, cashflow forecasts, parser confidence figures, and benchmark comparisons are
                illustrative only.
              </p>
            </Row>
            <Row label="Not advice">
              <p>
                Nothing on this site is investment, tax, legal, or accounting advice, and nothing should be relied
                on for any financial decision. Engagement with a licensed wealth manager remains the licensee
                firm&apos;s responsibility.
              </p>
            </Row>
            <Row label="No live actions">
              <p>
                No client communication, order, wire, RFQ, or external request is actually sent from this demo.
                Buttons that appear to perform such actions are simulated; they show success states without
                invoking any real-world system.
              </p>
            </Row>
            <Row label="Feedback build">
              <p>
                The features shown here are exploratory and are being shared to gather feedback. They are not a
                commitment, roadmap, or specification — any production version, if ever built, may differ materially
                or omit these features entirely.
              </p>
            </Row>
            <Row label="Regulated activity">
              <p>
                Slate is not a registered investment adviser, broker-dealer, custodian, or other regulated financial
                institution in any jurisdiction. The workflows depicted (RFQs, onboarding,
                alternative-investment subscriptions, performance reporting, etc.) are how a licensee firm&apos;s
                authorised personnel would use the software — not activity Slate itself performs.
              </p>
            </Row>
            <Row label="No offer · hypothetical performance">
              <p>
                Nothing on this site is an offer, recommendation, or solicitation to buy or sell any security, fund,
                structured product, or other instrument in any jurisdiction. Performance lines, dealer quotes, IRRs,
                DPI / TVPI multiples, capital-call schedules, and benchmark comparisons are simulated and hypothetical
                — they are not actual or back-tested results and must not be relied on to set expectations.
              </p>
            </Row>
            <Row label="Trademarks">
              <p>
                Custodian names, dealer names, fund sponsors, ticker symbols, indices, and benchmarks shown are used
                for illustration only. Their inclusion does not imply endorsement of, partnership with, sponsorship
                by, or any relationship between Slate and the named entities. All trademarks remain the property of
                their respective owners.
              </p>
            </Row>
            <Row label="Don&apos;t enter real data">
              <p>
                Form fields in this demo (onboarding email addresses, RFQ notes, search input, etc.) are unprotected
                client-side inputs. Please do not submit real personal information, real client identifiers, or any
                sensitive data. The demo is not designed for live use and any data entered may persist in your
                browser&apos;s local storage.
              </p>
            </Row>
            <Row label="Confidential · evaluation only">
              <p>
                This build is shared for evaluation. Please do not redistribute, screenshot publicly, or quote it
                without permission. The contents are a snapshot and may change between sessions.
              </p>
            </Row>
          </div>

          <div className="slate-disclaimer-actions">
            <button type="button" className="btn primary" onClick={onClose}>
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  window.Slate.DisclaimerModal = DisclaimerModal;
})();
