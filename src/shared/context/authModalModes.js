
export const AUTH_MODAL_MODES = Object.freeze({
  LOGIN: 'login',
  REGISTER_CLIENT: 'register-client',
  REGISTER_PRO: 'register-pro',
  CHANGE_PASSWORD: 'change-password',
});


export const AUTH_MODAL_LABELS = Object.freeze({
  [AUTH_MODAL_MODES.LOGIN]: 'Connexion',
  [AUTH_MODAL_MODES.REGISTER_CLIENT]: 'Inscription',
  [AUTH_MODAL_MODES.REGISTER_PRO]: 'Devenir professionnel',
  [AUTH_MODAL_MODES.CHANGE_PASSWORD]: 'Changer le mot de passe',
});


export const AUTH_MODAL_DEFAULT_LABEL = 'Compte';