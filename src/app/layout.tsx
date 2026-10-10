import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '链 LIAN · 一链万连',
  description: '为亚洲用户打造的个人主页聚合：一页收纳你的全部链接、收款码与问候',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
