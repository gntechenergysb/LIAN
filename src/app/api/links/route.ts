import crypto from 'node:crypto';
import { getDb, type LinkRow } from '@/lib/db';
import { ok, fail, readJson, validUrl } from '@/lib/api';
import { requireAuth } from '@/lib/api';

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const db = getDb();
  const links = db
    .prepare('SELECT * FROM links WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC')
    .all(auth.id) as unknown as LinkRow[];
  return ok({ links });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { title, url } = await readJson(req);
  if (typeof title !== 'string' || !title.trim()) return fail('请填写链接标题');
  if (typeof url !== 'string' || !validUrl(url.trim())) return fail('请填写有效的 http(s) 链接');
  const db = getDb();
  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM links WHERE user_id = ?')
    .get(auth.id) as { m: number };
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO links (id, user_id, title, url, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, auth.id, title.trim().slice(0, 60), url.trim(), (maxOrder?.m ?? -1) + 1, Date.now());
  const link = db.prepare('SELECT * FROM links WHERE id = ?').get(id) as unknown as LinkRow;
  return ok({ link }, 201);
}
