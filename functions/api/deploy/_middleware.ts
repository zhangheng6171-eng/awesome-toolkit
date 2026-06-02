interface Env {
  DEPLOY_KV: KVNamespace;
}

// Paywall: intercept /api/deploy/execute and check user tier
export async function onRequest(context: { request: Request; env: Env; next: () => Promise<Response> }) {
  const url = new URL(context.request.url);

  // Only intercept execute endpoint
  if (url.pathname === '/api/deploy/execute' && context.request.method === 'POST') {
    const userEmail = context.request.headers.get('Cf-Access-Authenticated-User-Email');

    // In dev (no CF Access), check x-user-tier header
    if (!userEmail) {
      const tier = context.request.headers.get('x-user-tier') || 'free';
      if (tier === 'free') {
        return new Response(JSON.stringify({
          error: '一键自动部署需要 Pro 方案',
          upgrade_url: '/pricing',
          current_tier: 'free',
          required_tier: 'pro',
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.next();
    }

    // Production: check KV for user tier
    const tier = await context.env.DEPLOY_KV.get(`user:${userEmail}:tier`) || 'free';
    if (tier === 'free') {
      return new Response(JSON.stringify({
        error: '一键自动部署需要 Pro 方案',
        upgrade_url: '/pricing',
        current_tier: 'free',
        required_tier: 'pro',
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return context.next();
}
