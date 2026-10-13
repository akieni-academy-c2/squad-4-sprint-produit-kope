export const ROLES = {
  CLIENT: 'client',
  PRO: 'professional',
  ADMIN: 'admin',
};

export const CITIES = ['Brazzaville'];
export const DEFAULT_COUNTRY = 'Congo';
export const DEFAULT_CITY = 'Brazzaville';

export const PAGE_SIZE = 10;
export const MAX_PHOTOS = 10;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME = ['image/jpeg', 'image/png'];

export const RG04_CHECKLIST = [
  { code: 'displayName', label: 'Renseignez le nom affiché' },
  { code: 'trade', label: 'Choisissez un métier' },
  { code: 'zones', label: "Choisissez au moins une zone d'intervention" },
  { code: 'phone', label: 'Renseignez un numéro de téléphone' },
  { code: 'description', label: 'Ajoutez une description (30 caractères minimum)' },
  { code: 'photos', label: 'Ajoutez au moins une photo de réalisation' },
];

export const PROFILE_STATUS = {
  INCOMPLETE: 'incomplete',
  PUBLISHED: 'published',
  HIDDEN: 'hidden',
};

export const PROFILE_STATUS_LABELS = {
  [PROFILE_STATUS.INCOMPLETE]: 'Incomplet',
  [PROFILE_STATUS.PUBLISHED]: 'Publié',
  [PROFILE_STATUS.HIDDEN]: 'Masqué',
};

export const ROUTES = {
  HOME: '/',
  HOW_IT_WORKS: '/how-it-works',
  SEARCH: '/search',
  LOGIN: '/login',
  REGISTER_CLIENT: '/register/client',
  REGISTER_PRO: '/register/professional',
  DASHBOARD_CLIENT: '/dashboard/client',
  DASHBOARD_PRO: '/dashboard/pro',
  ADMIN: '/admin',
  NOT_FOUND: '/404',
  PROFESSIONAL: (id) => `/professionals/${id}`,
};

/**
 * Section courante d'un tableau de bord, déduite du chemin de l'URL.
 *
 * Les onglets sont adressables : `/dashboard/client/avis` recharge la page sur
 * la bonne section, le bouton « retour » du navigateur défait une navigation
 * entre onglets, et un lien de partage — « son avis » — ouvre la bonne vue.
 *
 * On ne compare pas des chaînes brutes mais le **dernier segment** : le chemin
 * peut être préfixé (`/admin`), et une route inconnue doit retomber sur
 * l'accueil du tableau de bord plutôt que sur un écran vide.
 *
 * `''` est la valeur de repli : la racine du tableau de bord reste valide et
 * n'est pas un cas d'erreur.
 */
export function sectionFromPathname(pathname, sections) {
  const segment = String(pathname || '').split('/').filter(Boolean).pop();
  return sections.includes(segment) ? segment : '';
}

/** Chemin d'une section d'un tableau de bord, la racine si l'onglet est celui d'accueil. */
export function sectionHref(base, id, rootId) {
  return id && id !== rootId ? `${base}/${id}` : base;
}

/**
 * Cadre de la colonne centrale d'un tableau de bord.
 *
 * Posé **une fois par page**, autour de la colonne centrale, et non dans chaque
 * section : seules les sections qui passent par un layout de filtres y
 * seraient encadrées, et l'onglet « Vue d'ensemble » ou « Mon profil » —
 * dépourvus de filtres — resterait sur le fond nu. On changeait alors de page
 * en changeant d'onglet.
 *
 * Fond gris doux et bordure : la vue est posée sur le fond de la page comme une
 * feuille sur un bureau. Les cartes blanches de la section contrastent alors
 * avec leur conteneur au lieu de s'y confondre.
 */
export const DASHBOARD_FRAME = 'rounded-md border border-gray-200 bg-gray-50/60 p-4 sm:p-5';
