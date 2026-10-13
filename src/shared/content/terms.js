/**
 * Conditions d'utilisation — version courante.
 *
 * ## Pourquoi le texte est une donnée et pas du JSX
 *
 * Trois raisons, toutes pratiques.
 *
 * **Le lien doit être affichable sans la page.** La case à cocher de
 * l'inscription renvoie vers une section précise ; avoir à charger la page
 * entière pour connaître la date de la version affichée serait absurde.
 *
 * **Un consentement sans version est un consentement nul.** Le serveur
 * enregistre la version acceptée, pas seulement `consent: true`. Dans deux ans,
 * « il avait accepté » ne veut rien dire si on ne sait pas ce qu'il avait lu.
 *
 * **Le contenu se relit sans toucher à l'interface.** Modifier une condition ne
 * doit pas ressembler à une modification de page.
 */

export const TERMS_VERSION = '2026-01-15';

/**
 * Sections, dans l'ordre d'affichage.
 *
 * Chaque entrée porte un `slug` stable : c'est la cible des liens profonds
 * depuis les formulaires et les e-mails. Le `slug` ne change pas quand on
 * reformule un paragraphe.
 */
export const TERMS_SECTIONS = [
  {
    slug: 'objet',
    title: 'Objet et champ d’application',
    paragraphs: [
      "KOP est une plateforme qui met en relation des clients et des professionnels du bâtiment et des services de proximité, au Congo. Le site permet de consulter des profils, de demander une prise de contact et d’échanger directement, sans intermédiaire.",
      'Les présentes conditions régissent l’utilisation du site. Toute création de compte ou toute simple navigation vaut acceptation pleine et entière de ces conditions et de la politique de confidentialité.',
    ],
  },
  {
    slug: 'comptes',
    title: 'Comptes et identification',
    paragraphs: [
      'L’accès aux espaces personnels suppose la création d’un compte. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis votre compte.',
      'Les informations transmises doivent être exactes et à jour. Une inscription sur de fausses informations peut entraîner la suspension du compte, sans préavis ni indemnité.',
      'Vous devez avoir l’âge légal requis pour conclure un contrat dans votre pays de résidence pour utiliser le service comme professionnel.',
    ],
  },
  {
    slug: 'services',
    title: 'Nature du service',
    paragraphs: [
      'KOP est un intermédiaire. KOP n’est ni partie au contrat conclu entre un client et un professionnel, ni garant de son exécution, ni fournisseur de la prestation mise en relation.',
      'Les échanges, devis, délais, prix et modalités convenus entre un client et un professionnel relèvent de leur seule responsabilité.',
      'KOP ne peut garantir l’existence, la qualité, la disponibilité ou l’honnêteté d’un professionnel inscrit. Les profils publiés le sont sous l’entière responsabilité de leurs auteurs.',
    ],
  },
  {
    slug: 'annonces',
    title: 'Publication des profils et annonces',
    paragraphs: [
      'Toute publication est interdite si elle est trompeuse, diffamatoire, contraire à l’ordre public, discriminatoire, ou porte atteinte aux droits d’un tiers.',
      'KOP se réserve le droit de retirer ou de masquer toute annonce, à tout moment et sans préavis, notamment en cas de signalement fondé, de manquement aux présentes conditions ou d’exigence d’une autorité.',
    ],
  },
  {
    slug: 'avis',
    title: 'Avis et signalements',
    paragraphs: [
      'Un avis ne peut être déposé que par une personne ayant réellement utilisé le service, et doit décrire une situation vécue. Tout avis diffamatoire, injurieux ou diffamant est interdit.',
      'Un avis peut être masqué à tout moment par son auteur, puis réaffiché. La suppression est définitive.',
      'Les signalements sont examinés par l’équipe de modération. Un avis signalé peut être masqué sans préavis. Une accumulation de signalements fondés peut conduire à la suspension du compte.',
    ],
  },
  {
    slug: 'donnees',
    title: 'Données personnelles',
    paragraphs: [
      'Les données collectées servent exclusivement au fonctionnement du service : création du compte, mise en relation, sécurité et amélioration de la plateforme.',
      'Elles ne sont ni vendues, ni louées, ni cédées à des tiers à des fins publicitaires. Les échanges entre clients et professionnels sont visibles des interlocuteurs concernés.',
      'Conformément à la réglementation applicable, vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition et de portabilité de vos données, exerçable à l’adresse de contact indiquée en fin de document.',
    ],
  },
  {
    slug: 'suspension',
    title: 'Suspension et fermeture',
    paragraphs: [
      'KOP peut suspendre un compte en cas de manquement grave aux présentes conditions, de fraude, de tentative de contournement du service, ou à la demande d’une autorité compétente.',
      'Vous pouvez fermer votre compte à tout moment. La fermeture est définitive et entraîne la suppression de votre profil des pages publiques.',
    ],
  },
  {
    slug: 'responsabilite',
    title: 'Responsabilité et limitation',
    paragraphs: [
      'KOP met en œuvre les moyens raisonnables pour assurer la disponibilité du service, sans pouvoir garantir une absence totale d’interruption.',
      'À l’exception des cas de faute lourde ou intentionnelle, la responsabilité de KOP est limitée au montant effectivement payé par l’utilisateur au titre du service.',
      'KOP ne saurait être tenue responsable des dommages découlant d’une relation contractuelle nouée directement entre un client et un professionnel.',
    ],
  },
  {
    slug: 'modification',
    title: 'Modification des conditions',
    paragraphs: [
      "KOP peut modifier les présentes conditions. En cas de changement substantiel, l’utilisateur est informé lors de sa prochaine connexion et doit accepter la nouvelle version pour continuer à utiliser le service.",
      "La version applicable est celle enregistrée lors de l’acceptation.",
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    paragraphs: [
      'Pour toute question relative aux présentes conditions, à vos données personnelles ou au fonctionnement du service, écrivez à l’adresse de contact publiée sur le site.',
    ],
  },
];

/** Adresse d'une section, pour un lien profond depuis un formulaire. */
export const termsHref = (slug) => `/conditions-utilisation${slug ? `#${slug}` : ''}`;

/** Sections indexées par `slug`, pour retrouver un point d'ancrage. */
export const TERMS_BY_SLUG = new Map(TERMS_SECTIONS.map((s) => [s.slug, s]));
