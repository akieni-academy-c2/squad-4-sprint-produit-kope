import { describe, it, expect } from "vitest";
import {
  CITY,
  getProfileView,
  initialsOf,
} from "@/features/professionals/components/public/profileView.js";

const profile = {
  id: 7,
  displayName: "Jean-Pierre Mbarga",
  whatsapp: "+242 06 11 22 33",
  phone: "+242 05 00 00 00",
  tags: ["Plomberie", "Électricité"],
  zones: [{ name: "Mfilou" }, { name: CITY }, { name: "Makélékélé" }, null],
};

describe("initialsOf", () => {
  it("prend les deux premièresinitiales", () => {
    expect(initialsOf("Jean-Pierre Mbarga")).toBe("JM");
    expect(initialsOf("  marie  claire ")).toBe("MC");
  });

  it("ne plante pas sur une entrée vide", () => {
    expect(initialsOf("")).toBe("??");
    expect(initialsOf(null)).toBe("??");
    expect(initialsOf(undefined)).toBe("??");
  });
});

describe("getProfileView", () => {
  it("extrait le prénom et le métier", () => {
    const view = getProfileView(
      { ...profile, trade: { name: "Plombier" } },
      { average: 4.5, count: 3 },
    );
    expect(view.firstName).toBe("Jean-Pierre");
    expect(view.tradeName).toBe("Plombier");
  });

  it("retombe sur un métier par défaut", () => {
    expect(getProfileView(profile, null).tradeName).toBe("Artisan");
  });

  it("nettoie les zones et retire les entrées vides", () => {
    const view = getProfileView(profile, null);
    expect(view.zones).toEqual(["Mfilou", CITY, "Makélékélé"]);
  });

  it("retombe sur la ville quand aucune zone réelle", () => {
    const onlyCity = { ...profile, zones: [{ name: CITY }] };
    expect(getProfileView(onlyCity, null).breadcrumbTrade).toBe(
      `Artisan à ${CITY}`,
    );
  });

  it("préfère une zone réelle pour le fil d’Ariane", () => {
    const view = getProfileView(
      { ...profile, trade: { name: "Plombier" } },
      null,
    );
    expect(view.breadcrumbTrade).toBe("Plombier à Mfilou");
  });

  it("déduplique la ville dans la localisation", () => {
    expect(getProfileView(profile, null).localisation).toBe(
      `${CITY}, Mfilou, Makélékélé`,
    );
  });

  it("convertit les notes en nombres et tolère une note absente", () => {
    expect(getProfileView(profile, {}).avg).toBe(0);
    expect(getProfileView(profile, {}).count).toBe(0);
    expect(getProfileView(profile, { average: "4.5", count: "3" }).avg).toBe(
      4.5,
    );
  });

  it("normalise les tags non tableaux", () => {
    expect(getProfileView({ ...profile, tags: null }, null).tags).toEqual([]);
    expect(getProfileView({ ...profile, tags: "peinture" }, null).tags).toEqual(
      [],
    );
  });

  it("construit le lien WhatsApp à partir du téléphone", () => {
    expect(
      getProfileView({ ...profile, whatsapp: null }, null).whatsappUrl,
    ).toBe("https://wa.me/24205000000");
  });

  it("privilégie le numéro WhatsApp dédié", () => {
    expect(getProfileView(profile, null).whatsappUrl).toBe(
      "https://wa.me/24206112233",
    );
  });
});
