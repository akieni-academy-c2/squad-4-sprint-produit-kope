import { requiredUserId } from "../../middlewares/identity.js";
import * as service from "./reports.service.js";

export async function create(req, res) {
  const result = await service.createReport(
    requiredUserId(req),
    req.validated.params.id,
    req.validated.body,
  );
  const { autoBlocked, autoSuspended, reportCount, ...report } = result;
  res.status(201).json({ report, autoBlocked, autoSuspended, reportCount });
}

export async function createForContact(req, res) {
  const result = await service.reportContact(
    requiredUserId(req),
    req.validated.params.id,
    req.validated.body,
  );
  const { autoBlocked, autoSuspended, reportCount, ...report } = result;
  res.status(201).json({ report, autoBlocked, autoSuspended, reportCount });
}

export async function createForReview(req, res) {
  const report = await service.reportReview(
    requiredUserId(req),
    req.validated.params.id,
    req.validated.body,
  );
  res.status(201).json({ report });
}

export async function list(req, res) {
  res.json(await service.listReports(req.validated.query));
}

export async function setStatus(req, res) {
  const report = await service.setReportStatus(
    req.validated.params.id,
    req.validated.body.status,
  );
  res.json({ report });
}

export async function listReviewReports(req, res) {
  res.json(await service.listReviewReports(req.validated.query));
}

export async function setReviewReportStatus(req, res) {
  const report = await service.setReviewReportStatus(
    req.validated.params.id,
    req.validated.body.status,
  );
  res.json({ report });
}

export async function mine(req, res) {
  res.json(await service.myReports(requiredUserId(req), req.validated.query));
}

export async function remove(req, res) {
  await service.deleteMyReport(req.validated.params.id, requiredUserId(req));
  res.status(204).end();
}
