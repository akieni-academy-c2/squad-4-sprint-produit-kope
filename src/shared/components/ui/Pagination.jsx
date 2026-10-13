import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/shared/utils';

/**
 * Habillage de la barre de pagination.
 *
 * Exporté plutôt que recopié : la barre est posée sur le fond de la page, pas
 * sur une carte, et sans ce bandeau elle flotte sans contour au milieu du
 * contenu. La même valeur est reprise par la recherche, l'espace client,
 * l'espace professionnel et l'administration — une copie divergerait au
 * premier ajustement.
 */
export const PAGINATION_BAR = 'mt-4 rounded-md border border-gray-100 bg-white px-4 py-2';

function getButtons(current, totalPages) {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages]);
  for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i += 1)
    pages.add(i);
  return Array.from(pages).sort((a, b) => a - b);
}

export function Pagination({ page, pageSize, total, onPageChange, className, variant = 'numbers' }) {
  const pageCount = Math.max(1, Math.ceil((total ?? 0) / pageSize));
  const current = Math.max(1, Math.min(page || 1, pageCount));
  const prevDisabled = current <= 1;
  const nextDisabled = current >= pageCount;
  const pages = getButtons(current, pageCount);

  if (variant === 'summary')
    return (
      <nav
        role="navigation"
        aria-label="Pagination"
        className={cn('flex w-full items-center justify-between gap-3', className)}
      >
        <p className="text-sm text-gray-500">
          {pageCount} page{pageCount > 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={prevDisabled}
            onClick={() => onPageChange?.(current - 1)}
            aria-label="Page précédente"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-gray-200 bg-white text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-300',
            )}
          >
            <ChevronLeft size={16} aria-hidden />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {current} / {pageCount}
          </span>
          <button
            type="button"
            disabled={nextDisabled}
            onClick={() => onPageChange?.(current + 1)}
            aria-label="Page suivante"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-gray-200 bg-white text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:text-gray-300',
            )}
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      </nav>
    );

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex w-full items-center justify-center gap-1 sm:gap-2', className)}
    >
      <button
        type="button"
        aria-label="Page précédente"
        disabled={prevDisabled}
        onClick={() => onPageChange?.(current - 1)}
        className={cn(
          'inline-flex h-9 items-center justify-center gap-1 rounded-[8px] border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        <ChevronLeft size={16} aria-hidden />
        <span className="hidden sm:inline">Précédent</span>
      </button>

      {pages.map((p, i) => {
        const isLast = i === pages.length - 1;
        const showEllipsis = !isLast && p !== current && pages[i + 1] - p > 1;
        return (
          <span key={p} className="inline-flex items-center">
            <button
              type="button"
              onClick={() => onPageChange?.(p)}
              aria-current={p === current ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center rounded-[8px] border text-sm font-semibold transition-colors',
                p === current
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
              )}
            >
              {p}
            </button>
            {showEllipsis && (
              <span className="inline-flex h-9 w-9 items-center justify-center text-gray-500" aria-hidden>
                <MoreHorizontal size={16} />
              </span>
            )}
          </span>
        );
      })}

      <button
        type="button"
        aria-label="Page suivante"
        disabled={nextDisabled}
        onClick={() => onPageChange?.(current + 1)}
        className={cn(
          'inline-flex h-9 items-center justify-center gap-1 rounded-[8px] border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  );
}
