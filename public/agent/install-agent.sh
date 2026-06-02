#!/bin/bash
# Awesome Toolkit Agent — one-line installer
# Run on your server: curl -fsSL https://awesome-toolkit.pages.dev/agent/install-agent.sh | bash

set -e

AGENT_PORT=9876
INSTALL_DIR="$HOME/.awesome-tools-agent"
SCRIPT_URL="https://awesome-toolkit.pages.dev/agent/agent.py"

echo "============================================"
echo "  Awesome Toolkit Agent 安装脚本"
echo "============================================"
echo ""

# Check Python
PYTHON=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        PYTHON="$cmd"
        break
    fi
done

if [ -z "$PYTHON" ]; then
    echo "未找到 Python，正在安装..."
    if command -v apt-get &>/dev/null; then
        sudo apt-get update -qq && sudo apt-get install -y -qq python3
        PYTHON="python3"
    elif command -v yum &>/dev/null; then
        sudo yum install -y -q python3
        PYTHON="python3"
    elif command -v apk &>/dev/null; then
        sudo apk add --no-cache python3
        PYTHON="python3"
    else
        echo "错误：无法自动安装 Python，请手动安装 Python 3.6+ 后重试"
        exit 1
    fi
fi

echo "Python: $($PYTHON --version)"

# Create install directory
mkdir -p "$INSTALL_DIR"

# Download agent
echo "下载 Agent..."
curl -fsSL "$SCRIPT_URL" -o "$INSTALL_DIR/agent.py"
chmod +x "$INSTALL_DIR/agent.py"

# Stop existing agent if running
if pgrep -f "agent.py" &>/dev/null; then
    echo "停止旧 Agent..."
    pkill -f "agent.py" 2>/dev/null || true
    sleep 1
fi

# Start agent in background
echo "启动 Agent (端口 $AGENT_PORT)..."
nohup "$PYTHON" "$INSTALL_DIR/agent.py" > "$INSTALL_DIR/agent.log" 2>&1 &
AGENT_PID=$!

sleep 2

# Check if agent is running
if kill -0 $AGENT_PID 2>/dev/null; then
    TOKEN=$(cat "$HOME/.awesome-tools-agent-token" 2>/dev/null || echo "")
    echo ""
    echo "============================================"
    echo "  Agent 安装成功!"
    echo "============================================"
    echo ""
    echo "  你的 Token (复制此内容):"
    echo "  $TOKEN"
    echo ""
    echo "  Agent 端口: $AGENT_PORT"
    echo "  日志文件: $INSTALL_DIR/agent.log"
    echo ""
    echo "  下一步：回到网站部署向导，填入服务器 IP 和 Token"
    echo "============================================"
else
    echo "错误：Agent 启动失败，查看日志: $INSTALL_DIR/agent.log"
    exit 1
fi
