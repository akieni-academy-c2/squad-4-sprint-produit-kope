import path from "node:path";

/**
 * `process.loadEnvFile` leve quand aucun fichier `.env` n'est present. C'est
 * le cas normal en production sur Vercel, où les variables viennent de la
 * plateforme et non d'un fichier : l'absence n'est donc pas une erreur, et les
 * variables requises sont vérifiées juste après.
 */
try {
  process.loadEnvFile();
} catch {}

const required = ["DATABASE_URL", "SESSION_SECRET"];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0)
  throw new Error(
    `Variables d'environnement manquantes : ${missing.join(", ")}`,
  );

const MIN_SECRET_LENGTH = 32;
if (process.env.SESSION_SECRET.length < MIN_SECRET_LENGTH)
  throw new Error(
    `SESSION_SECRET doit faire au moins ${MIN_SECRET_LENGTH} caractères ` +
      `(actuellement ${process.env.SESSION_SECRET.length})`,
  );

const nodeEnv = process.env.NODE_ENV ?? "development";

export const isProduction = nodeEnv === "production";

export const env = {
  NODE_ENV: nodeEnv,
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  COOKIE_SECURE: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : isProduction,
  UPLOAD_DIR: path.resolve(process.env.UPLOAD_DIR ?? "uploads"),
  MAX_FILE_SIZE_BYTES:
    Number(process.env.MAX_FILE_SIZE_BYTES) || 5 * 1024 * 1024,
  ADMIN_NAME: process.env.ADMIN_NAME || "root",
  ADMIN_PHONE: process.env.ADMIN_PHONE,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER ?? "kope",
  AUTO_BLOCK_REPORTS_THRESHOLD:
    Number(process.env.AUTO_BLOCK_REPORTS_THRESHOLD) || 3,
  AUTO_SUSPEND_REPORTS_THRESHOLD:
    Number(process.env.AUTO_SUSPEND_REPORTS_THRESHOLD) || 5,

  PG_POOL_MAX: Number(process.env.PG_POOL_MAX) || 10,
  PG_CONNECTION_TIMEOUT_MS:
    Number(process.env.PG_CONNECTION_TIMEOUT_MS) || 5000,
  PG_IDLE_TIMEOUT_MS: Number(process.env.PG_IDLE_TIMEOUT_MS) || 10000,

  RATE_LIMIT_STORE: process.env.RATE_LIMIT_STORE ?? "postgres",

  BCRYPT_ROUNDS: clampRounds(Number(process.env.BCRYPT_ROUNDS) || 12),

  SESSION_MAX_AGE_MS:
    Number(process.env.SESSION_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000,
  SESSION_TABLE: process.env.SESSION_TABLE ?? "session",

  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

function clampRounds(rounds) {
  return Math.min(Math.max(Math.round(rounds), 10), 15);
}
