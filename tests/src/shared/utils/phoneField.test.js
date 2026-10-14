import { describe, it, expect } from 'vitest';
import { stripCountryCode, toNational, formatPhoneDisplay } from '@/shared/utils/phoneField.js';

describe('retrait du code pays', () => {
  it('retire +242', () => {
    expect(stripCountryCode('+242068898888')).toBe('068898888');
  });

  it('retire 00242', () => {
    expect(stripCountryCode('00242068898888')).toBe('068898888');
  });

  it('retire 242', () => {
    expect(stripCountryCode('242068898888')).toBe('068898888');
  });

  it('tolère les espaces de saisie', () => {
    expect(stripCountryCode(' +242 06 889 88 88')).toBe(' 06 889 88 88');
  });

  it('ne touche pas un numéro national', () => {
    expect(stripCountryCode('068898888')).toBe('068898888');
  });

  it('ne mange pas un préfixe national valide', () => {
    expect(stripCountryCode('0401234567')).toBe('0401234567');
    expect(stripCountryCode('0601234567')).toBe('0601234567');
  });
});

describe('chiffres nationaux', () => {
  it('ne garde que les chiffres', () => {
    expect(toNational('06 889 88 88')).toBe('068898888');
    expect(toNational('06.889.88.88')).toBe('068898888');
    expect(toNational('abc06')).toBe('06');
  });

  it('borne à 9 chiffres', () => {
    expect(toNational('0688988889999')).toHaveLength(9);
  });

  it('gère une valeur vide ou absente', () => {
    expect(toNational('')).toBe('');
    expect(toNational(null)).toBe('');
    expect(toNational(undefined)).toBe('');
  });
});

describe('affichage par blocs', () => {
  it('formate en 06 889 88 88', () => {
    expect(formatPhoneDisplay('068898888')).toBe('06 889 88 88');
  });

  it('complète progressivement', () => {
    expect(formatPhoneDisplay('0')).toBe('0');
    expect(formatPhoneDisplay('06')).toBe('06');
    expect(formatPhoneDisplay('068')).toBe('06 8');
    expect(formatPhoneDisplay('06889')).toBe('06 889');
    expect(formatPhoneDisplay('0688988')).toBe('06 889 88');
    expect(formatPhoneDisplay('068898888')).toBe('06 889 88 88');
  });

  it('affiche le préfixe collé une seule fois', () => {
    expect(formatPhoneDisplay('+242068898888')).toBe('06 889 88 88');
    expect(formatPhoneDisplay('00242068898888')).toBe('06 889 88 88');
  });

  it('reste vide sans saisie', () => {
    expect(formatPhoneDisplay('')).toBe('');
  });
});