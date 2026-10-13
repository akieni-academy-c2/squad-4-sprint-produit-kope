import { describe, it, expect } from 'vitest';
import { FIELD_STATUS } from '@/shared/hooks/useFieldStatus.js';
import { firstMissingField, submitLabel } from '@/shared/utils/submitLabel.js';

const OK = FIELD_STATUS.OK;
const IDLE = FIELD_STATUS.IDLE;
const NEAR = FIELD_STATUS.NEAR;

describe('premier champ incomplet', () => {
  it('ne signale rien quand tout est rempli', () => {
    expect(firstMissingField({ firstName: OK, lastName: OK, phone: OK })).toBeNull();
  });

  it('respecte l\'ordre du formulaire', () => {
    const statuses = { firstName: IDLE, lastName: IDLE, phone: IDLE };
    expect(firstMissingField(statuses, ['firstName', 'lastName', 'phone'])).toBe('le prénom');
    statuses.firstName = OK;
    expect(firstMissingField(statuses, ['firstName', 'lastName', 'phone'])).toBe('le nom');
  });

  it('distingue un champ vide d\'un champ invalide', () => {
    expect(firstMissingField({ a: IDLE, b: NEAR }, ['a', 'b'])).toBe('a');
    expect(firstMissingField({ a: OK, b: NEAR }, ['a', 'b'])).toBe('b');
  });

  it('ignore un champ absent des statuts', () => {
    expect(firstMissingField({ a: OK }, ['a', 'b'])).toBeNull();
  });
});

describe('libellé du bouton', () => {
  it('donne l\'instruction quand un champ manque', () => {
    expect(submitLabel({ firstName: IDLE, lastName: OK }, ['firstName', 'lastName'], 'Suivant')).toBe(
      'Complétez le prénom',
    );
  });

  it('affiche le libellé normal une fois prêt', () => {
    expect(submitLabel({ firstName: OK, lastName: OK }, ['firstName', 'lastName'], 'Suivant')).toBe('Suivant');
  });

  it('reste assez court pour tenir sur un bouton', () => {
    // Le libellé le plus long est celui du mot de passe.
    for (const field of ['firstName', 'lastName', 'phone', 'password', 'confirm', 'consent']) {
      const label = submitLabel({ [field]: IDLE }, [field], 'Créer mon compte');
      expect(label.length, field).toBeLessThanOrEqual(28);
    }
  });
});