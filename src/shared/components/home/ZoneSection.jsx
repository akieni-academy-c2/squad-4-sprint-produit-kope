import { Link } from '@/shared/components/ui/Link.jsx';
import { ArrowUpRight } from 'lucide-react';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { ROUTES } from '@/shared/lib/constants.js';

export function ZoneSection() {
  const { zones, loading: loadingZones } = useReferenceData();
  return (
    <section className="container-kop py-8 lg:py-16">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Ici, à côté</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Votre quartier, leurs savoir-faire.
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            Affichez par zone ou explorez toute la ville pour élargir vos possibilités.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 w-full">
          {loadingZones ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
            ))
          ) : (
            zones.map((z, index) => (
              <Link
                key={z.id}
                href={`${ROUTES.SEARCH}?zone=${encodeURIComponent(z.id)}`}
                hidden={index >= 6}
                className="flex items-center justify-between rounded-sm border border-gray-200 bg-white p-3  font-semibold text-gray-800  hover:bg-primary-50 hover:text-primary-700 transition group"
              >
                <span>{z.name}</span>
                <ArrowUpRight size={16} aria-hidden className="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-primary-500" />
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
