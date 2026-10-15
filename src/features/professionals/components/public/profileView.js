import { toWhatsappUrl } from "@/shared/utils";

export const CITY = "Brazzaville";

export const ABOUT_HEADING = "À propos";
export const ABOUT_FALLBACK = "Aucune présentation n’a encore été renseignée.";

/**
 * Initiales de l'avatar de repli : deux lettres au plus, `??` si le nom est vide.
 * @param {string} displayName
 * @returns {string}
 */
export function initialsOf(displayName) {
  return (
    (displayName || "")
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "??"
  );
}

/**
 * Vue de présentation du profil public : dérive de la fiche brute et de la note
 * tous les libellés affichés. `mainZone` écarte volontairement la ville, sinon le
 * fil d'Ariane afficherait « à Brazzaville » pour un professionnel dont la seule
 * zone est Brazzaville.
 * @param {object} profile fiche professionnelle
 * @param {{average?: number, count?: number}} rating note agrégée
 * @returns {object} champs consommés par la page publique
 */
export function getProfileView(profile, rating) {
  const tradeName = profile.trade?.name || "Artisan";
  const zones = (profile.zones ?? []).map((z) => z?.name).filter(Boolean);
  const tags = Array.isArray(profile.tags) ? profile.tags : [];
  const mainZone = zones.find((z) => z !== CITY) ?? zones[0];

  return {
    tradeName,
    zones,
    tags,
    hasAbout:
      Boolean(profile.description) || zones.length > 0 || tags.length > 0,
    avg: Number(rating?.average ?? 0),
    count: Number(rating?.count ?? 0),
    avatarSrc: profile.avatarUrl,
    whatsappUrl: toWhatsappUrl(profile.whatsapp || profile.phone),
    localisation: [CITY, ...zones]
      .filter((z, i, arr) => arr.indexOf(z) === i)
      .join(", "),
    breadcrumbTrade: mainZone
      ? `${tradeName} à ${mainZone}`
      : `${tradeName} à ${CITY}`,
    firstName:
      profile.displayName.trim().split(/\s+/)[0] || profile.displayName,
  };
}
