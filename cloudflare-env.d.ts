// 由 `npm run cf-typegen`（wrangler types）自动生成并覆盖。
// 手写最小版本，保证本地类型检查通过。

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

interface R2ObjectBody {
  readonly body: ReadableStream;
  readonly httpMetadata?: { contentType?: string };
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | string,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
}

interface CloudflareEnv {
  DB: D1Database;
  UPLOADS: R2Bucket;
  LIAN_JWT_SECRET: string;
  LIAN_BASE_URL?: string;
}
