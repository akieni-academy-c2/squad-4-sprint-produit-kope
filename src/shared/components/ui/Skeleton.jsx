import { cn } from '@/shared/utils';

/** `gray-200` et non `gray-100` : `bg-dots` pose `gray-100`, le squelette y disparaissait. */
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-gray-200', className)} />;
}
