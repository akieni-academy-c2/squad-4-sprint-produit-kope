const VERSION = 'kope-v2';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

const SHELL_URLS = ['/', '/index.html', '/site.webmanifest', '/favicon.svg', '/icons.svg'];

const isSameOrigin = (url) => url.origin === self.location.origin;

const isBuildAsset = (url) => url.pathname.startsWith('/assets/');

function writeTo(cacheName, request, response, event) {
  if (!response || !response.ok) return;
  if (response.status === 206 || response.type === 'opaque') return;

  let copy;
  try {
    copy = response.clone();
  } catch {
    return;
  }

  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => cache.put(request, copy))
      .catch(() => undefined),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) =>
        Promise.allSettled(SHELL_URLS.map((url) => cache.add(new Request(url, { cache: 'reload' })))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) return;
  if (!isSameOrigin(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          writeTo(SHELL, '/index.html', response, event);
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached ?? Response.error())),
    );
    return;
  }

  if (!isBuildAsset(url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          writeTo(ASSETS, request, response, event);
          return response;
        })
        .catch(() => Response.error());
    }),
  );
});