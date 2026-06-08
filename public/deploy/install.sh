#!/usr/bin/env bash
# =============================================================
#  Awesome Toolkit - 一键部署脚本
#  用法: curl -fsSL <URL>/deploy/install.sh | bash -s -- <tool-id>
#  示例: curl -fsSL <URL>/deploy/install.sh | bash -s -- uptime-kuma
# =============================================================
set -euo pipefail

TOOL_ID="${1:-}"
BASE_URL="https://awesome-toolkit.pages.dev"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ -z "$TOOL_ID" ]; then
  echo -e "${RED}错误：请指定要部署的工具 ID${NC}"
  echo ""
  echo "用法: curl -fsSL ${BASE_URL}/deploy/install.sh | bash -s -- <工具ID>"
  echo ""
  echo "可用的工具 ID："
  echo "  uptime-kuma     - 网站监控"
  echo "  n8n             - 工作流自动化"
  echo "  immich          - 照片备份管理"
  echo "  stirling-pdf    - PDF 全能工具箱"
  echo "  vaultwarden     - 密码保险箱"
  echo "  adguard-home    - 全屋广告拦截"
  echo "  changedetection-io - 网页变化监控"
  echo "  paperless-ngx   - 文档扫描管理"
  echo "  home-assistant  - 智能家居中枢"
  echo "  open-webui      - AI 聊天界面"
  echo "  dify            - AI 应用搭建平台"
  echo "  langflow        - AI 流程可视化"
  echo "  metabase        - 数据分析图表"
  echo "  grafana         - 监控仪表盘"
  echo "  apache-superset - 数据可视化BI"
  exit 1
fi

COMPOSE_URL="${BASE_URL}/deploy/tools/${TOOL_ID}/docker-compose.yml"
INSTALL_DIR="$HOME/awesome-tools/${TOOL_ID}"

echo ""
echo -e "${CYAN}==============================================================${NC}"
echo -e "${CYAN}       Awesome Toolkit - 一键部署工具              ${NC}"
echo -e "${CYAN}==============================================================${NC}"
echo ""
echo -e "  准备部署: ${GREEN}${TOOL_ID}${NC}"
echo -e "  安装目录: ${INSTALL_DIR}"
echo ""

# ── Step 1: Check OS ──
echo -e "${YELLOW}[1/5]${NC} 检测操作系统..."

if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
  OS_VERSION=$VERSION_ID
else
  echo -e "${RED}无法检测操作系统版本${NC}"
  exit 1
fi

echo -e "      ✓ 系统: ${GREEN}${OS} ${OS_VERSION}${NC}"

# ── Step 2: Install Docker ──
echo -e "${YELLOW}[2/5]${NC} 检查 Docker..."

if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
  echo -e "      ✓ Docker 已安装: $(docker --version)"
else
  echo "      正在安装 Docker..."
  case "$OS" in
    ubuntu|debian)
      curl -fsSL https://get.docker.com | bash
      ;;
    centos|rhel|fedora|rocky|almalinux)
      curl -fsSL https://get.docker.com | bash
      ;;
    arch|manjaro)
      sudo pacman -S --noconfirm docker
      sudo systemctl enable --now docker
      ;;
    *)
      echo -e "${RED}不支持的操作系统: ${OS}${NC}"
      echo "   请手动安装 Docker 后重试: https://docs.docker.com/engine/install/"
      exit 1
      ;;
  esac

  # 把当前用户加入 docker 组，避免每次都要 sudo
  if [ "$(id -u)" -ne 0 ] && ! groups | grep -q docker; then
    sudo usermod -aG docker "$USER" 2>/dev/null || true
    echo -e "      ${YELLOW}  可能需要重新登录才能免 sudo 使用 Docker${NC}"
  fi

  echo -e "      ✓ Docker 安装完成"
fi

# Ensure docker commands work — handle non-root fresh install where
# the docker group hasn't taken effect for the current session
if docker info &>/dev/null 2>&1; then
  DOCKER_CMD="docker"
  SUDO=""
elif sudo docker info &>/dev/null 2>&1; then
  DOCKER_CMD="sudo docker"
  SUDO="sudo"
  echo -e "      ${YELLOW}  使用 sudo 运行 Docker（当前用户不在 docker 组）${NC}"
else
  echo -e "${RED}Docker 安装后无法连接。请重新登录后再运行此脚本。${NC}"
  exit 1
fi

# Check Docker Compose (plugin or standalone)
if $DOCKER_CMD compose version &>/dev/null 2>&1; then
  echo -e "      ✓ Docker Compose (plugin) 可用"
  COMPOSE_CMD="compose"
elif command -v docker-compose &>/dev/null && docker-compose version &>/dev/null 2>&1; then
  echo -e "      ✓ Docker Compose (standalone) 可用"
  COMPOSE_CMD="docker-compose"
else
  echo "      安装 Docker Compose plugin..."
  DOCKER_CONFIG="${DOCKER_CONFIG:-$HOME/.docker}"
  mkdir -p "$DOCKER_CONFIG"/cli-plugins
  COMPOSE_VERSION=$(curl -fsSL https://api.github.com/repos/docker/compose/releases/latest | grep -o '"tag_name": "[^"]*"' | head -1 | cut -d'"' -f4)
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)  COMPOSE_ARCH="x86_64" ;;
    aarch64|arm64) COMPOSE_ARCH="aarch64" ;;
    *) echo -e "${RED}不支持的架构: ${ARCH}${NC}"; exit 1 ;;
  esac
  sudo curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-${COMPOSE_ARCH}" -o /usr/local/lib/docker/cli-plugins/docker-compose 2>/dev/null || \
    sudo curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-${COMPOSE_ARCH}" -o /usr/libexec/docker/cli-plugins/docker-compose 2>/dev/null || \
    mkdir -p "$DOCKER_CONFIG/cli-plugins" && curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-${COMPOSE_ARCH}" -o "$DOCKER_CONFIG/cli-plugins/docker-compose" && chmod +x "$DOCKER_CONFIG/cli-plugins/docker-compose"
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose 2>/dev/null || true
  sudo chmod +x /usr/libexec/docker/cli-plugins/docker-compose 2>/dev/null || true
  COMPOSE_CMD="compose"
  echo -e "      ✓ Docker Compose 安装完成"
fi

# ── Step 3: Create directories and download compose file ──
echo -e "${YELLOW}[3/5]${NC} 下载部署配置..."

mkdir -p "$INSTALL_DIR"/data

COMPOSE_FILE="${INSTALL_DIR}/docker-compose.yml"
if curl -fsSL "$COMPOSE_URL" -o "$COMPOSE_FILE"; then
  echo -e "      ✓ docker-compose.yml 下载成功"
else
  echo -e "${RED}下载失败: ${COMPOSE_URL}${NC}"
  exit 1
fi

# ── Step 4: Start services ──
echo -e "${YELLOW}[4/5]${NC} 启动服务..."

cd "$INSTALL_DIR"

# Re-detect compose command (handles case where compose was just installed above)
if [ "${COMPOSE_CMD:-}" = "compose" ]; then
  $DOCKER_CMD compose pull 2>/dev/null || true
  $DOCKER_CMD compose up -d
elif [ "${COMPOSE_CMD:-}" = "docker-compose" ]; then
  $SUDO docker-compose pull 2>/dev/null || true
  $SUDO docker-compose up -d
elif $DOCKER_CMD compose version &>/dev/null 2>&1; then
  $DOCKER_CMD compose pull 2>/dev/null || true
  $DOCKER_CMD compose up -d
  COMPOSE_CMD="compose"
else
  $SUDO docker-compose pull 2>/dev/null || true
  $SUDO docker-compose up -d
  COMPOSE_CMD="docker-compose"
fi

echo -e "      ✓ 容器已启动"

# ── Step 5: Print success info ──
echo -e "${YELLOW}[5/5]${NC} 部署完成！"

# 获取服务器 IP
SERVER_IP=$(curl -fsSL -4 ifconfig.me 2>/dev/null || curl -fsSL -4 ipinfo.io/ip 2>/dev/null || echo "你的服务器IP")

echo ""
echo -e "${GREEN}==============================================================${NC}"
echo -e "${GREEN}              部署成功！                              ${NC}"
echo -e "${GREEN}==============================================================${NC}"
echo ""
echo -e "   安装目录: ${INSTALL_DIR}"
echo -e "   服务器IP: ${SERVER_IP}"
echo ""

# Read post-deploy URL from the compose file's metadata comment or use default
# The compose file includes a special comment with post-deploy info
POST_DEPLOY_URL=$(grep -oP '# POST_DEPLOY_URL=\K.*' "$COMPOSE_FILE" 2>/dev/null || echo "")
POST_DEPLOY_MSG=$(grep -oP '# POST_DEPLOY_MSG=\K.*' "$COMPOSE_FILE" 2>/dev/null || echo "")

if [ -z "$POST_DEPLOY_URL" ]; then
  # Fallback: parse port from compose file
  PORT=$(grep -oP 'ports:.*\n.*\d+:(\d+)' "$COMPOSE_FILE" 2>/dev/null | grep -oP '\d+(?=:?\d*$)' | head -1 || echo "")
  if [ -n "$PORT" ]; then
    POST_DEPLOY_URL="http://${SERVER_IP}:${PORT}"
  fi
fi

if [ -n "$POST_DEPLOY_URL" ]; then
  POST_DEPLOY_URL=$(echo "$POST_DEPLOY_URL" | sed "s/你的服务器IP/${SERVER_IP}/g")
  echo -e "   访问地址: ${GREEN}${POST_DEPLOY_URL}${NC}"
fi

echo ""
echo -e "${YELLOW}--------------------------------------------------------------${NC}"
echo -e "   常用管理命令:"
echo -e "     cd ${INSTALL_DIR}"
if [ "${COMPOSE_CMD:-}" = "docker-compose" ]; then
  echo -e "     docker-compose ps             # 查看运行状态"
  echo -e "     docker-compose logs -f        # 查看实时日志"
  echo -e "     docker-compose restart        # 重启服务"
  echo -e "     docker-compose down           # 停止服务"
  echo -e "     docker-compose up -d          # 重新启动"
  echo -e "     docker-compose pull && docker-compose up -d  # 更新到最新版"
else
  echo -e "     docker compose ps             # 查看运行状态"
  echo -e "     docker compose logs -f        # 查看实时日志"
  echo -e "     docker compose restart        # 重启服务"
  echo -e "     docker compose down           # 停止服务"
  echo -e "     docker compose up -d          # 重新启动"
  echo -e "     docker compose pull && docker compose up -d  # 更新到最新版"
fi
echo ""
echo -e "   卸载命令:"
echo -e "     curl -fsSL ${BASE_URL}/deploy/uninstall.sh | bash -s -- ${TOOL_ID}"
echo ""
echo -e "   小提示: 等待 10-30 秒让服务完全启动后再访问"
echo -e "${YELLOW}--------------------------------------------------------------${NC}"
echo ""

# ── Firewall / Security Group Notice ──
echo -e "${YELLOW}==============================================================${NC}"
echo -e "${YELLOW}  !! 重要：防火墙 / 安全组设置                          ${NC}"
echo -e "${YELLOW}==============================================================${NC}"
echo ""
echo -e "  如果浏览器打不开上面的访问地址，可能是防火墙没放行端口。"
echo ""
echo -e "  云服务器（阿里云/腾讯云等）："
echo -e "     进入控制台 -> 安全组 -> 添加入方向规则 -> 放行端口 TCP"
echo ""
PORT_HINT=$(grep -oP '^\s*-\s*"?\K\d+(?=:\d+)' "$COMPOSE_FILE" 2>/dev/null | head -1 || echo "")
if [ -n "$PORT_HINT" ]; then
  echo -e "     你需要放行的端口：${GREEN}${PORT_HINT}${NC}（TCP）"
fi
echo ""
echo -e "  如果服务器上有 ufw 防火墙，运行："
if [ -n "$PORT_HINT" ]; then
  echo -e "     sudo ufw allow ${PORT_HINT}/tcp"
else
  echo -e "     sudo ufw allow <端口号>/tcp"
fi
echo ""
echo -e "  放行端口后刷新浏览器即可访问"
echo ""

echo -e "  由 Awesome Toolkit 提供支持"
echo -e "  更多工具: ${BASE_URL}"
echo ""
