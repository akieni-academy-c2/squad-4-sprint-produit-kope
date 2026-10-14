/** Motifs de signalement d'un profil (partagés entre la fiche publique et l'admin). */
export const REPORT_REASON_OPTIONS = [
  { value: 'fake_profile', label: 'Faux profil' },
  { value: 'harassment', label: 'Harcèlement ou propos injurieux' },
  { value: 'spam', label: 'Spam ou publicité' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'fraud', label: 'Escroquerie ou arnaque' },
  { value: 'other', label: 'Autre motif' },
];

/**
 * Listes distinctes de celles d'un profil : « avis différé » ne vise pas un contenu et
 * « avis trompeur » n'a pas d'équivalent pour une fiche. Réutiliser les mêmes options
 * obligerait à choisir « faux profil » pour un avis.
 */
export const REVIEW_REPORT_REASON_OPTIONS = [
  { value: 'abusive', label: 'Avis insultant ou injurieux' },
  { value: 'false', label: 'Avis faux ou mensonger' },
  { value: 'spam', label: 'Spam ou publicité' },
  { value: 'inappropriate', label: 'Contenu inapproprié' },
  { value: 'private_info', label: 'Données personnelles Divulgées' },
  { value: 'other', label: 'Autre motif' },
];

export const REPORT_STATUS_OPTIONS = [
  { value: '', label: 'Tous les signalements' },
  { value: 'pending', label: 'En attente' },
  { value: 'resolved', label: 'Traités' },
  { value: 'dismissed', label: 'Rejetés' },
];

const REASON_LABELS = Object.fromEntries(REPORT_REASON_OPTIONS.map((o) => [o.value, o.label]));
const REVIEW_REASON_LABELS = Object.fromEntries(
  REVIEW_REPORT_REASON_OPTIONS.map((o) => [o.value, o.label]),
);

const STATUS_LABELS = {
  pending: 'En attente',
  resolved: 'Traité',
  dismissed: 'Rejeté',
};

export const reportReasonLabel = (value) => REASON_LABELS[value] ?? value;

export const reviewReportReasonLabel = (value) => REVIEW_REASON_LABELS[value] ?? value;

export const reportStatusLabel = (value) => STATUS_LABELS[value] ?? value;
