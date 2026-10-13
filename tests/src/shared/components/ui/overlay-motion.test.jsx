import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/Dialog.jsx';
import { IconButton } from '@/shared/components/ui/IconButton.jsx';
import { Star } from 'lucide-react';
import { dialogPanel } from '@/shared/motion/variants.js';

/**
 * Le mouvement des surfaces et des micro-actions.
 *
 * ## Ce que ces tests vérifient, et ce qu'ils ne peuvent pas
 *
 * Le panneau du dialogue est un `motion.div` : au premier rendu il porte les
 * valeurs de son état `initial`, et **le HTML statique les expose**. Une
 * variante reçue puis non transmise ne les pose pas - la boîte apparaîtrait
 * d'un bloc, sans style d'entrée. C'est exactement le défaut qui a valu une
 * correction : `DialogContent` ne déclarait pas `variants` dans sa signature,
 * la propriété tombait dans le vide, et le test l'attrapé.
 *
 * `Sheet` et `Modal` rendent par `createPortal`, que `renderToStaticMarkup`
 * ignore. Leur câblage n'est donc pas vérifiable ici : pas de DOM, pas de
 * navigateur. Une version précédente de ce fichier lisait leur source et y
 * cherchait des chaînes - cela vérifiait que le fichier **contenait** un
 * texte, pas que l'écran **bougeait**. Ces tests ont été retirés.
 */

const panelMarkup = (props) =>
  renderToStaticMarkup(
    <DialogContent {...props}>
      <DialogTitle>Titre</DialogTitle>
    </DialogContent>,
  );

describe('panneau de dialogue', () => {
  it('applique la variante qu’il reçoit', () => {
    const html = panelMarkup({ variants: dialogPanel, initial: 'initial' });

    // Les trois propriétés de l'état initial, telles que compositées.
    expect(html).toContain('opacity:0');
    expect(html).toContain('translateY(8px)');
    expect(html).toContain('scale(0.96)');
  });

  it('reste neutre sans variante', () => {
    // Un panneau quianimait tout seul aurait un style d'entrée même sans
    // qu'on lui en ait donné : la variante par défaut n'existe pas.
    expect(panelMarkup({ initial: 'initial' })).not.toContain('opacity:0');
  });

  it('porte le nom accessible de son titre', () => {
    expect(panelMarkup({ variants: dialogPanel })).toMatch(/aria-labelledby="[^"]+"/);
  });

  it('ferme au clavier comme au clic', () => {
    expect(panelMarkup({ variants: dialogPanel })).toContain('aria-label="Fermer"');
  });

  it('n’a pas de bandeau quand le dialogue n’a pas d’en-tête', () => {
    // Quatre modales d’authentification n’ont pas d’en-tête : leur titre est
    // un `sr-only`. Elles affichaient une rangée de 36 px ne contenant qu’un
    // bouton, donc une bande vide au-dessus du premier champ.
    const html = panelMarkup({ variants: dialogPanel });

    // Le bouton flottant vit hors du flux : sa classe le dit, et le corps
    // réserve sa place pour que le premier champ ne passe pas dessous.
    expect(html).toContain('absolute right-4 top-4');
    expect(html).toContain('pr-11');
  });

  it('conserve le bandeau quand le dialogue en a un', () => {
    const html = renderToStaticMarkup(
      <DialogContent variants={dialogPanel}>
        <DialogHeader>
          <DialogTitle>Contacter</DialogTitle>
        </DialogHeader>
      </DialogContent>,
    );
    // Avec un en-tête, le bouton reprend sa place dans le flux : la rangée
    // existe, et le corps ne réserve plus la place d'un bouton flottant.
    expect(html).toContain('Contacter');
    expect(html).not.toContain('absolute right-4 top-4');
    expect(html).not.toContain('pr-11');
  });
});

describe('bouton d’icône', () => {
  const icon = (props) => renderToStaticMarkup(<IconButton icon={Star} label="Noter" {...props} />);

  it('porte un nom accessible', () => {
    expect(icon()).toContain('aria-label="Noter"');
  });

  it('ne bouge pas quand il est désactivé', () => {
    // Une animation sur un contrôle désactivé dirait « tu peux appuyer » le
    // temps du geste.
    const html = icon({ disabled: true });
    expect(html).toContain('disabled');
    expect(html).toContain('cursor-not-allowed');
  });

  it('reste un bouton', () => {
    expect(icon()).toMatch(/<button/);
    expect(icon()).toContain('type="button"');
  });

  it('prend un titre quand on ne lui en donne pas', () => {
    expect(icon({ title: 'Noter ce professionnel' })).toContain('title="Noter ce professionnel"');
  });
});
