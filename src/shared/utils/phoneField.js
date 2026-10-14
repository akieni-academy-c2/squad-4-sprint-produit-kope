


export function stripCountryCode(raw) {
  let value = String(raw ?? '');
  value = value.replace(/^\s*\+242/, '');
  value = value.replace(/^\s*00242/, '');
  value = value.replace(/^\s*242/, '');
  return value;
}

export function toNational(raw) {
  return String(stripCountryCode(raw))
    .replace(/\D/g, '')
    .replace(/^242/, '')
    .slice(0, 9);
}

export function formatPhoneDisplay(raw) {
  const digits = toNational(raw);
  if (!digits) return '';
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)]
    .filter(Boolean)
    .join(' ');
}