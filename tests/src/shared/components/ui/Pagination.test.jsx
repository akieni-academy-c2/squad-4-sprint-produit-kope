import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pagination } from '@/shared/components/ui/Pagination.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';

/**
 * La barre de pagination.
 *
 * ## Ce que ces tests verrouillent
 *
 * Le bandeau — fond et bordure — est porté par le composant, pas passé par
 * l'appelant. Extrapolé, l'oubli est silencieux : la barre s'affiche sans rien
 * autour et flotte sur le fond de la page, à côté de cartes qui ont une
 * bordure. Cinq listes sur onze étaient dans ce cas, et rien ne le signalait.
 */

const render = (props) =>
  renderToStaticMarkup(<Pagination page={1} pageSize={10} total={50} onPageChange={() => {}} {...props} />);

/** Les classes de la carte, pour comparer. */
const CARD_SURFACE = renderToStaticMarkup(<Card>x</Card>).match(/class="([^"]*)"/)[1];

describe('habillage', () => {
  it('a le fond et la bordure, comme une carte', () => {
    const html = render();

    // Mêmes tokens que `Card` : la pagination doit se lire comme un objet de la
    // page, pas comme une barre posée à côté des cartes.
    expect(html).toContain('bg-white');
    expect(html).toContain('border-gray-200');
    expect(html).toContain('rounded-md');
  });

  it('reprend exactement la surface de Card', () => {
    const html = render();
    expect(html).toContain('rounded-md border border-gray-200 bg-white');
    // `Card` porte les mêmes trois propriétés — pas la même classe, mais les
    // mêmes jetons, ce qui est ce que l'œil compare.
    for (const token of ['rounded-md', 'border-gray-200', 'bg-white'])
      expect(CARD_SURFACE, `Card ne porte pas ${token}`).toContain(token);
  });

  it('garde son espacement avec la liste', () => {
    expect(render()).toContain('mt-4');
  });
});

describe('les deux variantes', () => {
  it('porte le bandeau, y compris en résumé', () => {
    // La variante `summary` a son propre `<nav>` : le bandeau devait y être
    // reporté aussi, sinon un des deux modes restait sans habillage.
    expect(render({ variant: 'summary' })).toContain('border-gray-200 bg-white');
  });

  it('garde ses classes propres', () => {
    expect(render({ variant: 'summary' })).toContain('justify-between');
    expect(render()).toContain('justify-center');
  });
});

describe('accessibilité', () => {
  it('se déclare comme navigation', () => {
    expect(render()).toContain('role="navigation"');
    expect(render()).toContain('aria-label="Pagination"');
  });

  it('marque la page courante', () => {
    expect(render({ page: 2 })).toContain('aria-current="page"');
  });

  it('désactive les extrémités', () => {
    const first = render({ page: 1 });
    expect(first).toMatch(/aria-label="Page précédente"[^>]*disabled|disabled[^>]*aria-label="Page précédente"/);
  });
});
