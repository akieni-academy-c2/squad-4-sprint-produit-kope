import { describe, expect, it } from 'vitest';
import { repoPath } from '@test/support/repoRoot.js';
import { readFileSync } from 'node:fs';

/**
 * Curseur des éléments cliquables.
 *
 * Tailwind ne pose aucun curseur par défaut sur les boutons et les liens :
 * sans règle explicite, presque toute l'interface affiche la flèche et paraît
 * inerte. Ces tests verrouillent l'existence de la règle et son placement dans
 * `@layer base` - c'est ce placement qui permet à un bouton désactivé de
 * conserver son `cursor-not-allowed` via un utilitaire.
 */
const css = readFileSync(repoPath('src/index.css'), 'utf8');

/** Contenu du bloc `@layer base { … }`, accolades imbriquées comprises. */
function baseLayerContent(source) {
  const start = source.indexOf('@layer base');
  if (start === -1) return '';

  const open = source.indexOf('{', start);
  let depth = 0;
  let index = open;

  while (index < source.length) {
    const char = source[index];

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, index);
    }

    index += 1;
  }

  return '';
}

const baseLayer = baseLayerContent(css);

describe('Curseur des éléments cliquables', () => {
  const POINTEURS = ['button:not(:disabled)', '[role=\'button\']', 'a[href]', 'select:not(:disabled)', 'summary', 'label[for]'];

  it.each(POINTEURS)('déclare un curseur sur %s', (selecteur) => {
    expect(baseLayer).toContain(selecteur);
  });

  it('place la règle dans @layer base pour laisser les utilitaires gagner', () => {
    // Le curseur de base est posé par une règle de couche `base`, donc
    // n'importe quel utilitaire - dont `cursor-not-allowed` sur un bouton
    // désactivé - reste prioritaire.
    expect(baseLayer).toContain('cursor: pointer');
    expect(baseLayer.length).toBeGreaterThan(0);
  });

  it('exclut les éléments désactivés', () => {
    // Sans cette exclusion, un bouton grisé afficherait une main et
    // proposerait un clic sans effet.
    expect(baseLayer).toContain('button:not(:disabled)');
    expect(baseLayer).toContain('select:not(:disabled)');
  });

  it('ne touche pas aux champs de saisie', () => {
    // Le curseur texte par défaut est le bon comportement dans un champ.
    expect(baseLayer).not.toMatch(/^\s*input[^-]/m);
    expect(baseLayer).not.toContain('input:not(:disabled)');
    expect(baseLayer).not.toContain('textarea');
  });
});
/**
 * Cascade Tailwind v4 : `@layer` decide, pas l'ordre du fichier.
 *
 * Une regle ecrite hors de toute couche appartient a la couche implicite
 * externe, qui l'emporte sur **toutes** les utilitaires, quelle que soit leur
 * specificite. Treize classes du projet etaient dans ce cas. Deux
 * consequences reelles, sans le moindre avertissement du compilateur :
 *
 * - `p { line-height: 1.65 }` neutralisait tous les `leading-*` du projet. Les
 *   `leading-7` des descriptions de profil et des CGU etaient du code mort.
 * - `.focus-ring:focus-visible` posait un `box-shadow` non surchargeable, donc
 *   aucun anneau de focus ne pouvait le remplacer sur ses 33 usages.
 */

/** Contenu d'un bloc `@layer <nom> { ... }`, accolades imbriquees comprises. */
function layerContent(source, name) {
  const start = source.indexOf(`@layer ${name}`);
  if (start === -1) return '';

  const open = source.indexOf('{', start);
  let depth = 0;
  // Deux 'if' plutot qu'un 'else if' : la regle curly du projet retire les
  // accolades apres 'for', et un 'if' seul sous 'for' se lit comme une faute.
  for (let index = open; index < source.length; index++) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  return '';
}

const utilitiesLayer = layerContent(css, 'utilities');

describe('cascades Tailwind', () => {
  it('declare le bloc @layer utilities', () => {
    expect(utilitiesLayer.length).toBeGreaterThan(0);
  });

  it.each([
    ['.animate-fade-in'],
    ['.animate-scale-in'],
    ['.container-kop'],
    ['.page-padding'],
    ['.bg-checkers'],
    ['.nav-link-active'],
    ['.bg-dots'],
    ['.focus-ring'],
    ['.link-underline'],
    ['.bg-kop-mint'],
  ])('place %s dans @layer utilities', (selector) => {
    expect(utilitiesLayer, selector).toContain(selector);
  });

  it('place le line-height des paragraphes dans @layer base', () => {
    // Hors couche, cette regle ecrasait tous les `leading-*`. Dans `base`, elle
    // ne sert plus que de valeur par defaut, ce qu'un `leading-7` peut
    // remplacer.
    expect(baseLayer).toMatch(/\bp\s*\{[^}]*line-height/);
  });
});

describe('jetons de conception', () => {
  it.each([
    '--z-index-overlay',
    '--z-index-popover',
    '--z-index-toast',
    '--color-tint-mint',
    '--color-tint-cream',
    '--color-tint-rose',
    '--radius-sm',
  ])('declare %s dans @theme', (token) => {
    expect(css, token).toContain(token);
  });
});
