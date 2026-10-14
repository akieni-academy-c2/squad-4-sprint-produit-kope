/**
 * Enregistre le service worker, en production seulement : en développement il
 * sert la coquille en cache et masque les modifications de Vite. L'inscription
 * attend `load`, plus tot elle retarde la premiere interaction.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Sans service worker, l'application fonctionne : le cache est une
      // optimisation, pas une condition d'accès.
    });
  });
}