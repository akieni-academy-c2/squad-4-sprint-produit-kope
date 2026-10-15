export const DESC_MIN = 30;
export const DESC_MAX = 500;

/**
 * État initial du formulaire. Les zones y sont normalisées en identifiants
 * numériques : l'API renvoie des objets, le formulaire ne manipule que des ids.
 * @param {object} profile
 * @returns {object}
 */
export function extractInitial(profile) {
  return {
    displayName: profile?.displayName ?? "",
    tradeId: profile?.tradeId ?? "",
    description: profile?.description ?? "",
    yearsExperience: profile?.yearsExperience ?? "",
    whatsapp: profile?.whatsapp ?? "",
    cityId: profile?.cityId ?? null,
    zoneIds:
      profile?.zones?.map((z) => Number(z.id ?? z))?.filter(Boolean) ??
      profile?.zoneIds ??
      [],
  };
}

export function getFullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.displayName ||
    "Professionnel"
  );
}

export function formatYearsExperience(years) {
  if (years == null || years === "") return "";
  return `${years} an(s)`;
}
