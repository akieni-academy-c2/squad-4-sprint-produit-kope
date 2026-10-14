/**
 * Contrat entre les boutons qui ouvrent, le formulaire affiché et le titre
 * annoncé. Fichier de données, pas composant : exporter des constantes depuis
 * un `.jsx` fait échouer le rechargement à chaud de Vite.
 */
export const AUTH_MODAL_MODES = Object.freeze({
  LOGIN: 'login',
  REGISTER_CLIENT: 'register-client',
  REGISTER_PRO: 'register-pro',
  CHANGE_PASSWORD: 'change-password',
});

/**
 * Titre accessible de chaque modale. Doit couvrir tous les modes ci-dessus :
 * `tests/src/shared/context/authModalModes.test.js` le vérifie.
 */
export const AUTH_MODAL_LABELS = Object.freeze({
  [AUTH_MODAL_MODES.LOGIN]: 'Connexion',
  [AUTH_MODAL_MODES.REGISTER_CLIENT]: 'Inscription',
  [AUTH_MODAL_MODES.REGISTER_PRO]: 'Devenir professionnel',
  [AUTH_MODAL_MODES.CHANGE_PASSWORD]: 'Changer le mot de passe',
});

/** Titre de repli, pour un mode inconnu. */
export const AUTH_MODAL_DEFAULT_LABEL = 'Compte';