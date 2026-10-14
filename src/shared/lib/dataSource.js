import { useSyncExternalStore } from 'react';

const DEMO_PARAM = 'demo';
const DEMO_STORAGE_KEY = 'kop:demo';

const isTrue = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase() === 'true';

const isDemoOn = (value) => value === '1' || isTrue(value);

const isDev = import.meta.env?.DEV === true;

/**
 * `VITE_USE_MOCKS` est figé dans le bundle au moment du build : la poser sur
 * Vercel sans redéployer ne change rien au site déjà en ligne. `?demo=1` dans
 * l'URL permet d'activer la démo à l'exécution, sur un déploiement existant.
 */
const allowedByBuild = isDev || isTrue(import.meta.env?.VITE_USE_MOCKS);

/**
 * Autoriser n'est pas activer. En production, `VITE_USE_MOCKS=true` rend le
 * sélecteur de rôle visible mais laisse le site démarrer sur la vraie API :
 * les visiteurs voient les données réelles, les testeurs basculent quand ils le
 * veulent. Le mode démonstration n'est actif d'emblée qu'en développement.
 */
const activeByDefault = isDev;

/**
 * Le repli automatique sur les mocks ne vaut qu'en développement, où l'on
 * travaille sans backend. En production il masquerait une panne réelle - ou une
 * migration non appliquée - derrière des données fictives. La démo y reste un
 * choix du visiteur, jamais une conséquence d'une erreur.
 */
const autoFallbackAllowed = isDev;

let demoAllowed = allowedByBuild;
let mockMode = activeByDefault;
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
 * Un `?demo=` explicite l'emporte toujours, y compris pour sortir d'une démo
 * autorisée par le build. Sinon le build décide : il autorise, et n'active que
 * s'il l'a toujours fait. Rien n'est mémorisé quand le build a la main.
 */
export function decideDemoMode({
  requested,
  remembered = false,
  allowedByBuild = false,
  activeByDefault = false,
}) {
  if (requested != null) {
    const on = isDemoOn(requested);
    return { allowed: allowedByBuild || on, active: on, remember: !allowedByBuild };
  }
  if (allowedByBuild) return { allowed: true, active: activeByDefault, remember: false };
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
    activeByDefault,
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