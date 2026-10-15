import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createReportSchema,
  listReportsQuerySchema,
  reportStatusSchema,
} from "@server/modules/reports/reports.schemas.js";
import * as repository from "@server/modules/reports/reports.repository.js";
import * as service from "@server/modules/reports/reports.service.js";
import { autoBlockThreshold } from "@server/modules/reports/reports.service.js";
import * as adminRepository from "@server/modules/admin/admin.repository.js";
import * as professionalsRepository from "@server/modules/professionals/professionals.repository.js";
import * as contactsRepository from "@server/modules/contacts/contacts.repository.js";
import { env } from "@server/config/env.js";
import {
  MOCK_PROS,
  mockAdminReports,
  mockReportProfessional,
  mockResolveReport,
} from "@/shared/mocks/appMock.js";

describe("signalements de profils", () => {
  describe("schémas", () => {
    it("createReportSchema impose un motif connu", () => {
      expect(createReportSchema.safeParse({ reason: "spam" }).success).toBe(
        true,
      );
      expect(createReportSchema.safeParse({ reason: "inconnu" }).success).toBe(
        false,
      );
      expect(createReportSchema.safeParse({}).success).toBe(false);
    });

    it("createReportSchema normalise le message facultatif", () => {
      expect(
        createReportSchema.safeParse({ reason: "other" }).data.message,
      ).toBeNull();
      expect(
        createReportSchema.safeParse({
          reason: "other",
          message: "  Usurpation  ",
        }).data.message,
      ).toBe("Usurpation");
      expect(
        createReportSchema.safeParse({ reason: "other", message: "ab" })
          .success,
      ).toBe(false);
      expect(
        createReportSchema.safeParse({
          reason: "other",
          message: "x".repeat(501),
        }).success,
      ).toBe(false);
    });

    it("listReportsQuerySchema valide le statut et la recherche", () => {
      expect(listReportsQuerySchema.safeParse({}).success).toBe(true);
      expect(
        listReportsQuerySchema.safeParse({ status: "pending" }).success,
      ).toBe(true);
      expect(
        listReportsQuerySchema.safeParse({ status: "ferme" }).success,
      ).toBe(false);
      expect(
        listReportsQuerySchema.safeParse({ status: "" }).data.status,
      ).toBeUndefined();
    });

    it("reportStatusSchema interdit un retour en attente", () => {
      expect(reportStatusSchema.safeParse({ status: "resolved" }).success).toBe(
        true,
      );
      expect(
        reportStatusSchema.safeParse({ status: "dismissed" }).success,
      ).toBe(true);
      expect(reportStatusSchema.safeParse({ status: "pending" }).success).toBe(
        false,
      );
    });
  });

  describe("repository", () => {
    it("insert le signalement et renvoie les colonnes attendues", async () => {
      const rows = [
        {
          id: 3,
          professionalId: 7,
          reason: "spam",
          message: null,
          status: "pending",
          createdAt: "now",
        },
      ];
      const db = { query: vi.fn().mockResolvedValue({ rows }) };

      const result = await repository.create(
        {
          professionalId: 7,
          reporterId: 2,
          reason: "spam",
          message: null,
          targetRole: "professional",
        },
        db,
      );

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain(
        "INSERT INTO account_reports (professional_id, reporter_id, reason, message, target_role)",
      );
      expect(query).toContain('created_at AS "createdAt"');
      expect(params).toEqual([7, 2, "spam", null, "professional"]);
      expect(result).toEqual(rows[0]);
    });

    it("liste les signalements regroupés par professionnel", async () => {
      const rows = [
        {
          professionalId: 7,
          professionalName: "Karine",
          professionalAvatarUrl: "/uploads/a.jpg",
          reportCount: 3,
          pendingCount: 2,
          total: 1,
        },
      ];
      const db = { query: vi.fn().mockResolvedValue({ rows }) };

      const result = await repository.list(
        { limit: 20, offset: 0, status: "pending", q: "usurp" },
        db,
      );

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain("WITH filtered AS (");
      expect(query).toContain("JOIN users pu ON pu.id = r.professional_id");
      expect(query).toContain(
        'MAX(f.professional_avatar_url) AS "professionalAvatarUrl"',
      );
      expect(query).toContain("GROUP BY f.professional_id");
      expect(query).toContain(
        "COUNT(*) FILTER (WHERE f.status = 'pending')::int AS \"pendingCount\"",
      );
      expect(query).toContain("json_agg(");
      expect(query).toContain("ORDER BY f.created_at DESC");
      expect(params).toEqual(["pending", "%usurp%", 20, 0]);
      expect(result).toEqual(rows);
    });

    it("met à jour le statut en horodatant la résolution", async () => {
      const rows = [{ id: 5, status: "resolved", resolvedAt: "now" }];
      const db = { query: vi.fn().mockResolvedValue({ rows }) };

      const result = await repository.setStatus(5, "resolved", db);

      const [query, params] = db.query.mock.calls[0];
      expect(query).toContain("SET status = $2, resolved_at = now()");
      expect(params).toEqual([5, "resolved"]);
      expect(result).toEqual(rows[0]);
    });
  });

  describe("service", () => {
    beforeEach(() => {
      vi.spyOn(repository, "targetRoleOf").mockImplementation(async (id) =>
        String(id) === "2" ? "client" : "professional",
      );
    });

    it("refuse de signaler son propre profil", async () => {
      await expect(
        service.createReport(7, 7, { reason: "spam" }),
      ).rejects.toMatchObject({ status: 403 });
    });

    it("refuse un profil inexistant", async () => {
      const spy = vi
        .spyOn(professionalsRepository, "existsPublished")
        .mockResolvedValue(false);
      await expect(
        service.createReport(2, 999, { reason: "spam" }),
      ).rejects.toMatchObject({ status: 404 });
      spy.mockRestore();
    });

    it("refuse un second signalement du même visiteur", async () => {
      const published = vi
        .spyOn(professionalsRepository, "existsPublished")
        .mockResolvedValue(true);
      const exists = vi.spyOn(repository, "exists").mockResolvedValue(true);

      await expect(
        service.createReport(2, 7, { reason: "spam" }),
      ).rejects.toMatchObject({ status: 409 });

      published.mockRestore();
      exists.mockRestore();
    });

    it("traduit la violation d unicité en conflit", async () => {
      vi.spyOn(professionalsRepository, "existsPublished").mockResolvedValue(
        true,
      );
      vi.spyOn(repository, "exists").mockResolvedValue(false);
      const insert = vi
        .spyOn(repository, "create")
        .mockRejectedValue(
          Object.assign(new Error("duplicate"), { code: "23505" }),
        );

      await expect(
        service.createReport(2, 7, { reason: "spam" }),
      ).rejects.toMatchObject({ status: 409 });
      insert.mockRestore();
    });

    it("ne bloque pas le compte avant le seuil", async () => {
      vi.spyOn(professionalsRepository, "existsPublished").mockResolvedValue(
        true,
      );
      vi.spyOn(repository, "exists").mockResolvedValue(false);
      vi.spyOn(repository, "create").mockResolvedValue({ id: 100 });
      vi.spyOn(repository, "countSanctionable").mockResolvedValue(
        autoBlockThreshold() - 1,
      );
      const block = vi.spyOn(adminRepository, "setUserBlocked");

      const result = await service.createReport(2, 7, { reason: "spam" });

      expect(result.autoBlocked).toBe(false);
      expect(block).not.toHaveBeenCalled();
      block.mockRestore();
    });

    it("bloque le compte automatiquement au seuil de signalements", async () => {
      const threshold = autoBlockThreshold();
      vi.spyOn(professionalsRepository, "existsPublished").mockResolvedValue(
        true,
      );
      vi.spyOn(repository, "exists").mockResolvedValue(false);
      vi.spyOn(repository, "create").mockResolvedValue({ id: 200 });
      vi.spyOn(repository, "countSanctionable").mockResolvedValue(threshold);
      const block = vi
        .spyOn(adminRepository, "setUserBlocked")
        .mockResolvedValue({ id: 7, blockedAt: "now" });

      const result = await service.createReport(2, 7, { reason: "spam" });

      expect(result.autoBlocked).toBe(true);
      expect(result.reportCount).toBe(threshold);
      expect(block).toHaveBeenCalledWith(7, true);
      block.mockRestore();
    });

    it("ne bloque ni ne suspend si les seuils sont désactivés", async () => {
      const previousBlock = env.AUTO_BLOCK_REPORTS_THRESHOLD;
      const previousSuspend = env.AUTO_SUSPEND_REPORTS_THRESHOLD;
      env.AUTO_BLOCK_REPORTS_THRESHOLD = 0;
      env.AUTO_SUSPEND_REPORTS_THRESHOLD = 0;

      vi.spyOn(professionalsRepository, "existsPublished").mockResolvedValue(
        true,
      );
      vi.spyOn(repository, "exists").mockResolvedValue(false);
      vi.spyOn(repository, "create").mockResolvedValue({ id: 300 });
      vi.spyOn(repository, "countSanctionable").mockResolvedValue(99);
      const block = vi.spyOn(adminRepository, "setUserBlocked");
      const suspend = vi.spyOn(adminRepository, "setUserSuspended");

      const result = await service.createReport(2, 7, { reason: "spam" });

      expect(result.autoBlocked).toBe(false);
      expect(result.autoSuspended).toBe(false);
      expect(block).not.toHaveBeenCalled();
      expect(suspend).not.toHaveBeenCalled();

      env.AUTO_BLOCK_REPORTS_THRESHOLD = previousBlock;
      env.AUTO_SUSPEND_REPORTS_THRESHOLD = previousSuspend;
      block.mockRestore();
      suspend.mockRestore();
    });

    it("signale un signalement inexistant", async () => {
      const spy = vi.spyOn(repository, "setStatus").mockResolvedValue(null);

      await expect(
        service.setReportStatus(999, "resolved"),
      ).rejects.toMatchObject({ status: 404 });
      spy.mockRestore();
    });

    it("ne compte pas les signalements d’un professionnel au seuil de blocage", async () => {
      repository.targetRoleOf.mockImplementation(async (id) =>
        String(id) === "2" ? "professional" : "client",
      );

      vi.spyOn(professionalsRepository, "existsPublished").mockResolvedValue(
        true,
      );
      vi.spyOn(repository, "exists").mockResolvedValue(false);
      vi.spyOn(repository, "create").mockResolvedValue({ id: 400 });
      vi.spyOn(repository, "countSanctionable").mockResolvedValue(99);
      const block = vi.spyOn(adminRepository, "setUserBlocked");
      const suspend = vi.spyOn(adminRepository, "setUserSuspended");

      const result = await service.createReport(2, 7, { reason: "spam" });

      expect(result.autoBlocked).toBe(false);
      expect(result.autoSuspended).toBe(false);
      expect(block).not.toHaveBeenCalled();
      expect(suspend).not.toHaveBeenCalled();

      block.mockRestore();
      suspend.mockRestore();
    });

    it("accepte le signalement d’un professionnel sans le dévaloriser", async () => {
      repository.targetRoleOf.mockImplementation(async (id) =>
        String(id) === "2" ? "professional" : "client",
      );

      vi.spyOn(professionalsRepository, "existsPublished").mockResolvedValue(
        true,
      );
      vi.spyOn(repository, "exists").mockResolvedValue(false);
      vi.spyOn(repository, "create").mockResolvedValue({ id: 401 });
      vi.spyOn(repository, "countSanctionable").mockResolvedValue(0);

      const result = await service.createReport(2, 7, { reason: "spam" });

      expect(result.id).toBe(401);
      expect(result.targetRole).toBe("client");
    });
  });

  describe("signalement d’un correspondant", () => {
    it("exige une conversation réelle avec la cible", async () => {
      vi.spyOn(contactsRepository, "hasContactBetween").mockResolvedValue(
        false,
      );
      vi.spyOn(repository, "exists").mockResolvedValue(false);

      await expect(
        service.reportContact(2, 5, { reason: "spam" }),
      ).rejects.toMatchObject({ status: 404 });
    });

    it("refuse de se signaler soi-même", async () => {
      await expect(
        service.reportContact(2, 2, { reason: "spam" }),
      ).rejects.toMatchObject({ status: 403 });
    });

    it("enregistre le signalement contre un client", async () => {
      vi.spyOn(contactsRepository, "hasContactBetween").mockResolvedValue(true);
      vi.spyOn(repository, "exists").mockResolvedValue(false);
      vi.spyOn(repository, "targetRoleOf").mockImplementation(async (id) =>
        String(id) === "2" ? "professional" : "client",
      );
      vi.spyOn(repository, "create").mockResolvedValue({ id: 500 });
      vi.spyOn(repository, "countSanctionable").mockResolvedValue(1);
      const block = vi.spyOn(adminRepository, "setUserBlocked");

      const result = await service.reportContact(2, 5, {
        reason: "harassment",
      });

      expect(result.id).toBe(500);
      expect(result.targetRole).toBe("client");
      block.mockRestore();
    });
  });

  describe("signalement d’un avis", () => {
    it("refuse un avis qui n’est pas sur la fiche du demandeur", async () => {
      vi.spyOn(repository, "findReceivedReview").mockResolvedValue(null);

      await expect(
        service.reportReview(7, 42, { reason: "false" }),
      ).rejects.toMatchObject({ status: 404 });
    });

    it("refuse un second signalement du même avis", async () => {
      vi.spyOn(repository, "findReceivedReview").mockResolvedValue({
        id: 42,
        clientId: 3,
      });
      vi.spyOn(repository, "reviewReportExists").mockResolvedValue(true);

      await expect(
        service.reportReview(7, 42, { reason: "false" }),
      ).rejects.toMatchObject({ status: 409 });
    });

    it("n’applique aucun effet automatique", async () => {
      vi.spyOn(repository, "findReceivedReview").mockResolvedValue({
        id: 42,
        clientId: 3,
        rating: 1,
      });
      vi.spyOn(repository, "reviewReportExists").mockResolvedValue(false);
      vi.spyOn(repository, "createReviewReport").mockResolvedValue({ id: 600 });
      const block = vi.spyOn(adminRepository, "setUserBlocked");
      const suspend = vi.spyOn(adminRepository, "setUserSuspended");

      const result = await service.reportReview(7, 42, { reason: "false" });

      expect(result.id).toBe(600);
      expect(block).not.toHaveBeenCalled();
      expect(suspend).not.toHaveBeenCalled();

      block.mockRestore();
      suspend.mockRestore();
    });
  });

  describe("mocks", () => {
    it("enregistre un signalement et refuse les doublons", () => {
      const pro = MOCK_PROS[7];
      const created = mockReportProfessional({
        professionalId: pro.id,
        reporterId: 777,
        reason: "fraud",
      });

      expect(created).toMatchObject({
        professionalId: pro.id,
        reason: "fraud",
        status: "pending",
      });
      expect(created.professionalName).toBe(pro.displayName);
      expect(() =>
        mockReportProfessional({
          professionalId: pro.id,
          reporterId: 777,
          reason: "spam",
        }),
      ).toThrow();
    });

    it("refuse de signaler son propre profil et un profil inconnu", () => {
      const pro = MOCK_PROS[7];
      expect(() =>
        mockReportProfessional({
          professionalId: pro.id,
          reporterId: pro.id,
          reason: "spam",
        }),
      ).toThrow();
      expect(() =>
        mockReportProfessional({
          professionalId: 99999,
          reporterId: 777,
          reason: "spam",
        }),
      ).toThrow();
    });

    it("liste les signalements, filtre par statut et pagine", () => {
      const all = mockAdminReports({ pageSize: 50 });
      expect(all.total).toBeGreaterThan(0);
      expect(
        all.items.every(
          (g) => Array.isArray(g.reports) && g.reports.length === g.reportCount,
        ),
      ).toBe(true);
    });

    it("regroupe les signalements par professionnel", () => {
      const all = mockAdminReports({ pageSize: 50 });
      const ids = all.items.map((g) => String(g.professionalId));
      expect(new Set(ids).size).toBe(ids.length);
      all.items.forEach((g) => {
        expect(
          g.reports.every(
            (r) => String(r.professionalId) === String(g.professionalId),
          ),
        ).toBe(true);
        const pro = MOCK_PROS.find(
          (p) => String(p.id) === String(g.professionalId),
        );
        expect(g.professionalAvatarUrl).toBe(pro?.avatarUrl ?? null);
      });
    });

    it("remplace les signalements traités par les plus récents", () => {
      const before = mockAdminReports({ pageSize: 50 });
      expect(before.items[0].pendingCount).toBeGreaterThan(0);

      const target = before.items[0].reports[0];
      const updated = mockResolveReport(target.id, "dismissed");

      expect(updated.status).toBe("dismissed");
      expect(updated.resolvedAt).toBeTruthy();
      const after = mockAdminReports({ pageSize: 50 });
      const group = after.items.find(
        (g) =>
          String(g.professionalId) === String(before.items[0].professionalId),
      );
      expect(group.reports.find((r) => r.id === target.id).status).toBe(
        "dismissed",
      );
    });
  });
});
