import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/ssh';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const host = body.host?.trim();
    const port = Number(body.port) || 22;
    const username = body.username?.trim() || 'root';
    const password = body.password?.trim() || undefined;
    const privateKey = body.privateKey?.trim() || undefined;

    if (!host) {
      return NextResponse.json({ success: false, error: '请输入服务器 IP 地址' }, { status: 400 });
    }

    if (!password && !privateKey) {
      return NextResponse.json({ success: false, error: '请提供密码或 SSH 私钥' }, { status: 400 });
    }

    const result = await testConnection({ host, port, username, password, privateKey });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
