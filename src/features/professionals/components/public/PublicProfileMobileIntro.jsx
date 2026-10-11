import { MapPin, Star } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { CITY, initialsOf } from './profileView.js';

/** En-tête et présentation « À propos » visibles uniquement sur mobile. */
export function PublicProfileMobileIntro({ profile, view }) {
  const { tradeName, zones, tags, avg, count, avatarSrc, localisation } = view;

  return (
    <div className="lg:hidden">
      <Card className="p-2">
        <div className="flex flex-col gap-5">
          <div className="relative w-full shrink-0">
            <div className="aspect-4/4 w-full overflow-hidden rounded-sm bg-gray-100">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={profile.displayName}
                  loading="lazy"
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
        <h2 className="text-xl font-bold text-gray-900">À propos de moi</h2>
        <Card className="space-y-4 border-none!">
          {profile.description && (
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{profile.description}</p>
          )}
          {zones.length > 0 && (
            <>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Zone d'intervention : </span>
              </p>
              <p className="space-x-2">{zones.map((zone) => <Badge key={zone}>{zone}</Badge>)}</p>
            </>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}