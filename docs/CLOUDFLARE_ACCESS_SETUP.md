# Cloudflare Access 配置指南

> 写给非技术用户的分步操作指南
> 目标：让 Dashboard 页面正常加载，用户能用 Google 账号登录

---

## 零、在开始之前

### 你需要什么

| 项目 | 说明 |
|------|------|
| Cloudflare 账号 | 在 https://dash.cloudflare.com 注册（免费） |
| 域名 DNS 托管在 Cloudflare | awesome-toolkit.pages.dev 不需要额外域名，但 CF Access 需要你的域名 DNS 在 CF 上 |
| Google 账号 | 用于配置 OAuth 登录方式 |
| 10-15 分钟 | 整个配置过程的时间 |

### 为什么需要做这个

网站上的「控制台」(Dashboard) 页面需要用户登录后才能使用。登录后用户可以管理自己的服务器、查看部署历史。Cloudflare Access 是一个免费工具（50 个用户以内不收费），用来给网站加上登录功能而不需要自己写登录代码。

---

## 一、开通 Cloudflare Zero Trust

### Step 1.1：进入 Zero Trust 控制台

1. 打开浏览器，访问：**https://one.dash.cloudflare.com/**
2. 用你的 Cloudflare 账号登录
3. 如果这是第一次使用，会看到一个欢迎页面。点击 **「开始使用」**
4. 系统会要求你选择一个「团队名称」— 随便填一个，比如 `awesome-toolkit`
5. 选择 **Free 计划**（免费，支持 50 个用户）

完成后你会看到 Zero Trust 的主控制台。

---

## 二、配置登录方式（Google OAuth）

### Step 2.1：添加 Google 身份提供者

1. 在左侧菜单栏找到 **Settings** → **Authentication** → **Login methods**
2. 点击 **「Add new」** 按钮
3. 在弹出的列表中选择 **Google**
4. 什么都不用改，直接点击页面底部的 **「Save」** 按钮

> 为什么选 Google？因为大多数人都有 Google 账号（Gmail 就是 Google 的）。你不需要创建 Google Cloud 项目或申请 OAuth 密钥 — Cloudflare 已经帮你处理好了。

**完成后**：Google 出现在 Login methods 列表中。

### Step 2.2（可选）：添加 GitHub 登录

如果你想给开发者用户提供 GitHub 登录选项：

1. 同样在 Login methods 页面，点击 **「Add new」**
2. 选择 **GitHub**
3. 需要创建一个 GitHub OAuth App（步骤稍多，此处略）
4. 对于前 100 用户阶段，只配置 Google 登录就足够了

---

## 三、创建 Access Application

这是最核心的一步。创建 Application 后，Cloudflare 会保护指定路径，要求用户先登录才能访问。

### Step 3.1：创建应用

1. 在左侧菜单栏找到 **Access** → **Applications**
2. 点击 **「Add an application」** 蓝色按钮
3. 选择 **「Self-hosted」**（自托管应用）

### Step 3.2：配置应用基本信息

进入配置页面后，填写以下内容：

| 配置项 | 填写内容 | 说明 |
|--------|----------|------|
| **Application name** | `Awesome Toolkit Dashboard` | 只是一个名字，用户登录时会看到 |
| **Session duration** | `24 hours` | 登录后 24 小时内不需要重新登录 |
| **Application domain** | `awesome-toolkit.pages.dev` | 你的网站域名 |

**子域名和路径**部分：

往下滚动到 **「Application domain 2」** 区域：
- 默认已经填好了你的域名
- 不要动域名
- 在 **Path** 输入框中添加以下路径（一行一个）：

```
/dashboard
/deploy/*/wizard
/api/deploy/execute
/api/deploy/history
/api/servers
/api/auth/upgrade
```

> **解释**：这些是需要登录才能访问的页面和 API。
> - `/dashboard` — 控制台
> - `/deploy/*/wizard` — 部署向导
> - `/api/servers` — 服务器管理 API
> - `/api/auth/upgrade` — 用户身份认证 API

**不要**添加 `/`、`/about`、`/deploy` 等公开页面 — 这些任何人都应该能看。

配置好路径后，页面最下方，点击 **「Next」**。

### Step 3.3：配置访问策略

在 Policy 页面：

1. **Policy name**：填 `Allow All Users`
2. **Action**：保持 `Allow`
3. **Configure rules**：
   - 在 **Include** 部分，选择 `Emails`
   - 选择操作符 `ends in`
   - **留空 Value 字段**（表示允许所有邮箱）

> 这意味着：任何有 Google 账号的人都能登录。对于前 100 用户阶段，这是最简单的方式。

4. 点击 **「Next」**

### Step 3.4：跳过额外设置

在「Additional settings」页面：
- 什么都不用改
- 直接点击页面底部的 **「Add application」**

**完成！** 你会看到应用创建成功的页面。

---

## 四、验证配置

### 验证 1：访问 Dashboard

1. 打开浏览器（建议用隐私/无痕模式，确保没有登录状态）
2. 访问：**https://awesome-toolkit.pages.dev/dashboard**
3. 你应该被**自动跳转**到一个 Cloudflare Access 登录页面
4. 页面上会显示 `Awesome Toolkit Dashboard` 和一个 Google 登录按钮
5. 点击 **Google** → 选择你的 Google 账号 → 授权

登录成功后，你会被重定向回 `/dashboard` 页面，这次可以看到完整的控制台界面。

### 验证 2：检查 Header 注入

1. 按 F12 打开开发者工具
2. 切换到 **Network**（网络）标签
3. 刷新 Dashboard 页面
4. 找到对 `/api/auth/upgrade` 的请求
5. 在 Request Headers 中确认能看到：
   ```
   Cf-Access-Authenticated-User-Email: your-email@gmail.com
   ```

如果有这个 header，说明配置完全正确。

### 验证 3：确认公开页面不受影响

访问以下页面，确保**不需要登录**就能看到：

- https://awesome-toolkit.pages.dev/ — 首页
- https://awesome-toolkit.pages.dev/about — 关于页
- https://awesome-toolkit.pages.dev/deploy — 部署列表
- https://awesome-toolkit.pages.dev/tool/immich — 工具详情

如果这些页面直接显示内容（不跳转登录），说明保护范围配置正确。

---

## 五、常见问题

### Q1：登录后 Dashboard 仍然显示「加载中...」？

可能原因：
- Cloudflare Access 的 DNS 记录还未生效（等待 1-2 分钟）
- 浏览器缓存了旧的页面，用无痕模式重新试试
- 检查配置的路径是否正确

### Q2：不想让所有人登录，只想让我自己登录？

在 Step 3.3 配置策略时，把 Include 规则改为：
- Selector: `Emails`
- Value: 填你自己的邮箱地址，如 `your-email@gmail.com`

这样只有你这个邮箱可以登录。

### Q3：用户从首页点「控制台」链接时会发生什么？

如果用户未登录，点击导航栏的「控制台」→ 被 Access 拦截 → 跳转到登录页 → 登录成功 → 回到 Dashboard。

如果用户已登录（24 小时内），直接进入 Dashboard，无需再次登录。

### Q4：不配置 Access 会怎样？

Dashboard 页面会一直显示「加载中...」。API 会返回 401 错误。用户无法管理自己的服务器和部署历史。

**但首页浏览、工具详情查看、对比等功能完全不受影响。**

---

## 六、完成后的效果

| 页面 | 配置前 | 配置后 |
|------|--------|--------|
| 首页 `/` | ✅ 正常 | ✅ 正常（不受影响） |
| 工具详情 `/tool/immich` | ✅ 正常 | ✅ 正常（不受影响） |
| 部署列表 `/deploy` | ✅ 正常 | ✅ 正常（不受影响） |
| 部署向导 `/deploy/n8n/wizard` | ⚠️ 未保护 | 🔐 需要登录 |
| 控制台 `/dashboard` | ❌ 加载中 | ✅ 完整控制台 |
| 服务器 API `/api/servers` | ❌ 401 错误 | ✅ 按用户隔离 |

---

## 七、费用

- **完全免费**：50 个用户以内，Cloudflare Access 不收取任何费用
- **无时间限制**：不存在「试用期 30 天」的说法
- **超过 50 用户**：$3/用户/月。但对于前 100 用户测试阶段，你的实际登录用户数大概率不超过 20 个

---

> **配置时间：约 15 分钟 | 难度：⭐（下载即用，无需命令行） | 下一步：验证 Dashboard 和控制台功能正常**
