import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '@/shared/components/layout/Navbar.jsx';
import { AuthProvider } from '@/shared/context/AuthContext.jsx';
import { NotificationProvider } from '@/shared/context/NotificationContext.jsx';
import { AuthModalProvider } from '@/shared/context/AuthModalContext.jsx';
import { ROUTES } from '@/shared/lib/constants.js';

/**
 * La barre de navigation.
 *
 * Deux choses sont verrouillées ici, toutes deux à la suite de défauts
 * observés.
 */

/** La barre rendue à une adresse de départ. */
function render({ at = '/' } = {}) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[at]}>
      <NotificationProvider>
        <AuthProvider>
          <AuthModalProvider>
            <Navbar />
          </AuthModalProvider>
        </AuthProvider>
      </NotificationProvider>
    </MemoryRouter>,
  );
}

/**
 * `NavLink` vient de react-router et prend `to` ; notre `Link` prend `href`.
 *
 * Les deux portent le même nom dans le projet, et l'un annule silencieusement
 * l'attribut de l'autre : `<NavLink href>` rend un lien vers l'adresse
 * courante au lieu de la destination. Tous les onglets paraissent alors actifs
 * et mènent à `/`.
 *
 * Ce test porte le nom de la destination : il échoue si un onglet cesse de
 * pointer quelque part.
 */
describe('Destinations de la barre', () => {
  it('envoie chaque onglet vers sa page', () => {
    const html = render();

    expect(html).toContain(`href="${ROUTES.SEARCH}"`);
    expect(html).toContain(`href="${ROUTES.HOW_IT_WORKS}"`);
  });

  it('nhibernate aucun onglet', () => {
    // Régression : `to` absent résolvait vers l'adresse courante. Le rendu
    // produisait alors quatre liens vers `/` — on ne le voyait qu'en cliquant.
    const html = render();
    const hrefs = [...html.matchAll(/<a[^>]*\shref="([^"]*)"/g)].map((m) => m[1]);

    expect(hrefs.length).toBeGreaterThan(2);
    expect(hrefs.every((href) => href === ROUTES.SEARCH || href === ROUTES.HOW_IT_WORKS || href === '/')).toBe(true);
    expect(hrefs).toContain(ROUTES.SEARCH);
    expect(hrefs).toContain(ROUTES.HOW_IT_WORKS);
  });

  it('marque actif le seul onglet de la page courante', () => {
    // Régression inverse : sans destination, chaque `NavLink` se croyait actif
    // et les trois entrées se soulignaient à la fois.
    expect(render({ at: '/' })).not.toContain('nav-link-active');
    expect(render({ at: ROUTES.HOW_IT_WORKS })).toContain('nav-link-active');
    expect(render({ at: ROUTES.SEARCH })).toContain('nav-link-active');
  });
});

/**
 * Le sélecteur de rôle est demandé « juste à côté du logo ».
 *
 * Il doit donc exister sur toutes les tailles d'écran - sur mobile il n'y a plus
 * de barre de navigation, mais l'outil de démonstration doit rester accessible,
 * sinon il devient impossible de changer de rôle sur un téléphone.
 */
describe('Sélecteur de rôle dans la barre', () => {
  it('est présent dans le rendu', () => {
    // L'apostrophe est échappée en &#x27; dans le HTML sérialisé.
    expect(render()).toContain('Tester l&#x27;application avec des données fictives');
  });

  it('affiche une entrée par défaut', () => {
    // Sans indication, l'utilisateur ne sait pas qu'il s'agit d'un outil de test.
    expect(render()).toContain('Démo');
  });

  it('garde le logo comme lien principal', () => {
    const html = render();

    expect(html).toContain('KOP');
    expect(html).toContain('href="/"');
  });

  it('reste un bouton avec menu, pas un lien de navigation', () => {
    const html = render();

    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
  });
});

describe('Justification du header sur mobile', () => {
  it('cale le bouton menu à droite quand la nav desktop est masquée', () => {
    // La barre desktop disparaît sous `md`. Le groupe mobile doit alors venir
    // au bord droit sans dépendre d'une marge automatique portée par un élément
    // qui n'est plus dans le flux — d'où le positionnement absolute.
    //
    // Le test vérifiait autrefois `ml-auto md:ml-0`, la recette CSS d'avant. Il
    // vérifie désormais le mécanisme retenu.
    expect(render()).toContain('absolute right-3');
  });
});
