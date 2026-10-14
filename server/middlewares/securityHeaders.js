
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
  if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
  next();
}

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