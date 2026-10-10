import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import DashboardNav from '@/components/DashboardNav';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="theme-xuanzhi lian-page min-h-screen">
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ background: 'color-mix(in srgb, var(--lian-bg) 88%, transparent)', borderColor: 'var(--lian-border)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg lian-btn font-bold">
              链
            </span>
            <span className="font-bold tracking-wide">控制台</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="lian-muted hidden sm:inline">@{user.username}</span>
            <Link
              href={`/u/${user.username}`}
              target="_blank"
              className="lian-btn-outline px-4 py-1.5 text-sm"
            >
              预览主页
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6 pb-24 md:pb-6">
        <DashboardNav username={user.username} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
