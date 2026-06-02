# 项目：GitHub 精选工具库 (Awesome Toolkit Curator)

## 项目目标

从 GitHub 精选最强功能的开源项目，构建一个面向**非技术人员也能看懂**的工具库网站/文档系统。核心价值：
- 精准分类，快速找到所需工具
- 每个工具附带「普通人能看懂的使用说明」
- 持续更新，保持工具的时效性

---

## 核心功能需求

### 1. 工具收录标准
- GitHub Stars ≥ 1000（或近期高速增长项目）
- 有明确的使用场景，非纯研究性项目
- 有可用的文档或 README
- 优先收录：有 GUI / Web UI / 一键安装的工具

### 2. 分类体系（一级分类）
- 🤖 AI & 自动化
- 🛠️ 开发效率工具
- 📊 数据处理 & 可视化
- 🔒 安全 & 隐私
- 🌐 网络 & 爬虫
- 🎨 创意 & 媒体处理
- 📁 文件 & 知识管理
- 🏠 自部署 & 家庭服务器

### 3. 每个工具条目必须包含
```
- 工具名称 + GitHub 链接
- ⭐ Star 数量（动态获取）
- 一句话描述（中文，非技术语言）
- 适合人群：[技术小白 / 普通用户 / 开发者]
- 安装难度：⭐☆☆☆☆ 到 ⭐⭐⭐⭐⭐
- 使用方法：用「如何做XXX」格式，步骤不超过5步
- 替代品：列出1-2个同类工具
```

---

## 技术栈选择

### 优先方案（简单可维护）
- **数据存储**：JSON 文件 + YAML front matter（无需数据库）
- **前端展示**：Next.js 或纯 HTML/CSS（优先静态站）
- **部署**：GitHub Pages 或 Vercel（免费）
- **数据更新**：GitHub Actions 定期抓取 Star 数

### 数据结构示例
```json
{
  "id": "ollama",
  "name": "Ollama",
  "github_url": "https://github.com/ollama/ollama",
  "stars": 85000,
  "category": "AI & 自动化",
  "tags": ["LLM", "本地AI", "隐私"],
  "description_plain": "在你自己的电脑上运行 AI 模型，完全不联网，保护隐私",
  "target_users": ["技术小白", "普通用户"],
  "difficulty": 2,
  "quick_start": [
    "访问 ollama.com 下载安装包",
    "双击安装，像装普通软件一样",
    "打开终端输入：ollama run llama3",
    "直接开始对话"
  ],
  "alternatives": ["LM Studio", "Jan"]
}
```

---

## 开发优先级

### Phase 1（MVP，先跑通流程）
1. [ ] 设计并确定数据结构（JSON schema）
2. [ ] 手动录入 20 个种子工具（覆盖所有分类）
3. [ ] 构建静态展示页面（能搜索、能筛选）
4. [ ] 部署上线

### Phase 2（提升质量）
5. [ ] GitHub Actions 自动更新 Star 数
6. [ ] 添加「普通话」使用教程（视频/截图）
7. [ ] 工具对比功能（同类工具横向比较）
8. [ ] 用户提交工具入口

### Phase 3（规模化）
9. [ ] 爬取 GitHub Trending 自动推荐候选工具
10. [ ] 接入 AI 自动生成「普通人说明」草稿

---

## 写作规范（非技术描述）

### ❌ 不要这样写
> "基于 Rust 的高性能异步运行时，支持 WebAssembly 编译目标"

### ✅ 要这样写
> "让网页程序运行得更快的底层工具，你不需要懂它怎么工作，只需要知道用了它的软件启动更快"

### 难度评级标准
- ⭐ = 下载即用，不需要任何命令行
- ⭐⭐ = 需要在命令行输入1-2行命令
- ⭐⭐⭐ = 需要修改配置文件
- ⭐⭐⭐⭐ = 需要理解基本的技术概念
- ⭐⭐⭐⭐⭐ = 需要编程经验

---

## 当前工作状态

> 最后更新：2026-06-01

- 当前阶段：Phase 3（进行中）
- 线上地址：https://awesome-toolkit.pages.dev
- 部署平台：Cloudflare Pages（静态导出）
- 已录入工具数：30（8 个分类全覆盖）

### 已完成任务
- [x] A：GitHub Actions 每日自动更新 Star 数
- [x] B：工具总数扩充到 30 个，每分类 ≥ 3 个
- [x] C：工具详情页 /tool/[id]（面包屑 + 步骤 + 同类推荐）
- [x] D：部署到 Cloudflare Pages（wrangler pages deploy）
- [x] E：用户推荐工具入口（Modal → GitHub Issue）

### 2026-06-02 更新（第二次）
- [x] **工具对比功能**：/compare 页面 + ToolCard 对比按钮 + CompareBar 浮动栏 + URL 参数保持状态
- [x] **AI 描述生成脚本**：scripts/generate-descriptions.mjs（基于 Claude Haiku API，支持 dry-run/force/with-steps）
- [x] **部署与 Affiliate 指引**：docs/DEPLOY-AND-AFFILIATE.md

### 2026-06-02 更新
- [x] 修复 RecommendModal.tsx GITHUB_USERNAME（→ zhangheng6171-eng）
- [x] **Phase 5 MVP：「一键部署」功能上线**
  - 15 个工具的 Docker Compose 生产级配置（健康检查、数据持久化、网络隔离）
  - 通用部署脚本 install.sh + 卸载脚本 uninstall.sh
  - /deploy 工具列表页 + /deploy/[id] 部署详情页
  - 工具详情页集成「一键部署」CTA 入口
  - 变现钩子：服务器推荐链接（阿里云/腾讯云/Vultr）

### 明天待续
- [ ] 注册阿里云/腾讯云/Vultr Affiliate，替换占位链接为真实推广链接
- [ ] 运行 AI 描述生成脚本改进短描述：`ANTHROPIC_API_KEY=xxx node scripts/generate-descriptions.mjs --with-steps --force`
- [ ] 部署到 Cloudflare Pages（配置 GitHub Secrets 后推送触发）
- [ ] Phase 6：付费功能（自动备份/监控告警/版本更新提醒）
- [ ] 接入自定义域名（可选）

---

## 重要约定

1. **所有面向用户的文字必须用中文**
2. **代码和文件名用英文**
3. **每次新增工具，必须同时写好「普通人使用方法」，不能留空**
4. **遇到技术选型分歧时，优先选「更简单的方案」**
5. **数据文件和展示代码分离，方便将来更换前端**
