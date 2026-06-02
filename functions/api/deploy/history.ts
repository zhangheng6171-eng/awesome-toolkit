interface Env {
  DEPLOY_KV: KVNamespace;
}

export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (context.request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const userEmail = context.request.headers.get('Cf-Access-Authenticated-User-Email') || 'anonymous';

    const list = await context.env.DEPLOY_KV.list({ prefix: `deploy:${userEmail}:` });
    const records: unknown[] = [];

    for (const key of list.keys) {
      const val = await context.env.DEPLOY_KV.get(key.name);
      if (val) {
        records.push(JSON.parse(val));
      }
    }

    records.sort((a: any, b: any) => b.timestamp - a.timestamp);

    return new Response(JSON.stringify({ success: true, deployments: records }), {
      status: 200,
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
