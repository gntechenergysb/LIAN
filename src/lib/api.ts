import { NextResponse } from 'next/server';
import { getSessionUser, type SessionUser } from '@/lib/auth';

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function requireAuth(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return fail('请先登录', 401);
  return user;
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return (body ?? {}) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export const RESERVED_USERNAMES = new Set([
  'api', 'login', 'register', 'dashboard', 'u', 'r', 'admin', 'about',
  'help', 'settings', 'static', 'public', 'assets', 'lian', 'root', 'support',
]);

export function validUsername(name: string): boolean {
  return /^[a-zA-Z0-9_]{3,24}$/.test(name) && !RESERVED_USERNAMES.has(name.toLowerCase());
}

export function validUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
