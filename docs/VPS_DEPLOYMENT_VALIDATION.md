# VPS 部署静态验证报告

> 审计日期：2026-06-08
> 审计范围：Immich / Vaultwarden / Stirling PDF
> 方法：代码审查 + 配置对照 + 链路追踪
> 状态：静态分析完成，运行时测试未执行

---

## 一、三工具概览

| 维度 | Immich | Vaultwarden | Stirling PDF |
|------|--------|-------------|-------------|
| 容器数 | 3 (server+pg+redis) | 1 | 1 |
| 最低内存 | 4096MB | 256MB | 512MB |
| 端口 | 2283 | 8081 | 8080 |
| 有无 healthcheck | ✅ DB + Redis | ❌ 无 | ❌ 无 |
| 有无 env_vars 文档 | ✅ 2 个 | ❌ 无 | ❌ 无 |
| 有无 setup_notes | ❌ 无 | ❌ 无 | ❌ 无 |
| 部署复杂度 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| install.sh 兼容 | ✅ | ✅ | ✅ |

---

## 二、逐工具审计

### 2.1 Immich — 照片备份

**docker-compose.yml 审查：**

| 检查项 | 状态 | 详情 |
|--------|------|------|
| YAML 语法 | ✅ | 正确 |
| 端口映射 | ✅ | 2283:2283 |
| 数据持久化 | ✅ | ./data/photos, ./data/library, ./data/db |
| 环境变量完整性 | ⚠️ | DB_PASSWORD 默认 `changeMe123!`，弱密码 |
| 重启策略 | ✅ | unless-stopped |
| 依赖声明 | ✅ | depends_on + condition: service_healthy |
| DB healthcheck | ✅ | pg_isready, 10s 间隔, 5 次重试 |
| Redis healthcheck | ✅ | redis-cli ping, 10s 间隔, 5 次重试 |
| Server healthcheck | ❌ | 无，server 容器没有健康检查 |
| 镜像固定版本 | ⚠️ | `immich-server:release` 用 `release` 标签，非具体版本号 |

**环境变量审计：**

| 变量 | 默认值 | 风险 |
|------|--------|------|
| DB_PASSWORD | `changeMe123!` | 🔴 弱密码，但首次部署可接受 |
| DB_HOSTNAME | `immich-db` | ✅ 正确 |
| DB_USERNAME | `postgres` | ✅ 正确 |

**已知失败点：**

| # | 失败点 | 原因 | 影响 |
|---|--------|------|------|
| 1 | 内存不足 | 最低 4GB，2GB VPS 会 OOM | 🔴 DB 进程被杀，启动失败 |
| 2 | Postgres 初始化慢 | pgvecto-rs 首次启动需 30-60s | 🟡 用户以为失败，提前中断 |
| 3 | 磁盘不足 | 照片备份需要 50GB+ | 🟡 初期无感，使用后填满 |
| 4 | install.sh 数据目录权限 | pg 容器写 data/db 时需要正确 UID | 🟡 部分系统遇到 permission denied |
| 5 | 没有 server healthcheck | server 启动后 postgres 还没 ready | 🟡 docker compose up -d 后命令返回但实际未工作 |

---

### 2.2 Vaultwarden — 密码管理

**docker-compose.yml 审查：**

| 检查项 | 状态 | 详情 |
|--------|------|------|
| YAML 语法 | ✅ | 正确 |
| 端口映射 | ✅ | 8081:80 |
| 数据持久化 | ✅ | ./data:/data |
| 环境变量完整性 | ⚠️ | DOMAIN 默认 localhost，对新手无意义 |
| 安全默认值 | ✅ | SIGNUPS_ALLOWED=false（P1 修复后） |
| 重启策略 | ✅ | unless-stopped |
| Healthcheck | ❌ | 无 |
| 镜像固定版本 | ⚠️ | `vaultwarden/server:latest` |

**环境变量审计：**

| 变量 | 默认值 | 风险 |
|------|--------|------|
| DOMAIN | `https://${DOMAIN:-localhost}` | 🟡 默认 localhost 对公网无意义 |
| SIGNUPS_ALLOWED | `false` | ⚠️ 首次部署需要用户手动改 true |
| TZ | `Asia/Shanghai` | ✅ 时区正确 |

**已知失败点：**

| # | 失败点 | 原因 | 影响 |
|---|--------|------|------|
| 1 | HTTP 而非 HTTPS | 移动端 Bitwarden App 要求 HTTPS | 🔴 手机 App 无法连接 |
| 2 | SIGNUPS_ALLOWED=false | 用户不知要改配置才能注册 | 🔴 访问后无法创建账号 |
| 3 | DOMAIN 配置 | 默认值导致 WebSocket 通知失败 | 🟡 登录后 WebSocket 报错 |
| 4 | 无防火墙提示 | 8081 端口未开放导致无法访问 | 🟡 云服务器安全组未放行 |
| 5 | 浏览器安全警告 | HTTP 连接被标记为不安全 | 🟡 用户以为网站坏了 |

---

### 2.3 Stirling PDF — PDF 处理

**docker-compose.yml 审查：**

| 检查项 | 状态 | 详情 |
|--------|------|------|
| YAML 语法 | ✅ | 正确 |
| 端口映射 | ✅ | 8080:8080 |
| 数据持久化 | ✅ | trainingData + extraConfigs + logs |
| 环境变量完整性 | ✅ | 中文 OCR + 禁用高级 HTML 操作 |
| 安全默认值 | ✅ | DOCKER_ENABLE_SECURITY=true（P1 修复后） |
| 重启策略 | ✅ | unless-stopped |
| Healthcheck | ❌ | 无 |
| 镜像固定版本 | ⚠️ | `frooodle/s-pdf:latest` |

**已知失败点：**

| # | 失败点 | 原因 | 影响 |
|---|--------|------|------|
| 1 | 安全模式无默认密码 | DOCKER_ENABLE_SECURITY=true 但无初始密码说明 | 🔴 用户无法登录 |
| 2 | OCR 数据下载 | 首次使用中文 OCR 需下载语言包 | 🟡 第一次处理中文 PDF 等待较长 |
| 3 | 内存不足处理大 PDF | 默认只给 512MB，大 PDF 可能 OOM | 🟡 100MB+ PDF 处理时容器被 kill |
| 4 | 文件大小限制 | 默认上传限制 ~50MB | 🟡 用户不知，上传大文件失败 |
| 5 | 临时文件清理 | 处理的文件会留存在容器内 | 🟢 长期运行磁盘占用增加 |

---

## 三、install.sh 通用问题

| # | 问题 | 影响范围 | 说明 |
|---|------|---------|------|
| 1 | **无防火墙配置** | 全部 | 云服务器默认 blocked 非标准端口，install.sh 不提示开放端口 |
| 2 | **无 HTTPS** | 全部 | 所有工具 HTTP 明文访问，浏览器显示不安全 |
| 3 | **Docker Compose v1 兼容** | 全部 | install.sh 尝试兼容 docker-compose v1，但代码路径未测试 |
| 4 | **SELinux 未处理** | CentOS/RHEL | SELinux 可能阻止 Docker 挂载卷，install.sh 不检查 |
| 5 | **docker 组免 sudo** | 全部 | 脚本提示"可能需要重新登录"，非技术用户不知如何重新登录 |
| 6 | **代理/镜像加速** | 中国用户 | 无 Docker 镜像加速器提示，`docker pull` 可能极慢或失败 |

---

## 四、Agent 部署路径（WizardClient）

**现状：** WizardClient.tsx 调用 `/api/deploy/connect` → 轮询 agent 在线状态。

**风险：**
1. Agent 本身是否存在？未在仓库中看到 `agent.py` 源码
2. `/api/deploy/connect` 端点是否真实可用？生产环境未测试
3. Agent 轮询 30 次后自动超时，非技术用户不知如何处理

---

## 五、结论

### 可部署性评分

| 工具 | docker-compose 就绪 | install.sh 就绪 | 用户说明就绪 | 综合 |
|------|-------------------|----------------|-------------|------|
| Immich | ✅ | ✅ | ⚠️ | 🟡 内存要求过高，3 容器复杂 |
| Vaultwarden | ✅ | ✅ | ⚠️ | 🟡 HTTPS 问题阻塞移动端 |
| Stirling PDF | ✅ | ✅ | ❌ | 🔴 安全模式无密码说明 |

### 推荐测试顺序

1. **Stirling PDF** — 1 容器，512MB，最简单（但需先修复密码说明）
2. **Vaultwarden** — 1 容器，256MB，次简单（但移动端需 HTTPS）
3. **Immich** — 3 容器，4GB，最复杂

### 第一个测试：建议从 Vaultwarden 或 Stirling PDF 开始，趁早发现 HTTP/HTTPS 和防火墙问题。

---

> **静态验证结论：docker-compose 文件语法正确，install.sh 逻辑完整。主要风险在运行时（防火墙、HTTPS、内存不足、SELinux）。**
