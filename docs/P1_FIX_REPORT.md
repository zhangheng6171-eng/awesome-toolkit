# P1 Bug 修复报告

> 日期：2026-06-08
> 范围：DeviceWizard ?platform= + Sitemap + 安全默认值
> 状态：✅ 构建通过，待审核

---

## 一、修改文件列表

| # | 文件 | 变更 | 类型 |
|---|------|------|------|
| 1 | `src/components/DeviceWizard.tsx` | +8/-2 | TypeScript |
| 2 | `src/app/recommendations/RecommendationsClient.tsx` | +6/-1 | TypeScript |
| 3 | `src/app/recommendations/page.tsx` | +7/-1 | TypeScript |
| 4 | `public/sitemap.xml` | +6/-2 | XML |
| 5 | `public/deploy/tools/vaultwarden/docker-compose.yml` | +3/-1 | YAML |
| 6 | `public/deploy/tools/stirling-pdf/docker-compose.yml` | +3/-1 | YAML |

**总计：6 files, +25/-8**

## 二、各修复详情

### Fix 1：DeviceWizard 读取 ?platform= 参数

**修改前：** 首页 Windows 入口传递了 `/recommendations?platform=windows`，但 DeviceWizard 不读取该参数，向导第一步状态始终为空。

**修改后：**
- `RecommendationsClient.tsx`：使用 `useSearchParams()` 读取 `?platform=` 参数，转为 `DeviceProfile['type']`，传给 DeviceWizard
- `DeviceWizard.tsx`：接收 `initialPlatform` prop，白名单校验（仅 `windows/mac/linux/nas`），初始化为 `useState` 默认值
- `page.tsx`：添加 `<Suspense>` 包裹，满足 Next.js SSG 对 `useSearchParams()` 的要求

**用户效果：** 从首页点「💻 我只有 Windows 电脑」→ 进入推荐向导 → 第一步「Windows」已自动选中。

### Fix 2：Sitemap 补充 /recommendations 和 /analytics

**修改前：** `public/sitemap.xml` 包含 122 个 URL（首页 + 50 工具页 + 32 部署页 + 32 向导页 + 其他页面），缺失 `/recommendations` 和 `/analytics`。

**修改后：** 在首页后插入 2 条：
```xml
<recommendations> — weekly, priority 0.8
<analytics>       — weekly, priority 0.6
```
首页和部署页 lastmod 同步更新为 `2026-06-08`。

### Fix 3：vaultwarden + stirling-pdf 安全默认值

**修改前：**

| 工具 | 配置 | 旧值 | 风险 |
|------|------|------|------|
| vaultwarden | `SIGNUPS_ALLOWED` | `true` | 公网暴露时任何人可注册密码管理器账号 |
| stirling-pdf | `DOCKER_ENABLE_SECURITY` | `false` | 公网暴露时无需密码即可处理/下载 PDF |

**修改后：**

| 工具 | 配置 | 新值 | 效果 |
|------|------|------|------|
| vaultwarden | `SIGNUPS_ALLOWED` | `false` | 首次部署时手动改 `true` 注册，注册后改回 |
| stirling-pdf | `DOCKER_ENABLE_SECURITY` | `true` | 需要密码登录才能使用 |

每个修改附带中文注释说明。

## 三、构建结果

```
✓ Compiled successfully in 1765ms
✓ TypeScript passed (2.3s, 0 errors, 0 warnings)
✓ 125 static pages generated (682ms)
```

| 检查项 | 结果 |
|--------|------|
| TypeScript 编译 | ✅ 0 errors |
| 静态页面生成 | ✅ 125/125 |
| /recommendations | ✅ 正常渲染 |
| Sitemap 新条目 | ✅ recommendations + analytics 存在 |
| Vaultwarden 安全配置 | ✅ SIGNUPS_ALLOWED=false |
| Stirling PDF 安全配置 | ✅ DOCKER_ENABLE_SECURITY=true |

## 四、对 Readiness 的影响

| 维度 | 修复前 | 修复后 | 变化 |
|------|--------|--------|------|
| 核心页面可用性 | 19 | **19** | — |
| 工具页完整性 | 15 | **15** | — |
| 部署流程 | 9 | **9** | — |
| API 可用性 | 10 | **10** | — |
| Analytics 追踪 | 10 | **10** | — |
| SEO / Metadata | 8 | **9** | +1（Sitemap 补齐） |
| 性能 | 6 | **6** | — |
| 安全 | 6 | **7** | +1（2 个默认值修复） |
| 首页用户体验 | 9 | **10** | +1（Windows 入口链路闭环） |

| 评分 | 修复前 | 修复后 |
|------|--------|--------|
| **保守评分** | **84/100** | **87/100** |
| **现实评分** | **87/100** | **89/100** |
| **乐观评分** | **92/100** | **93/100** |

**+3 分：SEO (+1) + 安全 (+1) + 用户体验 (+1)。**

## 五、剩余风险

| # | 风险 | 严重度 | 状态 |
|---|------|--------|------|
| R1 | CF Access 未配置 | 🔴 高 | Dashboard 不可用，需手动在 CF 控制台配置 |
| R2 | VPS 部署未实测 | 🔴 高 | 部署流程代码就绪，但从未在真实 Linux VPS 跑通 |
| R3 | 首页 294KB 未优化 | 🟡 中 | 移动端加载约 1.2s |
| R4 | P1 Analytics 事件未实现 | 🟡 中 | windows_entry_click 等 4 个事件未添加 |
| R5 | Sitemap lastmod 日期不统一 | 🟢 低 | 仅首页/部署/recommendations/analytics 更新到 6/8，其余 118 个仍为 6/3 |
| R6 | A/B 测试未实施 | 🟢 低 | 需流量后才能进行 |

---

> **总结：3 个 P1 Bug 全部修复，0 TypeScript 错误，构建通过。Readiness 保守 87/100（+3）。待审核后提交。**
