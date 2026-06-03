# 上线检查清单

> 最后更新：2026-06-02

## 功能验证

- [x] 首页加载正常，50 个工具卡片渲染正确
- [x] 搜索功能：按名称、描述、标签搜索
- [x] 筛选功能：按分类、难度、适合人群、许可证、Web界面
- [x] 工具详情页 /tool/[id]：面包屑、步骤、同类推荐、CTA
- [x] 工具对比页 /compare：2-4 个工具横向对比
- [x] 一键部署列表 /deploy：28 个工具
- [x] 部署详情页 /deploy/[id]：配置信息、环境变量、注意事项
- [x] 部署向导 /deploy/[id]/wizard：4 步向导 + Agent 安装
- [x] 控制台 /dashboard：服务器管理、更新/卸载
- [x] 反馈页 /feedback：提交反馈
- [x] 关于页 /about：项目介绍、联系方式
- [x] 移动端响应式：所有页面适配 375px 宽度
- [ ] 404 页面：自定义 404 页面上线验证
- [ ] Cloudflare Access 认证：配置 Zero Trust 应用

## 静态资源

- [x] robots.txt：允许抓取，禁止 /dashboard 和 /api/
- [x] sitemap.xml：112 个 URL（首页、50 工具、28 部署、28 向导等）
- [x] OG 标签：首页和工具详情页均配置了 title/description/openGraph

## 性能

- [x] Next.js 静态导出：115 页 SSG
- [x] Cloudflare CDN：全球加速
- [x] 图片优化：使用 unoptimized（全量静态导出）
- [x] 构建时间：~3 秒（Turbopack）

## API / Functions

- [x] /api/deploy/connect：Agent 连接检测
- [x] /api/deploy/execute：SSE 流式部署
- [x] /api/deploy/history：KV 部署历史
- [x] /api/servers：KV 服务器管理
- [x] /api/waitlist：KV 邮件收集
- [x] /api/auth/upgrade：CF Access 用户信息
- [x] /api/feedback：KV 反馈收集

## 安全

- [x] Agent Token 随机生成（32 字符）
- [x] Agent 命令白名单（docker compose/ps/stats）
- [x] Agent IP 锁定（5 次失败 / 10 分钟）
- [x] Functions API 频率限制（10 req/min/IP）
- [ ] Cloudflare Access 认证（待配置）
- [ ] DDoS 防护（Cloudflare 自带）
- [ ] SSL/TLS（Cloudflare 自带）

## 部署 & DevOps

- [x] wrangler.toml 配置完成
- [x] KV namespace 创建（DEPLOY_KV, WAITLIST_KV 等）
- [x] Cloudflare Pages 部署成功
- [x] 自定义域名 awesome-toolkit.pages.dev
- [ ] 自定义域名（可选）
- [ ] 监控 & 告警配置

## 内容质量

- [x] 50 个工具全部填写 useCase 字段
- [x] 所有描述 >= 40 字符
- [x] 28 个工具的 docker-compose.yml 配置完整
- [x] 安装步骤不超过 5 步
- [ ] AI 生成描述脚本运行（可选）
- [ ] 截图/视频教程（可选）

## 变现准备

- [ ] 注册阿里云 Affiliate
- [ ] 注册腾讯云 Affiliate
- [ ] 注册 Vultr Affiliate
- [ ] 替换占位链接为真实 Affiliate 链接
- [ ] 支付网关接入（后期）

## 市场推广

- [x] 分享文案模板（部署成功后可复制）
- [x] 用户评价展示（首页使用感言）
- [x] 邮件订阅表单
- [ ] V2EX 发布帖
- [ ] 小红书推广
- [ ] GitHub Trending 自荐
- [ ] Product Hunt 发布

---

## 上线前最后检查

- [ ] `npm run build` 零错误
- [ ] `wrangler pages deploy` 成功
- [ ] 9 个关键页面手动访问 200 OK
- [ ] 移动端（375px）7 个组件显示正常
- [ ] 对比功能正常（选择 → 开始对比 → 页面显示）
- [ ] API 端点响应正常
- [ ] sitemap.xml 可访问
- [ ] robots.txt 可访问
