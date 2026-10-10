'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Power, ExternalLink } from 'lucide-react';
import type { LinkRow } from '@/lib/db';

export default function LinksManager({ initial }: { initial: LinkRow[] }) {
  const [links, setLinks] = useState<LinkRow[]>(initial);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    const res = await fetch('/api/links');
    const json = await res.json();
    if (json.ok) setLinks(json.data.links);
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setTitle('');
      setUrl('');
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggle(link: LinkRow) {
    await fetch(`/api/links/${link.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !link.enabled }),
    });
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm('确定删除这条链接吗？')) return;
    await fetch(`/api/links/${id}`, { method: 'DELETE' });
    await refresh();
  }

  function startEdit(link: LinkRow) {
    setEditing(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
  }

  async function saveEdit(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, url: editUrl }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error);
        return;
      }
      setEditing(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = [...links];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setLinks(next);
    await fetch('/api/links/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((l) => l.id) }),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">链接管理</h1>
        <p className="mt-1 text-sm lian-muted">访客点击将通过统计跳转，数据会记入「数据」页</p>
      </div>

      <form onSubmit={add} className="lian-card space-y-3 p-5">
        <h2 className="font-bold">添加新链接</h2>
        <input
          className="lian-input"
          placeholder="标题，如：我的小红书"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="lian-input"
          placeholder="https://…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="lian-btn flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60">
          <Plus size={16} /> {busy ? '添加中…' : '添加链接'}
        </button>
      </form>

      <div className="space-y-3">
        {links.length === 0 && (
          <div className="lian-card p-8 text-center text-sm lian-muted">
            还没有链接，在上方添加第一条吧。
          </div>
        )}
        {links.map((link, i) => (
          <div key={link.id} className={`lian-card p-4 ${link.enabled ? '' : 'opacity-55'}`}>
            {editing === link.id ? (
              <div className="space-y-2">
                <input className="lian-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <input className="lian-input" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(link.id)} disabled={busy} className="lian-btn px-4 py-2 text-sm">
                    保存
                  </button>
                  <button onClick={() => setEditing(null)} className="lian-btn-outline px-4 py-2 text-sm">
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{link.title}</p>
                  <p className="truncate text-xs lian-muted">{link.url}</p>
                  <p className="mt-1 text-xs lian-muted">{link.click_count} 次点击</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button title="上移" onClick={() => move(i, -1)} className="rounded-lg p-2 hover:bg-black/5">
                    <ChevronUp size={16} />
                  </button>
                  <button title="下移" onClick={() => move(i, 1)} className="rounded-lg p-2 hover:bg-black/5">
                    <ChevronDown size={16} />
                  </button>
                  <button
                    title={link.enabled ? '隐藏' : '显示'}
                    onClick={() => toggle(link)}
                    className="rounded-lg p-2 hover:bg-black/5"
                    style={link.enabled ? { color: 'var(--lian-accent)' } : undefined}
                  >
                    <Power size={16} />
                  </button>
                  <a href={link.url} target="_blank" rel="noreferrer" title="打开" className="rounded-lg p-2 hover:bg-black/5">
                    <ExternalLink size={16} />
                  </a>
                  <button title="编辑" onClick={() => startEdit(link)} className="rounded-lg p-2 hover:bg-black/5">
                    <Pencil size={16} />
                  </button>
                  <button title="删除" onClick={() => remove(link.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
