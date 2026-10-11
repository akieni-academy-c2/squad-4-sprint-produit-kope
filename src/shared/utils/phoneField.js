/**
 * Utilitaires du champ téléphone à indicatif fixe.
 *
 * Isolé de PhoneInput.jsx : la règle de fast-refresh impose qu'un fichier
 * de composant n'exporte que des composants.
 */

/**
 * Retire le code pays si l'utilisateur le saisit quand même.
 * L'indicatif est déjà affiché à gauche : le garder produirait
 * « +242 +242 06… », un numéro jamais valide.
 */
export function stripCountryCode(raw) {
  let value = String(raw ?? '');
  value = value.replace(/^\s*\+242/, '');
  value = value.replace(/^\s*00242/, '');
  value = value.replace(/^\s*242/, '');
  return value;
}

/** Chiffres nationaux seuls (9 maximum), indicatif retiré. */
export function toNational(raw) {
  return String(raw ?? '')
    .replace(/\D/g, '')
    .replace(/^242/, '')
    .slice(0, 9);
}

/** Affichage par blocs : 06 889 88 88. */
export function formatPhoneDisplay(raw) {
  const digits = toNational(raw);
  if (!digits) return '';
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
    .filter(Boolean)
    .join(' ');
}