import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.join(process.cwd(), 'data', 'lian.db');

declare global {
  // eslint-disable-next-line no-var
  var __lianDb: DatabaseSync | undefined;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_path TEXT DEFAULT '',
  theme TEXT DEFAULT 'xuanzhi',
  elder_mode INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1,
  click_count INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_links_user ON links(user_id, sort_order);
CREATE TABLE IF NOT EXISTS tips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  label TEXT DEFAULT '',
  qr_path TEXT DEFAULT '',
  enabled INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS visits (
  user_id TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
`;

export function getDb(): DatabaseSync {
  if (!globalThis.__lianDb) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec(SCHEMA);
    globalThis.__lianDb = db;
  }
  return globalThis.__lianDb;
}

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

export function publicUser(row: UserRow) {
  const { password_hash: _ph, ...rest } = row;
  return rest;
}
