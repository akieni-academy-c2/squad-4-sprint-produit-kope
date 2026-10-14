import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { landingHrefFor } from '@/shared/utils/userMenuUtils.js';


export function HomeRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) return null;
  if (!user) return children;

  return <Navigate to={landingHrefFor(user)} replace />;
}