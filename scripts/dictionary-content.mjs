/**
 * Ce que chaque table représente, en une phrase. Contenu éditorial : c'est la
 * partie qui ne peut pas se déduire du schéma, donc elle est écrite ici plutôt
 * que réinventée à chaque génération.
 */
export const PURPOSE = {
  users: {
    title: 'Comptes',
    role: 'Toutes les identités de la plateforme, tous rôles confondus',
    detail:
      "L'authentification se fait par téléphone : `phone` est l'identifiant de connexion, pas une donnée de contact secondaire. `email` est facultatif et stocké normalisé en minuscules, avec une unicité insensible à la casse. `blocked_at` et `suspended_at` portent les sanctions : non nuls, ils retirent le compte de l'annuaire public sans jamais supprimer la ligne.",
  },
  professionals: {
    title: 'Profils artisans',
    role: 'La vitrine publique d’un compte passé artisan',
    detail:
      "Une ligne au plus par compte, la clé primaire étant `user_id`. `is_available` décrit la disponibilité courante, ce n’est pas la publication : celle-ci est calculée par la vue `published_professionals`. `is_hidden` est un masquage volontaire du professionnel, distinct d’une suspension décidée par la modération.",
  },
  trades: {
    title: 'Métiers',
    role: 'Référentiel des métiers proposés',
    detail:
      'Quatre métiers au départ. Les identifiants sont figés et repris en dur dans la page d’accueil, qui les propose en accès direct.',
  },
  trade_categories: {
    title: 'Catégories de métiers',
    role: 'Regroupement des métiers pour la navigation',
    detail:
      "Référentiel prévu pour la navigation, non encore rattaché aux métiers en base.",
  },
  cities: {
    title: 'Villes',
    role: 'Référentiel géographique',
    detail: 'Six villes congolaises. Une seule sert actuellement, Brazzaville.',
  },
  zones: {
    title: 'Quartiers',
    role: 'Zones d’intervention, rattachées à une ville',
    detail:
      "Neuf quartiers de Brazzaville. `city_id` est facultatif : une zone sans ville reste valide, elle est alors exclue des listes publiques.",
  },
  professional_zones: {
    title: 'Zones d’intervention',
    role: 'Association entre un artisan et un quartier',
    detail:
      "Table de jonction sans attribut propre. La clé primaire composite empêche deux fois la même zone pour un même artisan. Au moins une ligne est exigée pour qu’un profil soit publié.",
  },
  photos: {
    title: 'Réalisations',
    role: 'Photos publiées par un artisan',
    detail:
      "Au moins une photo est exigée pour la publication. `file_path` et `thumb_path` sont des chemins relatifs : l’URL publique est reconstruite par l’application, vers Cloudinary en production.",
  },
  reviews: {
    title: 'Avis',
    role: 'Note et commentaire laissés par un client',
    detail:
      "Un seul avis par client et par artisan, garantie par une contrainte d’unicité. La note va de 1 à 5. Aucun agrégat n’est stocké : la moyenne est recalculée à chaque lecture sur les seuls avis non masqués. Un avis se modifie et se supprime en place, sans conserve d’historique.",
  },
  contacts: {
    title: 'Prises de contact',
    role: 'Journal des échanges entre deux comptes',
    detail:
      "Le `channel` indique la forme de l’échange : `message`, `call` ou `whatsapp`. Un message n’est obligatoire que pour le canal `message`. `status` suit le cycle `new` puis `seen` puis `done` ; ouvrir sa liste de contacts fait passer les entrants en `seen`.",
  },
  account_reports: {
    title: 'Signalements de compte',
    role: 'Signalements visant un client ou un artisan',
    detail:
      "La colonne `professional_id` porte la cible du signalement : sa clé étrangère pointe vers `users`, et `target_role` distingue un client d’un artisan. Le nom de colonne est donc trompeur, la contrainte s’appelle d’ailleurs `account_reports_target_fkey`. Un compte ne peut être signalé qu’une fois par le même auteur.",
  },
  review_reports: {
    title: 'Signalements d’avis',
    role: 'Signalements visant un avis, pas un compte',
    detail:
      "Mêmes règles qu’un signalement de compte, mais la cible est l’avis. Un avis signalé reste en base : la modération agit sur son contenu ou le masque.",
  },
};

export const GRAIN = {
  users: 'un compte',
  professionals: 'un compte disposant d’un profil artisan',
  trades: 'un métier du référentiel',
  trade_categories: 'une catégorie de métiers',
  cities: 'une ville',
  zones: 'un quartier',
  professional_zones: 'un couple (artisan, quartier)',
  photos: 'une photo de réalisation',
  reviews: 'un avis - au plus un par (client, artisan)',
  contacts: 'une prise de contact, dans un sens donné',
  account_reports: 'un signalement - au plus un par (cible, auteur)',
  review_reports: 'un signalement d’avis - au plus un par (avis, auteur)',
};

/**
 * Comportement de suppression vérifié sur la base, chaque essai étant annulé.
 * Toutes les clés étrangères sont non deferrable : `NO ACTION` se comporte
 * donc comme `RESTRICT`, la suppression est refusée et non différée.
 */
export const DELETES = [
  ['users → professionals', 'CASCADE', 'Le profil, ses zones et ses photos partent.'],
  ['users → contacts', 'CASCADE', 'Les prises de contact partent.'],
  ['users → account_reports', 'CASCADE', 'Les signalements dont il est l’auteur partent.'],
  ['users → review_reports', 'CASCADE', 'Les signalements d’avis dont il est l’auteur partent.'],
  ['reviews → professionals', 'aucune', 'REFUSÉ - 23503. Un artisan ayant des avis ne peut pas être supprimé.'],
  ['professionals → photos', 'CASCADE', 'Part avec le profil.'],
  ['professionals → professional_zones', 'CASCADE', 'Part avec le profil.'],
  ['zones → professional_zones', 'aucune', 'REFUSÉ - 23503. Un quartier référencé ne peut pas être supprimé.'],
  ['trades → professionals', 'aucune', 'REFUSÉ - 23503. Un métier référencé ne peut pas être supprimé.'],
  ['cities → zones', 'SET NULL', 'La zone survit, devient orpheline.'],
  ['cities → professionals', 'SET NULL', 'Le profil survit sans ville.'],
];

export const INVARIANTS = [
  ['Note entre 1 et 5', 'Base', 'CHECK sur reviews.rating'],
  ['Description entre 30 et 500 caractères', 'Base', 'CHECK sur professionals.description'],
  ['Expérience entre 0 et 60 ans', 'Base', 'CHECK sur professionals.years_experience'],
  ['Motif de signalement dans une liste fermée', 'Base', 'CHECK sur les deux tables de signalement'],
  ['Statut de signalement dans une liste fermée', 'Base', 'CHECK (pending, resolved, dismissed)'],
  ['Un seul avis par (client, artisan)', 'Base', 'UNIQUE (client_id, professional_id)'],
  ['Un seul signalement par (cible, auteur)', 'Base', 'UNIQUE sur les deux tables'],
  ['Pas d’auto-signalement', 'Base', 'CHECK cible <> auteur'],
  ['Pas de contact avec soi-même', 'Base', 'CHECK sender_id <> recipient_id'],
  ['Nom affiché unique, insensible à la casse', 'Base', 'Index unique sur lower(btrim(...))'],
  ['Un artisan ne s’avise pas lui-même', 'Service', 'reviews.service.js'],
  ['Un administrateur ne pose pas d’avis', 'Service', 'reviews.service.js'],
  ['Un profil n’est public que s’il est complet', 'Vue', 'published_professionals'],
  ['Blocage à 3 signalements, suspension à 5', 'Service', 'Seuils configurables par variable d’environnement'],
];

export const LIMITS = [
  [
    'professionals n’a pas de created_at',
    "Seule la date de dernière modification existe. Impossible de dater l’arrivée d’un artisan ni de mesurer un délai de mise en ligne. Contournement : users.created_at donne la date de création du compte, identique ou antérieure.",
  ],
  [
    'L’historique des notes n’existe pas',
    'Un avis se modifie et se supprime en place. Seule sa valeur courante est conservée, sans table d’audit. Une série « note moyenne dans le temps » sera fausse, et silencieusement fausse.',
  ],
  [
    'account_reports.professional_id est un piège',
    "La colonne pointe vers users.id et sert de cible à un signalement de compte, client ou artisan. C’est target_role qui distingue les deux : une jointure sur professionals depuis cette colonne perd la moitié des lignes.",
  ],
];

export const QUERIES = [
  [
    'Artisans publiés, avec métier, ville et zone',
    `SELECT p.user_id, p.display_name, t.name AS trade,
       c.name AS ville, z.name AS zone
  FROM published_professionals p
  JOIN trades t ON t.id = p.trade_id
  JOIN professional_zones pz ON pz.professional_id = p.user_id
  JOIN zones z  ON z.id = pz.zone_id
  JOIN cities c ON c.id = z.city_id
 ORDER BY t.name;`,
  ],
  [
    'Note moyenne par artisan, avis masqués exclus',
    `SELECT p.user_id, p.display_name,
       ROUND(AVG(r.rating), 1) AS note_moyenne,
       COUNT(r.id)            AS nb_avis
  FROM published_professionals p
  LEFT JOIN reviews r
    ON r.professional_id = p.user_id AND NOT r.is_hidden
 GROUP BY p.user_id, p.display_name;`,
  ],
  [
    'Comptes actifs, hors sanctions',
    `SELECT id, role, created_at
  FROM users
 WHERE blocked_at IS NULL AND suspended_at IS NULL;`,
  ],
  [
    'Comptes.signalements : cible et motif',
    `SELECT r.created_at, r.reason, r.target_role,
       reporter.id AS auteur, cible.id AS cible
  FROM account_reports r
  JOIN users reporter ON reporter.id = r.reporter_id
  JOIN users cible    ON cible.id    = r.professional_id
 ORDER BY r.created_at DESC;`,
  ],
];
