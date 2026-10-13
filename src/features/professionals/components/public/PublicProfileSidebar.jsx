import { Briefcase, Calendar, MapPin, MapPinned, Star } from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { Separator } from '@/shared/components/ui/Separator.jsx';
import { formatDateFr } from '@/shared/utils';
import { ReportTrigger } from '../ReportDialog.jsx';
import { CITY, initialsOf } from './profileView.js';
import { STICKY_TOP } from '@/shared/lib/constants.js';

function Avatar({ src, name, alt = '', wrapperClassName, fallbackClassName }) {
  return (
    <div className={`shrink-0 overflow-hidden bg-gray-100 ${wrapperClassName}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <span className={`flex h-full w-full items-center justify-center font-extrabold text-primary-700 ${fallbackClassName}`}>
          {initialsOf(name)}
        </span>
      )}
    </div>
  );
}

export function PublicProfileSidebar({ profile, view, isVisitorView, onReportClick }) {
  const { tradeName, zones, tags, avg, count, avatarSrc } = view;

  return (
    <aside className="hidden min-w-0 space-y-6 lg:block lg:self-stretch">
      <Card className="space-y-3.5 p-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={avatarSrc}
            name={profile.displayName}
            alt={profile.displayName}
            wrapperClassName="h-16 w-16 rounded-md"
            fallbackClassName="text-xl"
          />

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={profile.isAvailable ? 'success' : 'warning'} size="sm">
                {profile.isAvailable ? 'Disponible' : 'Indisponible'}
              </Badge>
            </div>
            <div className="min-w-0 space-y-0.5">
              <h2 className="truncate text-base font-bold leading-tight tracking-tight text-gray-900">
                {profile.displayName}
              </h2>
              <p className="truncate text-xs font-medium text-primary-700">
                {tradeName} à {CITY}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <dl className="space-y-2 text-sm">
          {profile.yearsExperience != null && (
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <Briefcase size={14} className="shrink-0 text-gray-400" aria-hidden />
                Expérience
              </dt>
              <dd className="font-semibold text-gray-900">
                {profile.yearsExperience} an{profile.yearsExperience > 1 ? 's' : ''}
              </dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-gray-500">
              <Star size={14} className="shrink-0 text-gray-400" aria-hidden />
              Note moyenne
            </dt>
            <dd className="font-semibold text-gray-900">
              {count > 0 ? (
                <span className="inline-flex items-center gap-1">
                  {avg.toFixed(1)}
                  <span className="font-normal text-gray-400">/ 5</span>
                  <span className="text-xs font-normal text-gray-500">({count})</span>
                </span>
              ) : (
                <span className="font-normal text-gray-500">Aucun avis</span>
              )}
            </dd>
          </div>
          {zones.length > 0 && (
            <>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-gray-500">
                  <MapPin size={14} className="shrink-0 text-gray-400" aria-hidden />
                  Ville
                </dt>
                <dd className="truncate font-semibold text-gray-900">{CITY}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-gray-500">
                  <MapPinned size={14} className="shrink-0 text-gray-400" aria-hidden />
                  Zones
                </dt>
                <dd className="truncate font-semibold text-gray-900" title={zones.join(', ')}>
                  {zones[0]}
                  {zones.length > 1 && (
                    <span className="font-medium text-gray-500"> +{zones.length - 1}</span>
                  )}
                </dd>
              </div>
            </>
          )}
        </dl>
      </Card>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3 px-1">
          <h2 className="text-sm font-bold text-gray-900">À propos</h2>
          {profile.createdAt && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={13} className="shrink-0" aria-hidden />
              {formatDateFr(profile.createdAt)}
            </span>
          )}
        </div>
        <Card className="space-y-4 p-4 bg-primary-100!">
          {profile.description && (
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">{profile.description}</p>
          )}
          {(zones.length > 0 || tags.length > 0) && <Separator />}
          {zones.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Zones d'intervention</p>
              <div className="flex flex-wrap gap-1.5">
                {zones.map((zone) => (
                  <Badge key={zone} variant="neutral" size="sm">
                    <MapPin size={11} aria-hidden />
                    {zone}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {tags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Spécialités</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </section>

      <Card className={`hidden items-center gap-3 p-3 ${STICKY_TOP} lg:flex`}>
        <Avatar
          src={avatarSrc}
          name={profile.displayName}
          wrapperClassName="h-10 w-10 rounded-full"
          fallbackClassName="text-sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">{profile.displayName}</p>
          <p className="truncate text-xs text-gray-500">{tradeName}</p>
        </div>
        <div className="shrink-0 text-right">
          {count > 0 && (
            <p className="inline-flex items-center gap-1 text-sm font-bold text-gray-900">
              <Star size={13} className="fill-amber-400 text-amber-400" aria-hidden />
              {avg.toFixed(1)}
            </p>
          )}
          <p className="text-[11px] text-gray-400">
            {count > 0 ? `${count} avis` : profile.isAvailable ? 'Disponible' : 'Indisponible'}
          </p>
        </div>
      </Card>

      {isVisitorView && (
        <div className="hidden lg:block">
          <ReportTrigger onClick={onReportClick} />
        </div>
      )}
    </aside>
  );
}