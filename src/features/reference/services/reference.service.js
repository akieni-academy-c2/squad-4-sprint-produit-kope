import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { cached, cacheGet, cacheInvalidate } from '@/shared/lib/cache.js';
import { MOCK_CITIES, MOCK_TRADES, MOCK_ZONES } from '@/shared/mocks/appMock.js';

export function listTrades() {
  return cached('reference:trades', 5 * 60_000, () =>
    callApi(
      () => api.get('/trades').then((r) => r.trades || []),
      async () => MOCK_TRADES,
    ),
  );
}

export function listZones() {
  return cached('reference:zones', 5 * 60_000, () =>
    callApi(
      () => api.get('/zones').then((r) => r.zones || []),
      async () => MOCK_ZONES,
    ),
  );
}

export function listCities() {
  return cached('reference:cities', 5 * 60_000, () =>
    callApi(
      () => api.get('/cities').then((r) => r.cities || []),
      async () => MOCK_CITIES,
    ),
  );
}

export function invalidateReferenceCache() {
  cacheInvalidate('reference:');
}

/**
 * Lecture synchrone du cache, sans requête ni promesse.
 *
 * Permet au hook de démarrer avec des données déjà en mémoire : sans cela, un
 * simple aller-retour sur la page réaffiche les squelettes pendant une frame,
 * alors que la réponse est disponible immédiatement.
 */
export function peekReferenceData() {
  return {
    trades: cacheGet('reference:trades'),
    zones: cacheGet('reference:zones'),
    cities: cacheGet('reference:cities'),
  };
}