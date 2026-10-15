import { describe, expect, it, vi } from "vitest";
import { searchQuerySchema } from "@server/modules/search/search.schemas.js";

vi.mock("@server/db/pool.js", () => ({
  pool: { query: vi.fn() },
}));

import { pool } from "@server/db/pool.js";
import { searchPublished } from "@server/modules/search/search.repository.js";
import { searchMock } from "@/shared/mocks/appMock.js";

describe("searchQuerySchema", () => {
  it.each([
    [{}],
    [{ q: "   " }],
    [{ trade: "2" }],
    [{ zone: "3" }],
    [{ q: "plombier" }],
    [{ trade: "2", zone: "3", q: "nom" }],
    [{ available: "true" }],
    [{ minRating: "4" }],
    [{ minExperience: "5" }],
    [{ available: "false", minRating: "3", minExperience: "2" }],
  ])("accepts a search with criteria %o", (query) => {
    expect(searchQuerySchema.safeParse(query).success).toBe(true);
  });

  it.each([
    { trade: "invalid" },
    { minRating: "9" },
    { minExperience: "-1" },
    { available: "peut-être" },
  ])("rejects invalid criteria %o", (query) => {
    expect(searchQuerySchema.safeParse(query).success).toBe(false);
  });

  it("converts available and numeric filters", () => {
    expect(searchQuerySchema.parse({ available: "true" }).available).toBe(true);
    expect(searchQuerySchema.parse({ available: "false" }).available).toBe(
      false,
    );
    expect(
      searchQuerySchema.parse({ available: "" }).available,
    ).toBeUndefined();
    expect(searchQuerySchema.parse({ minRating: "4" }).minRating).toBe(4);
    expect(
      searchQuerySchema.parse({ minExperience: "" }).minExperience,
    ).toBeUndefined();
  });
});

describe("searchPublished", () => {
  it("binds optional filters and pagination to the matching SQL parameters", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await searchPublished({
      tradeId: 2,
      zoneId: 3,
      keyword: "plombier",
      limit: 10,
      offset: 20,
    });

    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain("p.display_name ILIKE '%' || $3 || '%'");
    expect(sql).toContain("LIMIT $7 OFFSET $8");
    expect(values).toEqual([2, 3, "plombier", null, null, null, 10, 20, null]);
  });

  it("binds the refine filters and filters on rating with HAVING", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await searchPublished({
      available: true,
      minRating: 4,
      minExperience: 5,
      limit: 10,
      offset: 0,
    });

    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain("p.is_available = $4");
    expect(sql).toContain("p.years_experience >= $5");
    expect(sql).toContain(
      "HAVING ($6::numeric IS NULL OR AVG(r.rating) >= $6)",
    );
    expect(values).toEqual([null, null, null, true, 5, 4, 10, 0, null]);
  });
});

describe("searchMock - filtres avancés", () => {
  it("filtre par disponibilité", () => {
    const all = searchMock({ pageSize: 50 });
    const available = searchMock({ available: true, pageSize: 50 });
    expect(available.total).toBeGreaterThan(0);
    expect(available.total).toBeLessThan(all.total);
    expect(available.items.every((p) => p.isAvailable === true)).toBe(true);
  });

  it("filtre par note et expérience minimales", () => {
    const rated = searchMock({ minRating: 5, pageSize: 50 });
    expect(rated.items.every((p) => (p.rating?.average ?? 0) >= 5)).toBe(true);

    const experienced = searchMock({ minExperience: 10, pageSize: 50 });
    expect(experienced.items.every((p) => (p.yearsExperience ?? 0) >= 10)).toBe(
      true,
    );
  });
});
