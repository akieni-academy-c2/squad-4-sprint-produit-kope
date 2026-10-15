import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/shared/utils";

export function SearchActionBar({
  onSearchClick,
  onFiltersClick,
  keyword = "",
  filtersActive = false,
  total,
}) {
  return (
    <nav
      aria-label="Recherche et filtres"
      className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="container-kop flex items-center gap-2 py-2">
        <button
          type="button"
          onClick={onSearchClick}
          aria-haspopup="dialog"
          className="flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 text-left text-sm text-gray-500 backdrop-blur-sm transition hover:border-gray-300 hover:bg-white focus-ring"
        >
          <Search size={18} aria-hidden className="shrink-0 text-gray-400" />
          <span
            className={cn(
              "truncate",
              keyword ? "text-gray-800" : "text-gray-400",
            )}
          >
            {keyword || "Recherche"}
          </span>
          {total > 0 && (
            <span className="ml-auto shrink-0 text-xs font-semibold text-gray-400">
              {total}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onFiltersClick}
          aria-haspopup="dialog"
          aria-label="Ouvrir les filtres"
          className="relative inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-700 backdrop-blur-sm transition hover:border-gray-300 hover:bg-white hover:text-gray-900 focus-ring"
        >
          <SlidersHorizontal size={20} aria-hidden />
          {filtersActive && (
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary-500">
              <span className="sr-only">Filtres actifs</span>
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
