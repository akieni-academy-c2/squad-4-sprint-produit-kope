import { RotateCcw, Star, Clock, Zap, ArrowUpDown } from 'lucide-react';
import { Button, CustomSelect } from '@/shared/components/ui';

const AVAILABLE_OPTIONS = [
  { value: '', label: 'Disponibilité : tous' },
  { value: 'true', label: 'Disponibles maintenant' },
  { value: 'false', label: 'Indisponibles' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Note : indifférente' },
  { value: '3', label: '3 étoiles et plus' },
  { value: '4', label: '4 étoiles et plus' },
  { value: '5', label: '5 étoiles uniquement' },
];

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Expérience : toutes' },
  { value: '2', label: '2 ans et plus' },
  { value: '5', label: '5 ans et plus' },
  { value: '10', label: '10 ans et plus' },
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Tri recommandé' },
  { value: 'rating', label: 'Mieux notés' },
  { value: 'experience', label: "Plus d'expérience" },
];

export function SearchRefineFilters({
  available,
  minRating,
  minExperience,
  sort = 'recommended',
  onChange,
  onSortChange,
  onReset,
  // Fermeture du Sheet mobile, une fois les filtres posés. Les filtres
  // s'appliquent déjà au choix, il n'y a rien à valider : ce bouton sert
  // à en sortir. Sur desktop le panneau reste affiché, `onApply` est absent.
  onApply,
  dirty = false,
}) {
  const handle = (key) => (value) => onChange({ [key]: value });

  return (
    <section className="rounded-md border border-gray-200 bg-white p-2">
      <div className="flex items-center justify-between px-2 py-2">
        <h2 className="text-sm font-bold text-gray-900">Affiner</h2>
        {dirty && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            <RotateCcw className="h-3 w-3" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="space-y-4 p-2">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            <ArrowUpDown className="h-3 w-3" aria-hidden />
            Trier par
          </p>
          <CustomSelect
            value={sort}
            onChange={onSortChange}
            options={SORT_OPTIONS}
            className="mt-2 w-full"
            aria-label="Trier les résultats"
          />
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            <Zap className="h-3 w-3" aria-hidden />
            Disponibilité
          </p>
          <CustomSelect
            value={available ?? ''}
            onChange={handle('available')}
            options={AVAILABLE_OPTIONS}
            className="mt-2 w-full"
            aria-label="Filtrer par disponibilité"
          />
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            <Star className="h-3 w-3" aria-hidden />
            Note minimale
          </p>
          <CustomSelect
            value={minRating ?? ''}
            onChange={handle('minRating')}
            options={RATING_OPTIONS}
            className="mt-2 w-full"
            aria-label="Filtrer par note minimale"
          />
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            <Clock className="h-3 w-3" aria-hidden />
            Expérience
          </p>
          <CustomSelect
            value={minExperience ?? ''}
            onChange={handle('minExperience')}
            options={EXPERIENCE_OPTIONS}
            className="mt-2 w-full"
            aria-label="Filtrer par expérience minimale"
          />
        </div>
      </div>

      <div className="border-t border-gray-100 p-2">
        <Button size="sm" className="w-full" onClick={() => onApply?.()} disabled={!dirty}>
          Appliquer
        </Button>
      </div>
    </section>
  );
}
