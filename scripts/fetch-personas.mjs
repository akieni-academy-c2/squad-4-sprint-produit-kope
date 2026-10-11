/**
 * Génère les données de démonstration à partir du service de personnes.
 *
 *   PERSONA_API_URL=https://… npm run mock:personas
 *
 * Les données sont figées dans `src/shared/mocks/personas.json` plutôt que
 * récupérées à l'exécution : l'application doit rester déterministe, fonctionner
 * hors ligne et ne pas exposer l'adresse IP des visiteurs à un service tiers.
 *
 * L'URL du service vient de l'environnement, jamais du code source.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUTPUT = join(ROOT, 'src', 'shared', 'mocks', 'personas.json');

const BASE_URL = process.env.PERSONA_API_URL;
const COUNT = Number(process.env.PERSONA_API_COUNT) || 40;

/** Bornes d'âge pour un professionnel en activité. */
const AGE_MIN = Number(process.env.PERSONA_MIN_AGE) || 19;
const AGE_MAX = Number(process.env.PERSONA_MAX_AGE) || 69;

if (!BASE_URL) {
  console.error('PERSONA_API_URL est requise. Voir .env.example.');
  process.exit(1);
}

const AGE_GROUPS = 'teen,adult,senior';

/**
 * Contexte des portraits. `construction` force une tenue de chantier — casque,
 * bleu de travail — là où `standard` ou `business` produisent des tenues de
 * bureau ou de soignant qui n'ont rien à faire sur une fiche d'artisan.
 */
const PORTRAIT_CONTEXTS = process.env.PERSONA_PORTRAIT_CONTEXTS || 'construction';

const url = new URL(BASE_URL);
url.searchParams.set('count', String(COUNT));
url.searchParams.set('ageGroup', AGE_GROUPS);
url.searchParams.set('residenceCountry', 'CG');
url.searchParams.set('emailDomain', 'example.test');
url.searchParams.set('portraitContexts', PORTRAIT_CONTEXTS);

const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });

if (!response.ok)
  throw new Error(`Réponse ${response.status} ${response.statusText}`);

const payload = await response.json();
const people = payload?.results ?? [];

if (!Array.isArray(people) || people.length === 0)
  throw new Error('Réponse sans résultat : champ « results » vide ou absent.');

/**
 * Le service n'expose aucun filtre d'âge : `minAge`, `ageMin` et `age` sont
 * tous rejetés. La borne est donc appliquée ici, après tri par âge croissant
 * pour ne conserver que les plus proches des limites.
 */
const shape = (person) => ({
  id: person.id,
  firstName: person.name?.first ?? '',
  lastName: person.name?.last ?? '',
  fullName: person.name?.full ?? '',
  gender: person.gender,
  age: person.dob?.age ?? null,
  city: person.location?.city ?? null,
  phone: person.phone ?? null,
  portrait: person.picture?.medium ?? person.picture?.large ?? null,
});

const usable = people
  .map(shape)
  .filter((p) => p.fullName && p.portrait && p.age != null);

const inRange = usable
  .filter((p) => p.age >= AGE_MIN && p.age <= AGE_MAX)
  .sort((a, b) => a.age - b.age);

// Le service recycle les visuels : sur 48 personnes, 17 partagent un portrait
// déjà attribué. Les doublons sont écartés, sinon deux professionnels
// différents afficheraient la même personne.
const seen = new Set();
const distinct = inRange.filter((person) => {
  if (seen.has(person.portrait)) return false;
  seen.add(person.portrait);
  return true;
});

const personas = distinct.slice(0, COUNT);

if (personas.length === 0)
  throw new Error(`Aucune personne entre ${AGE_MIN} et ${AGE_MAX} ans.`);

if (distinct.length < COUNT)
  console.warn(
    `Seuls ${distinct.length} portraits distincts disponibles pour ${COUNT} demandés.`,
  );

const unique = new Set(personas.map((p) => p.portrait)).size;

await writeFile(
  OUTPUT,
  `${JSON.stringify({ generatedFrom: url.origin, count: personas.length, personas }, null, 2)}\n`,
  'utf8',
);

const women = personas.filter((p) => p.gender === 'female').length;
console.log(
  `${personas.length} personnes de ${AGE_MIN} à ${AGE_MAX} ans ` +
    `(${women} femmes, ${personas.length - women} hommes), ` +
    `${unique} portraits distincts.`,
);