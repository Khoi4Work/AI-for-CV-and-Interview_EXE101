const STORAGE_KEY = 'smartfolio.analytics.dedupe.v1';
const MAX_KEYS = 100;

function storage() {
  try { return typeof window !== 'undefined' ? window.sessionStorage : null; }
  catch { return null; }
}

function readKeys() {
  const store = storage();
  if (!store) return [];
  try {
    const value = JSON.parse(store.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter((item) => typeof item === 'string').slice(-MAX_KEYS) : [];
  } catch {
    return [];
  }
}

export function claimAnalyticsKey(scope, businessId) {
  const id = String(businessId || '').trim();
  if (!id) return true;
  const key = `${scope}:${id}`;
  const keys = readKeys();
  if (keys.includes(key)) return false;
  const next = [...keys, key].slice(-MAX_KEYS);
  try { storage()?.setItem(STORAGE_KEY, JSON.stringify(next)); }
  catch { /* Analytics dedupe must never block the product flow. */ }
  return true;
}

export function clearAnalyticsDedupe() {
  try { storage()?.removeItem(STORAGE_KEY); }
  catch { /* No-op when storage is unavailable. */ }
}
