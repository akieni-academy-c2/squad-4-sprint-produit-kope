import { useState } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Button, Sheet } from '@/shared/components/ui';

export function AdminFilterPanel({ title = 'Filtres', dirty = false, onReset, children }) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-2">
      <div className="flex items-center justify-between px-2 py-2">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty}
          className="text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          Réinitialiser
        </button>
      </div>
      {children}
    </div>
  );
}

export function AdminFilterGroup({ title, children }) {
  return (
    <div className="space-y-2 px-2 py-3">
      {title && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">{title}</p>
      )}
      {children}
    </div>
  );
}

export function AdminFilterField({ label, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-gray-600">{label}</label>}
      {children}
    </div>
  );
}

export function AdminSectionLayout({
  rightContainer = null,
  total = 0,
  noun,
  nounPlural,
  dirty = false,
  filters,
  searchId = 'admin-search',
  children,
}) {
  const [open, setOpen] = useState(false);
  const label = total > 1 && nounPlural ? nounPlural : noun;

  return (
    <div className="space-y-4">
      <div className="-mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500" aria-live="polite">
          {total} {label}
        </p>
        <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
          {dirty && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" aria-label="Filtres actifs" />
          )}
        </Button>
      </div>

      <div className="min-w-0">{children}</div>
      {rightContainer ? (
        createPortal(filters(searchId), rightContainer)
      ) : (
        <aside className="hidden lg:block lg:w-72 lg:shrink-0 lg:sticky lg:top-(--header-height)">
          {filters(searchId)}
        </aside>
      )}

      {/* Feuille par le bas : les filtres sont un réglage qu'on consulte et qu'on
          referme, pas un panneau qu'on parcourt. Sur le côté, ils occupaient la
          moitié de l'écran et repoussaient la liste hors de champ. */}
      <Sheet open={open} onOpenChange={setOpen} side="bottom">
        {/* Colonne flex et non bloc défilant : le bouton doit rester visible
            pendant qu'on fait défiler les filtres, sinon il sort du champ au
            premier groupe supplémentaire. `max-h` déduit des 2rem de `p-4` que
            la feuille pose déjà - le panneau est en `border-box`, son plafond
            les comprend. */}
        <div className="flex max-h-[calc(90dvh-2rem)] flex-col pt-10">
          <div className="w-full flex-1 overflow-y-auto">{filters(`${searchId}-mobile`)}</div>

          {/* Sans ce pied, fermer la feuille demandait de viser la croix en
              haut à droite : le geste de validation n'existait pas. */}
          <div className="shrink-0 border-t border-gray-100 pt-3">
            <Button variant="primary" size="md" className="w-full" onClick={() => setOpen(false)}>
              Appliquer
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
