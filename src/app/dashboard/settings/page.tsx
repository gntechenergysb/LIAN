import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import { getBaseUrl } from '@/lib/site';
import { CopyLinkButton, PasswordForm } from '@/components/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const base = await getBaseUrl();
  const pageUrl = `${base}/u/${user.username}`;
  const qrDataUrl = await QRCode.toDataURL(pageUrl, { width: 280, margin: 1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="mt-1 text-sm lian-muted">分享你的主页，管理账号安全</p>
      </div>

      <div className="lian-card p-6">
        <h2 className="flex items-center gap-2 font-bold">
          <QrCode size={18} /> 分享我的主页
        </h2>
        <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="主页二维码"
            className="h-44 w-44 rounded-2xl border bg-white p-2"
            style={{ borderColor: 'var(--lian-border)' }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm lian-muted">你的专属主页地址</p>
            <p className="mt-1 break-all font-mono text-sm font-semibold">{pageUrl}</p>
            <div className="mt-3">
              <CopyLinkButton url={pageUrl} />
            </div>
            <p className="mt-3 text-xs leading-relaxed lian-muted">
              把二维码发到微信群、印在名片上，别人扫一扫就能打开你的主页。
              右键 / 长按二维码可保存图片。
            </p>
          </div>
        </div>
      </div>

      <PasswordForm />

      <div className="lian-card p-6">
        <h2 className="font-bold">账号信息</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="lian-muted">用户名</dt>
            <dd className="font-mono">@{user.username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="lian-muted">注册时间</dt>
            <dd>{new Date(user.created_at).toLocaleDateString('zh-CN')}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
