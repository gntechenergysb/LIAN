import { redirect } from 'next/navigation';
import { dbGet, dbRun, type LinkRow } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const link = await dbGet<LinkRow>('SELECT * FROM links WHERE id = ?', id);
  if (!link || !link.enabled) {
    redirect('/');
  }
  await dbRun('UPDATE links SET click_count = click_count + 1 WHERE id = ?', id);
  redirect(link.url);
}
