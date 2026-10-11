import { describe, it, expect } from 'vitest';
import {
  formatPhoneFR,
  formatDateFr,
  toWhatsappUrl,
  fullNameInitials,
  truncate,
} from '../src/shared/utils';

describe('utils.js', () => {
  describe('formatPhoneFR', () => {
    it('formate un numéro +242 correctement', () => {
      expect(formatPhoneFR('+2420612345678')).toBe('+242 06 123 45 678');
    });
    it('formate un numéro local 10 chiffres style FR', () => {
      expect(formatPhoneFR('0612345678')).toBe('06 12 34 56 78');
    });
    it('retourne la valeur inchangée si invalide', () => {
      expect(formatPhoneFR('abc')).toBe('abc');
    });
    it('retourne une chaîne vide pour null/undefined', () => {
      expect(formatPhoneFR(null)).toBe('');
      expect(formatPhoneFR(undefined)).toBe('');
    });
  });

  describe('toWhatsappUrl', () => {
    it('génère un lien wa.me avec chiffres uniquement', () => {
      expect(toWhatsappUrl('+242 06 12 34 56 78')).toBe('https://wa.me/2420612345678');
    });
    it('retourne null pour falsy', () => {
      expect(toWhatsappUrl('')).toBeNull();
      expect(toWhatsappUrl(null)).toBeNull();
    });
  });

  describe('formatDateFr', () => {
    it('formate une date ISO en FR lisible', () => {
      const r = formatDateFr('2026-09-14T10:30:00Z');
      expect(r.length).toBeGreaterThan(5);
      expect(r.includes('2026')).toBe(true);
    });
    it('retourne string vide pour falsy', () => {
      expect(formatDateFr(null)).toBe('');
    });
    it('ne crash pas sur invalid date', () => {
      expect(typeof formatDateFr('pas une date')).toBe('string');
    });
  });

  describe('fullNameInitials', () => {
    it('gère le prénom + initiale du nom', () => {
      expect(fullNameInitials('Camille', 'Bernard')).toBe('Camille B.');
    });
  });

  describe('truncate', () => {
    it('tronque proprement avec ellipse', () => {
      expect(truncate('1234567890', 5)).toBe('1234…');
    });
    it('ne touche pas aux textes courts', () => {
      expect(truncate('ok', 5)).toBe('ok');
    });
  });
});
