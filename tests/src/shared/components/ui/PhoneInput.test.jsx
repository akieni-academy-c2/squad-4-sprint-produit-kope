import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PhoneInput } from '@/shared/components/ui/PhoneInput.jsx';
import { formatPhoneDisplay } from '@/shared/utils/phoneField.js';

/**
 * Le champ téléphone, tel qu'il est rendu.
 *
 * ## Pourquoi un rendu et non une lecture de source
 *
 * Une version précédente de ce test lisait `PhoneInput.jsx` et y cherchait des
 * chaînes. Cela vérifiait que le fichier **contenait** un texte, pas que
 * l'écran **montrait** un champ. Un test qui passe quand le comportement a
 * changé n'est pas un test : c'est un filtre.
 *
 * `PhoneInput` n'est pas un portail : il se rend normalement. Le DOM est donc
 * observable, et ce qu'on vérifie est ce que voit l'utilisateur.
 */

const render = (props = {}) =>
  renderToStaticMarkup(
    <PhoneInput id="phone" value="" onChange={() => {}} inputMode="tel" {...props} />,
  );

describe('affichage', () => {
  it('affiche l’indicatif à gauche de la saisie', () => {
    // Un numéro congolais commence toujours par `+242`. Le laisser à la saisie
    // produit `+242 242 06…` dès que l'utilisateur le recopie.
    expect(render()).toContain('+242');
  });

  it('sépare l’indicatif de la saisie', () => {
    const html = render();
    expect(html).toContain('border-r');
    // Le trait est centré sur la ligne du texte, pas étiré sur les 44 px du
    // champ : étiré, il pesait plus lourd que la bordure du champ lui-même.
    expect(html).toMatch(/h-4 w-px/);
  });

  it('ne met pas l’indicatif dans le placeholder', () => {
    // S’il y était aussi, l’utilisateur le taperait et il s’afficherait deux fois.
    const placeholder = /placeholder="([^"]*)"/.exec(render())?.[1];
    expect(placeholder).not.toContain('+242');
  });

  it('annonce dans son placeholder exactement ce qu’il produira', () => {
    // Le placeholder annonçait `06 12 34 56 7`, le champ produisait
    // `06 123 45 67`. L’utilisateur tapait l’exemple et voyait ses groupes se
    // réécrire - ce qui se lit comme une correction, pas comme un formatage.
    const placeholder = /placeholder="([^"]*)"/.exec(render())?.[1];
    expect(formatPhoneDisplay('068898888')).toBe(placeholder);
  });
});

describe('saisie', () => {
  it('affiche la valeur regroupée', () => {
    // La valeur stockée est `+242068898888` : elle doit s'afficher en national.
    expect(render({ value: '+242068898888' })).toContain('value="06 889 88 88"');
  });

  it('reste vide sur une valeur absente', () => {
    expect(render({ value: null })).toContain('value=""');
  });

  it('demande le clavier de téléphone', () => {
    expect(render()).toContain('inputMode="tel"');
    expect(render()).toContain('autoComplete="tel"');
  });

  it('marque le champ comme invalide sur erreur', () => {
    expect(render({ error: 'Numéro invalide' })).toContain('aria-invalid="true"');
  });

  it('reçoit un nom accessible', () => {
    expect(render()).toContain('id="phone"');
  });
});
