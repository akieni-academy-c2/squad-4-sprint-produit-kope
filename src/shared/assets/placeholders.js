/**
 * Visuels de substitution, servis depuis /public : pas de requête vers un tiers,
 * donc pas d'adresse IP communiquée à un hébergeur d'images.
 */
import hero from './hero.png';
import what1 from './what1.png';
import what2 from './what2.png';
import what3 from './what3.png';
import user1 from './user1.png';
import user2 from './user2.png';

const IMAGES = [hero, what1, what2, what3, user1, user2];

export { IMAGES };

function fingerprint(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/** Choix déterministe : même libellé, même image à chaque rendu. */
export function placeholderImage(label = '') {
  return IMAGES[fingerprint(label) % IMAGES.length];
}

/**
 * Réservation explicite, pour les sections de la page d'accueil.
 *
 * Le tirage par empreinte fonctionne, mais deux sections peuvent retomber sur
 * la même image et donner l'impression de répéter un visage. Ici chaque
 * emplacement est attribué à la main : `usedBy` sert à retirer du tirage ce que
 * les sections précédentes ont déjà pris.
 */
export function reserveImage(label, usedBy = []) {
  const available = IMAGES.filter((image) => !usedBy.includes(image));
  const pool = available.length ? available : IMAGES;

  return pool[fingerprint(label) % pool.length];
}

export const HERO_IMAGE_LABEL =
  'professional african female carpenter artisan working at her workshop workbench, smiling, natural daylight, waist up photo, portrait 4:3 realistic';
export const PRO_CTA_IMAGE_LABEL =
  'confident african female tailor entrepreneur smiling at her workshop counter holding tablet, natural daylight, realistic portrait 4:3';
export const LOGIN_IMAGE_LABEL =
  'friendly young african woman using smartphone smiling, home interior, bright candid realistic portrait 4:3';