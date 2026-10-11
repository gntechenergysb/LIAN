import { getCloudflareContext } from '@opennextjs/cloudflare';

// 服务 R2 中的用户上传文件（头像 / 收款码），URL 形如 /uploads/xxx.jpg
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const filename = key.join('/');
  // 简单防遍历：只允许 uploads/ 下的直接文件
  if (!/^[A-Za-z0-9._-]+$/.test(filename)) {
    return new Response('Not found', { status: 404 });
  }
  const objectKey = `uploads/${filename}`;
  const { env } = getCloudflareContext();
  const obj = await env.UPLOADS.get(objectKey);
  if (!obj) return new Response('Not found', { status: 404 });
  return new Response(obj.body, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
