import { pool } from "./pool.js";

/**
 * Contrat minimal entre le code applicatif et le schéma. Chaque entrée
 * correspond à une migration : son absence signifie « migrations non appliquées
 * sur cette base », la cause habituelle d'un 500 sur les pages publiques.
 * À compléter quand une migration ajoute une dépendance lue par le code.
 */
const REQUIRED = [
  { relation: "users" },
  { relation: "trades" },
  { relation: "zones" },
  { relation: "cities" },
  { relation: "professionals" },
  { relation: "professional_zones" },
  { relation: "photos" },
  { relation: "reviews" },
  { relation: "published_professionals" },
  { column: "zones.city_id" },
  { column: "users.avatar_url" },
  { column: "users.email" },
  { column: "professionals.city_id" },
  { column: "photos.thumb_path" },
  { column: "reviews.updated_at" },
];

/**
 * Liste les objets de REQUIRED absents de la base.
 * Ne lève jamais : un diagnostic indisponible vaut mieux qu'un healthcheck en
 * erreur, qui ferait passer une API parfaitement saine pour une panne.
 */
export async function findMissingSchema(db = pool) {
  let relations;
  let columns;
  try {
    [relations, columns] = await Promise.all([
      db.query(
        `SELECT c.relname
           FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = current_schema()
            AND c.relkind = ANY (ARRAY['r', 'v', 'm'])`,
      ),
      db.query(
        `SELECT table_name, column_name
           FROM information_schema.columns
          WHERE table_schema = current_schema()`,
      ),
    ]);
  } catch {
    return null;
  }

  const found = new Set(relations.rows.map(({ relname }) => relname));
  for (const { table_name, column_name } of columns.rows)
    found.add(`${table_name}.${column_name}`);

  return REQUIRED.map(
    (required) => required.column ?? required.relation,
  ).filter((object) => !found.has(object));
}
