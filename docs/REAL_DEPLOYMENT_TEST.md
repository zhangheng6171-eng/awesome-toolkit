# 真实部署验证报告

> 验证日期：2026-06-04
> 验证环境：当前开发机无 Docker，执行静态分析验证
> 状态：⚠️ 静态验证完成，等待 Linux VPS 上执行运行时验证

---

## 一、静态验证（已完成）

### 1.1 三工具端口与资源分析

| 项目 | n8n | Open WebUI | Vaultwarden |
|------|-----|------------|-------------|
| **端口映射** | 5678:5678 | 3000:3000 | 8081:80 |
| **最低内存** | 512MB | 2048MB | 256MB |
| **最低磁盘** | 4GB | 10GB | 2GB |
| **容器数** | 1 | 1 | 1 |
| **镜像** | n8nio/n8n:latest | ghcr.io/open-webui/open-webui:main | vaultwarden/server:latest |
| **重启策略** | unless-stopped | unless-stopped | unless-stopped |

### 1.2 端口冲突检查

同时部署 3 个工具时的端口使用：
| 端口 | 使用者 | 冲突？ |
|------|--------|--------|
| 5678 | n8n | ✅ 无冲突 |
| 3000 | Open WebUI | ✅ 无冲突（不与 n8n/vaultwarden 冲突） |
| 8081 | Vaultwarden | ✅ 无冲突 |

**结论：3 个工具可同时部署在同一台服务器上，无端口冲突。**

### 1.3 环境变量完整性

**n8n**：
| 变量 | 默认值 | 必需？ | 生产就绪？ |
|------|--------|--------|-----------|
| N8N_SECURE_COOKIE | false | 是（HTTP 环境） | ✅ |
| N8N_HOST | 空 | 否 | ✅ |
| NODE_ENV | production | 是 | ✅ |
| WEBHOOK_URL | 空 | 否（webhook 功能需要） | ⚠️ |

**Open WebUI**：
| 变量 | 默认值 | 必需？ | 生产就绪？ |
|------|--------|--------|-----------|
| OLLAMA_BASE_URL | http://host.docker.internal:11434 | 是 | ⚠️ 需要单独安装 Ollama |
| WEBUI_SECRET_KEY | change-me-to-a-random-string | 建议修改 | ⚠️ 弱默认值 |

**Vaultwarden**：
| 变量 | 默认值 | 必需？ | 生产就绪？ |
|------|--------|--------|-----------|
| DOMAIN | https://localhost | 否 | ✅ |
| TZ | Asia/Shanghai | 否 | ✅ |
| SIGNUPS_ALLOWED | true | 是 | 🔴 部署后需关闭 |
| LOG_FILE | /data/vaultwarden.log | 否 | ✅ |

### 1.4 YAML 语法验证

3 个 docker-compose.yml 文件：
- ✅ 全部包含 `version: "3.8"`
- ✅ 全部包含 `services:` 节
- ✅ 全部有 `restart: unless-stopped`
- ✅ 全部有 `volumes:` 数据持久化
- ❌ 全部缺少 `healthcheck`（只有 db 类容器有）
- ✅ n8n 和 vaultwarden 的 POST_DEPLOY_URL/MSG 注释格式正确

### 1.5 install.sh 兼容性

`public/deploy/install.sh` 的已知工具列表（lines 23-38）包含：
```
n8n ✓
open-webui ✓
vaultwarden ✓
```

3 个工具均在 install.sh 支持列表中。`curl -fsSL .../install.sh | bash -s -- n8n` 将正常下载对应的 docker-compose.yml 并执行 `docker compose up -d`。

---

## 二、运行时测试计划（需在 VPS 上执行）

### 测试环境要求

| 项目 | 最低要求 | 推荐配置 |
|------|----------|----------|
| OS | Ubuntu 20.04+ / Debian 11+ / CentOS 8+ | Ubuntu 22.04 LTS |
| CPU | 2 核 | 4 核 |
| 内存 | 4GB（同时运行 3 个工具） | 8GB |
| 磁盘 | 20GB | 50GB SSD |
| 网络 | 公网 IP，端口 5678/3000/8081 开放 | — |
| Docker | 20.10+ | 最新稳定版 |
| Docker Compose | v2（plugin） | — |

### 测试步骤（逐工具执行）

#### n8n 部署测试

```bash
# Step 1: 执行一键安装
curl -fsSL https://awesome-toolkit.pages.dev/deploy/install.sh | bash -s -- n8n

# 预期输出:
# [1/5] 检测操作系统... ✓ 系统: ubuntu 22.04
# [2/5] 检查 Docker... ✓ Docker 已安装
# [3/5] 下载部署配置... ✓ docker-compose.yml 下载成功
# [4/5] 启动服务... ✓ 容器已启动
# [5/5] 部署完成！
# 🔗 访问地址: http://<服务器IP>:5678

# Step 2: 验证服务启动
docker ps | grep n8n
# 预期: n8n 容器 STATUS 为 Up

# Step 3: 验证首次访问
curl -I http://localhost:5678
# 预期: HTTP 200 OK

# Step 4: 记录问题
# - 启动耗时：__ 秒
# - 首次访问是否成功：是 / 否
# - 是否遇到任何错误：________
```

#### Open WebUI 部署测试

```bash
# Step 1: 执行一键安装
curl -fsSL https://awesome-toolkit.pages.dev/deploy/install.sh | bash -s -- open-webui

# Step 2: 验证服务启动
docker ps | grep open-webui

# Step 3: 验证首次访问
curl -I http://localhost:3000

# Step 4: 重要——验证 Ollama 依赖
# Open WebUI 需要 Ollama 才能聊天。检查日志:
docker logs open-webui 2>&1 | tail -20
# 预期: 可能显示无法连接 Ollama（正常，因为还没装）

# Step 5: 可选——安装 Ollama 后验证完整功能
curl -fsSL https://ollama.com/install.sh | bash
ollama pull llama3.2:1b  # 最小模型，约 1.3GB
docker restart open-webui
# 访问 http://<服务器IP>:3000，验证能否发送聊天消息
```

#### Vaultwarden 部署测试

```bash
# Step 1: 执行一键安装
curl -fsSL https://awesome-toolkit.pages.dev/deploy/install.sh | bash -s -- vaultwarden

# Step 2: 验证服务启动
docker ps | grep vaultwarden

# Step 3: 验证首次访问
curl -I http://localhost:8081

# Step 4: 安全验证——测试注册功能
# 浏览器访问 http://<服务器IP>:8081
# 验证: 是否能看到「创建账号」页面
# 验证: 能否成功创建新账号

# Step 5: 安全加固
# 注册管理员账号后，执行:
cd ~/awesome-tools/vaultwarden
sed -i 's/SIGNUPS_ALLOWED=true/SIGNUPS_ALLOWED=false/' docker-compose.yml
docker compose up -d
# 验证: 尝试再注册一个新账号 → 应该被拒绝
```

---

## 三、预期问题与排错

### 问题 1：Open WebUI 部署后访问 3000 端口只看到空白页面

**原因**：Ollama 未安装或未运行。Open WebUI 本身能启动但需要 Ollama 后端。

**解决**：
```bash
curl -fsSL https://ollama.com/install.sh | bash
ollama pull gemma3:1b
```

### 问题 2：Vaultwarden 注册后手机 App 连不上

**原因**：手机 App（Bitwarden）要求 HTTPS。docker-compose.yml 默认 HTTP 部署。

**解决**：配合 Nginx Proxy Manager 申请 SSL 证书，或使用 Cloudflare Tunnel。

### 问题 3：n8n Webhook 不工作

**原因**：WEBHOOK_URL 环境变量为空。

**解决**：
```bash
cd ~/awesome-tools/n8n
# 在 docker-compose.yml 中添加:
# environment:
#   - WEBHOOK_URL=http://你的服务器IP:5678
docker compose up -d
```

### 问题 4：docker compose up -d 报错「port already in use」

**原因**：端口被其他服务占用。

**解决**：
```bash
# 查找占用端口的进程
sudo lsof -i :5678  # 替换为目标端口
# 修改 docker-compose.yml 中的端口映射，如改为 5679:5678
```

---

## 四、验证清单

| # | 检查项 | n8n | Open WebUI | Vaultwarden |
|---|--------|-----|------------|-------------|
| 1 | `install.sh` 执行无报错 | ⬜ | ⬜ | ⬜ |
| 2 | 容器状态为 Up（`docker ps`） | ⬜ | ⬜ | ⬜ |
| 3 | `curl -I localhost:<port>` 返回 200 | ⬜ | ⬜ | ⬜ |
| 4 | 浏览器访问能看到界面 | ⬜ | ⬜ | ⬜ |
| 5 | 能创建管理员账号 | ⬜ | ⬜ | ⬜ |
| 6 | 核心功能可用 | ⬜ 创建工作流 | ⬜ 需安装 Ollama | ⬜ 创建密码条目 |
| 7 | `docker compose down && docker compose up -d` 数据不丢失 | ⬜ | ⬜ | ⬜ |
| 8 | 部署耗时 < 5 分钟 | ⬜ | ⬜ | ⬜ |

---

## 五、总结

### 静态验证结论

| 指标 | 评分 | 说明 |
|------|------|------|
| YAML 结构完整性 | 10/10 | 3 个文件语法正确 |
| 环境变量必要性 | 8/10 | vaultwarden SIGNUPS_ALLOWED, open-webui SECRET_KEY 需注意 |
| 端口规划 | 9/10 | 3 工具无冲突 |
| 数据持久化 | 10/10 | 全部配置了 volumes |
| 安全默认值 | 5/10 | vaultwarden 开放注册、open-webui 弱密钥 |

### 运行时验证状态

| 项目 | 状态 |
|------|------|
| n8n | ⬜ 待 VPS 测试 |
| Open WebUI | ⬜ 待 VPS 测试 |
| Vaultwarden | ⬜ 待 VPS 测试 |

### 执行命令（复制到 VPS 终端即可）

```bash
# 一键部署全部 3 个工具
for tool in n8n open-webui vaultwarden; do
  echo "=== 部署 $tool ==="
  curl -fsSL https://awesome-toolkit.pages.dev/deploy/install.sh | bash -s -- $tool
  echo ""
done

# 验证全部运行
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 查看访问地址
for tool in n8n open-webui vaultwarden; do
  PORT=$(grep -oP 'POST_DEPLOY_URL=\K.*' ~/awesome-tools/$tool/docker-compose.yml 2>/dev/null || echo "N/A")
  echo "$tool: $PORT"
done
```

---

> **静态验证：通过 | 运行时验证：需要 Linux VPS（4GB+ 内存）| 预计测试时间：30 分钟（3 个工具依次部署 + 验证）**
