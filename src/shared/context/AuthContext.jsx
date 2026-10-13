import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as authService from '@/features/auth/services/auth.service.js';
import { UNAUTHORIZED_EVENT } from '@/shared/lib/api.js';
import { ROUTES, ROLES } from '@/shared/lib/constants.js';

const AuthContext = createContext(null);

function redirect(to) {
  if (typeof window === 'undefined') return;
  window.location.assign(to);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      setUser(data ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMe();
  }, [fetchMe]);

  // Une réponse 401 en cours de session (cookie expiré, compte supprimé) doit
  // déconnecter l'utilisateur : plus de jeton à rafraîchir, le cookie fait foi.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback((userData) => setUser(userData), []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch { /* ignore */ } finally {
      setUser(null);
      redirect(ROUTES.HOME);
    }
  }, []);

  const hasRole = useCallback((role) => Boolean(user?.role && user.role === role), [user]);

  /**
   * Vrai pour un professionnel et un administrateur.
   *
   * Ces deux rôles connaissent déjà la plateforme : la page « Comment ça
   * marche » ne leur apporte rien, et devenir prestataire ne leur est plus
   * possible. Un client, lui, garde les deux - il peut encore découvrir le
   * service, et devenir prestataire est un choix qui lui revient.
   */
  const isServiceProvider = Boolean(
    user && (user.role === ROLES.PRO || user.role === ROLES.ADMIN),
  );

  const value = useMemo(
    () => ({ user, loading, login, logout, hasRole, isServiceProvider, refresh: fetchMe }),
    [user, loading, login, logout, hasRole, isServiceProvider, fetchMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Le Provider et son hook vivent ensemble : c'est le pattern React advocated.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}