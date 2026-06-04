# 生产环境验证清单

> 日期：2026-06-03
> 项目：Awesome Toolkit
> 环境：https://awesome-toolkit.pages.dev
> 验证人：自动化 + 待人工确认

---

## 1. Cloudflare Pages 配置

| 检查项 | 状态 | 详情 |
|--------|------|------|
| Pages 项目存在 | ✅ | `awesome-toolkit` |
| 生产域名 | ✅ | `awesome-toolkit.pages.dev` |
| 最新部署 | ✅ | `7f755114` (2026-06-03, main) |
| 部署状态 | ✅ | Success, 1,189 files |
| Git Provider | ⚠️ | No — 需通过 CLI 手动部署 |
| 自定义域名 | ❌ | 未配置 (可选: henghe.site) |

### 验证命令
```bash
npx wrangler pages project list
npx wrangler pages deployment list --project-name awesome-toolkit
```

---

## 2. 页面验证（12 路由）

### 2.1 公开页面

| 路径 | HTTP | Title | Canonical | OG | JSON-LD | 备注 |
|------|------|-------|-----------|-----|---------|------|
| `/` | 200 | ✅ | ✅ `/` | ✅ | ✅ WebSite | — |
| `/tool/ollama` | 200 | ✅ 动态 | ✅ | ✅ article | ✅ SoftwareApplication | 测试 1/50 |
| `/tool/immich` | 200 | ✅ 动态 | ✅ | ✅ | ✅ | 测试 2/50 |
| `/deploy` | 200 | ✅ | ✅ `/deploy` | ✅ | ✅ ItemList (32) | — |
| `/deploy/immich` | 200 | ✅ 动态 | ✅ | ✅ | — | — |
| `/deploy/immich/wizard` | 200 | ✅ 动态 | ✅ | — | — | robots:noindex |
| `/about` | 200 | ✅ | ✅ `/about` | ✅ | — | — |
| `/pricing` | 200 | ✅ | ✅ `/pricing` | ✅ | — | — |
| `/compare` | 200 | ✅ | ✅ `/compare` | ✅ | — | — |
| `/feedback` | 200 | ✅ | ✅ `/feedback` | — | — | robots:noindex |
| `/sitemap.xml` | 200 | — | — | — | — | 123 URL + lastmod |
| `/robots.txt` | 200 | — | — | — | — | Sitemap 引用正确 |
| `/favicon.svg` | 200 | — | — | — | — | SVG 格式 |

### 2.2 认证页面

| 路径 | HTTP | Title | 备注 |
|------|------|-------|------|
| `/dashboard` | 200 | ❌ 使用默认 title | 需 Cloudflare Access; SSR 无内容 |

### Dashboard 问题
- **Title:** Dashboard 页面未设置独立 metadata（使用根 layout 默认 title）
- **SSR 内容:** `'use client'` 页面在 HTML 中无实质内容，依赖客户端 hydration
- **影响:** Dashboard 不面向搜索引擎，实际影响低

---

## 3. API 验证（8 端点）

### 3.1 Waitlist (`/api/waitlist`)

| 测试 | 方法 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| CORS 预检 | OPTIONS | — | 204 | ✅ |
| 统计查询 | GET | — | `{"total": N}` | ✅ |
| 有效提交 | POST | `{"email":"a@b.com"}` | `{"success":true}` | ✅ |
| 无效邮箱 | POST | `{"email":"bad"}` | `{"success":false,"error":"..."}`  | ✅ |
| 重复邮箱 | POST | `{"email":"a@b.com"}` | `{"message":"already_registered"}` | ✅ |
| KV 持久化 | GET | 提交后再次查询 | total 递增 | ✅ |

### 3.2 Feedback (`/api/feedback`)

| 测试 | 方法 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| CORS 预检 | OPTIONS | — | 204 | ✅ |
| 有效反馈 | POST | `{"message":"test 12345"}` | `{"success":true}` | ✅ |
| 内容过短 | POST | `{"message":"ab"}` | `{"success":false,"error":"..."}` | ✅ |
| 空内容 | POST | `{}` | `{"success":false}` | ✅ |

### 3.3 Auth/Upgrade (`/api/auth/upgrade`)

| 测试 | 方法 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| CORS 预检 | OPTIONS | — | 204 | ✅ |
| 未认证 | GET | 无 Cf-Access header | 401 | ✅ |

### 3.4 Deploy History (`/api/deploy/history`)

| 测试 | 方法 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| CORS 预检 | OPTIONS | — | 204 | ✅ |
| 未认证 | GET | 无 Cf-Access header | 401 `{"error":"请先登录"}` | ✅ |

### 3.5 Servers (`/api/servers`)

| 测试 | 方法 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| CORS 预检 | OPTIONS | — | 204 | ✅ |
| 未认证 GET | GET | 无 Cf-Access header | 401 `{"error":"请先登录"}` | ✅ |
| 未认证 POST | POST | `{}` | 401 | ✅ |
| 未认证 DELETE | DELETE | `?id=xxx` | 401 | ✅ |

### 3.6 Deploy Execute (`/api/deploy/execute`)

| 测试 | 方法 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| 错误 Method | GET | — | 405 | ✅ |
| 参数缺失 | POST | `{}` | 400 `{"error":"缺少必填参数"}` | ✅ |
| 不存在的工具 | POST | `{"toolId":"nonexistent","host":"1.2.3.4","token":"x"}` | 400 `{"error":"工具 nonexistent 暂不支持部署"}` | ✅ |
| 有效工具（无 Agent） | POST | 完整参数 → 真实 host | 500（Agent 不可达） | ⏳ 需真实 VPS |

### 3.7 Deploy Connect (`/api/deploy/connect`)

| 测试 | 方法 | 输入 | 预期 | 结果 |
|------|------|------|------|------|
| 错误 Method | GET | — | 405 | ✅ |
| 参数缺失 | POST | `{}` | `{"success":false,"error":"请输入服务器 IP"}` | ✅ |
| Token 缺失 | POST | `{"host":"1.2.3.4"}` | `{"success":false,"error":"请输入 Agent Token"}` | ✅ |
| 真实连接 | POST | 有效 host + token | Agent status JSON | ⏳ 需真实 VPS |

---

## 4. 安全验证

| 检查项 | 状态 | 详情 |
|--------|------|------|
| X-Frame-Options | ✅ | `DENY` |
| X-Content-Type-Options | ✅ | `nosniff` |
| Referrer-Policy | ✅ | `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ | `camera=(), microphone=(), geolocation=()` |
| CSP | ❌ | 未配置 Content-Security-Policy |
| HSTS | ❌ | Cloudflare 默认未开启 |
| API 认证兜底 | ✅ | 401 for history/servers/upgrade |
| Agent Token 校验 | ✅ | Agent 端验证 |
| Agent 命令白名单 | ✅ | 仅 `curl -fsSL -4 ifconfig.me` |
| Agent IP 锁定 | ✅ | 5 次失败锁定 10 分钟 |

### 建议补充
- 在 `_headers` 中添加基础 CSP: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`
- Cloudflare Dashboard → SSL/TLS → 开启 HSTS

---

## 5. KV 验证

| 检查项 | 状态 | 详情 |
|--------|------|------|
| WAITLIST_KV 创建 | ✅ | `b8e7d7da3e3c417ab8328f6c5f0a3a33` |
| DEPLOY_KV 创建 | ✅ | `c62ce2947ece40f79b49822a3ae9d088` |
| wrangler.toml 配置 | ✅ | ID 已替换 |
| WAITLIST_KV 读写 | ✅ | Write → Read 验证通过 |
| 重复检测 | ✅ | 同 email 返回 `already_registered` |
| KV 列表查询 | ✅ | `list()` 正常工作 |

---

## 6. SEO 验证

| 检查项 | 状态 | 详情 |
|--------|------|------|
| 全站 metadata | ✅ | 10/10 路由有 title/description |
| Canonical URL | ✅ | 10/10 路由 |
| Open Graph | ✅ | 10/10 路由 |
| Twitter Card | ✅ | 所有页面 |
| JSON-LD | ✅ | 3 个页面 (WebSite/SoftwareApplication/ItemList) |
| Sitemap | ✅ | 123 URL + lastmod |
| Robots.txt | ✅ | Sitemap 引用正确 |
| Favicon | ⚠️ | SVG 格式，部分浏览器不支持 |

---

## 7. 构建质量

| 指标 | 值 |
|------|-----|
| TypeScript 错误 | 0 |
| 构建页面数 | 123 |
| 构建时间 | ~2.7s |
| 函数端点 | 8 |
| 静态文件 | 1,189 |

---

## 8. 待人工验证（需 Cloudflare Access 配置后）

| 检查项 | 方法 | 预期 |
|--------|------|------|
| Dashboard 加载 | 浏览器访问 `/dashboard` | 显示服务器列表（空状态） |
| 同步到云端 | Dashboard 点「同步到云端」 | Toast "同步成功" |
| 服务器 CRUD | Dashboard 添加/删除服务器 | 列表更新 |
| 部署历史 | Dashboard 查看部署历史 | 显示 KV 中记录 |

---

## 9. 待人工验证（需真实 VPS）

| 检查项 | 方法 | 预期 |
|--------|------|------|
| Agent 安装 | SSH 执行 install-agent.sh | Agent 启动，端口 9876 监听 |
| Agent 连接测试 | Wizard 步骤 2 填入 IP+Token | 显示服务器信息 |
| 一键部署 | Wizard 完成 4 步部署流程 | SSE 流显示部署日志 |
| 部署后访问 | 浏览器打开工具 URL | 工具正常运行 |
| Agent 健康检查 | `curl http://host:9876/status` | 返回 status/docker_version |
| 工具卸载 | Dashboard → 卸载 | docker compose down 执行 |

---

## 10. 已知问题

| # | 问题 | 严重度 | 修复建议 |
|---|------|--------|----------|
| 1 | Dashboard 无独立 title | 低 | Dashboard 路由加 layout.tsx |
| 2 | OG 图片为 SVG | 中 | 转换为 PNG（Twitter 等不支持） |
| 3 | 无 CSP 头 | 中 | `_headers` 添加 CSP |
| 4 | 无 HSTS | 低 | Cloudflare Dashboard 开启 |
| 5 | Cloudflare Access 未配置 | 高 | 阻塞 Dashboard/历史/服务器 API |
| 6 | Favicon SVG 兼容性 | 低 | 同时提供 `.ico` 回退 |
| 7 | Wizard 无 robot meta（已有） | ✅ | `robots: noindex` 已配置 |
| 8 | 首页 SSR + Client hydration 不一致 | 低 | StatCard 值服务端/客户端一致，无影响 |
