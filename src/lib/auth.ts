import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { dbGet, type UserRow } from './db';

const COOKIE_NAME = 'lian_session';
const MAX_AGE = 60 * 60 * 24 * 30;
const PBKDF2_ITERATIONS = 100_000;

// ---- 密钥：Worker secret 优先，本地开发回退 .env ----
function jwtSecret(): Uint8Array {
  let s = '';
  try {
    s = getCloudflareContext().env.LIAN_JWT_SECRET || '';
  } catch {
    // 非请求上下文（如某些构建阶段），回退环境变量
  }
  if (!s) s = process.env.LIAN_JWT_SECRET || 'lian-dev-secret-change-me';
  return new TextEncoder().encode(s);
}

// ---- 密码哈希：WebCrypto PBKDF2-SHA256（Workers / Node 通用）----

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derive(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return `pbkdf2$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2') return false;
  const [, saltHex, hashHex] = parts;
  const derivedHex = toHex(await derive(password, fromHex(saltHex)));
  if (derivedHex.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < derivedHex.length; i++) {
    diff |= derivedHex.charCodeAt(i) ^ hashHex.charCodeAt(i);
  }
  return diff === 0;
}

// ---- 会话 ----

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
    const row = await dbGet<SessionUser>(
      'SELECT id, username, display_name, bio, avatar_path, theme, elder_mode, created_at FROM users WHERE id = ?',
      sub
    );
    return row;
  } catch {
    return null;
  }
}

export function sanitizeUser(row: UserRow): SessionUser {
  const { password_hash: _ph, ...rest } = row;
  return rest;
}
