import { Skeleton } from "./Skeleton.jsx";
import { ErrorState } from "./ErrorState.jsx";

export function DataState({
  loading,
  error,
  errorPrefix = "Erreur de chargement",
  onRetry,
  children,
}) {
  if (loading)
    return (
      <div className="space-y-3 py-4" aria-busy="true">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-2/3" />
      </div>
    );

  if (error)
    return (
      <ErrorState
        title={errorPrefix}
        message={
          error.message || "Impossible de charger ces données. Réessayez."
        }
        onAction={onRetry}
        className="my-4"
      />
    );

  return children;
}
