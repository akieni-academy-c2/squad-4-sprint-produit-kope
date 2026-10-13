import bcrypt from 'bcryptjs';
import { withTransaction } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { normalizePhone } from '../../utils/phone.js';
import * as repository from './auth.repository.js';
import * as professionalsRepository from '../professionals/professionals.repository.js';
import * as sessions from './sessions.repository.js';
import { processAvatar, saveAvatar } from './avatar.storage.js';
import { uploadUrl } from '../../utils/uploads.js';
import { env } from '../../config/env.js';

const DUPLICATE_PHONE = 'Ce numéro est déjà utilisé';
const DUPLICATE_DISPLAY_NAME = 'Ce nom affiché est déjà pris, choisissez-en un autre';
const INVALID_CREDENTIALS = 'Numéro ou mot de passe incorrect';
const ACCOUNT_BLOCKED = 'Ce compte a été bloqué par un administrateur. Contactez le support.';
const ACCOUNT_SUSPENDED = 'Ce compte est suspendu. Contactez le support.';
const DUPLICATE_EMAIL = 'Cette adresse e-mail est déjà utilisée par un autre compte';

const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', env.BCRYPT_ROUNDS);

function rethrowDuplicate(err) {
  if (err.code !== '23505') throw err;
  // Le nom du champ est dans l'erreur PostgreSQL ; on n'expose que le nôtre.
  if (err.constraint === 'professionals_display_name_unique' || err.detail?.includes('display_name'))
    throw ApiError.conflict(DUPLICATE_DISPLAY_NAME, { displayName: DUPLICATE_DISPLAY_NAME });
  // Index partiel : la violation porte sur `users_email_unique`, pas sur une
  // contrainte de colonne. Sans ce cas, une adresse déjà prise serait rapportée
  // comme un numéro en double - un message qui désigne le mauvais champ.
  if (err.constraint === 'users_email_unique' || err.detail?.includes('email'))
    throw ApiError.conflict(DUPLICATE_EMAIL, { email: DUPLICATE_EMAIL });
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
export async function registerClient({ firstName, lastName, phone, password, termsVersion }) {
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  return insertUser({ role: 'client', phone, passwordHash, firstName, lastName, termsVersion });
}

/** US-02 */
export async function registerProfessional({ displayName, phone, password, tradeId, zoneIds, termsVersion }) {
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

  try {
    return await withTransaction(async (tx) => {
      const user = await insertUser({ role: 'professional', phone, passwordHash, termsVersion }, tx);
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
  // Un compte suspendu doit l'être aussi lorsque rien n'a positionné
  // `blockedAt` : le blocage était le seul contrôle ici, alors que les deux
  // colonnes existent et qu'une suspension posée autrement donnait un compte
  // connectable.
  if (user.suspendedAt) throw ApiError.forbidden(ACCOUNT_SUSPENDED);

  const { passwordHash: _passwordHash, blockedAt: _blockedAt, suspendedAt: _suspendedAt, ...publicUser } = user;
  return publicUser;
}

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
  await verifyCurrentPassword(userId, currentPassword);

  const newHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  await repository.updatePasswordHash(userId, newHash);
  // Un mot de passe changé doit couper les autres sessions ouvertes.
  await sessions.destroyUserSessions(userId, { exceptSessionId: currentSessionId });
}

/**
 * Vérifie un mot de passe courant sans révéler l'existence du compte.
 *
 * Le hachage factice est utilisé quand aucun compte ne correspond : sans cela,
 * un numéro inconnu répond en quelques dizaines de microsecondes et un numéro
 * existant en ~250 ms, ce qui suffit à énumérer le registre des comptes.
 */
async function verifyCurrentPassword(userId, currentPassword) {
  const passwordHash = await repository.getPasswordHash(userId);
  const exists = Boolean(passwordHash);
  // Le hachage a lieu dans les deux cas, avant tout branchement : lever une 404
  // avant la comparaison reviendrait à ne rien hacher pour un compte inconnu,
  // donc à répondre en quelques dizaines de microsecondes au lieu de ~250 ms.
  // C'est suffisant pour énumérer le registre des comptes.
  const matches = await bcrypt.compare(currentPassword ?? '', passwordHash ?? DUMMY_HASH);

  if (!exists) throw ApiError.notFound('Compte introuvable');
  if (!matches) throw ApiError.unauthorized('Mot de passe actuel incorrect');
}

/**
 * Modification du compte.
 *
 * Changer le téléphone ou l'e-mail exige le mot de passe actuel. Le téléphone
 * est le seul identifiant de connexion : sans cette re-authentification, une
 * session volée suffit à prendre le compte de façon définitive, puisque le
 * titulaire légitime ne pourra plus se connecter. Le prénom se change librement :
 * il ne sert pas à s'authentifier.
 */
export async function updateAccount(userId, { firstName, lastName, phone, email, currentPassword }) {
  if (phone !== undefined || email !== undefined) await verifyCurrentPassword(userId, currentPassword);

  try {
    return await repository.updateAccount(userId, { firstName, lastName, phone, email });
  } catch (err) {
    rethrowDuplicate(err);
  }
}

/**
 * Traite un avatar téléversé : normalisation, stockage, puis référence en base.
 *
 * L'écriture du fichier précède celle de la ligne, comme pour les photos : un
 * COMMIT en échec laisserait sinon un fichier orphelin. L'ancien avatar n'est
 * pas supprimé - le compte peut être supprimé avant qu'il ne le soit, et
 * cleanup disque n'a pas sa place ici.
 */
export async function updateAvatar(userId, file) {
  if (!file) throw ApiError.badRequest('Aucun fichier envoyé');

  const buffer = await processAvatar(file.buffer);
  const relativePath = await saveAvatar(buffer, userId);
  const avatarUrl = uploadUrl(relativePath);

  await repository.updateAvatarUrl(userId, avatarUrl);

  return { avatarUrl };
}
