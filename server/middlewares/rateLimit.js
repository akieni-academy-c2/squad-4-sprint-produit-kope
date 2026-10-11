import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { consumeRateLimitSlot, purgeRateLimits, rateLimitTableExists } from '../utils/rateLimitStore.js';

/** Repli mémoire : utilisé si RATE_LIMIT_STORE=memory ou si la table n'est pas migrée. */
const buckets = new Map();

const CLEANUP_MS = 15 * 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of buckets) {
    const kept = hits.filter((t) => now - t < CLEANUP_MS);
    if (kept.length === 0) buckets.delete(key);
    else buckets.set(key, kept);
  }
}, 60_000).unref?.();

let store = null;
let checked = false;

async function resolveStore() {
  if (checked) return store;
  checked = true;

  if (env.RATE_LIMIT_STORE === 'memory') {
    store = 'memory';
    console.warn('[rate-limit] RATE_LIMIT_STORE=memory : limite ineffective en déploiement serverless');
    return store;
  }

  store = (await rateLimitTableExists()) ? 'postgres' : 'memory';
  if (store === 'memory')
    console.warn('[rate-limit] table rate_limits absente : repli mémoire (npm run migrate:up)');
  return store;
}

// Balayage horaire des compteurs expirés.
// `resolveStore()` est appelé à chaque tour : sans cela la condition restait
// fausse tant qu'aucune requête rate-limitée n'était passée, et le nettoyage
// ne démarrait jamais.
setInterval(() => {
  resolveStore()
    .then((resolved) => (resolved === 'postgres' ? purgeRateLimits() : null))
    .catch(() => {});
}, 60 * 60_000).unref?.();

function consumeInMemory(id, windowMs, max) {
  const now = Date.now();
  const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  buckets.set(id, hits);
  return true;
}

async function isAllowed(id, windowMs, max) {
  if ((await resolveStore()) !== 'postgres') return consumeInMemory(id, windowMs, max);

  try {
    return (await consumeRateLimitSlot(id, windowMs)) <= max;
  } catch {
    // Base indisponible : on ne bloque pas l'utilisateur pour autant.
    return consumeInMemory(id, windowMs, max);
  }
}

/**
 * Identifie l'appelant.
 *
 * Par défaut l'IP. `byUser` préfère l'identifiant de session quand il existe :
 * un routeur d'entreprise, un réseau partagé ou unefamille entière partagent
 * une IP, et le compteur IP les punit tous ensemble. `fallbackToIp` garde la
 * protection pour les visiteurs non connectés.
 */
function identify(req, byUser) {
  if (!byUser) return `ip:${req.ip}`;
  const userId = req.user?.id ?? req.session?.user?.id;
  return userId != null ? `user:${userId}` : `ip:${req.ip}`;
}

export function rateLimit({ windowMs = 15 * 60_000, max = 20, key = 'default', byUser = false } = {}) {
  return async (req, res, next) => {
    const allowed = await isAllowed(`${key}:${identify(req, byUser)}`, windowMs, max);

    if (!allowed) {
      res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      throw ApiError.tooManyRequests();
    }
    next();
  };
}