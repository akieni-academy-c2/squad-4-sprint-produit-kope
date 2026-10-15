import { pool } from "../../db/pool.js";
import { cacheInvalidate } from "../../utils/cache.js";

function makeCatalog({ table, alias, fk = null, inUseSql }) {
  const insertColumns = fk
    ? `name, ${fk.column}, sort_order`
    : "name, sort_order";
  const insertValues = fk
    ? "$1, $2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM " + table + ")"
    : "$1, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM " + table + ")";
  const insertReturning = fk
    ? `id, name, ${fk.column} AS "${fk.label}"`
    : "id, name";
  const updateSet = fk ? `name = $2, ${fk.column} = $3` : "name = $2";

  /**
   * Toute écriture sur le référentiel vide les listes publiques. Elles
   * encompasses les villes, dont la liste dépend des quartiers : vider tout le
   * préfixe garantit qu'aucune écriture ne laisse une liste périmée.
   */
  const invalidate = () => cacheInvalidate("reference:");

  return {
    async create(name, fkId, db = pool) {
      const { rows } = await db.query(
        `INSERT INTO ${table} (${insertColumns})
         VALUES (${insertValues})
         RETURNING ${insertReturning}`,
        fk ? [name, fkId ?? null] : [name],
      );
      invalidate();
      return rows[0];
    },

    async update(id, name, fkId, db = pool) {
      const { rows } = await db.query(
        `UPDATE ${table} SET ${updateSet} WHERE id = $1 RETURNING ${insertReturning}`,
        fk ? [id, name, fkId ?? null] : [id, name],
      );
      invalidate();
      return rows[0] ?? null;
    },

    async remove(id, db = pool) {
      const { rowCount } = await db.query(
        `DELETE FROM ${table} WHERE id = $1`,
        [id],
      );
      invalidate();
      return rowCount > 0;
    },

    async reorder(ids, db = pool) {
      await db.query(
        `UPDATE ${table} AS ${alias} SET sort_order = u.ord::int
           FROM unnest($1::int[]) WITH ORDINALITY AS u(id, ord)
          WHERE ${alias}.id = u.id`,
        [ids],
      );
      invalidate();
    },

    async inUse(id, db = pool) {
      const { rows } = await db.query(inUseSql, [id]);
      return Number(rows[0]?.count ?? 0) > 0;
    },
  };
}

export const tradeCategories = makeCatalog({
  table: "trade_categories",
  alias: "c",
  inUseSql: "SELECT COUNT(*)::int AS count FROM trades WHERE category_id = $1",
});

export const trades = makeCatalog({
  table: "trades",
  alias: "t",
  fk: { column: "category_id", label: "categoryId" },
  inUseSql:
    "SELECT COUNT(*)::int AS count FROM professionals WHERE trade_id = $1",
});

export const cities = makeCatalog({
  table: "cities",
  alias: "c",
  inUseSql: "SELECT COUNT(*)::int AS count FROM zones WHERE city_id = $1",
});

export const zones = makeCatalog({
  table: "zones",
  alias: "z",
  fk: { column: "city_id", label: "cityId" },
  inUseSql:
    "SELECT COUNT(*)::int AS count FROM professional_zones WHERE zone_id = $1",
});
