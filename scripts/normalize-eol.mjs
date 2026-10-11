/**
 * Normalise les fins de ligne : supprime les espaces et tabulations en fin de
 * ligne et convertit les CRLF en LF.
 *
 *   node scripts/normalize-eol.mjs [--dry]
 *
 * Les espaces terminaux sont invisibles en diff mais provoquent des conflits de
 * fusion pour rien, et un fichier dont chaque ligne se termine différemment de
 * la précédente fait échouer `git diff --check` en CI.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DRY = process.argv.includes('--dry');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TARGETS = ['src', 'server', 'scripts', 'tests', 'public'];
const ROOT_FILES = ['index.html', 'vite.config.js', 'vitest.config.js', 'eslint.config.js', '.env.example', 'package.json'];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(js|jsx|css|html|json|sql|txt|md|webmanifest)$/.test(entry.name)) yield full;
  }
}

const files = [];
for (const target of TARGETS) {
  for await (const file of walk(join(ROOT, target))) files.push(file);
}
for (const name of ROOT_FILES) {
  try {
    await readFile(join(ROOT, name));
    files.push(join(ROOT, name));
  } catch {
    /* fichier absent : rien à normaliser */
  }
}

let changed = 0;
const details = [];

for (const file of files) {
  const before = await readFile(file, 'utf8');
  const after = before.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '');

  if (before === after) continue;

  changed += 1;
  details.push(relative(ROOT, file));
  if (!DRY) await writeFile(file, after, 'utf8');
}

if (DRY) {
  console.log(`${changed} fichier(s) a normaliser :\n${details.join('\n')}`);
} else {
  console.log(`${changed} fichier(s) normalises.`);
}