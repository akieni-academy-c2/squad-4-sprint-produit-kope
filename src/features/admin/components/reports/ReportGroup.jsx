import { Link } from "@/shared/components/ui/Link.jsx";
import { Check } from "lucide-react";
import { Button, Tooltip, UserAvatar } from "@/shared/components/ui";
import { ROUTES } from "@/shared/lib/constants.js";
import { ReportRow } from "./ReportRow.jsx";

export function ReportGroup({
  group,
  onResolveReport,
  onDismissReport,
  onUnblock,
  onUnsuspend,
}) {
  const {
    professionalId,
    professionalName,
    professionalSuspendedAt,
    professionalBlockedAt,
  } = group;

  return (
    <li
      className={`overflow-hidden rounded-lg border bg-white ${
        group.pendingCount > 0 ? "border-amber-200" : "border-gray-200"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href={ROUTES.PROFESSIONAL(professionalId)}
            className="shrink-0 rounded-full transition hover:opacity-80"
            aria-label={`Voir la fiche publique de ${professionalName || `professionnel #${professionalId}`}`}
          >
            <UserAvatar
              src={group.professionalAvatarUrl}
              name={professionalName}
              className="h-8 w-8"
              iconSize={14}
            />
          </Link>
          <Link
            href={ROUTES.PROFESSIONAL(professionalId)}
            className="truncate text-sm font-bold text-gray-900 transition hover:text-primary-700 hover:underline"
          >
            {professionalName || `Pro #${professionalId}`}
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {professionalSuspendedAt && (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white">
              Suspendu
            </span>
          )}
          {professionalBlockedAt && !professionalSuspendedAt && (
            <>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                Compte bloqué
              </span>
              <Tooltip content="Débloquer ce compte">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-primary-600 hover:bg-mint-100"
                  onClick={() => onUnblock(group)}
                  aria-label={`Débloquer le compte de ${professionalName}`}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </>
          )}
          {professionalSuspendedAt && (
            <Tooltip content="Lever la suspension">
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-primary-600 hover:bg-mint-100"
                onClick={() => onUnsuspend(group)}
                aria-label={`Lever la suspension de ${professionalName}`}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
          )}
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
            {group.reportCount} signalement{group.reportCount > 1 ? "s" : ""}
          </span>
          {group.pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
              {group.pendingCount} en attente
            </span>
          )}
        </div>
      </div>

      <ul className="space-y-2 p-3">
        {(group.reports || []).map((report) => (
          <ReportRow
            key={report.id}
            report={report}
            onResolve={onResolveReport}
            onDismiss={onDismissReport}
          />
        ))}
      </ul>
    </li>
  );
}
