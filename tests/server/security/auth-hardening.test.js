import { describe, expect, it, vi, beforeEach } from 'vitest';
import { env } from '@server/config/env.js';
import { updateAccountSchema, loginSchema } from '@server/modules/auth/auth.schemas.js';

/**
 * Durcissement de l'espace d'authentification.
 *
 * Le téléphone est le **seul** identifiant de connexion du produit : il n'existe
 * pas de connexion par e-mail. Une route qui le modifiait sans exiger le mot de
 * passe courant offrait donc la prise complète et définitive d'un compte à
 * quiconque détenait une session - le titulaire légitime se retrouvait
 * verrouillé dehors sans aucun moyen de revenir. La règle testée ici rend cette
 * opération impossible sans re-authentification, tout en laissant la prénom et
 * le nom se modifier librement, puisqu'ils ne servent pas à s'authentifier.
 */

vi.mock('@server/db/pool.js', () => ({
  pool: { query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }), connect: vi.fn() },
  withTransaction: vi.fn(),
  isDatabaseReachable: vi.fn(),
}));

// Un module ESM est en lecture seule : on ne peut pas remplacer une de ses
// fonctions après coup, il faut la substituer avant le chargement.
vi.mock('@server/modules/auth/auth.repository.js', () => ({
  getPasswordHash: vi.fn(),
  updateAccount: vi.fn(),
  updatePasswordHash: vi.fn(),
  updateAvatarUrl: vi.fn(),
  findById: vi.fn(),
  findByPhone: vi.fn(),
  createUser: vi.fn(),
  updateRole: vi.fn(),
}));

const repository = await import('@server/modules/auth/auth.repository.js');
const service = await import('@server/modules/auth/auth.service.js');
const bcrypt = (await import('bcryptjs')).default;

const CURRENT = {
  id: 7,
  phone: '+242061234567',
  email: 'ada@example.com',
  firstName: 'Ada',
  lastName: 'Lovelace',
};

beforeEach(() => {
  vi.restoreAllMocks();
  repository.getPasswordHash.mockResolvedValue('$2b$12$hashvalide');
  repository.updateAccount.mockResolvedValue(CURRENT);
  // Le hachage réel coûte ~250 ms par appel : simulé pour ne pas payer le test
  // à chaque cas. Le vide est traité comme un échec, comme le fait bcrypt -
  // sinon un appel sans `currentPassword` « passerait » et le test qui vérifie
  // son refus ne vérifierait rien.
  vi.spyOn(bcrypt, 'compare').mockImplementation((candidate) => Promise.resolve(candidate === 'MotDePasse1!'));
});

describe('changement d’identité du compte', () => {
  it('refuse un nouveau numéro sans mot de passe courant', async () => {
    await expect(
      service.updateAccount(7, { phone: '+242069999999' }),
    ).rejects.toMatchObject({ status: 401 });
    expect(repository.updateAccount).not.toHaveBeenCalled();
  });

  it('refuse un nouveau numéro dont le mot de passe courant est faux', async () => {
    await expect(
      service.updateAccount(7, { phone: '+242069999999', currentPassword: 'faux' }),
    ).rejects.toMatchObject({ status: 401 });
    expect(repository.updateAccount).not.toHaveBeenCalled();
  });

  it('accepte un nouveau numéro avec le bon mot de passe', async () => {
    await expect(
      service.updateAccount(7, { phone: '+242069999999', currentPassword: 'MotDePasse1!' }),
    ).resolves.toBeTruthy();
    expect(repository.updateAccount).toHaveBeenCalledWith(7, {
      firstName: undefined,
      lastName: undefined,
      phone: '+242069999999',
      email: undefined,
    });
  });

  it('exige aussi la reauthentification pour un nouvel e-mail', async () => {
    await expect(service.updateAccount(7, { email: 'autre@example.com' })).rejects.toMatchObject({
      status: 401,
    });
  });

  it('laisse le prénom et le nom se modifier sans mot de passe', async () => {
    // Le nom affiché n'est pas un identifiant : exiger un mot de passe ici
    // serait une friction sans contrepartie de sécurité.
    await expect(service.updateAccount(7, { firstName: 'Augusta' })).resolves.toBeTruthy();
    expect(repository.updateAccount).toHaveBeenCalled();
  });

  it('compare toujours, même si le compte n’existe pas', async () => {
    // Sans hachage factice, un numéro inconnu répondait bien plus vite qu'un
    // numéro existant : de quoi énumérer le registre à la milliseconde.
    repository.getPasswordHash.mockResolvedValue(undefined);
    await expect(service.updateAccount(404, { phone: '+242069999999' })).rejects.toMatchObject({
      status: 404,
    });
    // Le cas « compte inconnu » remonte une 404, mais après avoir comparé : le
    // temps de réponse ne doit pas révéler l'existence du compte.
    expect(bcrypt.compare).toHaveBeenCalled();
  });
});

describe('schémas d’authentification', () => {
  it('n’accepte pas un mot de passe au-delà de la limite de bcrypt', () => {
    // bcrypt tronque silencieusement à 72 octets : au-delà, deux mots de passe
    // différents produisent le même hash.
    expect(loginSchema.safeParse({ phone: '061234567', password: 'a'.repeat(72) }).success).toBe(true);
    expect(loginSchema.safeParse({ phone: '061234567', password: 'a'.repeat(73) }).success).toBe(false);
  });

  it('accepte currentPassword dans la mise à jour du compte', () => {
    expect(
      updateAccountSchema.safeParse({ phone: '+242069999999', currentPassword: 'MotDePasse1!' }).success,
    ).toBe(true);
  });
});

describe('coût du hachage', () => {
  it('est d’au moins 12 par défaut', () => {
    // 10 est le défaut historique de la bibliothèque. En 2026, une machine
    // dedicated casse un hash à 10 environ cent fois plus vite qu'à 12, sans
    // que l'utilisateur perçoive la différence.
    expect(env.BCRYPT_ROUNDS).toBeGreaterThanOrEqual(12);
    expect(env.BCRYPT_ROUNDS).toBeLessThanOrEqual(15);
  });
});