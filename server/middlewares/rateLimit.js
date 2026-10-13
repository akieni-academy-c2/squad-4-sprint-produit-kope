import { createHash } from 'node:crypto';
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
    .catch((err) => console.error('[rate-limit] purge impossible', err));
}, 60 * 60_000).unref?.();

function consumeInMemory(id, windowMs, max) {
  const now = Date.now();
  const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  buckets.set(id, hits);
  return true;
}

/** Une dégradation du limiteur est un incident de sécurité, pas un détail. */
let lastStoreWarning = 0;
function warnStoreDegraded(err) {
  const now = Date.now();
  if (now - lastStoreWarning < 60_000) return;
  lastStoreWarning = now;
  console.error('[rate-limit] compteur Postgres indisponible, repli mémoire', err);
}

async function isAllowed(id, windowMs, max) {
  // Un incident de base ne doit pas verrouiller le compteur en mémoire pour
  // toute la durée du processus : le repli était définitif, donc un simple
  // hoquet réseau suffisait à rouvrir le bourrage d'identifiants jusqu'au
  // redémarrage.
  if (!checked) 
    try {
      await resolveStore();
    } catch (err) {
      warnStoreDegraded(err);
    }
  
  if (store !== 'postgres') return consumeInMemory(id, windowMs, max);

  try {
    return (await consumeRateLimitSlot(id, windowMs)) <= max;
  } catch (err) {
    // Base indisponible : on ne bloque pas l'utilisateur pour autant.
    warnStoreDegraded(err);
    return consumeInMemory(id, windowMs, max);
  }
}

/**
 * Identifie l'appelant.
 *
 * Par defaut l'IP. `byUser` prefere l'identifiant de session quand il existe :
 * un routeur d'entreprise, un reseau partage ou une famille entiere partagent
 * une IP, et le compteur IP les punit tous ensemble.
 *
 * Derriere un proxy, l'adresse vue par Express est la derniere entree de
 * `X-Forwarded-For`, qu'un client forge a vontade : une IP par tentative, donc un
 * budget illime. Le bon identifiant pour une connexion est le compte vise, voir
 * `loginLimit`.
 */
function identify(req, byUser) {
  if (!byUser) return `ip:${req.ip}`;
  const userId = req.user?.id ?? req.session?.user?.id;
  return userId != null ? `user:${userId}` : `ip:${req.ip}`;
}

/**
 * Cle de compteur pour une tentative de connexion.
 *
 * Le numero de telephone est l'identifiant de connexion du produit. Le hacher
 * evite de faire figer des numeros en clair dans la table `rate_limits` - table
 * de production, lisible par quiconque y a acces - tout en gardant deux essais
 * sur le meme numero dans le meme compteur, quelle que soit l'IP.
 */
function accountKey(req) {
  const phone = req.validated?.body?.phone;
  if (!phone) return `ip:${req.ip}`;
  return `account:${hashKey(String(phone))}`;
}

/** SHA-256 tronque : 16 octets suffisent, la cle n'a pas vocation a rester secrete. */
function hashKey(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

export function rateLimit({ windowMs = 15 * 60_000, max = 20, key = 'default', byUser = false, byAccount = false } = {}) {
  return async (req, res, next) => {
    const scope = byAccount ? accountKey(req) : identify(req, byUser);
    const allowed = await isAllowed(`${key}:${scope}`, windowMs, max);

    if (!allowed) {
      res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      throw ApiError.tooManyRequests();
    }
    next();
  };
}

/**
 * Limiteur de connexion.
 *
 * Deux compteurs sont necessaires, pas un. Celui par IP arrete le balayage
 * depuis une source unique ; celui par numero arrete le bourrage d'identifiants
 * depuis un botnet. Un seul des deux est contournable.
 *
 * `validate(loginSchema)` doit preceder ce limiteur dans la pile des routes :
 * sans lui le numero n'est pas encore dans `req.validated.body`.
 */
export function loginLimit({ windowMs = 15 * 60_000, maxPerIp = 10, maxPerAccount = 10 } = {}) {
  const byIp = rateLimit({ windowMs, max: maxPerIp, key: 'login-ip' });
  const byAccount = rateLimit({ windowMs, max: maxPerAccount, key: 'login-account', byAccount: true });

  return async function limitLogin(req, res, next) {
    // L'IP d'abord : elle est disponible meme sur un corps invalide, alors que
    // le numero ne l'est pas.
    await byIp(req, res, (err) => {
      if (err) return next(err);
      return byAccount(req, res, next);
    });
  };
}