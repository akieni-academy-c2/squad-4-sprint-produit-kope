/**
 * Mêmes règles que server/utils/phone.js : 9 chiffres commençant par 04, 05 ou 06.
 * Exporté pour que le formulaire affiche la même indication que le serveur.
 */
export const MOBILE_PATTERN = /^(04|05|06)\d{7}$/;
export const MOBILE_HINT = '9 chiffres commençant par 04, 05 ou 06 — ex. 06 12 34 56 7';

export function normalizePhone(raw) {
  if (raw == null) return null;
  let digits = String(raw).replace(/[\s().-]/g, '');

  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);

  if (digits.startsWith('242') && digits.length === 12) digits = digits.slice(3);

  if (!MOBILE_PATTERN.test(digits)) return null;
  return `+242${digits}`;
}

/** Indicatif mobile attendu : 04, 05 ou 06. */
export const MOBILE_PREFIX_RE = /^0[456]/;

/**
 * Ne garde que les chiffres nationaux (9 au maximum), sans indicatif.
 * Utilisé par le champ de saisie à préfixe fixe.
 */
export function toNationalDigits(raw) {
  return String(raw ?? '')
    .replace(/\D/g, '')
    .replace(/^242/, '')
    .slice(0, 9);
}

/** Affichage par blocs : 06 889 88 88. */
export function formatNational(digits) {
  const d = String(digits ?? '').slice(0, 9);
  if (!d) return '';
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)];
  return parts.filter(Boolean).join(' ');
}

/**
 * Une saisie contenant autre chose que des chiffres (ou un préfixe interdit)
 * ne deviendra jamais valide en ajoutant des caractères : c'est une erreur,
 * pas un « presque ».
 */
export function isHopelessPhone(raw) {
  const v = String(raw ?? '');
  // Aucun chiffre du tout, ou présence de lettres : rien à corriger en ajoutant.
  if (!/\d/.test(v)) return true;
  if (/[^\d\s().+-]/.test(v)) return true;

  const digits = v.replace(/\D/g, '');
  const national = digits.length === 12 && digits.startsWith('242') ? digits.slice(3) : digits;
  // Ni 04, ni 05, ni 06 : le préfixe ne se corrige pas en ajoutant des chiffres.
  return !/^0[456]/.test(national);
}