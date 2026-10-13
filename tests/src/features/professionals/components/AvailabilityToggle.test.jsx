import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AvailabilityToggle } from '@/features/professionals/components/AvailabilityToggle.jsx';
import { ProfessionalCard } from '@/features/professionals/components/ProfessionalCard.jsx';
import { availabilitySchema } from '@server/modules/professionals/professionals.schemas.js';

const { searchPublished, setAvailability, useAsyncData } = vi.hoisted(() => ({
  searchPublished: vi.fn(),
  setAvailability: vi.fn(),
  useAsyncData: vi.fn(),
}));

vi.mock('@server/modules/search/search.repository.js', () => ({ searchPublished }));
vi.mock('@server/modules/professionals/professionals.service.js', () => ({ setAvailability }));
vi.mock('@/shared/hooks/useAsyncData.js', () => ({ useAsyncData }));
vi.mock('@/shared/context/AuthContext.jsx', () => ({
  useAuthContext: () => ({ user: null }),
}));
vi.mock('@/shared/context/AuthModalContext.jsx', () => ({
  useAuthModal: () => ({ open: vi.fn() }),
}));
vi.mock('@/features/reviews/components/index.js', () => ({
  RatingSummary: () => null,
  ReviewList: () => null,
  ReviewForm: () => null,
}));

import { search } from '@server/modules/search/search.service.js';
import { setAvailability as setAvailabilityController } from '@server/modules/professionals/professionals.controller.js';
import { ProfessionalPublicPage } from '@/features/professionals/pages/ProfessionalPublicPage.jsx';

function renderInRouter(element) {
  return renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);
}

describe('US-12 - disponibilité', () => {
  it('initialise le toggle à Disponible et expose son état accessible', () => {
    const html = renderToStaticMarkup(<AvailabilityToggle />);

    expect(html).toContain('Disponible');
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-label="Disponibilité"');
    expect(html).toContain('aria-checked="true"');
  });

  it('valide uniquement une valeur booléenne pour le changement de statut', () => {
    expect(availabilitySchema.safeParse({ isAvailable: true }).success).toBe(true);
    expect(availabilitySchema.safeParse({ isAvailable: false }).success).toBe(true);
    expect(availabilitySchema.safeParse({ isAvailable: 'false' }).success).toBe(false);
  });

  it('enregistre le choix du professionnel connecté depuis le contexte de session', async () => {
    const req = {
      session: { user: { id: 42, role: 'professional' } },
      validated: { body: { isAvailable: false } },
    };
    const res = { json: vi.fn() };

    await setAvailabilityController(req, res);

    expect(setAvailability).toHaveBeenCalledWith(42, false);
    expect(res.json).toHaveBeenCalledWith({ isAvailable: false });
  });

  it('affiche Indisponible sur les cartes de recherche sans retirer le professionnel', () => {
    const html = renderInRouter(
      <ProfessionalCard
        item={{ id: 12, displayName: 'Awa Artisan', trade: 'Menuisière', isAvailable: false }}
      />,
    );

    expect(html).toContain('Awa Artisan');
    expect(html).toContain('Indisponible');
  });

  it('affiche Indisponible sur la fiche publique du professionnel', () => {
    useAsyncData
      .mockReturnValueOnce({
        loading: false,
        error: null,
        data: {
          profile: {
            id: 12,
            displayName: 'Awa Artisan',
            trade: { name: 'Menuisière' },
            isAvailable: false,
            zones: [],
            phone: '0600000001',
          },
          photos: [],
          rating: { average: 0, count: 0 },
        },
      })
      .mockReturnValueOnce({ loading: false, error: null, data: false });

    const html = renderInRouter(<ProfessionalPublicPage />);

    expect(html).toContain('Awa Artisan');
    expect(html).toContain('Indisponible');
  });

  it('conserve les professionnels indisponibles dans les résultats API', async () => {
    searchPublished.mockResolvedValue([
      {
        id: 12,
        displayName: 'Awa Artisan',
        trade: 'Menuisière',
        zones: [],
        yearsExperience: 5,
        isAvailable: false,
        ratingAverage: null,
        ratingCount: 0,
        coverThumb: null,
        total: 1,
      },
    ]);

    const result = await search({ trade: 1, zone: null, page: 1 });

    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ id: 12, isAvailable: false });
  });
});
