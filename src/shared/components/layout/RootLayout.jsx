import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';
import { SuspensionNotice } from './SuspensionNotice.jsx';
import { AuthModal } from '@/features/auth/components/AuthModal.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { cn } from '@/shared/utils';

const BOTTOM_NAV_ROUTES = [ROUTES.DASHBOARD_PRO, ROUTES.DASHBOARD_CLIENT, ROUTES.ADMIN];

// Pages qui partagent le fond pointillé des tableaux de bord.
const DOTTED_BG_ROUTES = [...BOTTOM_NAV_ROUTES, ROUTES.SEARCH];

export function RootLayout() {
  const { pathname } = useLocation();
  const hasBottomNav = BOTTOM_NAV_ROUTES.includes(pathname);
  const hasDottedBg = DOTTED_BG_ROUTES.includes(pathname) || pathname.startsWith(ROUTES.PROFESSIONAL(''));
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
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
