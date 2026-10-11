import { ROUTES, ROLES } from '@/shared/lib/constants.js';

export function displayNameFor(user) {
  if (!user) return null;
  if (user.role === ROLES.PRO) return user.displayName;
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || `#${user.id}`;
}

export function roleLabel(role) {
  return {
    [ROLES.CLIENT]: 'Client',
    [ROLES.PRO]: 'Professionnel',
    [ROLES.ADMIN]: 'Administrateur',
  }[role] || role;
}

export function dashboardHref(role) {
  if (role === ROLES.CLIENT) return ROUTES.DASHBOARD_CLIENT;
  if (role === ROLES.PRO) return ROUTES.DASHBOARD_PRO;
  if (role === ROLES.ADMIN) return ROUTES.ADMIN;
  return ROUTES.HOME;
}

/**
 * Point d'entrée d'un utilisateur connecté, depuis le logo comme depuis `/`.
 *
 * Un professionnel gère un profil et un administrateur gère le site : ils ont
 * une page qui leur est propre. Un client, lui, n'a rien à gérer — son espace
 * ne contient que ses demandes et ses avis, tous accessibles depuis la
 * recherche. La recherche est donc son point d'entrée, pas son tableau de bord.
 *
 * `dashboardHref` reste inchangée : le lien « Mon espace » du menu continue
 * d'ouvrir l'espace client.
 */
export function landingHrefFor(user) {
  if (!user) return ROUTES.HOME;
  if (user.role === ROLES.CLIENT) return ROUTES.SEARCH;
  return dashboardHref(user.role);
}
