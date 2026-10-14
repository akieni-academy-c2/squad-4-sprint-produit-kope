import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Pagination } from '@/shared/components/ui/Pagination.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';

const render = (props) =>
  renderToStaticMarkup(<Pagination page={1} pageSize={10} total={50} onPageChange={() => {}} {...props} />);

const CARD_SURFACE = renderToStaticMarkup(<Card>x</Card>).match(/class="([^"]*)"/)[1];

describe('habillage', () => {
  it('a le fond et la bordure, comme une carte', () => {
    const html = render();

    expect(html).toContain('bg-white');
    expect(html).toContain('border-gray-200');
    expect(html).toContain('rounded-md');
  });

  it('reprend exactement la surface de Card', () => {
    const html = render();
    expect(html).toContain('rounded-md border border-gray-200 bg-white');
    for (const token of ['rounded-md', 'border-gray-200', 'bg-white'])
      expect(CARD_SURFACE, `Card ne porte pas ${token}`).toContain(token);
  });

  it('garde son espacement avec la liste', () => {
    expect(render()).toContain('mt-4');
  });
});

describe('les deux variantes', () => {
  it('porte le bandeau, y compris en résumé', () => {
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
