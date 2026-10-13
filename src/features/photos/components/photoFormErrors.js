const FORM_FIELDS = ['title', 'description'];

/**
 * Isole les erreurs de formulaire renvoyées par l'API des erreurs globales.
 * Le formulaire n'affiche que les premières ; les autres vont dans un toast.
 */
export function pickFormErrors(err) {
  const entries = Object.entries(err?.errors || {}).filter(([key]) => FORM_FIELDS.includes(key));
  return entries.length ? Object.fromEntries(entries) : null;
}