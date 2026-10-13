import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { SearchFilters } from '../components/SearchFilters.jsx';
import { SearchRefineFilters } from '../components/SearchRefineFilters.jsx';
import { Sheet } from '@/shared/components/ui/Sheet.jsx';
import { SearchResults } from '../components/SearchResults.jsx';
import { SearchActionBar } from '../components/SearchActionBar.jsx';
import { useSearch } from '../hooks/useSearch.js';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { usePageTitle } from '@/shared/hooks/usePageTitle.js';

export function SearchPage() {
  usePageTitle('Rechercher un professionnel');
  const [params, setParams] = useSearchParams();
  const { trade, zone, city, page, q, available, minRating, minExperience } = Object.fromEntries(params.entries());
  const [sort, setSort] = useState(params.get('sort') || 'recommended');
  const { results, loading, error, refresh } = useSearch({
    trade,
    zone,
    city,
    q,
    available,
    minRating,
    minExperience,
    page,
    sort,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const onChangeSort = (val) => {
    setSort(val);
    const next = new URLSearchParams(params);
    if (val && val !== 'recommended') next.set('sort', val); else next.delete('sort');
    next.set('page', '1');
    setParams(next);
  };

  const refineDirty = Boolean(available || minRating || minExperience);

  const onRefineChange = (patch) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      const empty = value === '' || value == null;
      if (empty) next.delete(key);
      else next.set(key, String(value));
    }
    next.set('page', '1');
    setParams(next);
  };

  const resetRefine = () => {
    const next = new URLSearchParams(params);
    next.delete('available');
    next.delete('minRating');
    next.delete('minExperience');
    next.set('page', '1');
    setParams(next);
  };

  // Propriétés communes aux deux rendus : le panneau est affiché deux fois,
  // en colonne fixe sur desktop et dans le Sheet sur mobile. Seul le second
  // reçoit la fermeture, l'autre n'a rien à fermer.
  const refineProps = {
    available: available ?? '',
    minRating: minRating ?? '',
    minExperience: minExperience ?? '',
    sort,
    onChange: onRefineChange,
    onSortChange: onChangeSort,
    onReset: resetRefine,
    dirty: refineDirty,
  };

  return (
    <div>
      {/* pb-20 : la barre fixe mesure 64px (48px de bouton + 8px de marge
          interne), plus l'espace sûr de l'iPhone. pb-24 laissait 32px
          d'inutile sous la pagination sur mobile ; 80px suffisent à ce que
          la dernière page reste atteignable sans coller à la barre.
          lg:pb-8 la désactive sur desktop, où la barre est masquée. */}
      <div className="container-kop page-padding pb-20 lg:pb-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(0,280px)] lg:items-start">
          <aside className="hidden lg:block lg:sticky lg:top-(--header-height) space-y-4">
            <SearchFilters variant="sidebar" initial={{ trade, zone, city, keyword: q }} searching={loading} />
          </aside>

          <section className="min-w-0 space-y-5">
            {/* Titre conservé mais invisible : la page a besoin d'un `h1` pour
                les lecteurs d'écran et le référencement, sans ajouter de
                bandeau qui répète ce que dit déjà la barre de recherche. */}
            <h1 className="sr-only">
              {trade || zone || city ? 'Professionnels' : 'Trouver un professionnel'}
            </h1>

            {/* Compteur seul : l'accès aux filtres est porté par la barre fixe
                du bas, sur toute la hauteur de la page. Un bouton ici le
                doublait et disparaissait dès le premier défilement. */}
            {results?.total > 0 && (
              <div>
                <p className="text-md font-semibold uppercase tracking-[0.12em]">
                  {results?.total ?? 0} Résultats
                </p>
                <p className="text-xs">
                  Disponibles d'abord, puis note et date de mise à jour décroissantes.
                </p>
              </div>
            )}

            {loading && (
              <div className="space-y-4" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-4 rounded-[20px] border border-gray-100 bg-white p-4">
                    <Skeleton className="h-24 w-28 shrink-0 rounded-[16px]" />
                    <div className="flex-1 space-y-3 py-1">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {error && !loading && (
              <DataState
                error={error}
                errorPrefix="Erreur de chargement des résultats"
                onRetry={refresh}
              />
            )}
            {!loading && !error && (
              <SearchResults data={results} listMode />
            )}
          </section>

          <aside className="hidden lg:block lg:sticky lg:top-(--header-height) space-y-4">
            <SearchRefineFilters {...refineProps} />
          </aside>
        </div>

        {/* Sur mobile, les deux surfaces de la page sont atteintes par la barre
            fixe du bas : le champ de recherche (colonne de gauche sur desktop)
            et l'icône de filtres (colonne de droite). Le bouton flottant
            « Rechercher » qui les ouvrait toutes les deux est retiré. */}
        <SearchActionBar
          onSearchClick={() => setSearchOpen(true)}
          onFiltersClick={() => setFiltersOpen(true)}
          keyword={q ?? ''}
          filtersActive={refineDirty}
          total={results?.total ?? 0}
        />

        {/* Les deux feuilles se referment sur validation : les résultats sont à
            jour derrière, le panneau n'a plus rien à apporter et il masque
            la liste qu'on vient de mettre à jour. */}
        <Sheet open={searchOpen} onOpenChange={setSearchOpen} side="bottom">
          <div className="space-y-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900">Recherche</h2>
            <SearchFilters
              variant="sheet"
              initial={{ trade, zone, city, keyword: q }}
              searching={loading}
              onApply={() => setSearchOpen(false)}
            />
          </div>
        </Sheet>

        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen} side="bottom">
          <div className="space-y-4 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
            <SearchRefineFilters {...refineProps} onApply={() => setFiltersOpen(false)} />
          </div>
        </Sheet>
      </div>
    </div>
  );
}
