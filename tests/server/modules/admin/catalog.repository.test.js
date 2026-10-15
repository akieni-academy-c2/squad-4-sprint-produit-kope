import { describe, expect, it, vi } from "vitest";
import {
  cities,
  tradeCategories,
  trades,
  zones,
} from "@server/modules/admin/catalog.repository.js";

describe("factory catalogue admin", () => {
  describe("création", () => {
    it("inclut la clé étrangère quand l’entité en a une", async () => {
      const db = {
        query: vi.fn().mockResolvedValue({
          rows: [{ id: 1, name: "Plombier", categoryId: 3 }],
        }),
      };

      const created = await trades.create("Plombier", 3, db);

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain(
        "INSERT INTO trades (name, category_id, sort_order)",
      );
      expect(query).toContain('category_id AS "categoryId"');
      expect(params).toEqual(["Plombier", 3]);
      expect(created).toEqual({ id: 1, name: "Plombier", categoryId: 3 });
    });

    it("laisse la clé étrangère à null quand elle est absente", async () => {
      const db = {
        query: vi.fn().mockResolvedValue({ rows: [{ id: 2, name: "Zone X" }] }),
      };

      await zones.create("Zone X", null, db);

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain("INSERT INTO zones (name, city_id, sort_order)");
      expect(params).toEqual(["Zone X", null]);
    });

    it("omet la colonne clé étrangère pour une entité sans FK", async () => {
      const db = {
        query: vi.fn().mockResolvedValue({ rows: [{ id: 3, name: "Bois" }] }),
      };

      await tradeCategories.create("Bois", undefined, db);

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain(
        "INSERT INTO trade_categories (name, sort_order)",
      );
      expect(query).not.toContain("category_id");
      expect(params).toEqual(["Bois"]);
    });
  });

  describe("mise à jour", () => {
    it("renvoie null si la ligne n’existe pas", async () => {
      const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };

      await expect(
        cities.update(999, "Nulle", undefined, db),
      ).resolves.toBeNull();
    });

    it("renvoie la ligne mise à jour", async () => {
      const db = {
        query: vi.fn().mockResolvedValue({ rows: [{ id: 1, name: "Brazza" }] }),
      };

      await expect(cities.update(1, "Brazza", undefined, db)).resolves.toEqual({
        id: 1,
        name: "Brazza",
      });
    });
  });

  describe("suppression", () => {
    it("indique si une ligne a été supprimée", async () => {
      const db = {
        query: vi
          .fn()
          .mockResolvedValueOnce({ rowCount: 1 })
          .mockResolvedValueOnce({ rowCount: 0 }),
      };

      await expect(cities.remove(1, db)).resolves.toBe(true);
      await expect(cities.remove(2, db)).resolves.toBe(false);
    });
  });

  describe("réordonnancement", () => {
    it("applique les positions reçues", async () => {
      const db = { query: vi.fn().mockResolvedValue({}) };

      await trades.reorder([3, 1, 2], db);

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain("UPDATE trades AS t SET sort_order = u.ord::int");
      expect(query).toContain("WITH ORDINALITY");
      expect(params).toEqual([[3, 1, 2]]);
    });
  });

  describe("détection d’usage", () => {
    it("interroge la table qui référence l’entité", async () => {
      const db = { query: vi.fn().mockResolvedValue({ rows: [{ count: 2 }] }) };

      await expect(trades.inUse(4, db)).resolves.toBe(true);
      expect(db.query.mock.calls[0][0]).toContain(
        "FROM professionals WHERE trade_id = $1",
      );

      db.query.mockResolvedValue({ rows: [{ count: 0 }] });
      await expect(tradeCategories.inUse(4, db)).resolves.toBe(false);
      expect(db.query.mock.calls[1][0]).toContain(
        "FROM trades WHERE category_id = $1",
      );
    });
  });
});
