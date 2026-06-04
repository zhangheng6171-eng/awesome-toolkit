# Analytics 验证报告

> 验证日期：2026-06-04
> 验证方式：完整代码审计（客户端 → API → KV → Dashboard）
> 生产状态：/api/analytics/* 未部署到生产环境（代码在本地 commit `66ea041`）

---

## 一、事件触发验证

### 6 种事件触发矩阵

| 事件 | 触发代码位置 | 触发方式 | 触发条件 | 延迟 | 重试 |
|------|-------------|----------|----------|------|------|
| `page_view` | `analytics.ts:78` | 模块 import 时自动执行 | 仅首次加载（模块级代码） | 2s 批量 | ❌ 无 |
| `wizard_open` | `DeviceWizard.tsx:28` | useEffect on mount | 进入 /recommendations | 2s 批量 | ❌ 无 |
| `device_select` | `DeviceWizard.tsx:84` | onClick handler | 用户点击设备选项 | 2s 批量 | ❌ 无 |
| `tool_click` | `TrackToolView.tsx:9` | useEffect on mount | 进入 /tool/[id] | 2s 批量 | ❌ 无 |
| `deploy_start` | `WizardClient.tsx:58` | useEffect on mount | 进入 /deploy/[id]/wizard | 2s 批量 | ❌ 无 |
| `deploy_complete` | `WizardClient.tsx:178` | 条件执行 | Agent 返回成功 | **立即发送** | ❌ 无 |

### 触发性评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 代码正确性 | 8/10 | 6 种事件代码逻辑正确 |
| 触发时机 | 7/10 | deploy_complete 立即发送策略正确 |
| 数据完整性 | 4/10 | page_view 存在严重漏报（见下文） |
| 错误处理 | 3/10 | 静默失败，无任何日志输出 |

---

## 二、发现的问题

### 🔴 严重问题

#### 问题 1：page_view 严重漏报

**根因**：`analytics.ts` 使用模块级自动追踪（line 77-79）：

```typescript
if (typeof window !== 'undefined') {
  track('page_view');
}
```

这段代码只在模块首次被 import 时执行一次。Next.js 的客户端路由不重新加载模块。

**影响范围**：

| 页面 | 是否导入 analytics.ts | page_view 是否触发 |
|------|----------------------|-------------------|
| `/` (首页) | ❌ HomeClient.tsx **未导入** | ❌ **不触发** |
| `/tool/[id]` | ✅ TrackToolView → analytics | ✅ 触发 |
| `/deploy/[id]/wizard` | ✅ WizardClient → analytics | ✅ 触发 |
| `/recommendations` | ✅ DeviceWizard → analytics | ✅ 触发 |
| `/about` | ❌ | ❌ **不触发** |
| `/pricing` | ❌ | ❌ **不触发** |
| `/compare` | ❌ | ❌ **不触发** |
| `/deploy` | ❌ | ❌ **不触发** |
| `/feedback` | ❌ | ❌ **不触发** |
| `/dashboard` | ❌ | ❌ **不触发** |

**实际漏报率**：70-80% 的页面浏览不会产生 page_view 事件。首页（最大流量入口）完全无数据。

**影响**：整个漏斗的基数（page_view）严重偏低。所有以 page_view 为分母的转化率指标全部失真。

**修复方向**（不要求改代码，仅记录）：应在 `layout.tsx` 中统一添加 page_view 追踪，或在每个页面的 `useEffect` 中调用 `track('page_view')`。

#### 问题 2：失败事件不可见

`deploy_complete` 仅在 Agent 返回成功时触发（WizardClient.tsx:178）。所有部署失败的用户行为完全不可见。

**影响**：无法计算「部署失败率」。无法判断失败原因（Agent 连接失败 vs Docker 错误 vs 配置错误）。

#### 问题 3：stats API 列表中未处理分页

`stats.ts:41`：`const list = await kv.list({ prefix: 'analytics:' })`

Cloudflare KV `list()` 默认最多返回 1000 条。如果事件超过 1000 条，统计将不完整。

**影响**：随着用户增长，达到 1000 事件后统计数据失真。以 page_view 为例，如果访问量较大，1-2 天内就会达到这个阈值。

---

### 🟡 中等问题

#### 问题 4：stats API 性能随数据量线性退化

`stats.ts` 对每个前缀最多读取 200 条事件值（每类 200 次 KV get）。6 类（tool/device/page）× 200 = 最多 1200 次 KV 读取。加上 20 条最近事件 = 1220 次。

目前数据量为 0（未部署），尚不是问题。但数据量增大后，Dashboard 加载时间会线性增长。

#### 问题 5：双端 page_view 重叠

如果用户在 `/tool/ollama` 页面首次加载，会同时触发：
- `analytics.ts` 模块 import → `page_view`（页面路径为 `/tool/ollama`）
- `TrackToolView` useEffect → `tool_click`（tool_id 为 ollama）

这两个事件有重叠含义，但这是设计范围内的（page_view 和 tool_click 本身就不是互斥的）。不算 bug，但可能引起困惑。

#### 问题 6：无数据保留策略实现

代码中的 TTL 30 天是通过 `expirationTtl` 设置的，但 KV 的 TTL 只保证「大约在这个时间后过期」，不保证精确。同时，stats API 读取时不过滤过期事件（KV 过期是自动的），所以不会读到旧数据。✅ 可接受。

---

### 🟢 低影响问题

#### 问题 7：失败重试队列可能无限增长

```typescript
// analytics.ts:44-46
.catch(() => {
  if (queue.length < 100) queue.push(...batch);
});
```

如果 API 长时间不可用，失败事件会堆积在内存队列中。当 `queue.length >= 100` 时新事件直接丢失。

#### 问题 8：模块级 setTimeout 泄漏

```typescript
// analytics.ts:69-72
timer = setTimeout(() => {
  flush();
  timer = null;
}, 2000);
```

如果用户在 2 秒窗口内关闭页面，最后一批事件会因 `keepalive: true` 仍然发送，但 `timer` 没有在 `beforeunload` 中清理。

#### 问题 9：session_id 使用 base36 编码

```typescript
sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
```

base36 编码在部分 KV key 排序场景下可能产生意外结果（因为字母 a-z 排在数字 0-9 之后）。但由于 session_id 不做排序查询，影响可忽略。

---

## 三、漏斗正确性验证

### 漏斗定义（ANALYTICS_PLAN.md）

```
首页浏览 (page_view)     → 100%
打开推荐向导 (wizard_open) → ≥ 15%
选择设备 (device_select) → ≥ 70%
点击工具详情 (tool_click) → ≥ 40%
开始部署 (deploy_start)   → ≥ 25%
部署完成 (deploy_complete) → ≥ 70%
总转化率                  → ≥ 2%
```

### 漏斗数据可靠性

| 步骤 | 计数来源 | 可靠性 | 说明 |
|------|---------|--------|------|
| page_view | `prefixCounts['pv']` | ❌ 不可靠 | **page_view 漏报 70-80%** |
| wizard_open | `prefixCounts['wiz']` | ✅ 可靠 | 每次进入 /recommendations 触发 |
| device_select | `prefixCounts['dev']` | ✅ 可靠 | 每次点击设备选项触发 |
| tool_click | `prefixCounts['tool']` | ✅ 可靠 | 每次进入工具详情页触发 |
| deploy_start | `prefixCounts['deps']` | ✅ 可靠 | 每次进入部署向导触发 |
| deploy_complete | `prefixCounts['done']` | ⚠️ 部分可靠 | 仅成功事件，无失败数据 |

### 漏斗判定：❌ 当前不可用于决策

由于 page_view 的严重漏报，漏斗的第一步基数就错了。所有后续转化率（如 wizard_open / page_view）都会因为分母偏低而**虚高**。

**实际示例**：
- 真实场景：100 人访问首页，15 人打开推荐向导
- Analytics 统计：20 人 page_view（因为首页未追踪，只有其他页面的 20 次 page_view），15 人 wizard_open
- 显示转化率：15/20 = **75%**（实际：15/100 = **15%**）

**5 倍偏差。漏斗数据在修复 page_view 之前完全不可信。**

---

## 四、Dashboard 验证

### Dashboard 组件审计

| 功能 | 状态 | 说明 |
|------|------|------|
| 加载状态 | ✅ | 显示「加载中...」 |
| 错误状态 | ✅ | 显示错误信息 |
| 空数据状态 | ✅ | 「暂无数据」提示 |
| 自动刷新 | ✅ | 30s 间隔 |
| 手动刷新 | ✅ | 刷新按钮 |
| 概要卡片 | ✅ | 总事件/独立会话/页面浏览/工具点击 |
| 转化漏斗 | ⚠️ | 可见但数据不可靠（page_view 漏报） |
| 设备分布 | ✅ | Top N 设备条形图 |
| 热门工具 | ✅ | Top 10 工具链接列表 |
| 页面分布 | ✅ | Top 10 页面计数器 |
| 事件类型分布 | ✅ | 条形图 |
| 实时事件流 | ✅ | 最近 20 条时间戳 |

**Dashboard 整体评分：代码实现 8/10，数据可靠性 4/10（受 page_view 漏报拖累）**

---

## 五、与 ANALYTICS_PLAN.md 的对齐情况

| PLAN 要求 | 实现状态 | 偏差 |
|-----------|---------|------|
| 6 种事件追踪 | ✅ 全部实现 | — |
| 批量发送（2s 延迟） | ✅ 已实现 | ✅ |
| session_id localStorage | ✅ 已实现 | — |
| keepalive fetch | ✅ 已实现 | — |
| KV 30 天 TTL | ✅ 已实现 | — |
| 漏斗 Dashboard | ✅ 已实现 | page_view 数据源有问题 |
| 热门设备/工具/页面 | ✅ 已实现 | — |
| 实时事件流 | ✅ 已实现 | — |
| 失败重试 | ⚠️ 仅队列重试 | 无持久化重试 |
| 无 PII 收集 | ✅ 符合 | — |

---

## 六、综合评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 代码架构 | 8/10 | 客户端→API→KV→Dashboard 链路清晰完整 |
| 事件触发 | 5/10 | 5/6 事件触发正确，page_view 严重漏报 |
| 数据可靠性 | 4/10 | 漏斗数据不可信，page_view 漏报 70-80% |
| API 性能 | 6/10 | 当前可接受，数据量增大后需优化 |
| Dashboard UX | 8/10 | 功能完整，加载/错误/空状态处理得当 |
| 部署状态 | 0/10 | **API 未部署到生产** |

### 建议

**修复 page_view 是上线 Analytics 的唯一 blocker**。在 page_view 修复之前：
- 不要依赖漏斗转化率做决策
- 仅 device_select、tool_click、deploy_start、deploy_complete 的绝对计数可信
- 可以使用 tool_click / device_select 作为替代转化率度量（如：多少人看了工具后开始部署）

---

> **Analytics Ready Score: 5/10 — 代码完整但数据不可靠。page_view 漏报是唯一但致命的 blocker。不修复则 Analytics 无法用于决策。**
