import { Check, Circle } from 'lucide-react';
import { cn } from '@/shared/utils';
import { FIELD_STATUS } from '@/shared/hooks/useFieldStatus.js';


export function FieldStatusLine({ status, missing = 0, total = 1, hint, message }) {
  if (status === FIELD_STATUS.IDLE)
    return hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null;

  if (status === FIELD_STATUS.OK) return null;

  if (status === FIELD_STATUS.WRONG)
    return (
      <p className="mt-1 text-xs font-medium text-danger-500" aria-live="polite">
        {message}
      </p>
    );

  const reste =
    total > 1
      ? `${missing} exigence${missing > 1 ? 's' : ''} restante${missing > 1 ? 's' : ''}`
      : 'incomplet';

  return (
    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600" aria-live="polite">
      <Circle size={10} aria-hidden /> Presque bon - {reste}
    </p>
  );
}


export function PasswordRules({ rules }) {
  return (
    <ul className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
      {rules.map((rule) => (
        <li
          key={rule.key}
          className={cn(
            'flex items-center gap-1 text-[11px] leading-none transition-colors',
            rule.passed ? 'text-emerald-600' : 'text-gray-400',
          )}
        >
          {rule.passed ? <Check size={11} aria-hidden /> : <Circle size={7} aria-hidden />}
          {rule.label}
        </li>
      ))}
    </ul>
  );
}