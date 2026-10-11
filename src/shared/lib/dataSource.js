import { useSyncExternalStore } from 'react';

/**
 * Activation de la démo par variable d'environnement.
 *
 * `VITE_USE_MOCKS=false` désactive le mode démo. Absente, la démo est active :
 * le projet doit démarrer et être manipulable sans base de données ni backend.
 *
 * La comparaison ignore la casse et les espaces : un .env écrit à la main
 * contient souvent « false » encadré, et une variable apparemment ignorée est
 * plus difficile à diagnostiquer qu'une désactivation franche.
 */
const forcedMocks = String(import.meta.env?.VITE_USE_MOCKS ?? '')
  .trim()
  .toLowerCase() !== 'false';

let mockMode = forcedMocks === true;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

export function isMockMode() {
  return mockMode;
}

export function enableMockMode() {
  if (mockMode) return;
  // Le mode démo est activé par défaut, y compris en production : ce projet se
  // manipule sans base de données. Seul VITE_USE_MOCKS=false l'interdit, et
  // resetMockMode reste alors sans effet.
  mockMode = true;
  notify();
}

export function resetMockMode() {
  // Une désactivation demandée par l'environnement prime sur le sélecteur :
  // « Quitter la démo » ne doit pas rouvrir un mode que l'on a interdit.
  if (!forcedMocks) return;
  mockMode = false;
  notify();
}

export function subscribeMockMode(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useMockMode() {
  return useSyncExternalStore(subscribeMockMode, isMockMode, () => false);
}

function isUnavailable(err) {
  if (!err) return false;
  if (err instanceof TypeError) return true; // fetch réseau en échec
  if (typeof err.status === 'number' && err.status >= 500) return true;
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') return true;
  return false;
}

export async function callApi(apiFn, mockFn) {
  if (mockMode) return mockFn();
  try {
    return await apiFn();
  } catch (err) {
    // Démo désactivée par l'environnement : le repli sur les mocks serait
    // contraire à la demande, l'erreur remonte.
    if (!forcedMocks) throw err;
    if (isUnavailable(err)) {
      enableMockMode();
      return mockFn();
    }
    throw err;
  }
}
