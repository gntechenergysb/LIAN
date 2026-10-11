import { notFound } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Heart } from 'lucide-react';
import { dbAll, dbGet, dbRun, type UserRow, type LinkRow, type TipRow } from '@/lib/db';
import { themeName } from '@/lib/themes';
import { getBaseUrl } from '@/lib/site';
import PublicActions from '@/components/PublicActions';
import GreetingCard from '@/components/GreetingCard';

export const dynamic = 'force-dynamic';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await dbGet<Pick<UserRow, 'display_name' | 'username'>>(
    'SELECT display_name, username FROM users WHERE username = ?',
    username.toLowerCase()
  );
  if (!user) return { title: '未找到 · 链 LIAN' };
  return { title: `${user.display_name || user.username} · 链 LIAN` };
}

const PROVIDER_LABEL: Record<string, string> = { wechat: '微信打赏', alipay: '支付宝打赏' };

export default async function PublicPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await dbGet<UserRow>(
    'SELECT * FROM users WHERE username = ?',
    username.toLowerCase()
  );
  if (!user) notFound();

  // 记录访问
  await dbRun(
    'INSERT INTO visits (user_id, day, count) VALUES (?, ?, 1) ON CONFLICT(user_id, day) DO UPDATE SET count = count + 1',
    user.id,
    todayKey()
  );

  const links = await dbAll<LinkRow>(
    'SELECT * FROM links WHERE user_id = ? AND enabled = 1 ORDER BY sort_order ASC, created_at ASC',
    user.id
  );
  const tips = await dbAll<TipRow>(
    'SELECT * FROM tips WHERE user_id = ? AND enabled = 1 ORDER BY created_at ASC',
    user.id
  );

  const base = await getBaseUrl();
  const pageUrl = `${base}/u/${user.username}`;
  const qrDataUrl = await QRCode.toDataURL(pageUrl, { width: 320, margin: 1 });
  const initial = (user.display_name || user.username).slice(0, 1);

  return (
    <div id="public-root" className={`theme-${user.theme || 'xuanzhi'}`}>
      <div className="lian-page">
        <main className="mx-auto w-full max-w-md px-6 pb-24 pt-12">
          {/* 头像与名字 */}
          <div className="text-center">
            <div className="lian-card mx-auto flex h-24 w-24 items-center justify-center overflow-hidden !rounded-full text-3xl font-bold">
              {user.avatar_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_path} alt={user.display_name || user.username} className="h-full w-full object-cover" />
              ) : (
                <span className="lian-btn flex h-full w-full items-center justify-center">{initial}</span>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-black">{user.display_name || user.username}</h1>
            <p className="mt-1 text-sm lian-muted">@{user.username}</p>
            {user.bio && <p className="mt-3 text-sm leading-relaxed">{user.bio}</p>}
          </div>

          {/* 时辰节气问候（访客本地时间） */}
          <GreetingCard />

          {/* 链接 */}
          <div className="mt-6 space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={`/r/${link.id}`}
                target="_blank"
                rel="noreferrer"
                className="lian-card lian-link block px-5 py-4 text-center font-semibold"
              >
                {link.title}
              </a>
            ))}
            {links.length === 0 && (
              <div className="lian-card px-5 py-8 text-center text-sm lian-muted">
                主人还没有添加链接，敬请期待。
              </div>
            )}
          </div>

          {/* 打赏 */}
          {tips.length > 0 && (
            <div className="mt-8">
              <h2 className="flex items-center justify-center gap-2 text-sm font-bold lian-muted">
                <Heart size={15} style={{ color: 'var(--lian-accent)' }} />
                喜欢我的内容？请我喝杯茶
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {tips.map((tip) => (
                  <div key={tip.id} className="lian-card p-4 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tip.qr_path}
                      alt={PROVIDER_LABEL[tip.provider] ?? '收款码'}
                      className="mx-auto h-32 w-32 rounded-xl bg-white object-cover p-1"
                    />
                    <p className="mt-2 text-sm font-semibold">
                      {PROVIDER_LABEL[tip.provider] ?? tip.provider}
                    </p>
                    {tip.label && <p className="mt-0.5 text-xs lian-muted">{tip.label}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 页脚 */}
          <footer className="mt-12 text-center text-xs lian-muted">
            <p>
              {themeName(user.theme || 'xuanzhi')}主题 · 链 LIAN 一链万连
            </p>
            <Link href="/" className="mt-2 inline-block font-semibold" style={{ color: 'var(--lian-accent)' }}>
              我也要做一个 →
            </Link>
          </footer>
        </main>

        <PublicActions pageUrl={pageUrl} qrDataUrl={qrDataUrl} elderDefault={!!user.elder_mode} />
      </div>
    </div>
  );
}
