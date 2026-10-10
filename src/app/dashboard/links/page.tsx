import { getSessionUser } from '@/lib/auth';
import { getDb, type LinkRow } from '@/lib/db';
import LinksManager from '@/components/LinksManager';

export const dynamic = 'force-dynamic';

export default async function LinksPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const db = getDb();
  const links = db
    .prepare('SELECT * FROM links WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC')
    .all(user.id) as unknown as LinkRow[];
  return <LinksManager initial={links} />;
}
