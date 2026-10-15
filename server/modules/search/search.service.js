import { offsetOf, paginateSafely } from "../../utils/pagination.js";
import { uploadUrl } from "../../utils/uploads.js";
import * as repository from "./search.repository.js";
const PAGE_SIZE = 10;
function toCard(row) {
  return {
    id: row.id,
    displayName: row.displayName,
    trade: row.trade,
    zones: row.zones,
    yearsExperience: row.yearsExperience,
    isAvailable: row.isAvailable,
    rating: { average: row.ratingAverage, count: row.ratingCount },
    coverUrl: uploadUrl(row.coverThumb),
    avatarUrl: row.avatarUrl ?? null,
  };
}
export async function search({
  trade,
  zone,
  city,
  q,
  available,
  minRating,
  minExperience,
  page,
}) {
  const pagination = { page, pageSize: PAGE_SIZE };
  const filters = {
    tradeId: trade ?? null,
    zoneId: zone ?? null,
    cityId: city ?? null,
    keyword: q ?? null,
    available: available ?? null,
    minRating: minRating ?? null,
    minExperience: minExperience ?? null,
  };
  const rows = await repository.searchPublished({
    ...filters,
    limit: PAGE_SIZE,
    offset: offsetOf(pagination),
  });
  const result = await paginateSafely(rows, pagination, () =>
    repository.countPublished(filters),
  );
  return { ...result, items: result.items.map(toCard) };
}
