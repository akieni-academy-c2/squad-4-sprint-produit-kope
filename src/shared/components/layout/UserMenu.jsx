import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { ROUTES, ROLES, PROFILE_STATUS } from "@/shared/lib/constants.js";
import { Button } from "@/shared/components/ui/Button.jsx";
import { cn } from "@/shared/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthModal } from "@/shared/context/AuthModalContext.jsx";
import { AUTH_MODAL_MODES } from "@/shared/context/authModalModes.js";
import { useDismissOnOutside } from "@/shared/hooks/useDismissOnOutside.js";
import { UserAvatar } from "@/shared/components/ui/UserAvatar.jsx";
import { Link } from "@/shared/components/ui/Link.jsx";
import {
  displayNameFor,
  roleLabel,
  dashboardHref,
} from "@/shared/utils/userMenuUtils.js";
import { getMyProfile } from "@/features/professionals/services/professionals.service.js";

export function UserMenu({ onNavigate }) {
  const { user, loading, logout, hasRole } = useAuthContext();
  const { open: openModal } = useAuthModal();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const [proStatus, setProStatus] = useState(null);
  const isPro = Boolean(user) && hasRole(ROLES.PRO);

  useEffect(() => {
    if (!open || !isPro || proStatus !== null) return undefined;
    let cancelled = false;
    getMyProfile()
      .then((p) => {
        if (!cancelled) setProStatus(p?.status ?? null);
      })
      .catch(() => {
        if (!cancelled) setProStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [open, isPro, proStatus]);

  const close = useCallback(() => {
    setOpen(false);
    onNavigate?.();
  }, [onNavigate]);

  useDismissOnOutside(menuRef, close, { active: open });

  if (loading)
    return <div className="h-9 w-24 rounded-lg bg-gray-100 animate-pulse" />;

  if (!user)
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onNavigate?.();
            openModal(AUTH_MODAL_MODES.LOGIN);
          }}
        >
          Connexion
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            onNavigate?.();
            openModal(AUTH_MODAL_MODES.REGISTER_CLIENT);
          }}
        >
          S'inscrire
        </Button>
      </div>
    );

  return (
    <div className="relative">
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2 rounded-sm ring bg-white ring-gray-200 pl-1 pr-4 py-1 hover:bg-gray-100 focus-ring"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar
          user={user}
          name={displayNameFor(user)}
          className="h-8 w-8"
        />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-gray-800 leading-4">
            {displayNameFor(user)}
          </span>
          <span className="block text-[11px] text-gray-500">
            {roleLabel(user.role)}
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} aria-hidden />
          <div
            ref={menuRef}
            role="menu"
            className="absolute right-0 z-40 mt-2 w-64 origin-top-right overflow-hidden rounded-sm border border-gray-200 bg-white shadow-[var(--shadow-pop)] animate-scale-in"
          >
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-gray-800">
                {displayNameFor(user)}
              </p>
              <p className="text-xs text-gray-500">{roleLabel(user.role)}</p>
            </div>
            <div className="flex flex-col p-1.5 gap-0.5">
              {(hasRole(ROLES.CLIENT) ||
                hasRole(ROLES.PRO) ||
                hasRole(ROLES.ADMIN)) && (
                <Link
                  href={dashboardHref(user.role)}
                  role="menuitem"
                  onClick={close}
                  className="rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {hasRole(ROLES.PRO)
                    ? "Mon profil"
                    : hasRole(ROLES.ADMIN)
                      ? "Administration"
                      : "Mon espace"}
                </Link>
              )}
              {isPro && proStatus === PROFILE_STATUS.PUBLISHED && (
                <Link
                  href={ROUTES.PROFESSIONAL(user.id)}
                  target="_blank"
                  role="menuitem"
                  onClick={close}
                  className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Voir ma fiche publique
                </Link>
              )}
            </div>
            <div className="border-t border-gray-100 p-1">
              <button
                role="menuitem"
                onClick={() => {
                  close();
                  logout();
                }}
                className={cn(
                  "w-full text-left rounded cursor-pointer  bg-gray-100 px-3 py-2 text-sm",
                  "text-danger-500 hover:bg-rose-50",
                )}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
