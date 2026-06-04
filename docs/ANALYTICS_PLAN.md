# Analytics 事件追踪方案

> 用户行为数据收集与分析框架
> 目标：用数据验证推荐系统和部署流程是否有效

---

## 一、KPI 指标

### 核心指标（Phase 1 — 前 100 用户）

| 指标 | 公式 | 目标 | 说明 |
|------|------|------|------|
| **推荐向导使用率** | wizard_open / page_view | ≥ 15% | 首页有多少人打开了「我有什么设备」 |
| **设备选择完成率** | device_select / wizard_open | ≥ 70% | 进入向导后有多少人完成了设备选择 |
| **工具详情浏览率** | tool_click / page_view | ≥ 40% | 首页浏览者中有多少人点进工具详情 |
| **部署尝试率** | deploy_start / tool_click | ≥ 25% | 看完工具详情的人有多少尝试部署 |
| **部署成功率** | deploy_complete / deploy_start | ≥ 70% | 开始部署的人有多少成功完成 |
| **总体转化率** | deploy_complete / page_view | ≥ 2% | 访问者中有多少最终部署成功 |

### 辅助指标

| 指标 | 说明 |
|------|------|
| 独立会话数 | 去重后的访客数 |
| 热门设备 Top 3 | 用户选择最多的设备类型 |
| 热门工具 Top 10 | 被查看最多的工具 |
| 热门页面 Top 5 | 访问最多的页面 |
| 事件总数 | 所有事件的总和 |

---

## 二、事件定义

### 事件列表

| 事件名 | 触发时机 | 携带数据 |
|--------|----------|----------|
| `page_view` | 任何页面加载（自动） | `page`, `referrer`, `session_id`, `timestamp` |
| `wizard_open` | 用户进入 `/recommendations` 页面 | `page`, `session_id`, `timestamp` |
| `device_select` | 用户选择设备类型 | `page`, `device`, `session_id`, `timestamp` |
| `tool_click` | 用户进入 `/tool/[id]` 详情页 | `page`, `tool_id`, `session_id`, `timestamp` |
| `deploy_start` | 用户进入 `/deploy/[id]/wizard` | `page`, `tool_id`, `session_id`, `timestamp` |
| `deploy_complete` | Agent 返回部署成功 | `page`, `tool_id`, `session_id`, `timestamp` |

### 事件数据结构

```typescript
interface AnalyticsEvent {
  event: string;        // 事件名
  page: string;         // 当前页面路径
  tool_id?: string;     // 关联工具 ID
  device?: string;      // 设备类型 (windows/mac/linux/nas)
  referrer: string;     // 来源页面
  timestamp: number;    // Unix 毫秒时间戳
  session_id: string;   // 随机会话 ID（localStorage 持久化）
}
```

### KV 存储格式

- Key: `analytics:{prefix}:{timestamp}:{session_id}:{index}`
- TTL: 30 天
- Prefix 映射:
  - `pv` → page_view
  - `wiz` → wizard_open
  - `dev` → device_select
  - `tool` → tool_click
  - `deps` → deploy_start
  - `done` → deploy_complete
- Session 追踪: `analytics:session:{session_id}`

---

## 三、转化漏斗

### 主漏斗：浏览 → 部署

```
首页浏览 (page_view)                 100%
    │
    ├── 打开推荐向导 (wizard_open)    目标 ≥ 15%
    │       │
    │       └── 选择设备 (device_select)  目标 ≥ 70%
    │
    ├── 点击工具详情 (tool_click)      目标 ≥ 40%
    │       │
    │       └── 开始部署 (deploy_start)   目标 ≥ 25%
    │               │
    │               └── 部署完成 (deploy_complete)  目标 ≥ 70%
    │
    └── 总体: 100% → 2%+ 部署成功
```

### 每个步骤的流失原因假设

| 步骤 | 流失率假设 | 需要验证的假设 |
|------|-----------|---------------|
| 首页 → 向导 | 用户没看到入口 / 不感兴趣 | CTA 位置是否明显？文案是否有吸引力？ |
| 向导 → 设备选择 | 用户犹豫 / 不知道选什么 | 选项文字是否清晰？是否需要更多引导？ |
| 工具详情 → 部署 | 工具太复杂 / 没有服务器 / 不敢尝试 | 部署门槛是否太高？是否需要更多教程？ |
| 部署开始 → 完成 | Agent 连接失败 / 配置错误 | SSH 问题？Docker 未安装？端口冲突？ |

---

## 四、技术架构

### 客户端

```
src/lib/analytics.ts
├── track(event, props?)     — 队列事件
├── getSession()             — 获取/创建会话 ID
└── 自动 track('page_view')  — 首次 import 触发
```

- 事件批量发送（2 秒延迟或立即发送）
- 发送失败重试一次
- 使用 `navigator.sendBeacon`-style `keepalive: true`

### API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/analytics/track` | POST | 接收批量事件，写入 KV |
| `/api/analytics/stats` | GET | 返回聚合统计（计数 + Top N + 最近事件） |

### Dashboard

```
/analytics
├── 概要卡片（总事件/会话/浏览/工具点击）
├── 转化漏斗（6 步漏斗 + 步骤转化率）
├── 热门设备 / 热门工具 / 页面分布
├── 事件类型分布
└── 实时事件流（最近 20 条）
```

自动每 30 秒刷新。

---

## 五、前 100 用户观察计划

### 第 1-10 个用户：验证追踪是否正常

- [ ] page_view 事件是否正常触发
- [ ] 每个关键页面是否有事件
- [ ] 事件数据格式是否正确
- [ ] API 是否正常存储和返回
- [ ] Dashboard 数据是否准确

### 第 11-30 个用户：观察漏斗

- [ ] 漏斗在哪一步流失最多
- [ ] device_select 的设备分布
- [ ] tool_click Top 10 是否符合预期
- [ ] deploy_start 转化率是否 ≥ 20%

### 第 31-60 个用户：验证假设

- [ ] 推荐系统是否把用户导到了合适的工具
- [ ] 从推荐结果点击的工具 → 部署转化率
- [ ] 不同设备类型的部署成功率

### 第 61-100 个用户：优化决策

- [ ] 基于数据确定下一步优化优先级
- [ ] 如果部署成功率 < 50%：优先修复 Agent 和部署流程
- [ ] 如果向导使用率 < 10%：优化首页 CTA
- [ ] 如果某个设备类型特别多：优先做该平台的深度适配

---

## 六、数据解读示例

### 场景 A：高浏览量，低部署量

```
page_view: 500
tool_click: 200 (40%)
deploy_start: 20 (10%)   ← 流失点
deploy_complete: 5 (25%)
```

**解读：** 用户有兴趣看工具，但不愿意或不敢部署。
**行动：** 降低部署门槛，增加试用方式（在线 Demo、Sandbox）。

### 场景 B：部署率高，成功率低

```
page_view: 500
deploy_start: 150 (30%)
deploy_complete: 30 (20%)  ← 流失点
```

**解读：** 用户愿意尝试部署，但大部分失败了。
**行动：** 检查 Agent 日志、常见错误、增加故障排查指南。

### 场景 C：推荐向导很受欢迎

```
page_view: 500
wizard_open: 100 (20%)
device_select: 85 (85%)   ← 高完成率
```

**解读：** 推荐向导对用户有吸引力，且大部分完成了选择。
**行动：** 继续优化推荐结果质量，加入更多过滤维度。

---

## 七、隐私说明

- 不收集任何 PII（个人身份信息）
- session_id 是随机字符串，不关联用户账号
- 事件数据 30 天后自动过期
- 不发送到任何第三方分析服务
- 所有数据存储在自有 Cloudflare KV 中

---

> 生成时间：2026-06-03
> 下一步：等待真实用户数据，验证假设
