import { describe, expect, it } from 'vitest';
import { repoPath } from '@test/support/repoRoot.js';
import { readFileSync } from 'node:fs';
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

const { PORTRAIT, HIGHLIGHT_ITEMS } = vi.hoisted(() => {
  const portrait = 'https://persona-portraits.osirisbalonga.workers.dev/portraits/v1/medium/p_0001.webp';
  return {
    PORTRAIT: portrait,
    HIGHLIGHT_ITEMS: [1, 2, 3].map((id) => ({
      id,
      displayName: `Pro ${id}`,
      trade: 'Plombier',
      zones: [{ name: 'Poto-Poto' }],
      yearsExperience: 4,
      isAvailable: true,
      rating: { average: 4.5, count: 6 },
      // Le service de personas fournit un portrait distant : l'accueil ne doit
      // pas le reprendre.
      avatarUrl: portrait,
      image: portrait,
    })),
  };
});

vi.mock('@/shared/hooks/useAsyncData.js', () => ({
  useAsyncData: () => ({ data: { items: HIGHLIGHT_ITEMS }, loading: false, error: null, reload: vi.fn() }),
}));

const { ProfessionalCard } = await import('@/features/professionals/components/ProfessionalCard.jsx');
const { FeaturedProfessionalSection } = await import(
  '@/shared/components/home/FeaturedProfessionalSection.jsx'
);
const { FEATURED_FACES, HOME_RESERVED } = await import('@/shared/content/homeImages.js');
const { reserveImage } = await import('@/shared/assets/placeholders.js');

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

  it('affiche l’image locale fournie en avant-première', () => {
    const previewImage = '/assets/user1-audit.png';
    const html = render(<ProfessionalCard mode="grid" item={{ ...PRO, previewImage }} homePreview />);

    expect(html).toContain(previewImage);
    expect(html).not.toContain('data:image/svg+xml');
    expect(html).not.toContain('persona-portraits');
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

describe('Section des professionnels mis en avant', () => {
  it('affiche les visuels locaux de src/shared/assets pour chaque carte', () => {
    const html = render(<FeaturedProfessionalSection />);

    for (const face of FEATURED_FACES) expect(html).toContain(face);
    expect(html).not.toContain('persona-portraits');
    expect(html).not.toContain('data:image/svg+xml');
  });
});

describe('Aucune image distante sur l\'accueil', () => {
  const homeFiles = [
    '@/pages/HomePage.jsx',
    '@/shared/components/home/CategorySection.jsx',
    '@/shared/components/home/FeaturedProfessionalSection.jsx',
    '@/shared/components/home/TrustSection.jsx',
    '@/shared/components/home/ProCTA.jsx',
    '@/shared/components/home/ZoneSection.jsx',
    '@/shared/components/home/FAQSection.jsx',
    '@/shared/components/home/FinalCTA.jsx',
    '@/shared/components/home/HeroSection.jsx',
    '@/shared/content/homeImages.js',
    '@/shared/content/highlightedTrades.js',
  ];

  it.each(homeFiles)('%s ne référence aucun service de portraits', (path) => {
    // `homeFiles` liste des chemins d'alias `@/…`, forme lisible dans la liste ;
  // `repoPath` attend un chemin relatif à la racine du dépôt, d'où le `src/`.
  const source = readFileSync(repoPath('src', path.slice(2)), 'utf8');

    expect(source).not.toContain('persona-portraits');
    expect(source).not.toContain('persona-dev');
  });

  it('passe bien l\'option sur la section des professionnels mis en avant', () => {
    const source = readFileSync(
      repoPath('src/shared/components/home/FeaturedProfessionalSection.jsx'),
      'utf8',
    );

    expect(source).toContain('homePreview');
  });

  it('puise les visages de la section dans les images locales', () => {
    const source = readFileSync(
      repoPath('src/shared/components/home/FeaturedProfessionalSection.jsx'),
      'utf8',
    );

    // Les cartes mises en avant affichent les visuels de `src/shared/assets`,
    // pas un portrait distant ni un aplat généré.
    expect(source).toContain('FEATURED_FACES');
    expect(source).toContain('@/shared/content/homeImages.js');
    expect(source).toContain('previewImage');
  });

  it('n\'attribue jamais deux fois le même visuel', () => {
    const trust = reserveImage('confiance', HOME_RESERVED.upTo('trust'));
    const cta = reserveImage('devenir-prestataire', HOME_RESERVED.upTo('cta'));

    expect(HOME_RESERVED.upTo('trust')).not.toContain(trust);
    expect(HOME_RESERVED.upTo('cta')).not.toContain(cta);
    expect(trust).not.toBe(cta);
  });
});