import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cache } from 'react';

// ---- Cloudflare D1 数据层 ----
// D1 是 Cloudflare 的 Serverless SQLite，SQL 方言与 node:sqlite 兼容。
// Workers 里不允许模块级全局连接，因此用 per-request 的 cache() 模式。

export const getD1 = cache(() => getCloudflareContext().env.DB);

export async function dbAll<T>(sql: string, ...params: unknown[]): Promise<T[]> {
  const { results } = await getD1().prepare(sql).bind(...params).all<T>();
  return results ?? [];
}

export async function dbGet<T>(sql: string, ...params: unknown[]): Promise<T | null> {
  const row = await getD1().prepare(sql).bind(...params).first<T>();
  return row ?? null;
}

export async function dbRun(sql: string, ...params: unknown[]): Promise<void> {
  await getD1().prepare(sql).bind(...params).run();
}

export async function dbBatch(items: { sql: string; params: unknown[] }[]): Promise<void> {
  const db = getD1();
  await db.batch(items.map(({ sql, params }) => db.prepare(sql).bind(...params)));
}

// ---- 行类型 ----

export interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  bio: string;
  avatar_path: string;
  theme: string;
  elder_mode: number;
  created_at: number;
}

export interface LinkRow {
  id: string;
  user_id: string;
  title: string;
  url: string;
  sort_order: number;
  enabled: number;
  click_count: number;
  created_at: number;
}

export interface TipRow {
  id: string;
  user_id: string;
  provider: string;
  label: string;
  qr_path: string;
  enabled: number;
  created_at: number;
}
