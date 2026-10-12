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
        <aside className="hidden lg:block lg:w-72 lg:shrink-0 lg:sticky lg:top-23">
          {filters(searchId)}
        </aside>
      )}

      {/* Feuille par le bas : les filtres sont un réglage qu'on consulte et qu'on
          referme, pas un panneau qu'on parcourt. Sur le côté, ils occupaient la
          moitié de l'écran et repoussaient la liste hors de champ. */}
      <Sheet open={open} onOpenChange={setOpen} side="bottom">
        {/* pt-10 : le panneau applique déjà `p-4` et le bouton de fermeture descend
            jusqu'à 52px du bord haut. On complète jusqu'à 56px pour que le
            bouton « Réinitialiser » passe dessous sans être recouvert. */}
        <div className="w-full overflow-y-auto pt-10">{filters(`${searchId}-mobile`)}</div>
      </Sheet>
    </div>
  );
}
