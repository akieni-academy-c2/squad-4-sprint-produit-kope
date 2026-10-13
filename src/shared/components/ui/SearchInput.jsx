import { Search, X } from 'lucide-react';
import { cn } from '@/shared/utils';

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Rechercher...',
  className,
  id,
  name,
  autoFocus = false,
  'aria-label': ariaLabel,
}) {
  const hasValue = String(value || '').length > 0;

  return (
    <div
      className={cn(
        'flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 transition-[border-color,box-shadow] hover:border-gray-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/12',
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={typeof ariaLabel === 'string' ? ariaLabel : undefined}
        autoFocus={autoFocus}
        className="min-w-0 flex-1 bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400"
      />
      {hasValue && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Effacer la recherche"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
