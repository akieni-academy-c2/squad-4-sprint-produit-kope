# Tests

Les tests sont rangés **comme le code qu'ils vérifient**. Un test vit à côté de
son sujet, porte le même nom que lui, et s'importe comme le fait le code de
production :

```
tests/
├── src/                      ← copie de src/
│   ├── shared/hooks/useFieldStatus.test.js   pour  src/shared/hooks/useFieldStatus.js
│   ├── features/search/hooks/useSearch.test.js  pour  features/search/hooks/useSearch.js
│   └── pages/HomePage.persona.test.jsx      pour  pages/HomePage.jsx
├── server/                   ← copie de server/
│   ├── middlewares/errorHandler.test.js     pour  server/middlewares/errorHandler.js
│   └── modules/reports/reports.service.test.js  pour  modules/reports/reports.service.js
└── support/                  outillage commun aux tests
```

## Trois alias, pas de `../`

| alias | résout vers |
|---|---|
| `@/` | `src/` |
| `@server/` | `server/` |
| `@test/` | `tests/` |

Un test n'écrit jamais de chemin relatif. C'est ce qui permet de le déplacer
dans l'arborescence sans casser ses imports — et donc de le poser **à côté de
ce qu'il teste** plutôt qu'au hasard dans un dossier à plat.

## Nommer un test qui traverse deux couches

Un sujet qui ne tient pas dans une seule couche porte un qualificatif qui dit
**quelle** on vérifie :

```
validators.test.js         le schéma vu du client
validators.parity.test.js  le même schéma, déduit du serveur
```

Quand un test mélange vraiment les deux côtés — un service qui traverse le
réseau, une migration lue par un composant — il reste où il est et son nom dit
pourquoi il est à part : `services.audit.test.js`, `HomePage.persona.test.jsx`.

## Ce qui reste à la racine

Trois fichiers, volontairement hors arborescence :

- `setup.js` — configuration Vitest commune ;
- `sql-live.test.js` — le seul qui demande une vraie base PostgreSQL
  (`npm run test:db`). Il interroge tous les repositories, il n'appartient donc
  à aucun ;
- `support/` — l'outillage.

## Lire un fichier source sans l'importer

Certains tests inspectent le **texte** d'une source : le contenu de
`index.css`, la liste des `<img>` de `src/`, les migrations SQL. L'alias `@` ne
vaut que pour le graphe d'imports — il faut un chemin sur le disque. Ces tests
utilisent `repoPath()` de `support/repoRoot.js` :

```js
import { repoPath } from '@test/support/repoRoot.js';

const css = readFileSync(repoPath('src/index.css'), 'utf8');
```

`repoRoot.js` remonte depuis son propre emplacement jusqu'à la racine du dépôt.
Un test peut ainsi changer de profondeur sans que sa référence casse — ce que
`new URL('../src/…', import.meta.url)` ne permettait pas.

## Exécuter

```bash
npx vitest run --exclude "tests/sql-live.test.js"   # tout sauf la base réelle
npm run test:db                                      # uniquement la base réelle
```
