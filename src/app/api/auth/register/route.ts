import { dbGet, dbRun, type UserRow } from '@/lib/db';
import { hashPassword, createSession, setSessionCookie, sanitizeUser } from '@/lib/auth';
import { ok, fail, readJson, validUsername } from '@/lib/api';

export async function POST(req: Request) {
  const { username, password, display_name } = await readJson(req);
  if (typeof username !== 'string' || !validUsername(username.trim())) {
    return fail('用户名需为 3–24 位字母、数字或下划线，且不能是保留词');
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 72) {
    return fail('密码长度需为 6–72 位');
  }
  const name = username.trim().toLowerCase();
  const exists = await dbGet<{ id: string }>('SELECT id FROM users WHERE username = ?', name);
  if (exists) return fail('这个用户名已经被注册了', 409);

  const id = crypto.randomUUID();
  const now = Date.now();
  await dbRun(
    'INSERT INTO users (id, username, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, ?)',
    id,
    name,
    await hashPassword(password),
    typeof display_name === 'string' ? display_name.trim().slice(0, 30) : '',
    now
  );

  const row = await dbGet<UserRow>('SELECT * FROM users WHERE id = ?', id);
  if (!row) return fail('注册失败，请重试', 500);
  const token = await createSession(id);
  await setSessionCookie(token);
  return ok({ user: sanitizeUser(row) }, 201);
}
