import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginateSafely } from '../../utils/pagination.js';
import { env } from '../../config/env.js';
import * as repository from './reports.repository.js';
import * as professionalsRepository from '../professionals/professionals.repository.js';
import * as contactsRepository from '../contacts/contacts.repository.js';
import * as adminRepository from '../admin/admin.repository.js';

export const autoBlockThreshold = () => env.AUTO_BLOCK_REPORTS_THRESHOLD;
const autoSuspendThreshold = () => env.AUTO_SUSPEND_REPORTS_THRESHOLD;


const SANCTIONABLE_REPORTER_ROLES = new Set(['client']);

export async function createReport(reporterId, professionalId, { reason, message }) {
  if (String(reporterId) === String(professionalId))
    throw ApiError.forbidden('Vous ne pouvez pas signaler votre propre profil');
  if (!(await professionalsRepository.existsPublished(professionalId)))
    throw ApiError.notFound('Profil introuvable');
  if (await repository.exists(reporterId, professionalId))
    throw ApiError.conflict('Vous avez déjà signalé ce profil');

  return recordReport({ reporterId, targetId: professionalId, reason, message });
}


export async function reportContact(reporterId, targetId, { reason, message }) {
  if (String(reporterId) === String(targetId))
    throw ApiError.forbidden('Vous ne pouvez pas signaler votre propre compte');

  const linked = await contactsRepository.hasContactBetween(reporterId, targetId);
  if (!linked) throw ApiError.notFound('Contact introuvable');
  if (await repository.exists(reporterId, targetId))
    throw ApiError.conflict('Vous avez déjà signalé ce compte');

  return recordReport({ reporterId, targetId, reason, message });
}

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


export async function reportReview(reporterId, reviewId, { reason, message }) {
  const review = await repository.findReceivedReview(reviewId, reporterId);

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
export async function deleteMyReport(id, reporterId) {
  const { rows } = await repository.deleteByReporter(id, reporterId);
  if (!rows) throw ApiError.notFound('Signalement introuvable');
}
