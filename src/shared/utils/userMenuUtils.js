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


export function landingHrefFor(user) {
  if (!user) return ROUTES.HOME;
  if (user.role === ROLES.CLIENT) return ROUTES.SEARCH;
  return dashboardHref(user.role);
}
