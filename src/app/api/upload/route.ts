import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { ok, fail } from '@/lib/api';
import { requireAuth } from '@/lib/api';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail('请上传图片文件');
  }
  const file = form.get('file');
  if (!(file instanceof File)) return fail('请上传图片文件');
  if (!ALLOWED.has(file.type)) return fail('仅支持 PNG / JPG / WebP / GIF 图片');
  if (file.size > MAX_SIZE) return fail('图片不能超过 5MB');
  if (file.size === 0) return fail('图片文件为空');

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${EXT[file.type]}`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), buf);
  return ok({ path: `/uploads/${name}` }, 201);
}
