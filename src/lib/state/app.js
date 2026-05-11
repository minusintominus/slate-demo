import { browser } from '$app/environment';
import { base } from '$app/paths';
import { writable } from 'svelte/store';
import { getMergedClientBook } from '$lib/domain/book.js';

const brandFaviconHref = (themeVal) => {
  const name = themeVal === 'dark' ? 'favicon-dark.png' : 'favicon.png';
  return `${base}/brand/${name}?v=4`;
};

const syncBrandFavicons = (themeVal) => {
  if (!browser) return;
  const href = brandFaviconHref(themeVal);
  for (const id of ['slate-favicon', 'slate-favicon-shortcut']) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('href', href);
  }
};

export const theme = writable('light');
export const hasPortfolio = writable(false);
export const selectedAccts = writable([]);
export const clients = writable([]);
// Currently-loaded meeting client (persists across reloads). Null = no client selected.
export const meetClient = writable(null);
// Trigger flag — any page can flip this true to open the meet picker.
export const meetPickerOpen = writable(false);

export const refreshClients = () => {
  clients.set(getMergedClientBook());
};

export const setThemeValue = (next) => {
  theme.set(next);
  if (!browser) return;
  document.body.dataset.theme = next;
  localStorage.setItem('slate-theme', next);
  syncBrandFavicons(next);
};

export const setSelectedAccounts = (next) => {
  selectedAccts.set(next);
  if (!browser) return;
  localStorage.setItem('slate-filter', JSON.stringify(next));
};

export const setMeetClient = (clientId) => {
  meetClient.set(clientId || null);
  if (!browser) return;
  if (clientId) localStorage.setItem('slate-meet-client', clientId);
  else localStorage.removeItem('slate-meet-client');
};

export const setHasPortfolioValue = (next) => {
  hasPortfolio.set(next);
  if (!browser) return;
  localStorage.setItem('slate-loaded', next ? '1' : '0');
};

export const initAppState = () => {
  if (!browser) return () => {};

  setThemeValue(localStorage.getItem('slate-theme') || 'light');
  hasPortfolio.set(localStorage.getItem('slate-loaded') === '1');
  meetClient.set(localStorage.getItem('slate-meet-client') || null);

  try {
    selectedAccts.set(JSON.parse(localStorage.getItem('slate-filter') || '[]'));
  } catch {
    selectedAccts.set([]);
  }

  refreshClients();
  window.addEventListener('slate-clients-changed', refreshClients);
  return () => window.removeEventListener('slate-clients-changed', refreshClients);
};
