import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { getDb, publicUser, type UserRow } from './db';

const COOKIE_NAME = 'lian_session';
const MAX_AGE = 60 * 60 * 24 * 30;

function jwtSecret(): Uint8Array {
  const s = process.env.LIAN_JWT_SECRET || 'lian-dev-secret-change-me';
  return new TextEncoder().encode(s);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hash] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export async function createSession(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(jwtSecret());
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export type SessionUser = Omit<UserRow, 'password_hash'>;

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    const sub = payload.sub;
    if (!sub) return null;
    const db = getDb();
    const row = db
      .prepare(
        'SELECT id, username, display_name, bio, avatar_path, theme, elder_mode, created_at FROM users WHERE id = ?'
      )
      .get(sub) as SessionUser | undefined;
    return row ?? null;
  } catch {
    return null;
  }
}

export function sanitizeUser(row: UserRow): SessionUser {
  return publicUser(row) as SessionUser;
}
