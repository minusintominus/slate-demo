<script>
  import { Card, Page, PageHeader, Section } from '../../components/ui/index.js';
  let {
    title = 'Page',
    eyebrow = 'Workspace',
    body = 'This workspace is queued for a deeper product pass.'
  } = $props();
</script>

<Page>
  <PageHeader>
    <div>
      <div class="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-ink3">{eyebrow}</div>
      <h1 class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance]">{title}</h1>
      <p class="text-ink2 mt-2 max-w-[680px]">{body}</p>
    </div>
  </PageHeader>
  <Section>
    <Card class="p-7">
      <div class="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.12em] text-ink3">Status</div>
      <div class="font-[var(--font-display)] tracking-[-0.015em] [text-wrap:balance] mt-1 text-2xl font-semibold">Coming into scope</div>
      <p class="text-ink2 mt-2">The SvelteKit route is wired and ready for implementation.</p>
    </Card>
  </Section>
</Page>
