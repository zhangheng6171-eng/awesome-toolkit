# Cloudflare Pages 部署指南（截图级详细）

> 日期：2026-06-03
> 预计耗时：30-45 分钟（首次）
> 前提：已注册 Cloudflare 账号，项目代码已 push 到 GitHub

---

## 前置要求

- [ ] Cloudflare 账号（免费计划即可）
- [ ] GitHub 仓库已包含项目代码
- [ ] 本地已安装 Node.js 18+ 和 npm
- [ ] （可选）本地安装 wrangler CLI：`npm install -g wrangler`

---

## 第 1 步：创建 KV Namespace

### 1.1 打开 Cloudflare 控制台

```
1. 浏览器访问 https://dash.cloudflare.com
2. 登录你的 Cloudflare 账号
3. 左侧菜单点击「Workers & Pages」
4. 顶部导航选择「KV」
```

### 1.2 创建 DEPLOY_KV

```
1. 点击「创建命名空间」按钮
2. 命名空间名称输入：DEPLOY_KV
3. 点击「添加」
4. 创建后，列表中会显示 DEPLOY_KV 及其 ID
5. 复制 ID（格式如：abc123def456...）保存到记事本
```

### 1.3 创建 WAITLIST_KV

```
1. 再次点击「创建命名空间」
2. 命名空间名称输入：WAITLIST_KV
3. 点击「添加」
4. 复制 WAITLIST_KV 的 ID 保存到记事本
```

### 1.4 使用命令行创建（可选替代方案）

```bash
# 如果安装了 wrangler CLI，也可以用命令创建
wrangler kv:namespace create "DEPLOY_KV"
# 输出：{ binding = "DEPLOY_KV", id = "abc123def456..." }

wrangler kv:namespace create "WAITLIST_KV"
# 输出：{ binding = "WAITLIST_KV", id = "xyz789ghi012..." }
```

---

## 第 2 步：更新 wrangler.toml

### 2.1 编辑文件

打开项目根目录的 `wrangler.toml`，找到以下两行：

```toml
[[kv_namespaces]]
binding = "WAITLIST_KV"
id = "WAITLIST_KV_PLACEHOLDER"    # ← 替换这里

[[kv_namespaces]]
binding = "DEPLOY_KV"
id = "DEPLOY_KV_PLACEHOLDER"      # ← 替换这里
```

### 2.2 替换占位符

```toml
[[kv_namespaces]]
binding = "WAITLIST_KV"
id = "abc123def456..."             # ← 粘贴第 1 步复制的 WAITLIST_KV ID

[[kv_namespaces]]
binding = "DEPLOY_KV"
id = "xyz789ghi012..."             # ← 粘贴第 1 步复制的 DEPLOY_KV ID
```

### 2.3 更新 compatibility_date

将 `compatibility_date` 更新为当前日期：

```toml
compatibility_date = "2026-06-03"
```

### 2.4 验证 wrangler.toml 内容

最终文件应如下：

```toml
name = "awesome-toolkit"
compatibility_date = "2026-06-03"
pages_build_output_dir = "out"

[[kv_namespaces]]
binding = "WAITLIST_KV"
id = "abc123def456..."

[[kv_namespaces]]
binding = "DEPLOY_KV"
id = "xyz789ghi012..."

[vars]
BASE_URL = "https://awesome-toolkit.pages.dev"
```

---

## 第 3 步：创建 Cloudflare Access 策略

### 3.1 进入 Zero Trust 控制台

```
1. Cloudflare 控制台左侧菜单点击「Zero Trust」
2. 首次使用需设置团队名称（如 awesome-toolkit）
3. 选择 Free 计划（支持最多 50 用户，Beta 阶段足够）
```

### 3.2 配置身份提供商

```
1. Zero Trust 控制台 → Settings → Authentication
2. 在「Login methods」下点击「Add new」
3. 选择 GitHub：
   - 点击「GitHub」
   - 创建 OAuth App（会跳转到 GitHub）
     - Application name: Awesome Toolkit
     - Homepage URL: https://awesome-toolkit.pages.dev
     - Authorization callback URL: （Cloudflare 自动提供）
   - 复制 Client ID 和 Client Secret 填入
   - 点击「Save」
4. 同样添加 Google（可选，作为备选登录方式）：
   - 选择「Google」
   - 无需额外配置，直接启用
```

### 3.3 创建 Access 应用

```
1. Zero Trust 控制台 → Access → Applications
2. 点击「Add an application」
3. 选择「Self-hosted」
4. 应用配置：
   - Application name: Awesome Toolkit
   - Session Duration: 24 hours
   - Subdomain / Domain:
     输入你的 Pages 域名：awesome-toolkit.pages.dev
     勾选「Include subdomains」如果使用自定义域名
5. 点击「Next」
```

### 3.4 配置访问策略

```
1. Policy name: Allow All Users
2. Action: Allow
3. 配置规则：
   - Selector: Emails ending in
   - Value: （留空，允许所有邮箱）
   或者限制为特定用户：
   - Selector: Email
   - Value: yourname@gmail.com

4. 点击「Next」
5. 点击「Add application」
```

### 3.5 配置 API 路径保护

```
1. 再次点击「Add an application」
2. 选择「Self-hosted」
3. Application name: Awesome Toolkit API
4. Subdomain / Domain: awesome-toolkit.pages.dev
5. Path: /api/*
   （这确保只有认证用户才能访问 API）
6. 同上添加 Allow 策略
7. 点击「Add application」
```

### 3.6 重要：Access 配置与 Functions 的关系

配置 Cloudflare Access 后，所有到达 `/api/*` 的请求会自动包含以下 HTTP Header：

```
Cf-Access-Authenticated-User-Email: user@example.com
Cf-Access-Jwt-Assertion: eyJ...
```

你的 Functions 代码（如 `auth/upgrade.ts`、`deploy/history.ts`）已经实现了读取这些 Header。Access 配置完成后即自动生效，无需修改代码。

---

## 第 4 步：设置环境变量（可选）

如果你有自定义域名，在 Cloudflare Pages 控制台设置环境变量：

```
1. Workers & Pages → 选择 awesome-toolkit 项目
2. Settings → Environment variables
3. 添加变量：
   - Variable name: BASE_URL
   - Value: https://awesome-toolkit.pages.dev
   - Environment: Production
```

> 注意：`wrangler.toml` 中的 `[vars]` 已经定义了 `BASE_URL`，Pages 控制台的变量会覆盖 wrangler.toml 的值。

---

## 第 5 步：部署到 Cloudflare Pages

### 方式 A：通过 GitHub Actions（推荐 — 自动部署）

项目已配置 `.github/workflows/deploy-cloudflare.yml`。需要设置 GitHub Secrets：

```
1. GitHub 仓库 → Settings → Secrets and variables → Actions
2. 添加两个 Secrets：
   - Name: CLOUDFLARE_API_TOKEN
     Value: （从 Cloudflare 获取，见下方）
   - Name: CLOUDFLARE_ACCOUNT_ID
     Value: （从 Cloudflare 获取，见下方）
3. 每次 git push 到 main 分支会自动触发部署
```

**获取 Cloudflare API Token：**
```
1. Cloudflare 控制台 → 右上角头像 → My Profile
2. 左侧菜单 → API Tokens
3. 点击「创建令牌」
4. 选择「Custom Token」
5. 配置：
   - Token name: Awesome Toolkit Deploy
   - Permissions:
     Account / Cloudflare Pages / Edit
     Account / Workers KV Storage / Edit
   - Account Resources: 选择你的账号
6. 点击「创建」→ 复制 Token（仅显示一次！）
```

**获取 Account ID：**
```
1. Cloudflare 控制台首页
2. 右侧「API」区域
3. 复制「Account ID」（32 位十六进制字符串）
4. 或者在 wrangler.toml 所在目录运行：wrangler whoami
```

### 方式 B：通过 Wrangler CLI 手动部署

```bash
# 1. 确保已登录
wrangler login

# 2. 构建项目
npm run build

# 3. 部署
wrangler pages deploy out --project-name awesome-toolkit

# 输出示例：
# ✨ Deployment complete!
# URL: https://awesome-toolkit.pages.dev
```

### 方式 C：通过 Cloudflare Pages 控制台（无需命令行）

```
1. Cloudflare 控制台 → Workers & Pages
2. 点击「创建」→「Pages」
3. 连接你的 GitHub 仓库
4. 选择仓库：awesome-toolkit-curator（或你的仓库名）
5. 构建设置：
   - Build command: npm run build
   - Build output directory: out
   - Node.js version: 18.x
6. 环境变量（可选）：
   - BASE_URL = https://awesome-toolkit.pages.dev
7. 点击「保存并部署」
```

---

## 第 6 步：部署后验证

### 6.1 检查部署状态

```
1. Cloudflare Pages → awesome-toolkit 项目
2. 查看「Deployments」标签
3. 确认最新部署状态为「Success」✅
4. 点击部署 URL 打开网站
```

### 6.2 验证 9 个关键页面

在浏览器中逐一打开以下 URL，确认返回 200（非 404/500/白屏）：

| # | URL | 预期 |
|---|-----|------|
| 1 | `https://awesome-toolkit.pages.dev/` | 首页，50 个工具卡片 |
| 2 | `https://awesome-toolkit.pages.dev/tool/immich` | Immich 详情页 |
| 3 | `https://awesome-toolkit.pages.dev/deploy` | 32 个部署卡片 |
| 4 | `https://awesome-toolkit.pages.dev/deploy/immich/wizard` | 部署向导 |
| 5 | `https://awesome-toolkit.pages.dev/compare` | 对比页 |
| 6 | `https://awesome-toolkit.pages.dev/dashboard` | 控制台 |
| 7 | `https://awesome-toolkit.pages.dev/pricing` | 定价页 |
| 8 | `https://awesome-toolkit.pages.dev/feedback` | 反馈页 |
| 9 | `https://awesome-toolkit.pages.dev/about` | 关于页 |

### 6.3 验证 API 端点

```bash
# 测试邮件订阅
curl -X POST https://awesome-toolkit.pages.dev/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"test"}'

# 预期返回：{"success":true}

# 测试部署历史（未认证时返回空列表）
curl https://awesome-toolkit.pages.dev/api/deploy/history

# 预期返回：{"deployments":[]}

# 测试服务器列表
curl https://awesome-toolkit.pages.dev/api/servers

# 预期返回：{"servers":[]}
```

### 6.4 验证 Functions 日志

```
1. Cloudflare 控制台 → Workers & Pages → awesome-toolkit
2. 选择「Functions」标签
3. 点击任意 API 端点（如 api/waitlist）
4. 查看「Logs」标签
5. 确认无红色错误日志
```

---

## 第 7 步：配置自定义域名（可选）

```
1. Cloudflare Pages → awesome-toolkit → Custom domains
2. 点击「设置自定义域名」
3. 输入你的域名（如 awe.tools 或 tools.yourdomain.com）
4. Cloudflare 自动配置 DNS 和 SSL 证书
5. 等待几分钟 DNS 生效
6. 更新 wrangler.toml 中的 BASE_URL 环境变量
7. 重新部署
```

---

## 第 8 步：配置安全头（推荐）

在项目根目录创建 `public/_headers` 文件：

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

重新部署后生效。

---

## 故障排查

### 问题：部署后页面显示 404

```
检查：
1. npm run build 是否成功（123 页）
2. out/ 目录是否存在
3. pages_build_output_dir 是否正确设为 "out"
4. CF Pages 构建日志是否有报错
```

### 问题：API 端点返回 500

```
检查：
1. wrangler.toml 中 KV namespace ID 是否已替换占位符
2. Functions 日志中具体错误信息
3. KV namespace 是否已创建
```

### 问题：Access 登录后 API 仍返回 anonymous

```
检查：
1. CF Access 应用的路径是否覆盖 /api/*
2. 浏览器 Network 面板中请求是否携带 Cf-Access-Authenticated-User-Email header
3. Access Policy 是否正确配置（Allow）
```

### 问题：部署向导测试连接失败

```
检查：
1. VPS 防火墙是否开放 9876 端口
2. Agent 是否已启动（ps aux | grep agent.py）
3. Token 是否正确（cat ~/.awesome-tools-agent-token）
4. 是否需要使用 HTTP 而非 HTTPS（Agent 默认 HTTP）
```

---

## 部署后检查清单

```
[ ] KV 占位符已替换为真实 ID
[ ] CF Access Zero Trust 已配置
[ ] 身份提供商已添加（GitHub + Google）
[ ] Access Policy 已应用于主域名 + /api/*
[ ] 首次部署成功（无构建错误）
[ ] 9 个关键页面全部 200 OK
[ ] 邮件订阅 API 正常工作
[ ] Functions 日志无错误
[ ] robots.txt 和 sitemap.xml 可访问
[ ] 自定义域名 DNS 已配置（如适用）
[ ] _headers 文件已部署（如适用）
[ ] GitHub Actions 自动部署已配置
```
