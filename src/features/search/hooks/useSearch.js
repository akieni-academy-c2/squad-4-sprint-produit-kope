import { useCallback, useEffect, useState } from 'react';
import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { searchMock } from '@/shared/mocks/appMock.js';
import { cached } from '@/shared/lib/cache.js';
import { PAGE_SIZE } from '@/shared/lib/constants.js';

const SESSION_NONCE = Math.floor(Math.random() * 1e9);

function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, seed) {
  const random = seededRandom(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function hashQuery(parts) {
  const seed = Object.values(parts).map((v) => String(v ?? '')).join('|');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash;
}

const ratingOf = (item) => Number(item?.rating?.average ?? 0);

export async function searchProfessionals({
  trade,
  zone,
  city,
  q,
  available,
  minRating,
  minExperience,
  page,
}) {
  const params = {};
  if (trade) params.trade = String(trade);
  if (zone) params.zone = String(zone);
  if (city) params.city = String(city);
  if (q) params.q = q;
  if (available != null && available !== '') params.available = String(available);
  if (minRating) params.minRating = String(minRating);
  if (minExperience) params.minExperience = String(minExperience);
  if (page) params.page = String(page);

  const cacheKey = [
    trade ?? '',
    zone ?? '',
    city ?? '',
    q ?? '',
    available ?? '',
    minRating ?? '',
    minExperience ?? '',
    page ?? 1,
  ].join(':');

  return callApi(
    () => cached(`search:${cacheKey}`, 30_000, () => api.get('/professionals', params)),
    async () =>
      searchMock({
        trade,
        zone,
        q,
        available: available === '' || available == null ? undefined : available === true || available === 'true',
        minRating,
        minExperience,
        page: page || 1,
        pageSize: PAGE_SIZE,
      }),
  );
}

export function useSearch({ trade, zone, city, q, available, minRating, minExperience, page, sort }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchProfessionals({
        trade,
        zone,
        city,
        q,
        available,
        minRating,
        minExperience,
        page: page || 1,
      });
      const items = data?.items ?? [];
      if (sort === 'rating')
        setResults({ ...data, items: [...items].sort((a, b) => ratingOf(b) - ratingOf(a)) });
      else if (sort === 'experience')
        setResults({ ...data, items: [...items].sort((a, b) => Number(b.yearsExperience ?? 0) - Number(a.yearsExperience ?? 0)) });
      else {
        const seed = SESSION_NONCE + hashQuery({ trade, zone, city, q, available, minRating, minExperience, page });
        setResults({ ...data, items: shuffle(items, seed) });
      }
    } catch (err) {
      setResults(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [trade, zone, city, q, available, minRating, minExperience, page, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run();
  }, [run]);

  return { results, loading, error, refresh: run };
}