const store = new Map();

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function cacheSet(key, value, ttlMs = 60000) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

export async function cached(key, ttlMs, loader) {
  const hit = cacheGet(key);
  if (hit !== undefined) return hit;
  const value = await loader();
  return cacheSet(key, value, ttlMs);
}

export function cacheInvalidate(prefix) {
  for (const key of store.keys())
    if (key.startsWith(prefix)) store.delete(key);

}
