import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { ROLES, ROUTES } from '@/shared/lib/constants.js';

function dashboardForRole(role) {
  if (role === ROLES.CLIENT) return ROUTES.DASHBOARD_CLIENT;
  if (role === ROLES.PRO) return ROUTES.DASHBOARD_PRO;
  if (role === ROLES.ADMIN) return ROUTES.ADMIN;
  return ROUTES.HOME;
}

export function AuthModalRedirect({ mode }) {
  const { user, loading } = useAuthContext();
  const { open } = useAuthModal();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user)
      navigate(dashboardForRole(user.role), { replace: true });
     else {
      open(mode);
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [user, loading, mode, open, navigate]);

  return null;
}
