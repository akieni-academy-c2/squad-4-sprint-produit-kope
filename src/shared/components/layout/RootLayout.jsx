import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { ScrollToTop } from './ScrollToTop.jsx';
import { SuspensionNotice } from './SuspensionNotice.jsx';
import { AuthModal } from '@/features/auth/components/AuthModal.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { cn } from '@/shared/utils';

const BOTTOM_NAV_ROUTES = [ROUTES.DASHBOARD_PRO, ROUTES.DASHBOARD_CLIENT, ROUTES.ADMIN];

// Pages qui partagent le fond pointillé des tableaux de bord.
const DOTTED_BG_ROUTES = [...BOTTOM_NAV_ROUTES, ROUTES.SEARCH];

/**
 * Une route et ses sous-sections.
 *
 * La comparaison était une égalité exacte : elle ne voyait plus que `/admin`.
 * Dès que l'onglet portait l'URL - `/admin/users`, `/dashboard/client/avis` -
 * la page n'était plus reconnue comme tableau de bord. Le fond pointillé
 * disparaissait, et la réserve d'espace pour la barre du bas avec lui, ce qui
 * décalait toute la mise en page : changer d'onglet ressemblait à un
 * rechargement.
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
      {/* Le retour en haut se décide ici, une fois : chaque tableau de bord
          a une route par onglet, et passer de l'une à l'autre en gardant la
          hauteur de défilement atterrit au milieu de la nouvelle section. */}
      <ScrollToTop />
      <main id="main-content" className={cn('flex-1', hasDottedBg && 'bg-dots')}>
        <div className=" animate-fade-in">
          <Outlet />
        </div>
      </main>
      <Footer className={hasBottomNav ? 'pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0' : undefined} />
      <AuthModal />
      <SuspensionNotice />
    </div>
  );
}
