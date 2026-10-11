import { dbGet, type UserRow } from '@/lib/db';
import { verifyPassword, createSession, setSessionCookie, sanitizeUser } from '@/lib/auth';
import { ok, fail, readJson } from '@/lib/api';

export async function POST(req: Request) {
  const { username, password } = await readJson(req);
  if (typeof username !== 'string' || typeof password !== 'string') {
    return fail('请输入用户名和密码');
  }
  const row = await dbGet<UserRow>(
    'SELECT * FROM users WHERE username = ?',
    username.trim().toLowerCase()
  );
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return fail('用户名或密码不正确', 401);
  }
  const token = await createSession(row.id);
  await setSessionCookie(token);
  return ok({ user: sanitizeUser(row) });
}
