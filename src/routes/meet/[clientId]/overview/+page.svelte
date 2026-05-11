<script>
  import { page } from '$app/state';
  import BriefingPage from '$lib/features/briefing/BriefingPage.svelte';
  import { resolveClient } from '$lib/domain/book.js';

  const client = $derived(resolveClient(page.params.clientId));
</script>

<BriefingPage {client} />
