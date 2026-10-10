'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Link2,
  Palette,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: '总览', icon: LayoutDashboard },
  { href: '/dashboard/links', label: '链接', icon: Link2 },
  { href: '/dashboard/appearance', label: '外观', icon: Palette },
  { href: '/dashboard/tips', label: '打赏', icon: Wallet },
  { href: '/dashboard/stats', label: '数据', icon: BarChart3 },
  { href: '/dashboard/settings', label: '设置', icon: Settings },
];

export default function DashboardNav({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <>
      {/* 桌面侧边栏 */}
      <aside className="hidden w-60 shrink-0 md:block">
        <div className="lian-card sticky top-6 p-4">
          <nav className="space-y-1">
            {NAV.map((n) => {
              const active =
                n.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    active ? 'lian-btn' : 'hover:bg-black/5'
                  }`}
                >
                  <n.icon size={18} />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 space-y-1 border-t pt-4" style={{ borderColor: 'var(--lian-border)' }}>
            <Link
              href={`/u/${username}`}
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-black/5"
            >
              <ExternalLink size={18} />
              查看我的主页
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              退出登录
            </button>
          </div>
        </div>
      </aside>

      {/* 移动端底部导航 */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t px-2 py-2 md:hidden"
        style={{ background: 'var(--lian-card)', borderColor: 'var(--lian-border)' }}
      >
        {NAV.map((n) => {
          const active =
            n.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px]"
              style={active ? { color: 'var(--lian-accent)', fontWeight: 700 } : { color: 'var(--lian-muted)' }}
            >
              <n.icon size={20} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
