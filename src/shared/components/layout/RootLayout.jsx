import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { ScrollToTop } from './ScrollToTop.jsx';
import { SuspensionNotice } from './SuspensionNotice.jsx';
import { AuthModal } from '@/features/auth/components/AuthModal.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { cn } from '@/shared/utils';

// La fiche publique rend sa propre `BottomNav` : sans cette entrée, le pied de
// page ne recevait pas la réserve de hauteur et se retrouvait recouvert par la
// barre fixe sur mobile.
const BOTTOM_NAV_ROUTES = [
  ROUTES.DASHBOARD_PRO,
  ROUTES.DASHBOARD_CLIENT,
  ROUTES.ADMIN,
  ROUTES.PROFESSIONAL(''),
];

// Pages qui partagent le fond pointillé des tableaux de bord.
const DOTTED_BG_ROUTES = [...BOTTOM_NAV_ROUTES, ROUTES.SEARCH];

/**
 * L'égalité exacte ne voyait que `/admin` : dès que l'onglet portait l'URL,
 * le fond pointillé disparaissait avec la réserve pour la barre du bas.
 */
const isUnder = (pathname, base) =>
  pathname === base || (Boolean(base) && pathname.startsWith(`${base}/`));

export function RootLayout() {
  const { pathname } = useLocation();

  const hasBottomNav = BOTTOM_NAV_ROUTES.some((route) => isUnder(pathname, route));
  const hasDottedBg =
    DOTTED_BG_ROUTES.some((route) => isUnder(pathname, route)) ||
    pathname.startsWith(ROUTES.PROFESSIONAL(''));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <ScrollToTop />
      <main id="main-content" className={cn('flex-1', hasDottedBg && 'bg-dots')}>
        <div className=" animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer className={hasBottomNav ? 'pb-safe-nav lg:pb-0' : undefined} />
      <AuthModal />
      <SuspensionNotice />
    </div>
  );
}
