import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginateSafely } from '../../utils/pagination.js';
import { env } from '../../config/env.js';
import * as repository from './reports.repository.js';
import * as professionalsRepository from '../professionals/professionals.repository.js';
import * as adminRepository from '../admin/admin.repository.js';

export const autoBlockThreshold = () => env.AUTO_BLOCK_REPORTS_THRESHOLD;
export const autoSuspendThreshold = () => env.AUTO_SUSPEND_REPORTS_THRESHOLD;

/** Un visiteur ne signale qu'une seule fois un même profil. */
export async function createReport(reporterId, professionalId, { reason, message }) {
  if (String(reporterId) === String(professionalId))
    throw ApiError.forbidden('Vous ne pouvez pas signaler votre propre profil');
  if (!(await professionalsRepository.existsPublished(professionalId)))
    throw ApiError.notFound('Profil introuvable');
  if (await repository.exists(reporterId, professionalId))
    throw ApiError.conflict('Vous avez déjà signalé ce profil');

  let report;
  try {
    report = await repository.create({ professionalId, reporterId, reason, message });
  } catch (err) {
    if (err.code === '23505') throw ApiError.conflict('Vous avez déjà signalé ce profil');
    throw err;
  }

  // Traitement automatique : blocage au seuil bas, suspension au seuil haut.
  const blockThreshold = autoBlockThreshold();
  const suspendThreshold = autoSuspendThreshold();
  const reportCount = await repository.countByProfessional(professionalId);

  const autoBlocked = blockThreshold > 0 && reportCount >= blockThreshold;
  const autoSuspended = suspendThreshold > 0 && reportCount >= suspendThreshold;

  if (autoSuspended) await adminRepository.setUserSuspended(professionalId, true);
  if (autoBlocked || autoSuspended) await adminRepository.setUserBlocked(professionalId, true);

  return { ...report, reportCount, autoBlocked, autoSuspended };
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

export async function myReports(reporterId, { status, q, ...pagination }) {
  const rows = await repository.listByReporter(reporterId, {
    limit: pagination.pageSize,
    offset: offsetOf(pagination),
    status,
    q,
  });
  return paginateSafely(rows, pagination, () => repository.countByReporter(reporterId));
}

/**
 * Retrait d'un signalement par son auteur.
 *
 * Seuls les signalements « pending » se retirent. Un signalement traité a
 * déjà produit ses effets — blocage ou suspension du professionnel — et le
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
