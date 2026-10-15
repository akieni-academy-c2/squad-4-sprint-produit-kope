import { useSyncExternalStore } from "react";

const DEMO_PARAM = "demo";
const DEMO_STORAGE_KEY = "kop:demo";

const isTrue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase() === "true";

const isDemoOn = (value) => value === "1" || isTrue(value);

const isDev = import.meta.env?.DEV === true;

/**
 * Ce que vaut la démo selon la variable de build : elle ne l'active jamais,
 * elle décide seulement si elle reste accessible. Variable absente, elle l'est ;
 * `true` l'autorise explicitement, `false` l'interdit. Le passage en démo
 * revient toujours au visiteur : sélecteur de rôle, `?demo=1`, choix mémorisé.
 * @param {string|undefined} raw valeur brute de `VITE_USE_MOCKS`
 * @returns {{allowed: boolean}}
 */
export function mocksFromBuild(raw) {
  const isSet = raw != null && String(raw).trim() !== "";
  return { allowed: !isSet || isTrue(raw) };
}

const buildMocks = mocksFromBuild(import.meta.env?.VITE_USE_MOCKS);

const allowedByBuild = buildMocks.allowed;

/**
 * Le repli automatique sur les mocks ne vaut qu'en développement, où l'on
 * travaille sans backend. En production il masquerait une panne réelle - ou une
 * migration non appliquée - derrière des données fictives. La démo y reste un
 * choix du visiteur, jamais une conséquence d'une erreur.
 */
const autoFallbackAllowed = isDev;

let demoAllowed = allowedByBuild;
let mockMode = false;
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
    return window.localStorage.getItem(DEMO_STORAGE_KEY) === "true";
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
  rememberDemo(true);
  notify();
}

export function resetMockMode() {
  rememberDemo(false);
  mockMode = false;
  notify();
}

/**
 * Traduit le paramètre d'URL, le choix mémorisé et le build en une décision.
 * Le build tranche seul : s'il retire la démo, ni `?demo=1` ni un choix
 * mémorisé ne peuvent la rendre accessible, sinon le paramètre décide et le
 * choix mémorisé sert de repli.
 */
export function decideDemoMode({
  requested,
  remembered = false,
  allowedByBuild = false,
}) {
  if (!allowedByBuild) return { allowed: false, active: false };
  if (requested != null) return { allowed: true, active: isDemoOn(requested) };
  return { allowed: true, active: remembered };
}

/**
 * Applique le choix de démo avant le premier rendu.
 * `?demo=1` l'active, `?demo=0` la désactive, faute de paramètre le choix
 * mémorisé tranche. Un build qui retire la démo l'emporte sur tout le reste.
 * À appeler une seule fois : après, seul le sélecteur de rôle décide.
 */
export function initMockMode() {
  if (typeof window === "undefined") return mockMode;

  const decision = decideDemoMode({
    requested: new URLSearchParams(window.location.search).get(DEMO_PARAM),
    remembered: rememberedDemo(),
    allowedByBuild,
  });

  demoAllowed = decision.allowed;
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
    console.error("[dataSource] API indisponible, repli sur les mocks", err);
    enableMockMode();
    return mockFn();
  }
}

function isUnavailable(err) {
  if (!err) return false;
  if (err instanceof TypeError) return true;
  if (typeof err.status === "number" && err.status >= 500) return true;
  if (
    err.code === "ECONNREFUSED" ||
    err.code === "ENOTFOUND" ||
    err.code === "ETIMEDOUT"
  )
    return true;
  return false;
}
