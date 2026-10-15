import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { useAuthContext } from "@/shared/context/AuthContext.jsx";
import { lazy, Suspense } from "react";

const ForbiddenPage = lazy(() =>
  import("@/pages/ForbiddenPage.jsx").then((m) => ({
    default: m.ForbiddenPage,
  })),
);

export function RoleRoute({ role, children }) {
  return (
    <ProtectedRoute>
      <RoleGate role={role}>{children}</RoleGate>
    </ProtectedRoute>
  );
}

function RoleGate({ role, children }) {
  const { hasRole } = useAuthContext();
  if (!hasRole(role))
    return (
      <Suspense fallback={null}>
        <ForbiddenPage />
      </Suspense>
    );
  return children;
}
