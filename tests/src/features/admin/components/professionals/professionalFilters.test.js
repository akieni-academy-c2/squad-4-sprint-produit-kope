import { describe, it, expect } from "vitest";
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  getProIdentity,
  statusVariant,
} from "@/features/admin/components/professionals/professionalFilters.js";
import { PROFILE_STATUS } from "@/shared/lib/constants.js";

describe("getProIdentity", () => {
  it("privilégie userId sur id", () => {
    expect(getProIdentity({ id: 5, userId: 9 }).id).toBe(9);
  });

  it("retombe sur id quand userId est absent", () => {
    expect(getProIdentity({ id: 5 }).id).toBe(5);
  });

  it("privilégie le nom affiché", () => {
    expect(
      getProIdentity({ id: 5, displayName: "Plomberie Kope", firstName: "Ada" })
        .name,
    ).toBe("Plomberie Kope");
  });

  it("compose le nom complet", () => {
    expect(
      getProIdentity({ id: 5, firstName: "Ada", lastName: "Lovelace" }).name,
    ).toBe("Ada Lovelace");
  });

  it("retombe sur l’identifiant si aucun nom", () => {
    expect(getProIdentity({ id: 5 }).name).toBe("#5");
  });

  it("utilise userId dans le repli aussi", () => {
    expect(getProIdentity({ id: 5, userId: 9 }).name).toBe("#9");
  });
});

describe("statusVariant", () => {
  it("associe une couleur à chaque statut", () => {
    expect(statusVariant(PROFILE_STATUS.PUBLISHED)).toBe("success");
    expect(statusVariant(PROFILE_STATUS.HIDDEN)).toBe("danger");
    expect(statusVariant(PROFILE_STATUS.INCOMPLETE)).toBe("warning");
  });

  it("retombe sur warning pour un statut inconnu", () => {
    expect(statusVariant("nimportequoi")).toBe("warning");
    expect(statusVariant(undefined)).toBe("warning");
  });
});

describe("options de filtre", () => {
  it("propose une option « tous les statuts » en premier", () => {
    expect(STATUS_OPTIONS[0]).toEqual({ value: "", label: "Tous les statuts" });
    expect(STATUS_OPTIONS).toHaveLength(4);
  });

  it("propose deux tris", () => {
    expect(SORT_OPTIONS.map((o) => o.value)).toEqual(["name", "recent"]);
  });
});
