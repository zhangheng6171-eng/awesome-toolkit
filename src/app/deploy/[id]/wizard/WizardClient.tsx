'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TerminalLog from '@/components/TerminalLog';
import type { LogEntry } from '@/components/TerminalLog';

type Step = 0 | 1 | 2 | 3;

interface DeployMeta {
  name: string;
  ports: string[];
  memory_mb: number;
  disk_gb: number;
  post_deploy_url: string;
  post_deploy_msg: string;
  env_vars?: { key: string; label: string; default: string }[];
}

function WizardContent() {
  const params = useParams();
  const toolId = params.id as string;

  const [step, setStep] = useState<Step>(0);
  const [host, setHost] = useState('');
  const [token, setToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string; hostname?: string } | null>(null);
  const [deployMeta, setDeployMeta] = useState<DeployMeta | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [deployDone, setDeployDone] = useState(false);
  const [deployUrl, setDeployUrl] = useState('');
  const [deployError, setDeployError] = useState('');
  const [envValues, setEnvValues] = useState<Record<string, string>>({});
  const [agentPolling, setAgentPolling] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);

  useEffect(() => {
    import('@/lib/deploy').then((m) => {
      const config = m.getDeployConfig(toolId);
      if (config) {
        setDeployMeta({
          name: config.name,
          ports: config.ports,
          memory_mb: config.memory_mb,
          disk_gb: config.disk_gb,
          post_deploy_url: config.post_deploy_url,
          post_deploy_msg: config.post_deploy_msg,
          env_vars: config.env_vars,
        });
      }
    }).catch(() => {});
  }, [toolId]);

  function startPolling() {
    if (!host.trim()) return;
    setAgentPolling(true);
    setAgentOnline(false);

    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch('/api/deploy/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ host: host.trim(), port: 9876, token: token.trim() }),
        });
        const data = await res.json();
        if (data.success) {
          setAgentOnline(true);
          setAgentPolling(false);
          setTestResult(data);
          clearInterval(interval);
        }
      } catch { /* keep polling */ }
      if (attempts >= maxAttempts) {
        setAgentPolling(false);
        clearInterval(interval);
      }
    }, 2000);
  }

  async function handleTestConnection() {
    if (!host.trim()) {
      setTestResult({ success: false, error: '请输入服务器 IP' });
      return;
    }
    if (!token.trim()) {
      setTestResult({ success: false, error: '请输入 Agent Token' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/deploy/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: host.trim(), port: 9876, token: token.trim() }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, error: '请求失败，请检查网络' });
    } finally {
      setTesting(false);
    }
  }

  async function handleDeploy() {
    setDeploying(true);
    setDeployDone(false);
    setDeployError('');
    setLogs([]);
    setStep(3);

    try {
      const deployBody: Record<string, unknown> = {
        toolId,
        host: host.trim(),
        port: 9876,
        token: token.trim(),
        envValues,
      };

      const tier = JSON.parse(localStorage.getItem('awesome-auth-state') || '{}').tier || 'free';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-tier': tier,
      };

      const res = await fetch('/api/deploy/execute', {
        method: 'POST',
        headers,
        body: JSON.stringify(deployBody),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setDeployError(errData.error || `服务器错误: ${res.status}`);
        setDeploying(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setDeployError('无法读取服务器响应流');
        setDeploying(false);
        return;
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
                if (result.success) {
                  setDeployUrl(result.accessUrl || result.access_url || '');
                  setDeployDone(true);
                } else {
                  setDeployError(result.error || '部署失败');
                }
              } else {
                setLogs((prev) => [...prev, {
                  type: data.type,
                  message: data.message,
                  timestamp: Date.now(),
                }]);
              }
            } catch {
              // ignore malformed
            }
          }
        }
      }
    } catch (err) {
      setDeployError(err instanceof Error ? err.message : '部署请求失败');
    } finally {
      setDeploying(false);
    }
  }

  const stepLabels = ['安装 Agent', '连接信息', '确认配置', '部署中'];
  const installCmd = `curl -fsSL https://awesome-toolkit.pages.dev/agent/install-agent.sh | bash`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">首页</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/deploy" className="hover:text-gray-900">一键部署</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/deploy/${toolId}`} className="hover:text-gray-900">{toolId}</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">部署向导</span>
          </nav>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Step indicator - compact text on mobile */}
        <div className="mb-6 sm:hidden text-center">
          <span className="text-sm font-semibold text-blue-600">
            步骤 {step + 1}/4 — {stepLabels[step]}
          </span>
          <div className="mt-1.5 flex gap-1 justify-center">
            {([0, 1, 2, 3] as Step[]).map((s) => (
              <div key={s} className={`h-1 rounded-full transition-all ${
                s < step ? 'w-4 bg-green-500' :
                s === step ? 'w-6 bg-blue-600' :
                'w-2 bg-gray-200'
              }`} />
            ))}
          </div>
        </div>

        {/* Step indicator - full visual on desktop */}
        <div className="hidden sm:flex items-center justify-center gap-2 mb-8">
          {([0, 1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                s < step ? 'bg-green-500 text-white' :
                s === step ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? '✓' : s + 1}
              </div>
              <span className={`text-xs ${s <= step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {stepLabels[s]}
              </span>
              {s < 3 && <div className={`w-6 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Install Agent */}
        {step === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">步骤 1：在服务器上安装 Agent</h2>
            <p className="text-sm text-gray-500 mb-4">
              Agent 是一个轻量程序（Python3），负责在你的服务器上执行部署命令。无需安装额外依赖。
            </p>

            <div className="bg-gray-900 rounded-lg p-4 mb-4 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">在服务器终端执行以下命令：</span>
                <CopyButton text={installCmd} />
              </div>
              <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap pr-16">{installCmd}</pre>
            </div>

            {/* Agent 是什么? */}
            <details className="mb-4 group">
              <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700 py-1">
                🤖 Agent 是什么？它安全吗？
              </summary>
              <div className="mt-2 pl-4 border-l-2 border-blue-200 text-sm text-gray-600 space-y-1">
                <p>Agent 是一个运行在<strong>你自己服务器上</strong>的小程序（Python3，无额外依赖），负责实际执行 Docker 命令。</p>
                <p>🔒 <strong>安全保证：</strong></p>
                <ul className="list-disc pl-5 space-y-0.5 text-xs">
                  <li>Agent 只在你的服务器上运行，数据不会离开你的服务器</li>
                  <li>Token 是随机生成的，只有你知道</li>
                  <li>只执行白名单内的命令（docker compose / docker ps 等）</li>
                  <li>同一 IP 认证失败 5 次自动锁定 10 分钟</li>
                  <li>我们的网站<strong>无法看到</strong>你服务器上的任何数据</li>
                  <li>Agent 代码完全开源，可审查：<code className="bg-gray-100 px-1 rounded text-xs">public/agent/agent.py</code></li>
                </ul>
              </div>
            </details>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 mb-4">
              <p className="font-medium">执行后会输出 Agent Token，请复制保存</p>
              <p className="text-xs mt-1 text-blue-500">如果丢失了 Token，在服务器上执行 cat ~/.awesome-tools-agent-token 即可查看</p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">服务器 IP 地址 <span className="text-red-500">*</span></label>
              <input type="text" value={host} onChange={(e) => { setHost(e.target.value); setAgentOnline(false); }}
                placeholder="例如：123.45.67.89"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              <label className="block text-sm font-medium text-gray-700 mb-1">Agent Token <span className="text-red-500">*</span></label>
              <input type="text" value={token} onChange={(e) => setToken(e.target.value)}
                placeholder="粘贴 Agent 安装后输出的 Token"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 font-mono"
              />

              {agentOnline && testResult && (
                <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700 mb-3">
                  ✅ Agent 已在线！服务器: {testResult.hostname || host}
                </div>
              )}

              {testResult && !testResult.success && (
                <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600 mb-3">
                  ❌ {testResult.error}
                </div>
              )}

              <button onClick={() => { handleTestConnection().then(() => {
                if (!agentOnline && host && token) startPolling();
              }); }}
                disabled={testing || !host || !token}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testing ? '检测中...' : agentOnline ? '✓ 连接成功 — 下一步' : '检测 Agent 连接'}
              </button>

              {agentOnline && (
                <button onClick={() => setStep(1)}
                  className="w-full mt-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  直接进入下一步
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Connection info review */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">步骤 2：确认连接信息</h2>

            <div className="space-y-3 mb-6">
              <InfoRow label="服务器 IP" value={host} />
              <InfoRow label="Agent 端口" value="9876" />
              <InfoRow label="Agent Token" value={token.slice(0, 8) + '...' + token.slice(-4)} />
              {testResult?.hostname && <InfoRow label="主机名" value={testResult.hostname} />}
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-sm mb-4 ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {testResult.success ? '✅ 连接正常' : `⚠️ ${testResult.error || '请返回上一步测试连接'}`}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(0)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                上一步
              </button>
              <button onClick={() => setStep(2)} disabled={!testResult?.success}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm config */}
        {step === 2 && deployMeta && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">步骤 3：确认部署配置</h2>

            <div className="space-y-3 mb-6">
              <InfoRow label="工具" value={deployMeta.name} />
              <InfoRow label="目标服务器" value={`${host}:9876`} />
              <InfoRow label="端口映射" value={deployMeta.ports.join(', ')} />
              <InfoRow label="内存需求" value={deployMeta.memory_mb >= 1024 ? `${deployMeta.memory_mb / 1024}GB` : `${deployMeta.memory_mb}MB`} />
              <InfoRow label="硬盘需求" value={`${deployMeta.disk_gb}GB`} />
              <InfoRow label="预计访问地址" value={deployMeta.post_deploy_url.replace('你的服务器IP', host)} />
              <InfoRow label="数据目录" value={`~/awesome-tools/${toolId}/data`} />
            </div>

            {deployMeta.env_vars && deployMeta.env_vars.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">环境变量（可修改）</h3>
                {deployMeta.env_vars.map((env) => (
                  <div key={env.key} className="flex items-center gap-3 mb-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded w-48 truncate">{env.key}</code>
                    <input type="text"
                      value={envValues[env.key] ?? env.default}
                      onChange={(e) => setEnvValues((prev) => ({ ...prev, [env.key]: e.target.value }))}
                      placeholder={env.label}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                上一步
              </button>
              <button onClick={handleDeploy}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                开始部署
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Deploying */}
        {step === 3 && (
          <div className="space-y-4">
            <TerminalLog logs={logs} isRunning={deploying} />

            {deployError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                ❌ {deployError}
                <button onClick={() => setStep(2)} className="ml-4 text-red-500 hover:text-red-700 underline">
                  返回修改配置
                </button>
              </div>
            )}

            {deployDone && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">部署成功!</h3>
                {deployUrl && (
                  <a href={deployUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:underline font-mono text-lg"
                  >
                    {deployUrl}
                  </a>
                )}
                <p className="mt-2 text-sm text-green-600">{deployMeta?.post_deploy_msg}</p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <button onClick={() => {
                    const text = `我用 Awesome Toolkit 一键部署了 ${deployMeta?.name || toolId}！\n5 分钟搞定 🚀\nhttps://awesome-toolkit.pages.dev/deploy/${toolId}`;
                    navigator.clipboard.writeText(text);
                    const btn = document.activeElement as HTMLElement;
                    if (btn) { btn.textContent = '已复制!'; setTimeout(() => { btn.textContent = '📋 复制分享文案'; }, 2000); }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    📋 复制分享文案
                  </button>
                </div>
              </div>
            )}

            {!deploying && !deployDone && !deployError && (
              <p className="text-center text-gray-400">等待部署启动...</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }}
    className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
    >
      {copied ? '已复制!' : '复制'}
    </button>
  );
}

export function WizardClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>}>
      <WizardContent />
    </Suspense>
  );
}
