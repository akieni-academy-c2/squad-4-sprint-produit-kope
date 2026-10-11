import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserMenu } from './UserMenu.jsx';
import { DemoRoleSwitcher } from './DemoRoleSwitcher.jsx';
import { displayNameFor, roleLabel, dashboardHref, landingHrefFor } from '@/shared/utils/userMenuUtils.js';
import { UserAvatar } from '@/shared/components/ui/UserAvatar.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/components/ui/Button.jsx';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { Sheet } from '@/shared/components/ui/Sheet.jsx';
import { Drill, Search, CircleHelp, Briefcase, LogOut } from 'lucide-react';

const NAV = [
  { to: ROUTES.SEARCH, label: 'Trouver un professionnel', icon: Search },
  { to: ROUTES.HOW_IT_WORKS, label: 'Comment ça marche', icon: CircleHelp },
  { to: ROUTES.REGISTER_PRO, label: 'Devenir Prestataire', icon: Briefcase },
];

const HIDDEN_WHEN_CONNECTED = new Set([ROUTES.HOW_IT_WORKS, ROUTES.REGISTER_PRO]);

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuthContext();
  const { open: openModal } = useAuthModal();

  const navItems = user ? NAV.filter((item) => !HIDDEN_WHEN_CONNECTED.has(item.to)) : NAV;

  const logoHref = landingHrefFor(user);

  return (
    <header className={`sticky top-0 z-40 border-b  border-gray-100 bg-white/85 backdrop-blur`}>
      <div className="container-kop flex h-(--header-height) items-center gap-2 sm:gap-4">
        <Link to={logoHref} className="flex items-center gap-2 focus-ring rounded-xl p-1 -ml-1 shrink-0 text-primary-500">
          <span aria-hidden className="flex items-center gap-1.5">
            <Drill size={20} />
            <span className="font-extrabold moo-lah-lah-regular tracking-tight text-[27px]  -ml-0.5">
              KOP
            </span>
          </span>
        </Link>

        <DemoRoleSwitcher />

        <div className="ml-auto hidden md:flex items-center gap-2">
          <nav aria-label="Navigation principale" className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => {
              if (item.to === ROUTES.REGISTER_PRO)
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => openModal('register-pro')}
                    className="rounded-[10px] py-2 text-sm font-semibold text-gray-700 transition hover:text-gray-900"
                  >
                    {item.label}
                  </button>
                );
                
              if (item.to === ROUTES.SEARCH && user)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-gray-300 bg-white/25 px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-ring"
                  >
                    <Search size={16} aria-hidden />
                    {item.label}
                  </NavLink>
                );

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-[10px] px-3 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'text-primary-500 nav-link-active'
                        : 'text-gray-700 hover:text-gray-900',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <span className='opacity-30'>|</span>
          {!loading && !user && (
            <>
              <Button variant="outline" size="sm" onClick={() => openModal('login')}>
                Se connecter
              </Button>
              <Button variant="primary" size="sm" onClick={() => openModal('register-client')}>
                S'inscrire
              </Button>
            </>
          )}
          {(user || loading) && <UserMenu />}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 lg:hidden focus-ring"
          aria-label="Menu"
          aria-expanded={open}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {open ? (
              <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            ) : (
              <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
            )}
          </svg>
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-100 px-5 pb-5 pt-6">
            <Link to={logoHref} onClick={() => setOpen(false)} className="flex items-center gap-2 text-primary-500">
              <Drill size={20} aria-hidden />
              <span className="font-extrabold moo-lah-lah-regular tracking-tight text-[24px]">KOP</span>
            </Link>
          </div>
          <nav aria-label="Navigation mobile" className="flex-1 space-y-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              if (item.to === ROUTES.REGISTER_PRO)
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => { setOpen(false); openModal('register-pro'); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon size={18} aria-hidden className="text-gray-400" />
                    {item.label}
                  </button>
                );

              if (item.to === ROUTES.SEARCH && user)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white/25 px-3 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Search size={18} aria-hidden />
                    {item.label}
                  </NavLink>
                );

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-primary-50 text-primary-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    )
                  }
                >
                  <item.icon size={18} aria-hidden className="text-gray-400" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-gray-100 p-4">
            {loading ? (
              <div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse" />
            ) : !user ? (
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="md" className="w-full" onClick={() => { setOpen(false); openModal('login'); }}>Se connecter</Button>
                <Button variant="primary" size="md" className="w-full" onClick={() => { setOpen(false); openModal('register-client'); }}>S'inscrire</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} name={displayNameFor(user)} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{displayNameFor(user)}</p>
                    <p className="text-xs text-gray-500">{roleLabel(user.role)}</p>
                  </div>
                </div>
                <Link to={dashboardHref(user.role)} onClick={() => setOpen(false)} className="w-full">
                  <Button variant="outline" size="md" className="w-full">Mon espace</Button>
                </Link>
                <Button
                  variant="danger-outline"
                  size="md"
                  className="w-full"
                  onClick={() => { setOpen(false); logout(); }}
                >
                  Se déconnecter <LogOut size={18} aria-hidden />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Sheet>
    </header>
  );
}
