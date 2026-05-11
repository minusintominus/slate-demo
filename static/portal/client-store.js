// Slate — persisted WM-created households (demo: localStorage)

(function () {
  const KEY = 'slate-custom-clients';
  const CHANGED = 'slate-clients-changed';

  function mapFamilyType(clientType) {
    if (clientType === 'Family office' || clientType === 'FO') return 'FO';
    if (clientType === 'UHNW') return 'UHNW';
    return 'HNW';
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = JSON.parse(raw || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function bump() {
    try {
      window.dispatchEvent(new Event(CHANGED));
    } catch (e) { /* ignore */ }
  }

  function addClient(payload) {
    const id = 'c_' + Math.random().toString(36).slice(2, 11);
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
      driftLabel: '—',
      driftTone: 'ok',
      reviewInDays: 90,
      reviewTone: 'ok',
      acctCount: 0,
      custodians: payload.custodian || '—',
    };
    const list = load();
    list.unshift(record);
    save(list);
    bump();
    return record;
  }

  function get(id) {
    return load().find(c => c.id === id) || null;
  }

  function update(id, patch) {
    const list = load();
    const i = list.findIndex(c => c.id === id);
    if (i < 0) return null;
    list[i] = { ...list[i], ...patch };
    save(list);
    bump();
    return list[i];
  }

  function list() {
    return load();
  }

  window.Slate = window.Slate || {};
  window.Slate.ClientStore = { addClient, get, update, list, load, save, EVENT_CHANGED: CHANGED };
})();
