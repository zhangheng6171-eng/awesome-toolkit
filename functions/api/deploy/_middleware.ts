interface Env {
  DEPLOY_KV: KVNamespace;
}

// Simple in-memory rate limiter (per Worker instance)
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count++;
  return true;
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateMap) {
    if (now > val.resetAt) rateMap.delete(key);
  }
}, 300000);

export async function onRequest(context: { request: Request; env: Env; next: () => Promise<Response> }) {
  const url = new URL(context.request.url);

  // Rate limiting: 10 requests per minute per IP for deploy endpoints
  if (url.pathname.startsWith('/api/deploy')) {
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    if (!checkRateLimit(ip, 10, 60000)) {
      return new Response(JSON.stringify({
        error: '请求过于频繁，请稍后重试',
        retry_after: 60,
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      });
    }
  }

  // TODO: 用户规模达到后再开启付费墙
  // Currently all users can use deploy for free
  return context.next();
}
