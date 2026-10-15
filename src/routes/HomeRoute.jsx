import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { landingHrefFor } from "@/shared/utils/userMenuUtils.js";

/**
 * La home est la page d'atterrissage : la plupart des visiteurs arrive
 * déconnecté. Rendre `null` pendant la vérification de session leur montrait une
 * page vide le temps de l'appel, et le placeholder lui-même restait masqué,
 * puisqu'il vit dans `children`.
 *
 * La redirection d'un visiteur déjà connecté attend donc la réponse de l'API,
 * au lieu d'être éclipsée par un écran blanc. La barre de navigation masque
 * déjà ses boutons d'authentification pendant ce chargement, rien n'y clignote.
 * @param {{children: import("react").ReactNode}} props children de la route
 * @returns {import("react").ReactElement} la home, ou une redirection
 */
export function HomeRoute({ children }) {
  const { user, loading } = useAuthContext();

  if (!loading && user) return <Navigate to={landingHrefFor(user)} replace />;

  return children;
}
