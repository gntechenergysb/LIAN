'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Check } from 'lucide-react';
import { THEMES } from '@/lib/themes';
import type { SessionUser } from '@/lib/auth';

export default function AppearanceForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.display_name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [theme, setTheme] = useState(user.theme || 'xuanzhi');
  const [elder, setElder] = useState(!!user.elder_mode);
  const [avatar, setAvatar] = useState(user.avatar_path || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function uploadAvatar(file: File) {
    setUploading(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!json.ok) {
        setMessage(json.error || '上传失败');
        return;
      }
      setAvatar(json.data.path);
      setMessage('头像已上传，记得点保存');
    } catch {
      setMessage('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          bio,
          theme,
          elder_mode: elder,
          avatar_path: avatar,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setMessage(json.error || '保存失败');
        return;
      }
      setMessage('已保存，去预览看看效果吧');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">外观设置</h1>
        <p className="mt-1 text-sm lian-muted">名字、简介、头像与主题，实时呈现在你的公开主页上</p>
      </div>

      <div className="lian-card space-y-4 p-6">
        <h2 className="font-bold">基本信息</h2>
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-xl font-bold lian-btn"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="头像" className="h-full w-full object-cover" />
            ) : (
              (displayName || user.username).slice(0, 1)
            )}
          </div>
          <label className="lian-btn-outline flex cursor-pointer items-center gap-2 px-4 py-2 text-sm">
            <Upload size={16} />
            {uploading ? '上传中…' : '上传头像'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
              }}
            />
          </label>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">显示名称</label>
          <input className="lian-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="如 阿茶的工作室" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">一句话简介</label>
          <textarea
            className="lian-input"
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="如：独立插画师，分享东方美学"
          />
        </div>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--lian-border)' }}>
          <div>
            <p className="font-medium">长辈模式</p>
            <p className="text-sm lian-muted">放大字号与按钮，方便年长的访客阅读</p>
          </div>
          <input type="checkbox" checked={elder} onChange={(e) => setElder(e.target.checked)} className="h-5 w-5 accent-current" style={{ accentColor: 'var(--lian-accent)' }} />
        </label>
      </div>

      <div className="lian-card p-6">
        <h2 className="font-bold">选择主题</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`theme-${t.id} overflow-hidden rounded-2xl border-2 text-left transition ${
                  active ? '' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ borderColor: active ? 'var(--lian-accent)' : 'var(--lian-border)' }}
              >
                <div className="lian-page p-4 !min-h-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold">{t.name}</p>
                    {active && <Check size={18} style={{ color: 'var(--lian-accent)' }} />}
                  </div>
                  <p className="mt-0.5 text-xs lian-muted">{t.desc}</p>
                  <div className="mt-3 space-y-1.5">
                    <div className="lian-btn px-2 py-1.5 text-center text-[11px]">链接按钮</div>
                    <div className="lian-card px-2 py-1.5 text-center text-[11px]">卡片</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {message && <p className="text-sm" style={{ color: 'var(--lian-accent)' }}>{message}</p>}
      <button type="submit" disabled={saving} className="lian-btn px-8 py-3 disabled:opacity-60">
        {saving ? '保存中…' : '保存设置'}
      </button>
    </form>
  );
}
