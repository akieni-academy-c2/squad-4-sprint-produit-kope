import { Check } from 'lucide-react';
import { cn } from '@/shared/utils';

/**
 * Indicateur d'avancement d'un formulaire en plusieurs étapes.
 * `aria-current="step"` indique aux lecteurs d'écran quelle étape est active.
 */
export function StepIndicator({ steps, current }) {
  return (
    <ol className="mt-4 flex items-center gap-2" aria-label="Progression">
      {steps.map((step, index) => {
        const number = index + 1;
        const done = number < current;
        const active = number === current;

        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  active
                    ? 'bg-primary-500 text-white'
                    : done
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500',
                )}
              >
                {done ? <Check size={13} aria-hidden /> : number}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  active ? 'text-gray-900' : 'text-gray-500',
                )}
              >
                {step}
              </span>
            </div>
            {number < steps.length && (
              <span
                aria-hidden
                className={cn('h-px flex-1', done ? 'bg-emerald-200' : 'bg-gray-200')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}