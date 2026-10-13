import { cn } from '@/shared/utils';

const SIDES = {
  top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
  left: 'right-full top-1/2 mr-1.5 -translate-y-1/2',
  right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
};

export function Tooltip({ content, children, side = 'top', className, contentClassName }) {
  if (!content) return children;
  return (
    <span className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 w-max max-w-55 rounded-md bg-gray-900 px-2.5 py-1.5 text-center text-[11px] font-semibold leading-tight text-white opacity-0 shadow-md transition-opacity duration-150',
          'group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
          SIDES[side] || SIDES.top,
          contentClassName,
        )}
      >
        {content}
      </span>
    </span>
  );
}
