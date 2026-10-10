import { getDb, type LinkRow } from '@/lib/db';
import { ok, fail, readJson, validUrl } from '@/lib/api';
import { requireAuth } from '@/lib/api';

function ownLink(db: ReturnType<typeof getDb>, id: string, userId: string) {
  return db.prepare('SELECT * FROM links WHERE id = ? AND user_id = ?').get(id, userId) as
    | LinkRow
    | undefined;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const db = getDb();
  const link = ownLink(db, id, auth.id);
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
  db.prepare(`UPDATE links SET ${updates.join(', ')} WHERE id = ?`).run(...(values as never[]));
  const updated = db.prepare('SELECT * FROM links WHERE id = ?').get(id) as unknown as LinkRow;
  return ok({ link: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  const db = getDb();
  const link = ownLink(db, id, auth.id);
  if (!link) return fail('链接不存在', 404);
  db.prepare('DELETE FROM links WHERE id = ?').run(id);
  return ok({ deleted: true });
}
