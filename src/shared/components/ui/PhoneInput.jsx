import { formatPhoneDisplay, toNational } from '@/shared/utils/phoneField.js';

/**
 * Champ téléphone à indicatif fixe : [+242 | 06 12 34 56 7]
 *
 * L'utilisateur tape uniquement la partie nationale. Si le code pays est
 * collé ou tapé, il est retiré : il est déjà affiché à gauche.
 */
export function PhoneInput({ id, value, onChange, error, success, disabled, ...rest }) {
  const emit = (raw) => onChange(toNational(raw));

  const shell = [
    'flex w-full items-stretch overflow-hidden rounded-sm border bg-white transition-colors',
    error
      ? 'is-invalid border-danger-500 bg-danger-50/30'
      : success
        ? 'is-valid border-emerald-500 bg-emerald-50/30'
        : 'border-gray-200 hover:border-gray-300',
    'focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/12',
    disabled && 'bg-gray-50 opacity-60',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shell}>
<span
        aria-hidden
        className="flex select-none items-center border-r border-gray-200 bg-gray-50"
      >
        <span className="py-3 pl-3 pr-2.5 text-sm font-semibold text-gray-700">+242</span>
        <span className="h-4 border-l border-gray-300" />
      </span>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={formatPhoneDisplay(value)}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => emit(e.target.value)}
        // À la sortie du champ : nettoie une saisie collée avec l'indicatif.
        onBlur={() => emit(value)}
        placeholder="06 12 34 56 7"
        className="w-full border-0 bg-transparent py-3 pl-3 pr-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        {...rest}
      />
    </div>
  );
}