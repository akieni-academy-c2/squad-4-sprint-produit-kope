/**
 * Recherche d'URL et d'adresses codées en dur dans le code applicatif.
 *
 *   node scripts/scan-hardcoded-urls.mjs
 *
 * Toute URL doit venir de l'environnement : une adresse de production écrite
 * en dur dans le source survit à un changement de domaine et se retrouve dans
 * le bundle public. Les tests et la documentation sont exclus - ils décrivent
 * volontairement un contexte fixe.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCANNED = ['src', 'server', 'scripts'];

/**
 * Correspond un littéral d'URL ou une adresse de boucle locale.
 */
const PATTERN = /https?:\/\/[^\s'"`)]+|localhost|\b127\.0\.0\.1\b|\b0\.0\.0\.0\b/g;

/**
 * Faux positifs : espaces de noms XML, exemples, placeholders.
 */
const IGNORED = [
  /^https?:\/\/schema\.org$/,
  /^https?:\/\/www\.w3\.org\/\d{4}\/svg$/,
  /^https?:\/\/example\.(com|org|net)/,
  /^https?:\/\/votre-domaine/,
  /\$\{/,
];

/**
 * Fichiers où une URL figée est légitime : l'attribution d'auteur. Un lien de
 * profil identifie une personne, il ne configure pas un déploiement.
 */
const IDENTITY_FILES = new Set(['src\\shared\\data\\credits.js']);

const findings = [];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(js|jsx|css|html)$/.test(entry.name)) yield full;
  }
}

for (const target of SCANNED) {
  for await (const file of walk(join(ROOT, target))) {
    const lines = (await readFile(file, 'utf8')).split('\n');

    lines.forEach((line, index) => {
      // Les commentaires documentent les formats : une URL citée en exemple
      // n'est pas une URL appelée.
      const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
      for (const match of code.matchAll(PATTERN)) {
        if (IGNORED.some((re) => re.test(match[0]))) continue;
        if (IDENTITY_FILES.has(relative(ROOT, file))) continue;
        findings.push(`${relative(ROOT, file)}:${index + 1}  ${match[0]}`);
      }
    });
  }
}

if (findings.length === 0) {
  console.log('Aucune URL codee en dur dans src/, server/ et scripts/.');
} else {
  console.log(`${findings.length} URL(s) en dur :\n${findings.join('\n')}`);
}