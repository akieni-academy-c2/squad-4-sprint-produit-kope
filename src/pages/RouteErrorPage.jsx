import { useRouteError } from 'react-router-dom';
import { Link } from '@/shared/components/ui/Link.jsx';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { usePageTitle } from '@/shared/hooks/usePageTitle.js';

export function RouteErrorPage() {
  const error = useRouteError();

  usePageTitle('Erreur');
  const status = error?.status;
  const message =
    error?.data?.message ||
    error?.statusText ||
    error?.message ||
    "Une erreur inattendue est survenue.";

  return (
    <div className="bg-kop-mint">
      <div className="container-kop flex min-h-[60vh] flex-col items-center justify-center py-8 lg:py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-danger-500 ring-1 ring-gray-300">
          <TriangleAlert size={28} aria-hidden />
        </span>
        <p className="mt-6 text-sm font-semibold text-primary-600">
          {status ? `Erreur ${status}` : 'Erreur inattendue'}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Quelque chose s'est mal passé
        </h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-gray-600">{message}</p>
        {import.meta.env.DEV && error?.stack && (
          <pre className="mt-6 max-h-56 w-full max-w-2xl overflow-auto rounded-xl bg-gray-900 p-4 text-left text-xs text-gray-200">
            {error.stack}
          </pre>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Recharger</Button>
          <Button as={Link} href={ROUTES.HOME} variant="secondary">Retour à l'accueil</Button>
        </div>
      </div>
    </div>
  );
}
