/**
 * Quartiers affichés sur l'accueil. Liste statique, dans le même esprit que
 * HIGHLIGHTED_TRADES qui fige déjà des identifiants de métier : l'accueil ne
 * doit dépendre d'aucun appel API. Les identifiants correspondent au
 * référentiel `zones` de la base (migration 1759500000010_cities.sql).
 */
export const HOME_ZONES = [
  { id: 1, name: "Makélékélé" },
  { id: 2, name: "Bacongo" },
  { id: 3, name: "Poto-Poto" },
  { id: 4, name: "Moungali" },
  { id: 5, name: "Ouenzé" },
  { id: 6, name: "Talangaï" },
  { id: 7, name: "Mfilou" },
  { id: 8, name: "Madibou" },
  { id: 9, name: "Djiri" },
];
