interface Env {
  WAITLIST_KV: KVNamespace;
  DEPLOY_KV: KVNamespace;
}

export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: { host: string; port?: number; token: string } = await context.request.json();

    const host = body.host?.trim();
    const port = body.port || 9876;
    const token = body.token?.trim();

    if (!host) {
      return new Response(JSON.stringify({ success: false, error: '请输入服务器 IP' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: '请输入 Agent Token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call the Agent's /status endpoint
    const agentUrl = `http://${host}:${port}/status`;
    const res = await fetch(agentUrl, {
      method: 'GET',
      headers: { 'X-Agent-Token': token },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return new Response(JSON.stringify({ success: false, error: 'Token 无效，请检查是否正确' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ success: false, error: `Agent 响应异常: HTTP ${res.status}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const info = await res.json() as { status: string; docker_version: string; hostname: string; tools: unknown[] };
    return new Response(JSON.stringify({
      success: true,
      hostname: info.hostname,
      dockerVersion: info.docker_version,
      installedTools: info.tools,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    if (msg.includes('timeout') || msg.includes('aborted')) {
      return new Response(JSON.stringify({ success: false, error: '连接超时：请确认 Agent 已安装并启动，且服务器防火墙开放了 9876 端口' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: false, error: `连接失败：${msg}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
