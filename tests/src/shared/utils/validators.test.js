import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerClientSchema,
  createReviewSchema,
  becomeProfessionalSchema,
  addPhotoSchema,
} from "@/shared/utils/validators.js";
import { addPhotoSchema as serverAddPhotoSchema } from "@server/modules/photos/photos.schemas.js";

describe("validators (zod)", () => {
  it("loginSchema accepte des identifiants valides", () => {
    const r = loginSchema.safeParse({
      phone: "0612345678",
      password: "Password123!",
    });
    expect(r.success).toBe(true);
  });

  it("loginSchema rejette un téléphone vide", () => {
    const r = loginSchema.safeParse({ phone: "", password: "x" });
    expect(r.success).toBe(false);
  });

  it("registerClientSchema exige prénom, nom, téléphone et mot de passe fort", () => {
    const ok = registerClientSchema.safeParse({
      firstName: "Abel",
      lastName: "Bouanga",
      phone: "061234567",
      password: "Password123!",
      consent: true,
    });
    expect(ok.success).toBe(true);

    const weak = registerClientSchema.safeParse({
      firstName: "Abel",
      lastName: "Bouanga",
      phone: "061234567",
      password: "123",
      consent: true,
    });
    expect(weak.success).toBe(false);
  });

  it("createReviewSchema borne la note entre 1 et 5", () => {
    expect(createReviewSchema.safeParse({ rating: 5 }).success).toBe(true);
    expect(createReviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(createReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it("createReviewSchema tronque le commentaire à 300 caractères", () => {
    const long = "a".repeat(301);
    const r = createReviewSchema.safeParse({ rating: 4, comment: long });
    expect(r.success).toBe(true);
    expect(r.data.comment).toHaveLength(300);
  });

  it("becomeProfessionalSchema exige au moins une zone", () => {
    const r = becomeProfessionalSchema.safeParse({
      displayName: "Pro Test",
      tradeId: 1,
      zoneIds: [],
      description: "Une description suffisamment longue pour être valide.",
      yearsExperience: 5,
    });
    expect(r.success).toBe(false);
  });
});

describe("addPhotoSchema (modal d'ajout de photo)", () => {
  it("accepte un titre et une description valides", () => {
    const values = {
      title: "Réparation d'une fuite cuisine",
      description:
        "Changement du siphon et test d'étanchéité complet en une matinée.",
    };
    expect(addPhotoSchema.safeParse(values).success).toBe(true);
    expect(serverAddPhotoSchema.safeParse(values).success).toBe(true);
  });

  it("rejette un titre trop court et une description trop courte", () => {
    const short = { title: "Ok", description: "Description trop courte" };
    expect(addPhotoSchema.safeParse(short).success).toBe(false);
    expect(serverAddPhotoSchema.safeParse(short).success).toBe(false);
  });

  it("borne la description à 500 caractères et nettoie les espaces", () => {
    const tooLong = {
      title: "Titre valide",
      description: `Description ${"a".repeat(500)}`,
    };
    expect(addPhotoSchema.safeParse(tooLong).success).toBe(false);

    const padded = {
      title: "  Titre valide  ",
      description: `  ${"a".repeat(10)}  `,
    };
    const parsed = serverAddPhotoSchema.safeParse(padded);
    expect(parsed.success).toBe(true);
    expect(parsed.data.title).toBe("Titre valide");
    expect(parsed.data.description).toBe("a".repeat(10));
  });
});
