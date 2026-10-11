# 链 LIAN · 一链万连

为亚洲用户打造的个人主页聚合产品（Linktree 类）：一个主页，收纳你的公众号、小红书、作品集、店铺与收款码。

## 功能

- **个人公开主页** `/u/你的用户名`：头像、简介、链接列表一页呈现
- **二维码分享**：每个主页自带专属二维码，微信扫一扫即达；控制台一键复制链接
- **微信 / 支付宝打赏**：上传收款码，访客扫码打赏
- **时辰 × 节气问候**：子时到亥时十二时辰 + 二十四节气，访客每次打开都有一句东方问候
- **六套东方美学主题**：宣纸、水墨、樱、青瓷、朱砂、月夜，一键切换
- **长辈模式**：一键放大字号与按钮，爸妈也能轻松点开
- **链接管理**：增删改、启用/隐藏、上下排序，点击经统计跳转
- **数据统计**：近 14 天访问趋势、累计访问/点击、链接点击排行
- **账号安全**：密码 scrypt 哈希存储，JWT httpOnly Cookie 会话

## 技术栈

- Next.js 15（App Router）+ React 19 + TypeScript
- Tailwind CSS 4
- **Cloudflare Workers**（经 `@opennextjs/cloudflare` 适配）
- **Cloudflare D1**（Serverless SQLite，免运维）
- **Cloudflare R2**（头像 / 收款码等上传文件存储）
- JWT（jose）+ PBKDF2-SHA256 密码哈希（WebCrypto，Workers 兼容）
- 二维码（qrcode）

## 本地开发

```bash
npm install

# 本地 D1 建表（只需一次）
npx wrangler d1 migrations apply lian-db --local

# 在 .dev.vars 里写：LIAN_JWT_SECRET=任意随机字符串

# 方式一：普通 Next 开发模式（UI 调试最快）
npm run dev

# 方式二：完整 Workers 环境预览（含本地 D1 / R2）
npm run preview
```

## 部署到 Cloudflare（推荐）

### 准备工作（只需做一次）

1. 注册 [Cloudflare](https://dash.cloudflare.com) 账号，本地登录：
   ```bash
   npx wrangler login
   ```
2. 创建 D1 数据库和 R2 存储桶：
   ```bash
   npx wrangler d1 create lian-db
   # 把返回的 database_id 填进 wrangler.toml 对应位置
   npx wrangler r2 bucket create lian-uploads
   ```
3. 初始化线上表结构：
   ```bash
   npx wrangler d1 migrations apply lian-db --remote
   ```
4. 设置 JWT 密钥（机密，不要写进代码）：
   ```bash
   npx wrangler secret put LIAN_JWT_SECRET
   ```

### 一键部署

```bash
npm run deploy
```

成功后会得到 `https://lian.<你的子域名>.workers.dev`。建议在 Cloudflare 后台绑定自己的域名，
然后在 `wrangler.toml` 的 `[vars]` 里填上 `LIAN_BASE_URL=https://你的域名`（二维码用），再 `npm run deploy` 一次。

### 环境变量

| 变量 | 位置 | 说明 |
|---|---|---|
| `LIAN_JWT_SECRET` | `wrangler secret` / `.dev.vars` | JWT 签名密钥，生产务必更换 |
| `LIAN_BASE_URL` | `wrangler.toml [vars]` | 公开主页域名，用于二维码；不填则自动推断 |

## 项目结构

```
wrangler.toml                 # Cloudflare 部署配置（D1 / R2 绑定）
open-next.config.ts           # OpenNext Cloudflare 构建配置
cloudflare-env.d.ts           # 绑定类型（wrangler types 可重新生成）
migrations/0001_init.sql      # D1 表结构迁移
src/
├── app/
│   ├── page.tsx                 # 落地页
│   ├── login/ register/         # 登录 / 注册
│   ├── dashboard/               # 创作者控制台（总览/链接/外观/打赏/数据/设置）
│   ├── u/[username]/page.tsx    # 公开主页
│   ├── r/[id]/route.ts          # 链接点击统计跳转
│   ├── uploads/[...key]/route.ts # R2 文件服务（头像/收款码）
│   └── api/                     # 后端 API（auth/profile/links/tips/upload/stats）
├── components/                  # 交互组件（含 GreetingCard 时辰问候）
└── lib/
    ├── db.ts                    # D1 数据层（异步）
    ├── auth.ts                  # PBKDF2 密码哈希 / JWT / 会话
    ├── greetings.ts             # 时辰与节气（客户端按访客时区计算）
    ├── themes.ts                # 六套主题定义
    ├── site.ts                  # 站点域名推断
    └── api.ts                   # API 工具函数
```

## 设计文档

产品概念与亚洲化设计思路见 [CONCEPT.md](./CONCEPT.md)。
