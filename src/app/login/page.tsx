'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || '登录失败');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="theme-xuanzhi lian-page flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl lian-btn text-2xl font-bold">
            链
          </Link>
          <h1 className="mt-4 text-2xl font-bold">欢迎回来</h1>
          <p className="mt-1 text-sm lian-muted">登录你的链主页控制台</p>
        </div>
        <form onSubmit={submit} className="lian-card space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">用户名</label>
            <input
              className="lian-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="你的用户名"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">密码</label>
            <input
              className="lian-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="lian-btn w-full py-3 disabled:opacity-60">
            {loading ? '登录中…' : '登录'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm lian-muted">
          还没有账号？{' '}
          <Link href="/register" className="font-semibold" style={{ color: 'var(--lian-accent)' }}>
            免费注册
          </Link>
        </p>
      </div>
    </div>
  );
}
