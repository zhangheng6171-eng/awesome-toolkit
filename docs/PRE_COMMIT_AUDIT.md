# Pre-Commit Audit

> 生成时间：2026-06-04
> 目标提交：feat: multi-platform support, device recommendations and analytics

---

## 一、本次提交包含内容

### 功能模块（4 个阶段）

| 阶段 | 内容 | 文件数 |
|------|------|--------|
| A — 多平台支持 | platforms/platform_instructions/system_requirements 字段，PlatformSelector 组件 | 5 |
| B — 设备推荐 | DeviceWizard 组件，recommendForDevice 引擎，/recommendations 页面，beginner_friendly | 5 |
| C — Analytics | analytics.ts 客户端，2 个 API 端点，AnalyticsDashboard，TrackToolView，6 种事件埋点 | 5 |
| D — SEO/Beta Launch | JSON-LD 结构化数据，全站 metadata/canonical/OG，favicon，OG 图片，发布文案 | 12 |

### 变更统计

| 类型 | 数量 | 说明 |
|------|------|------|
| 修改文件 | 14 个 | tools.json (+1455行), tools.ts (+140行), page.tsx 拆分, sitemap.xml 更新, 各页面 metadata 等 |
| 新增文件 | 33 个 | 4 组件 + 2 API + 12 文档 + 5 layout + 3 页面 + 3 public + 2 脚本 + 1 lib + 1 client 组件 |
| 总变更 | +1,794 / -368 行 | 净增 1,426 行 |

### 文件分类明细

| 分类 | 文件 |
|------|------|
| **核心数据** | `src/data/tools.json` (+1455行：platforms, system_requirements, platform_instructions) |
| **业务逻辑** | `src/lib/tools.ts` (+140行：recommendForDevice 引擎，类型定义) |
| **客户端追踪** | `src/lib/analytics.ts`（新增：事件队列 + session + keepalive + retry） |
| **UI 组件** | DeviceWizard.tsx, PlatformSelector.tsx, JsonLd.tsx, TrackToolView.tsx（4 个新增） |
| **页面拆分** | HomeClient.tsx, AnalyticsDashboard.tsx, RecommendationsClient.tsx（3 个新增） |
| **新页面** | /analytics, /recommendations（2 个路由新增） |
| **SEO 完善** | about/pricing/compare/feedback layout.tsx（4 个 layout 新增），sitemap 更新 |
| **API 端点** | functions/api/analytics/track.ts, stats.ts（2 个新增） |
| **静态资源** | favicon.svg, og-image.svg, og-image.png（3 个新增） |
| **数据脚本** | add-platform-instructions.cjs, add-system-requirements.cjs（2 个新增） |
| **配置文件** | wrangler.toml（KV ID 更新为真实值） |
| **部署页面** | deploy/page.tsx, deploy/[id]/page.tsx, deploy/[id]/wizard（metadata + JSON-LD） |
| **项目文档** | 12 个 .md（审计报告、路线图、策略文档等） |

---

## 二、风险检查结果

| 检查项 | 结果 | 详情 |
|--------|------|------|
| 临时文件 | ✅ 通过 | 无 ~/.tmp/.bak/.swp 文件 |
| 测试文件 | ✅ 通过 | 无 .test./.spec./__tests__ 文件 |
| 构建产物 | ✅ 通过 | `out/` 和 `node_modules/` 已被 .gitignore 排除 |
| 环境变量文件 | ✅ 通过 | 无 .env/.env.local 文件 |
| API Key / Token | ✅ 通过 | 无硬编码密钥。agent.py 动态生成 Token，wrangler.toml KV ID 为非机密标识符 |
| 私钥 / 证书 | ✅ 通过 | 无 PEM/DER 私钥文件 |
| 密码 | ✅ 通过 | 无硬编码密码 |
| 浏览器 API 安全 | ✅ 通过 | analytics.ts 所有浏览器 API 调用有 `typeof window !== 'undefined'` 守卫 |
| .gitignore 覆盖 | ✅ 通过 | out/、node_modules/、.env、.env.local、.next/、.DS_Store 均已排除 |

### 低风险注意项

| 项 | 风险等级 | 说明 |
|----|----------|------|
| wrangler.toml KV ID | 低 | `b8e7d7da3e3c...` 和 `c62ce2947ece...` 为 Cloudflare KV Namespace ID，非机密。是否公开取决于 Cloudflare 账户安全配置 |
| 12 个文档文件 | 低 | 部分为策略/计划类文档，体积较大。长期建议精简 |

---

## 三、建议提交范围

**推荐：全部提交（47 个文件）**

理由：
1. 所有文件属于 4 个关联功能阶段（多平台 → 设备推荐 → Analytics → SEO），逻辑上构成一个完整的功能批次
2. 无安全风险、无临时文件、无构建产物
3. 分离提交会增加破坏性 — 类型定义、数据字段、UI 组件相互依赖

### 不推荐拆分的理由
- tools.json 的 platforms/system_requirements 字段与 tools.ts 的 recommendForDevice 类型定义相互依赖
- analytics.ts 与 TrackToolView/DeviceWizard/WizardClient 的事件埋点相互依赖
- layout.tsx metadata 与 JsonLd.tsx 结构化数据属于同一 SEO 阶段
- 拆分提交会破坏构建（TypeScript 类型交叉引用）

---

> **结论：47 个文件可以安全提交。风险检查全部通过。**
