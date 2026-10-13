import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';
import { ErrorState } from '@/shared/components/ui/ErrorState.jsx';


export function ProfileLoadingState() {
  return (
    <div className="container-kop space-y-4 py-10" aria-busy="true">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function ProfileErrorState({ error, onRetry }) {
  return (
    <div className="container-kop py-10">
      <ErrorState
        title="Erreur de chargement du profil"
        message={error?.message || 'Impossible de charger votre profil. Réessayez.'}
        onAction={onRetry}
        className="mx-auto max-w-xl"
      />
    </div>
  );
}