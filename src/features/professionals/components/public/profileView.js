import { toWhatsappUrl } from '@/shared/utils';

export const CITY = 'Brazzaville';

export function initialsOf(displayName) {
  return (
    (displayName || '')
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2) || '??'
  );
}

/**
 * Dérive une seule fois les libellés réutilisés par les colonnes, le fil
 * d'Ariane et les modales de la fiche publique.
 */
export function getProfileView(profile, rating) {
  const tradeName = profile.trade?.name || 'Artisan';
  const zones = (profile.zones ?? []).map((z) => z?.name).filter(Boolean);
  const mainZone = zones.find((z) => z !== CITY) ?? zones[0];

  return {
    tradeName,
    zones,
    tags: Array.isArray(profile.tags) ? profile.tags : [],
    avg: Number(rating?.average ?? 0),
    count: Number(rating?.count ?? 0),
    avatarSrc: profile.avatarUrl,
    whatsappUrl: toWhatsappUrl(profile.whatsapp || profile.phone),
    localisation: [CITY, ...zones].filter((z, i, arr) => arr.indexOf(z) === i).join(', '),
    breadcrumbTrade: mainZone ? `${tradeName} à ${mainZone}` : `${tradeName} à ${CITY}`,
    firstName: profile.displayName.trim().split(/\s+/)[0] || profile.displayName,
  };
}