import { Star, MessageSquarePlus } from "lucide-react";
import { StarRating } from "@/shared/components/ui/StarRating.jsx";

const CTA_CLASS =
  "flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-primary-300 hover:bg-primary-50";

function LeaveReviewButton({ onClick, label, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${CTA_CLASS} ${className}`}
    >
      <MessageSquarePlus size={16} aria-hidden />
      {label}
    </button>
  );
}

export function RatingSummary({ rating, canReview = false, onLeaveReview }) {
  const count = Number(rating?.count ?? 0);
  const avg = Number(rating?.average ?? 0);
  const showCta = canReview && onLeaveReview;

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
        <h2 className="text-sm font-bold text-gray-900">Note moyenne</h2>
        {count > 0 && (
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
            {count} avis
          </span>
        )}
      </div>

      {count > 0 ? (
        <>
          <div className="flex items-center gap-4 p-4">
            <p className="text-4xl font-extrabold leading-none tracking-tight text-gray-900">
              {avg.toFixed(1)}
            </p>
            <div className="min-w-0 space-y-1">
              <StarRating value={avg} size="md" />
              <p className="text-xs text-gray-500">
                Basé sur{" "}
                <span className="font-semibold text-gray-700">{count}</span>{" "}
                avis
              </p>
            </div>
          </div>
          {showCta && (
            <div className="border-t border-gray-100 p-3">
              <LeaveReviewButton
                onClick={onLeaveReview}
                label="Donner mon avis"
              />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3 p-4 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary-50">
            <Star size={22} className="text-primary-400" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Pas encore d'avis
          </p>
          <p className="mx-auto max-w-[26ch] text-sm leading-6 text-gray-500">
            Soyez le premier à donner votre avis sur ce professionnel.
          </p>
          {showCta && (
            <LeaveReviewButton
              onClick={onLeaveReview}
              label="Donner mon avis"
              className="mt-1"
            />
          )}
        </div>
      )}
    </div>
  );
}
