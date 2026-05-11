<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import HoldingDetailPage from '$lib/features/shared/HoldingDetailPage.svelte';

  const clientId = $derived(page.params.clientId);
  const symbol = $derived(decodeURIComponent(page.params.symbol));

  const navigate = (path) => {
    const base = `/meet/${clientId}`;
    return goto(path.startsWith('/') ? path : `${base}/${path}`);
  };
</script>

<HoldingDetailPage
  {symbol}
  backPath={`/meet/${clientId}/portfolio?tab=holdings`}
  {navigate}
/>
