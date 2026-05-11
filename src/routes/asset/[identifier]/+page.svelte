<script>
  import { page } from '$app/state';
  import AssetDetailPage from '$lib/features/shared/AssetDetailPage.svelte';

  const symbol = $derived(decodeURIComponent(page.params.identifier));
</script>

<AssetDetailPage {symbol} />
