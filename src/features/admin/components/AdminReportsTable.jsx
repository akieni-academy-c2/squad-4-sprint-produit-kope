import { useCallback, useState } from "react";
import {
  CustomSelect,
  DataState,
  Pagination,
  SearchInput,
} from "@/shared/components/ui";
import {
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from "./AdminSectionLayout.jsx";
import { ReportGroup } from "./reports/ReportGroup.jsx";
import { ReportModals } from "./reports/ReportModals.jsx";
import { useAdminPage } from "../hooks/useAdminPage.js";
import { useAdminFilters } from "../hooks/useAdminFilters.js";
import { useAdminList } from "../hooks/useAdminList.js";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { useNotification } from "@/shared/context/NotificationContext.jsx";
import {
  listReports,
  setReportStatus,
  setUserBlocked,
  setUserSuspended,
} from "../services/admin.service.js";
import { REPORT_STATUS_OPTIONS } from "@/shared/constants/reports.js";

const PAGE_SIZE = 20;

export function AdminReportsTable({
  rightContainer = null,
  initialFilters = {},
}) {
  const { user: currentUser } = useAuthContext();
  const { toast } = useNotification();
  const [page, changePage, setPage] = useAdminPage();
  const [confirm, setConfirm] = useState(null);
  const [unblock, setUnblock] = useState(null);
  const [unsuspend, setUnsuspend] = useState(null);
  const [saving, setSaving] = useState(false);
  const { draft, applied, dirty, set, submit, reset } = useAdminFilters({
    query: "",
    status: "",
    ...initialFilters,
  });

  const fetchList = useCallback(
    () =>
      listReports({
        page,
        pageSize: PAGE_SIZE,
        status: applied.status || undefined,
        query: applied.query,
      }),
    [page, applied.status, applied.query],
  );
  const { data, loading, error, reload } = useAdminList(fetchList);

  const apply = async () => {
    if (!confirm) return;
    try {
      await setReportStatus(
        confirm.item.id,
        confirm.action === "resolve" ? "resolved" : "dismissed",
      );
      toast({
        message:
          confirm.action === "resolve"
            ? "Signalement marqué comme traité."
            : "Signalement rejeté.",
        type: "success",
      });
      setConfirm(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || "Erreur.", type: "error" });
    }
  };

  const applyUnblock = async () => {
    if (!unblock) return;
    setSaving(true);
    try {
      await setUserBlocked(currentUser?.id, unblock.id, false);
      toast({ message: "Compte débloqué.", type: "success" });
      setUnblock(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || "Erreur.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const applyUnsuspend = async () => {
    if (!unsuspend) return;
    setSaving(true);
    try {
      await setUserSuspended(currentUser?.id, unsuspend.id, false);
      toast({
        message: "Suspension levée, le compte est à nouveau actif.",
        type: "success",
      });
      setUnsuspend(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || "Erreur.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const applyFilters = () => {
    setPage(1);
    submit();
  };

  const resetFilters = () => {
    reset();
    setPage(1);
  };

  const total = Number(data?.total || 0);
  const groups = data?.items || [];

  const renderFilters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={applyFilters} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={draft.query}
            onChange={(e) => set("query", e.target.value)}
            onClear={() => set("query", "")}
            placeholder="Professionnel, auteur ou contenu..."
            aria-label="Rechercher un signalement"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Statut">
          <CustomSelect
            value={draft.status}
            onChange={(v) => {
              set("status", v, { immediate: true });
              setPage(1);
            }}
            options={REPORT_STATUS_OPTIONS}
            className="w-full"
            aria-label="Filtrer par statut"
          />
        </AdminFilterGroup>
      </form>
    </AdminFilterPanel>
  );

  const list = (
    <DataState loading={loading} error={error}>
      <>
        <ul className="space-y-3">
          {groups.length === 0 ? (
            <li className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Aucun signalement.
            </li>
          ) : (
            groups.map((group) => (
              <ReportGroup
                key={group.professionalId}
                group={group}
                onResolveReport={(item) =>
                  setConfirm({ item, action: "resolve" })
                }
                onDismissReport={(item) =>
                  setConfirm({ item, action: "dismiss" })
                }
                onUnblock={({ professionalId, professionalName }) =>
                  setUnblock({ id: professionalId, name: professionalName })
                }
                onUnsuspend={({ professionalId, professionalName }) =>
                  setUnsuspend({ id: professionalId, name: professionalName })
                }
              />
            ))
          )}
        </ul>

        <Pagination
          page={Number(data?.page || page)}
          pageSize={Number(data?.pageSize || PAGE_SIZE)}
          total={total}
          onPageChange={changePage}
          variant="summary"
          className="mt-4"
        />
      </>
    </DataState>
  );

  return (
    <AdminSectionLayout
      rightContainer={rightContainer}
      total={total}
      noun="Signalement"
      nounPlural="Signalements"
      dirty={dirty}
      filters={renderFilters}
      searchId="rep-search"
    >
      {list}

      <ReportModals
        confirm={confirm}
        onCancelConfirm={() => setConfirm(null)}
        onConfirmReport={apply}
        unblock={unblock}
        onCancelUnblock={() => setUnblock(null)}
        onConfirmUnblock={applyUnblock}
        unsuspend={unsuspend}
        onCancelUnsuspend={() => setUnsuspend(null)}
        onConfirmUnsuspend={applyUnsuspend}
        saving={saving}
      />
    </AdminSectionLayout>
  );
}
