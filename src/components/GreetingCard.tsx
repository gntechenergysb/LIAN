'use client';

import { useEffect, useState } from 'react';
import { getGreeting } from '@/lib/greetings';

// 时辰节气问候用访客本地时间计算（Cloudflare 边缘服务器是 UTC 时间）
export default function GreetingCard() {
  const [greeting, setGreeting] = useState<{ shichen: string; term: string; text: string } | null>(null);

  useEffect(() => {
    setGreeting(getGreeting(new Date()));
  }, []);

  if (!greeting) {
    return (
      <div className="lian-card mt-6 animate-pulse px-5 py-4 text-center">
        <p className="text-sm lian-muted">问候加载中…</p>
      </div>
    );
  }

  return (
    <div className="lian-card mt-6 px-5 py-4 text-center">
      <p className="text-sm font-medium">
        {greeting.shichen} · {greeting.term}
      </p>
      <p className="mt-1 text-sm lian-muted">{greeting.text}</p>
    </div>
  );
}
