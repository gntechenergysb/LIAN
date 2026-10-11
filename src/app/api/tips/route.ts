import { dbAll, dbGet, dbRun, type TipRow } from '@/lib/db';
import { ok, fail, readJson } from '@/lib/api';
import { requireAuth } from '@/lib/api';

const PROVIDERS = new Set(['wechat', 'alipay']);

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const tips = await dbAll<TipRow>(
    'SELECT * FROM tips WHERE user_id = ? ORDER BY created_at ASC',
    auth.id
  );
  return ok({ tips });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { provider, label, qr_path } = await readJson(req);
  if (typeof provider !== 'string' || !PROVIDERS.has(provider)) return fail('请选择微信或支付宝');
  if (typeof qr_path !== 'string' || !qr_path) return fail('请先上传收款码图片');
  const id = crypto.randomUUID();
  await dbRun(
    'INSERT INTO tips (id, user_id, provider, label, qr_path, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    auth.id,
    provider,
    typeof label === 'string' ? label.trim().slice(0, 40) : '',
    qr_path.slice(0, 255),
    Date.now()
  );
  const tip = await dbGet<TipRow>('SELECT * FROM tips WHERE id = ?', id);
  return ok({ tip }, 201);
}
