import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

/**
 * Isolation de la page d'accueil vis-à-vis du service de portraits.
 *
 * Les personas ne doivent servir que la recherche en démonstration. Sur
 * l'accueil, une carte qui affiche `avatarUrl` laissait fuiter un portrait
 * distant alors que la consigne est l'inverse.
 */

vi.mock('../src/shared/hooks/useAsyncData.js', () => ({
  useAsyncData: () => ({ data: { items: [] }, loading: false, error: null, reload: vi.fn() }),
}));

const { ProfessionalCard } = await import('../src/features/professionals/components/ProfessionalCard.jsx');
const { HOME_RESERVED } = await import('../src/shared/content/homeImages.js');
const { reserveImage } = await import('../src/shared/assets/placeholders.js');

/** Ce que le service de personas fournit comme portrait. */
const PORTRAIT = 'https://persona-portraits.osirisbalonga.workers.dev/portraits/v1/medium/p_0001.webp';

const render = (element) => renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

const PRO = {
  id: 7,
  displayName: 'Daniel Adoua',
  trade: 'Plombier',
  zones: [{ name: 'Poto-Poto' }],
  yearsExperience: 5,
  isAvailable: true,
  rating: { average: 4.6, count: 12 },
  avatarUrl: PORTRAIT,
  image: PORTRAIT,
};

describe('Cartes de la page d\'accueil', () => {
  it('ignore le portrait du service quand la carte est en avant-première', () => {
    const html = render(<ProfessionalCard mode="grid" item={PRO} homePreview />);

    expect(html).not.toContain('persona-portraits');
    expect(html).not.toContain(PORTRAIT);
    expect(html).toContain('data:image/svg+xml');
  });

  it('donne un visuel distinct par professionnel', () => {
    const a = render(<ProfessionalCard mode="grid" item={{ ...PRO, id: 1 }} homePreview />);
    const b = render(<ProfessionalCard mode="grid" item={{ ...PRO, id: 2 }} homePreview />);

    expect(a).not.toBe(b);
  });

  it('utilise le portrait du professionnel ailleurs', () => {
    // La recherche, elle, doit montrer la vraie photo.
    const html = render(<ProfessionalCard mode="list" item={PRO} />);

    expect(html).toContain(PORTRAIT);
  });
});

describe('Aucune image distante sur l\'accueil', () => {
  const homeFiles = [
    '../src/pages/HomePage.jsx',
    '../src/shared/components/home/CategorySection.jsx',
    '../src/shared/components/home/FeaturedProfessionalSection.jsx',
    '../src/shared/components/home/TrustSection.jsx',
    '../src/shared/components/home/ProCTA.jsx',
    '../src/shared/components/home/ZoneSection.jsx',
    '../src/shared/components/home/FAQSection.jsx',
    '../src/shared/components/home/FinalCTA.jsx',
    '../src/shared/components/home/HeroSection.jsx',
    '../src/shared/content/homeImages.js',
    '../src/shared/content/highlightedTrades.js',
  ];

  it.each(homeFiles)('%s ne référence aucun service de portraits', (path) => {
    const source = readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');

    expect(source).not.toContain('persona-portraits');
    expect(source).not.toContain('persona-dev');
  });

  it('passe bien l\'option sur la section des professionnels mis en avant', () => {
    const source = readFileSync(
      fileURLToPath(new URL('../src/shared/components/home/FeaturedProfessionalSection.jsx', import.meta.url)),
      'utf8',
    );

    expect(source).toContain('homePreview');
  });

  it('n\'attribue jamais deux fois le même visuel', () => {
    const trust = reserveImage('confiance', HOME_RESERVED.upTo('trust'));
    const cta = reserveImage('devenir-prestataire', HOME_RESERVED.upTo('cta'));

    expect(HOME_RESERVED.upTo('trust')).not.toContain(trust);
    expect(HOME_RESERVED.upTo('cta')).not.toContain(cta);
    expect(trust).not.toBe(cta);
  });
});