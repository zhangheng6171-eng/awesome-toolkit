# 部署与 Affiliate 配置指引

## 一、部署到 Cloudflare Pages

### 前提条件
- 已注册 Cloudflare 账号（cloudflare.com）
- 已安装 Node.js 20+
- 仓库已推送到 GitHub

### 步骤（5 分钟）

**1. 获取 Cloudflare API Token**
- 登录 Cloudflare → 右上角头像 → My Profile
- 左侧 API Tokens → Create Token → 选 "Workers" 模板
- Account Resources 选你的账户，Zone Resources 选 "All zones"
- 复制生成的 Token

**2. 获取 Account ID**
- Cloudflare 仪表盘首页 → 右侧 "API" 区域 → 复制 Account ID

**3. 在 GitHub 设置 Secrets**
- 你的 GitHub 仓库 → Settings → Secrets and variables → Actions
- 新增两个 Repository secrets：
  - `CLOUDFLARE_API_TOKEN` = 第 1 步的 Token
  - `CLOUDFLARE_ACCOUNT_ID` = 第 2 步的 Account ID

**4. 推送代码触发部署**
```bash
git add -A
git commit -m "feat: 一键部署 MVP + 工具对比功能"
git push origin main
```

**5. 查看部署状态**
- GitHub 仓库 → Actions 标签
- 等待 deploy-cloudflare 工作流完成
- 成功后访问 https://awesome-toolkit.pages.dev

### 手动部署（不用 GitHub Actions）
```bash
npm run build
npx wrangler pages deploy out --project-name=awesome-toolkit
# 按提示输入 Cloudflare API Token
```

---

## 二、Affiliate 链接替换

### 需要替换的文件

| 文件 | 行/位置 | 说明 |
|------|---------|------|
| `src/app/deploy/[id]/page.tsx` | 阿里云/腾讯云/Vultr 链接 | 每个部署详情页的服务器推荐 |
| `src/app/deploy/page.tsx` | 可加服务器推荐区块 | 部署列表页 |

### 阿里云推广

1. **注册推广联盟**：访问 https://promotion.aliyun.com/ 注册
2. **获取推广链接**：后台 → 推广管理 → 获取链接
3. **替换**：把 `https://www.aliyun.com/product/swas` 替换为你的推广链接
4. **佣金比例**：约 5%-15%，轻量服务器年付最高 ¥35/单

### 腾讯云推广

1. **注册推广联盟**：访问 https://cloud.tencent.com/act/partner/cps 注册
2. **获取推广链接**：后台 → 推广商品 → 云服务器
3. **替换**：把 `https://cloud.tencent.com/product/lighthouse` 替换为你的推广链接
4. **佣金比例**：约 10%-20%

### Vultr（国外 VPS）

1. **注册 Affiliate**：访问 https://www.vultr.com/affiliate/ 注册
2. **获取推广链接**：后台 → Banners & Links
3. **替换**：把 `https://www.vultr.com/` 替换为你的推广链接
4. **佣金**：新用户注册并付费后，首充的 50%（跟踪 12 个月）

### 快速替换命令

在 `src/app/deploy/[id]/page.tsx` 中搜索以下代码块，替换三个链接：

```tsx
// 第 85-105 行附近
<a href="https://www.aliyun.com/product/swas" ...>阿里云轻量服务器</a>
<a href="https://cloud.tencent.com/product/lighthouse" ...>腾讯云轻量服务器</a>
<a href="https://www.vultr.com/" ...>Vultr（国外VPS）</a>
```

---

## 三、AI 描述生成脚本

### 使用方法

```bash
# 试运行（不修改文件，看看效果）
ANTHROPIC_API_KEY=sk-ant-xxx node scripts/generate-descriptions.mjs --dry-run

# 正式运行（只改进短描述 <50 字）
ANTHROPIC_API_KEY=sk-ant-xxx node scripts/generate-descriptions.mjs

# 同时改进使用步骤
ANTHROPIC_API_KEY=sk-ant-xxx node scripts/generate-descriptions.mjs --with-steps

# 强制重写所有描述
ANTHROPIC_API_KEY=sk-ant-xxx node scripts/generate-descriptions.mjs --force
```

- API Key 获取：https://console.anthropic.com/
- 费用预估：30 个工具全量重写约 ¥3-5
- 结果也会保存到 `description-suggestions.json`

---

## 四、验证清单

部署完成后逐项检查：
- [ ] 首页加载正常，30 个工具卡片可见
- [ ] 搜索和筛选功能正常
- [ ] 点击工具卡片进入详情页正常
- [ ] 详情页「一键部署」CTA 卡片显示（限于 15 个可部署工具）
- [ ] 点击「开始部署」跳转到 /deploy/[id]
- [ ] 部署页复制按钮能正常工作
- [ ] /deploy 列表页显示 15 个工具
- [ ] 首页点「+ 对比」选 3 个工具 → 底部 CompareBar 出现
- [ ] 点「开始对比」→ /compare 页面 → 3 列横向对比表
- [ ] 推荐工具 Modal 点提交能跳转到正确 GitHub Issue URL
- [ ] docker-compose.yml 文件可直接访问（如 /deploy/tools/uptime-kuma/docker-compose.yml）
