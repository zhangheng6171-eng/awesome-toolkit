# 多平台部署支持矩阵

> 分析全部 50 个工具在 Windows / Linux / Docker / Mac / Synology NAS 上的部署兼容性。
> 格式：工具名称 | Windows | Linux | Docker | Mac | NAS | 推荐方式

---

## 分类标准

| 分类 | 含义 | 工具数 |
|------|------|--------|
| **A 类** | 有原生桌面安装包 + Docker，多平台开箱即用 | 12 |
| **B 类** | 主要靠 Docker 部署，无原生桌面 App | 34 |
| **C 类** | 纯网页工具，无需部署，浏览器打开即用 | 4 |

### 平台支持标记

| 标记 | 含义 |
|------|------|
| ✅ | 原生支持（安装包 / 包管理器 / 官方支持） |
| 🐳 | 通过 Docker / Docker Desktop 运行 |
| ⚠️ | 有限支持（需要额外配置或功能受限） |
| ❌ | 不支持 |
| 🌐 | 纯网页，无需部署 |

---

## 一、完整矩阵（50 个工具）

### A 类：原生桌面 + Docker（12 个）

| 工具 | Windows | Linux | Docker | Mac | NAS | 推荐方式 |
|------|---------|-------|--------|-----|-----|----------|
| **Ollama** | ✅ 安装包 | ✅ 包管理器 | 🐳 官方镜像 | ✅ 安装包 | ⚠️ 无 GPU | Windows/Mac 原生安装包 |
| **OBS Studio** | ✅ 安装包 | ✅ PPA/flatpak | ❌ 无官方镜像 | ✅ 安装包 | ❌ 需 GPU | Windows/Mac 安装包 |
| **n8n** | ✅ Node.js | ✅ Node.js | 🐳 ✅ 有 compose | ✅ Node.js | 🐳 Container Manager | Docker（最稳定） |
| **Joplin** | ✅ 安装包 | ✅ AppImage | ❌ 无服务端 | ✅ 安装包 | ❌ | 各平台安装包 + 网盘同步 |
| **KeePassXC** | ✅ 安装包 | ✅ 包管理器 | ❌ 无服务端 | ✅ 安装包 | ❌ | 各平台安装包 |
| **LosslessCut** | ✅ 安装包 | ✅ AppImage | ❌ | ✅ 安装包 | ❌ | 各平台安装包 |
| **Trilium Notes** | ✅ 安装包 | ✅ AppImage | 🐳 ✅ 有 compose | ✅ 安装包 | 🐳 Container Manager | 桌面版（本地）+ Docker（服务器） |
| **Logseq** | ✅ 安装包 | ✅ AppImage | 🐳 官方镜像 | ✅ 安装包 | 🐳 Container Manager | 桌面版，数据放同步盘 |
| **SiYuan** | ✅ 安装包 | ✅ AppImage | 🐳 官方镜像 | ✅ 安装包 | 🐳 Container Manager | 桌面版（本地），Docker（云端） |
| **Jellyfin** | ✅ 安装包 | ✅ 包管理器 | 🐳 ✅ 有 compose | ✅ 安装包 | 🐳 Container Manager | Docker（最省心） |
| **Nextcloud** | ✅ 客户端 | ✅ 包管理器 | 🐳 ✅ 有 compose | ✅ 客户端 | 🐳 Container Manager | Docker Compose |
| **Bitwarden** | ✅ 客户端 | ✅ 客户端 | 🐳 Vaultwarden* | ✅ 客户端 | 🐳 Container Manager | Vaultwarden（轻量替代） |

> *Bitwarden 官方服务端极重（需 SQL Server），推荐用 Vaultwarden 替代。

### B 类：Docker 为主（34 个）

| 工具 | Windows | Linux | Docker | Mac | NAS | 推荐方式 |
|------|---------|-------|--------|-----|-----|----------|
| **Immich** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker Compose |
| **Stirling PDF** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **PhotoPrism** | 🐳 Docker Desktop | 🐳 Docker | 🐳 官方镜像 | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Appwrite** | 🐳 Docker Desktop | 🐳 Docker | 🐳 官方镜像 | 🐳 Docker Desktop | 🐳 Container Manager | Docker（仅限开发者） |
| **NocoDB** | 🐳 Docker Desktop | 🐳 Docker | 🐳 官方镜像 | 🐳 Docker Desktop | 🐳 Container Manager | Docker / npx |
| **Penpot** | 🐳 Docker Desktop | 🐳 Docker | 🐳 官方镜像 | 🐳 Docker Desktop | 🐳 Container Manager | Docker（或免费在线版） |
| **changedetection-io** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Dify** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker（或免费在线版） |
| **Open WebUI** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker + Ollama |
| **Metabase** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Grafana** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Vaultwarden** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **AdGuard Home** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker（Linux 原生最佳） |
| **Paperless-ngx** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Home Assistant** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker（或树莓派原生） |
| **LangFlow** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Apache Superset** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Pi-hole** | ⚠️ Docker Desktop | ✅ 原生脚本 | 🐳 官方镜像 | ⚠️ Docker Desktop | 🐳 Container Manager | Linux 原生（Docker 次之） |
| **Uptime Kuma** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Homebridge** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker（或树莓派原生） |
| **Node-RED** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Netdata** | 🐳 Docker Desktop | ✅ 原生脚本 | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker（Linux 原生也不错） |
| **Prometheus** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Beszel** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker（Hub + Agent） |
| **Passbolt** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Navidrome** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Audiobookshelf** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Outline** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker（需 OAuth 配置） |
| **Nginx Proxy Manager** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Portainer** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker（建议作为首个部署） |
| **Gitea** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Plausible** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |
| **Duplicati** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker（或 Windows 安装包） |
| **Actual Budget** | 🐳 Docker Desktop | 🐳 Docker | 🐳 ✅ 有 compose | 🐳 Docker Desktop | 🐳 Container Manager | Docker |

### C 类：纯网页工具（4 个）

| 工具 | Windows | Linux | Docker | Mac | NAS | 推荐方式 |
|------|---------|-------|--------|-----|-----|----------|
| **Excalidraw** | 🌐 浏览器 | 🌐 浏览器 | 🌐 浏览器 | 🌐 浏览器 | 🌐 浏览器 | excalidraw.com 直接用 |
| **Hoppscotch** | 🌐 浏览器 | 🌐 浏览器 | 🌐 浏览器 | 🌐 浏览器 | 🌐 浏览器 | hoppscotch.io 直接用 |
| **IT-Tools** | 🌐 浏览器 | 🌐 浏览器 | 🐳 可自部署 | 🌐 浏览器 | 🐳 Container Manager | it-tools.tech 直接用 |
| **CyberChef** | 🌐 浏览器 | 🌐 浏览器 | 🌐 浏览器 | 🌐 浏览器 | 🌐 浏览器 | gchq.github.io/CyberChef |

---

## 二、按平台统计

### Windows 10/11

| 方式 | 工具数 | 说明 |
|------|--------|------|
| 原生安装包 (.exe/.msi) | 12 | Ollama / OBS / Joplin / KeePassXC / LosslessCut / Trilium / Logseq / SiYuan / Jellyfin / Nextcloud / Bitwarden / Duplicati |
| Docker Desktop | 46 | 所有 Docker 化工具（需先装 Docker Desktop） |
| 浏览器即用 | 4 | Excalidraw / Hoppscotch / IT-Tools / CyberChef |
| 不支持 | 0 | — |

**Windows 用户入门路径：**
1. 安装 Docker Desktop（免费）→ 解锁全部 46 个 Docker 工具
2. 或直接用原生安装包的 12 个工具
3. 纯网页工具无需任何安装

### Linux (Ubuntu/Debian/CentOS)

| 方式 | 工具数 | 说明 |
|------|--------|------|
| 原生包管理器 | 15+ | Ollama / OBS / Joplin / KeePassXC / LosslessCut / Trilium / Logseq / SiYuan / Jellyfin / Nextcloud / n8n / Pi-hole / Netdata / Node-RED / Duplicati |
| Docker / Docker Compose | 46 | 全部 Docker 化工具 |
| 浏览器即用 | 4 | Excalidraw / Hoppscotch / IT-Tools / CyberChef |
| 不支持 | 0 | — |

**Linux 用户入门路径：**
1. 安装 Docker + Docker Compose → 解锁全部工具
2. 或直接用 apt/yum 装原生包

### Mac (Intel + Apple Silicon)

| 方式 | 工具数 | 说明 |
|------|--------|------|
| 原生安装包 (.dmg) | 12 | Ollama / OBS / Joplin / KeePassXC / LosslessCut / Trilium / Logseq / SiYuan / Jellyfin / Nextcloud / Bitwarden / n8n |
| Docker Desktop for Mac | 46 | 全部 Docker 化工具（Apple Silicon 原生支持） |
| 浏览器即用 | 4 | Excalidraw / Hoppscotch / IT-Tools / CyberChef |
| 不支持 | 0 | — |

**Mac 用户入门路径：**
1. 安装 Docker Desktop for Mac（Apple Silicon 原生版）→ 解锁全部 Docker 工具
2. 或直接用 .dmg 安装包的 12 个工具
3. 纯网页工具

### Synology NAS (DSM 7.x)

| 方式 | 工具数 | 说明 |
|------|--------|------|
| Container Manager (Docker) | 35+ | 内存要求：≥ 2GB RAM 推荐，≤ 1GB 仅限轻量工具 |
| Synology 套件中心 | 5 | Jellyfin / Home Assistant / Git Server / Node.js |
| 不支持 | ~10 | 需 GPU 的工具（Ollama / OBS / Immich ML）、32位 ARM 机型限制 |

**NAS 用户入门路径：**
1. 在套件中心安装 Container Manager
2. 添加 Docker Compose 项目
3. 注意 NAS 内存限制（2GB 机型建议只跑 ≤5 个同时运行的容器）

#### NAS 内存建议

| NAS 内存 | 建议同时运行容器数 | 适合的工具 |
|----------|-------------------|-----------|
| 1 GB | 1-2 个 | Uptime Kuma / Vaultwarden / AdGuard Home / Beszel / Portainer |
| 2 GB | 3-5 个 | 上述 + changedetection-io / Nginx Proxy Manager / Duplicati / Actual Budget |
| 4 GB | 5-10 个 | 上述 + Immich / Paperless-ngx / Nextcloud / Jellyfin / Navidrome |
| 8+ GB | 10+ 个 | 全部兼容的 Docker 工具 |

---

## 三、特殊限制工具

以下工具对运行环境有额外要求，不能随意跨平台：

| 工具 | 限制 | 说明 |
|------|------|------|
| **Ollama** | 需要 GPU（NVIDIA/AMD）或 ≥16GB RAM | CPU 模式极慢，不推荐 NAS |
| **OBS Studio** | 需要 GPU + 桌面环境 | 无界面服务器无法运行 |
| **Pi-hole** | 需要占用 53 端口（DNS） | Windows Docker Desktop 可能有端口冲突 |
| **Home Assistant** | 需要 USB 直通（Zigbee/Z-Wave 适配器） | NAS 上的 Docker 不支持 USB 透传 |
| **Immich** | 机器学习需要 GPU，CPU 模式可用但慢 | NAS 上建议关闭 ML 功能 |
| **Homebridge** | 需与智能设备在同一局域网 | Docker network_mode: host |
| **AdGuard Home** | 同 Pi-hole，需 53 端口 | Windows 版需关闭系统 DNS 服务 |
| **Nginx Proxy Manager** | 需 80/443 端口 | Windows 可能被 IIS 占用 |
| **Dify** | 依赖较多（PostgreSQL + Redis + Weaviate） | 至少需要 4GB RAM |
| **Appwrite** | 多容器微服务架构 | 至少需要 4GB RAM |

---

## 四、用户场景推荐

### 场景 1：我只有一台 Windows 电脑，能部署什么？

**Step 1:** 安装 Docker Desktop（免费，10 分钟）
**Step 2:** 可以部署所有标 🐳 的工具（46 个）
**推荐首个部署：** Portainer（Docker 可视化管理）+ Uptime Kuma（网站监控）

**最友好的 5 个入门工具（Windows Docker Desktop）：**
1. Portainer — Docker 可视化管理，后续部署更方便
2. Uptime Kuma — 监控网站是否在线
3. Vaultwarden — 私人密码管理器
4. Nginx Proxy Manager — 域名 + HTTPS 管理
5. Actual Budget — 个人记账

### 场景 2：我有 Synology NAS，怎么开始？

**Step 1:** 打开套件中心 → 安装 Container Manager
**Step 2:** 在 Container Manager 中导入我们的 docker-compose.yml
**Step 3:** 根据 NAS 内存选择工具（参考上方内存建议表）

**NAS 最友好的 5 个工具：**
1. Vaultwarden — 密码管理（极低资源占用）
2. Uptime Kuma — 网站监控
3. changedetection-io — 网页变化监控
4. Nginx Proxy Manager — 反向代理 + SSL
5. Paperless-ngx — 文档管理（内存 ≥ 4GB 时）

### 场景 3：我只有 MacBook，能部署什么？

**Step 1:** 安装 Docker Desktop for Mac（Apple Silicon 原生）
**Step 2:** 几乎全部工具都能跑（46 个 Docker + 12 个原生）
**Step 3:** Mac 睡眠后容器会暂停，建议仅开发/测试用途

### 场景 4：我有 Linux VPS，怎么用？

直接使用我们的一键部署方案（当前已支持的 32 个 docker-compose.yml），或配合 Agent Python 脚本实现远程管理。

---

## 五、与现有部署系统的关系

### 当前部署架构（不变）

```
用户 → Awesome Toolkit 网站 → 选择工具 → 部署向导 → Agent (Python) → 服务器上执行 docker compose up
```

### 新增多平台能力

```
Phase 3（当前）: 用户在选择工具后，先选「我在什么设备上部署」
                 ↓
          ┌──────┼──────┐
         Windows  Linux  Mac/NAS
           ↓       ↓       ↓
      Docker    原生或    Container
      Desktop   Docker   Manager
```

### 平台选择影响

| 选择平台 | 安装指令变化 | Compose 文件变化 | Agent 行为变化 |
|----------|------------|-----------------|---------------|
| Windows | 先引导装 Docker Desktop | 不变 | 端口避免 80/443/53 |
| Linux | 先引导装 Docker | 不变 | 正常 |
| Mac | 先引导装 Docker Desktop | 不变 | 正常 |
| NAS (Synology) | 引导 Container Manager 导入 | volumes 路径适配 | 不适用 Agent |

---

## 六、数据来源

- 50 个工具的 `tools.json` 字段：`has_desktop_app` / `has_web_ui` / `has_cli`
- 32 个已有 `docker-compose.yml` 文件
- 各工具官方文档 + GitHub README
- Synology DSM 7.x Container Manager 兼容性测试

---

> **生成时间：** 2026-06-03
> **下一步：** Phase 2 — 数据模型升级，在 `tools.json` 中新增 `platforms` 字段
