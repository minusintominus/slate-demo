/** Same key/values as demo-esli `book.jsx` — shared with embedded `/slate-esli` SPA. */
export const SLATE_DEMO_ROLE_KEY = 'slate-demo-role';

/** @returns {'wm' | 'client' | 'compliance' | null} */
export function getDemoRole() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const r = localStorage.getItem(SLATE_DEMO_ROLE_KEY);
    if (r === 'wm' || r === 'client' || r === 'compliance') return r;
    return null;
  } catch {
    return null;
  }
}

/** @param {'wm' | 'client' | 'compliance'} r */
export function setDemoRole(r) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SLATE_DEMO_ROLE_KEY, r);
  } catch {
    /* ignore */
  }
}

export function clearDemoRole() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(SLATE_DEMO_ROLE_KEY);
  } catch {
    /* ignore */
  }
}

export function isKitWealthManagerPath(pathname) {
  return (
    pathname.startsWith('/workspace') ||
    pathname.startsWith('/meet') ||
    pathname.startsWith('/investments') ||
    pathname.startsWith('/asset')
  );
}
