import { api } from "@/shared/lib/api.js";
import { callApi } from "@/shared/lib/dataSource.js";
import {
  mockDeleteMyReport,
  mockMyReports,
  mockReportContact,
  mockReportReview,
} from "@/shared/mocks/appMock.js";

export function getMyReports({
  page = 1,
  pageSize = 20,
  status,
  q,
  sort,
} = {}) {
  return callApi(
    () =>
      api.get("/reports/mine", {
        page,
        pageSize,
        ...(status ? { status } : {}),
        ...(q ? { q } : {}),
        ...(sort ? { sort } : {}),
      }),
    async () => mockMyReports({ page, pageSize, status, q, sort }),
  );
}

export function deleteMyReport(id) {
  return callApi(
    () => api.del(`/reports/${id}`),
    async () => mockDeleteMyReport(id),
  );
}

export function reportContact(userId, payload) {
  return callApi(
    () =>
      api
        .postJson(`/contacts/${userId}/reports`, payload)
        .then((r) => r.report),
    async () => mockReportContact(userId, payload),
  );
}

export function reportReview(reviewId, payload) {
  return callApi(
    () =>
      api
        .postJson(`/reviews/${reviewId}/reports`, payload)
        .then((r) => r.report),
    async () => mockReportReview(reviewId, payload),
  );
}
