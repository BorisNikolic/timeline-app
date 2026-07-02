import rateLimit from 'express-rate-limit';

/**
 * General API limiter — a DoS backstop across all endpoints.
 *
 * Note: keyed by client IP. At the festival many attendees share one WiFi/NAT
 * IP, so keep this generous (the mobile app is also heavily cached client-side).
 * Tune via RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX_REQUESTS.
 */
export const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 600,
  standardHeaders: true,
  legacyHeaders: false,
  // Exempt public read-only endpoints: at the festival many attendees share one
  // WiFi/NAT IP, so a per-IP cap on the schedule/map reads would wrongly 429 the
  // crowd. Those routes are read-only and client-cached; the cap still guards the
  // admin/write/auth surface.
  skip: (req) => req.method === 'GET' && req.originalUrl.startsWith('/api/public'),
  message: { error: 'Too many requests, please try again later.' },
});

/**
 * Strict limiter for authentication endpoints — brute-force / credential-stuffing
 * protection on login and registration. 20 attempts / 15 min per IP is ample for
 * legitimate use and kills automated guessing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later.' },
});
