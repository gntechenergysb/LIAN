import { getSessionUser } from '@/lib/auth';
import { dbAll, type LinkRow } from '@/lib/db';
import LinksManager from '@/components/LinksManager';

export const dynamic = 'force-dynamic';

export default async function LinksPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const links = await dbAll<LinkRow>(
    'SELECT * FROM links WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
    user.id
  );
  return <LinksManager initial={links} />;
}
