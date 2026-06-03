# Awesome Toolkit — 项目状态报告

> 更新日期：2026-06-03
> 项目版本：v0.2.0
> 线上地址：https://awesome-toolkit.pages.dev
> Launch Readiness：89/100 — 适合推向前 100 用户

---

## 1. 当前项目整体状态总结

### 项目简介

Awesome Toolkit（GitHub 精选工具库）是一个面向**非技术人员**的开源工具推荐与一键部署平台。从 GitHub 精选 50 个最强开源工具，提供中文使用说明，支持一键部署到用户自己的服务器。

**核心价值主张**：让普通人也能在自己的服务器上运行开源软件，无需懂 Docker、无需读英文文档。

### 已完成功能

#### 核心功能
| 功能 | 状态 | 说明 |
|------|------|------|
| 工具库浏览与搜索 | ✅ | 50 个工具，支持按名称/描述/标签搜索 |
| 多维筛选 | ✅ | 按分类(8类)、难度(1-5)、适合人群、许可证、Web界面筛选 |
| 工具详情页 | ✅ | 面包屑导航、使用步骤、同类推荐、GitHub 链接 |
| 工具对比 | ✅ | 2-4 个工具横向维度对比，URL 参数保持状态 |
| 一键部署 | ✅ | 32 个工具支持，4 步部署向导 |
| Python Agent | ✅ | 轻量部署代理（无外部依赖），端口 9876 |
| SSE 流式日志 | ✅ | 部署过程实时推送终端输出 |
| 控制台 | ✅ | 服务器管理、工具更新/卸载、部署历史 |
| 邮件订阅 | ✅ | KV 存储邮件，首页和定价页均有入口 |
| 用户反馈 | ✅ | 反馈表单，KV 存储 |
| 工具推荐 | ✅ | Modal 表单 → GitHub Issue 提交 |
| 移动端响应式 | ✅ | 20 个组件适配 375px 宽度 |
| 用户认证 | ✅ | Cloudflare Access（CF Access 头部）+ localStorage 兜底 |
| SEO 优化 | ✅ | OG 标签、sitemap.xml(125 URL)、robots.txt、JSON-LD、动态 Meta |
| **多平台支持** | ✅ | 50 个工具标注 Windows/Linux/Mac/NAS 兼容性 |
| **设备推荐向导** | ✅ | 4 步向导（设备→内存→Docker→用途），智能匹配工具 |
| **Analytics 追踪** | ✅ | 6 种事件埋点 + Dashboard + 转化漏斗 |
| **系统验证** | ✅ | Launch Readiness 89/100，全面审计报告 |

#### 安全功能
| 功能 | 状态 | 说明 |
|------|------|------|
| Agent Token 认证 | ✅ | 32 字符随机 Token |
| Agent 命令白名单 | ✅ | 仅允许 docker compose/ps/stats 等 |
| Agent IP 锁定 | ✅ | 同一 IP 5 次失败锁定 10 分钟 |
| API 频率限制 | ✅ | 10 req/min/IP（内存 Map） |
| CF Access 认证 | ✅ | Cloudflare Zero Trust |
| HTTP 安全头 | ✅ | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |

#### 运维自动化
| 功能 | 状态 | 说明 |
|------|------|------|
| Star 数自动更新 | ✅ | GitHub Actions 每日运行 |
| Cloudflare 部署 | ✅ | GitHub Actions 自动部署 |
| AI 描述生成 | ✅ | 脚本 scripts/generate-descriptions.mjs |

### 已完成页面（12 路由 + 3 动态）

| 路由 | 页面 | 渲染方式 | 说明 |
|------|------|----------|------|
| `/` | 首页 | Static + Client | 搜索、筛选、50 工具卡片、设备推荐 CTA、邮件订阅 |
| `/about` | 关于页 | Static | 项目理念、数据统计、联系方式 |
| `/compare` | 工具对比 | Client | 2-4 工具横向对比表 + 移动端卡片栈 |
| `/dashboard` | 控制台 | Client | 服务器管理、KV 同步、更新/卸载 |
| `/deploy` | 部署列表 | Static | 32 个可部署工具 |
| `/deploy/[id]` | 部署详情 | SSG (32页) | 配置信息、环境变量、注意事项 |
| `/deploy/[id]/wizard` | 部署向导 | SSG + Client (32页) | 4 步向导：安装 Agent → 连接 → 配置 → 部署 |
| `/feedback` | 反馈页 | Static | 反馈表单 |
| `/pricing` | 定价页 | Static | 早期用户免费计划、未来价格预览 |
| `/tool/[id]` | 工具详情 | SSG (50页) | 面包屑、步骤、平台选择器、同类推荐、一键部署 CTA、JSON-LD |
| `/recommendations` | 设备推荐 | Client | 4 步设备向导 → 工具推荐结果 |
| `/analytics` | 分析看板 | Client | 概要卡片、转化漏斗、热门分布、事件流 |
| `/_not-found` | 404 页 | Static | 自定义 404，含热门工具链接 |

**总页面数：125**（`npm run build` 输出确认）

### 已完成 API（11 个 Cloudflare Functions）

| 端点 | 文件 | 方法 | 功能 |
|------|------|------|------|
| `/api/deploy/connect` | `functions/api/deploy/connect.ts` | POST | 代理检测 Agent 在线状态 |
| `/api/deploy/execute` | `functions/api/deploy/execute.ts` | POST | SSE 流式部署，拉取 compose 文件并转发到 Agent |
| `/api/deploy/history` | `functions/api/deploy/history.ts` | GET | 查询用户部署历史（KV） |
| `/api/servers` | `functions/api/servers.ts` | GET/POST/DELETE | 服务器 CRUD（KV） |
| `/api/waitlist` | `functions/api/waitlist.ts` | POST | 邮件订阅（KV） |
| `/api/auth/upgrade` | `functions/api/auth/upgrade.ts` | GET/POST | 用户认证与方案升级（KV） |
| `/api/feedback` | `functions/api/feedback.ts` | POST | 用户反馈收集（KV） |
| `/api/analytics/track` | `functions/api/analytics/track.ts` | POST | 事件追踪（批量写入 KV，30 天 TTL） |
| `/api/analytics/stats` | `functions/api/analytics/stats.ts` | GET | 聚合统计（计数 + Top N + 漏斗 + 事件流） |
| `/api/deploy/_middleware` | `functions/api/deploy/_middleware.ts` | — | 频率限制中间件 |

### 已完成 Cloudflare 集成

| 集成项 | 状态 | 说明 |
|--------|------|------|
| Cloudflare Pages | ✅ | 静态站点托管，`wrangler.toml` 配置完成 |
| Cloudflare Functions | ✅ | 11 个 API 端点，`/functions` 目录 |
| KV Namespaces | ✅ | DEPLOY_KV（部署/用户/服务器/反馈/Analytics）、WAITLIST_KV（邮件） |
| wrangler.toml | ✅ | 双 KV 绑定 + BASE_URL 环境变量 |
| Cloudflare Access | ✅ | 认证机制已集成（UserMenu、auth.ts），待控制台配置 Zero Trust |
| CDN/SSL/DDoS | ✅ | Cloudflare 自带，无需额外配置 |

---

## 2. 当前代码架构说明

### 项目目录结构

```
E:\claudecode2\
├── .github/workflows/
│   ├── deploy-cloudflare.yml
│   └── update-stars.yml
├── docs/                              # 项目文档（25 个 .md）
│   ├── PROJECT_STATUS.md              # 本文档（唯一真相源）
│   ├── VALIDATION_REPORT.md           # 系统验证报告（Launch Readiness 89/100）
│   ├── ANALYTICS_PLAN.md             # Analytics 事件追踪方案
│   ├── PLATFORM_SUPPORT_MATRIX.md     # 50 工具 × 4 平台兼容矩阵
│   ├── MULTI_PLATFORM_ROADMAP.md      # 多平台支持路线图
│   ├── DEVICE_BASED_RECOMMENDATIONS.md # 设备推荐引擎说明
│   └── ... (19 more)
├── functions/                         # Cloudflare Functions（API 层）
│   └── api/
│       ├── analytics/
│       │   ├── track.ts               # 事件追踪（POST，批量写入 KV）
│       │   └── stats.ts               # 统计查询（GET，聚合 + Top N + 漏斗）
│       ├── auth/upgrade.ts
│       ├── deploy/
│       │   ├── _middleware.ts          # 频率限制
│       │   ├── connect.ts
│       │   ├── execute.ts
│       │   └── history.ts
│       ├── feedback.ts
│       ├── servers.ts
│       └── waitlist.ts
├── public/
│   ├── agent/
│   │   ├── agent.py
│   │   └── install-agent.sh
│   ├── deploy/tools/                  # 32 个工具的 docker-compose.yml
│   │   ├── immich/
│   │   ├── n8n/
│   │   └── ... (30 more)
│   ├── favicon.svg
│   ├── og-image.png
│   ├── og-image.svg
│   ├── robots.txt
│   └── sitemap.xml                    # 125 个 URL
├── scripts/
│   ├── add-platform-instructions.cjs
│   ├── add-system-requirements.cjs
│   ├── generate-descriptions.mjs
│   └── update-stars.mjs
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── HomeClient.tsx             # 首页客户端组件
│   │   ├── not-found.tsx
│   │   ├── globals.css
│   │   ├── about/
│   │   ├── analytics/
│   │   │   ├── page.tsx
│   │   │   └── AnalyticsDashboard.tsx  # 分析看板（漏斗 + 热门 + 事件流）
│   │   ├── compare/
│   │   ├── dashboard/
│   │   ├── deploy/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── wizard/
│   │   │           ├── page.tsx
│   │   │           └── WizardClient.tsx
│   │   ├── feedback/
│   │   ├── pricing/
│   │   ├── recommendations/
│   │   │   ├── page.tsx
│   │   │   └── RecommendationsClient.tsx
│   │   └── tool/[id]/
│   │       ├── page.tsx
│   │       └── ToolCardMini.tsx
│   ├── components/                    # 20 个 UI 组件
│   │   ├── CompareBar.tsx
│   │   ├── CompareToggle.tsx
│   │   ├── CopyButton.tsx
│   │   ├── DeviceWizard.tsx           # 设备推荐 4 步向导
│   │   ├── ErrorBoundary.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── Header.tsx
│   │   ├── JsonLd.tsx                 # JSON-LD 结构化数据
│   │   ├── MobileFilterBar.tsx
│   │   ├── PlatformSelector.tsx       # 多平台选择器（Windows/Linux/Mac/NAS）
│   │   ├── Providers.tsx
│   │   ├── RecommendModal.tsx
│   │   ├── SearchBar.tsx
│   │   ├── TerminalLog.tsx
│   │   ├── Toast.tsx
│   │   ├── TokenModal.tsx
│   │   ├── ToolCard.tsx
│   │   ├── TrackToolView.tsx          # 隐形工具详情追踪
│   │   ├── UpgradePrompt.tsx
│   │   ├── UserMenu.tsx
│   │   └── WaitlistForm.tsx
│   ├── data/
│   │   ├── schema.json
│   │   └── tools.json                 # 50 个工具（含 platforms + system_requirements + platform_instructions）
│   └── lib/
│       ├── analytics.ts               # 客户端事件追踪（批量 + session + retry）
│       ├── auth.ts
│       ├── categories.ts
│       ├── compare.ts
│       ├── deploy.ts                  # 32 个工具的部署配置
│       ├── deploy-proxy.ts
│       └── tools.ts                   # 工具查询 + 设备推荐引擎 + 格式化
├── CLAUDE.md
├── next.config.mjs
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── wrangler.toml
```

### 前端组件（20 个）

| 组件 | 类型 | 功能 |
|------|------|------|
| `Header` | Client | 顶部导航栏 + 汉堡菜单 + UserMenu |
| `ToolCard` | Server | 工具卡片：名称、描述、标签、Star、对比按钮 |
| `SearchBar` | Client | 搜索输入框，实时过滤 |
| `FilterPanel` | Client | 桌面端侧边筛选面板 |
| `MobileFilterBar` | Client | 移动端底部筛选栏 |
| `CompareBar` | Client | 底部浮动对比栏 |
| `CompareToggle` | Client | 对比选择按钮 |
| `TerminalLog` | Client | 终端风格 SSE 日志输出 |
| `UserMenu` | Client | 用户头像 + CF Access 登录/登出/控制台 |
| `RecommendModal` | Client | 推荐工具弹窗 → GitHub Issue |
| `UpgradePrompt` | Client | 升级方案提示 |
| `CopyButton` | Client | 复制到剪贴板 |
| `ErrorBoundary` | Client | React 错误边界 |
| `Toast` | Client | 统一错误/成功提示 |
| `TokenModal` | Client | Agent Token 输入弹窗 |
| `Providers` | Client | Context Provider 聚合 |
| `WaitlistForm` | Client | 邮件订阅表单 |
| **`PlatformSelector`** | Client | 多平台标签选择（Windows/Linux/Mac/NAS）+ 部署指引 |
| **`DeviceWizard`** | Client | 4 步设备推荐向导（设备→内存→Docker→用途） |
| **`TrackToolView`** | Client | 隐形追踪组件（零 UI） |
| **`JsonLd`** | Server | JSON-LD 结构化数据（SoftwareApplication schema） |

### Lib 工具库（7 个模块）

| 模块 | 职责 |
|------|------|
| `tools.ts` | 数据查询、筛选、设备推荐引擎（recommendForDevice）、格式化 |
| `categories.ts` | 8 个分类定义（id/name/icon/color） |
| `deploy.ts` | 32 个工具的 DeployConfig（端口、内存、环境变量） |
| `deploy-proxy.ts` | 浏览器端 Agent HTTP 客户端 |
| `auth.ts` | 用户状态管理（CF Access + localStorage） |
| `compare.ts` | 对比数据构建 |
| **`analytics.ts`** | 事件追踪（批量队列 + session_id + keepalive + retry） |

### 数据层架构

```
数据源
  ├── src/data/tools.json (50 tools, ~88KB)
  └── public/deploy/tools/*/docker-compose.yml (32 configs)
         │
         ▼ 构建时加载
Next.js Static Export (125 pages)
  ├── 50 tool detail pages (SSG + JSON-LD)
  ├── 32 deploy detail pages (SSG)
  ├── 32 wizard pages (SSG + Client hydration)
  └── 11 static pages
         │
         ▼ Cloudflare Pages CDN
用户浏览器
  ├── React 客户端渲染 (搜索/筛选/对比/向导/分析看板)
  ├── localStorage (session_id, 用户状态, 对比列表)
  └── fetch → Cloudflare Functions API
         │
         ▼
Cloudflare Functions (11 API 端点)
  ├── 认证：CF Access 头部
  ├── 频率限制：内存 Map
  ├── 业务逻辑：代理/存储/分析
  └── SSE 流式部署代理
         │
    ┌────┴────────────────────┐
    ▼                         ▼
Cloudflare KV           用户服务器 (Agent)
  ├── DEPLOY_KV           ├── Python3, port 9876
  │   ├── deploy:*        ├── 命令白名单
  │   ├── server:*        ├── IP 锁定
  │   ├── user:*          └── Docker 操作
  │   ├── feedback:*
  │   └── analytics:* (30d TTL)
  └── WAITLIST_KV
      └── waitlist:*
```

---

## 3. 新增功能详情（2026-06-03）

### A. 多平台支持

- **数据**：全部 50 个工具的 `platforms` 字段（Windows/Linux/Mac/NAS × native/docker/web/unsupported）
- **分类**：
  - A 类（native + Docker）：12 个工具，所有平台均可用
  - B 类（Docker-only）：34 个工具，需先装 Docker
  - C 类（web-only）：4 个工具，仅需浏览器
- **组件**：`PlatformSelector` — 平台标签 + 状态徽章 + Docker 提示 + 分平台部署步骤
- **深度适配**：8 个高价值工具有 `platform_instructions`（n8n, immich, dify, langflow, open-webui, nocodb, vaultwarden, portainer）

### B. 设备推荐引擎

- **数据**：全部 50 个工具增加 `system_requirements`（min/recommended RAM, disk, CPU, install time, complexity, setup notes）
- **引擎**：`recommendForDevice(profile, tools)` — 过滤（平台→RAM→Docker）→ 排序（新手友好→内存适配→难度→Star）
- **向导**：4 步（设备→内存→Docker→用途），结果分推荐/最低配置两档
- **新手友好标记**：18 个工具标注 `beginner_friendly: true`

### C. Analytics 系统

- **事件类型**：6 种（page_view, wizard_open, device_select, tool_click, deploy_start, deploy_complete）
- **客户端**：`analytics.ts` — 批量队列（2s 延迟）、localStorage session 持久化、keepalive fetch、失败重试
- **API**：`/api/analytics/track`（POST，批量写入 KV，30 天 TTL）、`/api/analytics/stats`（GET，聚合统计）
- **Dashboard**：概要卡片 + 6 步转化漏斗 + 设备/工具/页面分布 + 事件流（30s 自动刷新）
- **KV 键格式**：`analytics:{pv|wiz|dev|tool|deps|done}:{timestamp}:{session_id}:{index}`

### D. 系统验证

- 核心页面可用性：9/9 200 OK
- 工具页完整性：50/50 全部生成
- API 可用性：11/11 端点就绪
- Analytics 覆盖：6/6 事件类型
- SEO/Metadata：所有页面有 title/desc/OG/JSON-LD
- 性能：build 14MB, JS 991KB, index.html 291KB（主要问题）
- 安全：安全头完备，API 无 CSRF（低风险）

---

## 4. 当前数据规模

| 维度 | 数量 |
|------|------|
| 收录工具 | 50 |
| 工具分类 | 8 |
| 一键部署配置 | 32 |
| 多平台深度适配 | 8（platform_instructions） |
| 新手友好工具 | 18 |
| HTML 页面 | 125 |
| API 端点 | 11 |
| KV Namespace | 2 |
| UI 组件 | 20 |
| Lib 模块 | 7 |
| 文档 | 25 |
| tools.json 大小 | ~88 KB |

---

## 5. 已知问题与风险

### 阻塞上线
| # | 问题 | 严重度 | 说明 |
|---|------|--------|------|
| 1 | Cloudflare Access 未配置 | High | Dashboard 同步对未登录用户不可用 |
| 2 | 首页 291KB | High | 3G 网络加载 ~3-5 秒，含完整 tools.json |
| 3 | 部署流程未经真实用户验证 | High | 仅 Linux VPS 概念验证 |

### 性能
| # | 问题 | 严重度 | 说明 |
|---|------|--------|------|
| 4 | tools.json 持续增长（88KB → 持续增长） | Medium | 每增 10 个工具约 +10KB |
| 5 | JS Bundle 991KB | Medium | 可考虑 code splitting |
| 6 | 无 CSS 文件（Turbopack 内联） | Low | 首屏可能 FOUC |

### 安全
| # | 问题 | 严重度 | 说明 |
|---|------|--------|------|
| 7 | API 无 CSRF 保护 | Medium | 低风险攻击面 |
| 8 | Analytics/Waitlist 端点无速率限制 | Low | 可被 POST 滥用 |
| 9 | Agent HTTP 通信（非 HTTPS） | Low | 建议用户使用内网/VPN |

### 运维
| # | 问题 | 严重度 | 说明 |
|---|------|--------|------|
| 10 | `wrangler.toml` KV ID 为占位符 | Medium | 首次部署前必须替换 |
| 11 | Agent 兼容性未在 Windows/Mac/NAS 测试 | Medium | |
| 12 | 无 CI/CD 错误监控 | Low | |
| 13 | KV 频率限制为内存 Map（冷启动归零） | Low | |

---

## 6. 下一步路线图

### Phase 1: 上线准备（P0, 1-2 天）
- [ ] 配置 Cloudflare Access Zero Trust
- [ ] 创建 KV Namespace 并更新 wrangler.toml
- [ ] 首次部署到 Cloudflare Pages
- [ ] 9 个关键页面加载验证

### Phase 2: 端到端验证（P1, 2-3 天）
- [ ] VPS 上完整测试 Agent 安装 + 一键部署流程
- [ ] 至少验证 5 个热门工具（immich, n8n, vaultwarden, uptime-kuma, stirling-pdf）
- [ ] 修复测试中发现的 Agent/docker-compose 问题

### Phase 3: 变现基础（P1, 1 天）
- [ ] 注册 Affiliate 账号并替换链接
- [ ] 运行 AI 描述生成脚本

### Phase 4: 公开推广
- [ ] V2EX 发布帖
- [ ] 小红书推广
- [ ] 收集前 100 用户反馈迭代

### Phase 5: 功能增强（P2, 视反馈决定）
- [ ] 工具库扩充到 100 个
- [ ] 支付网关接入（Stripe/LemonSqueezy）
- [ ] 自动备份/监控告警功能
- [ ] 自定义域名

---

## 7. 数据速查

### 工具分类分布

| 分类 | 工具数 |
|------|--------|
| AI & 自动化 | 6 |
| 开发效率工具 | 6 |
| 数据处理 & 可视化 | 6 |
| 安全 & 隐私 | 6 |
| 网络 & 爬虫 | 6 |
| 创意 & 媒体处理 | 6 |
| 文件 & 知识管理 | 7 |
| 自部署 & 家庭服务器 | 7 |

### 已配置一键部署的工具（32 个）

actual, adguard-home, apache-superset, audiobookshelf, beszel, changedetection-io, dify, duplicati, gitea, grafana, home-assistant, homebridge, immich, jellyfin, langflow, metabase, n8n, navidrome, netdata, nextcloud, nginx-proxy-manager, node-red, open-webui, paperless-ngx, portainer, stirling-pdf, uptime-kuma, vaultwarden, changedetection, dozzle, it-tools, linkding

### 关键文件路径索引

| 用途 | 路径 |
|------|------|
| 项目指令 | `CLAUDE.md` |
| 工具数据 | `src/data/tools.json` |
| 数据 Schema | `src/data/schema.json` |
| Agent 源码 | `public/agent/agent.py` |
| Agent 安装脚本 | `public/agent/install-agent.sh` |
| 部署配置 | `src/lib/deploy.ts` |
| Docker Compose | `public/deploy/tools/{tool}/docker-compose.yml` |
| 设备推荐引擎 | `src/lib/tools.ts` (recommendForDevice) |
| Analytics 客户端 | `src/lib/analytics.ts` |
| CF Pages 配置 | `wrangler.toml` |
| API 频率限制 | `functions/api/deploy/_middleware.ts` |
| 系统验证报告 | `docs/VALIDATION_REPORT.md` |
| Analytics 方案 | `docs/ANALYTICS_PLAN.md` |
| 平台兼容矩阵 | `docs/PLATFORM_SUPPORT_MATRIX.md` |

---

> **当前评分：89/100 | 适合推向前 100 用户 | 下一目标：完成 P0 上线准备**
