import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Règle de visibilité selon le rôle connecté.
 *
 *   non connecté  → tout visible, logo vers la home
 *   client         → « Comment ça marche » visible, logo vers son espace
 *   professionnel → ni « Comment ça marche » ni « Devenir prestataire », logo vers son espace
 *   administrateur → idem professionnel, logo vers l'administration
 *
 * Ces tests verrouillent la règle : la condition vit dans AuthContext, mais
 * chaque surface doit rester cohérente avec elle.
 */

const { authState } = vi.hoisted(() => ({ authState: { current: null, loading: false } }));

vi.mock('../src/shared/context/AuthContext.jsx', () => ({
  useAuthContext: () => ({
    user: authState.current,
    loading: authState.loading,
    hasRole: (role) => authState.current?.role === role,
    isServiceProvider: Boolean(
      authState.current
      && ['professional', 'admin'].includes(authState.current.role),
    ),
  }),
}));

vi.mock('../src/shared/context/AuthModalContext.jsx', () => ({
  useAuthModal: () => ({ open: vi.fn() }),
}));

// La home déclenche plusieurs appels réseau : on les neutralise pour n'observer
// que la structure rendue.
vi.mock('../src/shared/hooks/useAsyncData.js', () => ({
  useAsyncData: () => ({ data: { items: [] }, loading: false, error: null, reload: vi.fn() }),
}));

const { Navbar } = await import('../src/shared/components/layout/Navbar.jsx');
const { HomePage } = await import('../src/pages/HomePage.jsx');
const { HomeRoute } = await import('../src/routes/HomeRoute.jsx');
const { landingHrefFor, dashboardHref } = await import('../src/shared/utils/userMenuUtils.js');

const render = (element) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

function connectAs(role) {
  authState.current = role ? { id: 1, role, firstName: 'Ama', lastName: 'B' } : null;
}

beforeEach(() => {
  authState.loading = false;
  connectAs(null);
});

describe('Navbar', () => {
  it('montre tous les liens et renvoie le logo vers la home si non connecté', () => {
    const html = render(<Navbar />);

    expect(html).toContain('Comment ça marche');
    expect(html).toContain('Devenir Prestataire');
    expect(html).toContain('href="/"');
  });

  it('réduit la navigation à la recherche pour un client', () => {
    connectAs('client');
    const html = render(<Navbar />);

    expect(html).not.toContain('Comment ça marche');
    expect(html).not.toContain('Devenir Prestataire');
    expect(html).toContain('Trouver un professionnel');
  });

  it('envoie le logo vers la recherche pour un client', () => {
    // Un client n'a pas de page à gérer : la recherche est son point d'entrée.
    connectAs('client');
    expect(render(<Navbar />)).toContain('href="/search"');
  });

  it('masque les deux liens pour un professionnel', () => {
    connectAs('professional');
    const html = render(<Navbar />);

    expect(html).not.toContain('Comment ça marche');
    expect(html).not.toContain('Devenir Prestataire');
    expect(html).toContain('Trouver un professionnel');
  });

  it('envoie le logo vers l\'espace professionnel', () => {
    connectAs('professional');
    expect(render(<Navbar />)).toContain('href="/dashboard/pro"');
  });

  it('masque les deux liens pour un administrateur', () => {
    connectAs('admin');
    const html = render(<Navbar />);

    expect(html).not.toContain('Comment ça marche');
    expect(html).not.toContain('Devenir Prestataire');
  });

  it('envoie le logo vers l\'administration', () => {
    connectAs('admin');
    expect(render(<Navbar />)).toContain('href="/admin"');
  });
});

describe('Recherche dans la navigation', () => {
  it('reste un lien simple si non connecté', () => {
    const html = render(<Navbar />);

    // Pas d'apparence de bouton : le visiteur n'a pas d'action principale.
    expect(html).toContain('Trouver un professionnel');
    expect(html).toContain('href="/search"');
    expect(html).not.toContain('border-gray-300 bg-white/25');
  });

  it('devient un bouton marqué pour un client', () => {
    connectAs('client');
    const html = render(<Navbar />);

    expect(html).toContain('border-gray-300 bg-white/25');
    expect(html).toContain('href="/search"');
  });

  it('reste un bouton marqué pour un professionnel', () => {
    connectAs('professional');
    expect(render(<Navbar />)).toContain('border-gray-300 bg-white/25');
  });

  it('reste un bouton marqué pour un administrateur', () => {
    connectAs('admin');
    expect(render(<Navbar />)).toContain('border-gray-300 bg-white/25');
  });

  it('continue de mener vers /search', () => {
    // Le style change, la destination non : c'est la même action.
    connectAs('professional');

    const html = render(<Navbar />);
    const searchLinks = html.match(/href="\/search"/g) ?? [];

    expect(searchLinks.length).toBeGreaterThan(0);
  });

  it('n\'affiche qu\'un seul lien de recherche', () => {
    // Desktop et menu mobile en comptent deux, mais chaque surface une seule.
    for (const role of [null, 'client', 'professional', 'admin']) {
      connectAs(role);
      const desktop = render(<Navbar />);
      expect(desktop.split('href="/search"').length - 1, String(role)).toBeLessThanOrEqual(2);
    }
  });
});

describe('HomePage', () => {
  it('affiche « Comment ça marche » et le bouton devenir pro si non connecté', () => {
    const html = render(<HomePage />);

    expect(html).toContain('Vous avez le savoir-faire');
    expect(html).toContain('Cherchez près de chez vous');
  });

  it('conserve les deux sections pour un client', () => {
    connectAs('client');
    const html = render(<HomePage />);

    expect(html).toContain('Vous avez le savoir-faire');
    expect(html).toContain('Cherchez près de chez vous');
  });

  it('retire les deux sections pour un professionnel', () => {
    connectAs('professional');
    const html = render(<HomePage />);

    expect(html).not.toContain('Vous avez le savoir-faire');
    expect(html).not.toContain('Cherchez près de chez vous');
  });

  it('retire les deux sections pour un administrateur', () => {
    connectAs('admin');
    const html = render(<HomePage />);

    expect(html).not.toContain('Vous avez le savoir-faire');
    expect(html).not.toContain('Cherchez près de chez vous');
  });

  it('garde le reste de la page intact', () => {
    const html = render(<HomePage />);

    // Le hero et la FAQ ne dépendent pas du rôle : ils doivent survivre.
    expect(html).toContain('Le bon artisan');
    expect(html).toContain('Faut-il un compte pour chercher');
  });
});

describe('Redirection de /', () => {
  /**
   * `<Navigate>` ne se déclenche qu'au montage, donc le rendu statique ne peut
   * pas l'observer. C'est la décision — fonction pure — qui est testée ici, et
   * le composant ne fait plus qu'appliquer son résultat.
   */
  it('renvoie le client vers la recherche et les autres vers leur gestion', () => {
    expect(landingHrefFor({ role: 'client' })).toBe('/search');
    expect(landingHrefFor({ role: 'professional' })).toBe('/dashboard/pro');
    expect(landingHrefFor({ role: 'admin' })).toBe('/admin');
  });

  it('laisse la home à qui n\'est pas connecté', () => {
    expect(landingHrefFor(null)).toBe('/');
    expect(landingHrefFor(undefined)).toBe('/');
  });

  it('donne la même destination que le logo', () => {
    for (const role of ['client', 'professional', 'admin']) {
      connectAs(role);
      expect(render(<Navbar />), role).toContain(`href="${landingHrefFor({ role })}"`);
    }
  });

  it('laisse l\'espace client accessible depuis le menu', () => {
    // Le logo mène à la recherche, mais le tableau de bord ne disparaît pas :
    // il reste atteignable par « Mon espace ».
    expect(dashboardHref('client')).toBe('/dashboard/client');
  });

  it('affiche la home quand personne n\'est connecté', () => {
    expect(render(<HomeRoute><p>ACCUEIL</p></HomeRoute>)).toContain('ACCUEIL');
  });

  it('n\'affiche rien avant la fin du chargement de session', () => {
    // `user` est encore inconnu : décider maintenant afficherait la home avant
    // de la quitter, visible à chaque rechargement.
    connectAs('client');
    authState.loading = true;

    expect(render(<HomeRoute><p>ACCUEIL</p></HomeRoute>)).toBe('');
  });
});