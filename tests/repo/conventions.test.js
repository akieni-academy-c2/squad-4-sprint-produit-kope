import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { repoPath } from '../support/repoRoot.js';

/**
 * Conventions de dépôt, vérifiées à chaque `npm test`.
 *
 * Ces règles vivaient dans des scripts lancés à la main, donc jamais exécutés.
 * En test, elles bloquent la régression au même endroit que le reste.
 */

const ROOTS = ['src', 'server'];
const EXTENSIONS = new Set(['.js', '.jsx', '.mjs']);
const SKIP = new Set(['node_modules', 'dist', '.git']);

/** Au-delà, un commentaire rede devient une seconde implémentation. */
const MAX_COMMENT_LINES = 6;

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else if (EXTENSIONS.has(path.extname(entry.name))) visit(full);
  }
}

const files = [];
for (const root of ROOTS) if (fs.existsSync(repoPath(root))) walk(repoPath(root), (f) => files.push(f));

/** Blocs de commentaire de plus de `MAX_COMMENT_LINES` lignes. */
function longComments(source) {
  const lines = source.split(/\r?\n/);
  const found = [];
  let start = -1;

  lines.forEach((line, i) => {
    const opens = /^\s*(\/\*\*?|\{\/\*)/.test(line);
    const continues = start !== -1 && /^\s*(\*|\*\/|\/\*|.*\}\/\*)/.test(line);

    if (opens) {
      if (start !== -1 && i - start > MAX_COMMENT_LINES) found.push({ line: start + 1, count: i - start });
      start = i;
    } else if (start !== -1 && !continues) {
      if (i - start > MAX_COMMENT_LINES) found.push({ line: start + 1, count: i - start });
      start = -1;
    }
  });

  if (start !== -1 && lines.length - start > MAX_COMMENT_LINES)
    found.push({ line: start + 1, count: lines.length - start });

  return found;
}

describe('longueur des commentaires', () => {
  it.each(files)('%s', (file) => {
    const long = longComments(fs.readFileSync(file, 'utf8'));
    expect(
      long,
      `commentaire de plus de ${MAX_COMMENT_LINES} lignes : ${long.map((l) => `ligne ${l.line} (${l.count})`).join(', ')}`,
    ).toEqual([]);
  });
});

describe('encodage des sources', () => {
  // Tabulation exclue : indentation. LF et CR sont des fins de ligne, pas du
  // contenu.
  const FORBIDDEN = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

  it.each(files)('%s', (file) => {
    const rel = path.relative(repoPath(), file);
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

    // U+FFFD : signe d'un fichier réécrit avec un mauvais encodage.
    const replacement = lines.flatMap((line, i) =>
      line.includes('\uFFFD') ? [`${rel}:${i + 1}`] : [],
    );
    expect(replacement, 'caractère de remplacement U+FFFD').toEqual([]);

    const controls = lines.flatMap((line, i) =>
      [...line].some((c) => FORBIDDEN.includes(c.codePointAt(0)))
        ? [`${rel}:${i + 1}`]
        : [],
    );
    expect(controls, 'caractère de contrôle').toEqual([]);
  });
});