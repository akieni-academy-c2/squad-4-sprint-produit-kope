import { FIELD_STATUS } from "@/shared/hooks/useFieldStatus.js";

const LABELS = {
  firstName: "le prénom",
  lastName: "le nom",
  phone: "le numéro",
  email: "l'adresse e-mail",
  password: "le mot de passe",
  confirm: "la confirmation",
  consent: "le consentement",
};

export function firstMissingField(statuses, order = []) {
  for (const field of order)
    if (statuses[field] && statuses[field] !== FIELD_STATUS.OK)
      return LABELS[field] ?? field;

  return null;
}

export function submitLabel(statuses, order, readyLabel) {
  const missing = firstMissingField(statuses, order);
  return missing ? `Complétez ${missing}` : readyLabel;
}
