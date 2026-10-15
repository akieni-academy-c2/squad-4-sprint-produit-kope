const store = new Map();

/**
 * Cache mémoire à durée de vie, pour les lectures répétées et peu volatiles.
 * Vidé au redémarrage du serveur : c'est un accelerateur, jamais une source de
 * vérité, et toute écriture passe par `cacheInvalidate`.
 * @param {string} key clé du cache
 * @returns {unknown} la valeur fraîche, ou `undefined` si absente ou périmée
 */
export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * @param {string} key clé du cache
 * @param {unknown} value valeur à conserver
 * @param {number} ttlMs durée de vie en millisecondes
 * @returns {unknown} la valeur stockée
 */
export function cacheSet(key, value, ttlMs) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

/**
 * Renvoie la valeur en cache, ou la charge puis la mémorise. Deux appels
 * simultanés partagent la même promesse : une rafale de requêtes ne part pas en
 * autant d'allers-retours vers la base.
 * @param {string} key clé du cache
 * @param {number} ttlMs durée de vie en millisecondes
 * @param {() => Promise<unknown>} loader charge si absente
 * @returns {Promise<unknown>} la valeur en cache ou fraîchement chargée
 */
export async function cached(key, ttlMs, loader) {
  const hit = cacheGet(key);
  if (hit !== undefined) return hit;

  const pending = store.get(`${key}:pending`);
  if (pending) return pending.value;

  const promise = loader()
    .then((value) => cacheSet(key, value, ttlMs))
    .finally(() => store.delete(`${key}:pending`));

  store.set(`${key}:pending`, { value: promise });
  return promise;
}

/**
 * Vide toutes les clés dont le préfixe correspond. Toute écriture sur le
 * référentiel passe par ici, pour que les listes publiques et celles de
 * l'administration ne puissent pas diverger.
 * @param {string} prefix préfixe des clés à vider
 * @returns {void} rien
 */
export function cacheInvalidate(prefix) {
  for (const key of store.keys()) if (key.startsWith(prefix)) store.delete(key);
}
