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
  TERMS: '/conditions-utilisation',
  NOT_FOUND: '/404',
  PROFESSIONAL: (id) => `/professionals/${id}`,
};

/**
 * Section courante d'un tableau de bord, déduite du chemin de l'URL.
 *
 * Les onglets sont adressables : `/dashboard/client/avis` recharge la page sur
 * la bonne section, le bouton « retour » du navigateur défait une navigation
 * entre onglets, et un lien de partage - « son avis » - ouvre la bonne vue.
 *
 * On ne compare pas des chaînes brutes mais le **dernier segment** : le chemin
 * peut être préfixé (`/admin`), et une route inconnue doit retomber sur
 * l'accueil du tableau de bord plutôt que sur un écran vide.
 *
 * `''` est la valeur de repli : la racine du tableau de bord reste valide et
 * n'est pas un cas d'erreur.
 */

/**
 * Haut collant des colonnes latérales : sous le header, avec un jour de
 * respiration. Un `top: var(--header-height)` colle la colonne au bord de la
 * barre, et les deux boîtes se touchent - on lit un empilement raté.
 *
 * Hauteur du header en variable CSS pour qu'un changement suive tout seul.
 *
 * Déclaré une seule fois : la valeur était recopiée onze fois, et avait déjà
 * changé une fois (`lg:top-23` - classe inexistante, l'échelle s'arrête à 20
 * puis 24 ; elle n'était jamais générée, le collant était simplement absent).
 */
export const STICKY_TOP = 'lg:sticky lg:top-[calc(var(--header-height)+1rem)]';

/** Bas collant, même respiration que `STICKY_TOP` en haut. */
export const STICKY_BOTTOM = 'lg:bottom-4';

/**
 * Colonne épinglée sur les deux bords - pour les cartes d'action unique.
 *
 * Bornée en haut et en bas, elle ne quitte pas la bande entre les deux et se
 * met à défiler dedans plutôt que de sortir de l'écran. C'est ce qu'il faut
 * d'une action qu'on cherche une fois Having lu : elle reste atteignable du
 * haut et du bas de la page.
 *
 * Collée en haut seulement, elle disparaît quand on arrive en bas de la fiche.
 */
export const STICKY_BAND = `${STICKY_TOP} ${STICKY_BOTTOM}`;

/**
 * Colonne latérale d'une grille, collante.
 *
 * `STICKY_TOP` + `align-self: start`, et c'est la seconde moitié qui compte. Un
 * `sticky` se déplace dans la boîte de son parent : si la boîte fait exactement
 * sa hauteur, il n'a nulle part où aller. Or un élément de grille s'étire par
 * défaut sur toute la hauteur de la ligne - une colonne de filtres étirée ne
 * colle plus, sans que rien ne le signale.
 *
 * Les deux moitiés sont liées dans un seul jeton : impossible d'en garder une
 * sans l'autre. Elles ne l'étaient pas - les colonnes de gauche portaient
 * `self-start`, celles de droite non, et sur la même page une suivait le
 * défilement pendant que l'autre restait en haut.
 */
export const STICKY_COLUMN = `${STICKY_TOP} lg:self-start`;

/**
 * Section d'un tableau de bord déduite du chemin.
 *
 * La racine (`/admin`) n'a pas de section : elle rend `''`, et c'est
 * `useSectionNav` qui applique le repli sur l'onglet d'accueil. Une route
 * inconnue retombe aussi sur `''` plutôt que sur un écran vide.
 */
export function sectionFromPathname(pathname, sections) {
  const segment = String(pathname || '').split('/').filter(Boolean).pop();
  return sections.includes(segment) ? segment : '';
}

/** Chemin d'une section d'un tableau de bord, la racine si l'onglet est celui d'accueil. */
export function sectionHref(base, id, rootId) {
  return id && id !== rootId ? `${base}/${id}` : base;
}
