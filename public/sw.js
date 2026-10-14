/**
 * Service worker de nettoyage (tombstone) KOP.
 * Le worker de coquille retiré en be84e34 reste enregistré chez les visiteurs
 * qui l'ont installé : une inscription service worker survit au code qui l'a
 * créée et garde le contrôle de `scope: '/'`. Tant qu'il contrôle, ses
 * `Response.error()` cassent chaque `/assets/*` après un déploiement, Vite
 * renommant chaque fichier à chaque build.
 *
 * Ce fichier le remplace, purge les caches et se désenregistre. Il doit rester
 * déployé tant que des inscriptions subsistent : sans lui, `/sw.js` retombe sur
 * index.html et la mise à jour est refusée (type MIME text/html).
 */

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  const unregister = () => self.registration.unregister();

  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(unregister, unregister),
  );
});