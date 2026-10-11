import { dbBatch } from '@/lib/db';
import { ok, fail, readJson } from '@/lib/api';
import { requireAuth } from '@/lib/api';

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { ids } = await readJson(req);
  if (!Array.isArray(ids) || ids.some((x) => typeof x !== 'string')) {
    return fail('参数错误');
  }
  await dbBatch(
    (ids as string[]).slice(0, 200).map((id, i) => ({
      sql: 'UPDATE links SET sort_order = ? WHERE id = ? AND user_id = ?',
      params: [i, id, auth.id],
    }))
  );
  return ok({ reordered: true });
}
