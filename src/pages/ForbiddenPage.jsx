import { useNavigate } from 'react-router-dom';
import { Link } from '@/shared/components/ui/Link.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { ROUTES } from '@/shared/lib/constants.js';
import { usePageTitle } from '@/shared/hooks/usePageTitle.js';

export function ForbiddenPage() {
  const navigate = useNavigate();

  usePageTitle('Accès refusé');
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-danger-500">Erreur 403</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900">Accès refusé</h1>
      <p className="mt-3 text-gray-600">
        Vous n'avez pas les droits nécessaires pour accéder à cette page.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={() => navigate(-1)} variant="secondary">Revenir en arrière</Button>
        <Button as={Link} href={ROUTES.HOME}>Retour à l'accueil</Button>
      </div>
    </div>
  );
}
