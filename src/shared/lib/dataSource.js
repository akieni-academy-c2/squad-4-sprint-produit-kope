import { useSyncExternalStore } from 'react';

/**
 * Mode démo opt-in : inversé, il livrait en production un sélecteur de rôle
 * « Administrateur » dès que la base était injoignable.
 */
const mocksAllowed =
  import.meta.env?.DEV === true ||
  String(import.meta.env?.VITE_USE_MOCKS ?? '')
    .trim()
    .toLowerCase() === 'true';

let mockMode = mocksAllowed;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

/** Le mode démo est-il autorisé par l'environnement de build ? */
export function areMocksAllowed() {
  return mocksAllowed;
}

export function isMockMode() {
  return mockMode;
}

export function enableMockMode() {
  if (mockMode) return;
  // Un environnement qui interdit la démo ne peut pas la rouvrir par programme :
  // « Activer la démo » n'est qu'une demande, l'environnement a le dernier mot.
  if (!mocksAllowed) return;
  mockMode = true;
  notify();
}

export function resetMockMode() {
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

export async function callApi(apiFn, mockFn) {
  if (mockMode) return mockFn();
  try {
    return await apiFn();
  } catch (err) {
    // Démo interdite par l'environnement : le repli serait contraire à la
    // demande, l'erreur remonte.
    if (!mocksAllowed) throw err;
    // Une panne réseau ou un 5xx ne doit pas s'afficher comme des données de
    // démonstration saines en silence : on bascule, mais on le signale.
    if (isUnavailable(err)) {
      console.error('[dataSource] API indisponible, repli sur les mocks', err);
      enableMockMode();
      return mockFn();
    }
    throw err;
  }
}

function isUnavailable(err) {
  if (!err) return false;
  if (err instanceof TypeError) return true; // fetch réseau en échec
  if (typeof err.status === 'number' && err.status >= 500) return true;
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') return true;
  return false;
}