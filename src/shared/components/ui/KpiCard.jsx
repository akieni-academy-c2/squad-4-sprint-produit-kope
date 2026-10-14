import { cn } from '@/shared/utils';

/** Partagée par l'espace administrateur et le compte client. */
export function KpiCard({ label, value, hint, onClick, tone = 'default', icon = null, footer = null }) {
  const clickable = typeof onClick === 'function';
  const Wrapper = clickable ? 'button' : 'div';

  return (
    <Wrapper
      {...(clickable ? { type: 'button', onClick } : {})}
      className={cn(
        'rounded-[18px] border bg-white p-4',
        clickable &&
          'block w-full cursor-pointer text-left transition hover:border-primary-300 hover:shadow-sm focus-ring',
        tone === 'danger' ? 'border-rose-200 bg-rose-50/50' : 'border-[#e2e8e5]',
      )}
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          'mt-2 text-3xl font-extrabold tracking-tight',
          tone === 'danger' && Number(value) > 0 ? 'text-rose-600' : 'text-gray-900',
        )}
      >
        {value ?? '-'}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {footer && <div className="mt-1.5">{footer}</div>}
    </Wrapper>
  );
}

const GROUP_TONES = {
  default: 'border-[#e2e8e5] bg-white',
  primary: 'border-primary-600 bg-primary-500',
  danger: 'border-danger-500 bg-danger-500',
  teal: 'border-teal-600 bg-teal-500',
  neutral: 'border-gray-600 bg-gray-500',
  // Bandeau d'en-tête : teinté et non plein. Un aplat de marque
  // transformerait les tuiles blanches posées dedans en texte sur fond coloré.
  mint: 'border-mint-200 bg-mint-50',
};

// Fond clair : le titre ne peut pas être blanc, il disparaîtrait.
const SOFT_TONES = new Set(['mint']);

/** Conteneur de tuiles, avec son titre en capitales. */
export function StatGroup({ title, tone = 'default', children, className }) {
  const toned = tone !== 'default';
  const soft = SOFT_TONES.has(tone);

  return (
    <section className={cn('rounded-[18px] border p-4', GROUP_TONES[tone] ?? GROUP_TONES.default, className)}>
      {title && (
        <h3
          className={cn(
            'text-sm font-bold uppercase tracking-[0.08em]',
            toned ? (soft ? 'text-primary-700' : 'text-white') : 'text-gray-500',
          )}
        >
          {title}
        </h3>
      )}
      <div className={cn(title && 'mt-3')}>{children}</div>
    </section>
  );
}