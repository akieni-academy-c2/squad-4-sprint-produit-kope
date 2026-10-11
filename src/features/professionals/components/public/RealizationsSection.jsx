import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { ImageWithSkeleton } from '@/shared/components/ui/ImageWithSkeleton.jsx';
import { formatDateFr, truncate } from '@/shared/utils';
import { ROUTES } from '@/shared/lib/constants.js';

const VISIBLE_PHOTOS = 6;

export function RealizationsSection({ photos, displayName, tradeName, localisation, breadcrumbTrade, onOpenPhoto }) {
  return (
    <section className="space-y-6">
      <section className="space-y-4">
        <nav aria-label="Fil d'Ariane" className="text-sm text-gray-500 pb-4 pt-2 border-b border-gray-200">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to={ROUTES.SEARCH} className=" text-primary-700">Recherche</Link>
            </li>
            <li aria-hidden>»</li>
            <li>
              <Link to={ROUTES.SEARCH} className=" text-primary-700">{breadcrumbTrade}</Link>
            </li>
            <li aria-hidden>»</li>
            <li aria-current="page" className="font-semibold text-gray-900">{displayName}</li>
          </ol>
        </nav>

        <h3 className="text-base font-bold text-gray-900">
          Quelques réalisations{' '}
          <span className="text-sm font-semibold text-gray-500">({photos.length})</span>
        </h3>

        {photos.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-gray-500">Aucune réalisation pour le moment.</p>
          </Card>
        ) : (
          <>
            <ul className="space-y-4">
              {photos.map((photo, index) => {
                const title = photo.title || photo.caption;
                const captionLine1 = `${tradeName} - ${title || 'Réalisation'}`;
                const captionLine2 = [localisation, photo.description].filter(Boolean).join(' • ');
                return (
                  <li key={photo.id ?? index}>
                    <button
                      type="button"
                      onClick={() => onOpenPhoto(index)}
                      aria-label={`Ouvrir la photo ${index + 1}`}
                      className="group block w-full overflow-hidden rounded-sm border border-gray-200 bg-white text-left transition hover:border-primary-200 hover:shadow-sm focus-ring"
                    >
                      <ImageWithSkeleton
                          src={photo.thumbUrl || photo.url}
                          alt={title || 'Réalisation'}
                          ratio="aspect-[4/3]"
                          skeletonClassName="bg-gray-100"
                          className="transition duration-500 group-hover:scale-[1.02]"
                        />
                      <div className="space-y-1 p-4">
                        <p className="text-sm font-bold text-gray-900">{truncate(captionLine1, 90)}</p>
                        {captionLine2 && (
                          <p className="text-sm leading-6 text-gray-600">{truncate(captionLine2, 180)}</p>
                        )}
                        {photo.createdAt && (
                          <p className="flex items-center gap-1.5 pt-1 text-xs text-gray-400">
                            <Calendar size={13} className="shrink-0" aria-hidden />
                            Publié le {formatDateFr(photo.createdAt)}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            {photos.length > VISIBLE_PHOTOS && (
              <Button variant="secondary" className="mt-4" onClick={() => onOpenPhoto(VISIBLE_PHOTOS)}>
                Voir plus
              </Button>
            )}
          </>
        )}
      </section>
    </section>
  );
}