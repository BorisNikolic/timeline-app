import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Known placeholder values that must never be used as a real secret.
const PLACEHOLDER_SECRETS = new Set([
  'your-secret-key-here-replace-in-production',
  'your-production-secret-here-min-32-chars',
]);

const isProduction = process.env.NODE_ENV === 'production';
const rawSecret = process.env.JWT_SECRET;

// In production, refuse to start on a missing, weak, or placeholder secret —
// a silent fallback would let anyone forge tokens. Dev gets a clearly-insecure default.
if (isProduction && (!rawSecret || rawSecret.length < 32 || PLACEHOLDER_SECRETS.has(rawSecret))) {
  throw new Error(
    'JWT_SECRET must be set to a strong, unique value (>= 32 chars) in production. Refusing to start.'
  );
}

const JWT_SECRET: string = rawSecret || 'dev-only-insecure-secret-do-not-use-in-prod';
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Decode token without verification (useful for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
