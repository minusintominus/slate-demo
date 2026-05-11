<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import InsightsPage from '$lib/features/insights/InsightsPage.svelte';

  const detailId = $derived(page.params.insightId);
  const clientId = $derived(page.params.clientId);

  const navigate = (path) => goto(path.startsWith('/') ? path : `/workspace/${path}`);
</script>

<InsightsPage
  {detailId}
  {clientId}
  {navigate}
/>
