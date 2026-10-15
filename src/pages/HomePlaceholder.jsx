import { SearchFilters } from "@/features/search/components/SearchFilters.jsx";
import { Skeleton } from "@/shared/components/ui/Skeleton.jsx";

/**
 * Équivalent de `HeroSection` en attente, aux mêmes dimensions : sans cela, le
 * chargement de la page d'accueil fait sauter la mise en page, ce qui se voit
 * surtout sur mobile.
 *
 * Seule la barre de recherche est rendue pour de vrai - elle n'attend aucune
 * donnée pour s'afficher - afin qu'elle soit identique avant et après. Le reste
 * est en blocs, car le contenu n'existe pas encore.
 * @returns {import("react").ReactElement} le hero en attente
 */
export function HomePlaceholder() {
  return (
    <section
      aria-busy="true"
      aria-label="Chargement de la page d'accueil"
      className="relative overflow-hidden bg-kop-mint space-y-8 py-8 lg:py-16"
    >
      <div className="container-kop relative z-10 grid gap-8 lg:gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-11 w-full sm:h-14 lg:h-14" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <div className="mt-8 hidden flex-wrap gap-2 sm:flex">
            <Skeleton className="h-9 w-44 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-130">
          <Skeleton className="h-85 sm:h-100 w-full rounded-[16px]" />
        </div>
      </div>

      <aside className="container-kop relative -space-y-px z-10">
        <p className="bg-[#F5F6F6] rounded-t-sm border border-[#B9C2BE] border-b-transparent px-4 py-2 inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
          Recherche par mot-clé
        </p>
        <div className="bg-white rounded-r-[16px] rounded-bl-[16px] border border-[#B9C2BE] p-3 sm:p-5">
          <SearchFilters variant="home" />
        </div>
      </aside>

      <p className="container-kop relative z-10 -mt-4 text-[11px] text-gray-500">
        Une recherche simple : un métier, un quartier, puis une rencontre.
      </p>
    </section>
  );
}
