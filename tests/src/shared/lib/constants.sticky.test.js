import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { repoPath, REPO_ROOT } from '@test/support/repoRoot.js';
import { STICKY_TOP } from '@/shared/lib/constants.js';

/**
 * Le haut collant des colonnes latérales.
 *
 * ## La régression que ces tests verrouillent
 *
 * Une valeur écrite onze fois a été factorisée dans le jeton `STICKY_TOP`. Le
 * remplacement automatique a produit la **chaîne littérale** `${STICKY_TOP}`
 * dans des attributs `className="…"` et dans des appels `cn('…')`.
 *
 * Ni l'un ni l'autre n'interpole. Le rendu portait donc une classe morte —
 * `hidden lg:block ${STICKY_TOP} space-y-4` — et **plus aucune colonne de
 * l'application ne collait**. Build vert, ESLint vert, aucun avertissement :
 * la seule trace était visuelle.
 *
 * D'où le test ci-dessous, qui porte sur la forme et pas sur le jeton : il
 * vaut pour n'importe quel identifiant interpolé par mégarde.
 */

const srcRoot = repoPath('src');
const SEP = /[\\/]/;

function sourceFiles() {
  const walk = (dir) =>
    readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      return statSync(path).isDirectory() ? walk(path) : [path];
    });

  // Separateurs normalises : sous Windows join rend des antislash, et la
  // comparaison avec une cle en oblique ne correspondrait jamais.
  return walk(srcRoot)
    .filter((f) => f.endsWith('.jsx') || f.endsWith('.js'))
    .map((f) => f.slice(REPO_ROOT.length + 1).replace(SEP, '/'));
}

describe('le jeton lui-même', () => {
  it('porte le palier et la position', () => {
    expect(STICKY_TOP).toContain('lg:sticky');
    expect(STICKY_TOP).toContain('lg:top-(--header-height)');
  });

  it('utilise une variable CSS et non une classe Tailwind inexistante', () => {
    // `lg:top-23` avait l'air d'un décalage d'en-tête : 23 n'existe pas dans
    // l'échelle Tailwind (20, puis 24). La classe n'était jamais générée, et
    // rien ne le signalait — le collant était simplement absent.
    expect(STICKY_TOP).not.toMatch(/\btop-\d{2,}\b/);
  });
});

/** Le fichier qui declare le jeton, seul endroit ou la valeur apparait en clair.
 *  On le reconnait a son xport const, pas a son chemin : comparer des chemins
 *  suppose que la meme plate-forme executera un jour le test qu'un autre. */
const declaresToken = (code) => /export const STICKY_TOP/.test(code);

describe('usage dans l’application', () => {
  it('n’est jamais écrit comme une chaîne littérale', () => {
    const offenders = [];

    for (const file of sourceFiles()) {
      const code = readFileSync(repoPath(file), 'utf8');
      if (declaresToken(code)) continue;

      // `className="… ${X} …"` : l'attribut est une chaîne simple, `${}` y est
      // du texte. C'est le cas qui a produit la régression.
      for (const m of code.matchAll(/className="([^"]*)"/g))
        if (m[1].includes('${')) offenders.push(`${file} — className="${m[1]}"`);

      // `cn('…')` : même règle, chaîne simple.
      for (const m of code.matchAll(/cn\('([^']*)'/g))
        if (m[1].includes('${')) offenders.push(`${file} — cn('${m[1]}')`);
    }

    expect(offenders, 'classe morte : interpolation dans une chaîne simple').toEqual([]);
  });

  it('est importé là où il est utilisé', () => {
    for (const file of sourceFiles()) {
      const code = readFileSync(repoPath(file), 'utf8');
      if (declaresToken(code)) continue;
      if (!/\bSTICKY_TOP\b/.test(code)) continue;

      // Une interpolation non importée ne lève pas : elle rend `undefined`.
      expect(code, `${file} utilise STICKY_TOP sans l'importer`).toMatch(
        /import \{[^}]*\bSTICKY_TOP\b[^}]*\} from '@\/shared\/lib\/constants\.js'/,
      );
    }
  });

  it('reste la seule déclaration de ce décalage', () => {
    // Onze recopiées sont redevenues une : le jour où la valeur change, ce sera
    // un endroit à corriger, pas onze.
    const offenders = sourceFiles().filter(
      (file) =>
        !declaresToken(readFileSync(repoPath(file), 'utf8')) &&
        /lg:top-\(--header-height\)/.test(readFileSync(repoPath(file), 'utf8')),
    );

    expect(offenders).toEqual([]);
  });
});
