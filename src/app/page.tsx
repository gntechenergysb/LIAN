import Link from 'next/link';
import {
  QrCode,
  Wallet,
  Sun,
  Palette,
  Eye,
  BarChart3,
  ArrowRight,
  Link2,
  Sparkles,
} from 'lucide-react';
import { THEMES } from '@/lib/themes';

const FEATURES = [
  {
    icon: QrCode,
    title: '二维码一级分享',
    desc: '每个主页自带专属二维码，微信里扫一扫即达，符合亚洲人的分享习惯。',
  },
  {
    icon: Wallet,
    title: '微信 / 支付宝打赏',
    desc: '上传你的收款码，粉丝一键打赏，不再需要跳转海外支付。',
  },
  {
    icon: Sun,
    title: '时辰与节气问候',
    desc: '子时、卯时、清明、霜降……访客每次打开，都有一句东方的问候。',
  },
  {
    icon: Palette,
    title: '六套东方美学主题',
    desc: '宣纸、水墨、樱、青瓷、朱砂、月夜，一键切换你的主页气质。',
  },
  {
    icon: Eye,
    title: '长辈模式',
    desc: '一键放大字号与按钮，爸妈也能轻松点开你的每一个链接。',
  },
  {
    icon: BarChart3,
    title: '访问与点击统计',
    desc: '每天多少人来过、哪个链接最受欢迎，一目了然。',
  },
];

export default function LandingPage() {
  return (
    <div className="theme-xuanzhi lian-page">
      {/* 导航 */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl lian-btn text-lg font-bold">
            链
          </span>
          <span className="text-xl font-bold tracking-wide">LIAN</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="lian-btn-outline px-5 py-2 text-sm">
            登录
          </Link>
          <Link href="/register" className="lian-btn px-5 py-2 text-sm">
            免费开始
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6">
        <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm lian-muted theme-xuanzhi" style={{ borderColor: 'var(--lian-border)' }}>
              <Sparkles size={15} />
              为亚洲用户打造的 bio-link
            </div>
            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              一链
              <span style={{ color: 'var(--lian-accent)' }}>万连</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed lian-muted">
              一个主页，收纳你的公众号、小红书、作品集、店铺与收款码。
              二维码一扫即达，微信支付宝皆可打赏——这才是我们习惯的分享方式。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="lian-btn inline-flex items-center gap-2 px-7 py-3.5">
                免费创建我的主页 <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="lian-btn-outline inline-flex items-center gap-2 px-7 py-3.5">
                <Link2 size={18} /> 已有账号
              </Link>
            </div>
            <p className="mt-4 text-sm lian-muted">无需信用卡 · 1 分钟上线 · 永久免费版</p>
          </div>

          {/* 手机预览 */}
          <div className="mx-auto w-full max-w-[300px]">
            <div className="rounded-[2.2rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
              <div className="theme-xuanzhi lian-page min-h-[520px] rounded-[1.6rem] p-5 text-center !min-h-0">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold lian-btn">
                  茶
                </div>
                <p className="mt-3 font-bold">阿茶的工作室</p>
                <p className="mt-1 text-xs lian-muted">卯时日出 · 清明</p>
                <div className="mt-5 space-y-2.5">
                  {['最新作品集', '小红书日常', '微信公众号', '淘宝小店'].map((t) => (
                    <div key={t} className="lian-card lian-link px-4 py-3 text-sm font-medium">
                      {t}
                    </div>
                  ))}
                </div>
                <div className="mx-auto mt-5 grid h-20 w-20 place-items-center rounded-xl border text-xs lian-muted" style={{ borderColor: 'var(--lian-border)' }}>
                  <QrCode size={36} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 功能 */}
        <section className="py-16">
          <h2 className="text-center text-3xl font-bold">不止是链接聚合</h2>
          <p className="mt-3 text-center lian-muted">为东方人的使用习惯而设计</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="lian-card p-6">
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: 'color-mix(in srgb, var(--lian-accent) 12%, transparent)', color: 'var(--lian-accent)' }}
                >
                  <f.icon size={22} />
                </div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed lian-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 主题 */}
        <section className="py-16">
          <h2 className="text-center text-3xl font-bold">六套主题，随心而变</h2>
          <p className="mt-3 text-center lian-muted">从宣纸到月夜，总有一款是你的气质</p>
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3">
            {THEMES.map((t) => (
              <div key={t.id} className={`theme-${t.id} lian-card overflow-hidden`}>
                <div className="lian-page p-6 !min-h-0">
                  <p className="text-2xl font-black">{t.name}</p>
                  <p className="mt-1 text-sm lian-muted">{t.desc}</p>
                  <div className="mt-4 space-y-2">
                    <div className="lian-btn px-3 py-2 text-center text-xs">链接按钮</div>
                    <div className="lian-card px-3 py-2 text-center text-xs">卡片样式</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <h2 className="text-4xl font-black">现在，把全网的你<br />收进一页里</h2>
          <Link href="/register" className="lian-btn mt-8 inline-flex items-center gap-2 px-8 py-4 text-lg">
            免费开始 <ArrowRight size={20} />
          </Link>
        </section>
      </main>

      <footer className="border-t px-6 py-8 text-center text-sm lian-muted" style={{ borderColor: 'var(--lian-border)' }}>
        链 LIAN · 一链万连 — 为亚洲用户打造的个人主页
      </footer>
    </div>
  );
}
