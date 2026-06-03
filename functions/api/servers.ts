interface Env {
  DEPLOY_KV: KVNamespace;
}

export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const userEmail = context.request.headers.get('Cf-Access-Authenticated-User-Email') || 'anonymous';

  try {
    // GET: list all servers for user
    if (context.request.method === 'GET') {
      const list = await context.env.DEPLOY_KV.list({ prefix: `server:${userEmail}:` });
      const servers: unknown[] = [];

      for (const key of list.keys) {
        const val = await context.env.DEPLOY_KV.get(key.name);
        if (val) {
          servers.push(JSON.parse(val));
        }
      }

      return new Response(JSON.stringify({ success: true, servers }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // POST: add or update a server
    if (context.request.method === 'POST') {
      const body: {
        id: string;
        host: string;
        port: number;
        name: string;
        installedTools?: { toolId: string; toolName: string; deployedAt: string; directory: string; status: string }[];
      } = await context.request.json();

      if (!body.host) {
        return new Response(JSON.stringify({ error: '服务器地址不能为空' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const serverId = body.id || `srv_${Date.now().toString(36)}`;
      const key = `server:${userEmail}:${serverId}`;

      const existingRaw = await context.env.DEPLOY_KV.get(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};

      const serverData = {
        ...existing,
        id: serverId,
        host: body.host,
        port: body.port || 9876,
        name: body.name || body.host,
        lastSeen: new Date().toISOString(),
        installedTools: body.installedTools || existing.installedTools || [],
      };

      await context.env.DEPLOY_KV.put(key, JSON.stringify(serverData));

      return new Response(JSON.stringify({ success: true, server: serverData }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // DELETE: remove a server
    if (context.request.method === 'DELETE') {
      const url = new URL(context.request.url);
      const serverId = url.searchParams.get('id');
      if (!serverId) {
        return new Response(JSON.stringify({ error: '缺少服务器 ID' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const key = `server:${userEmail}:${serverId}`;
      await context.env.DEPLOY_KV.delete(key);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
