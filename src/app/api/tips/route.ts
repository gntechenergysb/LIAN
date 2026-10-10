import crypto from 'node:crypto';
import { getDb, type TipRow } from '@/lib/db';
import { ok, fail, readJson } from '@/lib/api';
import { requireAuth } from '@/lib/api';

const PROVIDERS = new Set(['wechat', 'alipay']);

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const db = getDb();
  const tips = db
    .prepare('SELECT * FROM tips WHERE user_id = ? ORDER BY created_at ASC')
    .all(auth.id) as unknown as TipRow[];
  return ok({ tips });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { provider, label, qr_path } = await readJson(req);
  if (typeof provider !== 'string' || !PROVIDERS.has(provider)) return fail('请选择微信或支付宝');
  if (typeof qr_path !== 'string' || !qr_path) return fail('请先上传收款码图片');
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO tips (id, user_id, provider, label, qr_path, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    id,
    auth.id,
    provider,
    typeof label === 'string' ? label.trim().slice(0, 40) : '',
    qr_path.slice(0, 255),
    Date.now()
  );
  const tip = db.prepare('SELECT * FROM tips WHERE id = ?').get(id) as unknown as TipRow;
  return ok({ tip }, 201);
}
