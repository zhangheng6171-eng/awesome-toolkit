# Awesome Toolkit — 项目状态报告

> 生成日期：2026-06-02
> 项目版本：v0.1.0
> 线上地址：https://awesome-toolkit.pages.dev

---

## 1. 当前项目整体状态总结

### 项目简介

Awesome Toolkit（GitHub 精选工具库）是一个面向**非技术人员**的开源工具推荐与一键部署平台。从 GitHub 精选 50+ 最强开源工具，提供中文使用说明，支持一键部署到用户自己的服务器。

**核心价值主张**：让普通人也能在自己的服务器上运行开源软件，无需懂 Docker、无需读英文文档。

### 已完成功能

#### 核心功能
| 功能 | 状态 | 说明 |
|------|------|------|
| 工具库浏览与搜索 | ✅ 完成 | 50 个工具，支持按名称/描述/标签搜索 |
| 多维筛选 | ✅ 完成 | 按分类(8类)、难度(1-5)、适合人群、许可证、Web界面筛选 |
| 工具详情页 | ✅ 完成 | 面包屑导航、使用步骤、同类推荐、GitHub 链接 |
| 工具对比 | ✅ 完成 | 2-4 个工具横向维度对比，URL 参数保持状态 |
| 一键部署 | ✅ 完成 | 28 个工具支持，4 步部署向导 |
| Python Agent | ✅ 完成 | 轻量部署代理（无外部依赖），端口 9876 |
| SSE 流式日志 | ✅ 完成 | 部署过程实时推送终端输出 |
| 控制台 | ✅ 完成 | 服务器管理、工具更新/卸载、部署历史 |
| 邮件订阅 | ✅ 完成 | KV 存储邮件，首页和定价页均有入口 |
| 用户反馈 | ✅ 完成 | 反馈表单，KV 存储 |
| 工具推荐 | ✅ 完成 | Modal 表单 → GitHub Issue 提交 |
| 移动端响应式 | ✅ 完成 | 7 个组件适配 375px 宽度 |
| 用户认证 | ✅ 完成 | Cloudflare Access（CF Access 头部）+ localStorage 兜底 |
| SEO 优化 | ✅ 完成 | OG 标签、sitemap.xml(112 URL)、robots.txt、动态 Meta |

#### 安全功能
| 功能 | 状态 | 说明 |
|------|------|------|
| Agent Token 认证 | ✅ 完成 | 32 字符随机 Token |
| Agent 命令白名单 | ✅ 完成 | 仅允许 docker compose/ps/stats 等 |
| Agent IP 锁定 | ✅ 完成 | 同一 IP 5 次失败锁定 10 分钟 |
| API 频率限制 | ✅ 完成 | 10 req/min/IP（内存 Map） |
| CF Access 认证 | ✅ 完成 | Cloudflare Zero Trust |

#### 运维自动化
| 功能 | 状态 | 说明 |
|------|------|------|
| Star 数自动更新 | ✅ 完成 | GitHub Actions 每日运行 |
| Cloudflare 部署 | ✅ 完成 | GitHub Actions 自动部署 |
| AI 描述生成 | ✅ 完成 | 脚本 scripts/generate-descriptions.mjs |

### 已完成页面

| 路由 | 页面 | 渲染方式 | 说明 |
|------|------|----------|------|
| `/` | 首页 | Static | 搜索、筛选、50 工具卡片、用户评价、邮件订阅 |
| `/about` | 关于页 | Static | 项目理念、数据统计、联系方式 |
| `/compare` | 工具对比 | Client | 2-4 工具横向对比表 + 移动端卡片栈 |
| `/dashboard` | 控制台 | Client | 服务器管理、KV 同步、更新/卸载 |
| `/deploy` | 部署列表 | Static | 28 个可部署工具 |
| `/deploy/[id]` | 部署详情 | SSG (28页) | 配置信息、环境变量、注意事项 |
| `/deploy/[id]/wizard` | 部署向导 | SSG + Client (28页) | 4 步向导：安装 Agent → 连接 → 配置 → 部署 |
| `/feedback` | 反馈页 | Static | 反馈表单 |
| `/pricing` | 定价页 | Static | 早期用户免费计划、未来价格预览 |
| `/tool/[id]` | 工具详情 | SSG (50页) | 面包屑、步骤、同类推荐、一键部署 CTA |
| `/_not-found` | 404 页 | Static | 自定义 404，含热门工具链接 |

**总页面数：115**（`npm run build` 输出确认）

### 已完成 API（Cloudflare Functions）

| 端点 | 文件 | 方法 | 功能 |
|------|------|------|------|
| `/api/deploy/connect` | `functions/api/deploy/connect.ts` | POST | 代理检测 Agent 在线状态 |
| `/api/deploy/execute` | `functions/api/deploy/execute.ts` | POST | SSE 流式部署，拉取 compose 文件并转发到 Agent |
| `/api/deploy/history` | `functions/api/deploy/history.ts` | GET | 查询用户部署历史（KV） |
| `/api/servers` | `functions/api/servers.ts` | GET/POST/DELETE | 服务器 CRUD（KV） |
| `/api/waitlist` | `functions/api/waitlist.ts` | POST | 邮件订阅（KV） |
| `/api/auth/upgrade` | `functions/api/auth/upgrade.ts` | GET/POST | 用户认证与方案升级（KV） |
| `/api/feedback` | `functions/api/feedback.ts` | POST | 用户反馈收集（KV） |
| `/api/deploy/_middleware` | `functions/api/deploy/_middleware.ts` | — | 频率限制中间件 |

### 已完成 Cloudflare 集成

| 集成项 | 状态 | 说明 |
|--------|------|------|
| Cloudflare Pages | ✅ | 静态站点托管，`wrangler.toml` 配置完成 |
| Cloudflare Functions | ✅ | 8 个 API 端点，`/functions` 目录 |
| KV Namespaces | ✅ | DEPLOY_KV（部署/用户/服务器/反馈）、WAITLIST_KV（邮件） |
| wrangler.toml | ✅ | 双 KV 绑定 + BASE_URL 环境变量 |
| Cloudflare Access | ✅ | 认证机制已集成（UserMenu、auth.ts），待控制台配置 Zero Trust |
| CDN/SSL/DDoS | ✅ | Cloudflare 自带，无需额外配置 |

### 已完成 KV 设计

**Namespace: DEPLOY_KV**

| Key 模式 | 用途 | 读写 |
|----------|------|------|
| `deploy:{email}:{timestamp}` | 部署历史记录 | 写入：deploy/execute；读取：deploy/history |
| `user:{email}:tier` | 用户方案等级 | 写入：auth/upgrade POST；读取：auth/upgrade GET |
| `server:{email}:{serverId}` | 服务器信息 | 写入：servers POST/DELETE；读取：servers GET |
| `feedback:{timestamp}` | 用户反馈 | 写入：feedback POST |

**Namespace: WAITLIST_KV**

| Key 模式 | 用途 | 读写 |
|----------|------|------|
| `waitlist:{email}` | 邮件订阅记录 | 写入：waitlist POST |

---

## 2. 当前代码架构说明

### 项目目录结构

```
E:\claudecode2\
├── .github/workflows/           # CI/CD
│   ├── deploy-cloudflare.yml     # 自动部署到 Cloudflare Pages
│   └── update-stars.yml          # 每日自动更新 GitHub Star 数
├── docs/                         # 项目文档（8 个 .md）
│   ├── CLOUDFLARE-ACCESS-SETUP.md
│   ├── CLOUDFLARE-DEPLOY.md
│   ├── DEPLOY-AND-AFFILIATE.md
│   ├── LAUNCH-CHECKLIST.md
│   ├── LAUNCH-COPY.md
│   ├── PROJECT_STATUS.md
│   ├── SAAS-ROADMAP.md
│   └── TESTING-CHECKLIST.md
├── functions/                    # Cloudflare Functions（API 层）
│   └── api/
│       ├── auth/upgrade.ts       # 用户认证与方案管理
│       ├── deploy/
│       │   ├── _middleware.ts    # 频率限制
│       │   ├── connect.ts       # Agent 连接检测
│       │   ├── execute.ts       # SSE 流式部署
│       │   └── history.ts       # 部署历史查询
│       ├── feedback.ts           # 反馈收集
│       ├── servers.ts            # 服务器 CRUD
│       └── waitlist.ts           # 邮件订阅
├── public/
│   ├── agent/
│   │   ├── agent.py              # Python Agent（用户服务器上运行）
│   │   └── install-agent.sh      # Agent 一键安装脚本
│   ├── deploy/
│   │   ├── install.sh            # 通用部署脚本（旧版）
│   │   ├── uninstall.sh          # 通用卸载脚本（旧版）
│   │   └── tools/                # 28 个工具的 docker-compose.yml
│   │       ├── immich/
│   │       ├── n8n/
│   │       ├── vaultwarden/
│   │       └── ... (25 more)
│   ├── robots.txt
│   └── sitemap.xml               # 112 个 URL
├── scripts/
│   ├── generate-descriptions.mjs # AI 生成工具描述（Claude Haiku API）
│   ├── new-tools.json            # 待录入的新工具数据
│   └── update-stars.mjs          # 手动更新 Star 数脚本
├── src/
│   ├── app/                      # Next.js App Router 页面
│   │   ├── layout.tsx            # 根布局 + SEO 元数据
│   │   ├── page.tsx              # 首页
│   │   ├── not-found.tsx         # 自定义 404
│   │   ├── globals.css           # 全局样式
│   │   ├── about/page.tsx
│   │   ├── compare/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── deploy/
│   │   │   ├── page.tsx          # 部署工具列表
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # 部署详情
│   │   │       └── wizard/
│   │   │           ├── page.tsx  # SSG 入口（generateStaticParams）
│   │   │           └── WizardClient.tsx  # 客户端部署向导
│   │   ├── feedback/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── tool/[id]/
│   │       ├── page.tsx          # 工具详情
│   │       └── ToolCardMini.tsx  # 同类推荐迷你卡片
│   ├── components/               # 共享 UI 组件（11 个）
│   │   ├── CompareBar.tsx        # 底部对比浮动栏
│   │   ├── CompareToggle.tsx     # 对比选择按钮
│   │   ├── CopyButton.tsx        # 复制按钮
│   │   ├── FilterPanel.tsx       # 桌面端筛选面板
│   │   ├── Header.tsx            # 顶部导航（含汉堡菜单 + UserMenu）
│   │   ├── RecommendModal.tsx    # 推荐工具弹窗
│   │   ├── SearchBar.tsx         # 搜索栏
│   │   ├── TerminalLog.tsx       # 终端日志组件
│   │   ├── ToolCard.tsx          # 工具卡片
│   │   ├── UpgradePrompt.tsx     # 升级提示弹窗
│   │   └── UserMenu.tsx          # 用户菜单（CF Access 集成）
│   ├── data/
│   │   ├── schema.json           # 工具数据 JSON Schema 定义
│   │   └── tools.json            # 50 个工具的完整数据
│   └── lib/                      # 工具库（6 个模块）
│       ├── auth.ts               # 认证与用户状态管理
│       ├── categories.ts         # 分类定义（8 个分类）
│       ├── compare.ts            # 对比数据构建
│       ├── deploy.ts             # 部署配置（28 个工具）
│       ├── deploy-proxy.ts       # Agent HTTP 客户端（浏览器端）
│       └── tools.ts              # 工具数据查询与筛选
├── .env.example                  # 环境变量模板
├── CLAUDE.md                     # Claude Code 项目指令
├── next.config.mjs               # Next.js 配置（静态导出）
├── package.json                  # 依赖（Next.js 16 + React 18 + Tailwind 3）
├── tailwind.config.js
├── tsconfig.json                 # TypeScript 配置（排除 functions/）
└── wrangler.toml                 # Cloudflare Pages 配置
```

### 关键组件说明

#### 前端组件（11 个）

| 组件 | 类型 | 功能 |
|------|------|------|
| `Header` | Client | 顶部导航栏：Logo + 桌面导航链接 + 移动端汉堡菜单 + UserMenu |
| `ToolCard` | Server | 工具卡片：名称、描述、标签、Star 数、对比按钮、详情链接 |
| `SearchBar` | Client | 搜索输入框，实时过滤 |
| `FilterPanel` | Client | 桌面端侧边筛选面板：分类、难度、适合人群 |
| `CompareBar` | Client | 底部浮动对比栏：已选工具 + 开始对比按钮 |
| `CompareToggle` | Client | 单个工具的对比选择按钮（+ 对比 / ✓ 已选） |
| `TerminalLog` | Client | 终端风格日志输出组件（SSE 实时流） |
| `UserMenu` | Client | 用户头像 + 下拉菜单：CF Access 登录/登出、控制台 |
| `RecommendModal` | Client | 推荐工具弹窗表单 → GitHub Issue |
| `UpgradePrompt` | Client | 升级方案提示弹窗 |
| `CopyButton` | Client | 复制到剪贴板按钮（含已复制反馈） |

#### 前端页面（8 个路由 + 3 个动态路由）

| 路由 | 组件类型 | 关键逻辑 |
|------|----------|----------|
| `/` | `'use client'` | 搜索+筛选+工具列表+MobileFilterBar+邮件订阅+评价 |
| `/tool/[id]` | Server | generateStaticParams(50) + generateMetadata + 同类推荐 |
| `/deploy` | Server | 28 个工具的部署卡片列表 |
| `/deploy/[id]` | Server | generateStaticParams(28) + 部署详情配置展示 |
| `/deploy/[id]/wizard` | 混合 | page.tsx(SSG) + WizardClient.tsx(Client, SSE 流式部署) |
| `/compare` | `'use client'` | Suspense 包裹 + 桌面表格/移动卡片栈 |
| `/dashboard` | `'use client'` | KV 同步 + 服务器卡片 + Agent API 更新/卸载 |
| `/about` | Server | 静态内容 |
| `/feedback` | `'use client'` | 反馈表单 + API 提交 |
| `/pricing` | `'use client'` | 免费计划展示 + 邮件订阅 |

#### Lib 工具库（6 个模块）

| 模块 | 职责 |
|------|------|
| `tools.ts` | 数据查询（getAllTools, getToolById, filterTools）、格式化（Star 数、难度星级） |
| `categories.ts` | 8 个分类定义（id/name/icon/color）、分类查询 |
| `deploy.ts` | 28 个工具的 DeployConfig（端口、内存、环境变量）、部署命令生成 |
| `deploy-proxy.ts` | 浏览器端 Agent HTTP 客户端（checkAgent, executeDeployViaAgent） |
| `auth.ts` | 用户状态管理（CF Access + localStorage）、服务器增删、方案管理 |
| `compare.ts` | 对比数据构建（从 Tool 对象提取对比维度） |

#### Cloudflare Functions（8 个 API）

| 函数 | 输入 | 输出 | 外部调用 |
|------|------|------|----------|
| `deploy/connect` | `{ host, port, token }` | `{ success, hostname }` | Agent `GET /status` |
| `deploy/execute` | `{ toolId, host, token, envValues }` | SSE stream | 拉取 compose → Agent `POST /execute` |
| `deploy/history` | CF Access 头部 | `{ deployments[] }` | KV `deploy:{email}:*` |
| `servers` | `{ id, host, ... }` | `{ servers[] }` | KV `server:{email}:*` |
| `waitlist` | `{ email, source }` | `{ success }` | KV `waitlist:{email}` |
| `auth/upgrade` | CF Access 头部 / `{ email, tier }` | `{ email, tier }` | KV `user:{email}:tier` |
| `feedback` | `{ content, email }` | `{ success }` | KV `feedback:{timestamp}` |
| `deploy/_middleware` | — | `Response` 或 `next()` | 内存 Map（频率限制） |

### 数据流说明

#### 数据层架构

```
┌─────────────────────────────────────────────────────────┐
│                    数据源                                │
│  src/data/tools.json (50 tools)                         │
│  src/data/schema.json (JSON Schema)                     │
│  public/deploy/tools/*/docker-compose.yml (28 configs)  │
└──────────────────┬──────────────────────────────────────┘
                   │ 构建时加载
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Static Export (115 pages)           │
│  - 50 tool detail pages (SSG)                           │
│  - 28 deploy detail pages (SSG)                         │
│  - 28 wizard pages (SSG + Client hydration)             │
│  - 9 static pages                                       │
└──────────────────┬──────────────────────────────────────┘
                   │ Cloudflare Pages CDN
                   ▼
┌─────────────────────────────────────────────────────────┐
│                   用户浏览器                             │
│  - React 客户端渲染 (搜索/筛选/对比/向导)                 │
│  - localStorage (用户状态/对比列表)                       │
│  - fetch → Cloudflare Functions API                     │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────────┐
│            Cloudflare Functions (API 层)                 │
│  - 认证：CF Access 头部                                  │
│  - 频率限制：内存 Map                                    │
│  - 业务逻辑：代理/存储                                    │
└────────┬──────────────────────────┬─────────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐    ┌─────────────────────────┐
│   Cloudflare KV  │    │  用户服务器 (Agent)      │
│  - 用户数据       │    │  - Python3, port 9876   │
│  - 部署历史       │    │  - 命令白名单            │
│  - 反馈/订阅      │    │  - IP 锁定              │
└─────────────────┘    │  - Docker 操作           │
                       └─────────────────────────┘
```

#### 核心数据流：一键部署

```
用户浏览器                     CF Functions               用户服务器 (Agent)
    │                              │                           │
    │ ① 访问 /deploy/[id]/wizard   │                           │
    │──────────────────────────────│                           │
    │ ② 安装 Agent：               │                           │
    │   curl install-agent.sh      │                           │
    │─────────────────────────────────────────────────────────│
    │                              │                           │
    │ ③ 输入 IP + Token            │                           │
    │                              │                           │
    │ ④ 测试连接                   │                           │
    │──→ POST /api/deploy/connect ──│──→ GET /status ─────────→│
    │←── { success, hostname } ────│←── { status: "ok" } ─────│
    │                              │                           │
    │ ⑤ 开始部署                   │                           │
    │──→ POST /api/deploy/execute ──│                           │
    │                              │──→ 拉取 docker-compose.yml│
    │                              │──→ POST /execute (SSE) ──→│
    │                              │←── SSE: docker pull ... ──│
    │←── SSE: docker pull ... ─────│                           │
    │←── SSE: Container started ───│                           │
    │←── SSE: { type: "done" } ────│                           │
    │                              │                           │
    │ ⑥ 保存到 KV                  │                           │
    │                              │──→ KV: deploy:{email}:*   │
```

### API 调用关系图

```
                              ┌──────────────┐
                              │  User Browser │
                              └──────┬───────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐    ┌──────────────────────┐    ┌──────────────────┐
│ /api/waitlist │    │ /api/deploy/connect  │    │ /api/servers     │
│ POST: 邮件订阅 │    │ POST: Agent 连接检测  │    │ GET/POST/DELETE  │
│ → WAITLIST_KV │    │ → Agent GET /status  │    │ → DEPLOY_KV      │
└───────────────┘    └──────────────────────┘    └──────────────────┘
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐    ┌──────────────────────┐    ┌──────────────────┐
│ /api/feedback │    │ /api/deploy/execute  │    │ /api/auth/upgrade│
│ POST: 反馈收集 │    │ POST: SSE 流式部署     │    │ GET: 用户认证信息 │
│ → DEPLOY_KV   │    │ → 拉取 compose 文件    │    │ POST: 方案升级    │
└───────────────┘    │ → Agent POST /execute │    │ → DEPLOY_KV      │
                     │ → DEPLOY_KV           │    └──────────────────┘
                     └──────────────────────┘
        │
        ▼
┌──────────────────┐
│ /api/deploy/     │
│ history          │
│ GET: 部署历史查询  │
│ → DEPLOY_KV      │
└──────────────────┘

所有 /api/deploy/* 经过 _middleware.ts 频率限制（10 req/min/IP）
所有 /api/auth/* 需要 CF Access 认证头部
```

---

## 3. 未完成任务清单（TODO）

### P0 — 必须完成（阻塞上线）

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 1 | 配置 Cloudflare Access Zero Trust | ⬜ 待完成 | 在 CF 控制台创建 Access 应用，配置身份提供商（Google/GitHub） |
| 2 | 配置 KV Namespace 真实 ID | ⬜ 待完成 | `wrangler.toml` 中 DEPLOY_KV 和 WAITLIST_KV 的 placeholder 需替换为真实 ID |
| 3 | 部署到 Cloudflare Pages | ⬜ 待完成 | `wrangler pages deploy` 或 GitHub Actions 自动部署 |
| 4 | 线上验证 9 个关键页面 200 OK | ⬜ 待完成 | 首页、工具详情、部署列表、部署向导、对比、控制台、定价、反馈、关于 |

### P1 — 重要（影响核心体验）

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 5 | Agent 安装流程测试 | ⬜ 待完成 | 在真实 VPS 上测试 install-agent.sh + 一键部署全流程 |
| 6 | 28 个 docker-compose.yml 部署测试 | ⬜ 待完成 | 逐个验证容器启动、健康检查、数据持久化 |
| 7 | 注册 Affiliate 账号并替换链接 | ⬜ 待完成 | 阿里云/腾讯云/Vultr Affiliate，替换服务器推荐页占位链接 |
| 8 | 运行 AI 描述生成脚本 | ⬜ 待完成 | `ANTHROPIC_API_KEY=xxx node scripts/generate-descriptions.mjs --with-steps --force` |
| 9 | 错误监控与日志 | ⬜ 待完成 | Cloudflare Workers 日志、Agent 错误处理完善 |

### P2 — 后续优化（增强竞争力）

| # | 任务 | 状态 | 说明 |
|---|------|------|------|
| 10 | 工具库扩充到 100 个 | ⬜ 待完成 | 新增 50 个工具，覆盖更多分类 |
| 11 | 部署配置扩充到 50 个 | ⬜ 待完成 | 更多工具支持一键部署 |
| 12 | 支付网关接入 | ⬜ 待完成 | Stripe/LemonSqueezy，Pro/Team 方案付费 |
| 13 | 自动备份功能 | ⬜ 待完成 | Agent 增加备份/恢复端点 |
| 14 | 监控告警功能 | ⬜ 待完成 | Agent 增加健康检查 + 告警通知 |
| 15 | 版本更新提醒 | ⬜ 待完成 | 检测 docker image 新版本并通知用户 |
| 16 | 自定义域名 | ⬜ 待完成 | 注册并配置自定义域名（如 awe.tools） |
| 17 | 截图/视频教程 | ⬜ 待完成 | 每个工具的部署流程截图或录屏 |
| 18 | 多语言支持 | ⬜ 待完成 | 英文版本（面向国际用户） |
| 19 | 用户系统完善 | ⬜ 待完成 | 注册/登录、密码重置、OAuth |
| 20 | 社区功能 | ⬜ 待完成 | 工具评论、评分、使用笔记分享 |
| 21 | 自定义 compose 配置 | ⬜ 待完成 | 用户在部署向导中自定义 docker-compose 内容 |

---

## 4. 下一次开发建议

### 推荐开发顺序

```
Phase 1: 上线准备（1-2 天）
├── 1. 配置 Cloudflare Access（Zero Trust 控制台）
├── 2. 创建 KV Namespace 并更新 wrangler.toml
├── 3. 首次部署到 Cloudflare Pages
├── 4. 9 个关键页面加载验证
└── 5. 修复上线发现的问题

Phase 2: 端到端验证（2-3 天）
├── 6. VPS 上完整测试 Agent 安装 + 一键部署流程
├── 7. 至少验证 5 个热门工具的部署（immich, n8n, vaultwarden, uptime-kuma, stirling-pdf）
└── 8. 修复测试中发现的 Agent/docker-compose 问题

Phase 3: 变现基础（1 天）
├── 9. 注册 Affiliate 账号并替换链接
└── 10. 运行 AI 描述生成脚本提升内容质量

Phase 4: 公开推广
├── 11. V2EX 发布帖
├── 12. 小红书推广
└── 13. 收集用户反馈迭代
```

### 为什么这个顺序

1. **先上线再完善**：当前 115 页构建通过、API 齐全、移动端适配完成，已经是一个可用的产品。先让用户用起来，收集真实反馈再迭代，而不是在真空里完善。

2. **先验证再推广**：部署是核心功能，如果在用户真实环境中跑不通，推广会适得其反。必须在 VPS 上完整测试至少 5 个热门工具。

3. **变现不急**：项目当前完全免费，Affiliate 是成本最低的变现方式（用户自愿点链接）。支付功能涉及合规、税务等复杂问题，等有用户基础再考虑。

4. **内容质量是护城河**：AI 描述脚本可以大幅提升内容的一致性和质量，这是区别于同类项目（如 awesome-selfhosted）的核心优势。

---

## 5. 当前部署状态

### Build 状态

| 项目 | 状态 | 详情 |
|------|------|------|
| TypeScript 编译 | ✅ 通过 | 零错误、零警告 |
| Next.js Build | ✅ 通过 | 115 页，~3 秒（Turbopack） |
| 静态导出 | ✅ 通过 | `out/` 目录生成 |
| 构建命令 | `npm run build` | next build |

### Pages 部署状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 部署平台 | ⬜ 待首次部署 | Cloudflare Pages（`wrangler pages deploy`） |
| 线上地址 | ⬜ 待验证 | https://awesome-toolkit.pages.dev |
| GitHub Actions 自动部署 | ✅ 已配置 | `.github/workflows/deploy-cloudflare.yml` |

### Cloudflare 配置状态

| 配置项 | 状态 | 说明 |
|--------|------|------|
| wrangler.toml | ✅ 完成 | Pages 项目名 `awesome-toolkit`，构建目录 `out` |
| KV DEPLOY_KV | ⚠️ 占位 | ID 为 `DEPLOY_KV_PLACEHOLDER`，需替换为真实 ID |
| KV WAITLIST_KV | ⚠️ 占位 | ID 为 `WAITLIST_KV_PLACEHOLDER`，需替换为真实 ID |
| 环境变量 BASE_URL | ✅ 完成 | `https://awesome-toolkit.pages.dev` |

### Access 配置状态

| 配置项 | 状态 | 说明 |
|--------|------|------|
| Zero Trust 应用 | ⬜ 待创建 | 需在 Cloudflare 控制台配置 |
| 身份提供商 | ⬜ 待配置 | Google / GitHub OAuth |
| 前端集成 | ✅ 完成 | UserMenu 组件 + auth.ts CF Access 头部检测 |
| API 集成 | ✅ 完成 | 所有 Functions 读取 `Cf-Access-Authenticated-User-Email` |
| 文档 | ✅ 完成 | `docs/CLOUDFLARE-ACCESS-SETUP.md` |

### KV 配置状态

| Namespace | 状态 | Key 模式 | 数据 |
|-----------|------|----------|------|
| DEPLOY_KV | ⚠️ 待创建 | `deploy:*, user:*, server:*, feedback:*` | 空（待部署） |
| WAITLIST_KV | ⚠️ 待创建 | `waitlist:*` | 空（待部署） |

---

## 6. 风险与问题

### 已知 Bug

| # | 问题 | 影响范围 | 严重程度 |
|---|------|----------|----------|
| 1 | 部署向导 Agent 连接轮询在某些网络环境下可能超时（30 次 × 2s = 60s） | 部署向导 Step 0 | 低 |
| 2 | 浏览器端直接调用 Agent `/uninstall` 可能因 CORS 失败（Agent 未设置 CORS 头） | 控制台卸载功能 | 中 |
| 3 | `new-tools.json` 中的新增工具尚未合并到 `tools.json` | 工具库扩展 | 低 |

### 潜在技术债务

| # | 问题 | 建议 |
|---|------|------|
| 1 | `wrangler.toml` 中 KV ID 为占位符 | 首次部署前必须替换 |
| 2 | Functions 中 TypeScript 类型手动定义（`interface Env { ... }`），未使用 Cloudflare 官方类型 | 引入 `@cloudflare/workers-types` |
| 3 | `deploy-proxy.ts` 浏览器端 Agent 调用与 Functions API 功能重叠 | 统一浏览器端都通过 Functions 代理 |
| 4 | 工具数据在 `tools.json` 中硬编码，无后台管理界面 | 考虑增加简单的管理后台 |
| 5 | 错误处理依赖 `try/catch` + `alert()`，无统一错误提示组件 | 创建 Toast 组件统一错误展示 |
| 6 | mobile FilterBar 组件内联在 page.tsx 中（代码重复） | 提取为独立组件 |
| 7 | `functions/` 被 `tsconfig.json` 排除，无法享受 IDE 类型检查 | 评估引入独立 `functions/tsconfig.json` |

### 性能风险

| # | 风险 | 影响 | 缓解措施 |
|---|------|------|----------|
| 1 | `tools.json` 随工具数增长而增大（当前 ~50KB） | 首次加载变慢 | 考虑按分类拆分或使用 CDN 缓存 |
| 2 | SSE 流式部署走 Cloudflare Functions → Agent，增加一跳延迟 | 部署日志稍有延迟 | 当前影响可接受 |
| 3 | KV 读取延迟（list + 多个 get） | 部署历史/服务器列表加载 | 当前数据量小，可接受 |

### 安全风险

| # | 风险 | 影响 | 缓解措施 |
|---|------|------|----------|
| 1 | Agent 暴露在公网（端口 9876） | 被扫描/攻击 | Token 认证 + IP 锁定 + 命令白名单（已实施） |
| 2 | Agent HTTP（非 HTTPS）通信 | 中间人攻击 | 建议用户使用 VPN/内网，或配置反向代理 + SSL |
| 3 | Functions API 频率限制为内存 Map | CF 冷启动后计数器归零 | 当前可接受，用户量大后迁移到 KV 计数 |
| 4 | 用户 Token 通过 prompt() 输入 | Token 可能被用户意外泄露 | 可考虑增加 Token 过期/刷新机制 |

---

## 7. AI 交接信息

### 给下一次 Claude Code 的提示词

```
你正在继续开发 Awesome Toolkit（awesome-toolkit.pages.dev），一个面向非技术人员的
开源工具推荐与一键部署平台。

## 技术栈
- Next.js 16.2.6 (App Router, output: 'export' 静态导出)
- React 18.3 + Tailwind CSS 3.4
- Cloudflare Pages + Functions + KV
- Python 3 Agent (用户服务器上运行，端口 9876)

## 项目结构速览
- src/app/ — 8 个路由的页面（含 3 个动态路由 SSG）
- src/components/ — 11 个 UI 组件
- src/lib/ — 6 个工具模块（tools, deploy, auth, categories, compare, deploy-proxy）
- src/data/tools.json — 50 个工具的完整数据
- functions/api/ — 8 个 Cloudflare Functions API 端点
- public/deploy/tools/*/docker-compose.yml — 28 个工具的部署配置
- public/agent/ — Python Agent 脚本 + 安装器
- docs/ — 7 个文档文件

## 关键约定
1. 所有用户文字用中文，代码/文件名用英文
2. 不能引入数据库依赖——数据在 tools.json（构建时）或 KV（运行时）
3. 所有 API 必须在 functions/ 目录中，不创建 src/app/api/
4. 页面是静态导出（output: 'export'），动态页面用 generateStaticParams
5. 'use client' 页面不能有 generateStaticParams——拆分为 page.tsx (Server) + Client 组件
6. 部署架构：Cloudflare Functions 代理 → 用户服务器上的 Python Agent → Docker

## 构建验证
- `npm run build` 必须零错误，当前输出 115 页
- `tsconfig.json` 排除了 `functions/`（CF Functions 有自己的类型系统）

## 当前开发阶段
Phase 3（规模化），50 工具已录入，部署功能已实现，准备首次上线。

## 最重要的待完成事项（详见 docs/PROJECT_STATUS.md）
P0: 配置 CF Access、创建 KV Namespace、首次部署、线上验证
P1: Agent 流程测试、docker-compose 验证、Affiliate 注册
P2: 工具库扩充、支付接入、监控告警

## 阅读顺序建议
1. CLAUDE.md — 项目目标与写作规范
2. docs/PROJECT_STATUS.md — 本文档（完整状态）
3. src/data/tools.json — 了解数据结构
4. src/lib/tools.ts — 理解数据访问模式
5. src/app/page.tsx — 首页逻辑
6. public/agent/agent.py — Agent 安全模型
7. functions/api/deploy/execute.ts — 核心部署流程
```

---

## 附录

### 工具分类（8 类）

| 分类 | 图标 | 颜色 | 工具数 |
|------|------|------|--------|
| AI & 自动化 | 🤖 | #7c3aed | ~6 |
| 开发效率工具 | 🛠️ | #2563eb | ~6 |
| 数据处理 & 可视化 | 📊 | #0891b2 | ~6 |
| 安全 & 隐私 | 🔒 | #059669 | ~6 |
| 网络 & 爬虫 | 🌐 | #ea580c | ~6 |
| 创意 & 媒体处理 | 🎨 | #db2777 | ~6 |
| 文件 & 知识管理 | 📁 | #ca8a04 | ~7 |
| 自部署 & 家庭服务器 | 🏠 | #4f46e5 | ~7 |

### 已配置一键部署的工具（28 个）

actual, adguard-home, apache-superset, audiobookshelf, beszel, changedetection-io, dify, duplicati, gitea, grafana, home-assistant, homebridge, immich, jellyfin, langflow, metabase, n8n, navidrome, netdata, nextcloud, nginx-proxy-manager, node-red, open-webui, paperless-ngx, portainer, stirling-pdf, uptime-kuma, vaultwarden

### 关键文件路径索引

| 用途 | 路径 |
|------|------|
| 项目指令 | `CLAUDE.md` |
| 工具数据 | `src/data/tools.json` |
| JSON 结构定义 | `src/data/schema.json` |
| Agent 源码 | `public/agent/agent.py` |
| Agent 安装脚本 | `public/agent/install-agent.sh` |
| 部署配置 | `src/lib/deploy.ts` |
| Docker Compose 模板 | `public/deploy/tools/{tool}/docker-compose.yml` |
| CF Pages 配置 | `wrangler.toml` |
| API 频率限制 | `functions/api/deploy/_middleware.ts` |
| CF Access 设置指南 | `docs/CLOUDFLARE-ACCESS-SETUP.md` |
| CF 部署指南 | `docs/CLOUDFLARE-DEPLOY.md` |
| 上线检查清单 | `docs/LAUNCH-CHECKLIST.md` |
| 推广文案 | `docs/LAUNCH-COPY.md` |
| SaaS 路线图 | `docs/SAAS-ROADMAP.md` |
| 测试清单 | `docs/TESTING-CHECKLIST.md` |
| 部署与 Affiliate 指引 | `docs/DEPLOY-AND-AFFILIATE.md` |
| GitHub Actions 部署 | `.github/workflows/deploy-cloudflare.yml` |
| GitHub Actions Star 更新 | `.github/workflows/update-stars.yml` |
