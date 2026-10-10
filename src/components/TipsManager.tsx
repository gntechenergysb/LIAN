'use client';

import { useState } from 'react';
import { Upload, Trash2, Power } from 'lucide-react';
import type { TipRow } from '@/lib/db';

const PROVIDER_LABEL: Record<string, string> = { wechat: '微信', alipay: '支付宝' };

export default function TipsManager({ initial }: { initial: TipRow[] }) {
  const [tips, setTips] = useState<TipRow[]>(initial);
  const [provider, setProvider] = useState('wechat');
  const [label, setLabel] = useState('');
  const [qrPath, setQrPath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    const res = await fetch('/api/tips');
    const json = await res.json();
    if (json.ok) setTips(json.data.tips);
  }

  async function upload(file: File) {
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || '上传失败');
        return;
      }
      setQrPath(json.data.path);
    } finally {
      setUploading(false);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!qrPath) {
      setError('请先上传收款码图片');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, label, qr_path: qrPath }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setLabel('');
      setQrPath('');
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggle(tip: TipRow) {
    await fetch(`/api/tips/${tip.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !tip.enabled }),
    });
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm('确定删除这个收款码吗？')) return;
    await fetch(`/api/tips/${id}`, { method: 'DELETE' });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">打赏收款码</h1>
        <p className="mt-1 text-sm lian-muted">上传微信 / 支付宝收款码，访客可在你的主页扫码打赏</p>
      </div>

      <form onSubmit={add} className="lian-card space-y-4 p-6">
        <h2 className="font-bold">添加收款码</h2>
        <div className="flex gap-3">
          {(['wechat', 'alipay'] as const).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setProvider(p)}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                provider === p ? '' : 'opacity-60'
              }`}
              style={{
                borderColor: provider === p ? 'var(--lian-accent)' : 'var(--lian-border)',
                color: provider === p ? 'var(--lian-accent)' : undefined,
              }}
            >
              {PROVIDER_LABEL[p]}收款码
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {qrPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrPath} alt="收款码预览" className="h-28 w-28 rounded-xl border object-cover" style={{ borderColor: 'var(--lian-border)' }} />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-xl border text-xs lian-muted" style={{ borderColor: 'var(--lian-border)' }}>
              预览
            </div>
          )}
          <label className="lian-btn-outline flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm">
            <Upload size={16} />
            {uploading ? '上传中…' : '上传收款码图片'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
              }}
            />
          </label>
        </div>
        <input
          className="lian-input"
          placeholder="备注，如：请我喝杯咖啡（选填）"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="lian-btn px-5 py-2.5 text-sm disabled:opacity-60">
          {busy ? '添加中…' : '添加收款码'}
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {tips.map((tip) => (
          <div key={tip.id} className={`lian-card flex gap-4 p-4 ${tip.enabled ? '' : 'opacity-55'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tip.qr_path} alt={`${PROVIDER_LABEL[tip.provider]}收款码`} className="h-24 w-24 rounded-xl border object-cover" style={{ borderColor: 'var(--lian-border)' }} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{PROVIDER_LABEL[tip.provider] ?? tip.provider}</p>
              {tip.label && <p className="mt-0.5 truncate text-sm lian-muted">{tip.label}</p>}
              <div className="mt-2 flex gap-1">
                <button
                  title={tip.enabled ? '隐藏' : '显示'}
                  onClick={() => toggle(tip)}
                  className="rounded-lg p-2 hover:bg-black/5"
                  style={tip.enabled ? { color: 'var(--lian-accent)' } : undefined}
                >
                  <Power size={16} />
                </button>
                <button title="删除" onClick={() => remove(tip.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {tips.length === 0 && (
        <div className="lian-card p-8 text-center text-sm lian-muted">
          还没有收款码，在上方添加微信或支付宝收款码。
        </div>
      )}
    </div>
  );
}
