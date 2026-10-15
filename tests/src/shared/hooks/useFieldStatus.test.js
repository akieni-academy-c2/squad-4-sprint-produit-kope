import { describe, it, expect } from "vitest";
import {
  checkPassword,
  FIELD_STATUS,
  fieldValidator,
} from "@/shared/hooks/useFieldStatus.js";
import { registerClientSchema } from "@/shared/utils/validators.js";
import { isHopelessPhone } from "@/shared/utils/normalizePhone.js";

describe("checkPassword", () => {
  it("ne signale aucune exigence manquante sur un mot de passe complet", () => {
    const { missing, total, rules } = checkPassword("Motdepasse1");
    expect(missing).toBe(0);
    expect(total).toBe(3);
    expect(rules.every((r) => r.passed)).toBe(true);
  });

  it("accepte un caractère spécial à la place du chiffre", () => {
    expect(checkPassword("Motdepasse@").missing).toBe(0);
    expect(checkPassword("Motdepasse-").missing).toBe(0);
  });

  it("compte les exigences manquantes une par une", () => {
    expect(checkPassword("a").missing).toBe(3);
    expect(checkPassword("motdepasse1").missing).toBe(1);
    expect(checkPassword("MOTDEPASSE1").missing).toBe(1);
    expect(checkPassword("Motdepasse").missing).toBe(1);
    expect(checkPassword("Motdepa").missing).toBe(2);
  });

  it("coche les règles au fur et à mesure", () => {
    const etapes = [
      "",
      "M",
      "Mo",
      "Mot",
      "Motd",
      "Motde",
      "Motdep",
      "Motdepa",
      "Motdepasse",
    ];
    const compte = etapes.map((v) => checkPassword(v).missing);
    for (let i = 1; i < compte.length; i += 1)
      expect(compte[i]).toBeLessThanOrEqual(compte[i - 1]);
  });

  it("traite les accents comme des lettres", () => {
    const { missing } = checkPassword("Été20245");
    expect(missing).toBe(0);
  });
});

describe("fieldValidator", () => {
  const validateFirstName = fieldValidator(registerClientSchema, "firstName");
  const validatePhone = fieldValidator(registerClientSchema, "phone");

  it("renvoie null quand le champ est valide", () => {
    expect(validateFirstName("Awa")).toBeNull();
    expect(validatePhone("06 12 34 56 7")).toBeNull();
  });

  it("refuse un numéro national trop long", () => {
    expect(validatePhone("06 12 34 56 78")).toMatch(/invalide/);
    expect(validatePhone("123")).toMatch(/invalide/);
  });

  it("renvoie un message exploitable pour un nom invalide", () => {
    expect(validateFirstName("Ab")).toMatch(/3 caractères/);
    expect(validateFirstName("Awa99")).toMatch(/Lettres/);
  });

  it("distingue une saisie rattrapable d'une saisie impossible", () => {
    expect(isHopelessPhone("abc")).toBe(true);
    expect(isHopelessPhone("06abc")).toBe(true);
    expect(isHopelessPhone("071234567")).toBe(true);
    expect(isHopelessPhone("06")).toBe(false);
    expect(isHopelessPhone("0612345")).toBe(false);
    expect(isHopelessPhone("061234567")).toBe(false);
  });
});

describe("états de saisie", () => {
  it("ne dit rien tant que le champ est vide", () => {
    expect(FIELD_STATUS.IDLE).toBe("idle");
  });
});
