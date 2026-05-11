<script>
  import { goto } from '$app/navigation';
  import ClientsPage from '$lib/features/clients/ClientsPage.svelte';
  import { clients } from '$lib/state/app.js';

  const navigate = (path) => goto(path.startsWith('/') ? path : `/workspace/${path}`);
</script>

<ClientsPage clients={$clients} {navigate} />
