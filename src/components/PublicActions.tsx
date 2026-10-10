'use client';

import { useState, useEffect } from 'react';
import { Share2, X, Copy, Check, ALargeSmall } from 'lucide-react';

export default function PublicActions({
  pageUrl,
  qrDataUrl,
  elderDefault,
}: {
  pageUrl: string;
  qrDataUrl: string;
  elderDefault: boolean;
}) {
  const [showQr, setShowQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elder, setElder] = useState(elderDefault);

  useEffect(() => {
    const root = document.getElementById('public-root');
    if (root) root.classList.toggle('elder-mode', elder);
  }, [elder]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = pageUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="fixed bottom-6 right-5 z-40 flex flex-col gap-3">
        <button
          onClick={() => setElder((v) => !v)}
          title={elder ? '关闭长辈模式' : '长辈模式：放大字号'}
          className="lian-card flex h-12 w-12 items-center justify-center"
          style={elder ? { background: 'var(--lian-accent)', color: 'var(--lian-on-accent)' } : undefined}
        >
          <ALargeSmall size={20} />
        </button>
        <button
          onClick={() => setShowQr(true)}
          title="分享二维码"
          className="lian-btn flex h-12 w-12 items-center justify-center !rounded-full"
        >
          <Share2 size={20} />
        </button>
      </div>

      {showQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setShowQr(false)}
        >
          <div
            className="lian-card w-full max-w-xs p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold">分享这个主页</p>
              <button onClick={() => setShowQr(false)} className="rounded-lg p-1 hover:bg-black/5">
                <X size={18} />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="主页二维码" className="mx-auto h-48 w-48 rounded-xl bg-white p-2" />
            <p className="mt-3 text-xs lian-muted">微信扫一扫，直达主页 · 长按可保存</p>
            <button onClick={copy} className="lian-btn mt-4 flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm">
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? '已复制链接' : '复制主页链接'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
