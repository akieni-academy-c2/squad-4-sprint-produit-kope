import { Button } from '@/shared/components/ui/Button.jsx';
import { Skeleton } from '@/shared/components/ui/Skeleton.jsx';


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
    <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm text-rose-700">
      <h1 className="text-xl font-bold">Erreur de chargement du profil</h1>
      <p className="mt-1 text-sm">{error?.message || 'Impossible de charger votre profil.'}</p>
      <div className="mt-4 flex gap-2">
        <Button onClick={onRetry}>Réessayer</Button>
      </div>
    </div>
  );
}