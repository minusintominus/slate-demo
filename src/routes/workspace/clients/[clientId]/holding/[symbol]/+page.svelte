<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import HoldingDetailPage from '$lib/features/shared/HoldingDetailPage.svelte';

  const symbol = $derived(decodeURIComponent(page.params.symbol));
  const backPath = $derived(`/workspace/clients/${page.params.clientId}/portfolio`);

  const navigate = (path) => goto(path.startsWith('/') ? path : `/workspace/${path}`);
</script>

<HoldingDetailPage
  {symbol}
  {backPath}
  {navigate}
/>
