import { getSessionUser } from '@/lib/auth';
import { dbAll, type TipRow } from '@/lib/db';
import TipsManager from '@/components/TipsManager';

export const dynamic = 'force-dynamic';

export default async function TipsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const tips = await dbAll<TipRow>(
    'SELECT * FROM tips WHERE user_id = ? ORDER BY created_at ASC',
    user.id
  );
  return <TipsManager initial={tips} />;
}
