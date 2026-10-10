'use client';

import { useState } from 'react';
import { Copy, Check, KeyRound } from 'lucide-react';

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className="lian-btn-outline flex items-center gap-2 px-4 py-2 text-sm">
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? '已复制' : '复制链接'}
    </button>
  );
}

export function PasswordForm() {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPw, new_password: newPw }),
      });
      const json = await res.json();
      if (!json.ok) {
        setMessage(json.error || '修改失败');
        return;
      }
      setMessage('密码已修改');
      setOldPw('');
      setNewPw('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="lian-card space-y-4 p-6">
      <h2 className="flex items-center gap-2 font-bold">
        <KeyRound size={18} /> 修改密码
      </h2>
      <input
        type="password"
        className="lian-input"
        placeholder="原密码"
        value={oldPw}
        onChange={(e) => setOldPw(e.target.value)}
        required
      />
      <input
        type="password"
        className="lian-input"
        placeholder="新密码（至少 6 位）"
        value={newPw}
        onChange={(e) => setNewPw(e.target.value)}
        required
      />
      {message && <p className="text-sm" style={{ color: 'var(--lian-accent)' }}>{message}</p>}
      <button type="submit" disabled={busy} className="lian-btn px-5 py-2.5 text-sm disabled:opacity-60">
        {busy ? '提交中…' : '修改密码'}
      </button>
    </form>
  );
}
