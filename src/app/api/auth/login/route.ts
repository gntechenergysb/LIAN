import { getDb, type UserRow } from '@/lib/db';
import { verifyPassword, createSession, setSessionCookie, sanitizeUser } from '@/lib/auth';
import { ok, fail, readJson } from '@/lib/api';

export async function POST(req: Request) {
  const { username, password } = await readJson(req);
  if (typeof username !== 'string' || typeof password !== 'string') {
    return fail('请输入用户名和密码');
  }
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username.trim().toLowerCase()) as unknown as UserRow | undefined;
  if (!row || !verifyPassword(password, row.password_hash)) {
    return fail('用户名或密码不正确', 401);
  }
  const token = await createSession(row.id);
  await setSessionCookie(token);
  return ok({ user: sanitizeUser(row) });
}
