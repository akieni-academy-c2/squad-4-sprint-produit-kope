import { beforeEach, describe, expect, it, vi } from 'vitest';
import { afterEach } from 'vitest';

vi.mock('../src/shared/lib/api.js', () => ({
  api: { get: vi.fn() },
}));

import { api } from '../src/shared/lib/api.js';
import { searchProfessionals } from '../src/features/search/hooks/useSearch.js';
import { enableMockMode, resetMockMode, isMockMode } from '../src/shared/lib/dataSource.js';

/**
 * Paramètres transmis à la recherche.
 *
 * Le mode démo est actif par défaut, donc l'API n'est pas appelée par défaut.
 * Ces tests vérifient donc la chaîne d'appel : sortir de la démo pour
 * contrôler la requête, y revenir pour contrôler les données affichées.
 */
beforeEach(() => {
  vi.clearAllMocks();
  resetMockMode();
});

afterEach(() => {
  enableMockMode();
});

describe('searchProfessionals - sortie de démo', () => {
  it('transmets métier, zone, mot-clé et page à l\'API', async () => {
    expect(isMockMode()).toBe(false);

    await searchProfessionals({ trade: '2', zone: '3', q: 'plombier', page: '2' });

    expect(api.get).toHaveBeenCalledWith('/professionals', {
      trade: '2',
      zone: '3',
      q: 'plombier',
      page: '2',
    });
  });

  it('accepte une recherche limitée à la zone', async () => {
    await searchProfessionals({ zone: '3' });

    expect(api.get).toHaveBeenCalledWith('/professionals', { zone: '3' });
  });
});

describe('searchProfessionals - mode démo', () => {
  it('renvoie des données fictives sans appeler l\'API', async () => {
    enableMockMode();

    const result = await searchProfessionals({ q: 'plombier' });

    expect(api.get).not.toHaveBeenCalled();
    expect(Array.isArray(result.items)).toBe(true);
  });

  it('applique le mot-clé aux données fictives', async () => {
    enableMockMode();

    const all = await searchProfessionals({});
    const filtered = await searchProfessionals({ q: 'zzzz-introuvable' });

    expect(filtered.items.length).toBeLessThan(all.items.length);
  });
});