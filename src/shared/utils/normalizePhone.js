
const MOBILE_PATTERN = /^(04|05|06)\d{7}$/;
export const MOBILE_HINT = '9 chiffres commençant par 04, 05 ou 06 - ex. 06 889 88 88';

export function normalizePhone(raw) {
  if (raw == null) return null;
  let digits = String(raw).replace(/[\s().-]/g, '');

  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);

  if (digits.startsWith('242') && digits.length === 12) digits = digits.slice(3);

  if (!MOBILE_PATTERN.test(digits)) return null;
  return `+242${digits}`;
}


export function isHopelessPhone(raw) {
  const v = String(raw ?? '');
  if (!/\d/.test(v)) return true;
  if (/[^\d\s().+-]/.test(v)) return true;

  const digits = v.replace(/\D/g, '');
  const national = digits.length === 12 && digits.startsWith('242') ? digits.slice(3) : digits;
  return !/^0[456]/.test(national);
}