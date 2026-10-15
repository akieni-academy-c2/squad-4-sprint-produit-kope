import { useMemo, useState } from "react";
import { useAsyncData } from "@/shared/hooks/useAsyncData.js";
import { CustomSelect } from "@/shared/components/ui/CustomSelect.jsx";
import { SearchInput } from "@/shared/components/ui/SearchInput.jsx";
import { DataState } from "@/shared/components/ui/DataState.jsx";
import { EmptyState } from "@/shared/components/ui/EmptyState.jsx";
import { Skeleton } from "@/shared/components/ui/Skeleton.jsx";
import { useNotification } from "@/shared/context/NotificationContext.jsx";
import { fullNameInitials } from "@/shared/utils";
import { REVIEW_REPORT_REASON_OPTIONS } from "@/shared/constants/reports.js";
import { listReviews } from "../services/reviews.service.js";
import {
  deleteReview,
  getMyReviews,
  setReviewVisibility,
} from "../services/reviews.service.js";
import { reportReview } from "@/features/reports/services/reports.service.js";
import { ReportDialog } from "@/features/reports/components/ReportDialog.jsx";
import { ReviewCard } from "./ReviewCard.jsx";
import { ReviewForm } from "./ReviewForm.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog.jsx";
import { AccountSectionLayout } from "@/pages/dashboard/components/AccountSectionLayout.jsx";
import {
  AdminFilterGroup,
  AdminFilterPanel,
} from "@/features/admin/components/AdminSectionLayout.jsx";
import { Pagination } from "@/shared/components/ui/Pagination.jsx";

const RATING_OPTIONS = [
  { value: "", label: "Toutes les notes" },
  { value: "5", label: "5 étoiles" },
  { value: "4", label: "4 étoiles" },
  { value: "3", label: "3 étoiles" },
  { value: "2", label: "2 étoiles" },
  { value: "1", label: "1 étoile" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Du plus récent" },
  { value: "oldest", label: "Du plus ancien" },
  { value: "rating_desc", label: "Meilleures notes" },
  { value: "rating_asc", label: "Notes les plus basses" },
];

const SORTERS = {
  recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  rating_desc: (a, b) =>
    b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt),
  rating_asc: (a, b) =>
    a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt),
};

const FETCH_LIMIT = 100;

const clientName = (review) =>
  review.client?.displayName ||
  fullNameInitials(review.client?.firstName, review.client?.lastName) ||
  "Client";

function ReviewBlock({
  title,
  loading,
  error,
  onRetry,
  isEmpty,
  emptyTitle,
  emptyDescription,
  notice,
  pagination,
  children,
}) {
  const items = Array.isArray(children) ? children : [children];

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-bold uppercase tracking-[0.08em] text-gray-500">
        {title}
      </h4>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <DataState error={error} onRetry={onRetry} />
      ) : isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <ul className="space-y-3">
            {items.filter(Boolean).map((child) => (
              <li key={child.key}>{child}</li>
            ))}
          </ul>
          {notice}
          {pagination}
        </>
      )}
    </section>
  );
}

const ORIGIN_OPTIONS = [
  { value: "all", label: "Tous les avis" },
  { value: "recus", label: "Avis reçus" },
  { value: "donnes", label: "Avis donnés" },
];

const PAGE_SIZE = 10;

const MERGE_LIMIT = 100;

export function ProReviewsSection({ professionalId, rightContainer = null }) {
  const { toast } = useNotification();

  const [q, setQ] = useState("");
  const [rating, setRating] = useState("");
  const [sort, setSort] = useState("recent");
  const [origin, setOrigin] = useState("all");
  const [page, setPage] = useState(1);
  const [givenReload, setGivenReload] = useState(0);
  const [reportingId, setReportingId] = useState(null);
  const [reportedIds, setReportedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const received = useAsyncData(async () => {
    if (!professionalId) return null;
    return listReviews(professionalId, { pageSize: FETCH_LIMIT });
  }, [professionalId]);

  const given = useAsyncData(
    () =>
      getMyReviews({
        ...(origin === "donnes"
          ? { page, pageSize: PAGE_SIZE }
          : { pageSize: MERGE_LIMIT }),
        sort,
        ...(q ? { q } : {}),
        ...(rating ? { rating } : {}),
      }),
    [page, origin, sort, q, rating, givenReload],
  );

  const dirty = Boolean(q || rating || sort !== "recent" || origin !== "all");

  const resetFilters = () => {
    setQ("");
    setRating("");
    setSort("recent");
    setOrigin("all");
  };

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const receivedItems = useMemo(
    () => received.data?.items ?? [],
    [received.data],
  );
  const truncated = receivedItems.length >= FETCH_LIMIT;

  const givenItems = useMemo(() => given.data?.items ?? [], [given.data]);
  const givenTotal = given.data?.total ?? 0;

  const filteredReceived = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let rows = needle
      ? receivedItems.filter(
          (r) =>
            clientName(r).toLowerCase().includes(needle) ||
            (r.comment || "").toLowerCase().includes(needle),
        )
      : receivedItems;

    if (rating) rows = rows.filter((r) => String(r.rating) === rating);

    return [...rows].sort(SORTERS[sort] ?? SORTERS.recent);
  }, [receivedItems, q, rating, sort]);

  const merged = useMemo(() => {
    if (origin !== "all") return [];
    const rows = [
      ...filteredReceived.map((r) => ({ ...r, kind: "recus" })),
      ...givenItems.map((r) => ({ ...r, kind: "donnes" })),
    ];
    return rows.sort(SORTERS.recent);
  }, [origin, filteredReceived, givenItems]);

  const visibleReceived = useMemo(
    () =>
      origin === "recus"
        ? filteredReceived.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        : [],
    [origin, filteredReceived, page],
  );

  const visibleGiven = useMemo(
    () => (origin === "donnes" ? givenItems : []),
    [origin, givenItems],
  );

  const visibleMerged = useMemo(
    () =>
      origin === "all"
        ? merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        : [],
    [origin, merged, page],
  );

  const editing = givenItems.find((r) => r.id === editingId) ?? null;

  const refreshGiven = () => setGivenReload((n) => n + 1);

  const toggleHidden = async (review) => {
    setPendingId(review.id);
    try {
      await setReviewVisibility(review.id, !review.isHidden);
      toast({
        message: review.isHidden
          ? "Avis réaffiché."
          : "Avis masqué de la fiche publique.",
        type: "success",
      });
      refreshGiven();
    } catch (err) {
      toast({ message: err?.message || "Action impossible.", type: "error" });
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (review) => {
    setPendingId(review.id);
    try {
      await deleteReview(review.id);
      toast({ message: "Avis supprimé.", type: "success" });
      refreshGiven();
    } catch (err) {
      toast({
        message: err?.message || "Suppression impossible.",
        type: "error",
      });
    } finally {
      setPendingId(null);
    }
  };

  const filters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <div className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={q}
            onChange={(e) => changeFilter(setQ)(e.target.value)}
            onClear={() => changeFilter(setQ)("")}
            placeholder="Professionnel ou client..."
            aria-label="Rechercher dans mes avis"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Origine">
          <CustomSelect
            value={origin}
            onChange={changeFilter(setOrigin)}
            options={ORIGIN_OPTIONS}
            className="w-full"
            aria-label="Origine des avis"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Note">
          <CustomSelect
            value={rating}
            onChange={changeFilter(setRating)}
            options={RATING_OPTIONS}
            className="w-full"
            aria-label="Filtrer par note"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Trier par">
          <CustomSelect
            value={sort}
            onChange={changeFilter(setSort)}
            options={SORT_OPTIONS}
            className="w-full"
            aria-label="Trier les avis"
          />
        </AdminFilterGroup>
      </div>
    </AdminFilterPanel>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900">Mes avis</h3>

      <AccountSectionLayout
        ariaLabel="de mes avis"
        rightContainer={rightContainer}
        searchId="pro-reviews-search"
        filters={filters}
      >
        <div className="space-y-4">
          {origin === "all" ? (
            <ReviewBlock
              loading={received.loading || given.loading}
              error={received.error ?? given.error}
              onRetry={() => {
                received.reload();
                given.reload();
              }}
              isEmpty={visibleMerged.length === 0}
              emptyTitle={dirty ? "Aucun avis ne correspond" : "Aucun avis"}
              emptyDescription={
                dirty
                  ? "Aucun avis ne correspond à ces filtres."
                  : "Les avis reçus et déposés apparaîtront ici."
              }
              notice={
                truncated && merged.length > PAGE_SIZE ? (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Seuls les {FETCH_LIMIT} avis reçus les plus récents sont
                    chargés : la recherche et le tri portent sur cette portion.
                  </p>
                ) : null
              }
              pagination={
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={merged.length}
                  onPageChange={setPage}
                  variant="summary"
                />
              }
            >
              {visibleMerged.map((review) =>
                review.kind === "recus" ? (
                  <ReviewCard
                    key={review.id}
                    id={review.id}
                    name={clientName(review)}
                    avatarUrl={review.client?.avatarUrl}
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.createdAt}
                    reported={reportedIds.includes(review.id)}
                    onReport={() => setReportingId(review.id)}
                  />
                ) : (
                  <ReviewCard
                    key={review.id}
                    id={review.id}
                    name={review.professionalName}
                    avatarUrl={review.professionalAvatarUrl}
                    tradeName={review.professionalTrade}
                    rating={review.rating}
                    comment={review.comment}
                    createdAt={review.createdAt}
                    isHidden={review.isHidden}
                    pending={pendingId === review.id}
                    onEdit={() => setEditingId(review.id)}
                    onToggleHidden={() => toggleHidden(review)}
                    onDelete={() => remove(review)}
                  />
                ),
              )}
            </ReviewBlock>
          ) : (
            <>
              {origin === "recus" && (
                <ReviewBlock
                  loading={received.loading}
                  error={received.error}
                  onRetry={received.reload}
                  isEmpty={visibleReceived.length === 0}
                  emptyTitle={
                    dirty ? "Aucun avis ne correspond" : "Aucun avis reçu"
                  }
                  emptyDescription={
                    dirty
                      ? "Aucun avis reçu ne correspond à ces filtres."
                      : "Les avis laissés par vos clients apparaîtront ici."
                  }
                  notice={
                    truncated && filteredReceived.length > PAGE_SIZE ? (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Seuls les {FETCH_LIMIT} avis les plus récents sont
                        chargés : la recherche et le tri portent sur cette
                        portion.
                      </p>
                    ) : null
                  }
                  pagination={
                    <Pagination
                      page={page}
                      pageSize={PAGE_SIZE}
                      total={filteredReceived.length}
                      onPageChange={setPage}
                      variant="summary"
                    />
                  }
                >
                  {visibleReceived.map((review) => (
                    <ReviewCard
                      key={review.id}
                      id={review.id}
                      name={clientName(review)}
                      avatarUrl={review.client?.avatarUrl}
                      rating={review.rating}
                      comment={review.comment}
                      createdAt={review.createdAt}
                      reported={reportedIds.includes(review.id)}
                      onReport={() => setReportingId(review.id)}
                    />
                  ))}
                </ReviewBlock>
              )}

              {origin === "donnes" && (
                <ReviewBlock
                  loading={given.loading}
                  error={given.error}
                  onRetry={given.reload}
                  isEmpty={visibleGiven.length === 0}
                  emptyTitle={
                    dirty ? "Aucun avis ne correspond" : "Aucun avis déposé"
                  }
                  emptyDescription={
                    dirty
                      ? "Aucun avis déposé ne correspond à ces filtres."
                      : "Les avis que vous laissez aux autres professionnels apparaîtront ici."
                  }
                  pagination={
                    <Pagination
                      page={given.data?.page ?? 1}
                      pageSize={PAGE_SIZE}
                      total={givenTotal}
                      onPageChange={setPage}
                      variant="summary"
                    />
                  }
                >
                  {visibleGiven.map((review) => (
                    <ReviewCard
                      key={review.id}
                      id={review.id}
                      name={review.professionalName}
                      avatarUrl={review.professionalAvatarUrl}
                      tradeName={review.professionalTrade}
                      rating={review.rating}
                      comment={review.comment}
                      createdAt={review.createdAt}
                      isHidden={review.isHidden}
                      pending={pendingId === review.id}
                      onEdit={() => setEditingId(review.id)}
                      onToggleHidden={() => toggleHidden(review)}
                      onDelete={() => remove(review)}
                    />
                  ))}
                </ReviewBlock>
              )}
            </>
          )}
        </div>
      </AccountSectionLayout>

      <ReportDialog
        open={reportingId != null}
        onClose={() => setReportingId(null)}
        title="Signaler cet avis"
        description="Votre signalement est transmis à l’administration."
        reasonOptions={REVIEW_REPORT_REASON_OPTIONS}
        reasonLabel="Motif du signalement"
        reasonHelp="Le motif aide l’administration à traiter le signalement."
        notice="L’avis reste visible en attendant la décision. Seul un administrateur peut le retirer."
        successMessage="Avis signalé. Merci."
        submitLabel="Signaler cet avis"
        submit={async (payload) => {
          const id = reportingId;
          await reportReview(id, payload);
          setReportedIds((prev) => [...prev, id]);
        }}
      />

      <Dialog
        open={editingId != null}
        onOpenChange={(o) => !o && setEditingId(null)}
      >
        <DialogContent
          className="max-w-2xl p-5"
          onClose={() => setEditingId(null)}
        >
          <DialogHeader>
            <DialogTitle>Modifier mon avis</DialogTitle>
            <DialogDescription>{editing?.professionalName}</DialogDescription>
          </DialogHeader>
          {editing && (
            <ReviewForm
              review={editing}
              professionalId={editing.professionalId}
              onSuccess={() => {
                setEditingId(null);
                refreshGiven();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
