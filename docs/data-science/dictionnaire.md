# Dictionnaire des données - KOP

Document d'accompagnement de [schema.md](schema.md) et de
[schema-diagram.md](schema-diagram.md). Il explique ce que chaque table
représente et, surtout, **les règles que le code applique** - parce que beaucoup
de contraintes métier ne sont pas dans le schéma : elles sont dans une vue ou
Pour le contexte du produit et ce que les données permettent de mesurer, voir [CADRE.md](../CADRE.md).

KOP met en relation des particuliers et des artisans du bâtiment à Brazzaville.
Un artisan publie un profil (métier, zones, photos, description), un client le
trouve, le contacte, et peut laisser un avis.

---

## ⚠️ À lire avant toute analyse

**Les volumes actuels sont ceux d'un environnement de développement, pas de la
production.** Au moment de l'extraction : 4 profils, 10 comptes, **0 avis**, 0
signalement. Un modèle statistique construit dessus n'aurait aucun sens - ces
données servent à valider la chaîne, pas à entraîner un modèle. Pour des volumes
réels, il faut interroger la base de production, qui répond au même schéma.

Deux tables sont à ignorer : `pgmigrations`, `session`, `rate_limits` et
`playing_with_neon` (table d'exemple créée par l'hébergeur, sans rapport avec
l'application).

---

## Les trois rôles

`users.role` est un énumération : `client`, `professional`, `admin`.

Un compte **client** peut devenir artisan : `users.role` passe alors à
`professional` et une ligne apparaît dans `professionals`. La clé primaire de
`professionals` est `user_id`, elle-même clé étrangère vers `users` : **un compte
porte au plus un profil artisan**. Un administrateur promu ou rétrogradé cesse
d'apparaître dans l'annuaire public, automatiquement.

## Règle de publication (la plus importante)

Un profil n'est visible publiquement que s'il satisfait **toutes** ces conditions.
Cette logique vit dans la vue `published_professionals`, pas dans les tables.

| Condition                                | Colonne / test                                |
| :--------------------------------------- | :-------------------------------------------- |
| Le profil n'est pas masqué               | `professionals.is_hidden = false`             |
| Le compte est bien un artisan            | `users.role = 'professional'`                 |
| Le compte n'est ni bloqué ni suspendu    | `blocked_at IS NULL AND suspended_at IS NULL` |
| Un nom affiché est renseigné             | `display_name` non vide                       |
| Un métier est choisi                     | joint sur `trades`                            |
| Au moins une zone d'intervention         | ≥ 1 ligne dans `professional_zones`           |
| Un téléphone est renseigné               | `users.phone` non vide                        |
| Une description d'au moins 30 caractères | `char_length(description) >= 30`              |
| Au moins une photo de réalisation        | ≥ 1 ligne dans `photos`                       |

**Conséquence pour l'analyse :** compter les artisans avec `SELECT count(*) FROM
professionals` est faux. Il faut passer par la vue, qui exclut les profils
incomplets, masqués et sanctionnés. C'est exactement ce que fait la recherche
publique (`search.repository.js`).

L'écart se mesure sur les données actuelles : `professionals` compte 4 lignes,
`published_professionals` n'en expose que **3**. Le quatrième ne satisfait pas
l'une des conditions ci-dessus.

## Avis

| Règle                                  | Où                                                    |
| :------------------------------------- | :---------------------------------------------------- |
| Note entière de 1 à 5                  | `CHECK (rating BETWEEN 1 AND 5)`                      |
| Un seul avis par client et par artisan | `UNIQUE (client_id, professional_id)`                 |
| On ne s'avise pas soi-même             | `client_id <> professional_id`, contrôlé côté service |
| Un administrateur ne pose pas d'avis   | `reviews.service.js`                                  |
| Un avis masqué sort de la moyenne      | `reviews.is_hidden = true`                            |

**Il n'existe aucune colonne de note moyenne en base.** La moyenne est recalculée
à chaque lecture (`AVG(rating)`, arrondi à une décimale) sur les seuls avis non
masqués. Tout tableau de bord doit reproduire ce calcul plutôt que lire une
colonne qui n'existe pas.

## Signalements et sanctions

`account_reports` sert aux deux sens : un client signale un artisan
(`target_role = 'professional'`), un artisan ou un client signale un compte
(`target_role = 'client'`).

| Règle                                       | Détail                                                                  |
| :------------------------------------------ | :---------------------------------------------------------------------- |
| Un seul signalement par cible et par auteur | `UNIQUE (professional_id, reporter_id)`                                 |
| Pas d'auto-signalement                      | `CHECK (professional_id <> reporter_id)`                                |
| Motifs fermés                               | `fake_profile`, `harassment`, `spam`, `inappropriate`, `fraud`, `other` |
| Cycle de traitement                         | `pending` → `resolved` ou `dismissed`                                   |

**Sanctions automatiques :** à chaque signalement, le compte est recompte. Seuls
les signalements **émis par un client** sont comptabilisables. Au-delà de
**3 signalements** le compte est bloqué (`blocked_at`), au-delà de **5** il est
suspendu (`suspended_at`). Ces seuils sont configurables
(`AUTO_BLOCK_REPORTS_THRESHOLD`, `AUTO_SUSPEND_REPORTS_THRESHOLD`).

Un compte bloqué ou suspendu **reste dans les tables** : il n'est pas supprimé.
Toute mesure d'activité doit filtrer explicitement sur ces deux colonnes.

Deux détails de comportement qui ne se devinent pas, et qui faussent tout
comptage de sanctions :

- **La suspension implique le blocage.** Le service qui applique la sanction
  écrit `suspended_at` puis `blocked_at` : un compte suspendu a donc toujours
  les deux colonnes renseignées. Une requête « bloqués mais non suspendus »
  renvoie zéro par construction, et l'ensemble des comptes non suspendus est
  strictement contenu dans celui des comptes non bloqués.
- **Le décompte ignore le statut du signalement.** Le recomptage ne filtre pas
  sur `account_reports.status` : un signalement `dismissed`, donc rejeté par
  l'administration, compte exactement comme un signalement `pending`. Le seuil
  se dépasse donc aussi vite avec des signalements traités qu'avec des
  signalements en attente.

## Contacts

Journal des prises de contact entre deux comptes.

- `channel` : `message`, `call` ou `whatsapp`.
- Un message n'est obligatoire que pour le canal `message` (`CHECK` en base).
- `status` est un `contact_status` (`new`, `seen`, `done`), valant `new` par
  défaut. La transition vers `seen` est déclenchée par un geste de
  l'utilisateur — appeler, écrire sur WhatsApp, ou « tout marquer comme vu » —
  et **jamais par la lecture de la liste**. Une lecture qui consommait le statut
  le faisait avant le premier rendu : le badge n'aurait rien eu à afficher.
  Le marquage est idempotent (`WHERE status = 'new'`) et ne peut porter que sur
  une demande **reçue** (`recipient_id`) : on ne marque jamais un contact que
  l'on a soi-même écrit. `done` n'est pas implémenté.
- La migration `…_contacts_seen_backfill` met à `seen` tout l'historique
  existant, pour que le badge n'annonce pas d'un coup tout l'historique.
- Pas d'ordre chronologique garanti dans le stockage : le tri se fait à la lecture.

---

## Table par table

| Table                | Rôle                              | Points d'attention                                                                           |
| :------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------- |
| `users`              | Comptes, tous rôles confondus     | `phone` est l'identifiant de connexion, pas l'email. `blocked_at` / `suspended_at` à filtrer |
| `professionals`      | Profil artisan, 1 par compte      | `is_hidden` est un masquage volontaire, distinct d'une suspension                            |
| `professional_zones` | Zones d'intervention (n-à-n)      | Jointure obligatoire pour remonter au nom de la zone                                         |
| `photos`             | Réalisations, avec vignette       | `file_path` et `thumb_path` sont des chemins relatifs                                        |
| `reviews`            | Notes et avis                     | Un seul par client et par artisan ; moyenne à recalculer                                     |
| `contacts`           | Prises de contact                 | `message` nullable sauf canal `message`                                                      |
| `account_reports`    | Signalements                      | `professional_id` porte la cible, quel que soit son rôle                                     |
| `review_reports`     | Signalements d'avis               | Cible un avis, pas un compte                                                                 |
| `trades`             | Métiers (référentiel)             | 4 métier : Plombier, Électricien, Maçon, Menuisier                                           |
| `trade_categories`   | Catégories regroupant les métiers | Référentiel, non encore rattaché aux métiers en base                                         |
| `zones`              | Quartiers de Brazzaville          | 9 quartiers, chacun rattaché à une ville                                                     |
| `cities`             | Villes                            | 6 villes, une seule sert actuellement                                                        |

## Jointures utiles

```sql
-- Artisans publiés, avec métier, ville et zone principale
SELECT p.user_id, p.display_name, t.name AS trade, c.name AS ville, z.name AS zone
  FROM published_professionals p
  JOIN trades t ON t.id = p.trade_id
  JOIN professional_zones pz ON pz.professional_id = p.user_id
  JOIN zones z  ON z.id = pz.zone_id
  JOIN cities c ON c.id = z.city_id
 ORDER BY t.name;

-- Note moyenne par artisan, avis masqués exclus
SELECT p.user_id, p.display_name,
       ROUND(AVG(r.rating), 1) AS note_moyenne,
       COUNT(r.id)            AS nb_avis
  FROM published_professionals p
  LEFT JOIN reviews r ON r.professional_id = p.user_id AND NOT r.is_hidden
 GROUP BY p.user_id, p.display_name;

-- Comptes actifs, hors sanctions
SELECT id, role, created_at FROM users
 WHERE blocked_at IS NULL AND suspended_at IS NULL;
```

## Évolution du schéma

31 migrations appliquées au moment de l'extraction. Le schéma évolue par
migration SQL versionnée dans `server/db/migrations`, jamais par une modification
directe en base. Le document `schema.md` est régénéré depuis la base vivante.
