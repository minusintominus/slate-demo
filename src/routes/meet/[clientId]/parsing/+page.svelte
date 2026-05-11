<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import IntakePage from '$lib/features/intake/IntakePage.svelte';
  import { setHasPortfolioValue } from '$lib/state/app.js';

  const clientId = $derived(page.params.clientId);
  const onParsed = () => {
    setHasPortfolioValue(true);
    goto(`/meet/${clientId}/review`);
  };
</script>

<IntakePage route="parsing" {onParsed} />
