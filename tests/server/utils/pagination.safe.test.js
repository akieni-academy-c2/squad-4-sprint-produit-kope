import { describe, expect, it, vi } from "vitest";
import {
  paginate,
  paginateSafely,
  offsetOf,
} from "@server/utils/pagination.js";

describe("pagination", () => {
  it("offsetOf calcule le décalage", () => {
    expect(offsetOf({ page: 1, pageSize: 20 })).toBe(0);
    expect(offsetOf({ page: 3, pageSize: 20 })).toBe(40);
  });

  it("paginate retire la colonne technique et calcule les pages", () => {
    const rows = [
      { id: 1, total: 45 },
      { id: 2, total: 45 },
    ];
    const result = paginate(rows, { page: 2, pageSize: 20 });

    expect(result).toEqual({
      items: [{ id: 1 }, { id: 2 }],
      page: 2,
      pageSize: 20,
      total: 45,
      totalPages: 3,
    });
  });

  it("paginate accepte un total imposé", () => {
    expect(paginate([], { page: 5, pageSize: 20 }, 45).total).toBe(45);
  });

  describe("paginateSafely", () => {
    it("recompose le total quand la page contient des lignes", async () => {
      const count = vi.fn();
      const result = await paginateSafely(
        [{ id: 1, total: 45 }],
        { page: 2, pageSize: 20 },
        count,
      );

      expect(result.total).toBe(45);
      expect(result.totalPages).toBe(3);
      expect(count).not.toHaveBeenCalled();
    });

    it("recompte quand la page demandée est au-delà de la dernière", async () => {
      const count = vi.fn().mockResolvedValue(45);
      const result = await paginateSafely([], { page: 5, pageSize: 20 }, count);

      expect(count).toHaveBeenCalledOnce();
      expect(result).toEqual({
        items: [],
        page: 5,
        pageSize: 20,
        total: 45,
        totalPages: 3,
      });
    });

    it("se rabat sur paginate si aucun compteur n’est fourni", async () => {
      const result = await paginateSafely([], { page: 5, pageSize: 20 });

      expect(result.total).toBe(0);
    });
  });
});
