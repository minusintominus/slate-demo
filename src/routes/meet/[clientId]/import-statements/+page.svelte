<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import ImportStatementsPage from '$lib/features/intake/ImportStatementsPage.svelte';
  import { accountsFor, positionsFor, resolveClient } from '$lib/domain/book.js';
  import { setHasPortfolioValue } from '$lib/state/app.js';

  const clientId = $derived(page.params.clientId);
  const client = $derived(resolveClient(clientId));
  const positions = $derived(positionsFor(clientId));
  const accounts = $derived(accountsFor(clientId));

  const onConfirm = () => {
    setHasPortfolioValue(true);
    goto(`/meet/${clientId}/overview`);
  };
</script>

<ImportStatementsPage clientName={client?.name || 'household'} {positions} {accounts} {onConfirm} />
