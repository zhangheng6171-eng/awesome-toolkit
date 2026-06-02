# Awesome Toolkit SaaS — 技术架构与路线图

> 目标：做成「开源工具的 App Store」，用户选工具 → 一键自动部署到自己的服务器

## 技术架构 (Cloudflare 原生)

```
┌──────────────────────────────────────────────────────┐
│  Cloudflare Pages (静态站点)                          │
│  Next.js output: 'export' → out/ 目录                │
│  /  /deploy  /deploy/[id]/wizard  /dashboard  etc.   │
├──────────────────────────────────────────────────────┤
│  Cloudflare Pages Functions (API 层 = Workers)        │
│  /functions/api/deploy/connect   — Agent 连接测试    │
│  /functions/api/deploy/execute   — SSE 流式部署      │
│  /functions/api/deploy/history   — 部署历史          │
│  /functions/api/deploy/_middleware — API 付费墙      │
│  /functions/api/waitlist        — 邮件列表           │
│  /functions/api/auth/upgrade    — 用户 tier 管理     │
├──────────────────────────────────────────────────────┤
│  Cloudflare KV (数据层)                              │
│  WAITLIST_KV   — 邮件列表持久化                      │
│  DEPLOY_KV     — 部署记录 + 用户 tier                │
├──────────────────────────────────────────────────────┤
│  用户服务器 Agent (Python3, 端口 9876)               │
│  public/agent/agent.py         — 接收部署指令        │
│  public/agent/install-agent.sh — 一键安装脚本        │
│  Agent 执行 docker compose 命令，SSE 流返回日志       │
└──────────────────────────────────────────────────────┘
```

## 当前实现状态 (2026-06-02)

### 已完成
- [x] Cloudflare Pages 静态站点 (Next.js output: 'export', 113 页)
- [x] Cloudflare Functions API 层 (6 个端点)
- [x] Python Agent — 用户服务器上执行部署命令
- [x] Agent 一键安装脚本 (curl | bash)
- [x] 四步部署向导
  - Step 1: 安装 Agent (curl 命令 + 轮询检测上线)
  - Step 2: 确认连接信息 (服务器 IP + Agent Token)
  - Step 3: 确认部署配置 (环境变量、端口等)
  - Step 4: 实时日志终端 + 部署结果
- [x] 终端风格日志组件 (TerminalLog)
- [x] 28 个工具的 Docker Compose 配置 + 部署
- [x] 用户状态管理 (localStorage + Cloudflare Access, free/pro/team)
- [x] 定价页面 (/pricing) 三档方案
- [x] 用户控制台 (/dashboard) 服务器 + 工具列表
- [x] API 付费墙 (Functions _middleware.ts + tier check)
- [x] 邮件收集 (Pages Functions + KV 存储)
- [x] 50 个工具库 + 工具对比 + AI 描述生成
- [x] Cloudflare KV 数据持久化 (WAITLIST_KV + DEPLOY_KV)

### 下一步

#### 1. 创建 Cloudflare KV 命名空间
```bash
wrangler kv:namespace create WAITLIST_KV
wrangler kv:namespace create DEPLOY_KV
# 将输出的 ID 填入 wrangler.toml
```

#### 2. 配置 Cloudflare Access (认证)
详见 docs/CLOUDFLARE-ACCESS-SETUP.md
- 在 Cloudflare Zero Trust 创建 Access Application
- 保护 /dashboard 页面
- 用户通过 Google/GitHub/邮箱验证码登录

#### 3. 真实支付系统
- Stripe Checkout 嵌入 /pricing 页面
- Stripe Webhook → 调用 /api/auth/upgrade 更新用户 tier 到 KV
- 支付宝/微信支付（国内用户）

#### 4. 安全加固
- [ ] Agent HTTPS: 用户配置 Nginx 反向代理 + Let's Encrypt
- [ ] Agent Token 轮换
- [ ] Rate limiting on Functions
- [ ] CSP headers

#### 5. 部署上线
详见 docs/CLOUDFLARE-DEPLOY.md
- 关联 GitHub 仓库到 Cloudflare Pages
- 绑定 KV 命名空间
- git push 自动部署

## 开发命令

```bash
# 前端开发 (HMR 快速)
npm run dev

# 构建静态站点
npm run build
# 输出: out/

# 本地测试完整应用 (含 Functions + KV)
wrangler pages dev ./out --kv WAITLIST_KV --kv DEPLOY_KV

# 创建 KV 命名空间
wrangler kv:namespace create WAITLIST_KV
wrangler kv:namespace create DEPLOY_KV

# 部署到 Cloudflare Pages
wrangler pages deploy ./out

# 检查 waitlist 注册数 (本地)
node -e "const d = require('./data/waitlist.json'); console.log(d.length, 'registrations')"
```

## 月成本

| 资源 | 免费额度 | 预计 | 月费 |
|---|---|---|---|
| Pages | 500 构建/月 | <50 | ¥0 |
| Functions | 10万请求/天 | <5千 | ¥0 |
| KV | 1GB/1000万读 | 微量 | ¥0 |
| Access | 50 用户 | <50 | ¥0 |
| **合计** | | | **¥0** |

免费额度可支撑数千用户和上万次部署。
