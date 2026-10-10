import { getDb } from '@/lib/db';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { ok, fail, readJson } from '@/lib/api';
import { requireAuth } from '@/lib/api';

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { old_password, new_password } = await readJson(req);
  if (typeof old_password !== 'string' || typeof new_password !== 'string') {
    return fail('参数错误');
  }
  if (new_password.length < 6 || new_password.length > 72) {
    return fail('新密码长度需为 6–72 位');
  }
  const db = getDb();
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(auth.id) as {
    password_hash: string;
  };
  if (!verifyPassword(old_password, row.password_hash)) {
    return fail('原密码不正确', 401);
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
    hashPassword(new_password),
    auth.id
  );
  return ok({ changed: true });
}
