import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Curseur des éléments cliquables.
 *
 * Tailwind ne pose aucun curseur par défaut sur les boutons et les liens :
 * sans règle explicite, presque toute l'interface affiche la flèche et paraît
 * inerte. Ces tests verrouillent l'existence de la règle et son placement dans
 * `@layer base` — c'est ce placement qui permet à un bouton désactivé de
 * conserver son `cursor-not-allowed` via un utilitaire.
 */
const css = readFileSync(fileURLToPath(new URL('../src/index.css', import.meta.url)), 'utf8');

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
    // n'importe quel utilitaire — dont `cursor-not-allowed` sur un bouton
    // désactivé — reste prioritaire.
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