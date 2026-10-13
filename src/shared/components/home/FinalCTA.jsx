import { Link } from '@/shared/components/ui/Link.jsx';
import { Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { ROUTES } from '@/shared/lib/constants.js';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-kop-mint py-8 lg:py-16">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMid slice" fill="none">
        <circle cx="80" cy="40" r="60" fill="#2d5c4a" opacity="0.05" />
        <circle cx="1360" cy="280" r="80" fill="#2d5c4a" opacity="0.05" />
        <rect x="200" y="210" width="60" height="60" rx="14" transform="rotate(18 230 240)" fill="#2d5c4a" opacity="0.07" />
        <rect x="1180" y="60" width="54" height="54" rx="12" transform="rotate(-14 1207 87)" fill="#2d5c4a" opacity="0.07" />
        <polygon points="660,230 720,160 780,230" fill="#2d5c4a" opacity="0.06" />
        <circle cx="700" cy="60" r="22" fill="none" stroke="#2d5c4a" strokeWidth="6" opacity="0.1" />
        <circle cx="420" cy="70" r="12" fill="#2d5c4a" opacity="0.1" />
        <polygon points="1240,230 1275,244 1248,264" fill="#2d5c4a" opacity="0.1" />
        <path d="M90 250 Q145 220 200 245" stroke="#2d5c4a" strokeWidth="5" opacity="0.1" />
        <circle cx="320" cy="260" r="18" fill="none" stroke="#2d5c4a" strokeWidth="5" opacity="0.09" />
        <rect x="620" y="40" width="28" height="28" rx="8" transform="rotate(28 634 54)" fill="#2d5c4a" opacity="0.08" />
        <rect x="880" y="240" width="40" height="40" rx="10" transform="rotate(-22 900 260)" fill="none" stroke="#2d5c4a" strokeWidth="4" opacity="0.1" />
        <polygon points="220,110 280,110 250,152" fill="#2d5c4a" opacity="0.06" transform="rotate(-16 250 131)" />
        <circle cx="1010" cy="60" r="9" fill="#2d5c4a" opacity="0.12" />
        <circle cx="540" cy="40" r="6" fill="none" stroke="#2d5c4a" strokeWidth="4" opacity="0.12" />
        <path d="M1120 60 q28 -20 56 0 q28 20 56 0" stroke="#2d5c4a" strokeWidth="5" opacity="0.09" />
        <rect x="460" y="250" width="22" height="22" rx="6" transform="rotate(40 471 261)" fill="#2d5c4a" opacity="0.09" />
        <polygon points="1300,80 1340,80 1320,118" fill="none" stroke="#2d5c4a" strokeWidth="4" opacity="0.09" transform="rotate(18 1320 99)" />
      </svg>
      <div className="container-kop relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Un projet en tête ? Le quartier a du talent.
          </h2>
          <p className="mt-2 text-sm leading-7 text-gray-700">
            Commencez par trouver le bon professionnel.
          </p>
        </div>
        <Button as={Link} href={ROUTES.SEARCH} size="lg">
          Trouver un professionnel <Search size={16} aria-hidden className="inline" />
        </Button>
      </div>
    </section>
  )
}
