import { getCloudflareContext } from '@opennextjs/cloudflare';
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

function randomHex(bytes: number): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

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

  const name = `${Date.now()}-${randomHex(8)}${EXT[file.type]}`;
  const key = `uploads/${name}`;
  const { env } = getCloudflareContext();
  await env.UPLOADS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  return ok({ path: `/uploads/${name}` }, 201);
}
