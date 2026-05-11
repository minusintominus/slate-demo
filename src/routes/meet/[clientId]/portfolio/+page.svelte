<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import HouseholdPage from '$lib/features/household/HouseholdPage.svelte';
  import { resolveClient } from '$lib/domain/book.js';
  import { selectedAccts } from '$lib/state/app.js';

  const clientId = $derived(page.params.clientId);
  const client = $derived(resolveClient(clientId));

  const navigate = (path) => {
    const base = `/meet/${clientId}`;
    if (path.startsWith('portfolio/')) return goto(`${base}/portfolio/holding/${path.slice('portfolio/'.length)}`);
    if (path.startsWith('insights')) return goto(`${base}/${path}`);
    return goto(path.startsWith('/') ? path : `${base}/${path}`);
  };
</script>

<HouseholdPage {client} accountIds={$selectedAccts} {navigate} />
