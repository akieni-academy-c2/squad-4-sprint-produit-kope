import { describe, it, expect, vi } from "vitest";
import {
  cached,
  cacheGet,
  cacheSet,
  cacheInvalidate,
} from "@/shared/lib/cache.js";

describe("cache.js", () => {
  it("stocke et récupère une valeur", () => {
    cacheSet("k1", "v1", 1000);
    expect(cacheGet("k1")).toBe("v1");
  });

  it("expire après le TTL", async () => {
    cacheSet("k2", "v2", 5);
    await new Promise((r) => setTimeout(r, 20));
    expect(cacheGet("k2")).toBeUndefined();
  });

  it("cached() ne re-appelle pas le loader pendant le TTL", async () => {
    const loader = vi.fn(async () => "data");
    const a = await cached("k3", 1000, loader);
    const b = await cached("k3", 1000, loader);
    expect(a).toBe("data");
    expect(b).toBe("data");
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("cacheInvalidate supprime par préfixe", () => {
    cacheSet("reference:trades", 1, 1000);
    cacheSet("reference:zones", 2, 1000);
    cacheSet("other", 3, 1000);
    cacheInvalidate("reference:");
    expect(cacheGet("reference:trades")).toBeUndefined();
    expect(cacheGet("reference:zones")).toBeUndefined();
    expect(cacheGet("other")).toBe(3);
  });
});
