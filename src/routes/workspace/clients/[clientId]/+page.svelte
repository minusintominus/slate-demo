<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  onMount(() => {
    goto(`/workspace/clients/${page.params.clientId}/portfolio`, { replaceState: true });
  });
</script>
