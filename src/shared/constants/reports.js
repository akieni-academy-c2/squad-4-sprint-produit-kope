export const REPORT_REASON_OPTIONS = [
  { value: "fake_profile", label: "Faux profil" },
  { value: "harassment", label: "Harcèlement ou propos injurieux" },
  { value: "spam", label: "Spam ou publicité" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "fraud", label: "Escroquerie ou arnaque" },
  { value: "other", label: "Autre motif" },
];

export const REVIEW_REPORT_REASON_OPTIONS = [
  { value: "abusive", label: "Avis insultant ou injurieux" },
  { value: "false", label: "Avis faux ou mensonger" },
  { value: "spam", label: "Spam ou publicité" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "private_info", label: "Données personnelles Divulgées" },
  { value: "other", label: "Autre motif" },
];

export const REPORT_STATUS_OPTIONS = [
  { value: "", label: "Tous les signalements" },
  { value: "pending", label: "En attente" },
  { value: "resolved", label: "Traités" },
  { value: "dismissed", label: "Rejetés" },
];

const REASON_LABELS = Object.fromEntries(
  REPORT_REASON_OPTIONS.map((o) => [o.value, o.label]),
);

const STATUS_LABELS = {
  pending: "En attente",
  resolved: "Traité",
  dismissed: "Rejeté",
};

export const reportReasonLabel = (value) => REASON_LABELS[value] ?? value;

export const reportStatusLabel = (value) => STATUS_LABELS[value] ?? value;
