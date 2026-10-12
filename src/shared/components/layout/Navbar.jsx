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
import { Card } from '@/shared/components/ui/Card.jsx';
import { Separator } from '@/shared/components/ui/Separator.jsx';
import { Drill, Search, CircleHelp, Briefcase, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';

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

  // `displayNameFor` peut ne rien renvoyer (un pro sans displayName) : le nom
  // affiché ne doit jamais être « undefined ».
  const name = displayNameFor(user) ?? '';

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

        <div className='flex absolute right-3 gap-2 items-center border bg-gray-200/20 border-gray-200 px-3 py-2 rounded-md'>

        <Link
          to={ROUTES.SEARCH}
          className=""
          aria-label="Trouver un professionnel"
        >
          <Search size={20} aria-hidden />
        </Link>
        <span className='border border-gray-200 h-2'></span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="navbar-mobile-menu"
          aria-haspopup="dialog"
        >
          {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
        </button>
        </div>
      </div>

      <Sheet id="navbar-mobile-menu" open={open} onOpenChange={setOpen}>
        <div className="flex h-full flex-col">
          
          <div className="border-b border-gray-100 px-5 pb-4 pt-6">
            <Link to={logoHref} onClick={() => setOpen(false)} className="flex items-center gap-2 text-primary-500">
              <Drill size={20} aria-hidden />
              <span className="font-extrabold moo-lah-lah-regular tracking-tight text-[24px]">KOP</span>
            </Link>
          </div>

          <nav aria-label="Navigation mobile" className="flex-1 overflow-y-auto overscroll-contain p-4">
            <ul className="flex flex-col gap-0.5">
              {navItems.map((item) => {
                if (item.to === ROUTES.REGISTER_PRO)
                  return (
                    <li key={item.to}>
                      <button
                        type="button"
                        onClick={() => { setOpen(false); openModal('register-pro'); }}
                        className="flex w-full cursor-pointer items-center gap-2.5 rounded px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-ring"
                      >
                        <item.icon size={16} aria-hidden className="shrink-0 text-gray-400" />
                        {item.label}
                      </button>
                    </li>
                  );

                if (item.to === ROUTES.SEARCH && user)
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded border border-gray-300 bg-white/25 px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-ring"
                      >
                        <Search size={16} aria-hidden className="shrink-0 text-gray-400" />
                        {item.label}
                      </NavLink>
                    </li>
                  );

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium transition focus-ring',
                          isActive
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                        )
                      }
                    >
                      <item.icon size={16} aria-hidden className="shrink-0 text-gray-400" />
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Toute action liée à l'utilisateur tient dans une seule card en bas :
              même surface, même traitement, pas de pied de page qui s'éparpille
              en boutons colorés de tailles différentes. */}
          <div className="border-t border-gray-100 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <Card className="overflow-hidden p-1.5">
              {loading ? (
                <div className="h-14 w-full animate-pulse rounded bg-gray-100" />
              ) : !user ? (
                // Mêmes composants et mêmes variantes que la barre desktop :
                // l'invité reconnaît l'action avant même de lire l'écran.
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1"
                    onClick={() => { setOpen(false); openModal('login'); }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    onClick={() => { setOpen(false); openModal('register-client'); }}
                  >
                    S'inscrire
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <UserAvatar user={user} name={name} className="h-10 w-10 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-gray-900">{name || `#${user.id}`}</p>
                      <p className="truncate text-xs text-gray-500">{roleLabel(user.role)}</p>
                    </div>
                  </div>
                  <Separator className="my-1 bg-gray-100" />
                  <Link
                    to={dashboardHref(user.role)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 focus-ring"
                  >
                    <LayoutDashboard size={16} aria-hidden className="shrink-0 text-gray-400" />
                    Mon espace
                  </Link>
                  <Separator className="my-1 bg-gray-100" />
                  <button
                    type="button"
                    onClick={() => { setOpen(false); logout(); }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-danger-500 focus-ring"
                  >
                    <LogOut size={16} aria-hidden className="shrink-0 text-gray-400" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Sheet>
    </header>
  );
}
