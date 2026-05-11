<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import ClientWorkspacePage from '$lib/features/clients/ClientWorkspacePage.svelte';
  import { resolveClient } from '$lib/domain/book.js';
  import { selectedAccts } from '$lib/state/app.js';

  const client = $derived(resolveClient(page.params.clientId));

  const navigate = (path) => goto(path.startsWith('/') ? path : `/workspace/${path}`);
</script>

{#if client}
  <ClientWorkspacePage {client} tab="insights" accountIds={$selectedAccts} {navigate} />
{/if}
