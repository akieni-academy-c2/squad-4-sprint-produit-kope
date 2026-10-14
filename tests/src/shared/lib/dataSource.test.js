import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { callApi, isMockMode, enableMockMode, resetMockMode } from '@/shared/lib/dataSource.js';


beforeEach(() => {
  enableMockMode();
});

afterEach(() => {
  resetMockMode();
});

describe('dataSource - mode démonstration', () => {
  it('démarre en mode démo', () => {
    expect(isMockMode()).toBe(true);
  });

  it('l API n\'est plus appelée une fois le mode démo actif', async () => {
    const apiFn = vi.fn(async () => 'api-ok');
    const mockFn = vi.fn(async () => 'mock-ok');

    expect(await callApi(apiFn, mockFn)).toBe('mock-ok');
    expect(apiFn).not.toHaveBeenCalled();
  });

  it('« Quitter la démo » ramène à l\'API', async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => 'api-ok');
    const mockFn = vi.fn(async () => 'mock-ok');

    expect(isMockMode()).toBe(false);
    expect(await callApi(apiFn, mockFn)).toBe('api-ok');
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('revient à l\'API quand elle répond après la sortie de démo', async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => 'api-ok');
    const mockFn = vi.fn(async () => 'mock-ok');

    await callApi(apiFn, mockFn);
    expect(apiFn).toHaveBeenCalled();
  });
});

describe('dataSource.callApi en démo', () => {
  it('ne bascule pas sur erreur métier 409', async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => {
      throw Object.assign(new Error('déjà pris'), { status: 409 });
    });
    const mockFn = vi.fn(async () => 'mock-ok');

    await expect(callApi(apiFn, mockFn)).rejects.toThrow('déjà pris');
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('bascule sur erreur réseau quand la démo est sortie', async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => { throw new TypeError('fetch failed'); });
    const mockFn = vi.fn(async () => 'mock-ok');

    expect(await callApi(apiFn, mockFn)).toBe('mock-ok');
    expect(isMockMode()).toBe(true);
  });

  it('bascule sur erreur 5xx quand la démo est sortie', async () => {
    resetMockMode();
    const apiFn = vi.fn(async () => { throw Object.assign(new Error('down'), { status: 503 }); });
    const mockFn = vi.fn(async () => 'mock-ok');

    expect(await callApi(apiFn, mockFn)).toBe('mock-ok');
    expect(isMockMode()).toBe(true);
  });
});