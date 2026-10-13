export function paginate(rows, { page, pageSize }, totalOverride) {
  const total = totalOverride ?? rows[0]?.total ?? 0;
  const items = rows.map(({ total: _total, ...rest }) => rest);
  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

/**
 * `COUNT(*) OVER()` est calculé sur les lignes de la page courante : une page au-delà
 * de la dernière ne renvoie aucune ligne, donc `total` retombait à 0 et l'API
 * répondait « page 5 sur 0 ». Ce wrapper ne recompte que dans ce cas.
 */
export async function paginateSafely(rows, pagination, countTotal) {
  if (rows.length > 0 || typeof countTotal !== 'function') return paginate(rows, pagination);
  return paginate(rows, pagination, await countTotal());
}

export function offsetOf({ page, pageSize }) {
  return (page - 1) * pageSize;
}
