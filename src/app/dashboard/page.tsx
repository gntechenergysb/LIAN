import Link from 'next/link';
import { Eye, MousePointerClick, Link2, Plus, Palette, QrCode } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { getDb, type LinkRow } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DashboardHome() {
  const user = await getSessionUser();
  if (!user) return null;
  const db = getDb();

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
  const linkCount = (
    db.prepare('SELECT COUNT(*) AS c FROM links WHERE user_id = ?').get(user.id) as { c: number }
  ).c;
  const topLinks = db
    .prepare(
      'SELECT id, title, click_count FROM links WHERE user_id = ? ORDER BY click_count DESC LIMIT 5'
    )
    .all(user.id) as Pick<LinkRow, 'id' | 'title' | 'click_count'>[];

  const cards = [
    { icon: Eye, label: '主页总访问', value: totalVisits },
    { icon: MousePointerClick, label: '链接总点击', value: totalClicks },
    { icon: Link2, label: '链接数量', value: linkCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">你好，{user.display_name || user.username}</h1>
        <p className="mt-1 text-sm lian-muted">这是你的主页数据总览</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="lian-card p-5">
            <c.icon size={20} style={{ color: 'var(--lian-accent)' }} />
            <p className="mt-3 text-3xl font-black">{c.value}</p>
            <p className="mt-1 text-xs lian-muted sm:text-sm">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="lian-card p-6">
          <h2 className="font-bold">热门链接 Top 5</h2>
          {topLinks.length === 0 ? (
            <p className="mt-3 text-sm lian-muted">还没有链接，去添加第一条吧。</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topLinks.map((l, i) => (
                <li key={l.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    <span className="mr-2 font-black" style={{ color: 'var(--lian-accent)' }}>
                      {i + 1}
                    </span>
                    {l.title}
                  </span>
                  <span className="ml-3 shrink-0 lian-muted">{l.click_count} 次点击</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lian-card p-6">
          <h2 className="font-bold">快捷操作</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link href="/dashboard/links" className="lian-btn flex items-center justify-center gap-2 px-4 py-3 text-sm">
              <Plus size={16} /> 添加链接
            </Link>
            <Link href="/dashboard/appearance" className="lian-btn-outline flex items-center justify-center gap-2 px-4 py-3 text-sm">
              <Palette size={16} /> 换个主题
            </Link>
            <Link href="/dashboard/settings" className="lian-btn-outline flex items-center justify-center gap-2 px-4 py-3 text-sm">
              <QrCode size={16} /> 分享二维码
            </Link>
            <Link href={`/u/${user.username}`} target="_blank" className="lian-btn-outline flex items-center justify-center gap-2 px-4 py-3 text-sm">
              <Eye size={16} /> 预览主页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
