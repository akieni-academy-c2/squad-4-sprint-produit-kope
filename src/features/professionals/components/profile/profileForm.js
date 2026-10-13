export const DESC_MIN = 30;
export const DESC_MAX = 500;

export function extractInitial(profile) {
  return {
    displayName: profile?.displayName ?? '',
    tradeId: profile?.tradeId ?? '',
    description: profile?.description ?? '',
    yearsExperience: profile?.yearsExperience ?? '',
    whatsapp: profile?.whatsapp ?? '',
    // `null` et non `''` : la ville est le seul champ du formulaire où « rien
    // sélectionné » est une valeur valide — le serveur la stocke en NULL.
    cityId: profile?.cityId ?? null,
    zoneIds: profile?.zones?.map((z) => Number(z.id ?? z))?.filter(Boolean) ?? profile?.zoneIds ?? [],
  };
}

export function getFullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.displayName ||
    'Professionnel'
  );
}

/** « 12 an(s) » - chaîne vide quand l'expérience n'est pas renseignée. */
export function formatYearsExperience(years) {
  if (years == null || years === '') return '';
  return `${years} an(s)`;
}