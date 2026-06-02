import { NextRequest } from 'next/server';
import { executeDeploy } from '@/lib/ssh';
import { getDeployConfig } from '@/lib/deploy';

const BASE_URL = 'https://awesome-toolkit.pages.dev';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { toolId, host, port, username, password, privateKey } = body;

  if (!toolId || !host) {
    return new Response(JSON.stringify({ error: '缺少必填参数' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const deployConfig = getDeployConfig(toolId);
  if (!deployConfig) {
    return new Response(JSON.stringify({ error: `工具 ${toolId} 不支持一键部署` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch compose file content
  let composeContent = '';
  try {
    const composeUrl = `${BASE_URL}/deploy/tools/${toolId}/docker-compose.yml`;
    const res = await fetch(composeUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    composeContent = await res.text();
  } catch {
    return new Response(JSON.stringify({ error: '无法获取 Docker Compose 配置' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // SSE streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(type: string, message: string) {
        const data = JSON.stringify({ type, message });
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      try {
        const result = await executeDeploy(
          { host, port: port || 22, username: username || 'root', password, privateKey },
          toolId,
          composeContent,
          send
        );

        send('done', JSON.stringify(result));
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : '未知错误';
        send('error', msg);
        send('done', JSON.stringify({ success: false, error: msg }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
