import { dbAll, dbGet, type LinkRow } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/api';

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const days: { label: string; key: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      count: 0,
    });
  }
  const rows = await dbAll<{ day: string; count: number }>(
    'SELECT day, count FROM visits WHERE user_id = ? AND day >= ?',
    auth.id,
    days[0].key
  );
  const map = new Map(rows.map((r) => [r.day, r.count]));
  const visitsByDay = days.map((d) => ({ label: d.label, count: map.get(d.key) ?? 0 }));

  const totalVisits = (
    (await dbGet<{ s: number }>('SELECT COALESCE(SUM(count), 0) AS s FROM visits WHERE user_id = ?', auth.id))?.s ?? 0
  );
  const totalClicks = (
    (await dbGet<{ s: number }>('SELECT COALESCE(SUM(click_count), 0) AS s FROM links WHERE user_id = ?', auth.id))?.s ?? 0
  );
  const topLinks = await dbAll<Pick<LinkRow, 'id' | 'title' | 'url' | 'click_count'>>(
    'SELECT id, title, url, click_count FROM links WHERE user_id = ? ORDER BY click_count DESC LIMIT 5',
    auth.id
  );

  return ok({ visitsByDay, totalVisits, totalClicks, topLinks });
}
