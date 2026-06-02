#!/usr/bin/env bash
# =============================================================
#  Awesome Toolkit - 卸载脚本
#  用法: curl -fsSL <URL>/deploy/uninstall.sh | bash -s -- <tool-id>
# =============================================================
set -euo pipefail

TOOL_ID="${1:-}"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

INSTALL_DIR="$HOME/awesome-tools/${TOOL_ID}"

if [ -z "$TOOL_ID" ]; then
  echo -e "${RED}❌ 请指定要卸载的工具 ID${NC}"
  echo "用法: curl -fsSL <URL>/deploy/uninstall.sh | bash -s -- <工具ID>"
  exit 1
fi

if [ ! -d "$INSTALL_DIR" ]; then
  echo -e "${YELLOW}⚠ 未找到 ${TOOL_ID} 的安装目录 (${INSTALL_DIR})${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}🗑️  准备卸载: ${TOOL_ID}${NC}"
echo -e "   安装目录: ${INSTALL_DIR}"
echo ""

cd "$INSTALL_DIR"

# Stop and remove containers
if docker compose version &>/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
else
  COMPOSE_CMD="docker-compose"
fi

echo "   停止并删除容器..."
$COMPOSE_CMD down --volumes --remove-orphans 2>/dev/null || true

echo "   删除安装目录..."
cd "$HOME"
rm -rf "$INSTALL_DIR"

echo ""
echo -e "${GREEN}✅ ${TOOL_ID} 已卸载${NC}"
echo -e "   ${YELLOW}注意: 数据文件（数据库、上传内容等）已随容器一起删除${NC}"
echo ""
