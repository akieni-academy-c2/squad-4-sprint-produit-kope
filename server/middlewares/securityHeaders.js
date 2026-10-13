/**
 * En-têtes de sécurité appliqués à toutes les réponses.
 * Équivalent ciblé de helmet, sans dépendance externe : le front est servi par
 * Vite et l'API par Express, sur deux origines distinctes en développement.
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

export function securityHeaders(req, res, next) {
  for (const [header, value] of Object.entries(API_HEADERS)) res.setHeader(header, value);
  // L'API renvoie du JSON : jamais sniffable, jamais mis en cache par un proxy.
  if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
  next();
}
