import { headers } from 'next/headers';

export async function getBaseUrl(): Promise<string> {
  const env = process.env.LIAN_BASE_URL?.replace(/\/$/, '');
  if (env) return env;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}
