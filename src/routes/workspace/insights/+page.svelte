<script>
  import { goto } from '$app/navigation';
  import InsightsPage from '$lib/features/insights/InsightsPage.svelte';

  const navigate = (path) => goto(path.startsWith('/') ? path : `/workspace/${path}`);
</script>

<InsightsPage {navigate} />
