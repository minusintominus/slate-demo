<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import IntakePage from '$lib/features/intake/IntakePage.svelte';

  const clientId = $derived(page.params.clientId);
  const onUpload = () => goto(`/meet/${clientId}/parsing`);
</script>

<IntakePage route="upload" {onUpload} />
