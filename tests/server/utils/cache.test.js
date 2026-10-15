import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cacheGet,
  cacheSet,
  cacheInvalidate,
  cached,
} from "@server/utils/cache.js";

beforeEach(() => {
  cacheInvalidate("");
});

describe("cache serveur", () => {
  it("renvoie la valeur memorisee sans relancer le chargement", async () => {
    const loader = vi.fn(async () => ["plombier"]);

    await cached("k", 1000, loader);
    await cached("k", 1000, loader);

    expect(loader).toHaveBeenCalledTimes(1);
    expect(await cached("k", 1000, loader)).toEqual(["plombier"]);
  });

  it("laisse expirer une valeur au-dela de sa duree de vie", async () => {
    vi.useFakeTimers();
    const loader = vi.fn(async () => ["plombier"]);
    await cached("k", 1000, loader);

    vi.advanceTimersByTime(1001);
    await cached("k", 1000, loader);

    expect(loader).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("ne confond pas absence et valeur falsy", async () => {
    cacheSet("k", [], 1000);
    expect(cacheGet("k")).toEqual([]);
  });

  /**
   * Une rafale de visiteurs simultanés ne doit pas provoquer une rafale
   * d'allers-retours vers la base : le premier lance, les autres attendent.
   */
  it("partage un seul chargement entre appels simultanes", async () => {
    let resolve;
    const loader = vi.fn(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );

    const all = Promise.all([
      cached("k", 1000, loader),
      cached("k", 1000, loader),
      cached("k", 1000, loader),
    ]);
    resolve(["plombier"]);

    expect(await all).toEqual([["plombier"], ["plombier"], ["plombier"]]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("ne laisse pas de chargement en suspens apres un echec", async () => {
    const loader = vi.fn(async () => {
      throw new Error("base injoignable");
    });

    await expect(cached("k", 1000, loader)).rejects.toThrow("injoignable");
    await expect(cached("k", 1000, loader)).rejects.toThrow("injoignable");
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("vide les cles du prefixe demande et laisse les autres", () => {
    cacheSet("reference:trades", [1], 1000);
    cacheSet("autre:cle", [2], 1000);

    cacheInvalidate("reference:");

    expect(cacheGet("reference:trades")).toBeUndefined();
    expect(cacheGet("autre:cle")).toEqual([2]);
  });
});
