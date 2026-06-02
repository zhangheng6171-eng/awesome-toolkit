# Cloudflare Pages 部署指南

## 架构说明

```
┌──────────────────────────────────────────────┐
│  Cloudflare Pages (静态站点)                  │
│  Next.js output: 'export' → out/ 目录         │
│  / , /deploy , /pricing , /dashboard ...      │
├──────────────────────────────────────────────┤
│  Cloudflare Pages Functions (API 层)          │
│  /functions/api/deploy/connect → Worker       │
│  /functions/api/deploy/execute → Worker       │
│  /functions/api/waitlist      → Worker       │
│  /functions/api/deploy/history→ Worker       │
│  /functions/api/auth/upgrade  → Worker       │
├──────────────────────────────────────────────┤
│  Cloudflare KV (数据层)                       │
│  WAITLIST_KV — 邮件列表                       │
│  DEPLOY_KV   — 部署记录 + 用户 tier           │
├──────────────────────────────────────────────┤
│  用户服务器 Agent                             │
│  Python3, 端口 9876                           │
│  接收 HTTP 指令 → 执行 docker compose 命令     │
└──────────────────────────────────────────────┘
```

## 前置准备

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. 创建 KV 命名空间

```bash
wrangler kv:namespace create WAITLIST_KV
# 输出: id = abc123...

wrangler kv:namespace create DEPLOY_KV
# 输出: id = def456...
```

### 3. 更新 wrangler.toml

将上面输出的 KV namespace ID 替换 `wrangler.toml` 中的占位符：

```toml
[[kv_namespaces]]
binding = "WAITLIST_KV"
id = "abc123..."   # ← 替换为实际 ID

[[kv_namespaces]]
binding = "DEPLOY_KV"
id = "def456..."   # ← 替换为实际 ID
```

## 本地开发

```bash
# 1. 构建静态站点
npm run build
# 输出到 out/ 目录

# 2. 启动 Cloudflare Pages 开发服务器（包含 Functions + KV）
wrangler pages dev ./out --kv WAITLIST_KV --kv DEPLOY_KV

# 或者只开发前端（HMR 更快）
npm run dev
# API 调用会走 src/app/api/ 下的 Next.js route（仅 dev 模式可用）
```

## 生产部署

### 方式 A：Git 推送自动部署（推荐）

1. 在 Cloudflare Dashboard → Workers & Pages → Create → Pages
2. 选择 "Connect to Git" → 授权 GitHub
3. 选择仓库 `awesome-toolkit`
4. 构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
5. 在项目设置 → Functions → KV namespace bindings：
   - `WAITLIST_KV` → 选择对应命名空间
   - `DEPLOY_KV` → 选择对应命名空间
6. 每次 `git push` 到 main 分支自动触发部署

### 方式 B：手动部署

```bash
npm run build
wrangler pages deploy ./out
```

## 环境变量配置

在 Cloudflare Pages 项目设置 → Environment variables 中添加：

| 变量名 | 值 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://awesome-toolkit.pages.dev` | 站点基础 URL |

## KV 数据结构

### WAITLIST_KV
| Key | Value |
|---|---|
| `waitlist:user@email.com` | `{"email":"...","source":"homepage","createdAt":"..."}` |

### DEPLOY_KV
| Key | Value |
|---|---|
| `deploy:user@email.com:1700000000000` | `{"userEmail":"...","toolId":"uptime-kuma","host":"1.2.3.4","timestamp":1700000000000,"status":"deployed"}` |
| `user:user@email.com:tier` | `"pro"` |

## 月成本估算

| 资源 | 免费额度 | 预计用量 | 月费 |
|---|---|---|---|
| Cloudflare Pages | 500 次构建/月, 无限带宽 | <50 次构建 | **¥0** |
| Pages Functions | 100,000 请求/天 | <10,000/天 | **¥0** |
| Workers KV (WAITLIST) | 1GB 存储, 1000 万读取/月 | <1000 键 | **¥0** |
| Workers KV (DEPLOY) | 同上 | <10,000 键 | **¥0** |
| **合计** | | | **¥0** |

免费额度足以支撑 **数千用户** 和 **上万次部署**。超出免费额度后的定价：
- KV 写入: $0.50/百万次
- KV 读取: $0.50/百万次
- Functions 请求: $0.30/百万次

即使月活 1 万用户，月费不超过 ¥50。

## 自定义域名

1. Cloudflare Pages → 项目 → Custom domains
2. 添加你的域名（需 DNS 托管在 Cloudflare）
3. 自动配置 SSL 证书

## 故障排查

### Functions 返回 500
- 检查 KV namespace 是否已创建并绑定到项目
- 在 Cloudflare Dashboard → Workers & Pages → 项目 → Functions 查看日志

### Agent 连接失败
- 确认用户服务器防火墙开放 9876 端口
- 确认 Agent 进程在运行: `ps aux | grep agent.py`
- 查看 Agent 日志: `cat ~/.awesome-tools-agent/agent.log`

### 构建失败
- 确保 Node.js >= 18
- 删除 `node_modules` 和 `.next` 后重新安装: `rm -rf node_modules .next && npm install`
