import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  callApi,
  decideDemoMode,
  isMockMode,
  enableMockMode,
  resetMockMode,
} from "@/shared/lib/dataSource.js";

beforeEach(() => {
  enableMockMode();
});

afterEach(() => {
  resetMockMode();
});

describe("dataSource - mode démonstration", () => {
  it("démarre en mode démo", () => {
    expect(isMockMode()).toBe(true);
  });

  it("l API n'est plus appelée une fois le mode démo actif", async () => {
    const apiFn = vi.fn(async () => "api-ok");
    const mockFn = vi.fn(async () => "mock-ok");

    expect(await callApi(apiFn, mockFn)).toBe("mock-ok");
    expect(apiFn).not.toHaveBeenCalled();
  });

  it("« Quitter la démo » ramène à l'API", async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => "api-ok");
    const mockFn = vi.fn(async () => "mock-ok");

    expect(isMockMode()).toBe(false);
    expect(await callApi(apiFn, mockFn)).toBe("api-ok");
    expect(mockFn).not.toHaveBeenCalled();
  });

  it("revient à l'API quand elle répond après la sortie de démo", async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => "api-ok");
    const mockFn = vi.fn(async () => "mock-ok");

    await callApi(apiFn, mockFn);
    expect(apiFn).toHaveBeenCalled();
  });
});

describe("dataSource.callApi en démo", () => {
  it("ne bascule pas sur erreur métier 409", async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => {
      throw Object.assign(new Error("déjà pris"), { status: 409 });
    });
    const mockFn = vi.fn(async () => "mock-ok");

    await expect(callApi(apiFn, mockFn)).rejects.toThrow("déjà pris");
    expect(mockFn).not.toHaveBeenCalled();
  });

  it("bascule sur erreur réseau quand la démo est sortie", async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    const mockFn = vi.fn(async () => "mock-ok");

    expect(await callApi(apiFn, mockFn)).toBe("mock-ok");
    expect(isMockMode()).toBe(true);
  });

  it("bascule sur erreur 5xx quand la démo est sortie", async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => {
      throw Object.assign(new Error("down"), { status: 503 });
    });
    const mockFn = vi.fn(async () => "mock-ok");

    expect(await callApi(apiFn, mockFn)).toBe("mock-ok");
    expect(isMockMode()).toBe(true);
  });
});

describe("dataSource - activation à l'exécution", () => {
  const decide = (options) => decideDemoMode(options);

  it("allume la démo avec ?demo=1 quand le build l'autorise", () => {
    expect(decide({ requested: "1", allowedByBuild: true })).toEqual({
      allowed: true,
      active: true,
    });
  });

  it("éteint la démo avec ?demo=0", () => {
    expect(decide({ requested: "0", allowedByBuild: true })).toEqual({
      allowed: true,
      active: false,
    });
  });

  it("tolère les espaces, la casse et true dans le paramètre", () => {
    for (const requested of ["true", "TRUE", " true "])
      expect(
        decide({ requested, allowedByBuild: true }).active,
        requested,
      ).toBe(true);
  });

  it("ne prend pas une valeur arbitraire pour une activation", () => {
    for (const requested of ["", "oui", "non", "on"])
      expect(
        decide({ requested, allowedByBuild: true }).active,
        requested,
      ).toBe(false);
  });

  it("retombe sur le choix mémorisé en l'absence de paramètre", () => {
    expect(
      decide({ requested: null, remembered: true, allowedByBuild: true })
        .active,
    ).toBe(true);
    expect(
      decide({ requested: null, remembered: false, allowedByBuild: true })
        .active,
    ).toBe(false);
  });
});

describe("dataSource - arbitrage entre le build et l'URL", () => {
  it("n'active jamais la démo de lui-même, même si le build l'autorise", () => {
    expect(decideDemoMode({ requested: null, allowedByBuild: true })).toEqual({
      allowed: true,
      active: false,
    });
  });

  it("permet à ?demo=0 de sortir d'une démo autorisée par le build", () => {
    expect(decideDemoMode({ requested: "0", allowedByBuild: true })).toEqual({
      allowed: true,
      active: false,
    });
  });

  /**
   * `VITE_USE_MOCKS=false` est un verrou, pas un simple masquage : si `?demo=1`
   * passait encore, la démo resterait atteignable et visible dans l'historique
   * d'un visiteur qui connaît l'URL.
   */
  it("interdit la démo quand le build la retire, ?demo=1 compris", () => {
    expect(decideDemoMode({ requested: "1", allowedByBuild: false })).toEqual({
      allowed: false,
      active: false,
    });
    expect(
      decideDemoMode({ requested: "true", allowedByBuild: false }),
    ).toEqual({
      allowed: false,
      active: false,
    });
  });

  it("ignore un choix mémorisé quand le build retire la démo", () => {
    expect(
      decideDemoMode({
        requested: null,
        remembered: true,
        allowedByBuild: false,
      }),
    ).toEqual({
      allowed: false,
      active: false,
    });
  });

  it("ne rend jamais l'état actif sans build favorable", () => {
    for (const requested of [null, "1", "true", "0"])
      expect(
        decideDemoMode({ requested }).active,
        JSON.stringify(requested),
      ).toBe(false);
  });
});
