import path from 'node:path';
try {
  process.loadEnvFile();
} catch { /* ignore */ }

const required = ['DATABASE_URL', 'SESSION_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0)
  throw new Error(`Variables d'environnement manquantes : ${missing.join(', ')}`);

// Un secret court rendrait le cookie de session falsifiable. Le refus est
// deliberé : mieux vaut un démarrage en échec qu'un déploiement silencieux
// avec une clé dev laissée en place.
const MIN_SECRET_LENGTH = 32;
if (process.env.SESSION_SECRET.length < MIN_SECRET_LENGTH)
  throw new Error(
    `SESSION_SECRET doit faire au moins ${MIN_SECRET_LENGTH} caractères ` +
      `(actuellement ${process.env.SESSION_SECRET.length})`,
  );

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const isProduction = nodeEnv === 'production';

export const env = {
  NODE_ENV: nodeEnv,
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  COOKIE_SECURE: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : isProduction,
  UPLOAD_DIR: path.resolve(process.env.UPLOAD_DIR ?? 'uploads'),
  MAX_FILE_SIZE_BYTES: Number(process.env.MAX_FILE_SIZE_BYTES) || 5 * 1024 * 1024,
  ADMIN_PHONE: process.env.ADMIN_PHONE,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER ?? 'kope',
  // Nombre de signalements déclenchant le blocage automatique du compte.
  AUTO_BLOCK_REPORTS_THRESHOLD: Number(process.env.AUTO_BLOCK_REPORTS_THRESHOLD) || 3,
  // Nombre de signalements déclenchant la suspension (plus forte que le blocage).
  AUTO_SUSPEND_REPORTS_THRESHOLD: Number(process.env.AUTO_SUSPEND_REPORTS_THRESHOLD) || 5,

  // Pool de connexions PostgreSQL.
  PG_POOL_MAX: Number(process.env.PG_POOL_MAX) || 10,
  PG_CONNECTION_TIMEOUT_MS: Number(process.env.PG_CONNECTION_TIMEOUT_MS) || 5000,
  PG_IDLE_TIMEOUT_MS: Number(process.env.PG_IDLE_TIMEOUT_MS) || 10000,

  // Compteur de tentatives partagé : `postgres` ou `memory`.
  RATE_LIMIT_STORE: process.env.RATE_LIMIT_STORE ?? 'postgres',

  // Coût bcrypt. 12 est le plancher recommandé par l'OWASP depuis 2022 :
  // à 10, un GPU courant casse un hash environ cent fois plus vite, ce qui ne
  // change rien à l'expérience de connexion (une saisie de mot de passe dure
  // bien plus longtemps que ~250 ms) mais change tout si la base fuit.
  BCRYPT_ROUNDS: clampRounds(Number(process.env.BCRYPT_ROUNDS) || 12),

  SESSION_MAX_AGE_MS: Number(process.env.SESSION_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000,
  SESSION_TABLE: process.env.SESSION_TABLE ?? 'session',

  // Origines autorisées à émettre une requête mutante (CSRF). Vide signifie
  // « même origine que la requête » : le cas normal du SPA servi à côté de
  // l'API. À renseigner derrière un domaine distinct de l'API.
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

/** Borne le coût bcrypt : sous 10 il est trivial, au-dessus de 15 la
 *  vérification bloque le pool de connexions plus qu'elle ne protège. */
function clampRounds(rounds) {
  return Math.min(Math.max(Math.round(rounds), 10), 15);
}
