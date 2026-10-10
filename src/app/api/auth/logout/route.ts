import { clearSessionCookie } from '@/lib/auth';
import { ok } from '@/lib/api';

export async function POST() {
  await clearSessionCookie();
  return ok({ message: '已退出登录' });
}
