const FORM_FIELDS = ['title', 'description'];


export function pickFormErrors(err) {
  const entries = Object.entries(err?.errors || {}).filter(([key]) => FORM_FIELDS.includes(key));
  return entries.length ? Object.fromEntries(entries) : null;
}