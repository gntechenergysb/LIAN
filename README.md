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
- SQLite（Node.js 24 内置 `node:sqlite`，**零原生依赖**，`npm install` 无需编译）
- JWT（jose）+ scrypt 密码哈希
- 二维码（qrcode）

## 快速开始

```bash
# 1. 安装依赖（纯 JS，无需编译，无 403 问题）
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，把 LIAN_JWT_SECRET 换成随机长字符串

# 3. 启动开发模式
npm run dev
# 打开 http://localhost:3000 注册第一个账号

# 生产构建
npm run build
npm run start
```

数据库文件自动创建在 `data/lian.db`，上传的图片保存在 `public/uploads/`（均已加入 .gitignore）。

## 部署

推荐部署到有持久化磁盘的平台（SQLite 是文件数据库）：

- **VPS**（如云服务器）：`npm run build && npm run start`，用 pm2 / systemd 守护
- **Railway / Fly.io**：挂载 Volume 到 `/app/data` 与 `/app/public/uploads`
- **Vercel 等 Serverless**：不建议直连 SQLite（文件系统易失），如需可用 Turso 等 SQLite 云服务替换 `src/lib/db.ts`

环境变量：

| 变量 | 说明 | 必填 |
|---|---|---|
| `LIAN_JWT_SECRET` | JWT 签名密钥，生产务必更换 | 是 |
| `LIAN_BASE_URL` | 公开主页域名（如 `https://lian.example.com`），用于二维码；不填则自动推断 | 否 |
| `PORT` | 监听端口，默认 3000 | 否 |

## 项目结构

```
src/
├── app/
│   ├── page.tsx                 # 落地页
│   ├── login/ register/         # 登录 / 注册
│   ├── dashboard/               # 创作者控制台（总览/链接/外观/打赏/数据/设置）
│   ├── u/[username]/page.tsx    # 公开主页
│   ├── r/[id]/route.ts          # 链接点击统计跳转
│   └── api/                     # 后端 API（auth/profile/links/tips/upload/stats）
├── components/                  # 交互组件
└── lib/
    ├── db.ts                    # node:sqlite 数据层与表结构
    ├── auth.ts                  # 密码哈希 / JWT / 会话
    ├── greetings.ts             # 时辰与节气
    ├── themes.ts                # 六套主题定义
    ├── site.ts                  # 站点域名推断
    └── api.ts                   # API 工具函数
```

## 设计文档

产品概念与亚洲化设计思路见 [CONCEPT.md](./CONCEPT.md)。
