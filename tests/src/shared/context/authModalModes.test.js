import { describe, expect, it } from 'vitest';
import {
  AUTH_MODAL_MODES,
  AUTH_MODAL_LABELS,
  AUTH_MODAL_DEFAULT_LABEL,
} from '@/shared/context/authModalModes.js';

/**
 * Contrat de la modale d’authentification.
 *
 * Le titre accessible de la modale vient d’une table indexée par mode. Ses clés
 * étaient `register`, `pro` et `password`, alors que les boutons ouvraient
 * `register-client`, `register-pro` et `change-password` : trois des quatre
 * modales étaient donc annoncées « Compte » aux lecteurs d’écran, sans le
 * moindre avertissement. Ces tests ferment la porte sur toute réintroduction.
 */

describe('modale d’authentification', () => {
  it('chaque mode ouvert dispose d’un titre annoncé', () => {
    for (const mode of Object.values(AUTH_MODAL_MODES))
      expect(AUTH_MODAL_LABELS[mode], `mode ${mode}`).toBeTruthy();
  });

  it('aucune entrée de titre ne désigne un mode qui n’existe pas', () => {
    // Le symptôme exact du bug : une clé orpheline passe inaperçue tant que
    // personne n’ouvre le mode correspondant.
    const modes = new Set(Object.values(AUTH_MODAL_MODES));
    for (const key of Object.keys(AUTH_MODAL_LABELS)) expect(modes.has(key), key).toBe(true);
  });

  it('les titres sont distincts les uns des autres', () => {
    const titles = Object.values(AUTH_MODAL_LABELS);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('le repli existe pour un mode inconnu', () => {
    expect(AUTH_MODAL_DEFAULT_LABEL).toBeTruthy();
    expect(AUTH_MODAL_LABELS['inconnu']).toBeUndefined();
  });

  it('les modes sont figés', () => {
    // Un `Object.freeze` absent permettrait à n'importe quel module de réécrire la
    // liste et de désynchroniser boutons et titres à nouveau, sans erreur.
    expect(Object.isFrozen(AUTH_MODAL_MODES)).toBe(true);
    expect(Object.isFrozen(AUTH_MODAL_LABELS)).toBe(true);
  });
});