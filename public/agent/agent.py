#!/usr/bin/env python3
"""Awesome Toolkit Agent — runs on user's server, receives deploy commands from the website.

No external dependencies. Requires Python 3.6+.
"""
import http.server
import json
import os
import secrets
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

PORT = 9876
TOKEN_FILE = os.path.expanduser("~/.awesome-tools-agent-token")
INSTALL_DIR = os.path.expanduser("~/awesome-tools")


def generate_token():
    token = secrets.token_hex(16)
    with open(TOKEN_FILE, "w") as f:
        f.write(token)
    os.chmod(TOKEN_FILE, 0o600)
    return token


def load_token():
    try:
        with open(TOKEN_FILE) as f:
            return f.read().strip()
    except Exception:
        return None


def check_docker():
    try:
        r = subprocess.run(
            ["docker", "--version"], capture_output=True, text=True, timeout=5
        )
        return r.returncode == 0, r.stdout.strip()
    except Exception:
        return False, "Docker not found"


def get_deployed_tools():
    tools = []
    base = Path(INSTALL_DIR)
    if base.exists():
        for d in base.iterdir():
            if d.is_dir():
                compose_file = d / "docker-compose.yml"
                if compose_file.exists():
                    # check status
                    try:
                        r = subprocess.run(
                            ["docker", "compose", "-f", str(compose_file), "ps", "--format", "json"],
                            capture_output=True, text=True, timeout=10, cwd=str(d),
                        )
                        status = "unknown"
                        if r.returncode == 0 and r.stdout.strip():
                            containers = [json.loads(line) for line in r.stdout.strip().split("\n") if line]
                            if all(c.get("State") == "running" for c in containers):
                                status = "running"
                            elif any(c.get("State") == "running" for c in containers):
                                status = "partial"
                            else:
                                status = "stopped"
                        tools.append({"id": d.name, "status": status})
                    except Exception:
                        tools.append({"id": d.name, "status": "unknown"})
    return tools


def get_system_info():
    try:
        import platform
        hostname = platform.node()
    except Exception:
        hostname = "unknown"

    docker_ok, docker_ver = check_docker()
    return {
        "status": "ok",
        "hostname": hostname,
        "docker_version": docker_ver if docker_ok else "not installed",
        "tools": get_deployed_tools(),
    }


def stream_execute(tool_id, compose_content, env_values, wfile):
    """Execute docker compose and stream logs via SSE."""
    tool_dir = Path(INSTALL_DIR) / tool_id
    tool_dir.mkdir(parents=True, exist_ok=True)

    def send(msg_type, message):
        data = json.dumps({"type": msg_type, "message": message})
        wfile.write(f"data: {data}\n\n".encode())
        wfile.flush()

    try:
        send("info", f"正在准备部署 {tool_id}...")

        # Write compose file
        compose_path = tool_dir / "docker-compose.yml"
        # Apply env overrides
        content = compose_content
        for key, val in env_values.items():
            content = content.replace(f"${{{key}}}", val)
        compose_path.write_text(content)
        send("info", "docker-compose.yml 写入完成")

        # Pull images
        send("info", "拉取 Docker 镜像（首次可能需要几分钟）...")
        proc = subprocess.Popen(
            ["docker", "compose", "pull"],
            cwd=str(tool_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        for line in proc.stdout:
            send("info", line.strip())
        proc.wait()
        if proc.returncode != 0:
            send("error", "镜像拉取失败")
            send("done", json.dumps({"success": False, "error": "镜像拉取失败"}))
            return
        send("success", "镜像拉取完成")

        # Start containers
        send("info", "启动容器...")
        proc = subprocess.Popen(
            ["docker", "compose", "up", "-d"],
            cwd=str(tool_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        for line in proc.stdout:
            send("info", line.strip())
        proc.wait()
        if proc.returncode != 0:
            send("error", "容器启动失败")
            send("done", json.dumps({"success": False, "error": "容器启动失败"}))
            return
        send("success", "容器启动成功")

        # Get server IP
        try:
            r = subprocess.run(
                ["curl", "-fsSL", "-4", "ifconfig.me"],
                capture_output=True, text=True, timeout=10,
            )
            server_ip = r.stdout.strip() if r.returncode == 0 else "你的服务器IP"
        except Exception:
            server_ip = "你的服务器IP"

        # Parse POST_DEPLOY_URL
        post_deploy_match = None
        for line in content.split("\n"):
            if line.startswith("# POST_DEPLOY_URL="):
                post_deploy_match = line
                break
        access_url = (
            post_deploy_match.split("=", 1)[1].replace("你的服务器IP", server_ip)
            if post_deploy_match
            else f"http://{server_ip}"
        )

        send("success", f"部署完成! 访问地址: {access_url}")
        send("done", json.dumps({"success": True, "accessUrl": access_url}))

    except Exception as e:
        send("error", f"部署异常: {str(e)}")
        send("done", json.dumps({"success": False, "error": str(e)}))


def uninstall_tool(tool_id):
    tool_dir = Path(INSTALL_DIR) / tool_id
    if not tool_dir.exists():
        return False, "工具未安装"
    try:
        subprocess.run(
            ["docker", "compose", "down", "-v"],
            cwd=str(tool_dir), capture_output=True, text=True, timeout=60,
        )
        import shutil
        shutil.rmtree(str(tool_dir))
        return True, "卸载成功"
    except Exception as e:
        return False, str(e)


class AgentHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[Agent] {args[0]}")

    def verify_token(self):
        auth = self.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            return auth[7:] == load_token()
        # also accept x-agent-token header
        token = self.headers.get("X-Agent-Token", "")
        return token == load_token()

    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization, X-Agent-Token, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization, X-Agent-Token, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()

    def do_GET(self):
        if self.path == "/status":
            if not self.verify_token():
                return self.send_json({"error": "unauthorized"}, 401)
            info = get_system_info()
            self.send_json(info)
        elif self.path == "/token":
            # Only allow localhost to read token
            if self.client_address[0] not in ("127.0.0.1", "::1", "localhost"):
                return self.send_json({"error": "forbidden"}, 403)
            token = load_token()
            self.send_json({"token": token})
        else:
            self.send_json({"error": "not found"}, 404)

    def do_POST(self):
        if self.path == "/execute":
            if not self.verify_token():
                return self.send_json({"error": "unauthorized"}, 401)

            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            tool_id = body.get("tool_id", "")
            compose_content = body.get("compose_content", "")
            env_values = body.get("env_values", {})

            if not tool_id or not compose_content:
                return self.send_json({"error": "missing tool_id or compose_content"}, 400)

            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            stream_execute(tool_id, compose_content, env_values, self.wfile)

        elif self.path == "/uninstall":
            if not self.verify_token():
                return self.send_json({"error": "unauthorized"}, 401)

            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            tool_id = body.get("tool_id", "")
            ok, msg = uninstall_tool(tool_id)
            self.send_json({"success": ok, "message": msg})

        else:
            self.send_json({"error": "not found"}, 404)


def main():
    token = load_token()
    if not token:
        token = generate_token()
        print(f"\n{'='*60}")
        print(f"  Agent Token: {token}")
        print(f"  已保存到: {TOKEN_FILE}")
        print(f"  复制此 Token，粘贴到网站部署向导中")
        print(f"{'='*60}\n")
    else:
        print(f"Agent Token 已加载 (from {TOKEN_FILE})")

    server = http.server.HTTPServer(("0.0.0.0", PORT), AgentHandler)
    print(f"Agent 已启动，监听端口 {PORT}")
    sys.stdout.flush()

    def shutdown(sig, frame):
        print("\n正在关闭 Agent...")
        server.shutdown()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)
    server.serve_forever()


if __name__ == "__main__":
    main()
