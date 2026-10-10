import { getDb, type UserRow } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { THEMES } from '@/lib/themes';
import { ok, fail, readJson } from '@/lib/api';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return fail('请先登录', 401);
  return ok({ user });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return fail('请先登录', 401);
  const body = await readJson(req);
  const db = getDb();

  const updates: string[] = [];
  const params: unknown[] = [];

  if (typeof body.display_name === 'string') {
    updates.push('display_name = ?');
    params.push(body.display_name.trim().slice(0, 30));
  }
  if (typeof body.bio === 'string') {
    updates.push('bio = ?');
    params.push(body.bio.trim().slice(0, 140));
  }
  if (typeof body.theme === 'string' && THEMES.some((t) => t.id === body.theme)) {
    updates.push('theme = ?');
    params.push(body.theme);
  }
  if (typeof body.elder_mode === 'boolean' || typeof body.elder_mode === 'number') {
    updates.push('elder_mode = ?');
    params.push(body.elder_mode ? 1 : 0);
  }
  if (typeof body.avatar_path === 'string') {
    updates.push('avatar_path = ?');
    params.push(body.avatar_path.slice(0, 255));
  }
  if (updates.length === 0) return fail('没有可更新的内容');

  params.push(user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...(params as never[]));
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as unknown as UserRow;
  const { password_hash: _ph, ...rest } = row;
  return ok({ user: rest });
}
