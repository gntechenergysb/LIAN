import { dbGet, dbRun, type LinkRow } from '@/lib/db';
import { ok, fail, readJson, validUrl } from '@/lib/api';
import { requireAuth } from '@/lib/api';

async function ownLink(id: string, userId: string): Promise<LinkRow | null> {
  return dbGet<LinkRow>('SELECT * FROM links WHERE id = ? AND user_id = ?', id, userId);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const link = await ownLink(id, auth.id);
  if (!link) return fail('链接不存在', 404);
  const body = await readJson(req);

  const updates: string[] = [];
  const values: unknown[] = [];
  if (typeof body.title === 'string' && body.title.trim()) {
    updates.push('title = ?');
    values.push(body.title.trim().slice(0, 60));
  }
  if (typeof body.url === 'string') {
    if (!validUrl(body.url.trim())) return fail('请填写有效的 http(s) 链接');
    updates.push('url = ?');
    values.push(body.url.trim());
  }
  if (typeof body.enabled === 'boolean' || typeof body.enabled === 'number') {
    updates.push('enabled = ?');
    values.push(body.enabled ? 1 : 0);
  }
  if (typeof body.sort_order === 'number') {
    updates.push('sort_order = ?');
    values.push(Math.trunc(body.sort_order));
  }
  if (updates.length === 0) return fail('没有可更新的内容');
  values.push(id);
  await dbRun(`UPDATE links SET ${updates.join(', ')} WHERE id = ?`, ...values);
  const updated = await dbGet<LinkRow>('SELECT * FROM links WHERE id = ?', id);
  return ok({ link: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const link = await ownLink(id, auth.id);
  if (!link) return fail('链接不存在', 404);
  await dbRun('DELETE FROM links WHERE id = ?', id);
  return ok({ deleted: true });
}
