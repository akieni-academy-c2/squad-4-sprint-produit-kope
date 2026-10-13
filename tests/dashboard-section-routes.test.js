import { describe, expect, it } from 'vitest';
import { sectionFromPathname, sectionHref } from '../src/shared/lib/constants.js';

/**
 * Les onglets de tableau de bord sont adressables : la section est lue dans
 * le chemin, pas dans un état local.
 *
 * Ces tests verrouillent le contrat dont dépend `useSectionNav` : si la
 * déduction du chemin se trompe, le tableau de bord affiche une section vide
 * alors que l'URL est correcte — un écran blanc sans message d'erreur.
 */
const SECTIONS = ['apercu', 'avis', 'contacts', 'signalements', 'profil'];
const ROOT = 'apercu';

describe('section d’un tableau de bord déduite du chemin', () => {
  it('reconnaît la section d’une URL profonde', () => {
    expect(sectionFromPathname('/dashboard/client/avis', SECTIONS)).toBe('avis');
    expect(sectionFromPathname('/dashboard/client/profil', SECTIONS)).toBe('profil');
  });

  it('reconnaît la racine comme l’onglet d’accueil', () => {
    expect(sectionFromPathname('/dashboard/client', SECTIONS)).toBe('');
    expect(sectionFromPathname('/dashboard/client/', SECTIONS)).toBe('');
  });

  it('retombe sur l’accueil sur une route inconnue', () => {
    // Pas d’écran vide : une URL éditoriale cassée ne doit pas laisser la
    // colonne centrale déserte. `useSectionNav` applique le repli sur `rootId`.
    expect(sectionFromPathname('/dashboard/client/inconnu', SECTIONS)).toBe('');
    expect(sectionFromPathname('/dashboard/client/avis/modifier', SECTIONS)).toBe('');
  });

  it('ne confond pas un préfixe de segment', () => {
    // Un test par préfixe passerait avec une comparaison `startsWith`, qui
    // ferait correspondre « contacts » à « contacts-archives ».
    expect(sectionFromPathname('/dashboard/client/contacts-archives', SECTIONS)).toBe('');
  });

  it('compose le chemin d’une section, la racine pour l’accueil', () => {
    expect(sectionHref('/dashboard/client', 'avis', ROOT)).toBe('/dashboard/client/avis');
    // La racine reste la racine : `/dashboard/client/apercu` serait une seconde
    // façon d’écrire la même adresse, et le bouton « retour » y verrait deux
    // entrées au lieu d’une.
    expect(sectionHref('/dashboard/client', ROOT, ROOT)).toBe('/dashboard/client');
  });

  it('fait l’aller-retour entre section et racine', () => {
    const base = '/dashboard/client';
    const href = sectionHref(base, 'contacts', ROOT);

    expect(sectionFromPathname(href, SECTIONS)).toBe('contacts');
    // La racine rend `''`, et c'est `useSectionNav` qui applique le repli sur
    // `rootId` : le helper ne connaît pas l'onglet d'accueil d'un espace donné.
    expect(sectionFromPathname(sectionHref(base, ROOT, ROOT), SECTIONS)).toBe('');
  });
});

/**
 * Régression : `RootLayout` comparait les routes par égalité exacte. Dès que les
 * onglets ont porté l'URL, `/admin` n'était plus reconnu sur `/admin/users` —
 * le fond pointillé disparaissait et la réserve de la barre du bas avec lui,
 * ce qui décalait toute la mise en page au changement d'onglet.
 */
const isUnder = (pathname, base) =>
  pathname === base || (Boolean(base) && pathname.startsWith(`${base}/`));

describe('reconnaissance d’un tableau de bord et de ses onglets', () => {
  it('reconnaît la racine comme ses sous-sections', () => {
    expect(isUnder('/admin', '/admin')).toBe(true);
    expect(isUnder('/admin/users', '/admin')).toBe(true);
    expect(isUnder('/dashboard/pro/signalements', '/dashboard/pro')).toBe(true);
    expect(isUnder('/dashboard/client/avis', '/dashboard/client')).toBe(true);
  });

  it('ne reconnaît pas un autre chemin qui commence pareil', () => {
    // `startsWith('/admin')` seul ferait correspondre `/administrateur`.
    expect(isUnder('/administrateur', '/admin')).toBe(false);
    expect(isUnder('/dashboard', '/dashboard/client')).toBe(false);
    expect(isUnder('/search', '/admin')).toBe(false);
  });
});