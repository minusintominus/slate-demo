import { browser } from '$app/environment';

const KEY = 'slate-custom-clients';
export const EVENT_CHANGED = 'slate-clients-changed';

const mapFamilyType = (clientType) => {
  if (clientType === 'Family office' || clientType === 'FO') return 'FO';
  if (clientType === 'UHNW') return 'UHNW';
  return 'HNW';
};

export const loadClients = () => {
  if (!browser) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveClients = (list) => {
  if (!browser) return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT_CHANGED));
};

export const addClient = (payload) => {
  const id = `c_${Math.random().toString(36).slice(2, 11)}`;
  const name = [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim() || 'New household';
  const record = {
    id,
    name,
    firstName: payload.firstName || '',
    lastName: payload.lastName || '',
    clientType: payload.clientType || 'HNW',
    familyType: mapFamilyType(payload.clientType || 'HNW'),
    relationshipSince: payload.relationshipSince || '',
    email: payload.email || '',
    custodian: payload.custodian || '',
    estAum: payload.estAum || '',
    notes: payload.notes || '',
    portfolioIngested: false,
    createdAt: new Date().toISOString(),
    isCustom: true,
    demoFull: false,
    ytdPct: 0,
    driftLabel: '-',
    driftTone: 'ok',
    reviewInDays: 90,
    reviewTone: 'ok',
    acctCount: 0,
    custodians: payload.custodian || '-'
  };
  const list = loadClients();
  saveClients([record, ...list]);
  return record;
};

export const updateClient = (id, patch) => {
  const list = loadClients();
  const index = list.findIndex((row) => row.id === id);
  if (index < 0) return null;
  list[index] = { ...list[index], ...patch };
  saveClients(list);
  return list[index];
};

export const getClient = (id) => loadClients().find((row) => row.id === id) || null;
