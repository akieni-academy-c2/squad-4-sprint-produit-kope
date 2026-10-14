import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PhoneInput } from '@/shared/components/ui/PhoneInput.jsx';
import { formatPhoneDisplay } from '@/shared/utils/phoneField.js';



const render = (props = {}) =>
  renderToStaticMarkup(
    <PhoneInput id="phone" value="" onChange={() => {}} inputMode="tel" {...props} />,
  );

describe('affichage', () => {
  it('affiche l’indicatif à gauche de la saisie', () => {
    expect(render()).toContain('+242');
  });

  it('sépare l’indicatif de la saisie', () => {
    const html = render();
    expect(html).toContain('border-r');
    expect(html).toMatch(/h-4 w-px/);
  });

  it('ne met pas l’indicatif dans le placeholder', () => {
    const placeholder = /placeholder="([^"]*)"/.exec(render())?.[1];
    expect(placeholder).not.toContain('+242');
  });

  it('annonce dans son placeholder exactement ce qu’il produira', () => {
    const placeholder = /placeholder="([^"]*)"/.exec(render())?.[1];
    expect(formatPhoneDisplay('068898888')).toBe(placeholder);
  });
});

describe('saisie', () => {
  it('affiche la valeur regroupée', () => {
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
