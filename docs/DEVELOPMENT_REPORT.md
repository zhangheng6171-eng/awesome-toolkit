# 开发报告

> 日期：2026-06-03
> 构建：123 页，零 TypeScript 错误
> 起始：115 页（28 部署配置）
> RC 阶段：7 个 P0 修复已完成

---

## RC 阶段 P0 修复 (2026-06-03)

### 修复列表

| # | 问题 | 审计级别 | 修复 |
|---|------|----------|------|
| P0-1 | API 认证兜底 | CRITICAL | deploy/history / servers 返回 401；deploy/execute 优雅跳过 KV 写入 |
| P0-2 | 无 ErrorBoundary | MEDIUM | 新增 ErrorBoundary + Providers 包裹 layout |
| P0-3 | 7 处 alert() | HIGH | Toast 组件 + useToast hook 替代全部 alert |
| P0-4 | 2 处 prompt() 收集 Token | HIGH | TokenModal 组件（password 输入 + 显示/隐藏切换）替代 prompt |
| P0-5 | 全站双 H1 | CRITICAL | Header.tsx 中 h1 → span（首页通过页面内 h1 保证 SEO） |
| P0-6 | 安全头缺失 | MEDIUM | 新增 public/_headers（X-Frame-Options/CSP/Cache-Control） |
| P0-7 | Agent curl 白名单过宽 | HIGH | 限制为仅 `curl -fsSL -4 ifconfig.me` 两个变体 |
| 附 | WaitlistForm 空 catch | HIGH | 增加错误状态追踪和用户提示 |

### 修改/新增文件

| 文件 | 变更 |
|------|------|
| `src/components/ErrorBoundary.tsx` | **新增** — 全局错误边界 |
| `src/components/Toast.tsx` | **新增** — Toast 通知系统（Provider + hook） |
| `src/components/TokenModal.tsx` | **新增** — 密码输入 Modal（替代 prompt） |
| `src/components/Providers.tsx` | **新增** — 客户端 Provider 包装器 |
| `src/app/layout.tsx` | 集成 Providers（ErrorBoundary + ToastProvider） |
| `src/app/dashboard/page.tsx` | alert→toast；prompt→TokenModal；DOM 操作→React state |
| `src/components/Header.tsx` | h1→span（修复全站双 H1） |
| `src/components/WaitlistForm.tsx` | 空 catch→错误状态处理 |
| `functions/api/deploy/history.ts` | anonymous 兜底→401 拒绝 |
| `functions/api/servers.ts` | anonymous 兜底→401 拒绝 |
| `functions/api/deploy/execute.ts` | anonymous 兜底→优雅跳过 KV 写入 |
| `public/agent/agent.py` | curl 白名单收紧到仅 IP 检测 |
| `public/_headers` | **新增** — 安全头 + 缓存策略 |

---

## 1. 修改/新增文件列表（RC 之前）

### 修改文件

| 文件 | 变更 | 说明 |
|------|------|------|
| `public/agent/agent.py` | +3 行 | SSE 响应补充完整 CORS 头（Headers + Methods） |
| `src/app/page.tsx` | -90 行 | 提取 MobileFilterBar / WaitlistForm 为独立组件 |
| `src/app/pricing/page.tsx` | -25 行 | 使用 WaitlistForm 替代内联表单 |
| `src/app/dashboard/page.tsx` | -1 行 | 移除未使用的 `DeployedToolInfo` 类型导入 |
| `src/app/deploy/[id]/page.tsx` | +2 行 / -11 行 | `generateStaticParams` 改为动态从 `getDeployableTools()` 读取 |
| `src/lib/deploy.ts` | +60 行 | 新增 prometheus/passbolt/outline/plausible 部署配置 |

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/components/MobileFilterBar.tsx` | 移动端筛选栏组件（折叠面板 + 分类/难度/人群筛选） |
| `src/components/WaitlistForm.tsx` | 可复用的邮件订阅表单（支持 source/placeholder/buttonText） |
| `public/deploy/tools/prometheus/docker-compose.yml` | Prometheus + Node Exporter 部署配置 |
| `public/deploy/tools/prometheus/prometheus.yml` | Prometheus 默认抓取配置 |
| `public/deploy/tools/passbolt/docker-compose.yml` | Passbolt CE + MariaDB 部署配置 |
| `public/deploy/tools/outline/docker-compose.yml` | Outline Wiki + PostgreSQL + Redis 部署配置 |
| `public/deploy/tools/plausible/docker-compose.yml` | Plausible Analytics + PostgreSQL + ClickHouse 部署配置 |
| `public/deploy/tools/plausible/clickhouse-config.xml` | ClickHouse 日志配置 |

### 删除文件

| 文件 | 原因 |
|------|------|
| `scripts/new-tools.json` | 20 个工具数据已全部合并到 `src/data/tools.json` |
| `src/components/UpgradePrompt.tsx` | 零引用死代码，已被 WaitlistForm 替代 |
| `src/lib/deploy-proxy.ts` | 零引用死代码，部署向导已改用 CF Functions API 代理 |

---

## 2. 修复问题列表

| # | 问题 | 修复 |
|---|------|------|
| 1 | Agent CORS 不完整 | SSE `/execute` 响应补充 `Access-Control-Allow-Headers` 和 `Access-Control-Allow-Methods`，与其他端点保持一致 |
| 2 | `deploy/[id]` 硬编码工具列表 | 改为调用 `getDeployableTools()` 动态生成，新增工具无需手动更新此文件 |
| 3 | MobileFilterBar 内联在 page.tsx | 提取为 `src/components/MobileFilterBar.tsx`，FilterChip 也一并提取 |
| 4 | WaitlistForm 代码重复（首页 + 定价页） | 提取为 `src/components/WaitlistForm.tsx`，props 控制 source/按钮文案 |
| 5 | 未使用的 `DeployedToolInfo` 导入 | 移除 |
| 6 | 死代码 `UpgradePrompt.tsx` | 删除（零引用） |
| 7 | 死代码 `deploy-proxy.ts` | 删除（零引用，已被 CF Functions API 代理替代） |
| 8 | 过时的 `new-tools.json` | 删除（数据已合并） |

---

## 3. 新增功能列表

### 3.1 4 个工具的一键部署配置

| 工具 | 端口 | 内存需求 | 组件 |
|------|------|----------|------|
| Prometheus | 9090 | 1GB | Prometheus + Node Exporter |
| Passbolt | 8443/8080 | 1GB | Passbolt CE + MariaDB |
| Outline | 3005 | 2GB | Outline + PostgreSQL + Redis |
| Plausible Analytics | 8001 | 2GB | Plausible + PostgreSQL + ClickHouse |

每个配置包含：
- 健康检查
- 数据持久化卷映射
- 环境变量模板（可在部署向导中填写）
- 中文部署说明和注意事项

### 3.2 项目清理

- 删除 3 个死文件
- 提取 2 个可复用组件
- 消除 1 处硬编码（deploy ID 列表改为动态生成）

---

## 4. 当前状态总结

| 指标 | 值 |
|------|-----|
| 总页面数 | 123 |
| 工具总数 | 50 |
| 部署配置数 | 32（+4） |
| UI 组件数 | 13（MobileFilterBar / WaitlistForm 新增，UpgradePrompt 删除） |
| CF Functions API | 8 |
| TypeScript 错误 | 0 |
| 构建时间 | ~3s |

---

## 5. 剩余待办事项

### P0 — 阻塞上线（需 Cloudflare 控制台操作）

1. 配置 Cloudflare Access Zero Trust 应用 + 身份提供商（Google/GitHub）
2. 创建 KV Namespace（DEPLOY_KV、WAITLIST_KV）并更新 `wrangler.toml` 中的 placeholder ID
3. 首次 `wrangler pages deploy` 部署到 Cloudflare Pages
4. 线上验证 9 个关键页面 200 OK

### P1 — 影响核心体验

5. 在真实 VPS 上完整测试 Agent 安装 + 一键部署流程（至少测 immich / n8n / vaultwarden）
6. 新 4 个工具的 docker-compose.yml 部署验证（prometheus/passbolt/outline/plausible）
7. 注册阿里云/腾讯云/Vultr Affiliate 账号，替换服务器推荐页占位链接
8. 运行 AI 描述生成脚本：`ANTHROPIC_API_KEY=xxx node scripts/generate-descriptions.mjs --with-steps --force`

### P2 — 增强竞争力

9. 工具库扩充到 100 个（当前 50）
10. 部署配置扩充到 50 个（当前 32）
11. 支付网关接入（Stripe/LemonSqueezy）
12. Agent 增加备份/恢复端点
13. Agent 增加健康检查 + 告警通知
14. 版本更新提醒（检测 Docker image 新版本）
15. 统一 Toast 组件替代 `alert()` 调用
16. `functions/` 增加独立 `tsconfig.json` 支持 IDE 类型检查

---

## 6. 推荐下一步开发计划

```
本周（上线优先）：
1. P0 Cloudflare 配置 → 首次部署 → 线上验证
2. VPS 端到端 Agent 测试（至少验证 3 个热门工具）
3. Affiliate 注册 + 链接替换

下周（内容质量）：
4. 运行 AI 描述生成脚本提升 50 个工具的说明质量
5. 工具库扩充到 70 个
6. Toast 组件替代简陋的 alert()

下月（变现 + 规模化）：
7. 支付接入 + Pro/Team 方案上线
8. 工具库达到 100 个
9. 自动备份/监控告警功能
```
