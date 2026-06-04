# 首页 V2 A/B 测试方案

> 日期：2026-06-04
> 目标：验证 V2 Hero 文案是否优于简化版，为后续迭代提供数据依据

---

## 一、测试背景

当前 V2 Hero 文案：
```
不用写代码，不用学 Docker，不用看英文
选你想做的事，剩下的交给我们
```

问题：这个版本已经是经过 3 轮迭代的结果，但**没有数据验证**它是最优版本。A/B 测试可以在真实用户流量中对比不同文案的转化效果。

## 二、方案设计

### Variant A（当前 V2）

```
┌──────────────────────────────────────┐
│                                      │
│   不用写代码，不用学 Docker，不用看英文  │
│   选你想做的事，剩下的交给我们           │
│                                      │
│   ┌──────────────────────────────┐   │
│   │  🚀 告诉我用什么设备           │   │
│   │     帮你找到最适合的工具  →    │   │
│   └──────────────────────────────┘   │
│                                      │
│   也可以先看看有哪些工具 →            │
│   💻 我只有 Windows 电脑             │
│                                      │
│   50 精选工具 · Win/Mac/Linux · 32一键部署 │
│                                      │
└──────────────────────────────────────┘
```

**策略**：三「不用」排除恐惧 + 承诺式副标题
**假设**：用户需要先被消除顾虑，再被引导行动

### Variant B（简化版）

```
┌──────────────────────────────────────┐
│                                      │
│   帮你找到最适合的开源工具              │
│   选设备 → 看推荐 → 一键装好            │
│                                      │
│   ┌──────────────────────────────┐   │
│   │  🚀 告诉我用什么设备           │   │
│   │     帮你找工具  →              │   │
│   └──────────────────────────────┘   │
│                                      │
│   也可以先看看有哪些工具 →            │
│   💻 我只有 Windows 电脑             │
│                                      │
│   50 精选工具 · Win/Mac/Linux · 32一键部署 │
│                                      │
└──────────────────────────────────────┘
```

**策略**：直接说网站是干什么的 + 3 步预期
**假设**：用户不想读「不是XXX」的否定句，更关心「能帮我干什么」

**差异**：
- 主标题从否定句（2 个「不用」）变为肯定句（「帮你找到」）
- 副标题从情感承诺（「交给我们」）变为流程预告（3 步箭头）
- Hero 区以下内容**完全相同**

### 为什么只测 Hero 标题

1. 场景区、信任证明、热门标签等都是全新模块，没有对照组可比较
2. Hero 标题是用户看到的第一行文字，对首屏理解率影响最大
3. 改动范围最小（仅 2 行文字），噪音最低
4. 历史上 CTA 文案 A/B 测试的结论最清晰（用户不会因为"搜索框位置变了"而改变行为）

---

## 三、核心指标

| # | 指标 | 定义 | 预期影响 |
|---|------|------|----------|
| **Primary** | Hero CTA CTR | `hero_cta_click / page_view(/)` | B 可能略高（流程预告降低不确定性） |
| **Secondary 1** | Wizard Open Rate | `wizard_open / page_view(/)` | 应与 Hero CTA CTR 强相关 |
| **Secondary 2** | Tool Page CTR | `tool_click / page_view(/)` | 反映场景卡和搜索的吸引力 |
| **Secondary 3** | Deploy Start Rate | `deploy_start / tool_click` | 不应受 Hero 文案影响（下游页面相同） |
| **Guardrail** | Bounce Rate | 仅 1 个 page_view 的 session 占比 | 不应升高 |
| **Guardrail** | Avg Scroll Depth | 平均浏览屏数 | 不应降低 |

**Primary metric** 必须达到统计显著性（p < 0.05）。Secondary metrics 作为参考。

### 样本量估算

假设：
- 基准 Hero CTA CTR = 15%（保守估计）
- 最小可检测效应 = 20% 相对提升（15% → 18%）
- 显著性 α = 0.05，统计功效 = 80%

需要每个 variant 约 **3,500 个独立访客** → 总计 **7,000 访客**。

按每天 100-200 访客估算：需要 **35-70 天**。

**加速方案**：如果流量太低，降低精度要求或用 Bayesian 方法（可以在任意时间点做决策）。

---

## 四、流量分配

```
        100% 流量
            │
    ┌───────┴───────┐
    │               │
   50% A (V2)     50% B (简化)
```

### 实现方式

无需第三方 A/B 工具。使用 Cloudflare Workers 的 cookie 分流：

```javascript
// Cloudflare Worker (伪代码)
export default {
  async fetch(request, env) {
    const cookie = request.headers.get('Cookie') || '';
    const variant = cookie.includes('ab_variant=B') ? 'B' : 
                    cookie.includes('ab_variant=A') ? 'A' :
                    Math.random() < 0.5 ? 'A' : 'B';
    
    // Set cookie for session persistence
    const response = await env.ASSETS.fetch(request);
    response.headers.set('Set-Cookie', `ab_variant=${variant}; Path=/; Max-Age=86400`);
    
    // Inject variant via HTMLRewriter or response header
    // Variant B gets a different Hero title
    return response;
  }
};
```

### 更简单的实现（推荐）

由于页面是静态导出，最简单的做法是在 `HomeClient.tsx` 中用 `Math.random()` + `localStorage` 分流：

```tsx
function getVariant(): 'A' | 'B' {
  if (typeof window === 'undefined') return 'A';
  const stored = localStorage.getItem('ab_hero_variant');
  if (stored === 'A' || stored === 'B') return stored;
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem('ab_hero_variant', variant);
  return variant;
}
```

**优点**：零后端改动，静态导出也能工作
**缺点**：首次渲染闪烁（A→B 切换），可通过在 layout 中预设 cookie 解决

---

## 五、数据收集

### 5.1 需要补充的前端事件（前置条件）

```
hero_cta_click { variant: 'A'|'B' }
```

在现有 `track()` 函数中增加 `variant` 属性。A/B 期间所有事件自动带上当前 variant。

### 5.2 看板查询

```
-- Hero CTA CTR by variant
SELECT 
  variant,
  COUNT(DISTINCT CASE WHEN event='hero_cta_click' THEN session_id END) * 100.0 
    / COUNT(DISTINCT CASE WHEN event='page_view' AND page='/' THEN session_id END) AS ctr
FROM events
WHERE timestamp >= 'start_date'
GROUP BY variant;

-- Full funnel by variant
SELECT variant,
  COUNT(DISTINCT CASE WHEN event='page_view' AND page='/' THEN session_id END) AS step1,
  COUNT(DISTINCT CASE WHEN event='hero_cta_click' THEN session_id END) AS step2,
  COUNT(DISTINCT CASE WHEN event='wizard_open' THEN session_id END) AS step3,
  COUNT(DISTINCT CASE WHEN event='tool_click' THEN session_id END) AS step4,
  COUNT(DISTINCT CASE WHEN event='deploy_start' THEN session_id END) AS step5,
  COUNT(DISTINCT CASE WHEN event='deploy_complete' THEN session_id END) AS step6
FROM events
GROUP BY variant;
```

---

## 六、决策标准

| 结果 | 决策 |
|------|------|
| B > A + 15%（显著） | 切换到 Variant B |
| A ≈ B（无显著差异） | 保留 Variant A（当前版） |
| B < A - 10%（显著） | 保留 Variant A，记录学习 |
| B 降低 Secondary metrics | 立即停止，回退到 A |

**提前终止条件**：
- B 的 Bounce Rate 比 A 高 20%+
- B 的 Deploy Start Rate 比 A 低 15%+
- 任何 variant 导致可感知的用户投诉

---

## 七、后续 A/B 测试路线图

本次只测 Hero 标题。如果数据显示 Hero CTA CTR 可以通过文案优化提升，后续测试包括：

| 优先级 | 测试对象 | 变量 | 预计影响 |
|--------|---------|------|----------|
| 1（本次） | Hero 标题 | A: 三「不用」vs B: 肯定句 | CTA CTR +15-20% |
| 2 | 场景卡排序 | A: Immich/n8n/Vaultwarden/Stirling vs B: n8n/Immich/Stirling/Vaultwarden | 场景卡 CTR +10% |
| 3 | CTA 按钮文案 | A: 「告诉我用什么设备」vs B: 「3 秒找到适合我的工具」 | CTA CTR +5-10% |
| 4 | 信任证明位置 | A: Hero 底部 vs B: 场景区下方 | 场景区 CTR +5% |
| 5 | 热门标签顺序 | A: 当前顺序 vs B: 按数据分析排序 | 标签 CTR +10% |

每次只测一个变量，测试周期 2-4 周（取决于流量）。

---

## 八、实施检查清单

- [ ] 补充 `hero_cta_click` 事件（P0）
- [ ] 补充 `scene_card_click` 事件（P0）
- [ ] track() 增加 variant 属性支持
- [ ] 实现分流逻辑（localStorage cookie）
- [ ] 部署 Variant B Hero 文案
- [ ] 验证两个 variant 的埋点数据正常流入
- [ ] 启动测试，记录 start date
- [ ] 每周检查 Primary metric 和 Guardrails
- [ ] 达到样本量或时间后，分析数据，做决策

---

## 九、最终建议

### 立即行动

**建议先部署 V2 到生产，不启动 A/B 测试。**

理由：
1. V2 相对于 V1 的提升幅度足够大（预估 Hero CTA CTR 从 ~5% → ~40%），A/B 测试 V2 vs V2-simplified 的边际收益较小
2. 目前日均流量未知（前 100 用户阶段），样本量不足会导致 A/B 测试无结论
3. 先收集 1-2 周的 V2 基线数据，确认漏斗形状是否符合预期
4. 在流量稳定（日均 100+ 独立访客）后再启动 A/B 测试

### 立即补充的代码

在部署到生产前，补充 2 个 P0 埋点事件（`hero_cta_click` + `scene_card_click`），确保 V2 基线数据有来源区分。预计 30 分钟。

### 何时启动 A/B 测试

- 日均独立访客 ≥ 100
- V2 基线数据收集 ≥ 2 周
- 漏斗形状稳定（非剧烈波动）

---

> **建议：立即部署 V2 + 补充 P0 埋点，收集 2 周基线数据后再决定是否启动 A/B 测试。**
