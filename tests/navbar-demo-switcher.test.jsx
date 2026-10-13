import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../src/shared/components/layout/Navbar.jsx';
import { AuthProvider } from '../src/shared/context/AuthContext.jsx';
import { NotificationProvider } from '../src/shared/context/NotificationContext.jsx';
import { AuthModalProvider } from '../src/shared/context/AuthModalContext.jsx';

/**
 * Le sélecteur de rôle est demandé « juste à côté du logo ».
 *
 * Il doit donc exister sur toutes les tailles d'écran - sur mobile il n'y a plus
 * de barre de navigation, mais l'outil de démonstration doit rester accessible,
 * sinon il devient impossible de changer de rôle sur un téléphone.
 */
function render() {
  return renderToStaticMarkup(
    <MemoryRouter>
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
  it('repousse le bouton menu à droite quand la nav desktop est masquée', () => {
    // La nav desktop (porteur du ml-auto) est en display:none sous md : sans
    // marge automatique sur le bouton hamburger, tout reste calé à gauche.
    // md:ml-0 rend la main au ml-auto de la nav dès qu'elle réapparaît.
    expect(render()).toContain('ml-auto md:ml-0');
  });
});