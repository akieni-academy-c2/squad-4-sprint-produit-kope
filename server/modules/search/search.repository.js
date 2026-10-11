import { pool } from '../../db/pool.js';

export async function searchPublished(
  { tradeId, zoneId, keyword, available, minRating, minExperience, limit, offset },
  db = pool,
) {
  const { rows } = await db.query(
    `SELECT p.user_id AS id,
            p.display_name AS "displayName",
            t.name AS trade,
            u.avatar_url AS "avatarUrl",
            p.years_experience AS "yearsExperience",
            p.is_available AS "isAvailable",
            ROUND(AVG(r.rating), 1)::float8 AS "ratingAverage",
            COUNT(r.id)::int AS "ratingCount",
            (SELECT ph.thumb_path FROM photos ph
              WHERE ph.professional_id = p.user_id
              ORDER BY ph.created_at, ph.id LIMIT 1) AS "coverThumb",
            COALESCE(
              (SELECT json_agg(z.name ORDER BY z.name)
                 FROM professional_zones pz
                 JOIN zones z ON z.id = pz.zone_id
                WHERE pz.professional_id = p.user_id),
              '[]'::json) AS zones,
            COUNT(*) OVER()::int AS total
       FROM published_professionals p
       JOIN trades t ON t.id = p.trade_id
       JOIN users u ON u.id = p.user_id
       LEFT JOIN reviews r ON r.professional_id = p.user_id AND NOT r.is_hidden
      WHERE ($1::smallint IS NULL OR p.trade_id = $1)
        AND ($2::smallint IS NULL
             OR EXISTS (SELECT 1 FROM professional_zones pz
                         WHERE pz.professional_id = p.user_id AND pz.zone_id = $2))
        AND ($3::text IS NULL
             OR p.display_name ILIKE '%' || $3 || '%'
             OR t.name ILIKE '%' || $3 || '%')
        AND ($4::boolean IS NULL OR p.is_available = $4)
        AND ($5::numeric IS NULL OR p.years_experience >= $5)
      GROUP BY p.user_id, p.display_name, p.years_experience, p.is_available, p.updated_at, t.name, u.avatar_url
     HAVING ($6::numeric IS NULL OR AVG(r.rating) >= $6)
      ORDER BY p.is_available DESC, AVG(r.rating) DESC NULLS LAST, p.updated_at DESC, p.user_id
      LIMIT $7 OFFSET $8`,
    [
      tradeId ?? null,
      zoneId ?? null,
      keyword ?? null,
      available ?? null,
      minExperience ?? null,
      minRating ?? null,
      limit,
      offset,
    ],
  );
  return rows;
}

/**
 * Compte des résultats sans pagination (utilisé quand la page demandée est vide).
 *
 * Doit rester symétrique de `searchPublished` : même FROM, même WHERE, même
 * GROUP BY / HAVING. Un `COUNT(*)` posé directement sur le JOIN compterait les
 * lignes — un professionnel avec 3 avis valait 3 professionnels — et le HAVING
 * porterait sur la moyenne globale au lieu de la moyenne par professionnel.
 */
export async function countPublished(
  { tradeId, zoneId, keyword, available, minExperience, minRating },
  db = pool,
) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM (
         SELECT p.user_id
           FROM published_professionals p
           JOIN trades t ON t.id = p.trade_id
           LEFT JOIN reviews r ON r.professional_id = p.user_id AND NOT r.is_hidden
          WHERE ($1::smallint IS NULL OR p.trade_id = $1)
            AND ($2::smallint IS NULL
                 OR EXISTS (SELECT 1 FROM professional_zones pz
                             WHERE pz.professional_id = p.user_id AND pz.zone_id = $2))
            AND ($3::text IS NULL
                 OR p.display_name ILIKE '%' || $3 || '%'
                 OR t.name ILIKE '%' || $3 || '%')
            AND ($4::boolean IS NULL OR p.is_available = $4)
            AND ($5::numeric IS NULL OR p.years_experience >= $5)
          GROUP BY p.user_id
         HAVING ($6::numeric IS NULL OR AVG(r.rating) >= $6)
       ) counted`,
    [tradeId ?? null, zoneId ?? null, keyword ?? null, available ?? null, minExperience ?? null, minRating ?? null],
  );
  return Number(rows[0]?.count ?? 0);
}
