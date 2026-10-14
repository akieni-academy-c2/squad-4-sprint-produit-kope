import fs from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import { repoPath } from '../support/repoRoot.js';

function makeResponse({ status = 200, type = 'basic' } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    type,
    clone: vi.fn(() => ({ ok: true, status, type })),
  };
}

function loadServiceWorker({ fetchImpl, cached, addImpl, openCache, onOpen } = {}) {
  const source = fs.readFileSync(repoPath('public/sw.js'), 'utf8');
  const listeners = {};
  const cache = openCache ?? {
    add: addImpl ?? vi.fn().mockResolvedValue(undefined),
    put: vi.fn().mockResolvedValue(undefined),
  };
  const sandbox = {
    self: {
      addEventListener: (type, handler) => {
        listeners[type] = handler;
      },
      skipWaiting: vi.fn(),
      clients: { claim: vi.fn() },
      location: new URL('https://kop.example/'),
    },
    caches: {
      open: vi.fn(() => {
        onOpen?.();
        return Promise.resolve(cache);
      }),
      match: vi.fn().mockResolvedValue(cached),
      keys: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(true),
    },
    fetch: fetchImpl ?? vi.fn(),
    Request: class {},
    Response: { error: () => ({ type: 'error' }) },
    URL,
    Promise,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return { listeners, cache, serviceWorker: sandbox.self, fetchImpl: sandbox.fetch };
}

function dispatch(listeners, url, mode = 'no-cors') {
  const event = {
    request: { method: 'GET', url, mode },
    waitUntil: vi.fn((p) => p),
    respondWith: vi.fn(),
  };
  listeners.fetch(event);
  return event;
}

describe('service worker', () => {
  it('laisse passer les polices tierces', () => {
    const { listeners } = loadServiceWorker();
    const event = dispatch(listeners, 'https://fonts.gstatic.com/s/inter/v1/UcC73.woff2');

    expect(event.respondWith).not.toHaveBeenCalled();
  });

  it('laisse passer les appels api', () => {
    const { listeners } = loadServiceWorker();
    const event = dispatch(listeners, 'https://kop.example/api/professionals');

    expect(event.respondWith).not.toHaveBeenCalled();
  });

  it('clone de maniere synchrone, avant toute ecriture en cache', async () => {
    const order = [];
    const response = {
      ok: true,
      status: 200,
      type: 'basic',
      clone: vi.fn(() => {
        order.push('clone');
        return { ok: true, status: 200, type: 'basic' };
      }),
    };
    const cache = {
      add: vi.fn().mockResolvedValue(undefined),
      put: vi.fn(() => {
        order.push('put');
        return Promise.resolve();
      }),
    };

    const { listeners } = loadServiceWorker({
      fetchImpl: vi.fn().mockResolvedValue(response),
      openCache: cache,
      onOpen: () => order.push('open'),
    });

    const event = dispatch(listeners, 'https://kop.example/assets/app-1234.js');
    await event.respondWith.mock.calls[0][0];
    await event.waitUntil.mock.calls[0][0];

    expect(order).toEqual(['clone', 'open', 'put']);
  });

  it('ignore une reponse partielle', async () => {
    const response = makeResponse({ status: 206 });
    const { listeners, cache } = loadServiceWorker({ fetchImpl: vi.fn().mockResolvedValue(response) });

    const event = dispatch(listeners, 'https://kop.example/assets/font-9876.woff2');
    await event.respondWith.mock.calls[0][0];

    expect(cache.put).not.toHaveBeenCalled();
  });

  it('ignore une reponse opaque', async () => {
    const response = makeResponse({ status: 200, type: 'opaque' });
    const { listeners, cache } = loadServiceWorker({ fetchImpl: vi.fn().mockResolvedValue(response) });

    const event = dispatch(listeners, 'https://kop.example/assets/photo.webp');
    await event.respondWith.mock.calls[0][0];

    expect(cache.put).not.toHaveBeenCalled();
  });

  it('sert le cache sans relancer de requete', async () => {
    const cached = makeResponse();
    const fetchImpl = vi.fn();
    const { listeners } = loadServiceWorker({ fetchImpl, cached });

    const event = dispatch(listeners, 'https://kop.example/assets/app-1234.js');
    const served = await event.respondWith.mock.calls[0][0];

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(served).toBe(cached);
  });

  it('termine l installation meme si une url du shell echoue', async () => {
    const { listeners, serviceWorker } = loadServiceWorker({ addImpl: vi.fn().mockRejectedValue(new Error('404')) });

    let pending;
    listeners.install({ waitUntil: (p) => { pending = p; } });
    await pending;

    expect(serviceWorker.skipWaiting).toHaveBeenCalled();
  });
});