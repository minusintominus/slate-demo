<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import InsightsPage from '$lib/features/insights/InsightsPage.svelte';

  const clientId = $derived(page.params.clientId);
  const detailId = $derived(page.params.insightId);

  const navigate = (path) => {
    const base = `/meet/${clientId}`;
    return goto(path.startsWith('/') ? path : `${base}/${path}`);
  };
</script>

<InsightsPage {clientId} {detailId} {navigate} />
