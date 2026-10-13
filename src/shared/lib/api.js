const DEFAULT_HEADERS = { Accept: 'application/json' };
const JSON_HEADERS = { ...DEFAULT_HEADERS, 'Content-Type': 'application/json' };

/** Declenche quand l'API refuse la requete pour un compte suspendu. */
export const SUSPENDED_EVENT = 'kop:account-suspended';

const SUSPENDED_PATTERN = /compete? (a été|est) suspendu/i;

export class ApiError extends Error {
  constructor(status, message, errors = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/** Levé quand le serveur répond 401 : la session n'est plus valide. */
export const UNAUTHORIZED_EVENT = 'kop:unauthorized';

/**
 * L'authentification repose uniquement sur le cookie de session httpOnly posé par
 * le serveur. Aucun jeton n'est stocké côté JS : un script injecté ne peut donc
 * pas exfiltrer d'identifiant long-durée.
 */
function resolveUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `/api${normalized}`;
}

async function parseResponse(res) {
  let payload = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json'))
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }

  if (!res.ok) {
    const message = payload?.message || `Erreur ${res.status}`;
    if (res.status === 403 && typeof window !== 'undefined' && SUSPENDED_PATTERN.test(message))
      window.dispatchEvent(new CustomEvent(SUSPENDED_EVENT, { detail: { message } }));
    if (res.status === 401 && typeof window !== 'undefined')
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    throw new ApiError(res.status, message, payload?.errors);
  }
  return payload;
}

/**
 * Délai au-delà duquel une requête est abandonnée.
 *
 * Sans lui, une connexion qui reste ouverte laisse le chargement correspondant
 * en suspens indéfiniment, et il n'existe aucun chemin d'annulation : changer de
 * filtre ne.stoppe pas la requête précédente.
 */
const REQUEST_TIMEOUT_MS = 15_000;

export async function fetchApi(url, options = {}) {
  const { headers, signal, timeoutMs = REQUEST_TIMEOUT_MS, ...rest } = options;

  const controller = new AbortController();
  // Un `signal` externe (démontage de composant, changement de filtre) annule
  // la requête ; le minuteur couvre le cas où rien ne l'annule à notre place.
  const onAbort = () => controller.abort(signal.reason);
  if (signal) {
    if (signal.aborted) throw new ApiError(0, 'Requête annulée');
    signal.addEventListener('abort', onAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(new DOMException('Délai dépassé', 'TimeoutError')), timeoutMs);

  try {
    const res = await fetch(resolveUrl(url), {
      credentials: 'include',
      headers: { ...DEFAULT_HEADERS, ...headers },
      signal: controller.signal,
      ...rest,
    });
    return await parseResponse(res);
  } catch (err) {
    // Une annulation n'est pas une panne réseau : la remonter telle quelle
    // ferait afficher une erreur à l'utilisateur alors que c'est son action qui
    // l'a provoquée.
    if (controller.signal.aborted && !controller.signal.reason?.name?.includes('Timeout'))
      throw new ApiError(0, 'Requête annulée');
    if (controller.signal.reason?.name === 'TimeoutError')
      throw new ApiError(408, 'Le serveur met trop de temps à répondre');
    throw err;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

export const api = {
  get: (url, params) => {
    const fullUrl = params ? `${url}?${new URLSearchParams(params).toString()}` : url;
    return fetchApi(fullUrl, { method: 'GET' });
  },
  postJson: (url, body) =>
    fetchApi(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) }),
  putJson: (url, body) =>
    fetchApi(url, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(body) }),
  patchJson: (url, body) =>
    fetchApi(url, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) }),
  del: (url) => fetchApi(url, { method: 'DELETE' }),
  postFormData: (url, formData) =>
    fetchApi(url, { method: 'POST', body: formData }),
};
