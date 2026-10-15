import { describe, expect, it } from "vitest";
import { sectionFromPathname, sectionHref } from "@/shared/lib/constants.js";

const SECTIONS = ["apercu", "avis", "contacts", "signalements", "profil"];
const ROOT = "apercu";

describe("section d'un tableau de bord déduite du chemin", () => {
  it("reconnaît la section d'une URL profonde", () => {
    expect(sectionFromPathname("/dashboard/client/avis", SECTIONS)).toBe(
      "avis",
    );
    expect(sectionFromPathname("/dashboard/client/profil", SECTIONS)).toBe(
      "profil",
    );
  });

  it("reconnaît la racine comme l'onglet d'accueil", () => {
    expect(sectionFromPathname("/dashboard/client", SECTIONS)).toBe("");
    expect(sectionFromPathname("/dashboard/client/", SECTIONS)).toBe("");
  });

  it("retombe sur l'accueil sur une route inconnue", () => {
    expect(sectionFromPathname("/dashboard/client/inconnu", SECTIONS)).toBe("");
    expect(
      sectionFromPathname("/dashboard/client/avis/modifier", SECTIONS),
    ).toBe("");
  });

  it("ne confond pas un préfixe de segment", () => {
    expect(
      sectionFromPathname("/dashboard/client/contacts-archives", SECTIONS),
    ).toBe("");
  });

  it("compose le chemin d'une section, la racine pour l'accueil", () => {
    expect(sectionHref("/dashboard/client", "avis", ROOT)).toBe(
      "/dashboard/client/avis",
    );
    expect(sectionHref("/dashboard/client", ROOT, ROOT)).toBe(
      "/dashboard/client",
    );
  });

  it("fait l'aller-retour entre section et racine", () => {
    const base = "/dashboard/client";
    const href = sectionHref(base, "contacts", ROOT);

    expect(sectionFromPathname(href, SECTIONS)).toBe("contacts");
    expect(sectionFromPathname(sectionHref(base, ROOT, ROOT), SECTIONS)).toBe(
      "",
    );
  });
});

const isUnder = (pathname, base) =>
  pathname === base || (Boolean(base) && pathname.startsWith(`${base}/`));

describe("reconnaissance d'un tableau de bord et de ses onglets", () => {
  it("reconnaît la racine comme ses sous-sections", () => {
    expect(isUnder("/admin", "/admin")).toBe(true);
    expect(isUnder("/admin/users", "/admin")).toBe(true);
    expect(isUnder("/dashboard/pro/signalements", "/dashboard/pro")).toBe(true);
    expect(isUnder("/dashboard/client/avis", "/dashboard/client")).toBe(true);
  });

  it("ne reconnaît pas un autre chemin qui commence pareil", () => {
    expect(isUnder("/administrateur", "/admin")).toBe(false);
    expect(isUnder("/dashboard", "/dashboard/client")).toBe(false);
    expect(isUnder("/search", "/admin")).toBe(false);
  });
});
