import { getSessionUser } from '@/lib/auth';
import { getDb, type LinkRow } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface DayBucket {
  label: string;
  key: string;
  count: number;
}

export default async function StatsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const db = getDb();

  const days: DayBucket[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      count: 0,
    });
  }
  const rows = db
    .prepare('SELECT day, count FROM visits WHERE user_id = ? AND day >= ?')
    .all(user.id, days[0].key) as { day: string; count: number }[];
  const map = new Map(rows.map((r) => [r.day, r.count]));
  const chart = days.map((d) => ({ label: d.label, count: map.get(d.key) ?? 0 }));
  const max = Math.max(1, ...chart.map((c) => c.count));

  const totalVisits = (
    db.prepare('SELECT COALESCE(SUM(count), 0) AS s FROM visits WHERE user_id = ?').get(user.id) as {
      s: number;
    }
  ).s;
  const totalClicks = (
    db.prepare('SELECT COALESCE(SUM(click_count), 0) AS s FROM links WHERE user_id = ?').get(
      user.id
    ) as { s: number }
  ).s;
  const links = db
    .prepare('SELECT id, title, url, click_count FROM links WHERE user_id = ? ORDER BY click_count DESC')
    .all(user.id) as Pick<LinkRow, 'id' | 'title' | 'url' | 'click_count'>[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">数据统计</h1>
        <p className="mt-1 text-sm lian-muted">近 14 天主页访问趋势与链接点击排行</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="lian-card p-5">
          <p className="text-3xl font-black">{totalVisits}</p>
          <p className="mt-1 text-sm lian-muted">累计访问</p>
        </div>
        <div className="lian-card p-5">
          <p className="text-3xl font-black">{totalClicks}</p>
          <p className="mt-1 text-sm lian-muted">累计点击</p>
        </div>
      </div>

      <div className="lian-card p-6">
        <h2 className="font-bold">近 14 天访问</h2>
        <div className="mt-6 flex h-40 items-end gap-1.5">
          {chart.map((c) => (
            <div key={c.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-[10px] lian-muted">{c.count > 0 ? c.count : ''}</span>
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max(4, (c.count / max) * 100)}%`,
                  background: 'var(--lian-accent)',
                  opacity: c.count === 0 ? 0.18 : 0.9,
                }}
                title={`${c.label}: ${c.count}`}
              />
              <span className="text-[10px] lian-muted">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lian-card p-6">
        <h2 className="font-bold">链接点击排行</h2>
        {links.length === 0 ? (
          <p className="mt-3 text-sm lian-muted">还没有链接。</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {links.map((l) => {
              const pct = totalClicks > 0 ? Math.round((l.click_count / totalClicks) * 100) : 0;
              return (
                <li key={l.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{l.title}</span>
                    <span className="ml-3 shrink-0 lian-muted">
                      {l.click_count} 次 · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/10">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: 'var(--lian-accent)' }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
