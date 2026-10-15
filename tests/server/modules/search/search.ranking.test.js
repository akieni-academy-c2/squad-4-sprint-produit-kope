import { describe, expect, it, vi } from "vitest";
import { searchPublished } from "@server/modules/search/search.repository.js";
import { setAvailability } from "@server/modules/professionals/professionals.repository.js";
import * as photosRepository from "@server/modules/photos/photos.repository.js";

describe("US-13 professional ranking", () => {
  it("orders by availability, exact visible-review average, then profile update time", async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };

    await searchPublished(
      { tradeId: 2, zoneId: 5, cityId: null, limit: 10, offset: 20 },
      db,
    );

    const [query, params] = db.query.mock.calls[0];
    expect(query).toMatch(
      /ORDER BY p\.is_available DESC, AVG\(r\.rating\) DESC NULLS LAST, p\.updated_at DESC, p\.user_id/,
    );
    expect(query).toContain(
      'ROUND(AVG(r.rating), 1)::float8 AS "ratingAverage"',
    );
    expect(query).toContain(
      "LEFT JOIN reviews r ON r.professional_id = p.user_id AND NOT r.is_hidden",
    );
    expect(params).toEqual([2, 5, null, null, null, null, 10, 20, null]);
  });

  it("updates the profile timestamp when availability changes", async () => {
    const db = { query: vi.fn().mockResolvedValue({ rowCount: 1 }) };

    await setAvailability(42, false, db);

    expect(db.query).toHaveBeenCalledWith(
      "UPDATE professionals SET is_available = $2, updated_at = now() WHERE user_id = $1",
      [42, false],
    );
  });

  it("updates the profile timestamp when a photo is added", async () => {
    const db = {
      query: vi
        .fn()
        .mockResolvedValueOnce({ rows: [{ id: 7 }] })
        .mockResolvedValueOnce({ rowCount: 1 }),
    };

    await photosRepository.create(
      {
        professionalId: 42,
        filePath: "photo.jpg",
        thumbPath: "photo-thumb.jpg",
        caption: null,
      },
      db,
    );

    expect(db.query.mock.calls[1]).toEqual([
      "UPDATE professionals SET updated_at = now() WHERE user_id = $1",
      [42],
    ]);
  });

  it("updates the profile timestamp when a photo is removed", async () => {
    const db = {
      query: vi
        .fn()
        .mockResolvedValueOnce({
          rows: [{ filePath: "photo.jpg", thumbPath: "photo-thumb.jpg" }],
        })
        .mockResolvedValueOnce({ rowCount: 1 }),
    };

    await photosRepository.remove(7, 42, db);

    expect(db.query.mock.calls[1]).toEqual([
      "UPDATE professionals SET updated_at = now() WHERE user_id = $1",
      [42],
    ]);
  });
});
