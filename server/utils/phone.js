const COUNTRY_CODE = '242';

/**
 * Numéros mobiles congolais : 9 chiffres commençant par 04, 05 ou 06.
 * Exporté pour que le formulaire client affiche exactement la même règle.
 */
export const MOBILE_PATTERN = /^(04|05|06)\d{7}$/;
export const MOBILE_HINT = '9 chiffres commençant par 04, 05 ou 06 - ex. 06 12 34 56 7';

export function normalizePhone(input) {
  if (typeof input !== 'string') return null;

  let digits = input.replace(/[\s().-]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);

  if (!/^\d+$/.test(digits)) return null;

  if (digits.startsWith(COUNTRY_CODE) && digits.length === COUNTRY_CODE.length + 9)
    digits = digits.slice(COUNTRY_CODE.length);

  return MOBILE_PATTERN.test(digits) ? `+${COUNTRY_CODE}${digits}` : null;
}

export function toWhatsappUrl(phone) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}