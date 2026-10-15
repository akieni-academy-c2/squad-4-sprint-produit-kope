import { useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/Button.jsx";
import { Sheet } from "@/shared/components/ui/Sheet.jsx";
import { cn } from "@/shared/utils";
import { STICKY_TOP } from "@/shared/lib/constants.js";

export function SectionLayout({
  ariaLabel,
  rightContainer = null,
  searchId = "section-search",
  filters,
  total,
  noun,
  nounPlural,
  dirty = false,

  fullWidthFilterButton = true,
  className,
  children,
}) {
  const [open, setOpen] = useState(false);

  const hasCount = total != null && (noun || nounPlural);
  const label = total > 1 && nounPlural ? nounPlural : noun;

  const filterButton = (
    <Button
      variant="secondary"
      size="sm"
      className={fullWidthFilterButton ? "w-full lg:hidden" : "lg:hidden"}
      onClick={() => setOpen(true)}
      aria-label={`Ouvrir les filtres - ${ariaLabel ?? "de la section"}`}
    >
      <SlidersHorizontal className="h-4 w-4" aria-hidden />
      Filtres
      {dirty && (
        <>
          <span className="sr-only">- filtres actifs</span>
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-primary-500"
          />
        </>
      )}
    </Button>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {hasCount ? (
        <div className="-mt-3 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500" aria-live="polite">
            {total} {label}
          </p>
          {filterButton}
        </div>
      ) : (
        filterButton
      )}

      <div className="min-w-0">{children}</div>

      {rightContainer ? (
        createPortal(filters(searchId), rightContainer)
      ) : (
        <aside className={`hidden ${STICKY_TOP} lg:block`}>
          {filters(searchId)}
        </aside>
      )}

      <Sheet open={open} onOpenChange={setOpen} side="bottom">
        <div className="flex max-h-[calc(90dvh-2rem)] flex-col pt-10">
          <div className="w-full flex-1 overflow-y-auto">
            {filters(`${searchId}-mobile`)}
          </div>

          <div className="shrink-0 border-t border-gray-100 pt-3">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
