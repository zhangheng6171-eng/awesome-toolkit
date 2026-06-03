interface Env {
  DEPLOY_KV: KVNamespace;
}

const BASE_URL = 'https://awesome-toolkit.pages.dev';

export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: {
      toolId: string;
      host: string;
      port?: number;
      token: string;
      envValues?: Record<string, string>;
    } = await context.request.json();

    const { toolId, host, token, envValues = {} } = body;
    const port = body.port || 9876;

    if (!toolId || !host || !token) {
      return new Response(JSON.stringify({ error: '缺少必填参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch compose file from our static site
    const composeUrl = `${BASE_URL}/deploy/tools/${toolId}/docker-compose.yml`;
    const composeRes = await fetch(composeUrl);
    if (!composeRes.ok) {
      return new Response(JSON.stringify({ error: `工具 ${toolId} 暂不支持部署` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const composeContent = await composeRes.text();

    // Proxy to Agent's /execute endpoint
    const agentUrl = `http://${host}:${port}/execute`;
    const agentRes = await fetch(agentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Token': token,
      },
      body: JSON.stringify({ tool_id: toolId, compose_content: composeContent, env_values: envValues }),
    });

    if (!agentRes.ok) {
      const errText = await agentRes.text();
      return new Response(JSON.stringify({ error: `Agent 请求失败: ${errText}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save deploy record to KV (requires auth)
    const userEmail = context.request.headers.get('Cf-Access-Authenticated-User-Email');
    if (userEmail) {
      const record = {
        userEmail,
        toolId,
        host,
        timestamp: Date.now(),
        status: 'deployed',
      };
      await context.env.DEPLOY_KV.put(
        `deploy:${userEmail}:${Date.now()}`,
        JSON.stringify(record)
      );
    }

    // Stream the SSE from Agent back to browser
    return new Response(agentRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
