<script>
  import { goto } from '$app/navigation';
  import DashboardPage from '$lib/features/dashboard/DashboardPage.svelte';
  import { clients } from '$lib/state/app.js';

  const navigate = (path) => goto(path.startsWith('/') ? path : `/workspace/${path}`);
</script>

<DashboardPage clients={$clients} {navigate} />
