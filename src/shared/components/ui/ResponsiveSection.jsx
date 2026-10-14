import { useMediaQuery } from '@/shared/hooks/useMediaQuery.js';


export function ResponsiveSection({ variant, desktop = '(min-width: 1024px)', children }) {
  const isDesktop = useMediaQuery(desktop);
  return (variant === 'desktop') === isDesktop ? children : null;
}