import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { SectionHeader } from '@/shared/components/sections/SectionHeader.jsx';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { ProfessionalCard } from '@/features/professionals/components/ProfessionalCard.jsx';
import { searchProfessionals } from '@/features/search/services/search.service.js';
import { useAsyncData } from '@/shared/hooks/useAsyncData.js';
import { ROUTES } from '@/shared/lib/constants.js';

const HIGHLIGHT_COUNT = 3;

export function FeaturedProfessionalSection() {
  const { data, loading, error, reload } = useAsyncData(
    () => searchProfessionals({ page: 1 }),
    [],
  );

  const professionals = data?.items?.slice(0, HIGHLIGHT_COUNT) ?? [];

  return (
    <section className="bg-[#CDD0D8] py-8 lg:py-16">
      <div className="container-kop">
        <SectionHeader
          eyebrow="Faites connaissance"
          title="Des visages derrière chaque métier."
          intro="Une fuite, un mur à repeindre, une idée à concrétiser ? Rencontrez les professionnels de votre quartier et échangez directement avec eux."
        >
          <Button as={Link} to={ROUTES.SEARCH} variant="outline" size="md" className="bg-transparent! border-gray-400!">
            Explorer les professionnels <ArrowRight size={16} aria-hidden className="inline" />
          </Button>
        </SectionHeader>
      </div>

      {error ? (
        <div className="container-kop">
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="container-kop grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: HIGHLIGHT_COUNT }, (_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))
            : professionals.map((professional) => (
                <div key={professional.id} className="flex h-full flex-col">
                  <ProfessionalCard mode="grid" item={professional} homePreview />
                </div>
              ))}
        </div>
      )}
      {error && (
        <div className="container-kop mt-4">
          <Button variant="ghost" onClick={reload}>
            Réessayer
          </Button>
        </div>
      )}
    </section>
  );
}