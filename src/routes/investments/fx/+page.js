import { redirect } from '@sveltejs/kit';

// FX is currently disabled. Block direct URL navigation by redirecting
// any visit to the workspace overview. Re-enable by removing this file.
export function load() {
  throw redirect(307, '/workspace/overview');
}
