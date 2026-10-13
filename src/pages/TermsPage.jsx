import { useEffect } from 'react';
import { Link } from '@/shared/components/ui/Link.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { usePageTitle } from '@/shared/hooks/usePageTitle.js';
import { ROUTES } from '@/shared/lib/constants.js';
import { TERMS_SECTIONS, TERMS_VERSION } from '@/shared/content/terms.js';
import { SUPPORT_EMAIL } from '@/shared/constants/support.js';

/**
 * Conditions d'utilisation.
 *
 * ## La version est affichée, pas seulement liée
 *
 * Une case à cocher qui dit « j'accepte » sans dire **quoi** n'est pas un
 * consentement : deux ans plus tard, ni l'utilisateur ni l'exploitant ne
 * peuvent dire ce qui avait été lu. La version et sa date sont donc dans le
 * titre de la page, et le serveur enregistre celle qui a été acceptée.
 *
 * ## Un sommaire, parce que la page est longue
 *
 * Douze sections qu'on fait défiler sans savoir où on va. Le sommaire est collé
 * au bord haut de la colonne sur desktop : il est à côté de la lecture, pas
 * au-dessus d'elle. Sur mobile il tombe sous le titre, hors du chemin de
 * lecture.
 */
export function TermsPage() {
  usePageTitle('Conditions d’utilisation — KOP');

  // Un lien profond vers une section doit l'amener à l'écran : sans cela, le
  // navigateur positionne la vue avant que la mise en page soit faite, et le
  // curseur atterrit au milieu de la page.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, []);

  return (
    <div className="container-kop py-10 lg:py-16">
      <header className="max-w-3xl">
        <Link href={ROUTES.HOME} className="text-sm text-primary-700 hover:underline">
          ← Retour à l’accueil
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Conditions d’utilisation
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Version du {TERMS_VERSION}. C’est cette version qui est enregistrée à l’acceptation.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:items-start">
        <nav
          aria-label="Sommaire des conditions"
          className="rounded-md border border-gray-200 bg-white p-4 ${STICKY_TOP}"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Sommaire</p>
          <ol className="mt-3 space-y-1.5">
            {TERMS_SECTIONS.map((section, i) => (
              <li key={section.slug}>
                <a
                  href={`#${section.slug}`}
                  className="flex gap-2 text-sm text-gray-600 transition hover:text-primary-700 focus-ring rounded-sm"
                >
                  <span className="tabular-nums text-gray-400">{i + 1}.</span>
                  <span>{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 max-w-3xl">
          {TERMS_SECTIONS.map((section, i) => (
            <section
              key={section.slug}
              id={section.slug}
              className="scroll-mt-(--header-height) border-b border-gray-200 py-6 first:pt-0 last:border-0"
            >
              <h2 className="text-lg font-bold text-gray-900">
                <span className="mr-2 tabular-nums text-gray-400">{i + 1}.</span>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-3 text-[15px] leading-7 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <div className="mt-8 rounded-md border border-gray-200 bg-gray-50/70 p-5">
            <p className="text-sm leading-6 text-gray-700">
              Une question sur ces conditions ? Écrivez à{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-primary-700 hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <Button as={Link} href={ROUTES.REGISTER_CLIENT} variant="primary" size="md" className="mt-4">
              Créer mon compte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
