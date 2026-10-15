import { createHash } from "node:crypto";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import {
  consumeRateLimitSlot,
  purgeRateLimits,
  rateLimitTableExists,
} from "../utils/rateLimitStore.js";

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

  if (env.RATE_LIMIT_STORE === "memory") {
    store = "memory";
    console.warn(
      "[rate-limit] RATE_LIMIT_STORE=memory : limite ineffective en déploiement serverless",
    );
    return store;
  }

  store = (await rateLimitTableExists()) ? "postgres" : "memory";
  if (store === "memory")
    console.warn(
      "[rate-limit] table rate_limits absente : repli mémoire (npm run migrate:up)",
    );
  return store;
}

setInterval(() => {
  resolveStore()
    .then((resolved) => (resolved === "postgres" ? purgeRateLimits() : null))
    .catch((err) => console.error("[rate-limit] purge impossible", err));
}, 60 * 60_000).unref?.();

function consumeInMemory(id, windowMs, max) {
  const now = Date.now();
  const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  buckets.set(id, hits);
  return true;
}
let lastStoreWarning = 0;
function warnStoreDegraded(err) {
  const now = Date.now();
  if (now - lastStoreWarning < 60_000) return;
  lastStoreWarning = now;
  console.error(
    "[rate-limit] compteur Postgres indisponible, repli mémoire",
    err,
  );
}

async function isAllowed(id, windowMs, max) {
  if (!checked)
    try {
      await resolveStore();
    } catch (err) {
      warnStoreDegraded(err);
    }

  if (store !== "postgres") return consumeInMemory(id, windowMs, max);

  try {
    return (await consumeRateLimitSlot(id, windowMs)) <= max;
  } catch (err) {
    warnStoreDegraded(err);
    return consumeInMemory(id, windowMs, max);
  }
}

function identify(req, byUser) {
  if (!byUser) return `ip:${req.ip}`;
  const userId = req.user?.id ?? req.session?.user?.id;
  return userId != null ? `user:${userId}` : `ip:${req.ip}`;
}

function accountKey(req) {
  const phone = req.validated?.body?.phone;
  if (!phone) return `ip:${req.ip}`;
  return `account:${hashKey(String(phone))}`;
}
function hashKey(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export function rateLimit({
  windowMs = 15 * 60_000,
  max = 20,
  key = "default",
  byUser = false,
  byAccount = false,
} = {}) {
  return async (req, res, next) => {
    const scope = byAccount ? accountKey(req) : identify(req, byUser);
    const allowed = await isAllowed(`${key}:${scope}`, windowMs, max);

    if (!allowed) {
      res.set("Retry-After", String(Math.ceil(windowMs / 1000)));
      throw ApiError.tooManyRequests();
    }
    next();
  };
}

export function loginLimit({
  windowMs = 15 * 60_000,
  maxPerIp = 10,
  maxPerAccount = 10,
} = {}) {
  const byIp = rateLimit({ windowMs, max: maxPerIp, key: "login-ip" });
  const byAccount = rateLimit({
    windowMs,
    max: maxPerAccount,
    key: "login-account",
    byAccount: true,
  });

  return async function limitLogin(req, res, next) {
    await byIp(req, res, (err) => {
      if (err) return next(err);
      return byAccount(req, res, next);
    });
  };
}
