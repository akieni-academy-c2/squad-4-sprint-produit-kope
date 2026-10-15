export function paginate(rows, { page, pageSize }, totalOverride) {
  const total = totalOverride ?? rows[0]?.total ?? 0;
  const items = rows.map(({ total: _total, ...rest }) => rest);
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function paginateSafely(rows, pagination, countTotal) {
  if (rows.length > 0 || typeof countTotal !== "function")
    return paginate(rows, pagination);
  return paginate(rows, pagination, await countTotal());
}

export function offsetOf({ page, pageSize }) {
  return (page - 1) * pageSize;
}
