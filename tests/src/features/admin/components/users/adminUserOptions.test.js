import { describe, it, expect } from "vitest";
import {
  BLOCKED_OPTIONS,
  EMPTY_ADMIN,
  MIN_PASSWORD_LENGTH,
  ROLE_LABELS,
  ROLE_OPTIONS,
  getUserName,
  toAdminPayload,
  validateAdminDraft,
} from "@/features/admin/components/users/adminUserOptions.js";
import { ROLES } from "@/shared/lib/constants.js";

const valid = {
  firstName: " Ada ",
  lastName: " Lovelace ",
  phone: " +242 06 11 22 33 ",
  password: "motdepasse",
};

describe("validateAdminDraft", () => {
  it("accepte un brouillon complet", () => {
    expect(validateAdminDraft(valid)).toBeNull();
  });

  it("exige prénom, nom et numéro", () => {
    expect(validateAdminDraft({ ...valid, firstName: "  " })).toMatch(
      /obligatoires/,
    );
    expect(validateAdminDraft({ ...valid, lastName: "" })).toMatch(
      /obligatoires/,
    );
    expect(validateAdminDraft({ ...valid, phone: "  " })).toMatch(
      /obligatoires/,
    );
  });

  it("exige un mot de passe assez long", () => {
    expect(
      validateAdminDraft({
        ...valid,
        password: "a".repeat(MIN_PASSWORD_LENGTH - 1),
      }),
    ).toMatch(/caractères/);
    expect(
      validateAdminDraft({
        ...valid,
        password: "a".repeat(MIN_PASSWORD_LENGTH),
      }),
    ).toBeNull();
  });

  it("signale les champs obligatoires avant la longueur du mot de passe", () => {
    expect(
      validateAdminDraft({
        firstName: "",
        lastName: "",
        phone: "",
        password: "court",
      }),
    ).toMatch(/obligatoires/);
  });

  it("ne déclare pas un champ obligatoire comme valide", () => {
    expect(validateAdminDraft({ ...valid, firstName: "" })).not.toBeNull();
  });
});

describe("toAdminPayload", () => {
  it("supprime les espaces parasites", () => {
    expect(toAdminPayload(valid)).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      phone: "+242 06 11 22 33",
      password: "motdepasse",
    });
  });

  it("ne touche pas au mot de passe", () => {
    expect(toAdminPayload({ ...valid, password: " a b " }).password).toBe(
      " a b ",
    );
  });
});

describe("getUserName", () => {
  it("privilégie le nom affiché", () => {
    expect(
      getUserName({ id: 3, displayName: "Plomberie Kope", firstName: "Ada" }),
    ).toBe("Plomberie Kope");
  });

  it("compose le nom complet", () => {
    expect(getUserName({ id: 3, firstName: "Ada", lastName: "Lovelace" })).toBe(
      "Ada Lovelace",
    );
  });

  it("retombe sur l'identifiant si aucun nom", () => {
    expect(getUserName({ id: 3 })).toBe("#3");
  });
});

describe("options de rôle", () => {
  it("associe un libellé à chaque rôle", () => {
    expect(ROLE_LABELS[ROLES.CLIENT]).toBe("Client");
    expect(ROLE_LABELS[ROLES.PRO]).toBe("Professionnel");
    expect(ROLE_LABELS[ROLES.ADMIN]).toBe("Administrateur");
  });

  it("propose une option « tous les rôles » en premier", () => {
    expect(ROLE_OPTIONS[0]).toEqual({ value: "", label: "Tous les rôles" });
    expect(ROLE_OPTIONS).toHaveLength(4);
  });

  it("démarre sur un brouillon vide", () => {
    expect(Object.values(EMPTY_ADMIN).every((v) => v === "")).toBe(true);
  });
});

describe("options de statut de blocage", () => {
  it("propose « tous les statuts » en premier, puis actifs et bloqués", () => {
    expect(BLOCKED_OPTIONS[0]).toEqual({
      value: "",
      label: "Tous les statuts",
    });
    expect(BLOCKED_OPTIONS.map((o) => o.value)).toEqual(["", "false", "true"]);
  });

  it("convertit la valeur du filtre en booléen pour l'API", () => {
    const toBlocked = (value) => (value === "" ? undefined : value === "true");
    expect(BLOCKED_OPTIONS.map((o) => toBlocked(o.value))).toEqual([
      undefined,
      false,
      true,
    ]);
  });
});
