import { useState } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Sheet } from '@/shared/components/ui/Sheet.jsx';
import { cn } from '@/shared/utils';
import { STICKY_TOP } from '@/shared/lib/constants.js';

/**
 * Colonne de filtres d'une section de tableau de bord - espace client,
 * professionnel et administration.
 *
 * Les trois espaces partagent la même colonne de filtres et la même feuille
 * mobile. Ce composant existait en double (`AccountSectionLayout` et
 * `AdminSectionLayout`) : les deux copies avaient déjà divergé sur la largeur
 * de colonne et sur le repli sans portail.
 *
 * ## Le fond
 *
 * Il n'est **pas** ici, et c'est volontaire. Les tableaux de bord partagent le
 * fond pointillé (`bg-dots`) posé une fois par `RootLayout` sur la colonne
 * centrale. Encadrer chaque section d'une boîte grise donnait aux onglets un
 * fond différent de celui de la page - et deux motifs superposés là où un seul
 * était prévu.
 *
 * ## Les colonnes
 *
 * La navigation (gauche) et les filtres (droite) sont déclarés par la grille
 * de la page, pas ici : la section ne dessine donc pas sa propre colonne, elle
 * y projette ses filtres par portail. Deux grilles imbriquées donnaient des
 * largeurs de colonne incohérentes entre les sections et désalignaient les
 * deux barres collantes.
 */
export function SectionLayout({
  ariaLabel,
  rightContainer = null,
  searchId = 'section-search',
  filters,
  total,
  noun,
  nounPlural,
  dirty = false,
  /** Bouton pleine largeur plutôt qu'un simple libellé de compte. */
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
      className={fullWidthFilterButton ? 'w-full lg:hidden' : 'lg:hidden'}
      onClick={() => setOpen(true)}
      aria-label={`Ouvrir les filtres - ${ariaLabel ?? 'de la section'}`}
    >
      <SlidersHorizontal className="h-4 w-4" aria-hidden />
      Filtres
      {dirty && (
        // `sr-only` et non `aria-label` : un `aria-label` sur un `<span>` sans
        // rôle est ignoré par les lecteurs d'écran. La pastille est purely
        // décorative, le mot « filtres actifs » est ce qu'il faut annoncer.
        <>
          <span className="sr-only">- filtres actifs</span>
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary-500" />
        </>
      )}
    </Button>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Le bouton précède la liste : sur mobile il n'y a pas de colonne de
          filtres, un bouton placé sous la liste obligerait à tout faire
          défiler pour découvrir qu'on peut filtrer. */}
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

      {/* Sans portail - cas du rendu seul, hors page - la colonne est déclarée
          ici. La page la fournit dans tous les cas normaux. */}
      {rightContainer
        ? createPortal(filters(searchId), rightContainer)
        : (
          <aside className={`hidden ${STICKY_TOP} lg:block`}>
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