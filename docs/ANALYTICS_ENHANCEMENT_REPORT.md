# Analytics P0 Enhancement 报告

> 日期：2026-06-04
> 版本：P0 Enhancement（hero_cta_click + scene_card_click + results_viewed）
> 状态：✅ 构建通过，0 TypeScript Error，0 Build Error

---

## 一、修改文件

| # | 文件 | 变更类型 | 说明 |
|---|------|----------|------|
| 1 | `src/lib/analytics.ts` | 修改 | EventPayload 新增 4 个可选字段；track() props 扩展 |
| 2 | `src/app/HomeClient.tsx` | 修改 | 导入 track；FEATURED_SCENARIOS 新增 sceneType；Hero CTA 和场景卡添加 onClick 埋点 |
| 3 | `src/components/DeviceWizard.tsx` | 修改 | ResultsView 添加 results_viewed useEffect（useRef 防重复） |
| 4 | `functions/api/analytics/track.ts` | 修改 | TrackEvent 扩展；PREFIX_MAP 新增 3 个事件前缀 |
| 5 | `functions/api/analytics/stats.ts` | 修改 | Stats 接口扩展；funnel 新增 3 步；新增 scene_types 聚合 |
| 6 | `src/app/analytics/AnalyticsDashboard.tsx` | 修改 | Stats 接口同步；EVENT_LABELS 新增；漏斗步骤从 6 步扩展到 9 步；eventColor 新增 |

## 二、新增事件

### 2.1 hero_cta_click

| 属性 | 值 |
|------|-----|
| 事件名 | `hero_cta_click` |
| 触发位置 | `HomeClient.tsx:99` — Hero 主按钮 `<Link href="/recommendations">` |
| 触发时机 | 用户点击「🚀 告诉我用什么设备」 |
| 携带数据 | `{ location: 'homepage_hero' }` |
| KV 前缀 | `hero` |
| 用途 | 计算 Hero CTA CTR；A/B 测试 Hero 文案 |

### 2.2 scene_card_click

| 属性 | 值 |
|------|-----|
| 事件名 | `scene_card_click` |
| 触发位置 | `HomeClient.tsx:156` — 4 张场景卡片 `<Link href="/tool/[id]">` |
| 触发时机 | 用户点击任意场景卡片 |
| 携带数据 | `{ tool_id: 'immich'|'n8n'|'vaultwarden'|'stirling-pdf', scene_type: 'photo_backup'|'ai_automation'|'password_manager'|'pdf_tools' }` |
| KV 前缀 | `scene` |
| 用途 | 计算各场景卡片 CTR；判断哪个场景最受欢迎 |

### 2.3 results_viewed

| 属性 | 值 |
|------|-----|
| 事件名 | `results_viewed` |
| 触发位置 | `DeviceWizard.tsx:263` — ResultsView 组件首次挂载 |
| 触发时机 | 推荐结果列表首次展示（useRef 防重复） |
| 携带数据 | `{ platform: 'windows'|'mac'|'linux'|'nas', recommendation_count: N }` |
| KV 前缀 | `res` |
| 用途 | 计算向导完成率；按平台分析推荐工具数量分布 |

## 三、漏斗覆盖率变化

### 增强前

```
9 步漏斗：5 步有直接事件，4 步缺失
可 A/B 测试：否（来源无法区分）
```

### 增强后

```
9 步漏斗：8 步有直接事件，1 步通过 page_view 间接覆盖
可 A/B 测试：是（Hero CTA 和场景卡来源可区分）
```

### 各步骤覆盖

| 漏斗步骤 | 事件 | 增强前 | 增强后 |
|---------|------|--------|--------|
| 首页浏览 | `page_view` | ✅ | ✅ |
| Hero CTA 点击 | `hero_cta_click` | ❌ | ✅ |
| 场景卡片点击 | `scene_card_click` | ❌ | ✅ |
| 打开推荐向导 | `wizard_open` | ✅ | ✅ |
| 选择设备 | `device_select` | ✅ | ✅ |
| 查看推荐结果 | `results_viewed` | ❌ | ✅ |
| 点击工具详情 | `tool_click` | ✅ | ✅ |
| 开始部署 | `deploy_start` | ✅ | ✅ |
| 部署完成 | `deploy_complete` | ✅ | ✅ |

### Dashboard 变化

| 指标 | 增强前 | 增强后 |
|------|--------|--------|
| 漏斗步骤数 | 6 | 9 |
| 事件类型数 | 6 | 9 |
| scene_types 分析 | 无 | 有（4 种场景分别计数） |
| Hero CTA / 场景卡区分 | 否 | 是 |

## 四、部署前验证步骤

### 4.1 构建验证

```
npm run build
✓ Compiled successfully
✓ TypeScript passed
✓ 125 static pages generated
```

### 4.2 功能验证清单

- [ ] 部署到生产（`npx wrangler pages deploy`）
- [ ] 打开首页，点击「🚀 告诉我用什么设备」→ 验证 `hero_cta_click` 事件发送
- [ ] 点击 4 张场景卡片各一次 → 验证 `scene_card_click` 事件携带正确的 `tool_id` 和 `scene_type`
- [ ] 完成设备向导 4 步 → 验证 `results_viewed` 事件携带 `platform` 和 `recommendation_count`
- [ ] 打开 `/analytics` Dashboard → 验证漏斗显示 9 步，新事件有计数
- [ ] 检查 `/api/analytics/stats` JSON → 验证 `funnel.hero_cta_click`, `funnel.scene_card_click`, `funnel.results_viewed` 有数据
- [ ] 检查 `scene_types` 字段 → 验证 4 种 scene_type 分别计数

### 4.3 回滚步骤

如果出现异常，回滚方式：
1. `git checkout` 恢复 6 个文件到上一个 commit
2. 重新部署

### 4.4 已知限制

1. KV `list()` 无分页（前 100 用户阶段非问题）
2. `scene_types` 聚合最多读取 200 条 event（超出的不统计，但 KV list 本身最多 1000 key）
3. `results_viewed` 使用 useRef 防重复，用户点击「重新选择」→ 再次查看结果时会再触发一次（符合预期 — 每次看到结果都是一次新的查看）

---

## 五、类型安全确认

```
TypeScript 编译通过（2.4s）
0 errors
0 warnings

新增字段全部可选，向后兼容：
- EventPayload 的 scene_type, platform, location, recommendation_count 均为 optional
- TrackEvent 同步扩展
- Stats 接口同步扩展
- 旧的 track() 调用无需修改
```

---

## 六、未实现的 P1 事件（明确排除）

| 事件 | 排除原因 |
|------|----------|
| windows_entry_click | P1 优先级，非本次范围 |
| hot_tag_click | P1 优先级，非本次范围 |
| secondary_scroll_click | P1 优先级，非本次范围 |
| waitlist_submit | P1 优先级，非本次范围 |
| deploy_page_view | P2 优先级，非本次范围 |

---

> **总结：3 个 P0 事件全部实现，6 个文件修改，0 个错误。漏斗覆盖率从 5/9 提升到 8/9。A/B 测试能力就绪。**
