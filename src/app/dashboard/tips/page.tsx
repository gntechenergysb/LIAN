import { getSessionUser } from '@/lib/auth';
import { getDb, type TipRow } from '@/lib/db';
import TipsManager from '@/components/TipsManager';

export const dynamic = 'force-dynamic';

export default async function TipsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const db = getDb();
  const tips = db
    .prepare('SELECT * FROM tips WHERE user_id = ? ORDER BY created_at ASC')
    .all(user.id) as unknown as TipRow[];
  return <TipsManager initial={tips} />;
}
