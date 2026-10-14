import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { landingHrefFor } from '@/shared/utils/userMenuUtils.js';

/**
 * Accueil conditionnel à la session. `landingHrefFor` porte la règle.
 * L'attente du chargement est obligatoire : `user` vaut `null` pendant la requête.
 */
export function HomeRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (loading) return null;
  if (!user) return children;

  return <Navigate to={landingHrefFor(user)} replace />;
}