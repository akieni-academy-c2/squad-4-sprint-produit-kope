import { requiredUserId } from '../../middlewares/identity.js';
import * as service from './reports.service.js';

export async function create(req, res) {
  const result = await service.createReport(requiredUserId(req), req.validated.params.id, req.validated.body);
  const { autoBlocked, autoSuspended, reportCount, ...report } = result;
  res.status(201).json({ report, autoBlocked, autoSuspended, reportCount });
}

export async function list(req, res) {
  res.json(await service.listReports(req.validated.query));
}

export async function setStatus(req, res) {
  const report = await service.setReportStatus(req.validated.params.id, req.validated.body.status);
  res.json({ report });
}
