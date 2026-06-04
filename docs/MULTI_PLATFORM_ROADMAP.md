# 多平台部署路线图

> 从 Linux-Docker-Only 到 Windows/Mac/NAS 全覆盖的迁移路径
> 生成时间：2026-06-03

---

## 一、当前状态

### 已完成（Phase 1-5）

| Phase | 内容 | 状态 |
|-------|------|------|
| 1 | [PLATFORM_SUPPORT_MATRIX.md](./PLATFORM_SUPPORT_MATRIX.md) — 50 个工具全平台兼容性分析 | ✅ |
| 2 | `tools.json` 新增 `platforms` 字段（所有 50 个工具） | ✅ |
| 3 | `PlatformSelector` 组件 — 工具详情页平台选择器 UI | ✅ |
| 4 | n8n 多平台部署示范（4 平台 × 详细步骤） | ✅ |
| 5 | 8 个高价值工具的多平台部署说明 | ✅ |

### 平台覆盖率

| 平台 | 原生支持 | Docker | 网页 | 不支持 | 覆盖率 |
|------|---------|--------|------|--------|--------|
| Windows | 12 | 34 | 4 | 0 | 100% |
| Linux | 15 | 35 | 4 | 0 | 100% |
| Mac | 12 | 34 | 4 | 0 | 100% |
| NAS (Synology) | 0 | 38 | 4 | 8 | 84% |

---

## 二、已完成的 8 个高价值工具

这些工具现在拥有完整的多平台部署说明（`platform_instructions`），覆盖 Windows / Linux / Mac / NAS：

| 工具 | 分类 | Stars | 亮点 |
|------|------|-------|------|
| **n8n** | 自动化工作流 | 190k | 拖拽式自动化，低代码天花板 |
| **Dify** | AI 应用平台 | 143k | 可视化搭建 AI 聊天机器人 |
| **LangFlow** | AI 工作流 | 149k | 流程图式 AI 流程编排 |
| **Open WebUI** | AI 聊天界面 | 139k | ChatGPT 式本地 AI 界面 |
| **NocoDB** | 无代码数据库 | 63k | Excel 式的数据库管理 |
| **Vaultwarden** | 密码管理 | 61k | 自托管 Bitwarden 兼容 |
| **Immich** | 照片备份 | 102k | 自托管 Google Photos |
| **Portainer** | Docker 管理 | 32k | Docker 可视化管理面板 |

---

## 三、剩余 42 个工具的优先级

### 第二批（高价值，建议下一轮完成）

| 工具 | 原因 | 优先级 |
|------|------|--------|
| **Home Assistant** | 智能家居核心，NAS 用户高频需求 | P0 |
| **Paperless-ngx** | NAS 用户最常用的文档管理 | P0 |
| **Jellyfin** | 家庭媒体服务器，全平台需求 | P0 |
| **Nextcloud** | 私有云盘，个人用户部署量最大 | P0 |
| **Pi-hole** | 全屋广告过滤，Pi-hole→AdGuard 是新手常见升级路径 | P1 |
| **Uptime Kuma** | 几乎每个部署者都会用到的监控工具 | P1 |
| **Stirling PDF** | 高频日用工具，非技术用户多 | P1 |
| **Nginx Proxy Manager** | 部署多个工具的前置依赖 | P1 |

### 第三批（插件化，可批量生成）

以下工具部署方式纯 Docker，各平台差异极小（只需 Docker Desktop 安装指引 + 端口/volume 适配说明）：

| 工具列表 | 数量 |
|----------|------|
| changedetection-io / Grafana / Metabase / Apache Superset / Plausible / Prometheus / Beszel / Netdata | 8 监控/数据类 |
| Photoprism / Navidrome / Audiobookshelf | 3 媒体类 |
| Appwrite / Penpot / Gitea / Outline | 4 开发协作类 |
| Homebridge / Node-RED / Duplicati / Actual Budget | 4 家庭/工具类 |

### 第四批（不需要部署说明的）

| 工具 | 原因 |
|------|------|
| Excalidraw / Hoppscotch / IT-Tools / CyberChef | 纯网页，浏览器打开即用 |
| OBS Studio / KeePassXC / LosslessCut / Joplin | 纯桌面 App，直接去官网下载 |
| Bitwarden | 推荐用 Vaultwarden 替代 |
| Trilium Notes / Logseq / SiYuan | 桌面 App 为主，Docker 版为辅 |

---

## 四、UX 改进路线图

### 当前已完成

```
工具详情页
  ├── 平台选择器（Windows / Linux / Mac / NAS 标签）
  ├── 平台状态徽章（原生 / Docker / 网页 / 不支持）
  ├── 平台特定详细步骤（8 个工具 × 4 平台 = 32 组说明）
  └── Docker Desktop 安装提示（Windows / Mac 用户）
```

### 后续 UX 增强（Phase 6+）

| 功能 | 说明 | 优先级 |
|------|------|--------|
| **平台自动检测** | 通过 UA 判断用户操作系统，默认选中对应标签 | P2 |
| **NAS 品牌选择** | 扩展 NAS 为 Synology / QNAP / UNRAID 三个子选项 | P2 |
| **一键复制命令** | 平台步骤中的命令支持一键复制按钮 | P2 |
| **部署前检查清单** | 根据所选平台生成前置条件检查列表 | P3 |
| **平台视频教程** | 每个平台的部署录屏（GIF/MP4） | P3 |
| **平台 FAQ** | 按平台汇总常见问题（如 Windows 端口被占用、Mac 睡眠问题） | P3 |

---

## 五、部署向导集成

### 当前流程

```
工具详情页 → 选平台 → 看步骤 → 点「一键部署」→ /deploy/[id] → 部署向导 → Agent
```

### 改进后流程（Phase 6+）

```
工具详情页 → 选平台 → 看平台特定步骤
                      ↓
              点「一键部署」
                      ↓
        部署向导询问「你在什么设备上部署？」
                      ↓
        ┌─────────┼─────────┐
      Windows   Linux    Mac/NAS
        ↓         ↓         ↓
    调整端口   正常流程   Container Manager 指引
    避免冲突   用 Agent   不用 Agent
```

### 各平台部署向导差异

| 平台 | Agent 支持 | Compose 文件 | 特殊处理 |
|------|-----------|-------------|----------|
| **Linux VPS** | ✅ 完整支持 | 标准路径 | 无 |
| **Windows Docker** | ⚠️ 有限 | 端口避免 80/443/53 | 引导装 Docker Desktop |
| **Mac Docker** | ⚠️ 有限 | 标准路径 | 引导装 Docker Desktop |
| **NAS Container Manager** | ❌ 不支持 | volumes 改 /volume1/ 路径 | 引导用 Container Manager 导入 |

---

## 六、数据模型扩展计划

### 当前 `platforms` 字段（Phase 2 完成）

```json
{
  "platforms": {
    "windows": "docker",
    "linux": "docker",
    "mac": "docker",
    "nas": "docker",
    "recommended": "all"
  }
}
```

### 当前 `platform_instructions` 字段（Phase 4/5 完成，8 个工具）

```json
{
  "platform_instructions": {
    "windows": {
      "prerequisites": "...",
      "steps": ["...", "..."],
      "note": "..."
    }
  }
}
```

### 未来可能扩展的字段

| 字段 | 用途 | 状态 |
|------|------|------|
| `platform_instructions.nas.brand` | 区分 Synology / QNAP / UNRAID | 未开始 |
| `platform_instructions.*.docker_compose_override` | 平台特定的 compose 覆盖配置 | 未开始 |
| `platform_instructions.*.video_url` | 平台部署录屏链接 | 未开始 |
| `platform_restrictions` | 平台特定限制（如 NAS 不支持 GPU） | 包含在 note 中 |

---

## 七、统计总结

| 指标 | 完成前 | 完成后 |
|------|--------|--------|
| 有 `platforms` 字段的工具 | 0 | 50 (100%) |
| 有 `platform_instructions` 的工具 | 0 | 8 (16%) |
| 工具详情页有平台选择器 | ❌ | ✅ |
| 平台覆盖率（Windows/Mac） | 隐式支持 | 100% 明确标注 |
| 平台覆盖率（NAS） | 未提及 | 84% 明确标注 |
| 多平台部署文档 | 仅 Linux Docker | 8 工具 × 4 平台 |

---

## 八、下一步行动

1. **第一批用户测试** — 用 8 个高质量多平台说明的工具获取用户反馈
2. **根据反馈决定第二批工具顺序** — 如果 NAS 用户多，优先 Home Assistant / Paperless-ngx
3. **部署向导平台感知** — 当用户选择 Windows 时，自动避免 80/443 端口冲突
4. **简化 Linux VPS 之外平台的 Agent 逻辑** — Windows/Mac/NAS 重点是准确的文档，而非自动化

---

> 原则：不猜测用户想要什么。先发布 8 个高质量的多平台工具说明，收集反馈后再决定第二批。
> 下一步：用户测试 → 反馈 → 优先级排序。
