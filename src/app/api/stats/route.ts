import { getDb, type LinkRow } from '@/lib/db';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/api';

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const db = getDb();

  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    days.push({ day, count: 0 });
  }
  const rows = db
    .prepare('SELECT day, count FROM visits WHERE user_id = ? AND day >= ?')
    .all(auth.id, days[0].day) as { day: string; count: number }[];
  const map = new Map(rows.map((r) => [r.day, r.count]));
  days.forEach((d) => {
    d.count = map.get(d.day) ?? 0;
  });

  const totalVisits = (
    db.prepare('SELECT COALESCE(SUM(count), 0) AS s FROM visits WHERE user_id = ?').get(auth.id) as {
      s: number;
    }
  ).s;
  const totalClicks = (
    db.prepare('SELECT COALESCE(SUM(click_count), 0) AS s FROM links WHERE user_id = ?').get(
      auth.id
    ) as { s: number }
  ).s;
  const topLinks = db
    .prepare(
      'SELECT id, title, url, click_count FROM links WHERE user_id = ? ORDER BY click_count DESC LIMIT 5'
    )
    .all(auth.id) as Pick<LinkRow, 'id' | 'title' | 'url' | 'click_count'>[];

  return ok({ visitsByDay: days, totalVisits, totalClicks, topLinks });
}
