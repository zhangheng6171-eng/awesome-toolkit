interface Env {
  WAITLIST_KV: KVNamespace;
}

export async function onRequest(context: { request: Request; env: Env }) {
  // CORS preflight
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

  if (context.request.method === 'GET') {
    // List total count
    try {
      const list = await context.env.WAITLIST_KV.list({ prefix: 'waitlist:' });
      return new Response(JSON.stringify({ total: list.keys.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch {
      return new Response(JSON.stringify({ total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  if (context.request.method === 'POST') {
    try {
      const body: { email: string; source?: string } = await context.request.json();
      const email = body.email?.trim().toLowerCase();
      const source = body.source || 'website';

      if (!email || !email.includes('@')) {
        return new Response(JSON.stringify({ success: false, error: '请输入有效的邮箱地址' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // Check duplicate
      const existing = await context.env.WAITLIST_KV.get(`waitlist:${email}`);
      if (existing) {
        return new Response(JSON.stringify({ success: true, message: 'already_registered' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      await context.env.WAITLIST_KV.put(
        `waitlist:${email}`,
        JSON.stringify({ email, source, createdAt: new Date().toISOString() })
      );

      const list = await context.env.WAITLIST_KV.list({ prefix: 'waitlist:' });
      return new Response(JSON.stringify({ success: true, total: list.keys.length }), {
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

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
