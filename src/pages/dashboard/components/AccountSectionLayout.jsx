import { useState } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Sheet } from '@/shared/components/ui/Sheet.jsx';

/**
 * Colonne de filtres du compte client.
 *
 * Même contrat que `AdminSectionLayout` de l'espace admin. La colonne de
 * gauche (navigation) et celle de droite (filtres) sont déclarées par la même
 * grille dans `ClientDashboardPage` : la section ne dessine donc pas sa propre
 * colonne, elle y projette ses filtres par portail. Deux grilles imbriquées
 * donnaient des largeurs de colonne incohérentes entre les sections et
 * désalignaient les deux barres sticky.
 */
export function AccountSectionLayout({ ariaLabel, rightContainer = null, searchId = 'account-search', filters, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Le bouton précède la liste : sur mobile, il n'y a pas de colonne de
          filtres, donc un bouton placé sous la liste obligerait à faire défiler
          toute la liste pour découvrir qu'on peut la filtrer. */}
      <Button
        variant="secondary"
        size="sm"
        className="w-full lg:hidden"
        onClick={() => setOpen(true)}
        aria-label={`Ouvrir les filtres — ${ariaLabel}`}
      >
        <SlidersHorizontal size={16} aria-hidden />
        Filtres
      </Button>

      <div className="min-w-0">{children}</div>

      {/* Sans portail — cas du rendu seul, hors page — la colonne est
          déclarée ici. La page la fournit dans tous les cas normaux. */}
      {rightContainer
        ? createPortal(filters(searchId), rightContainer)
        : (
          <aside className="hidden lg:sticky lg:top-23 lg:block">
            {filters(searchId)}
          </aside>
        )}

      {/* Feuille par le bas : les filtres sont un réglage qu'on consulte et
          qu'on referme, pas un panneau qu'on parcourt. Sur le côté, ils
          occupaient la moitié de l'écran et repoussaient la liste hors de
          champ — à l'inverse du tiroir de navigation, qu'on laisse ouvert. */}
      <Sheet open={open} onOpenChange={setOpen} side="bottom">
        {/* Colonne flex et non bloc défilant : le bouton doit rester visible
            pendant qu'on fait défiler les filtres, sinon il sort du champ au
            premier groupe supplémentaire. `max-h` déduit des 2rem de `p-4` que
            la feuille pose déjà — le panneau est en `border-box`, son plafond
            les comprend. */}
        <div className="flex max-h-[calc(90dvh-2rem)] flex-col pt-10">
          <div className="w-full flex-1 overflow-y-auto">
            {filters(`${searchId}-mobile`)}
          </div>

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