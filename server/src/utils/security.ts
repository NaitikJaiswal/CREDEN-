import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { IUser } from '../types/index.js';

/**
 * Mask APAAR ID to protect student privacy in display tables
 * e.g. "123456789012" -> "•••• •••• 9012"
 */
export function maskApaarId(rawId: string): string {
  if (!rawId) return 'N/A';
  const clean = rawId.replace(/[\s-]/g, '');
  if (clean.length < 4) return '••••';
  const lastFour = clean.slice(-4);
  return `•••• •••• ${lastFour}`;
}

/**
 * Keyed HMAC-SHA256 fingerprint for deterministic search and duplicate detection
 * without persisting unencrypted APAAR IDs in ordinary database fields
 */
export function generateFingerprint(rawApaarId: string): string {
  if (!rawApaarId) return '';
  const normalized = rawApaarId.trim().replace(/[\s-]/g, '').toUpperCase();
  return crypto.createHmac('sha256', config.hmacSecret).update(normalized).digest('hex');
}

/**
 * Hash raw password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password against bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate signed JWT token
 */
export function generateJwt(user: Partial<IUser>): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles,
      institutionId: user.institutionId,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
}

/**
 * Verify JWT token
 */
export function verifyJwt(token: string): any {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}

/**
 * Generate cryptographically strong random token for academic verification
 */
export function generateVerificationToken(): { rawToken: string; hashedToken: string } {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
}

/**
 * Hash a verification token input to match against stored hash
 */
export function hashVerificationToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generate correlation ID for request tracing & audit logs
 */
export function generateCorrelationId(): string {
  return `CRDN-${uuidv4().substring(0, 8)}`;
}

