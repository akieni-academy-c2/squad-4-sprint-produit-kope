import { Link } from "@/shared/components/ui/Link.jsx";
import { Button } from "@/shared/components/ui/Button.jsx";
import { usePageTitle } from "@/shared/hooks/usePageTitle.js";
import { ROUTES } from "@/shared/lib/constants.js";

export function NotFoundPage() {
  usePageTitle("Page introuvable");
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-primary-600">Erreur 404</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900">
        Page introuvable
      </h1>
      <p className="mt-3 text-gray-600">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button as={Link} href={ROUTES.HOME}>
          Retour à l'accueil
        </Button>
        <Button as={Link} href={ROUTES.SEARCH} variant="secondary">
          Rechercher un pro
        </Button>
      </div>
    </div>
  );
}
