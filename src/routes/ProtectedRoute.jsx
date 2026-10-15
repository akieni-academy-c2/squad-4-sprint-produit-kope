import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { Skeleton } from "@/shared/components/ui/Skeleton.jsx";
import { ROUTES } from "@/shared/lib/constants.js";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading)
    return (
      <div className="container-kop space-y-4 py-8 lg:py-16" aria-busy="true">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${ROUTES.LOGIN}?next=${next}`} replace />;
  }
  return children;
}
