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
import { AdminConfirmModal } from "./AdminConfirmModal.jsx";
import { AdminUserRow } from "./users/AdminUserRow.jsx";
import { CreateAdminForm } from "./users/CreateAdminForm.jsx";
import {
  BLOCKED_OPTIONS,
  EMPTY_ADMIN,
  ROLE_OPTIONS,
  toAdminPayload,
  validateAdminDraft,
} from "./users/adminUserOptions.js";
import { useAdminPage } from "../hooks/useAdminPage.js";
import { useAdminFilters } from "../hooks/useAdminFilters.js";
import { useAdminList } from "../hooks/useAdminList.js";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { useNotification } from "@/shared/context/NotificationContext.jsx";
import {
  createAdmin,
  listUsers,
  setUserBlocked,
} from "../services/admin.service.js";

const PAGE_SIZE = 100;

export function AdminUsersTable({
  rightContainer = null,
  initialFilters = {},
}) {
  const { user: currentUser } = useAuthContext();
  const { toast } = useNotification();
  const [page, changePage, setPage] = useAdminPage();
  const { draft, applied, dirty, set, submit, reset } = useAdminFilters({
    query: "",
    role: "",
    blocked: "",
    ...initialFilters,
  });

  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(null);
  const [formError, setFormError] = useState("");

  const fetchList = useCallback(
    () =>
      listUsers({
        page,
        pageSize: PAGE_SIZE,
        role: applied.role,
        query: applied.query,
        blocked:
          applied.blocked === "" ? undefined : applied.blocked === "true",
      }),
    [page, applied.role, applied.query, applied.blocked],
  );
  const { data, loading, error, reload } = useAdminList(fetchList);

  const applyFilters = () => {
    setPage(1);
    submit();
  };

  const resetFilters = () => {
    reset();
    setPage(1);
  };

  const total = Number(data?.total || 0);
  const users = data?.items || [];

  const applyBlock = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      await setUserBlocked(currentUser?.id, confirm.target.id, confirm.blocked);
      toast({
        message: confirm.blocked
          ? "Utilisateur bloqué."
          : "Utilisateur débloqué.",
        type: "success",
      });
      setConfirm(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || "Erreur.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const submitAdmin = async (e) => {
    e.preventDefault();
    if (!creating) return;
    const invalid = validateAdminDraft(creating);
    if (invalid) {
      setFormError(invalid);
      return;
    }
    setFormError("");
    setSaving(true);
    try {
      await createAdmin(toAdminPayload(creating));
      toast({ message: "Administrateur créé.", type: "success" });
      setCreating(null);
      reload();
    } catch (err) {
      setFormError(err?.message || "Erreur.");
    } finally {
      setSaving(false);
    }
  };

  const closeCreateForm = () => {
    setCreating(null);
    setFormError("");
  };

  const renderFilters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={applyFilters} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={draft.query}
            onChange={(e) => set("query", e.target.value)}
            onClear={() => set("query", "")}
            placeholder="Nom ou téléphone..."
            aria-label="Rechercher un utilisateur"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Rôle">
          <CustomSelect
            value={draft.role}
            onChange={(v) => {
              set("role", v, { immediate: true });
              setPage(1);
            }}
            options={ROLE_OPTIONS}
            className="w-full"
            aria-label="Filtrer par rôle"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Statut">
          <CustomSelect
            value={draft.blocked}
            onChange={(v) => {
              set("blocked", v, { immediate: true });
              setPage(1);
            }}
            options={BLOCKED_OPTIONS}
            className="w-full"
            aria-label="Filtrer par statut de blocage"
          />
        </AdminFilterGroup>
      </form>
    </AdminFilterPanel>
  );

  const list = (
    <DataState loading={loading} error={error}>
      <>
        {users.length === 0 ? (
          <ul className="space-y-3">
            <li className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Aucun utilisateur.
            </li>
          </ul>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <AdminUserRow
                key={user.id}
                user={user}
                isSelf={currentUser?.id === user.id}
                onToggleBlock={(target, blocked) =>
                  setConfirm({ target, blocked })
                }
              />
            ))}
          </ul>
        )}

        <Pagination
          page={Number(data?.page || page)}
          pageSize={Number(data?.pageSize || PAGE_SIZE)}
          total={total}
          onPageChange={changePage}
          variant="summary"
          className="mt-4 bg-white py-2 px-4 rounded-md border border-gray-200"
        />

        <CreateAdminForm
          draft={creating}
          error={formError}
          saving={saving}
          onChange={(key, value) =>
            setCreating((prev) => ({ ...prev, [key]: value }))
          }
          onSubmit={submitAdmin}
          onOpen={() => setCreating(EMPTY_ADMIN)}
          onCancel={closeCreateForm}
        />
      </>
    </DataState>
  );

  return (
    <AdminSectionLayout
      rightContainer={rightContainer}
      total={total}
      noun="Utilisateur"
      dirty={dirty}
      filters={renderFilters}
      searchId="usr-search"
    >
      {list}

      <AdminConfirmModal
        open={Boolean(confirm)}
        onCancel={() => setConfirm(null)}
        onConfirm={applyBlock}
        saving={saving}
        danger={confirm?.blocked}
        title={
          confirm?.blocked
            ? "Bloquer cet utilisateur ?"
            : "Débloquer cet utilisateur ?"
        }
        description={
          confirm?.blocked
            ? "Son compte ne pourra plus se connecter et ses sessions seront fermées immédiatement."
            : "L’utilisateur pourra de nouveau se connecter à la plateforme."
        }
        confirmLabel={confirm?.blocked ? "Bloquer" : "Débloquer"}
      />
    </AdminSectionLayout>
  );
}
