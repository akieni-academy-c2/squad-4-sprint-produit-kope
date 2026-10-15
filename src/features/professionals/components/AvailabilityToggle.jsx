import { Clock } from "lucide-react";
import { Badge } from "@/shared/components/ui/Badge.jsx";
import { Card } from "@/shared/components/ui/Card.jsx";
import { cn } from "@/shared/utils";

export function AvailabilityToggle({ isAvailable = true, onChange, loading }) {
  const on = Boolean(isAvailable);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary-50 text-primary-500">
            <Clock size={18} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">
              Disponibilité
            </p>
            <p className="truncate text-xs text-gray-500">
              Statut visible sur votre fiche et en recherche
            </p>
          </div>
        </div>
        <Badge variant={on ? "success" : "warning"} size="md">
          {on ? "Disponible" : "Indisponible"}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm leading-6 text-gray-600">
          Les clients voient immédiatement votre statut et peuvent vous
          contacter.
        </p>
        <button
          type="button"
          role="switch"
          aria-label="Disponibilité"
          aria-checked={on}
          disabled={loading}
          onClick={() => onChange?.(!on)}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-ring disabled:opacity-50",
            on ? "bg-emerald-500" : "bg-gray-300",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
              on ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>
    </Card>
  );
}
