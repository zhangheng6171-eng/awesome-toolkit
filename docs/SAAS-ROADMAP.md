# Awesome Toolkit SaaS — 技术架构与路线图

> 目标：做成「开源工具的 App Store」，用户选工具 → 填服务器信息 → 一键自动部署

## 技术架构

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
│  /deploy/[id]/wizard  — 三步部署向导                │
│  /dashboard           — 用户控制台                   │
│  /pricing             — 定价页面                     │
├─────────────────────────────────────────────────────┤
│               API Layer (Next.js Route Handlers)     │
│  POST /api/deploy/connect  — SSH 连接测试            │
│  POST /api/deploy/execute  — SSE 流式部署执行        │
│  POST /api/waitlist        — 邮件列表收集            │
├─────────────────────────────────────────────────────┤
│               Core (Node.js)                        │
│  src/lib/ssh.ts   — SSH 连接池 + 命令执行            │
│  src/lib/auth.ts  — 用户状态管理 (localStorage)      │
│  src/lib/deploy.ts — 部署配置数据                    │
├─────────────────────────────────────────────────────┤
│               Infrastructure                        │
│  middleware.ts    — API 付费墙拦截                   │
│  data/waitlist.json — 邮件列表持久化                 │
└─────────────────────────────────────────────────────┘
```

## 当前实现状态 (2026-06-02)

### 已完成
- [x] SSH 连接测试 API (`/api/deploy/connect`)
- [x] 流式部署执行 API (`/api/deploy/execute`)，SSE 推送实时日志
- [x] SSH 连接池 + 错误处理 + 超时控制 (`src/lib/ssh.ts`)
- [x] 三步部署向导 (`/deploy/[id]/wizard`)
  - Step 1: 服务器信息填写 + 连接测试
  - Step 2: 部署配置确认 + 环境变量编辑
  - Step 3: 实时日志终端 + 部署结果
- [x] 终端风格日志组件 (TerminalLog)
- [x] 部署详情页主推向导模式，手动命令折叠展示
- [x] 用户状态管理 (localStorage 模拟: free/pro/team)
- [x] 定价页面 (`/pricing`) 三档方案
- [x] 用户控制台 (`/dashboard`) 服务器 + 工具列表
- [x] API 付费墙 (`middleware.ts`) 拦截免费用户
- [x] 邮件收集 API (`/api/waitlist`)
- [x] 首页 + Pricing 页邮件收集表单
- [x] 部署成功分享按钮

### 下一步（Phase 5 之后）

#### 1. 真实认证系统
当前: localStorage 模拟用户状态
目标: 接入真实 Auth Provider

**推荐方案**: Clerk.com 或 NextAuth.js
- Clerk: 5 分钟集成，免费 10,000 MAU，提供 `<SignIn />` 等预置组件
- NextAuth: 开源，需自己搭建 UI，灵活度高

实现的改动量:
- 移除 `src/lib/auth.ts` 的 localStorage 操作
- 用 Clerk/NextAuth 的 session 替换
- middleware.ts 改为读取真实 session
- `/dashboard` 页面改用服务端获取用户数据

#### 2. 真实支付系统
当前: localStorage 模拟 tier (free/pro/team)
目标: 接入 Stripe / 支付宝 / 微信支付

**推荐方案**: Stripe (国际) + 支付宝 (国内)
- Stripe Checkout: 几行代码完成支付集成
- Stripe Webhook: 支付成功回调更新用户 tier
- 支付宝当面付: 国内用户更友好

实现的改动量:
- 新增 `/api/stripe/webhook` 接收支付结果
- Stripe Pricing Table 嵌入 `/pricing` 页面
- 数据库记录: userId → tier → subscription 关系

#### 3. 数据持久化
当前: waitlist 存 JSON 文件，用户数据存 localStorage
目标: 接入数据库

**推荐方案**: 
- 初期: Vercel Postgres / Neon (免费额度够用)
- 后期: Supabase (自带 Auth + DB + RLS)

需要持久化的数据:
- users: id, email, tier, stripe_customer_id, created_at
- servers: id, user_id, host, port, username, encrypted_password, last_seen
- deployments: id, user_id, server_id, tool_id, status, created_at
- waitlist: id, email, source, created_at

#### 4. 部署平台切换
当前: 本地开发 (`npm run dev`) 可用 API routes
部署: 需 Node.js 运行环境

**方案 A: Vercel (推荐)**
- 原生支持 Next.js + API routes
- 免费额度: 100GB 带宽, 1000 次 API/天
- 一键部署: 关联 GitHub 仓库即可
- 命令: 无需 Cloudflare wrangler，直接用 `git push` 触发

**方案 B: VPS (更灵活)**
- 1 核 2G VPS 即可运行 (`npm run build && npm start`)
- 配合 PM2 进程管理 + Nginx 反向代理
- 适合对延迟和可用性有更高要求的场景

#### 5. 安全加固
- [ ] SSH 凭据加密存储: 用 AES-256-GCM 加密 password/privateKey
- [ ] Rate limiting: 对 API 端点添加频率限制（防止暴力破解 SSH）
- [ ] 部署沙箱: 限制 SSH 可执行命令的白名单
- [ ] CSP headers: 防止 XSS 攻击

## 开发命令

```bash
# 本地开发（API routes 可用）
npm run dev

# 生产构建
npm run build

# 启动生产服务
npm start

# 测试部署流程
# 1. npm run dev
# 2. 打开 http://localhost:3000/deploy/uptime-kuma/wizard
# 3. 填写你的服务器 IP + 密码或私钥
# 4. 点「测试连接」→「下一步」→「开始部署」
# 5. 观察日志终端输出

# 检查 waitlist 注册数
node -e "const d = require('./data/waitlist.json'); console.log(d.length, 'registrations')"
```
