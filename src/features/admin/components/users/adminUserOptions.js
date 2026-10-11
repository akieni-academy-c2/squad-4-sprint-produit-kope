import { ROLES } from '@/shared/lib/constants.js';

export const ROLE_LABELS = {
  [ROLES.CLIENT]: 'Client',
  [ROLES.PRO]: 'Professionnel',
  [ROLES.ADMIN]: 'Administrateur',
};

export const ROLE_VARIANTS = {
  [ROLES.CLIENT]: 'neutral',
  [ROLES.PRO]: 'info',
  [ROLES.ADMIN]: 'success',
};

export const ROLE_OPTIONS = [
  { value: '', label: 'Tous les rôles' },
  { value: ROLES.CLIENT, label: 'Clients' },
  { value: ROLES.PRO, label: 'Professionnels' },
  { value: ROLES.ADMIN, label: 'Administrateurs' },
];

export const EMPTY_ADMIN = { firstName: '', lastName: '', phone: '', password: '' };

export const MIN_PASSWORD_LENGTH = 8;

export function getUserName(user) {
  return user.displayName || [user.firstName, user.lastName].filter(Boolean).join(' ') || `#${user.id}`;
}

export function validateAdminDraft(draft) {
  if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.phone.trim())
    return 'Prénom, nom et numéro sont obligatoires';
  if (draft.password.length < MIN_PASSWORD_LENGTH)
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`;
  return null;
}

export function toAdminPayload(draft) {
  return {
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    phone: draft.phone.trim(),
    password: draft.password,
  };
}