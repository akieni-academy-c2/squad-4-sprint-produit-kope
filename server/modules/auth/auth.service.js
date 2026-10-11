import bcrypt from 'bcryptjs';
import { withTransaction } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { normalizePhone } from '../../utils/phone.js';
import * as repository from './auth.repository.js';
import * as professionalsRepository from '../professionals/professionals.repository.js';
import * as sessions from './sessions.repository.js';

const BCRYPT_ROUNDS = 10;
const DUPLICATE_PHONE = 'Ce numéro est déjà utilisé';
const DUPLICATE_DISPLAY_NAME = 'Ce nom affiché est déjà pris, choisissez-en un autre';
const INVALID_CREDENTIALS = 'Numéro ou mot de passe incorrect';
const ACCOUNT_BLOCKED = 'Ce compte a été bloqué par un administrateur. Contactez le support.';

const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', BCRYPT_ROUNDS);

/** Traduit une violation d'unicité en message exploitable. */
function rethrowDuplicate(err) {
  if (err.code !== '23505') throw err;
  // Le nom du champ est dans l'erreur PostgreSQL ; on n'expose que le nôtre.
  if (err.constraint === 'professionals_display_name_unique' || err.detail?.includes('display_name'))
    throw ApiError.conflict(DUPLICATE_DISPLAY_NAME, { displayName: DUPLICATE_DISPLAY_NAME });
  throw ApiError.conflict(DUPLICATE_PHONE, { phone: DUPLICATE_PHONE });
}

async function insertUser(data, db) {
  try {
    return await repository.createUser(data, db);
  } catch (err) {
    rethrowDuplicate(err);
  }
}

/** US-01 */
export async function registerClient({ firstName, lastName, phone, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return insertUser({ role: 'client', phone, passwordHash, firstName, lastName });
}

/** US-02 */
export async function registerProfessional({ displayName, phone, password, tradeId, zoneIds }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    return await withTransaction(async (tx) => {
      const user = await insertUser({ role: 'professional', phone, passwordHash }, tx);
      await professionalsRepository.create({ userId: user.id, displayName, tradeId }, tx);
      await professionalsRepository.replaceZones(user.id, zoneIds, tx);
      return { ...user, displayName };
    });
  } catch (err) {
    rethrowDuplicate(err);
  }
}

/** US-03 */
export async function login({ phone, password }) {
  const normalized = normalizePhone(phone);
  const user = normalized ? await repository.findByPhone(normalized) : null;

  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordMatches) throw ApiError.unauthorized(INVALID_CREDENTIALS);
  if (user.blockedAt) throw ApiError.forbidden(ACCOUNT_BLOCKED);

  const { passwordHash: _passwordHash, blockedAt: _blockedAt, ...publicUser } = user;
  return publicUser;
}

/** Convertit un compte client existant en compte professionnel */
export async function becomeProfessional(userId, { displayName, tradeId, zoneIds, yearsExperience, description }) {
  return withTransaction(async (tx) => {
    const user = await repository.findById(userId, tx);
    if (!user) throw ApiError.unauthorized();
    if (user.role === 'admin') 
      throw ApiError.forbidden('Un administrateur ne peut pas devenir professionnel');
    
    if (user.role === 'professional') 
      throw ApiError.conflict('Vous avez deja un compte professionnel');
    
    await repository.updateRole(userId, 'professional', tx);
    await professionalsRepository.create({ userId, displayName, tradeId }, tx);
    await professionalsRepository.replaceZones(userId, zoneIds, tx);
    await professionalsRepository.updateProfile(userId, { description, yearsExperience, whatsapp: null }, tx);
    return { ...user, role: 'professional', displayName };
  });
}

export function getCurrentUser(userId) {
  return repository.findById(userId);
}

export async function changePassword(userId, { currentPassword, newPassword }, currentSessionId) {
  const passwordHash = await repository.getPasswordHash(userId);
  if (!passwordHash) throw ApiError.notFound('Compte introuvable');

  const matches = await bcrypt.compare(currentPassword ?? '', passwordHash);
  if (!matches) 
    throw ApiError.unauthorized('Mot de passe actuel incorrect');
  

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await repository.updatePasswordHash(userId, newHash);
  // Un mot de passe changé doit couper les autres sessions ouvertes.
  await sessions.destroyUserSessions(userId, { exceptSessionId: currentSessionId });
}

export async function updateAccount(userId, { firstName, lastName, phone }) {
  try {
    return await repository.updateAccount(userId, { firstName, lastName, phone });
  } catch (err) {
    rethrowDuplicate(err);
  }
}
