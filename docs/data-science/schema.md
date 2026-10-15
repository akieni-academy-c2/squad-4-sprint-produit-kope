# Schéma de la base KOP

> Instantané de la base vivante. Le script `schema:doc` ayant été supprimé, ce
> fichier ne se régénère plus. Toute évolution du schéma passe par une
> migration, puis se reporte ici à la main.
>
> Pour les relations entre tables et le comportement des suppressions, voir
> [schema-diagram.md](schema-diagram.md). Pour le sens métier des règles et
> l'endroit où elles sont appliquées, voir [dictionnaire.md](dictionnaire.md).
> L'entrée du dossier est [docs/README.md](../README.md).

12 tables métier, 1 vue, 3 types énumérés, 4 tables techniques sans valeur d'analyse.

## Volume actuel

| Table métier         | Lignes |
| :------------------- | -----: |
| `account_reports`    |      0 |
| `cities`             |      6 |
| `contacts`           |      1 |
| `photos`             |      7 |
| `professional_zones` |     11 |
| `professionals`      |      4 |
| `review_reports`     |      0 |
| `reviews`            |      0 |
| `trade_categories`   |      5 |
| `trades`             |      4 |
| `users`              |     10 |
| `zones`              |      9 |

Tables techniques, à ignorer pour toute analyse : `pgmigrations`, `playing_with_neon`, `rate_limits`, `session`.

## Types énumérés

- **`contact_channel`** : message, call, whatsapp
- **`contact_status`** : new, seen, done
- **`user_role`** : client, professional, admin

## Tables métier

### `account_reports`

_0 ligne(s)_

| Colonne           | Type                       | Null | Défaut                 |
| :---------------- | :------------------------- | :--- | :--------------------- |
| **`id`**          | `bigint`                   | non  | -                      |
| `professional_id` | `bigint`                   | non  | -                      |
| `reporter_id`     | `bigint`                   | non  | -                      |
| `reason`          | `text`                     | non  | -                      |
| `message`         | `text`                     | oui  | -                      |
| `status`          | `text`                     | non  | `'pending'::text`      |
| `resolved_at`     | `timestamp with time zone` | oui  | -                      |
| `created_at`      | `timestamp with time zone` | non  | `now()`                |
| `target_role`     | `text`                     | non  | `'professional'::text` |

- Clé primaire : `id`
- Unicité : `professional_id`, `reporter_id`
- `reporter_id` → `users.id` (suppression : CASCADE)
- `professional_id` → `users.id` (suppression : CASCADE)
- Contrainte : `CHECK (((message IS NULL) OR ((char_length(message) >= 3) AND (char_length(message) <= 500))))`
- Contrainte : `CHECK ((professional_id <> reporter_id))`
- Contrainte : `CHECK ((reason = ANY (ARRAY['fake_profile'::text, 'harassment'::text, 'spam'::text, 'inappropriate'::text, 'fraud'::text, 'other'::text])))`
- Contrainte : `CHECK ((status = ANY (ARRAY['pending'::text, 'resolved'::text, 'dismissed'::text])))`
- Contrainte : `CHECK ((target_role = ANY (ARRAY['client'::text, 'professional'::text])))`

<details><summary>Index</summary>

- `account_reports_pkey` : `CREATE UNIQUE INDEX account_reports_pkey ON public.account_reports USING btree (id)`
- `account_reports_professional_idx` : `CREATE INDEX account_reports_professional_idx ON public.account_reports USING btree (professional_id, status)`
- `account_reports_reporter_idx` : `CREATE INDEX account_reports_reporter_idx ON public.account_reports USING btree (reporter_id)`
- `account_reports_reporter_unique` : `CREATE UNIQUE INDEX account_reports_reporter_unique ON public.account_reports USING btree (professional_id, reporter_id)`
- `account_reports_status_idx` : `CREATE INDEX account_reports_status_idx ON public.account_reports USING btree (status, created_at DESC)`

</details>

### `cities`

_6 ligne(s)_

| Colonne      | Type       | Null | Défaut |
| :----------- | :--------- | :--- | :----- |
| **`id`**     | `smallint` | non  | -      |
| `name`       | `text`     | non  | -      |
| `sort_order` | `integer`  | non  | `0`    |

- Clé primaire : `id`
- Unicité : `name`

<details><summary>Index</summary>

- `cities_name_key` : `CREATE UNIQUE INDEX cities_name_key ON public.cities USING btree (name)`
- `cities_pkey` : `CREATE UNIQUE INDEX cities_pkey ON public.cities USING btree (id)`

</details>

### `contacts`

_1 ligne(s)_

| Colonne        | Type                       | Null | Défaut                       |
| :------------- | :------------------------- | :--- | :--------------------------- |
| **`id`**       | `bigint`                   | non  | -                            |
| `sender_id`    | `bigint`                   | non  | -                            |
| `recipient_id` | `bigint`                   | non  | -                            |
| `message`      | `text`                     | oui  | -                            |
| `status`       | `contact_status`           | non  | `'new'::contact_status`      |
| `created_at`   | `timestamp with time zone` | non  | `now()`                      |
| `channel`      | `contact_channel`          | non  | `'message'::contact_channel` |

- Clé primaire : `id`
- `recipient_id` → `users.id` (suppression : CASCADE)
- `sender_id` → `users.id` (suppression : CASCADE)
- Contrainte : `CHECK ((sender_id <> recipient_id))`

<details><summary>Index</summary>

- `contacts_pair_recent_idx` : `CREATE INDEX contacts_pair_recent_idx ON public.contacts USING btree (sender_id, recipient_id, created_at DESC)`
- `contacts_pkey` : `CREATE UNIQUE INDEX contacts_pkey ON public.contacts USING btree (id)`
- `contacts_recipient_id_created_at_idx` : `CREATE INDEX contacts_recipient_id_created_at_idx ON public.contacts USING btree (recipient_id, created_at DESC)`
- `contacts_sender_id_created_at_idx` : `CREATE INDEX contacts_sender_id_created_at_idx ON public.contacts USING btree (sender_id, created_at DESC)`

</details>

### `photos`

_7 ligne(s)_

| Colonne           | Type                       | Null | Défaut  |
| :---------------- | :------------------------- | :--- | :------ |
| **`id`**          | `bigint`                   | non  | -       |
| `professional_id` | `bigint`                   | non  | -       |
| `file_path`       | `text`                     | non  | -       |
| `thumb_path`      | `text`                     | non  | -       |
| `caption`         | `character varying(100)`   | oui  | -       |
| `created_at`      | `timestamp with time zone` | non  | `now()` |
| `title`           | `character varying(100)`   | oui  | -       |
| `description`     | `character varying(500)`   | oui  | -       |

- Clé primaire : `id`
- `professional_id` → `professionals.user_id` (suppression : CASCADE)

<details><summary>Index</summary>

- `photos_pkey` : `CREATE UNIQUE INDEX photos_pkey ON public.photos USING btree (id)`
- `photos_professional_created_idx` : `CREATE INDEX photos_professional_created_idx ON public.photos USING btree (professional_id, created_at, id)`

</details>

### `professional_zones`

_11 ligne(s)_

| Colonne               | Type       | Null | Défaut |
| :-------------------- | :--------- | :--- | :----- |
| **`professional_id`** | `bigint`   | non  | -      |
| **`zone_id`**         | `smallint` | non  | -      |

- Clé primaire : `professional_id`, `zone_id`
- `professional_id` → `professionals.user_id` (suppression : CASCADE)
- `zone_id` → `zones.id` (suppression : aucune)

<details><summary>Index</summary>

- `professional_zones_pkey` : `CREATE UNIQUE INDEX professional_zones_pkey ON public.professional_zones USING btree (professional_id, zone_id)`
- `professional_zones_zone_id_idx` : `CREATE INDEX professional_zones_zone_id_idx ON public.professional_zones USING btree (zone_id)`

</details>

### `professionals`

_4 ligne(s)_

| Colonne            | Type                       | Null | Défaut  |
| :----------------- | :------------------------- | :--- | :------ |
| **`user_id`**      | `bigint`                   | non  | -       |
| `display_name`     | `text`                     | non  | -       |
| `trade_id`         | `smallint`                 | non  | -       |
| `description`      | `text`                     | oui  | -       |
| `years_experience` | `smallint`                 | oui  | -       |
| `whatsapp`         | `text`                     | oui  | -       |
| `is_available`     | `boolean`                  | non  | `true`  |
| `is_hidden`        | `boolean`                  | non  | `false` |
| `updated_at`       | `timestamp with time zone` | non  | `now()` |
| `city_id`          | `smallint`                 | oui  | -       |

- Clé primaire : `user_id`
- `city_id` → `cities.id` (suppression : SET NULL)
- `trade_id` → `trades.id` (suppression : aucune)
- `user_id` → `users.id` (suppression : CASCADE)
- Contrainte : `CHECK (((description IS NULL) OR ((char_length(description) >= 30) AND (char_length(description) <= 500))))`
- Contrainte : `CHECK (((years_experience IS NULL) OR ((years_experience >= 0) AND (years_experience <= 60))))`

<details><summary>Index</summary>

- `professionals_city_id_idx` : `CREATE INDEX professionals_city_id_idx ON public.professionals USING btree (city_id)`
- `professionals_display_name_trgm_idx` : `CREATE INDEX professionals_display_name_trgm_idx ON public.professionals USING gin (display_name gin_trgm_ops)`
- `professionals_display_name_unique` : `CREATE UNIQUE INDEX professionals_display_name_unique ON public.professionals USING btree (lower(btrim(display_name)))`
- `professionals_pkey` : `CREATE UNIQUE INDEX professionals_pkey ON public.professionals USING btree (user_id)`
- `professionals_trade_id_idx` : `CREATE INDEX professionals_trade_id_idx ON public.professionals USING btree (trade_id)`

</details>

### `review_reports`

_0 ligne(s)_

| Colonne       | Type                       | Null | Défaut            |
| :------------ | :------------------------- | :--- | :---------------- |
| **`id`**      | `bigint`                   | non  | -                 |
| `review_id`   | `bigint`                   | non  | -                 |
| `reporter_id` | `bigint`                   | non  | -                 |
| `reason`      | `text`                     | non  | -                 |
| `message`     | `text`                     | oui  | -                 |
| `status`      | `text`                     | non  | `'pending'::text` |
| `resolved_at` | `timestamp with time zone` | oui  | -                 |
| `created_at`  | `timestamp with time zone` | non  | `now()`           |

- Clé primaire : `id`
- Unicité : `review_id`, `reporter_id`
- `reporter_id` → `users.id` (suppression : CASCADE)
- `review_id` → `reviews.id` (suppression : CASCADE)
- Contrainte : `CHECK (((message IS NULL) OR ((char_length(message) >= 3) AND (char_length(message) <= 500))))`
- Contrainte : `CHECK ((reason = ANY (ARRAY['abusive'::text, 'false'::text, 'spam'::text, 'inappropriate'::text, 'private_info'::text, 'other'::text])))`
- Contrainte : `CHECK ((status = ANY (ARRAY['pending'::text, 'resolved'::text, 'dismissed'::text])))`

<details><summary>Index</summary>

- `review_reports_pkey` : `CREATE UNIQUE INDEX review_reports_pkey ON public.review_reports USING btree (id)`
- `review_reports_reporter_unique` : `CREATE UNIQUE INDEX review_reports_reporter_unique ON public.review_reports USING btree (review_id, reporter_id)`
- `review_reports_review_idx` : `CREATE INDEX review_reports_review_idx ON public.review_reports USING btree (review_id)`
- `review_reports_status_idx` : `CREATE INDEX review_reports_status_idx ON public.review_reports USING btree (status, created_at DESC)`

</details>

### `reviews`

_0 ligne(s)_

| Colonne           | Type                       | Null | Défaut  |
| :---------------- | :------------------------- | :--- | :------ |
| **`id`**          | `bigint`                   | non  | -       |
| `client_id`       | `bigint`                   | non  | -       |
| `professional_id` | `bigint`                   | non  | -       |
| `rating`          | `smallint`                 | non  | -       |
| `comment`         | `character varying(300)`   | oui  | -       |
| `is_hidden`       | `boolean`                  | non  | `false` |
| `created_at`      | `timestamp with time zone` | non  | `now()` |
| `updated_at`      | `timestamp with time zone` | non  | `now()` |

- Clé primaire : `id`
- Unicité : `client_id`, `professional_id`
- `client_id` → `users.id` (suppression : aucune)
- `professional_id` → `professionals.user_id` (suppression : aucune)
- Contrainte : `CHECK (((rating >= 1) AND (rating <= 5)))`

<details><summary>Index</summary>

- `reviews_client_created_idx` : `CREATE INDEX reviews_client_created_idx ON public.reviews USING btree (client_id, created_at DESC, id DESC)`
- `reviews_client_id_professional_id_key` : `CREATE UNIQUE INDEX reviews_client_id_professional_id_key ON public.reviews USING btree (client_id, professional_id)`
- `reviews_comment_trgm_idx` : `CREATE INDEX reviews_comment_trgm_idx ON public.reviews USING gin (comment gin_trgm_ops)`
- `reviews_pkey` : `CREATE UNIQUE INDEX reviews_pkey ON public.reviews USING btree (id)`
- `reviews_professional_created_idx` : `CREATE INDEX reviews_professional_created_idx ON public.reviews USING btree (professional_id, created_at DESC, id DESC)`
- `reviews_professional_id_idx` : `CREATE INDEX reviews_professional_id_idx ON public.reviews USING btree (professional_id)`
- `reviews_visible_professional_created_idx` : `CREATE INDEX reviews_visible_professional_created_idx ON public.reviews USING btree (professional_id, created_at DESC, id DESC) WHERE (NOT is_hidden)`

</details>

### `trade_categories`

_5 ligne(s)_

| Colonne      | Type       | Null | Défaut |
| :----------- | :--------- | :--- | :----- |
| **`id`**     | `smallint` | non  | -      |
| `name`       | `text`     | non  | -      |
| `sort_order` | `integer`  | non  | `0`    |

- Clé primaire : `id`
- Unicité : `name`

<details><summary>Index</summary>

- `trade_categories_name_key` : `CREATE UNIQUE INDEX trade_categories_name_key ON public.trade_categories USING btree (name)`
- `trade_categories_pkey` : `CREATE UNIQUE INDEX trade_categories_pkey ON public.trade_categories USING btree (id)`

</details>

### `trades`

_4 ligne(s)_

| Colonne       | Type                       | Null | Défaut  |
| :------------ | :------------------------- | :--- | :------ |
| **`id`**      | `smallint`                 | non  | -       |
| `name`        | `text`                     | non  | -       |
| `sort_order`  | `integer`                  | non  | `0`     |
| `category_id` | `smallint`                 | oui  | -       |
| `created_at`  | `timestamp with time zone` | non  | `now()` |

- Clé primaire : `id`
- Unicité : `name`
- `category_id` → `trade_categories.id` (suppression : SET NULL)

<details><summary>Index</summary>

- `trades_category_id_idx` : `CREATE INDEX trades_category_id_idx ON public.trades USING btree (category_id)`
- `trades_name_key` : `CREATE UNIQUE INDEX trades_name_key ON public.trades USING btree (name)`
- `trades_pkey` : `CREATE UNIQUE INDEX trades_pkey ON public.trades USING btree (id)`
- `trades_sort_order_idx` : `CREATE INDEX trades_sort_order_idx ON public.trades USING btree (sort_order)`

</details>

### `users`

_10 ligne(s)_

| Colonne         | Type                       | Null | Défaut  |
| :-------------- | :------------------------- | :--- | :------ |
| **`id`**        | `bigint`                   | non  | -       |
| `role`          | `user_role`                | non  | -       |
| `phone`         | `text`                     | non  | -       |
| `password_hash` | `text`                     | non  | -       |
| `first_name`    | `text`                     | oui  | -       |
| `last_name`     | `text`                     | oui  | -       |
| `consented_at`  | `timestamp with time zone` | oui  | -       |
| `created_at`    | `timestamp with time zone` | non  | `now()` |
| `avatar_url`    | `text`                     | oui  | -       |
| `blocked_at`    | `timestamp with time zone` | oui  | -       |
| `suspended_at`  | `timestamp with time zone` | oui  | -       |
| `email`         | `text`                     | oui  | -       |
| `terms_version` | `text`                     | oui  | -       |

- Clé primaire : `id`
- Unicité : `phone`
- Contrainte : `CHECK (((email IS NULL) OR ((email = btrim(email)) AND ((char_length(email) >= 3) AND (char_length(email) <= 254)))))`
- Contrainte : `CHECK (((email IS NULL) OR (email = lower(btrim(email)))))`
- Contrainte : `CHECK (((terms_version IS NULL) OR (terms_version ~ '^\d{4}-\d{2}-\d{2}$'::text)))`

<details><summary>Index</summary>

- `users_active_idx` : `CREATE INDEX users_active_idx ON public.users USING btree (role) WHERE ((blocked_at IS NULL) AND (suspended_at IS NULL))`
- `users_admin_active_idx` : `CREATE INDEX users_admin_active_idx ON public.users USING btree (id) WHERE ((role = 'admin'::user_role) AND (blocked_at IS NULL) AND (suspended_at IS NULL))`
- `users_blocked_at_idx` : `CREATE INDEX users_blocked_at_idx ON public.users USING btree (blocked_at) WHERE (blocked_at IS NOT NULL)`
- `users_email_lower_unique` : `CREATE UNIQUE INDEX users_email_lower_unique ON public.users USING btree (lower(btrim(email))) WHERE (email IS NOT NULL)`
- `users_first_name_trgm_idx` : `CREATE INDEX users_first_name_trgm_idx ON public.users USING gin (first_name gin_trgm_ops)`
- `users_last_name_trgm_idx` : `CREATE INDEX users_last_name_trgm_idx ON public.users USING gin (last_name gin_trgm_ops)`
- `users_phone_key` : `CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone)`
- `users_pkey` : `CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)`

</details>

### `zones`

_9 ligne(s)_

| Colonne      | Type                       | Null | Défaut  |
| :----------- | :------------------------- | :--- | :------ |
| **`id`**     | `smallint`                 | non  | -       |
| `name`       | `text`                     | non  | -       |
| `sort_order` | `integer`                  | non  | `0`     |
| `city_id`    | `smallint`                 | oui  | -       |
| `created_at` | `timestamp with time zone` | non  | `now()` |

- Clé primaire : `id`
- Unicité : `name`
- `city_id` → `cities.id` (suppression : SET NULL)

<details><summary>Index</summary>

- `zones_city_id_idx` : `CREATE INDEX zones_city_id_idx ON public.zones USING btree (city_id)`
- `zones_name_key` : `CREATE UNIQUE INDEX zones_name_key ON public.zones USING btree (name)`
- `zones_pkey` : `CREATE UNIQUE INDEX zones_pkey ON public.zones USING btree (id)`
- `zones_sort_order_idx` : `CREATE INDEX zones_sort_order_idx ON public.zones USING btree (sort_order)`

</details>

## Vues

### `published_professionals`

```sql
 SELECT p.user_id,
    p.display_name,
    p.trade_id,
    p.description,
    p.years_experience,
    p.whatsapp,
    p.is_available,
    p.updated_at
   FROM ((professionals p
     JOIN users u ON ((u.id = p.user_id)))
     JOIN trades t ON ((t.id = p.trade_id)))
  WHERE ((NOT p.is_hidden) AND (u.role = 'professional'::user_role) AND (u.blocked_at IS NULL) AND (u.suspended_at IS NULL) AND (char_length(btrim(p.display_name)) > 0) AND (char_length(btrim(t.name)) > 0) AND (EXISTS ( SELECT 1
           FROM professional_zones z
          WHERE (z.professional_id = p.user_id))) AND (char_length(btrim(u.phone)) > 0) AND (char_length(btrim(p.description)) >= 30) AND (EXISTS ( SELECT 1
           FROM photos ph
          WHERE (ph.professional_id = p.user_id))));
```

## Cardinalités

```text
users 1──0..1 professionals        (un compte, au plus un profil artisan)
users 1──*    reviews               (un avis par client et par artisan)
trades 1──*  professionals
zones  1──*  professional_zones    (n-association : plusieurs zones par artisan)
zones  1──*  cities                 (une zone appartient à une ville)
professionals 1──* photos
users 1──*    account_reports       (signalements, client ou artisan visé)
users 1──*    review_reports        (signalements d'avis)
```
