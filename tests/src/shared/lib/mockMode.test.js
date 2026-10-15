import { describe, it, expect } from "vitest";
import { mocksFromBuild } from "@/shared/lib/dataSource.js";

/**
 * La variable de build décide si la démo reste accessible, jamais si elle est
 * active. Céder le passage en démo au visiteur est la seule façon d'éviter qu'une
 * panne de production se déguise en données fictives.
 */
describe("mode démo au build", () => {
  it("reste disponible si la variable est absente", () => {
    expect(mocksFromBuild(undefined)).toEqual({ allowed: true });
  });

  it("traite une variable vide comme absente", () => {
    for (const raw of ["", "   "])
      expect(mocksFromBuild(raw), JSON.stringify(raw)).toEqual({
        allowed: true,
      });
  });

  it("autorise sans activer quand la variable vaut 'true'", () => {
    expect(mocksFromBuild("true")).toEqual({ allowed: true });
  });

  it("interdit quand la variable vaut 'false'", () => {
    expect(mocksFromBuild("false")).toEqual({ allowed: false });
  });

  it("tolère les espaces et la casse autour de true", () => {
    for (const raw of [" true ", "TRUE"])
      expect(mocksFromBuild(raw).allowed, raw).toBe(true);
  });

  it("ne prend pas une valeur arbitraire pour une autorisation", () => {
    for (const raw of ["0", "non", "oui", "1", "on"])
      expect(mocksFromBuild(raw), raw).toEqual({ allowed: false });
  });

  it("ne renvoie jamais d'état actif", () => {
    for (const raw of [undefined, "", "   ", "true", "false", "1"])
      expect(mocksFromBuild(raw), JSON.stringify(raw)).not.toHaveProperty(
        "active",
      );
  });
});
