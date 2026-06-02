interface Env {
  DEPLOY_KV: KVNamespace;
}

// Admin/manual tier upgrade endpoint
// Protected by Cloudflare Access — only admin can reach this
export async function onRequest(context: { request: Request; env: Env }) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // GET: check current tier
  if (context.request.method === 'GET') {
    const userEmail = context.request.headers.get('Cf-Access-Authenticated-User-Email');
    if (!userEmail) {
      return new Response(JSON.stringify({ error: '未认证' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const tier = await context.env.DEPLOY_KV.get(`user:${userEmail}:tier`) || 'free';
    return new Response(JSON.stringify({ email: userEmail, tier }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  // POST: upgrade tier (admin only — called after payment webhook)
  if (context.request.method === 'POST') {
    try {
      const body: { email: string; tier: string } = await context.request.json();
      const email = body.email?.trim().toLowerCase();
      const tier = body.tier;

      if (!email || !['free', 'pro', 'team'].includes(tier)) {
        return new Response(JSON.stringify({ error: '参数无效' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      await context.env.DEPLOY_KV.put(`user:${email}:tier`, tier);
      return new Response(JSON.stringify({ success: true, email, tier }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误';
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
