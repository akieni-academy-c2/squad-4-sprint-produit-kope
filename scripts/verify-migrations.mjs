/**
 * Vérifie que les migrations d'audit ont produit l'effet attendu sur la base.
 *
 * À lancer après `npm run migrate:up` avec une vraie DATABASE_URL :
 *   node scripts/verify-migrations.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const loadEnv = path.resolve('.env');
if (fs.existsSync(loadEnv)) process.loadEnvFile(loadEnv);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL absente : rien à vérifier.');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 5000 });

const CHECKS = [
  {
    label: 'reviews.updated_at existe',
    sql: `SELECT EXISTS (SELECT 1 FROM information_schema.columns
          WHERE table_name = 'reviews' AND column_name = 'updated_at') AS ok`,
  },
  {
    label: 'index de tri par défaut de « Mes avis »',
    sql: `SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'reviews_client_created_idx') AS ok`,
  },
  {
    label: 'pg_trgm installé',
    sql: `SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') AS ok`,
  },
  {
    label: 'un e-mail ne peut différer que par la casse',
    sql: `SELECT indexdef LIKE '%lower(btrim(email))%' AS ok
          FROM pg_indexes WHERE indexname = 'users_email_lower_unique'`,
  },
  {
    label: 'e-mail stocké en minuscules',
    sql: `SELECT conname IS NOT NULL AS ok FROM pg_constraint WHERE conname = 'users_email_normalized'`,
  },
  {
    label: 'un contact « message » porte un contenu',
    sql: `SELECT conname IS NOT NULL AS ok FROM pg_constraint WHERE conname = 'contacts_message_required'`,
  },
  {
    label: 'index des comptes actifs',
    sql: `SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_active_idx') AS ok`,
  },
  {
    label: 'index admin actif',
    sql: `SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_admin_active_idx') AS ok`,
  },
  {
    label: 'index de session aligné sur la prédiction numérique',
    sql: `SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'session_user_numeric_idx') AS ok`,
  },
  {
    label: 'index redondants retirés',
    sql: `SELECT NOT EXISTS (SELECT 1 FROM pg_indexes
          WHERE indexname IN ('users_suspended_at_idx','photos_professional_id_idx','contacts_pair_idx','users_email_unique'))
          AS ok`,
  },
  {
    // `listByClient` garde volontairement les avis masqués (`visibility = 'all'`
    // par défaut) : il lui faut un index NON partiel, fourni par
    // reviews_client_created_idx. L'ancien index partiel ne sert plus qu'à la
    // vue publique.
    label: '« Mes avis » dispose d’un index non partiel',
    sql: `SELECT indexdef NOT LIKE '%WHERE%' AS ok
          FROM pg_indexes WHERE indexname = 'reviews_client_created_idx'`,
  },
];

let failed = 0;
for (const check of CHECKS) {
  try {
    const { rows } = await pool.query(check.sql);
    const ok = rows[0]?.ok === true;
    if (!ok) failed += 1;
    console.log(`${ok ? 'OK  ' : 'ECHEC'}  ${check.label}`);
  } catch (err) {
    failed += 1;
    console.log(`ECHEC  ${check.label}\n        ${err.message}`);
  }
}

await pool.end();
console.log(`\n${CHECKS.length - failed}/${CHECKS.length} verifications passees.`);
process.exit(failed === 0 ? 0 : 1);