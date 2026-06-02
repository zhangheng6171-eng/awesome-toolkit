// HTTP client for communicating with the Awesome Toolkit Agent
// The Agent runs on the user's server (port 9876) and receives deploy commands

const AGENT_PORT = 9876;

export interface AgentInfo {
  status: string;
  hostname: string;
  docker_version: string;
  tools: { id: string; status: string }[];
}

export async function checkAgent(host: string, token: string): Promise<{ success: boolean; info?: AgentInfo; error?: string }> {
  try {
    const res = await fetch(`http://${host}:${AGENT_PORT}/status`, {
      method: 'GET',
      headers: { 'X-Agent-Token': token },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { success: false, error: 'Token 无效，请检查是否正确' };
      }
      return { success: false, error: `Agent 响应异常: HTTP ${res.status}` };
    }

    const info = (await res.json()) as AgentInfo;
    return { success: true, info };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    if (msg.includes('timeout') || msg.includes('aborted')) {
      return { success: false, error: '连接超时：请确认 Agent 已安装并启动，且服务器防火墙开放了 9876 端口' };
    }
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      return { success: false, error: '无法连接到 Agent：请检查服务器 IP 和防火墙设置' };
    }
    return { success: false, error: `连接失败：${msg}` };
  }
}

export async function executeDeployViaAgent(
  host: string,
  token: string,
  toolId: string,
  composeContent: string,
  envValues: Record<string, string>,
  onLog: (type: string, message: string) => void
): Promise<{ success: boolean; accessUrl?: string; error?: string }> {
  try {
    const res = await fetch(`http://${host}:${AGENT_PORT}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Token': token,
      },
      body: JSON.stringify({
        tool_id: toolId,
        compose_content: composeContent,
        env_values: envValues,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      onLog('error', `Agent 请求失败: ${text}`);
      return { success: false, error: text };
    }

    const reader = res.body?.getReader();
    if (!reader) {
      return { success: false, error: '无法读取 Agent 响应' };
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'done') {
              const result = JSON.parse(data.message);
              return result;
            }
            onLog(data.type, data.message);
          } catch {
            // ignore malformed lines
          }
        }
      }
    }

    return { success: false, error: 'Agent 连接意外关闭' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    onLog('error', msg);
    return { success: false, error: msg };
  }
}
