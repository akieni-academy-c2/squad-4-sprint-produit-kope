import { useState } from 'react';
import { Check, X } from 'lucide-react';

export function InlineInput({ value, onChange, onSubmit, onCancel, placeholder, ariaLabel, className = '' }) {
  const [draft, setDraft] = useState(value);

  const submit = () => {
    onChange(draft);
    onSubmit();
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-9 w-full min-w-0 rounded-sm border border-primary-500 bg-white px-2.5 text-sm text-gray-900 outline-none focus:ring-4 focus:ring-primary-500/12"
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Valider"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-primary-600 transition-colors hover:bg-mint-100"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Annuler"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-gray-500 transition-colors hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function PositionBadge({ value, muted = false }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
        muted ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {value}
    </span>
  );
}
