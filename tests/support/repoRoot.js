import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

/**
 * Racine du dépôt, résolue en remontant depuis ce fichier.
 *
 * Certains tests lisent une source **sans l'importer** : le contenu de
 * `index.css`, la liste des fichiers sous `src/`, les migrations SQL. Le chemin
 * ne peut donc pas passer par l'alias `@`, qui ne vaut que pour le graphe
 * d'imports.
 *
 * L'expression `new URL('../src/…', import.meta.url)` ne tient qu'aussi
 * longtemps que le test ne change pas de profondeur — or toute l'arborescence
 * de `tests/` est faite pour calquer `src/` et `server/`. Chercher la racine à
 * la volée rend ces tests insensibles à leur propre emplacement.
 */
const MARKER = ['server/app.js', 'src/main.jsx'];

function findRepoRoot(from) {
  let dir = from;
  for (;;) {
    if (MARKER.every((rel) => existsSync(join(dir, rel)))) return dir;
    const up = dirname(dir);
    if (up === dir) return from;
    dir = up;
  }
}

export const REPO_ROOT = findRepoRoot(dirname(fileURLToPath(import.meta.url)));

/** Chemin absolu vers un fichier du dépôt, depuis la racine. */
export const repoPath = (...parts) => resolve(REPO_ROOT, ...parts);
