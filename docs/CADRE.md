# Cadre du projet KOP

Ce document s'adresse à l'équipe Data Science. Il explique **ce que fait
l'application** et **ce que les données permettent de mesurer**. Le détail
technique est ailleurs : voir [README.md](README.md) pour l'ordre de lecture.

Les trois documents techniques ne suffisent pas : ils décrivent des tables, pas
ce que les utilisateurs en font. C'est le chaînon qui manque entre le produit et
la base.

## 1. Ce qu'est KOP

KOP met en relation des particuliers et des artisans du bâtiment à Brazzaville
(plombier, électricien, maçon, menuisier).

**Le problème.** Trouver un artisan fiable passe presque toujours par le
bouche-à-oreille, sans garantie sur la compétence, la ponctualité ni la
disponibilité. Réciproquement, un artisan compétent n'a aucune vitrine et perd
des clients qu'il ne peut pas voir.

**La réponse apportée par le MVP.** Une vitrine côté artisan, une recherche et un
système d'avis côté client, une modération côté administration. Le paiement, la
messagerie avancée et le fil social sont **hors périmètre**.

## 2. Objectifs produit

Formulés pour être vérifiables. La colonne « Mesurable par » indique la table
d'observation, et si la mesure est possible **aujourd'hui** avec les données
présentes.

| Objectif | Intention | Mesurable par | Possible aujourd'hui ? |
| :--- | :--- | :--- | :--- |
| Rendre visible l'artisan qui travaille | Un artisan complété doit apparaître dans l'annuaire | `published_professionals` rapportée à `professionals` | **oui** |
| Réduire le temps de mise en relation | Un client inscrit doit atteindre un artisan rapidement | `contacts.created_at` et `users.created_at` | **non**, trop peu de contacts |
| Fiabiliser la réputation par les avis | La note doit construire un signal de confiance exploitable | `reviews`, agrégé sur les artisans publiés | **non**, `reviews` est vide |

Cette distinction est le premier fait à retenir : **deux objectifs sur trois ne
sont pas mesurables en l'état**. Ce n'est pas un défaut des données, c'est le
stade du produit. Les tables existent et sont correctement renseignées par le code ;
elles n'ont simplement pas encore de volume.

## 3. Fonctionnalités principales

Le périmètre réel, à partir des 68 points d'entrée de l'API. Ce qui suit n'est
pas la roadmap : c'est ce que le code fait aujourd'hui.

### Côté client

| Fonctionnalité | Point d'entrée |
| :--- | :--- |
| Créer un compte client | `POST /auth/register/client` |
| Se connecter | `POST /auth/login` |
| Rechercher un artisan par métier et par zone | `GET /professionals` |
| Consulter une fiche et ses coordonnées | `GET /professionals/:id` |
| Contacter un artisan | `POST /contacts` |
| Noter et laisser un avis | `POST /professionals/:id/reviews` |
| Signaler un compte ou un avis | `POST /professionals/:id/reports` |

### Côté artisan

| Fonctionnalité | Point d'entrée |
| :--- | :--- |
| Créer un compte artisan, ou devenir artisan depuis un compte client | `POST /auth/register/professional`, `POST /auth/become-professional` |
| Renseigner métier, zones et description | `PUT /me/profile` |
| Publier des photos de réalisations | `POST /me/photos` |
| Basculer sa disponibilité | `PATCH /me/availability` |
| Consulter les avis reçus | `GET /professionals/:id/reviews` |

### Côté administration

Modération des profils et des avis, blocage et suspension des comptes, gestion
des référentiels (métiers, catégories, villes, quartiers), traitement des
signalements. Tout est sous `/admin`.

## 4. Passerelle : fonctionnalité, tables, mesure

C'est la table à utiliser en premier. Elle relie l'action de l'utilisateur à ce
qu'elle écrit en base, et à ce qu'on peut en déduire.

| Fonctionnalité | Écrit dans | Règle appliquée | Ce qu'on peut mesurer |
| :--- | :--- | :--- | :--- |
| Inscription client | `users` (`role = 'client'`) | aucune | inscriptions dans le temps |
| Inscription artisan | `users` + `professionals` | une ligne par compte au plus | nouveaux artisans, taux de complétion |
| Devenir artisan | `users.role` + `professionals` | conversion d'un compte existant | taux de conversion client → artisan |
| Compléter le profil | `professionals` + `professional_zones` | une zone = une ligne | **taux de publication** : voir ci-dessous |
| Publier une photo | `photos` | `NOT NULL` exigé par la vue | artworks par artisan |
| Basculer la disponibilité | `professionals.is_available` | aucune | proportion d'artisans « disponibles » |
| Rechercher | rien | lit `published_professionals` | **rien directement** : voir §5 |
| Contacter un artisan | `contacts` | canal et statut contraints | taux de contact par artisan, délai de mise en relation |
| Noter un avis | `reviews` | un avis max par (client, artisan) | note moyenne, écart, récence |
| Modifier / supprimer un avis | `reviews` | l'auteur peut revenir dessus | taux de retrait d'avis |
| Signaler un compte | `account_reports` | un signalement max par (cible, auteur) | Accounts signalés, taux de récurrence |
| Signaler un avis | `review_reports` | **table distincte** | avis signalés, taux de retrait |
| Modérer | `is_hidden`, `blocked_at`, `suspended_at` | contrôles d'accès des requêtes | charge de modération |

**La mesure centrale du projet : le taux de publication.** Un artisan n'existe
dans l'annuaire que s'il satisfy les neuf conditions de la vue
`published_professionals`. Sur les données actuelles, 4 profils existent et 3 sont
publiés. Suivre cet écart dans le temps mesure exactement ce qui bloque les
artisans, et c'est l'indicateur que la section « Règle de publication » du
[dictionnaire.md](data-science/dictionnaire.md) permet de décomposer.

## 5. Ce que les données ne disent pas

À lire avant de promettre une analyse. La section « Limites pour l'analyse » de
[schema-diagram.md](data-science/schema-diagram.md) détaille les contraintes
techniques ; voici les limites métier.

- **Les recherches ne sont pas enregistrées.** Aucune table ne trace une
  recherche, ni un clic, ni une visite de fiche. On ne peut donc pas mesurer ce
  que cherchent les utilisateurs, ni le taux de transformation d'une recherche
  en contact. On mesure le contact, et encore, seulement si l'utilisateur le fait.
- **`is_available` n'est pas une disponibilité.** C'est un bouton que l'artisan
  actionne à la main, sans agenda ni créneau. Un artisan « disponible » n'a pas
  forcément de rendez-vous. À ne pas croiser avec une promesse de réactivité.
- **Aucune coordonnée géographique.** Les zones sont des quartiers choisis dans
  un référentiel, pas des coordonnées. Aucune distance, aucun temps de
  déplacement ne peut être calculé.
- **Les volumes sont ceux d'un environnement de développement.** `reviews`,
  `account_reports` et `review_reports` sont vides. Toute analyse de réputation
  ou de modération est aujourd'hui théorique.
- **Les sanctions ne distinguent pas le motif traité.** Un signalement
  clôturé compte autant qu'un signalement en attente pour déclencher une
  sanction : voir [dictionnaire.md](data-science/dictionnaire.md).

## Renvoi

| Besoin | Document |
| :--- | :--- |
| Colonnes, types, index, volumes | [schema.md](data-science/schema.md) |
| Relations, suppressions, invariants, limites | [schema-diagram.md](data-science/schema-diagram.md) |
| Règles métier et lieu d'application | [dictionnaire.md](data-science/dictionnaire.md) |
| Glossaire et ordre de lecture | [README.md](README.md) |