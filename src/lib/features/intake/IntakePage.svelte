<script>
  import { Bar, Button, Card, DataTable, Page, PageHeader, Section } from '../../components/ui/index.js';
  import { STATEMENTS } from '../../data/fixtures.js';
  import { money } from '../../domain/format.js';
  import { Icons } from '../../components/ui/icons.js';

  let {
    route = 'upload',
    onUpload = () => {},
    onParsed = () => {},
    onConfirm = () => {}
  } = $props();
</script>

<Page>
  {#if route === 'upload'}
    <PageHeader>
      <div>
        <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">Intake</div>
        <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Upload statement package</h1>
        <p class="text-ink2 mt-2 max-w-[680px]">Bring in custodian statements to build the household workspace, holdings, and review exceptions.</p>
      </div>
    </PageHeader>
    <Section class="grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-6">
      <Card as="button" class="border-dashed p-8 text-left" onclick={onUpload}>
        <span class="inline-flex rounded-[var(--r-md)] border border-[var(--rule-2)] p-3">{@html Icons.upload}</span>
        <h2 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-5 text-2xl">Drop PDFs here</h2>
        <p class="text-ink2 mt-2">Demo import uses four March 2026 statements.</p>
      </Card>
      <Card class="p-6">
        <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Expected package</div>
        <div class="flex flex-col space-y-2 mt-4">
          {#each STATEMENTS as statement}
            <div class="flex justify-between gap-3 border-b border-dashed border-[var(--rule-2)] pb-2">
              <span>{statement.file}</span>
              <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{money(statement.value, { compact: true })}</span>
            </div>
          {/each}
        </div>
      </Card>
    </Section>
  {:else if route === 'parsing'}
    <PageHeader>
      <div>
        <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">Intake · parsing</div>
        <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Reading statements</h1>
        <p class="text-ink2 mt-2 max-w-[680px]">Positions, accounts, and exceptions are being extracted from the statement package.</p>
      </div>
      <Button variant="primary" onclick={onParsed}>Finish parse</Button>
    </PageHeader>
    <Section>
      <Card class="p-6">
        <div class="flex flex-col space-y-3.5">
          {#each STATEMENTS as statement}
            <div>
              <div class="flex mb-2 justify-between">
                <span>{statement.file}</span>
                <span class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{statement.extracted} positions</span>
              </div>
              <Bar tone="pos" value={Math.min(100, (statement.extracted / Math.max(1, statement.pages)) * 100)} />
            </div>
          {/each}
        </div>
      </Card>
    </Section>
  {:else}
    <PageHeader>
      <div>
        <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">Intake · review</div>
        <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">Parse review</h1>
        <p class="text-ink2 mt-2 max-w-[680px]">Review statement coverage and flagged records before opening the client workspace.</p>
      </div>
      <Button variant="primary" onclick={onConfirm}>Confirm workspace</Button>
    </PageHeader>
    <Section>
      <DataTable>
          <thead><tr><th>File</th><th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Pages</th><th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Extracted</th><th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Value</th><th class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">Flagged</th></tr></thead>
          <tbody>
            {#each STATEMENTS as statement}
              <tr>
                <td>{statement.file}</td>
                <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{statement.pages}</td>
                <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{statement.extracted}</td>
                <td class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{money(statement.value, { compact: true })}</td>
                <td class:text-warn={statement.flagged > 0} class="font-[var(--font-mono)] [font-feature-settings:'tnum'_on] tracking-[-0.01em]">{statement.flagged}</td>
              </tr>
            {/each}
          </tbody>
        </DataTable>
    </Section>
  {/if}
</Page>
