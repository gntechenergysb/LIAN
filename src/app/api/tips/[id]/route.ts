import { getDb, type TipRow } from '@/lib/db';
import { ok, fail, readJson } from '@/lib/api';
import { requireAuth } from '@/lib/api';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const db = getDb();
  const tip = db.prepare('SELECT * FROM tips WHERE id = ? AND user_id = ?').get(id, auth.id) as
    | TipRow
    | undefined;
  if (!tip) return fail('收款码不存在', 404);
  const body = await readJson(req);
  const updates: string[] = [];
  const values: unknown[] = [];
  if (typeof body.label === 'string') {
    updates.push('label = ?');
    values.push(body.label.trim().slice(0, 40));
  }
  if (typeof body.qr_path === 'string' && body.qr_path) {
    updates.push('qr_path = ?');
    values.push(body.qr_path.slice(0, 255));
  }
  if (typeof body.enabled === 'boolean' || typeof body.enabled === 'number') {
    updates.push('enabled = ?');
    values.push(body.enabled ? 1 : 0);
  }
  if (updates.length === 0) return fail('没有可更新的内容');
  values.push(id);
  db.prepare(`UPDATE tips SET ${updates.join(', ')} WHERE id = ?`).run(...(values as never[]));
  return ok({ tip: db.prepare('SELECT * FROM tips WHERE id = ?').get(id) as unknown as TipRow });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const db = getDb();
  const tip = db.prepare('SELECT * FROM tips WHERE id = ? AND user_id = ?').get(id, auth.id);
  if (!tip) return fail('收款码不存在', 404);
  db.prepare('DELETE FROM tips WHERE id = ?').run(id);
  return ok({ deleted: true });
}
