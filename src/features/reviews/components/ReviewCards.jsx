import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { DataState } from '@/shared/components/ui/DataState.jsx';
import { EmptyState } from '@/shared/components/ui/EmptyState.jsx';
import { ReviewCardHeader } from './ReviewCardHeader.jsx';
import { SPRING } from '@/shared/motion/timing.js';

/**
 * Liste compacte d'avis, sans chargement : la requête est partagée par l'appelant
 * (la fiche publique affiche ce bloc en desktop et en mobile).
 *
 * ## La surface n'est pas blanche
 *
 * Sur la fiche publique, ces avis sont posés sur le **fond pointillé**. Une
 * carte blanche y est un rectangle qui masque le motif - et, surtout, elle se
 * confond avec le bloc « note moyenne » qui la précède : deux surfaces
 * identiques pour deux contenus de nature différente, dont un résumé chiffré et
 * l'autre des témoignages.
 *
 * Le gris très clair sépare les deux sans ajouter de bordure : la bordure est
 * déjà là pour dire « c'est encadré », la couleur pour dire « c'est une autre
 * catégorie ». C'est le même code couleur que les zones neutres du reste de
 * l'application - on n'invente pas une couleur propre aux avis.
 *
 * ## Le survol
 *
 * La carte se soulève de 2 px. Une carte qui bouge sous un pointeur se lit
 * comme cliquable - et l'utilisateur finit par cliquer le vide. C'est pourquoi
 * le mouvement s'arrête là : ni échelle, ni changement de couleur d'action.
 * Le texte reste du texte, et rien n'y est cliquable.
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
        <motion.div
          key={r.id}
          whileHover={{ y: -2 }}
          transition={SPRING.press}
          className="rounded-md"
        >
          <Card className="space-y-2 border-gray-200 bg-gray-100/70 p-3">
            <ReviewCardHeader review={r} />
            {r.comment && <p className="line-clamp-3 text-sm leading-6 text-gray-700">{r.comment}</p>}
          </Card>
        </motion.div>
      ))}

      {total > items.length && onViewAll && (
        <Button variant="ghost" size="sm" className="!text-primary-700 !font-bold !pl-0" onClick={onViewAll}>
          Voir les {total} avis <ChevronRight size={14} className="inline" aria-hidden />
        </Button>
      )}
    </div>
  );
}
