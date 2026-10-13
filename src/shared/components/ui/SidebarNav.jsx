import { cn } from '@/shared/utils';

export function SidebarNav({ items, active, onChange, ariaLabel, orientation = 'vertical' }) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'sm:rounded-md md:border border-gray-200 sm:bg-white p-2',
        isHorizontal ? 'flex w-screen ' : 'space-y-1',
      )}
    >
      {items.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          // Navigation, pas onglets ARIA : il n'y a pas de tabpanel associé.
          aria-current={active === id ? 'page' : undefined}
          onClick={() => onChange(id)}
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-sm border text-sm font-semibold transition',
            isHorizontal
              ? 'shrink-0 whitespace-nowrap px-4 py-2.5'
              : 'w-full px-4 py-3 text-left',
            active === id
              ? 'border-gray-200 bg-gray-100 text-gray-900'
              : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
          )}
        >
          <Icon size={18} aria-hidden />
          {label}
        </button>
      ))}
    </nav>
  );
}
