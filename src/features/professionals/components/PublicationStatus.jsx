import { BadgeCheck, TriangleAlert } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge.jsx";
import { Card } from "@/shared/components/ui/Card.jsx";
import {
  PROFILE_STATUS,
  PROFILE_STATUS_LABELS,
  RG04_CHECKLIST,
} from "@/shared/lib/constants.js";

const VARIANT = {
  [PROFILE_STATUS.PUBLISHED]: "success",
  [PROFILE_STATUS.INCOMPLETE]: "warning",
  [PROFILE_STATUS.HIDDEN]: "danger",
};

function MissingChecklist({ missing }) {
  if (!missing?.length) return null;
  const items = missing.map((m) => ({
    label:
      m.label || RG04_CHECKLIST.find((r) => r.code === m.code)?.label || m.code,
  }));
  return (
    <div className="mt-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        À compléter
      </p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-sm border border-amber-200/70 bg-amber-50 px-3 py-2 text-amber-800"
          >
            <TriangleAlert size={15} className="mt-0.5 shrink-0" aria-hidden />
            <span>{it.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublicationStatus({
  status = PROFILE_STATUS.INCOMPLETE,
  missing = [],
}) {
  const variant = VARIANT[status] || "neutral";
  const label = PROFILE_STATUS_LABELS[status] || status;
  const desc =
    {
      [PROFILE_STATUS.PUBLISHED]:
        "Votre profil apparaît dans les recherches clients.",
      [PROFILE_STATUS.INCOMPLETE]:
        "Ajoutez les éléments manquants pour apparaître dans les recherches.",
      [PROFILE_STATUS.HIDDEN]:
        "Votre profil a été masqué par un administrateur. Contactez le support pour plus d'informations.",
    }[status] || "";
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary-50 text-primary-500">
            <BadgeCheck size={18} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">
              Statut de publication
            </p>
            <p className="truncate text-xs text-gray-500">
              Visibilité de votre fiche dans les recherches
            </p>
          </div>
        </div>
        <Badge variant={variant} size="md">
          {label}
        </Badge>
      </div>
      {(desc || missing?.length > 0) && (
        <div className="p-5">
          {desc && <p className="text-sm leading-6 text-gray-600">{desc}</p>}
          <MissingChecklist missing={missing} />
        </div>
      )}
    </Card>
  );
}
