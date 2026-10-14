import { describe, expect, it, vi } from 'vitest';
import { repoPath } from '@test/support/repoRoot.js';
import { readFileSync } from 'node:fs';

import { searchQuerySchema } from '@server/modules/search/search.schemas.js';

const repositoryMock = vi.hoisted(() => ({
  searchPublished: vi.fn().mockResolvedValue([]),
  countPublished: vi.fn().mockResolvedValue(0),
}));

vi.mock('@server/modules/search/search.repository.js', async (importOriginal) => ({
  ...(await importOriginal()),
  searchPublished: repositoryMock.searchPublished,
  countPublished: repositoryMock.countPublished,
}));

const { searchPublished, countPublished } = await vi.importActual(
  '@server/modules/search/search.repository.js',
);
const { search } = await import('@server/modules/search/search.service.js');


describe('Filtre ville', () => {
  const db = () => ({ query: vi.fn().mockResolvedValue({ rows: [] }) });

  it('accepte un identifiant de ville dans la requête', () => {
    const parsed = searchQuerySchema.parse({ city: '2' });
    expect(parsed.city).toBe(2);
  });

  it('traite une ville vide comme absente', () => {
    expect(searchQuerySchema.parse({ city: '' }).city).toBeUndefined();
  });

  it('refuse une ville hors limites', () => {
    expect(searchQuerySchema.safeParse({ city: '99999' }).success).toBe(false);
  });

  it('filtre la liste sur la ville du professionnel', async () => {
    const conn = db();

    await searchPublished({ cityId: 2, limit: 10, offset: 0 }, conn);

    const [sql, values] = conn.query.mock.calls[0];
    expect(sql).toContain('z.city_id = $9');
    expect(sql).toContain('professional_zones');
    expect(values.at(-1)).toBe(2);
  });

  it('filtre le compteur sur la même ville', async () => {
    const conn = db();

    await countPublished({ cityId: 2 }, conn);

    const [sql, values] = conn.query.mock.calls[0];
    expect(sql).toContain('z.city_id = $7');
    expect(values.at(-1)).toBe(2);
  });

  it('laisse passer sans ville quand le critère est absent', async () => {
    const conn = db();

    await searchPublished({ cityId: null, limit: 10, offset: 0 }, conn);

    expect(conn.query.mock.calls[0][1].at(-1)).toBeNull();
  });

  it('transmet la ville du service au repository', async () => {
    await search({ city: 2, page: 1 });

    expect(repositoryMock.searchPublished).toHaveBeenCalledWith(
      expect.objectContaining({ cityId: 2 }),
    );
    expect(repositoryMock.countPublished).toHaveBeenCalledWith(
      expect.objectContaining({ cityId: 2 }),
    );
  });

  it('laisse la ville nulle quand elle est absente', async () => {
    await search({ page: 1 });

    expect(repositoryMock.searchPublished).toHaveBeenCalledWith(
      expect.objectContaining({ cityId: null }),
    );
  });
});

describe('Page de recherche', () => {
  const source = readFileSync(
    repoPath('src/features/search/pages/SearchPage.jsx'),
    'utf8',
  );
  const filters = readFileSync(
    repoPath('src/features/search/components/SearchFilters.jsx'),
    'utf8',
  );

  it('ne rend pas le titre visible', () => {
    expect(source).toContain('<h1 className="sr-only">');
    expect(source).not.toContain('text-2xl font-extrabold tracking-tight text-gray-900">\n              {trade');
  });

  it('place la ville avant la zone', () => {
    const ville = filters.indexOf('sf-city-sb');
    const zone = filters.indexOf('sf-zone-sb');

    expect(ville).toBeGreaterThan(-1);
    expect(zone).toBeGreaterThan(-1);
    expect(ville).toBeLessThan(zone);
  });

  it('restreint les zones a la ville choisie', () => {
    expect(filters).toContain('zones.filter((z) => String(z.cityId) === String(cityValue))');
  });

  it('reinitialise la zone quand la ville change', () => {
    expect(filters).toContain("setZoneValue('')");
  });

  it('desactive Rechercher tant qu\'aucun critere n\'est renseigne', () => {
    expect(filters).toContain('disabled={!hasCriteria}');
  });
});