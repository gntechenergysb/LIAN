import { redirect } from 'next/navigation';
import { getDb, type LinkRow } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const link = db.prepare('SELECT * FROM links WHERE id = ?').get(id) as unknown as LinkRow | undefined;
  if (!link || !link.enabled) {
    redirect('/');
  }
  db.prepare('UPDATE links SET click_count = click_count + 1 WHERE id = ?').run(id);
  redirect(link.url);
}
