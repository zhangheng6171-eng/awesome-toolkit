import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Only intercept the execute endpoint
  if (req.nextUrl.pathname === '/api/deploy/execute') {
    const tier = req.headers.get('x-user-tier') || 'free';

    if (tier === 'free') {
      return NextResponse.json(
        {
          error: '一键自动部署需要 Pro 方案',
          upgrade_url: '/pricing',
          current_tier: 'free',
          required_tier: 'pro',
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/deploy/:path*',
};
