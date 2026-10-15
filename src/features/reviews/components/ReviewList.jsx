import { useCallback, useState } from "react";
import { Pagination } from "@/shared/components/ui/Pagination.jsx";
import { Card } from "@/shared/components/ui/Card.jsx";
import { DataState } from "@/shared/components/ui/DataState.jsx";
import { EmptyState } from "@/shared/components/ui/EmptyState.jsx";
import { StarRating } from "@/shared/components/ui/StarRating.jsx";
import { useAsyncData } from "@/shared/hooks/useAsyncData.js";
import { PAGE_SIZE } from "@/shared/lib/constants.js";
import { formatDateFr } from "@/shared/utils";
import { listReviews } from "../services/reviews.service.js";
import { ReviewAuthor } from "./ReviewAuthor.jsx";

export function ReviewList({ professionalId }) {
  const [page, setPage] = useState(1);

  const load = useCallback(
    () => listReviews(professionalId, { page, pageSize: PAGE_SIZE }),
    [professionalId, page],
  );
  const { data, loading, error } = useAsyncData(load, [professionalId, page]);

  if (loading || error)
    return (
      <DataState
        loading={loading}
        error={error}
        errorPrefix="Impossible de charger les avis"
      />
    );

  const total = Number(data?.total ?? 0);
  const items = data?.items ?? [];

  if (items.length === 0)
    return <EmptyState title="Aucun avis pour le moment." />;

  return (
    <div className="space-y-4">
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id}>
            <Card className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ReviewAuthor review={r} />
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} size="sm" />
                  <span className="text-xs text-gray-500">
                    {formatDateFr(r.createdAt)}
                  </span>
                </div>
              </div>
              {r.comment && (
                <p className="line-clamp-4 whitespace-pre-wrap text-[15px] leading-7 text-gray-700">
                  {r.comment}
                </p>
              )}
            </Card>
          </li>
        ))}
      </ul>
      {total > PAGE_SIZE && (
        <Pagination
          page={Number(data?.page || page)}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
