import { Pencil, Trash } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card.jsx';
import { FloatingCaption } from '@/shared/components/ui/FloatingCaption.jsx';
import { cn } from '@/shared/utils';

export function PhotoCard({ photo, isDeleting, onEdit, onRequestDelete }) {
  const title = photo.title || photo.caption;

  return (
    <Card className={cn('relative overflow-hidden', isDeleting && 'opacity-60')}>
      <div className="relative h-80 w-full overflow-hidden bg-gray-100">
        <img
          src={photo.thumbUrl || photo.url}
          alt={title || ''}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {(title || photo.description) && (
          <FloatingCaption
            wide
            title={title || 'Photo de réalisation'}
            subtitle={photo.description}
            subtitleClassName="line-clamp-2"
            className="pointer-events-none"
          />
        )}
        {isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-xs font-semibold text-white">
            Suppression...
          </div>
        )}
      </div>

      <div className="absolute right-2 top-2 flex gap-1.5">
        <button
          type="button"
          onClick={() => onEdit(photo)}
          disabled={isDeleting}
          title="Modifier"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/95 text-gray-700 shadow-md transition hover:bg-gray-100 focus-ring disabled:opacity-50"
          aria-label="Modifier cette photo"
        >
          <Pencil size={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onRequestDelete(photo)}
          disabled={isDeleting}
          title="Supprimer"
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-md transition hover:bg-rose-50 focus-ring disabled:opacity-50"
          aria-label="Supprimer cette photo"
        >
          <Trash size={16} aria-hidden />
        </button>
      </div>
    </Card>
  );
}