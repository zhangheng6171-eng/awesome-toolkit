# 设备适配推荐系统

> 根据用户设备（Windows/Mac/Linux/NAS + 配置）自动推荐适合的开源工具。
> 目标：降低选择困难，提高首次部署成功率。

---

## 一、推荐引擎逻辑

### 评分公式

```
匹配度 = 平台兼容性 (+50) × 内存充足 (+30) × 新手友好 (+15) × 难度低 (+5)
```

### 过滤规则

| 规则 | 逻辑 |
|------|------|
| **平台兼容** | `platforms.{device} !== 'unsupported'` |
| **Docker 依赖** | 如工具需要 Docker 且用户未安装 → Windows/Mac 允许（可后续安装），NAS 拒绝 |
| **内存下限** | 用户 RAM < min_ram_mb → 不推荐 |
| **内存充足** | 用户 RAM ≥ recommended_ram_mb → 标记「流畅运行」 |
| **内存勉强** | min ≤ 用户 RAM < recommended → 标记「最低配置」 |

### 排序规则

1. 新手友好优先
2. 内存充足的优先
3. 难度低的优先
4. Star 数高的优先

---

## 二、系统需求数据概览

### 内存需求分布

| 内存需求 | 工具数 | 典型工具 |
|----------|--------|----------|
| **极低（≤256 MB）** | 12 | Portainer, Vaultwarden, Uptime Kuma, Beszel, Node-RED |
| **低（512 MB）** | 8 | n8n, NocoDB, Actual Budget, Navidrome, Gitea |
| **中（1-2 GB）** | 18 | n8n(推荐), Paperless-ngx, Metabase, Grafana, Open WebUI |
| **高（4-8 GB）** | 9 | Dify, Immich, Appwrite, Ollama, Apache Superset |
| **极高（8 GB+）** | 3 | Ollama(推荐), Dify(推荐), Immich(推荐) |

### 安装时间分布

| 时间 | 工具数 | 说明 |
|------|--------|------|
| ≤3 分钟 | 12 | 一行 docker run 或打开网页即用 |
| 5 分钟 | 13 | 标准 Docker Compose 部署 |
| 10 分钟 | 10 | 需要额外配置（数据库、API Key） |
| 15+ 分钟 | 5 | 复杂微服务架构 |

### 新手友好工具（18 个）

Portainer, Uptime Kuma, Vaultwarden, Actual Budget, n8n, NocoDB, Stirling PDF, Navidrome, changedetection-io, Open WebUI, IT-Tools, Excalidraw, Hoppscotch, CyberChef, KeePassXC, Joplin, LosslessCut, SiYuan

---

## 三、典型场景推荐

### 场景 1：Windows 电脑，8GB 内存，没装 Docker

**推荐策略：** 优先桌面 App 和网页工具，其次推荐可装 Docker Desktop 的工具

**Top 10 推荐：**

| 排序 | 工具 | 类型 | 为何推荐 |
|------|------|------|----------|
| 1 | KeePassXC | 桌面 App | 下载即用，离线密码管理 |
| 2 | SiYuan | 桌面 App | 国产笔记，中文友好 |
| 3 | Joplin | 桌面 App | 全平台笔记，网盘同步 |
| 4 | LosslessCut | 桌面 App | 视频剪切，简单实用 |
| 5 | OBS Studio | 桌面 App | 录屏直播 |
| 6 | IT-Tools | 网页 | 打开即用 |
| 7 | Excalidraw | 网页 | 手绘风格白板 |
| 8 | Portainer | Docker | 先装 Docker Desktop，然后部署这个 |
| 9 | Uptime Kuma | Docker | 网站监控，资源极低 |
| 10 | n8n | Docker/npx | 一行 npx 命令启动，不需要 Docker |

**额外推荐（装 Docker Desktop 之后）：**
Vaultwarden, NocoDB, Actual Budget, Navidrome, Open WebUI

### 场景 2：Mac 电脑，16GB 内存，已装 Docker Desktop

**Top 10 推荐：**

| 排序 | 工具 | RAM 需求 | 说明 |
|------|------|----------|------|
| 1 | Ollama | 8GB+ | Mac Metal GPU 加速，体验极佳 |
| 2 | Open WebUI | 推荐 4GB | 配合 Ollama，ChatGPT 式界面 |
| 3 | Portainer | 512MB | Docker 可视化管理 |
| 4 | n8n | 推荐 2GB | 自动化工作流 |
| 5 | Vaultwarden | 512MB | 密码管理 |
| 6 | Uptime Kuma | 512MB | 网站监控 |
| 7 | NocoDB | 推荐 2GB | 表格数据库 |
| 8 | LangFlow | 推荐 4GB | AI 工作流 |
| 9 | Stirling PDF | 推荐 2GB | PDF 处理 |
| 10 | Navidrome | 512MB | 音乐服务器 |

### 场景 3：Linux VPS，4GB 内存

**Top 10 推荐：**

| 排序 | 工具 | RAM 需求 | 说明 |
|------|------|----------|------|
| 1 | Portainer | 512MB | Docker 管理第一步 |
| 2 | Vaultwarden | 512MB | 密码保险箱 |
| 3 | Uptime Kuma | 512MB | 监控你的所有服务 |
| 4 | Nginx Proxy Manager | 512MB | 域名+HTTPS 管理 |
| 5 | n8n | 推荐 2GB | 自动化 |
| 6 | NocoDB | 推荐 2GB | 无代码数据库 |
| 7 | changedetection-io | 推荐 1GB | 网页监控 |
| 8 | Actual Budget | 512MB | 个人记账 |
| 9 | Navidrome | 512MB | 音乐流媒体 |
| 10 | Stirling PDF | 推荐 2GB | PDF 工具箱 |

**不推荐（4GB 不够）：**
- Immich（关闭 ML 可试试）
- Dify（至少 4GB 勉强，推荐 8GB）
- Appwrite（太重）
- Ollama（CPU 模式需要 16GB+）

### 场景 4：群晖 NAS，2GB 内存

**Top 10 推荐：**

| 排序 | 工具 | RAM 需求 | 说明 |
|------|------|----------|------|
| 1 | Vaultwarden | 256MB | 密码管理，NAS 最佳搭档 |
| 2 | Uptime Kuma | 256MB | 监控 |
| 3 | Portainer | 256MB | Docker 管理 |
| 4 | AdGuard Home | 256MB | 全屋广告过滤 |
| 5 | Navidrome | 256MB | 音乐 |
| 6 | Actual Budget | 256MB | 记账 |
| 7 | Node-RED | 256MB | 自动化 |
| 8 | changedetection-io | 256MB | 网页监控 |
| 9 | Nginx Proxy Manager | 256MB | 反向代理 |
| 10 | Beszel | 256MB | 轻量监控 |

**如果你有 4GB+ NAS：**
Paperless-ngx, Immich(关ML), Jellyfin, Nextcloud

### 场景 5：群晖 NAS，8GB 内存

**Top 10 推荐：**

| 排序 | 工具 | RAM 需求 | 说明 |
|------|------|----------|------|
| 1 | Vaultwarden | 256MB | 密码管理 |
| 2 | Paperless-ngx | 推荐 2GB | 文档管理，NAS 神器 |
| 3 | Immich | 推荐 4GB | 照片备份（关 ML） |
| 4 | Jellyfin | 推荐 4GB | 家庭影院 |
| 5 | Nextcloud | 推荐 4GB | 私有云盘 |
| 6 | Nginx Proxy Manager | 512MB | 反向代理 |
| 7 | Uptime Kuma | 256MB | 监控 |
| 8 | Portainer | 256MB | 管理 |
| 9 | Actual Budget | 512MB | 记账 |
| 10 | Home Assistant | 推荐 2GB | 智能家居 |

---

## 四、数据模型

### Tool.system_requirements

```typescript
interface SystemRequirements {
  min_ram_mb: number;          // 最低内存 (MB)
  min_disk_mb: number;         // 最低磁盘 (MB)
  recommended_ram_mb: number;  // 推荐内存 (MB)
  recommended_disk_mb: number; // 推荐磁盘 (MB)
  cpu: 'low' | 'medium' | 'high';   // CPU 需求等级
  docker_required: boolean;     // 是否必须 Docker
  gpu_beneficial: boolean;      // GPU 是否有帮助
  install_time_minutes: number; // 预计安装时间（分钟）
  setup_complexity: 'simple' | 'moderate' | 'complex';
  setup_notes?: string;         // 额外说明
}
```

### Tool.beginner_friendly

- `true`：安装步骤 ≤5 步、有 Web UI、不需要命令行或只需要复制粘贴、有明确的使用场景
- 共 18 个工具标记为新手友好

### 推荐引擎

```typescript
function recommendForDevice(
  profile: DeviceProfile,  // { type, ram_mb, has_docker, has_gpu }
  tools: Tool[]
): Tool[]
```

---

## 五、前端实现

### 页面：`/recommendations`

4 步向导：
1. **你的设备** — Windows / Mac / Linux / NAS
2. **内存大小** — 2GB / 4GB / 8GB / 16GB / 32GB+
3. **Docker** — 已安装 / 未安装
4. **用途** — 可选，按分类筛选

结果页：
- 按推荐度排序的工具卡片
- 显示：难度、内存需求、磁盘需求、安装时间
- 筛选：按分类 / 只看新手友好
- 区分「推荐配置」和「最低配置」

### 组件

- `src/components/DeviceWizard.tsx` — 向导 + 结果渲染
- `src/app/recommendations/page.tsx` — 页面入口
- 首页 CTA banner 链接到 `/recommendations`

---

## 六、下一步

1. **收集用户反馈** — 推荐结果是否符合用户实际情况
2. **添加更多过滤维度** — 是否需要 GPU / 是否需要公网访问 / 是否支持 ARM
3. **个性化推荐** — 基于用户已有的工具推荐搭配组合
4. **部署前检查清单** — 根据设备+工具生成「装前检查」

---

> 生成时间：2026-06-03
> 数据范围：50 个工具，18 个新手友好
