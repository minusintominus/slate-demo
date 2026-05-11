<script>
  import { page } from '$app/state';
  import MeetAlternativesPage from '$lib/features/investments/MeetAlternativesPage.svelte';
  import { resolveClient } from '$lib/domain/book.js';

  const client = $derived(resolveClient(page.params.clientId));
</script>

<MeetAlternativesPage {client} />
