import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker, ChevronDown, LogOut, Shield, User, Wrench } from 'lucide-react';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useMockMode, enableMockMode, resetMockMode } from '@/shared/lib/dataSource.js';
import { demoRoles, loginAsDemo, leaveDemo } from '@/features/auth/services/auth.service.js';
import { ROUTES, ROLES } from '@/shared/lib/constants.js';
import { cn } from '@/shared/utils';

const ROLE_ICON = {
  [ROLES.ADMIN]: Shield,
  [ROLES.PRO]: Wrench,
  [ROLES.CLIENT]: User,
};

/**
 * Sélecteur de rôle pour les données de démonstration.
 *
 * Sans lui, tester l'application demande de s'inscrire trois fois et de remplir
 * les formulaires à chaque fois : il n'existe qu'une seule session, et changer de
 * rôle passe par une inscription complète. Ici un choix suffit.
 *
 * Le retour est aussi explicite : « Quitter la démo » efface la session locale et
 * rend la main à la vraie API.
 */
export function DemoRoleSwitcher() {
  const { user, refresh } = useAuthContext();
  const demo = useMockMode();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) close();
    };
    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const roles = demoRoles();

  const enterAs = (entry) => {
    enableMockMode();
    loginAsDemo(entry.user);
    close();
    refresh();
    navigate(entry.href);
  };

  const quitDemo = () => {
    resetMockMode();
    leaveDemo();
    close();
    refresh();
    navigate(ROUTES.HOME);
  };

  const current = roles.find((entry) => entry.role === user?.role);
  const CurrentIcon = current && demo ? ROLE_ICON[current.role] : Beaker;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-sm border px-2 py-1.5 text-xs font-semibold transition focus-ring',
          demo
            ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Tester l'application avec des données fictives"
      >
        <CurrentIcon size={15} aria-hidden />
        <span className="hidden sm:inline">{demo ? current?.label ?? 'Démo' : 'Démo'}</span>
        <ChevronDown size={14} aria-hidden />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} aria-hidden />
          <div
            ref={menuRef}
            role="menu"
            // Sur mobile le bouton est collé au logo, donc à gauche : un menu
            // ancré à droite s'ouvrirait par-delà le bord gauche de l'écran.
            // Il s'ouvre donc vers la droite, et `max-w-[calc(100vw-7rem)]` le
            // borne à la place disponible entre le bouton et le bord droit.
            className="absolute left-0 z-40 mt-2 w-60 max-w-[calc(100vw-7rem)] origin-top-left overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[var(--shadow-pop)] animate-scale-in sm:right-0 sm:left-auto sm:max-w-none sm:origin-top-right"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-semibold text-gray-800">
                {demo ? 'Mode démo actif' : 'Données fictives'}
              </p>
              <p className="text-xs text-gray-500">
                {demo ? 'Données fictives' : 'Choisissez un rôle pour les tester'}
              </p>
            </div>

            <div className="flex flex-col gap-0.5 p-1.5">
              {roles.map((entry) => {
                const Icon = ROLE_ICON[entry.role];
                const active = entry.role === user?.role && demo;
                return (
                  <button
                    key={entry.role}
                    role="menuitem"
                    onClick={() => enterAs(entry)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-left text-sm transition',
                      active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100',
                    )}
                  >
                    <Icon size={16} aria-hidden className="shrink-0 text-gray-400" />
                    <span className="flex-1">{entry.label}</span>
                    {active && <span className="text-xs font-semibold text-primary-500">actuel</span>}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-100 p-1">
              <button
                role="menuitem"
                onClick={quitDemo}
                disabled={!demo}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2.5 rounded px-3 py-2 text-left text-sm transition',
                  'text-gray-700 hover:bg-gray-100',
                  !demo && 'cursor-not-allowed opacity-40 hover:bg-transparent',
                )}
              >
                <LogOut size={16} aria-hidden className="shrink-0 text-gray-400" />
                Quitter la démo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}