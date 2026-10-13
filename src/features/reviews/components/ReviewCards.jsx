import { ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { ReviewCardHeader } from './ReviewCardHeader.jsx';

/**
 * Liste compacte d'avis, sans chargement : la requête est partagée par l'appelant
 * (la fiche publique affiche ce bloc en desktop et en mobile).
 */
export function ReviewCards({ state, onViewAll }) {
  if (state?.loading || state?.error)
    return <DataState loading={state?.loading} error={state?.error} errorPrefix="Impossible de charger les avis" />;

  const items = state?.data?.items ?? [];
  if (items.length === 0)
    return <EmptyState title="Aucun avis pour le moment." />;

  const total = Number(state.data.total ?? 0);

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <Card key={r.id} className="space-y-2 p-3">
          <ReviewCardHeader review={r} />
          {r.comment && <p className="line-clamp-3 text-sm leading-6 text-gray-700">{r.comment}</p>}
        </Card>
      ))}

      {total > items.length && onViewAll && (
        <Button variant="ghost" size="sm" className="!text-primary-700 !font-bold !pl-0" onClick={onViewAll}>
          Voir les {total} avis <ChevronRight size={14} className="inline" aria-hidden />
        </Button>
      )}
    </div>
  );
}
