import { describe, it, expect, beforeEach } from "vitest";
import { cacheGet, cacheSet, cacheInvalidate } from "@server/utils/cache.js";
import {
  trades,
  zones,
  cities,
  tradeCategories,
} from "@server/modules/admin/catalog.repository.js";

const fakeDb = (rows = [{ id: 1, name: "X" }]) => ({
  query: async () => ({ rows, rowCount: rows.length }),
});

beforeEach(() => {
  cacheInvalidate("");
});

/**
 * Si une écriture du catalogue laisse les listes publiques en cache, un
 * administrateur renomme un métier et les visiteurs ne le voient pas. C'est le
 * défaut que ce test verrouille.
 */
describe("invalidation du cache a l'ecriture du catalogue", () => {
  it("remet le cache a zero apres une creation", async () => {
    cacheSet("reference:trades", [1], 1000);
    cacheSet("reference:zones", [1], 1000);

    await trades.create("Plombier", 1, fakeDb());

    expect(cacheGet("reference:trades")).toBeUndefined();
    expect(cacheGet("reference:zones")).toBeUndefined();
  });

  it("idem apres une modification", async () => {
    cacheSet("reference:trades", [1], 1000);
    await trades.update(1, "Renomme", 1, fakeDb());

    expect(cacheGet("reference:trades")).toBeUndefined();
  });

  it("idem apres une suppression", async () => {
    cacheSet("reference:trades", [1], 1000);
    await trades.remove(1, fakeDb());

    expect(cacheGet("reference:trades")).toBeUndefined();
  });

  it("idem apres un reordonnancement", async () => {
    cacheSet("reference:trades", [1], 1000);
    await trades.reorder([1, 2], fakeDb());

    expect(cacheGet("reference:trades")).toBeUndefined();
  });

  /**
   * La liste des villes ne se déduit pas de la table `cities` seule : elle ne
   * garde que celles qui possèdent un quartier. Supprimer un quartier change donc
   * cette liste, alors qu'aucune écriture sur `cities` n'a eu lieu.
   */
  it("une ecriture sur les quartiers invalide aussi la liste des villes", async () => {
    cacheSet("reference:cities", [{ id: 1 }], 1000);
    cacheSet("reference:zones", [{ id: 1 }], 1000);

    await zones.remove(1, fakeDb());

    expect(cacheGet("reference:cities")).toBeUndefined();
    expect(cacheGet("reference:zones")).toBeUndefined();
  });

  it("une ecriture sur les categories invalide le referentiel", async () => {
    cacheSet("reference:trades", [1], 1000);
    await tradeCategories.remove(1, fakeDb());

    expect(cacheGet("reference:trades")).toBeUndefined();
  });

  it("une ecriture sur les villes invalide aussi les quartiers", async () => {
    cacheSet("reference:zones", [1], 1000);
    await cities.update(1, "Brazzaville", null, fakeDb());

    expect(cacheGet("reference:zones")).toBeUndefined();
  });
});
