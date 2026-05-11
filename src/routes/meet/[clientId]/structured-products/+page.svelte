<script>
  import { page } from '$app/state';
  import StructuredProductsPage from '$lib/features/investments/StructuredProductsPage.svelte';
  import { resolveClient } from '$lib/domain/book.js';

  const client = $derived(resolveClient(page.params.clientId));
</script>

<StructuredProductsPage {client} />
