import { cn } from '@/shared/utils';

const ORIENTATIONS = {
  horizontal: 'h-px w-full',
  vertical: 'h-full w-px',
};

/** Séparateur shadcn/ui : `<Separator />` horizontal, `<Separator orientation="vertical" />` vertical. */
export function Separator({ orientation = 'horizontal', className, ...rest }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn('shrink-0 bg-gray-200', ORIENTATIONS[orientation] || ORIENTATIONS.horizontal, className)}
      {...rest}
    />
  );
}
