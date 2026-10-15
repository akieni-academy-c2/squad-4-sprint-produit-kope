# KOPE : Squad 4 · Sprint Produit

Dépôt de travail de la Squad 4 dans le cadre du Sprint Produit Akieni Academy (Évaluation 2).

**KOP** est une plateforme de mise en relation entre particuliers et artisans du bâtiment (plombier, électricien, maçon, menuisier) à Brazzaville. L'application est fullstack : une architecture monolithique moderne qui intègre Express 5 et React 19 dans un même runtime grâce à `vite-express`.

🔗 **Démo en ligne :** [LIEN VERCEL]

> La version stable du projet se trouve sur la branche `main`. La branche `develop` est la branche de travail.

## Le problème

À Brazzaville, trouver un artisan fiable passe presque toujours par le bouche-à-oreille, sans garantie sur la compétence, la ponctualité ni la disponibilité. Les artisans compétents, eux, n'ont pas de vitrine pour se faire connaître et perdent des clients.

## La solution (MVP)

- **Côté artisan** : inscription, profil vitrine (métier, zones, description, photos de réalisations) et statut de publication du profil.
- **Côté client** : recherche par métier et par zone, consultation de la fiche d'un professionnel (avec ses coordonnées directement visibles), notes et avis.
- **Côté administration** : modération des profils et des avis.

> **Scope MVP** : US-01 → US-16.
> Sont **hors scope** : US-09, US-10, US-11, US-17 (le workflow de demande de contact a été supprimé : les coordonnées du professionnel sont visibles directement sur sa fiche) et US-18 (Could, hors sprint).

Les fonctionnalités hors MVP (paiement, fil social, messagerie avancée) sont dans le backlog futur.

## Objectifs du Sprint

- Identifier un problème réel ;
- Comprendre les utilisateurs concernés ;
- Définir une solution adaptée ;
- Cadrer un MVP réalisable ;
- Rédiger les spécifications fonctionnelles ;
- Développer un produit fonctionnel ;
- Tester et valider le MVP ;
- Préparer la présentation finale et la stratégie marketing.

## Équipe

### Product et analyse

| Rôle             | Membre                              | Responsabilités                                                             |
| ---------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| Product Manager  | Divin Penzamoy                      | Vision produit, priorisation, périmètre du MVP, validation du produit livré |
| Business Analyst | Raymond Jacquinot Fulbert Mavoungou | SPEC et FRD, User Stories, critères d'acceptation                           |
| Business Analyst | Biency Pea Engambe                  | Backlog, tests fonctionnels et recette                                      |

### Développement

| Rôle                   | Membre                       | User Stories / périmètre |
| ---------------------- | ---------------------------- | ------------------------ |
| Développeur Full Stack | Joseph Miere Onka            |
| Développeur Full Stack | Prosper Kwon Gee             |
| Développeur Full Stack | Jizreel Salem Mouyedi Mbemba |
| Développeur Full Stack | Force Espoir Loemba Packa    |
| Développeur Full Stack | Jude Airich Koy              |
| Développeur Full Stack | Ndende Christ                |

Le détail des User Stories et de leurs critères d'acceptation se trouve dans `docs/ba/`.

## Tech Stack

- **Backend :** Node.js, Express v5, SQL natif (PostgreSQL), Zod
- **Frontend :** React v19, Vite v8, Tailwind CSS v4, React Compiler (`babel-plugin-react-compiler`)
- **Intégration :** `vite-express` (sert le HMR Vite en développement et les assets statiques en production)
- **Qualité et outillage :** Vitest, ESLint v10, Prettier, Husky, Lint-Staged

## Structure du dépôt

Un seul dépôt : l'API (`server/`) et l'interface (`src/`) partagent le même `package.json` à la racine.

```text
.
├── public/                      Assets statiques globaux
├── server/                      Backend (Express 5, base de données, modules, API)
│   ├── config/                  Configuration d'environnement et de session
│   ├── db/
│   │   ├── migrations/          Migrations SQL
│   │   ├── seeds/               Données initiales (compte admin)
│   │   └── pool.js              Pool PostgreSQL
│   ├── middlewares/             Authentification, rôles, validation Zod, gestion des erreurs, upload
│   ├── modules/                 Modules métier isolés (un dossier par fonctionnalité)
│   │   ├── admin/               Modération
│   │   ├── auth/                Inscription, connexion
│   │   ├── photos/              Photos de réalisations
│   │   ├── professionals/       Profils des artisans
│   │   ├── reference/           Métiers et zones
│   │   ├── reviews/             Avis et notes
│   │   └── search/              Recherche par métier et zone
│   ├── utils/                   Helpers et classes d'erreurs (pagination, téléphone, uploads...)
│   ├── app.js                   Configuration Express
│   ├── index.js                 Point d'entrée HTTP (ViteExpress)
│   ├── routes.js                Assemblage des routes d'API
│   └── README.md                Documentation de l'API
├── src/                         Frontend (React 19)
│   ├── assets/
│   ├── components/              Éléments réutilisables (form, layout, ui)
│   ├── features/                Un dossier par fonctionnalité (admin, auth, photos,
│   │                            professionals, reference, reviews, search)
│   ├── lib/                     Client API, constantes, utilitaires
│   ├── mocks/                   Données de démonstration
│   ├── pages/                   Pages générales (accueil, erreurs, tableau de bord)
│   ├── routes/                  Routage et routes protégées
│   ├── shared/                  Contextes et hooks partagés
│   ├── main.jsx
│   └── README.md                Documentation de l'interface
├── tests/                       Suites de tests automatisés (Vitest)
├── docs/
│   ├── pm/                      Vision, persona, proposition de valeur
│   ├── ba/                      SPEC, FRD, User Stories, plan de recette
│   ├── marketing/               Positionnement, plan de lancement
│   └── scrum/                   Sprint Backlog, Daily, Review, Rétrospective
├── .env.example                 Template des variables d'environnement
├── eslint.config.js             Configuration du linter
├── vite.config.js               Configuration Vite et plugins
├── package.json                 Dépendances et scripts globaux
├── CONTRIBUTING.md
└── README.md
```

Chaque module du serveur suit le même découpage : `routes` → `controller` → `service` → `repository`, avec un fichier `schemas` pour la validation des données.

## Prérequis

- **Node.js :** `^20.19.0` ou `>=22.12.0` (versions compatibles avec Vite 8)
- **Gestionnaire de paquets :** `npm` ou `bun`. Les deux sont verrouillés
  (`package-lock.json` et `bun.lock`), choisissez-en un et gardez-le : mélanger
  les deux fait diverger les versions installées. `pnpm` fonctionne aussi, mais
  le dépôt ne contient pas de `pnpm-lock.yaml`, donc rien n'y épingle les
  versions résolues.
- **Base de données :** PostgreSQL (local, Docker ou service cloud)

## Démarrage rapide

### 1. Installation

```bash
git clone https://github.com/Deekskn/squad-4-sprint-produit-kope.git
cd squad-4-sprint-produit-kope
git checkout develop

npm install
```

### 2. Variables d'environnement

Copier le template d'environnement à la racine :

```bash
cp .env.example .env
```

Ajuster les identifiants PostgreSQL et les secrets dans le fichier `.env`. **Ne jamais pousser ce fichier** : il contient des secrets et le dépôt est public.

### 3. Base de données et migrations

```bash
# Appliquer les migrations
npm run migrate:up

# Créer les données initiales (compte administrateur)
npm run seed:admin
```

### 4. Lancement en développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`, avec le serveur de développement Vite et le HMR React directement connectés au backend Express.

## Scripts npm

Les commandes sont listées avec `npm`. Avec `bun`, remplacez le préfixe :
`npm run dev` devient `bun run dev`, `npm test` devient `bun test`. Avec `pnpm`,
la forme est la même qu'avec `npm`.

| Commande             | Description                                                            |
| :------------------- | :--------------------------------------------------------------------- |
| `npm run dev`        | Démarre le serveur backend et Vite HMR via Nodemon (`server/index.js`) |
| `npm run build`      | Compile l'application React avec Vite pour la production               |
| `npm run start`      | Exécute l'application compilée en environnement de production          |
| `npm run test`       | Exécute la suite de tests unitaires et d'intégration via Vitest        |
| `npx vitest run`     | Variante CI : une seule passe, sans watch                              |
| `npm run lint`       | Lance la vérification ESLint sur tout le projet                        |
| `npm run format`     | Applique le formatage Prettier                                         |
| `npm run prepare`    | Initialise les hooks Husky pour la qualité de code                     |
| `npm run migrate:up` | Applique les migrations de base de données                             |
| `npm run seed:admin` | Crée le compte administrateur initial                                  |

## Déploiement sur Vercel

Le front est compilé par `npm run build` et servi par la fonction `api/index.js`,
qui exporte l'application Express. Deux points restent hors du build :

**1. Les migrations ne se jouent pas toutes seules.** Vercel ne lance aucun
script de base de données. Après chaque nouveau déploiement, appliquer les
migrations sur la base pointed par `DATABASE_URL` :

```bash
DATABASE_URL="<url de production>" npm run migrate:up
```

Une base en retard ne casse pas le build : elle casse les pages publiques au
moment de la visite, en `500 « Erreur interne du serveur »`. Le point de santé
expose ce qui manque, sans avoir à ouvrir les journaux :

```bash
curl https://<domaine>/api/health
# {"status":"outdated-schema","missing":["cities","zones.city_id"]}
```

**2. `VITE_USE_MOCKS` est figé au build.** La poser dans les variables
d'environnement du projet Vercel n'a d'effet qu'**après un redéploiement**.

La démonstration est **toujours manuelle**, en développement comme en production :
aucune erreur réseau et aucun 5xx ne déclenchent de repli automatique sur les
mocks. Une panne, ou une migration non appliquée, reste visible au lieu de se
déguiser en données fictives - ce qui rendait l'application inutilisable à
déboguer, puisqu'un écran plein de données fictives masquait un serveur qui, lui,
refusait la session. Le visiteur entre en démo de lui-même, par le sélecteur de
rôle de la barre de navigation, ou par l'URL - le plus simple à partager aux
testeurs :

```
https://<domaine>/?demo=1     entre en démo
https://<domaine>/?demo=0     revient à la vraie API
```

Le choix est mémorisé dans le navigateur et survit au rechargement. C'est aussi
le seul moyen d'activer la démo sur un déploiement déjà en ligne, sans rebuild.

Variables attendues côté Vercel :

| Variable         | Rôle                                                                |
| :--------------- | :------------------------------------------------------------------ |
| `DATABASE_URL`   | Connexion PostgreSQL de production                                  |
| `SESSION_SECRET` | 32 caractères minimum, sinon le serveur refuse de démarrer          |
| `VITE_USE_MOCKS` | `true` pour proposer le mode démonstration à tous les visiteurs     |
| `CLOUDINARY_*`   | Obligatoire : le système de fichiers de Vercel est en lecture seule |
| `SITE_URL`       | Domaine public, pour les balises `canonical` et `og:url`            |

## Lire les journaux du serveur

Chaque requête `/api` produit une ligne dans le terminal qui lance le serveur,
colorée selon le statut - vert, cyan, jaune, rouge :

```
[POST] /api/auth/login 200 4004.2ms
[GET]  /api/admin/stats 401 11.0ms
```

Le verbe et le statut portent la couleur, le chemin et la durée restent neutres,
pour que le statut reste lisible d'un coup d'œil. Les 5xx vont sur la sortie
d'erreur, les 4xx sur celle d'avertissement, ce qui permet de les filtrer
séparément. La ligne `[error]` qui suit porte la cause réelle ; sans elle, le
statut seul ne dit pas pourquoi la requête a échoué.

La couleur n'apparaît que sur un terminal. Redirigée vers un fichier, elle est
désactivée d'elle-même, et `NO_COLOR=1` la coupe explicitement.

Deux choses ne sont volontairement pas journalisées : la chaîne de requête, qui
porterait des numéros et des recherches, et `/api/health`, interrogé en boucle
par une sonde de supervision.

**Piège en production locale, et comment il est levé.** Une version antérieure
déduisait `COOKIE_SECURE` de `NODE_ENV`, donc `true` sous `npm run start`. Or
`express-session` n'envoie pas un cookie `Secure` sur une connexion non chiffrée :
le serveur répond `200` à `POST /api/auth/login`, puis **toutes** les requêtes
suivantes répondent **401**, en quelques millisecondes, parce que le cookie
n'est jamais renvoyé.

Le réglage suit désormais le protocole réel de la requête (`secure: "auto"`) :
le cookie est marqué `Secure` sur une connexion TLS, et envoyé normalement sur
du HTTP simple. Un `npm run start` local fonctionne donc sans configuration, et un
déploiement HTTPS reste protégé. Forcer `COOKIE_SECURE` n'est plus nécessaire
que derrière un proxy qui ne transmet pas `X-Forwarded-Proto`.

## La page d'accueil ne lit rien en base

L'accueil est intégralement statique : métiers, quartiers et visages mis en avant
vivent dans `src/shared/content/`. La page s'affiche donc même API éteinte, base
en retard oumigration manquante, et ne fait apparaître ni squelette de chargement
ni bouton « Réessayer ». Seul le suivi de session (`/api/auth/me`) joint la barre
de navigation, car il conditionne l'affichage « Se connecter ».

C'est le même choix que `HIGHLIGHTED_TRADES`, qui fige déjà des identifiants de
métier. Le référentiel `zones` reste la source de vérité côté API ; la liste
statique doit être mise à jour en même temps que lui.

## Images

Les photos du dépôt font 4 000 à 7 000 px de large pour être affichées dans des
cadres de 400 à 700 px : la seule page d'accueil demandait 28 Mo en PNG. Le
plugin `kop-image-optimizer` (`vite.config.js`) réencode chaque image importée en
WebP, en deux largeurs, et exporte à côté de l'URL un `srcSet` que les
composants passent à `ImageWithSkeleton`. Un téléphone télécharge la variante
640 px, un grand écran la 1280 px.

Résultat : **28,5 Mo → 941 Ko** de fichiers image, dont ~270 Ko réellement
demandés sur l'accueil (le reste est en `loading="lazy"`).

Les portraits de démonstration sont eux aussi rapatriés dans
`public/portraits/` : ils étaient servis par un domaine tiers, que la CSP
(`img-src 'self' data: blob: https://res.cloudinary.com`) bloquait. Le mode démo
affichait donc des images cassées.

## US-15 : Note moyenne et avis

La fiche publique expose la moyenne des avis visibles, arrondie à une décimale, et leur nombre. `GET /api/professionals/:id/reviews?page=<n>&pageSize=<n>` renvoie également les avis paginés du plus récent au plus ancien, avec le prénom et l'initiale du nom du client. Les avis masqués sont exclus. La moyenne est calculée directement depuis `reviews` à chaque lecture : un avis ajouté est donc pris en compte sans cache ni mise à jour manuelle d'un agrégat. Les cartes de recherche reçoivent cette même moyenne et ce nombre.

La migration `1759500000004_reviews_public_index.sql` ajoute un index partiel pour accélérer le chargement chronologique des avis publics. Appliquer les migrations avec `npm run migrate:up`.

## Organisation du travail

- `main` : version stable, livrée au jury.
- `develop` : branche de travail, branche par défaut.
- Aucun push direct sur ces deux branches : tout passe par une Pull Request relue et approuvée.

Pour chaque ticket Jira :

1. Créer une branche depuis `develop` : `feature/CLE-12-nom-court`
2. Commiter avec la clé du ticket : `feat(CLE-12): description courte`
3. Ouvrir une Pull Request vers `develop`
4. Un coéquipier relit et approuve, puis la PR est mergée

Le détail est dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Qualité du code et commits

Le projet utilise **Husky** et **lint-staged**. À chaque commit, ESLint et Prettier vérifient automatiquement les fichiers modifiés, pour garantir un code propre et homogène dans tout le dépôt. Si un commit est refusé, corrigez les erreurs signalées (ou lancez `npm run lint` et `npm run format`) puis recommencez.

## Données de test

Ce dépôt est public. Les données de démonstration (artisans, numéros de téléphone, avis) sont fictives.
