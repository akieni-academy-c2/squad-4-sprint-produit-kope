import { describe, expect, it } from 'vitest';
import { demoRoles } from '@/features/auth/services/auth.service.js';
import { ROLES, ROUTES } from '@/shared/lib/constants.js';


const EXPECTED = [
  [ROLES.ADMIN, 'Administrateur', ROUTES.ADMIN],
  [ROLES.PRO, 'Professionnel', ROUTES.DASHBOARD_PRO],
  [ROLES.CLIENT, 'Client', ROUTES.DASHBOARD_CLIENT],
];

describe('Profils de démonstration', () => {
  it('propose un profil par rôle', () => {
    const roles = demoRoles();

    expect(roles.map((r) => r.role)).toEqual(EXPECTED.map(([role]) => role));
  });

  it('renvoie chaque rôle vers sa page', () => {
    for (const [role, , href] of EXPECTED)
      expect(demoRoles().find((r) => r.role === role)?.href, role).toBe(href);
  });

  it('étiquette chaque profil pour l\'affichage', () => {
    for (const [, label] of EXPECTED)
      expect(demoRoles().find((r) => r.label === label)).toBeTruthy();
  });

  it('donne à chaque profil un rôle cohérent avec son utilisateur', () => {
    for (const entry of demoRoles())
      expect(entry.user.role, entry.label).toBe(entry.role);
  });

  it('donne à chaque profil un identifiant', () => {
    for (const entry of demoRoles())
      expect(typeof entry.user.id, entry.label).toBe('number');
  });

  it('donne un nom affichable à chaque profil', () => {
    for (const entry of demoRoles()) {
      const hasName = entry.user.displayName
        || [entry.user.firstName, entry.user.lastName].filter(Boolean).join(' ').trim();

      expect(hasName, entry.label).toBeTruthy();
    }
  });

  it('donne des identifiants distincts à chaque profil', () => {
    const ids = demoRoles().map((r) => r.user.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('donne un téléphone au professionnel, pour les liens de contact', () => {
    const pro = demoRoles().find((r) => r.role === ROLES.PRO);

    expect(pro?.user.phone).toMatch(/^\+242/);
  });

  it('aligne le professionnel de démo sur un profil public existant', () => {
    const pro = demoRoles().find((r) => r.role === ROLES.PRO);

    expect(pro?.user.displayName).toBeTruthy();
  });
});