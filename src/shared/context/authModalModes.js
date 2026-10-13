/**
 * Modes d'ouverture de la modale d'authentification.
 *
 * Ces chaînes sont le contrat entre les boutons qui ouvrent la modale, le
 * composant qui affiche le formulaire correspondant, et le titre annoncé aux
 * lecteurs d'écran. Elles étaient écrites en dur à chaque appel
 * `openModal('...')`, et le tableau des titres annonçait « Compte » pour trois
 * des quatre modales parce que ses clés ne correspondaient à aucun mode
 * réellement ouvert. Une seule liste, réutilisée, supprime la classe entière
 * d'erreur.
 *
 * Ce fichier ne contient que des données : les exporter depuis le composant
 * ferait échouer le rechargement à chaud de Vite, qui exige qu'un fichier de
 * composant n'exporte que des composants.
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