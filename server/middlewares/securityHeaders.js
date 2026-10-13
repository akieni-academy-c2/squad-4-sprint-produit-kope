/**
 * En-têtes de sécurité appliqués à toutes les réponses.
 * Équivalent ciblé de helmet, sans dépendance externe : le front est servi par
 * Vite et l'API par Express, sur deux origines distinctes en développement.
 *
 * `vercel.json` porte la même politique pour le document et les assets, que ce
 * middleware ne voit jamais : en serverless le CDN sert `dist/` et Express ne
 * répond qu'aux routes `/api` et `/uploads`. Les deux moitiés doivent rester
 * synchronisées - `tests/server/security/headers.test.js` le vérifie.
 */
const API_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'X-DNS-Prefetch-Control': 'off',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const READ_ONLY = /^(GET|HEAD|OPTIONS)$/;

export function securityHeaders(req, res, next) {
  for (const [header, value] of Object.entries(API_HEADERS)) res.setHeader(header, value);
  // L'API renvoie du JSON : jamais sniffable, jamais mis en cache par un proxy.
  if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
  next();
}

/**
 * Protection CSRF par contrôle d'origine.
 *
 * Le cookie de session est `SameSite=Lax` : cela bloque le POST intersite
 * classique, mais pas un attaquant même-site - sous-domaine frère compromis,
 * injection de script sur le site, extension navigateur. Toutes les requêtes
 * qui modifient l'état (`POST`, `PUT`, `PATCH`, `DELETE`) passent ici.
 *
 * `Sec-Fetch-Site` est prioritaire quand le navigateur l'envoie : il n'est pas
 * falsifiable par du JavaScript cross-origin. `Origin`, vérifié ensuite, sert
 * pour les requêtes sans cet en-tête (clients HTTP, anciens navigateurs). Un
 * client sans aucun des deux est refusé : il n'a rien à prouver, et c'est là
 * que vivent les scripts.
 */
export function csrfGuard({ allowedOrigins = [] } = {}) {
  const allowed = new Set(allowedOrigins.filter(Boolean));

  return function checkOrigin(req, res, next) {
    if (READ_ONLY.test(req.method)) return next();

    const fetchSite = req.get('sec-fetch-site');
    if (fetchSite) {
      // 'same-origin' : même origine, autorisé. 'cross-site' et 'same-site'
      // sont refusés sans regarder Origin, qui pourrait être absent.
      if (fetchSite !== 'same-origin') return forbidden(res, 'cross-site');
      return next();
    }

    const origin = req.get('origin');
    if (!origin) return forbidden(res, 'origin-absente');
    if (!allowed.has(origin) && !isSameHost(origin, req.get('host'))) 
      return forbidden(res, 'origine-inconnue');
    
    return next();
  };
}

function isSameHost(origin, host) {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function forbidden(res, reason) {
  res.status(403).json({ message: 'Origine de requête refusée', reason });
}