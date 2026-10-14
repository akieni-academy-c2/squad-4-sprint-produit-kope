

/*
 * Service worker KOP.
 *
 * Coquille applicative et assets mis en cache (stale-while-revalidate) pour
 * ouvrir vite sur connexion lente. Les images de profil viennent de
 * Cloudinary, rien a tenir cote API.
 *
 * `/api/*` et toute requete non GET ne sont JAMAIS caches : une inscription,
 * un profil ou une liste de signalements servis depuis le cache exposeraient
 * des donnees perimees, voire celles d'un autre sur poste partage.
 */

const VERSION = 'kope-v1';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

const SHELL_URLS = ['/', '/index.html', '/site.webmanifest', '/favicon.svg', '/icons.svg'];

const isBuildAsset = (url) =>
  url.pathname.startsWith('/assets/') || /\.(?:css|js|woff2?|png|svg|webp)$/.test(url.pathname);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      // `reload` évite de figer une version périmée déjà en cache.
      .then((cache) => cache.addAll(SHELL_URLS.map((url) => new Request(url, { cache: 'reload' }))))
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

  // Règle non négociable : jamais de cache pour l'API, ni pour une écriture.
  if (request.method !== 'GET') return;
  if (new URL(request.url).pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    // Navigation : coquille servie d'abord, réseau en arrière-plan.
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(SHELL).then((cache) => cache.put('/index.html', response.clone()));
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached ?? Response.error())),
    );
    return;
  }

  if (!isBuildAsset(new URL(request.url))) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          // Seules les reponses 200 meritent le cache : une 404 mise en cache
          // le resterait, meme apres correction cote serveur.
          if (!response.ok) return response;
          caches.open(ASSETS).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => cached ?? Response.error());
      return cached ?? network;
    }),
  );
});