import { dbGet, dbRun, type TipRow } from '@/lib/db';
import { ok, fail, readJson } from '@/lib/api';
import { requireAuth } from '@/lib/api';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const tip = await dbGet<TipRow>('SELECT * FROM tips WHERE id = ? AND user_id = ?', id, auth.id);
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
  await dbRun(`UPDATE tips SET ${updates.join(', ')} WHERE id = ?`, ...values);
  return ok({ tip: await dbGet<TipRow>('SELECT * FROM tips WHERE id = ?', id) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const tip = await dbGet<TipRow>('SELECT * FROM tips WHERE id = ? AND user_id = ?', id, auth.id);
  if (!tip) return fail('收款码不存在', 404);
  await dbRun('DELETE FROM tips WHERE id = ?', id);
  return ok({ deleted: true });
}
