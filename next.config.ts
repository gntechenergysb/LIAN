import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

// 让 `npm run dev` 也能拿到 D1 / R2 等本地绑定
initOpenNextCloudflareForDev();

export default nextConfig;
