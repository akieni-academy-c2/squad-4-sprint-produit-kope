import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginateSafely } from '../../utils/pagination.js';
import { env } from '../../config/env.js';
import * as repository from './reports.repository.js';
import * as professionalsRepository from '../professionals/professionals.repository.js';
import * as contactsRepository from '../contacts/contacts.repository.js';
import * as adminRepository from '../admin/admin.repository.js';

export const autoBlockThreshold = () => env.AUTO_BLOCK_REPORTS_THRESHOLD;
export const autoSuspendThreshold = () => env.AUTO_SUSPEND_REPORTS_THRESHOLD;

/**
 * Qui peut déclencher une sanction automatique.
 *
 * Seuls les signalements déposés par des **clients** comptent au seuil.
 *
 * Un professionnel est une partie prenante : il a un intérêt direct à ce qu'un
 * concurrent soit bloqué, et il peut coordonner ses signalements avec d'autres.
 * Compter les siens leur donnerait, avec trois comptes suffisants, le moyen de
 * faire suspendre une fiche en ligne. Ses signalements restent recevables et
 * visibles dans la file de modération — l'administrateur tranche — ils ne font
 * pas basculer de compteur.
 *
 * Le professionnel reste donc recevable comme auteur, mais la cible sanctionnable
 * par ce canal est un client.
 */
const SANCTIONABLE_REPORTER_ROLES = new Set(['client']);

/** Un visiteur ne signale qu'une seule fois un même profil. */
export async function createReport(reporterId, professionalId, { reason, message }) {
  if (String(reporterId) === String(professionalId))
    throw ApiError.forbidden('Vous ne pouvez pas signaler votre propre profil');
  if (!(await professionalsRepository.existsPublished(professionalId)))
    throw ApiError.notFound('Profil introuvable');
  if (await repository.exists(reporterId, professionalId))
    throw ApiError.conflict('Vous avez déjà signalé ce profil');

  return recordReport({ reporterId, targetId: professionalId, reason, message });
}

/**
 * Signalement d'un compte depuis une conversation existante.
 *
 * Chemin distinct de `createReport` : celui-ci valide que la cible est une fiche
 * publiée, ce qui est la bonne garantie pour un signalement à froid depuis une
 * fiche publique mais exclut un client — qui n'a pas de fiche. Ici la cible est
 * un compte que le demandeur a effectivement contacté, ce qui remplace la
 * preuve de publication.
 *
 * La cible ne peut être que le correspondant d'un contact : signaler un compte
 * quelconque par son identifiant n'aurait aucun lien avec une interaction
 * réelle, et ouvrirait un canal de signalement aveugle.
 */
export async function reportContact(reporterId, targetId, { reason, message }) {
  if (String(reporterId) === String(targetId))
    throw ApiError.forbidden('Vous ne pouvez pas signaler votre propre compte');

  const linked = await contactsRepository.hasContactBetween(reporterId, targetId);
  if (!linked) throw ApiError.notFound('Contact introuvable');
  if (await repository.exists(reporterId, targetId))
    throw ApiError.conflict('Vous avez déjà signalé ce compte');

  return recordReport({ reporterId, targetId, reason, message });
}

/** Écrit le signalement puis applique le traitement automatique. */
async function recordReport({ reporterId, targetId, reason, message }) {
  const targetRole = await repository.targetRoleOf(targetId);
  if (!targetRole) throw ApiError.notFound('Compte introuvable');

  let report;
  try {
    report = await repository.create({
      professionalId: targetId,
      reporterId,
      reason,
      message,
      targetRole,
    });
  } catch (err) {
    if (err.code === '23505') throw ApiError.conflict('Vous avez déjà signalé ce compte');
    throw err;
  }

  const reporterRole = await repository.targetRoleOf(reporterId);
  const sanctionable = SANCTIONABLE_REPORTER_ROLES.has(reporterRole);
  const reportCount = await repository.countSanctionable(targetId);

  const blockThreshold = sanctionable ? autoBlockThreshold() : 0;
  const suspendThreshold = sanctionable ? autoSuspendThreshold() : 0;

  const autoBlocked = blockThreshold > 0 && reportCount >= blockThreshold;
  const autoSuspended = suspendThreshold > 0 && reportCount >= suspendThreshold;

  if (autoSuspended) await adminRepository.setUserSuspended(targetId, true);
  if (autoBlocked || autoSuspended) await adminRepository.setUserBlocked(targetId, true);

  return { ...report, reportCount, autoBlocked, autoSuspended, targetRole };
}

export async function listReports({ status, q, ...pagination }) {
  const rows = await repository.list({
    limit: pagination.pageSize,
    offset: offsetOf(pagination),
    status,
    q,
  });
  return paginateSafely(rows, pagination, () => repository.countGrouped({ status, q }));
}

export async function setReportStatus(id, status) {
  const report = await repository.setStatus(id, status);
  if (!report) throw ApiError.notFound('Signalement introuvable');
  return report;
}

/**
 * Signalement d'un avis reçu.
 *
 * Seul le professionnel concerné peut le faire : l'avis est sur sa fiche, et
 * lui seul a un intérêt à le contester. Un client qui n'a pas écrit cet avis
 * n'a rien à y signaler, et l'ouvrir à tous ferait de la file de modération un
 * canal de vandalisme entre clients.
 *
 * Aucun effet automatique, contrairement aux signalements de compte. Retirer
 * un avis est une décision éditoriale : elle engage la réputation de l'auteur
 * aussi bien que celle du professionnel signalé, et mérite un regard humain.
 * Le signalement n'est donc qu'un signalement.
 */
export async function reportReview(reporterId, reviewId, { reason, message }) {
  const review = await repository.findReceivedReview(reviewId, reporterId);
  // 404 et non 403 : ne pas révéler qu'un avis existe s'il n'appartient pas à
  // la fiche du demandeur.
  if (!review) throw ApiError.notFound('Avis introuvable');

  if (review.clientId && String(review.clientId) === String(reporterId))
    throw ApiError.forbidden('Vous ne pouvez pas signaler votre propre avis');

  if (await repository.reviewReportExists(reviewId, reporterId))
    throw ApiError.conflict('Vous avez déjà signalé cet avis');

  try {
    return await repository.createReviewReport({ reviewId, reporterId, reason, message });
  } catch (err) {
    if (err.code === '23505') throw ApiError.conflict('Vous avez déjà signalé cet avis');
    throw err;
  }
}

/** File de modération des signalements d'avis. */
export async function listReviewReports({ status, ...pagination }) {
  const rows = await repository.listReviewReports({
    limit: pagination.pageSize,
    offset: offsetOf(pagination),
    status,
  });
  return paginateSafely(rows, pagination, () => repository.countReviewReports());
}

export async function setReviewReportStatus(id, status) {
  const report = await repository.setReviewReportStatus(id, status);
  if (!report) throw ApiError.notFound('Signalement introuvable');
  return report;
}

export async function myReports(reporterId, { status, q, sort, ...pagination }) {
  const rows = await repository.listByReporter(reporterId, {
    limit: pagination.pageSize,
    offset: offsetOf(pagination),
    status,
    q,
    sort,
  });
  return paginateSafely(rows, pagination, () => repository.countByReporter(reporterId));
}

/**
 * Retrait d'un signalement par son auteur.
 *
 * Seuls les signalements « pending » se retirent. Un signalement traité a
 * déjà produit ses effets - blocage ou suspension du professionnel - et le
 * retirer effacerait une décision d'administration. La règle est vérifiée
 * ici et non seulement dans l'interface, sinon un appel direct la contourne.
 *
 * 404 et non 403 : confirmer l'existence d'un signalement d'autrui permettrait
 * d'énumérer les signalements du site.
 */
export async function deleteMyReport(id, reporterId) {
  const { rows } = await repository.deleteByReporter(id, reporterId);
  if (!rows) throw ApiError.notFound('Signalement introuvable');
}
