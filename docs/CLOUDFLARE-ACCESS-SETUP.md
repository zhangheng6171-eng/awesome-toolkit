# Cloudflare Access 认证配置指南

Cloudflare Access（Zero Trust）为网站提供免费的身份认证，无需自己写登录系统。

## 工作原理

```
用户访问 /dashboard
        │
        ▼
Cloudflare Access 拦截
        │
        ▼
跳转登录页（Google/GitHub/邮箱验证码）
        │
        ▼
认证通过，注入 Header:
  Cf-Access-Authenticated-User-Email: user@example.com
        │
        ▼
网站读取 header 获取用户身份
```

## 配置步骤

### 1. 开通 Cloudflare Zero Trust

1. 打开 https://one.dash.cloudflare.com/
2. 选择你的域名（需 DNS 已托管在 Cloudflare）
3. 免费计划：支持 50 个用户

### 2. 创建 Access Application

1. **Access** → **Applications** → **Add an application**
2. 选择 **Self-hosted**
3. 配置：
   - **Application name**: `Awesome Toolkit Dashboard`
   - **Session duration**: `24 hours`
   - **Subdomain**（可选）: `dashboard.yourdomain.com`
   - 或 **Path**: `dashboard.yourdomain.com/dashboard`

### 3. 添加保护路径

在 Application 设置中添加要保护的路径：
- `/dashboard` — 用户控制台
- `/api/deploy/execute` — 部署 API（Pro 用户）

方法：创建两个 Application，或使用 Access 策略控制。

### 4. 配置身份提供者

**Access** → **Settings** → **Login methods**：

推荐添加（至少选一个）：
- **Google** — 大多数用户有 Google 账号
- **GitHub** — 开发者首选
- **Email OTP** — 无需第三方账号，收到验证码即可登录

点击 **Add** → 按提示配置 OAuth 应用。

### 5. 配置策略

在 Application 的 **Policies** 中：

```
Policy name: Allow All
Action: Allow
Configure rules:
  Include → Emails ending in → (留空或限制域名)
```

如果只想让特定用户访问（如付费用户），可以手动添加邮箱列表。

### 6. 可选：Service Token（API 调用用）

如果外部系统需要调用 API：

1. **Access** → **Service Auth** → **Create Service Token**
2. Token 格式: `CF-Access-Client-Id` + `CF-Access-Client-Secret`
3. 调用时在请求头中传入

## 代码适配说明

项目已适配 CF Access 认证：

### 前端 (src/lib/auth.ts)
```typescript
// 生产环境：从 /api/auth/upgrade 获取 CF Access 注入的用户身份
// 开发环境：回退到 localStorage 模拟
export async function getCurrentUserEmail(): Promise<string> {
  try {
    const res = await fetch('/api/auth/upgrade');
    const data = await res.json();
    return data.email || getLocalEmail();
  } catch {
    return getLocalEmail();
  }
}
```

### API (functions/api/auth/upgrade.ts)
```typescript
// 读取 Cloudflare Access 自动注入的 header
const userEmail = request.headers.get('Cf-Access-Authenticated-User-Email');
```

### 付费墙 (functions/api/deploy/_middleware.ts)
```typescript
// 从 KV 读取用户 tier，免费用户拦截
const tier = await context.env.DEPLOY_KV.get(`user:${userEmail}:tier`);
```

## 后续接支付

当用户付费后（Stripe Webhook 或其他支付回调）：
1. 调用 `/api/auth/upgrade` POST 接口
2. 传入 `{ email, tier: 'pro' }`
3. 写入 KV: `user:邮箱:tier` = `pro`

支付集成可参考 SAAS-ROADMAP.md 第 2 节。

## 费用

Cloudflare Access：**50 个用户以内完全免费**，无时间限制。
超过 50 用户后：$3/用户/月（含更高级的审计和规则功能）。
