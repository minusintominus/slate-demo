<script>
  import { Button, Card, Page, PageHeader, Section } from '../../components/ui/index.js';
  import { HOUSEHOLD } from '../../data/fixtures.js';
  import { accountsFor, briefingFor, positionsFor } from '../../domain/book.js';
  import { dateLong, dateShort, daysFrom, money, sum } from '../../domain/format.js';
  import { Icons } from '../../components/ui/icons.js';

  let { client = null } = $props();
  const householdName = $derived(client?.name || HOUSEHOLD.name);
  const briefing = $derived(briefingFor(client?.id));
  const positions = $derived(positionsFor(client?.id));
  const accounts = $derived(accountsFor(client?.id));
  const today = '2026-05-08';

  const netWorth = $derived(sum(positions, (p) => p.mv));
  const nextMeetingDays = $derived(daysFrom(briefing.nextMeeting.date, today));
  // Per-client briefings may not all have contact logs / news / personal
  // notes — fall back to last-meeting date / empty arrays so the page
  // renders cleanly across every household.
  const contactLog = $derived(briefing.contactLog || []);
  const news = $derived(briefing.news || []);
  const personalNotes = $derived(briefing.personalNotes || []);
  const upcoming = $derived(briefing.upcoming || []);
  const followUps = $derived(briefing.followUps || []);
  const lastContactDays = $derived(
    contactLog[0]?.date ? -daysFrom(contactLog[0].date, today) : -daysFrom(briefing.lastMeeting.date, today)
  );

  const openFollowUps = $derived(followUps.filter((f) => f.status !== 'completed'));
  const closedFollowUps = $derived(followUps.filter((f) => f.status === 'completed'));
  const overdueFollowUps = $derived(openFollowUps.filter((f) => daysFrom(f.due, today) < 0));
  const thisWeekEvents = $derived(upcoming.filter((e) => {
    const d = daysFrom(e.date, today);
    return d <= 7 && d >= 0;
  }));
  const highPriorityWeek = $derived(thisWeekEvents.filter((e) => e.priority === 'high'));
  const highPriority14 = $derived(upcoming.filter((e) => {
    const d = daysFrom(e.date, today);
    return e.priority === 'high' && d <= 14 && d >= 0;
  }));

  const KIND_TONE = {
    deadline: 'warn',
    personal: '',
    rfq: 'accent',
    meeting: 'accent',
    close: '',
    tax: 'warn',
    obs: '',
    email: '',
    call: '',
    note: ''
  };
</script>

<Page>
  <PageHeader>
    <div>
      <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{dateLong(today)} · 14:08 ET</div>
      <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">{householdName}</h1>
      <p class="text-ink2 mt-2 max-w-[720px]">
        {client?.familyType || HOUSEHOLD.segment} · relationship since {client?.relationshipSince || HOUSEHOLD.founded} · {accounts.length} accounts · NW {money(netWorth, { compact: true })} · RM {HOUSEHOLD.rm}.
      </p>
    </div>
    <div class="briefing-meta">
      <div class="briefing-stat">
        <span class="cf-label">Last contact</span>
        <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] meta-num">{lastContactDays}d ago</span>
      </div>
      <div class="briefing-stat">
        <span class="cf-label">Next meeting in</span>
        <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] meta-num" class:text-accent={nextMeetingDays <= 7}>{nextMeetingDays}d</span>
      </div>
    </div>
  </PageHeader>

  <Section>
    <div class="row-between baseline">
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Needs attention</h2>
      <span class="text-ink3 text-xs">
        {overdueFollowUps.length} overdue · {highPriorityWeek.length} high-priority this week
      </span>
    </div>
    <Card class="mt-3 p-0">
      {#each overdueFollowUps as f (f.id || `${f.commit}|${f.due}`)}
        <div class="attn-row">
          <div class="attn-body">
            <div class="attn-head">
              <span class="tag neg">overdue · {-daysFrom(f.due, today)}d</span>
              <span class="attn-title">{f.commit}</span>
            </div>
            <div class="attn-sub">{f.owner} · was due {dateShort(f.due)}</div>
          </div>
          <Button variant="ghost" size="sm">Open</Button>
        </div>
      {/each}
      {#each highPriority14 as e (e.date + e.label)}
        <div class="attn-row">
          <div class="attn-body">
            <div class="attn-head">
              <span class="tag warn">in {daysFrom(e.date, today)}d</span>
              <span class="attn-title">{e.label}</span>
            </div>
            <div class="attn-sub">{dateShort(e.date)} · {e.kind}</div>
          </div>
          <Button variant="ghost" size="sm">Open</Button>
        </div>
      {/each}
      {#if overdueFollowUps.length === 0 && highPriority14.length === 0}
        <div class="attn-row attn-empty">All clear — no overdue commitments or high-priority items in the next two weeks.</div>
      {/if}
    </Card>
  </Section>

  <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
    <Card class="p-6">
      <div class="row-between baseline">
        <span class="cf-label">Next meeting</span>
        <span class="text-ink3 text-xs font-[var(--font-mono)]">in {nextMeetingDays}d</span>
      </div>
      <div class="font-[var(--font-display)] meeting-type">{briefing.nextMeeting.type}</div>
      <div class="text-ink3 text-sm mt-2">{dateLong(briefing.nextMeeting.date)} · {briefing.nextMeeting.time}</div>
      <div class="text-ink3 text-sm">{briefing.nextMeeting.location}</div>
      <hr class="b-divider" />
      <div class="cf-label">Attendees</div>
      <div class="text-sm mt-1">{briefing.nextMeeting.attendees.join(' · ')}</div>
      <div class="cf-label mt-3">Agenda</div>
      <ul class="agenda">
        {#each briefing.nextMeeting.agenda as a (a)}<li>{a}</li>{/each}
      </ul>
      <div class="row gap-2 mt-4">
        <Button variant="primary">Build prep deck</Button>
        <Button variant="ghost">Reschedule</Button>
      </div>
    </Card>
    <Card class="p-6">
      <div class="row-between baseline">
        <span class="cf-label">Last meeting</span>
        <span class="text-ink3 text-xs font-[var(--font-mono)]">{-daysFrom(briefing.lastMeeting.date, today)}d ago</span>
      </div>
      <div class="font-[var(--font-display)] meeting-type">{briefing.lastMeeting.type}</div>
      <div class="text-ink3 text-sm mt-2">{dateLong(briefing.lastMeeting.date)} · {briefing.lastMeeting.attendees.join(', ')}</div>
      <hr class="b-divider" />
      <p class="text-ink2 text-sm">{briefing.lastMeeting.summary}</p>
      <div class="text-ink3 text-xs mt-3">
        {closedFollowUps.length} of {followUps.length} follow-ups closed since.
      </div>
    </Card>
  </Section>

  <Section>
    <div class="row-between baseline">
      <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Open follow-ups</h2>
      <span class="text-ink3 text-xs">{openFollowUps.length} open · {closedFollowUps.length} closed</span>
    </div>
    <div class="b-table-wrap mt-3">
      <table class="b-table">
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
          {#each followUps as f (f.id || `${f.commit}|${f.due}`)}
            {@const overdue = daysFrom(f.due, today) < 0 && f.status !== 'completed'}
            {@const dueDays = daysFrom(f.due, today)}
            <tr>
              <td class="dot-col">
                <span class={`dot ${f.status === 'completed' ? 'pos' : overdue ? 'warn' : f.priority === 'high' ? 'neg' : 'ink'}`}></span>
              </td>
              <td class="b-commit" class:done={f.status === 'completed'}>{f.commit}</td>
              <td class="text-ink3 text-xs">{f.owner}</td>
              <td>
                <div class="font-[var(--font-mono)] text-xs">{dateShort(f.due)}</div>
                <div class="due-sub" class:overdue>
                  {f.status === 'completed' ? 'closed' : overdue ? `${-dueDays}d overdue` : dueDays === 0 ? 'today' : `in ${dueDays}d`}
                </div>
              </td>
              <td>
                <span class={`tag ${f.status === 'completed' ? 'pos' : f.status === 'in_progress' ? 'accent' : overdue ? 'neg' : ''}`}>{f.status.replace('_', ' ')}</span>
              </td>
              <td><Button variant="ghost" size="sm">Open</Button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Section>

  <Section>
    <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Upcoming · 30 days</h2>
    <div class="text-ink3 text-xs mt-1">Compliance dates, deal closes, observations, personal events.</div>
    <Card class="mt-3 p-0">
      {#each upcoming as e, i (e.date + e.label)}
        <div class="upcoming-row" class:no-border={i === upcoming.length - 1}>
          <span class="font-[var(--font-mono)] text-xs upcoming-date">{dateShort(e.date)}</span>
          <span class={`tag upcoming-kind ${KIND_TONE[e.kind] || ''}`}>{e.kind}</span>
          <span class="upcoming-label">{e.label}</span>
          <span class="font-[var(--font-mono)] text-xs upcoming-delta">+{daysFrom(e.date, today)}d</span>
        </div>
      {/each}
    </Card>
  </Section>

  <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
    <Card class="p-6">
      <h3 class="font-[var(--font-display)] m-0 family-title">Family</h3>
      <hr class="b-divider" />
      <div class="b-people">
        <div><b>{briefing.family.primary.name}</b><span class="text-ink3"> · {briefing.family.primary.role} · {briefing.family.primary.age}</span></div>
        <div><b>{briefing.family.spouse.name}</b><span class="text-ink3"> · {briefing.family.spouse.role} · {briefing.family.spouse.age}</span></div>
        {#each briefing.family.children as c (c.name)}
          <div><b>{c.name}</b><span class="text-ink3"> · {c.age} · {c.status}</span></div>
        {/each}
      </div>
      {#if personalNotes.length > 0}
        <hr class="b-divider mt-4" />
        <div class="cf-label mb-2">Notes</div>
        <ul class="b-notes">
          {#each personalNotes.slice(0, 3) as n (n)}<li>{n}</li>{/each}
        </ul>
      {/if}
    </Card>
    <Card class="p-6">
      <h3 class="font-[var(--font-display)] m-0 family-title">Team & advisors</h3>
      <hr class="b-divider" />
      <div class="cf-label">Slate team</div>
      <div class="b-people mt-2">
        {#each briefing.team as t (t.name)}
          <div><b>{t.name}</b><span class="text-ink3"> · {t.role}{t.primary ? ' · primary' : ''}</span></div>
        {/each}
      </div>
      <hr class="b-divider mt-4" />
      <div class="cf-label">External advisors</div>
      <div class="b-people mt-2">
        {#each briefing.external as e (e.name)}
          <div><b>{e.role}</b><span class="text-ink3"> · {e.name}</span></div>
        {/each}
      </div>
    </Card>
  </Section>

  {#if contactLog.length > 0 || news.length > 0}
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5">
      {#if contactLog.length > 0}
        <div>
          <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Recent contact</h2>
          <div class="text-ink3 text-xs mt-1">Last 30 days.</div>
          <Card class="mt-3 p-0">
            {#each contactLog as c, i (c.date + c.subject)}
              <div class="contact-row" class:no-border={i === contactLog.length - 1}>
                <span class="font-[var(--font-mono)] text-xs contact-date">{dateShort(c.date)}</span>
                <span class="tag contact-kind">{c.kind}</span>
                <span class="contact-body">{c.subject}<span class="text-ink3"> · {c.with}</span></span>
              </div>
            {/each}
          </Card>
        </div>
      {/if}
      {#if news.length > 0}
        <div>
          <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Portfolio news</h2>
          <div class="text-ink3 text-xs mt-1">Headlines on held positions.</div>
          <Card class="mt-3 p-0">
            {#each news as n, i (n.date + n.headline)}
              <div class="contact-row" class:no-border={i === news.length - 1}>
                <span class="font-[var(--font-mono)] text-xs contact-date">{dateShort(n.date)}</span>
                <span class={`tag contact-kind ${n.impact === 'positive' ? 'pos' : n.impact === 'caution' ? 'warn' : ''}`}>{n.position}</span>
                <span class="contact-body">{n.headline}</span>
              </div>
            {/each}
          </Card>
        </div>
      {/if}
    </Section>
  {/if}

  <div class="action-bar">
    <Button variant="ghost">Open thread</Button>
    <Button variant="ghost">Log contact</Button>
    <Button variant="primary">Build prep deck {@html Icons.arrow}</Button>
  </div>
</Page>

<style>
  .cf-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-3);
  }

  .briefing-meta {
    display: flex;
    gap: 28px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .briefing-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .meta-num {
    font-size: 22px;
  }
  @media (min-width: 769px) {
    .briefing-meta {
      flex-direction: column;
      gap: 14px;
      align-items: flex-end;
    }
    .briefing-stat {
      align-items: flex-end;
    }
  }

  .row-between {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .row-between.baseline {
    align-items: baseline;
  }
  .row {
    display: flex;
  }
  .gap-2 { gap: 8px; }

  /* ── Tag (shared minimal styles) ─────────────────────────────────── */
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    background: var(--surface-2);
    color: var(--ink-2);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-sm);
    font-size: 11px;
    font-family: var(--font-mono);
    letter-spacing: 0.06em;
  }
  .tag.neg {
    background: var(--neg-soft);
    color: var(--neg);
    border-color: var(--neg-soft);
  }
  .tag.pos {
    background: color-mix(in oklch, var(--pos) 14%, var(--surface));
    color: var(--pos);
    border-color: color-mix(in oklch, var(--pos) 22%, var(--surface));
  }
  .tag.warn {
    background: var(--warn-soft);
    color: var(--warn);
    border-color: var(--warn-soft);
  }
  .tag.accent {
    background: var(--accent-soft);
    color: var(--accent);
    border-color: var(--accent-soft);
  }

  /* ── Needs attention ─────────────────────────────────────────────── */
  .attn-row {
    display: flex;
    padding: 14px 18px;
    border-bottom: 1px solid var(--rule-2);
    align-items: center;
    gap: 12px;
  }
  .attn-row:last-child { border-bottom: 0; }
  .attn-body { flex: 1; min-width: 0; }
  .attn-head {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .attn-title { font-size: 14px; font-weight: 500; }
  .attn-sub {
    color: var(--ink-3);
    font-size: 11.5px;
    margin-top: 4px;
  }
  .attn-empty {
    color: var(--ink-3);
    font-size: 13px;
    text-align: center;
    padding: 20px;
  }

  /* ── Meeting cards ───────────────────────────────────────────────── */
  .meeting-type {
    font-size: 22px;
    font-weight: 600;
    margin-top: 6px;
    line-height: 1.2;
  }
  .b-divider {
    border: 0;
    border-top: 1px dashed var(--rule-2);
    margin: 14px 0;
  }
  .agenda {
    margin: 4px 0 0;
    padding-left: 16px;
    font-size: 13px;
    line-height: 1.7;
  }

  /* ── Follow-ups table ────────────────────────────────────────────── */
  .b-table-wrap {
    overflow-x: auto;
    background: var(--surface);
    border: 1px solid var(--rule-2);
    border-radius: var(--r-md);
  }
  .b-table {
    width: 100%;
    min-width: 700px;
    border-collapse: collapse;
    font-size: 13px;
  }
  .b-table thead th {
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
  .b-table tbody td {
    padding: 12px;
    border-bottom: 1px solid var(--rule-2);
    vertical-align: middle;
  }
  .b-table tbody tr:last-child td { border-bottom: 0; }
  .b-commit.done {
    text-decoration: line-through;
    opacity: 0.55;
  }
  .dot-col {
    width: 24px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .dot.ink { background: var(--ink); }
  .dot.warn { background: var(--warn); }
  .dot.neg { background: var(--neg); }
  .dot.pos { background: var(--pos); }
  .due-sub {
    font-size: 10.5px;
    color: var(--ink-3);
  }
  .due-sub.overdue { color: var(--neg); }

  /* ── Upcoming list ───────────────────────────────────────────────── */
  .upcoming-row {
    display: flex;
    padding: 12px 18px;
    border-bottom: 1px solid var(--rule-2);
    align-items: center;
    gap: 12px;
  }
  .upcoming-row.no-border { border-bottom: 0; }
  .upcoming-date {
    width: 80px;
    color: var(--ink-3);
    flex-shrink: 0;
  }
  .upcoming-kind {
    min-width: 90px;
    justify-content: center;
    flex-shrink: 0;
  }
  .upcoming-label {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .upcoming-delta {
    width: 70px;
    text-align: right;
    color: var(--ink-3);
    flex-shrink: 0;
  }
  @media (max-width: 768px) {
    .upcoming-row {
      flex-wrap: wrap;
      padding: 12px 14px;
      gap: 8px;
    }
    .upcoming-date {
      width: auto;
    }
    .upcoming-kind {
      min-width: 0;
      padding: 2px 8px;
    }
    .upcoming-delta {
      margin-left: auto;
      width: auto;
    }
    .upcoming-label {
      flex: 1 0 100%;
      white-space: normal;
      overflow: visible;
    }
  }

  /* ── Family / team panels ───────────────────────────────────────── */
  .family-title {
    font-size: 16px;
    font-weight: 600;
  }
  .b-people {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
  }
  .b-notes {
    margin: 0;
    padding-left: 16px;
    font-size: 12px;
    color: var(--ink-3);
    line-height: 1.6;
  }

  /* ── Contact / news lists ───────────────────────────────────────── */
  .contact-row {
    display: flex;
    padding: 12px 18px;
    border-bottom: 1px solid var(--rule-2);
    align-items: baseline;
    gap: 12px;
  }
  .contact-row.no-border { border-bottom: 0; }
  .contact-date {
    width: 60px;
    color: var(--ink-3);
    flex-shrink: 0;
  }
  .contact-kind {
    min-width: 64px;
    justify-content: center;
    font-size: 10.5px;
  }
  .contact-body {
    flex: 1;
    font-size: 13px;
  }

  /* ── Sticky action bar ─────────────────────────────────────────── */
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

  /* On phones, keep all three actions on a single row by sharing width
     and trimming padding so the labels still fit. The trailing arrow on
     "Build prep deck" pushes the text off-center inside its equal-width
     cell, so drop icons on mobile and let the labels truly center. */
  @media (max-width: 768px) {
    .action-bar {
      flex-wrap: nowrap;
      justify-content: stretch;
      gap: 6px;
    }
    .action-bar :global(.button) {
      flex: 1 1 0;
      min-width: 0;
      padding: 9px 6px;
      font-size: 12px;
      justify-content: center;
    }
    .action-bar :global(.button .ic) {
      display: none;
    }
  }
</style>
