import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ProfessionalCard } from '../src/features/professionals/components/ProfessionalCard.jsx';

/**
 * Mise en page des cartes de professionnels.
 *
 * Dans une carte étroite, l'étoile restait seule sur sa ligne et la moyenne
 * passait à la suivante : la note et le nombre d'avis doivent rester groupés.
 */

const render = (element) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

const PRO = {
  id: 7,
  displayName: 'Daniel Adoua',
  trade: 'Plombier',
  zones: [{ name: 'Poto-Poto' }],
  yearsExperience: 5,
  isAvailable: true,
  rating: { average: 4.6, count: 12 },
};

describe('ProfessionalCard — note', () => {
  it('garde l’étoile et la moyenne sur une seule ligne (grille)', () => {
    const html = render(<ProfessionalCard mode="grid" item={PRO} />);

    // Un seul conteneur insécable porte l'étoile ET le texte de la note.
    expect(
      html,
      'l’étoile et la moyenne doivent partager un conteneur `nowrap`',
    ).toMatch(/<span class="inline-flex items-center gap-1[^"]*whitespace-nowrap[^"]*"><svg[\s\S]*?avis<\/span>/);
    expect(html).toContain('4.6');
    expect(html).toContain('12 avis');
  });

  it('garde la note groupée en mode liste', () => {
    const html = render(<ProfessionalCard mode="list" item={PRO} />);

    expect(html).toMatch(/<span class="inline-flex items-center gap-1\.5 font-semibold text-gray-900">/);
    expect(html).toContain('4.6 (12 avis)');
  });

  it('annonce « Nouveau » quand le professionnel n’a aucun avis', () => {
    const html = render(
      <ProfessionalCard mode="grid" item={{ ...PRO, rating: { average: 0, count: 0 } }} />,
    );

    expect(html).toContain('Nouveau');
    expect(html).not.toContain('avis');
  });
});
