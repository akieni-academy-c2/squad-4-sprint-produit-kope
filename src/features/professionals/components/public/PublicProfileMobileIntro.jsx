import { MapPin, Star } from 'lucide-react';
import { Link } from '@/shared/components/ui/Link.jsx';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery.js';
import { ROUTES } from '@/shared/lib/constants.js';
import { ABOUT_FALLBACK, ABOUT_HEADING, CITY, initialsOf } from './profileView.js';
import { TagList } from './TagList.jsx';

export function PublicProfileMobileIntro({ profile, view, breadcrumbTrade }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { tradeName, zones, tags, avg, count, avatarSrc, localisation, hasAbout } = view;

  // Version jumeelle de PublicProfileSidebar : un seul des deux est monté, voir
  // le commentaire de garde posé là-bas.
  if (isDesktop) return null;

  return (
    <div>
      <nav aria-label="Fil d'Ariane" className="mb-3 px-2 text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={ROUTES.SEARCH} className="text-primary-700">Recherche</Link>
          </li>
          <li aria-hidden>»</li>
          <li>
            <Link href={ROUTES.SEARCH} className="text-primary-700">{breadcrumbTrade}</Link>
          </li>
          <li aria-hidden>»</li>
          <li aria-current="page" className="truncate font-semibold text-gray-900">
            {profile.displayName}
          </li>
        </ol>
      </nav>

      <Card className="p-2">
        <div className="flex flex-col gap-5">
          <div className="relative w-full shrink-0">
            <div className="aspect-4/4 w-full overflow-hidden rounded-sm bg-gray-100">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={profile.displayName}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-primary-700">
                  {initialsOf(profile.displayName)}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-2.5">
            <Badge variant={profile.isAvailable ? 'success' : 'warning'}>
              {profile.isAvailable ? 'Disponible' : 'Indisponible'}
            </Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              {profile.displayName}
            </h2>
            <p className="font-semibold text-primary-700">{tradeName} à {CITY}</p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-700">
              {profile.yearsExperience != null && (
                <span>
                  {profile.yearsExperience} an{profile.yearsExperience > 1 ? 's' : ''} d'expérience
                </span>
              )}
              {profile.yearsExperience != null && <span aria-hidden>•</span>}
              {count > 0 && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                  <Star size={15} className="fill-amber-400 text-amber-400" aria-hidden />
                  {avg.toFixed(1)} sur 5 - {count} avis
                </span>
              )}
            </p>
            {zones.length > 0 && (
              <p className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin size={15} className="shrink-0" aria-hidden /> {localisation}
              </p>
            )}
          </div>
        </div>
      </Card>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{ABOUT_HEADING}</h2>
        {hasAbout ? (
          <Card className="space-y-4 border-none! bg-transparent!">
            {profile.description && (
              <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{profile.description}</p>
            )}
            {zones.length > 0 && (
              <>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Zone d'intervention : </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {zones.map((zone) => (
                    <Badge key={zone} variant="neutral" size="sm">
                      {zone}
                    </Badge>
                  ))}
                </div>
              </>
            )}
            {tags.length > 0 && <TagList tags={tags} />}
          </Card>
        ) : (
          <p className="text-sm text-gray-500">{ABOUT_FALLBACK}</p>
        )}
      </section>
    </div>
  );
}