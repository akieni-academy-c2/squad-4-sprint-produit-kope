import { useSyncExternalStore } from 'react';

const DEMO_PARAM = 'demo';
const DEMO_STORAGE_KEY = 'kop:demo';

const isTrue = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase() === 'true';

const isDemoOn = (value) => value === '1' || isTrue(value);

/**
 * `VITE_USE_MOCKS` est figé dans le bundle au moment du build : la poser sur
 * Vercel sans redéployer ne change rien au site déjà en ligne. `?demo=1` dans
 * l'URL permet d'activer la démo à l'exécution, sur un déploiement existant.
 */
const allowedByBuild =
  import.meta.env?.DEV === true || isTrue(import.meta.env?.VITE_USE_MOCKS);

/**
 * Le repli automatique sur les mocks ne vaut qu'en développement, où l'on
 * travaille sans backend. En production il masquerait une panne réelle - ou une
 * migration non appliquée - derrière des données fictives. La démo y reste un
 * choix du visiteur, jamais une conséquence d'une erreur.
 */
const autoFallbackAllowed = import.meta.env?.DEV === true;

let demoAllowed = allowedByBuild;
let mockMode = allowedByBuild;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

/**
 * Mémorise le choix pour survivre au rechargement. Silencieux : un stockage
 * indisponible (navigation privée) doit seulement faire perdre la mémorisation.
 */
function rememberDemo(on) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, String(on));
  } catch {}
}

function rememberedDemo() {
  try {
    return window.localStorage.getItem(DEMO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function areMocksAllowed() {
  return demoAllowed;
}

export function isMockMode() {
  return mockMode;
}

export function enableMockMode() {
  if (mockMode) return;
  if (!demoAllowed) return;
  mockMode = true;
  notify();
}

export function resetMockMode() {
  if (!allowedByBuild) rememberDemo(false);
  mockMode = false;
  notify();
}

/**
 * Traduit le paramètre d'URL, le choix mémorisé et le build en une décision.
 * Le build garde la main : `VITE_USE_MOCKS=true` ou le mode développement
 * l'emportent, et dans ce cas rien n'est mémorisé.
 */
export function decideDemoMode({ requested, remembered = false, allowedByBuild = false }) {
  if (allowedByBuild) return { allowed: true, active: true, remember: false };
  if (requested != null)
    return { allowed: isDemoOn(requested), active: isDemoOn(requested), remember: true };
  return { allowed: remembered, active: remembered, remember: false };
}

/**
 * Applique le choix de démo avant le premier rendu.
 * `?demo=1` l'active et la mémorise, `?demo=0` la désactive.
 * Sans paramètre, on retombe sur le choix mémorisé, sinon sur le build.
 * À appeler une seule fois : après, seul le sélecteur de rôle décide.
 */
export function initMockMode() {
  if (typeof window === 'undefined') return mockMode;

  const decision = decideDemoMode({
    requested: new URLSearchParams(window.location.search).get(DEMO_PARAM),
    remembered: rememberedDemo(),
    allowedByBuild,
  });

  demoAllowed = decision.allowed;
  if (decision.remember) rememberDemo(decision.active);
  if (decision.active) enableMockMode();
  else resetMockMode();

  return mockMode;
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
    if (!autoFallbackAllowed || !isUnavailable(err)) throw err;
    console.error('[dataSource] API indisponible, repli sur les mocks', err);
    enableMockMode();
    return mockFn();
  }
}

function isUnavailable(err) {
  if (!err) return false;
  if (err instanceof TypeError) return true;
  if (typeof err.status === 'number' && err.status >= 500) return true;
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') return true;
  return false;
}