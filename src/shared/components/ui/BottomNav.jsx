import { useState } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Sheet } from './Sheet.jsx';

/**
 * Plafond de cinq cellules, bouton « Menu » compris : à six, une icône se ferait
 * écraser sur un mobile de 360 px.
 */
const MAX_CELLS = 5;

export function BottomNav({ items, active, onChange, ariaLabel }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const hasOverflow = items.length > MAX_CELLS;
  // Le « Menu » occupe une cellule : on le compte avant de choisir combien de
  // destinations laisser visibles.
  const visibleCount = hasOverflow ? MAX_CELLS - 1 : items.length;
  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);
  const overflowActive = overflowItems.some((item) => item.id === active);

  const select = (id) => {
    onChange(id);
    setMenuOpen(false);
  };

  return (
    <>
      <nav
        aria-label={ariaLabel}
        className="fixed inset-x-0 bottom-0   z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] backdrop-blur-sm lg:hidden"
      >
        <ul className="flex">
          {visibleItems.map(({ id, label, shortLabel, icon: Icon, isAction }) => (
            <li key={id} className="min-w-0 flex-1">
              <button
                type="button"
                // Ce sont des boutons de navigation, pas des onglets ARIA : `aria-current`
                // est le signal correct, il n'y a pas de tabpanel ici. Une
                // entrée `isAction` ouvre une fenêtre : la page n'a pas changé
                // de section, l'annoncer comme active serait faux.
                aria-current={!isAction && active === id ? 'page' : undefined}
                onClick={() => onChange(id)}
                className={cn(
                  // `text-[10px]` : cinq cellules sur un mobile de 360 px donnent ~72 px par
                  // icône, « Professionnels » dans l'espace admin ne tient pas
                  // au-dessus.
                  'flex w-full cursor-pointer flex-col items-center gap-1 px-0.5 py-2.5 text-[10px] font-semibold transition',
                  !isAction && active === id
                    ? 'bg-primary-50 text-primary-500'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon size={20} aria-hidden />
                <span className="w-full truncate text-center">{shortLabel || label}</span>
              </button>
            </li>
          ))}
          {hasOverflow && (
            <li className="min-w-0 flex-1">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center gap-1 px-0.5 py-2.5 text-[10px] font-semibold transition',
                  overflowActive
                    ? 'bg-primary-50 text-primary-500'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Menu size={20} aria-hidden />
                <span className="w-full truncate text-center">Menu</span>
              </button>
            </li>
          )}
        </ul>
      </nav>

      {hasOverflow && (
        <Sheet open={menuOpen} onOpenChange={setMenuOpen} side="bottom">
          <p className="mb-3 pr-10 text-sm font-bold uppercase tracking-[0.08em] text-gray-500">
            Sections supplémentaires
          </p>
          <ul className="flex flex-col gap-1">
            {overflowItems.map(({ id, label, icon: Icon, isAction }) => (
              <li key={id}>
                <button
                  type="button"
                  aria-current={!isAction && active === id ? 'page' : undefined}
                  onClick={() => select(id)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition',
                    !isAction && active === id
                      ? 'bg-primary-50 text-primary-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <Icon size={18} aria-hidden className="shrink-0 text-gray-400" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </>
  );
}
