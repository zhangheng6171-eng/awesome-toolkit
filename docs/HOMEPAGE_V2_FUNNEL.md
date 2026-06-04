# 首页 V2 转化漏斗

> 日期：2026-06-04
> 目标：建立从首页到部署完成的完整漏斗，检查每一步的 Analytics 覆盖

---

## 一、漏斗定义

### 1.1 全漏斗（8 步）

```
Step 1: Homepage View
  │  事件: page_view (page=/)
  │  覆盖: ✅ PageViewTracker
  │
  ▼
Step 2: Hero CTA Click
  │  事件: ✅ hero_cta_click (location=homepage_hero)
  │  直接追踪, 可用于 A/B 测试
  │
  ▼
Step 2b: Scene Card Click
  │  事件: ✅ scene_card_click (tool_id=xxx, scene_type=xxx)
  │  可区分 4 种场景类型
  │
  ▼
Step 3: Recommendation Wizard Open
  │  事件: ✅ wizard_open (page=/recommendations)
  │  备注: 也会触发 page_view
  │
  ▼
Step 4: Device Selected
  │  事件: ✅ device_select (device=windows|mac|linux|nas)
  │
  ▼
Step 5: Recommendation Results Viewed
  │  事件: ✅ results_viewed (platform=xxx, recommendation_count=N)
  │  首次展示推荐结果时触发
  │
  ▼
Step 6: Tool Detail Page View
  │  事件: ✅ tool_click (tool_id=xxx) + page_view (page=/tool/[id])
  │  来源: 推荐结果 / 场景卡 / 搜索 / 热门标签 / 直接浏览
  │
  ▼
Step 7: Deploy Page View  
  │  事件: ✅ page_view (page=/deploy/[id])
  │  备注: 无专用事件名，通过 page 字段过滤
  │
  ▼
Step 8: Deploy Start
  │  事件: ✅ deploy_start (tool_id=xxx)
  │
  ▼
Step 9: Deploy Complete
  │  事件: ✅ deploy_complete (tool_id=xxx)
```

### 1.2 场景卡路径（替代 Step 2-5）

```
Step 2b: Scene Card Click
  │  事件: ❌ 无直接事件
  │  间接: tool_click (referrer=/) 
  │
  ▼
Step 6: Tool Detail Page View
  │  事件: ✅ tool_click + page_view
  │
  ▼
Step 7: Deploy Page View
  │  事件: ✅ page_view (page=/deploy/[id])
  │
  ...
```

### 1.3 搜索/浏览路径（替代 Step 2-5）

```
Step 2c: Hot Tag Click / Search / Browse
  │  事件: ❌ 无直接事件
  │  间接: tool_click (referrer=/) 
  │
  ▼
Step 6: Tool Detail Page View
  │  事件: ✅ tool_click + page_view
  │
  ...
```

---

## 二、每步覆盖率分析

| Step | 有直接事件 | 可间接推断 | 精度 | 可否用于 A/B |
|------|----------|----------|------|-------------|
| 1. Homepage View | ✅ `page_view` | — | 100% | ✅ |
| 2. Hero CTA Click | ✅ `hero_cta_click` | — | 100% | ✅ |
| 2b. Scene Card Click | ✅ `scene_card_click` | — | 100% | ✅ |
| 3. Wizard Open | ✅ `wizard_open` | — | 100% | ✅ |
| 4. Device Selected | ✅ `device_select` | — | 100% | ✅ |
| 5. Results Viewed | ✅ `results_viewed` | — | 100% | ✅ |
| 6. Tool Detail View | ✅ `tool_click` | — | 100% | ✅ |
| 7. Deploy Page View | ⚠️ 仅有 `page_view` | 需通过 `page=/deploy/[id]` 过滤 | 90% | ✅ |
| 8. Deploy Start | ✅ `deploy_start` | — | 100% | ✅ |
| 9. Deploy Complete | ✅ `deploy_complete` | — | 100% | ✅ |

---

## 三、缺失埋点清单

### ✅ 已实现（本次 P0 Enhancement — 3 个）

| # | 事件名 | 触发位置 | 属性 | 状态 |
|---|--------|---------|------|------|
| 1 | `hero_cta_click` | Hero 主按钮 `🚀 告诉我用什么设备` | `{location: 'homepage_hero'}` | ✅ 已实现 |
| 2 | `scene_card_click` | 4 张场景卡片的点击 | `{tool_id, scene_type: 'photo_backup'|'ai_automation'|'password_manager'|'pdf_tools'}` | ✅ 已实现 |
| 3 | `results_viewed` | 推荐结果首次展示 | `{platform, recommendation_count}` | ✅ 已实现 |

### 🟡 P1 — 影响漏斗精度（4 个）

| # | 事件名 | 触发位置 | 属性 | 优先级 |
|---|--------|---------|------|--------|
| 4 | `windows_entry_click` | Windows 入口链接 | `{source: 'windows_entry'}` | 🟡 P1 |
| 5 | `hot_tag_click` | 热门标签按钮 | `{tag: '照片备份'|...}` | 🟡 P1 |
| 6 | `secondary_scroll_click` | 「也可以先看看有哪些工具 →」 | `{source: 'secondary_cta'}` | 🟡 P1 |
| 7 | `waitlist_submit` | 邮件订阅提交成功 | `{source: 'homepage'}` | 🟡 P1 |

### 🟢 P2 — 锦上添花（1 个）

| # | 事件名 | 触发位置 | 属性 | 优先级 |
|---|--------|---------|------|--------|
| 8 | `deploy_page_view` | 部署详情页挂载 | `{tool_id}` | 🟢 P2 |

---

## 四、现有 stats API 能否支撑漏斗

### 4.1 按现有事件可计算的漏斗指标

```
Funnel (approximate, using indirect inference):

Step 1: page_view (page=/)                                        ← 分母
Step 2: wizard_open (total)                                      ← 无法区分来源
Step 3: device_select (by device type)                            ← 可按设备分
Step 4: tool_click (total)                                       ← 无法区分来源
Step 5: deploy_start (total)                                     ← 可计算
Step 6: deploy_complete (total)                                  ← 可计算

推算转化率:
  wizard_open / page_view(/)  ≈  Hero CTA 点击率 (粗略，含噪音)
  device_select / wizard_open ≈  向导完成率
  tool_click / page_view(/)   ≈  工具页到达率 (粗略，含所有路径)
  deploy_start / tool_click   ≈  部署意愿率
  deploy_complete / deploy_start ≈ 部署成功率
```

### 4.2 无法计算的指标

| 指标 | 阻塞原因 |
|------|---------|
| Hero CTA 点击率 vs 场景卡点击率 | 无来源区分 |
| 各场景卡 CTR 排名 | 无场景卡点击事件 |
| Windows 入口使用率 | 无独立事件（与 Hero CTA 混淆） |
| 热门标签 CTR | 无标签点击事件 |
| 搜索结果 → 工具页转化 | tool_click 无来源信息 |
| Hero 文案 A/B 对照 | 无 CTA 点击事件则无法对比 |

---

## 五、修复建议

### 5.1 最小可行修复（30 分钟）

在 `HomeClient.tsx` 中添加 2 个 P0 事件即可支撑 A/B 测试：

```tsx
// In the Hero CTA Link:
<Link
  href="/recommendations"
  onClick={() => track('hero_cta_click', { source: 'hero' })}
  ...
>

// In each scene card Link:
<Link
  href={`/tool/${scene.toolId}`}
  onClick={() => track('scene_card_click', { tool_id: scene.toolId, source: 'scene_card' })}
  ...
>
```

### 5.2 完整修复（1.5 小时）

加上 4 个 P1 事件，覆盖全部新入口。

### 5.3 不修复的替代方案

使用现有 `page_view` + `referrer` 推断来源：
- `wizard_open` 且 `page=/recommendations` 且上一个页面是 `/` → 来自 Hero CTA 或 Windows 入口
- `tool_click` 且上一个页面是 `/` → 来自场景卡或搜索或热门标签
- 精度约 70%，无法区分具体入口

---

## 六、漏斗数据看板（建议 SQL）

部署后用以下伪查询验证漏斗：

```
SELECT
  COUNT(DISTINCT CASE WHEN event='page_view' AND page='/' THEN session_id END) AS step1_homepage,
  COUNT(DISTINCT CASE WHEN event='wizard_open' THEN session_id END) AS step3_wizard,
  COUNT(DISTINCT CASE WHEN event='device_select' THEN session_id END) AS step4_device,
  COUNT(DISTINCT CASE WHEN event='tool_click' THEN session_id END) AS step6_tool,
  COUNT(DISTINCT CASE WHEN event='deploy_start' THEN session_id END) AS step8_deploy_start,
  COUNT(DISTINCT CASE WHEN event='deploy_complete' THEN session_id END) AS step9_deploy_complete
FROM events
WHERE timestamp >= '2026-06-04'
```

预期漏斗形状（V2 上线后）：
```
Step 1: 100% (Homepage)
Step 3: ~40% (Wizard Open — 来自 Hero CTA)
Step 4: ~30% (Device Selected)
Step 6: ~55% (Tool Detail — Hero CTA + 场景卡 + 搜索汇总)
Step 8: ~10% (Deploy Start)
Step 9: ~3%  (Deploy Complete)
```

---

> **结论：8 步漏斗中 5 步有直接事件，3 步缺失。补充 2 个 P0 事件即可支撑 A/B 测试。建议在 A/B 测试前完成。**
