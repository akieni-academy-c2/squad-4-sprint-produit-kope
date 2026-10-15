import { FEATURED_FACES, HOME_IMAGES } from "@/shared/content/homeImages.js";

/**
 * Visages mis en avant sur l'accueil. Contenu statique, comme HIGHLIGHTED_TRADES :
 * l'accueil doit s'afficher même API éteinte, et ses cartes renvoient toutes
 * vers /search (voir ProfessionalCard), donc aucun identifiant n'est exposé.
 * Les photographies viennent du stock du dépôt, jamais d'un service distant.
 */
export const HOME_FEATURED_PROS = [
  {
    id: "home-plombier",
    displayName: "Grace Mpassi",
    trade: "Plombier",
    zones: ["Makélékélé", "Bacongo"],
    yearsExperience: 12,
    isAvailable: true,
    rating: { average: 4.8, count: 17 },
    previewImage: FEATURED_FACES[0],
  },
  {
    id: "home-electricien",
    displayName: "David Malonga",
    trade: "Électricien",
    zones: ["Poto-Poto", "Moungali"],
    yearsExperience: 8,
    isAvailable: true,
    rating: { average: 4.6, count: 11 },
    previewImage: HOME_IMAGES.face1.src,
    srcSet: HOME_IMAGES.face1.srcSet,
    sizes: HOME_IMAGES.face1.sizes,
  },
  {
    id: "home-macon",
    displayName: "Patrick Kengue",
    trade: "Maçon",
    zones: ["Talangaï", "Mfilou"],
    yearsExperience: 15,
    isAvailable: false,
    rating: { average: 4.9, count: 23 },
    previewImage: HOME_IMAGES.face2.src,
    srcSet: HOME_IMAGES.face2.srcSet,
    sizes: HOME_IMAGES.face2.sizes,
  },
];
