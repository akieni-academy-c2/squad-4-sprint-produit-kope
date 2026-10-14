import { useSyncExternalStore } from 'react';


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


export function areMocksAllowed() {
  return mocksAllowed;
}

export function isMockMode() {
  return mockMode;
}

export function enableMockMode() {
  if (mockMode) return;
  if (!mocksAllowed) return;
  mockMode = true;
  notify();
}

export function resetMockMode() {
  mockMode = false;
  notify();
}

function subscribeMockMode(fn) {
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
    if (!mocksAllowed) throw err;
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
  if (err instanceof TypeError) return true;
  if (typeof err.status === 'number' && err.status >= 500) return true;
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') return true;
  return false;
}