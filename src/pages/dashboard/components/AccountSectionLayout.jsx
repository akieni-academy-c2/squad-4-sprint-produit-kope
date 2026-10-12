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
        {/* pt-10 : le panneau applique déjà `p-4`, le bouton de fermeture descend
            jusqu'à 52px du bord haut. On complète jusqu'à 56px pour que son
            en-tête passe dessous sans le toucher. Le `p-4` de la feuille par
            le bas remplace celui que portait cette div sur la feuille latérale. */}
        <div className="w-full overflow-y-auto pt-10">{filters(`${searchId}-mobile`)}</div>
      </Sheet>
    </div>
  );
}