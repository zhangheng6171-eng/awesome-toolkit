'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import TerminalLog from '@/components/TerminalLog';
import type { LogEntry } from '@/components/TerminalLog';

type Step = 1 | 2 | 3;

interface ServerForm {
  host: string;
  port: number;
  username: string;
  authMethod: 'password' | 'key';
  password: string;
  privateKey: string;
}

// Tool metadata loaded client-side
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

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<ServerForm>({
    host: '',
    port: 22,
    username: 'root',
    authMethod: 'password',
    password: '',
    privateKey: '',
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [deployMeta, setDeployMeta] = useState<DeployMeta | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [deployDone, setDeployDone] = useState(false);
  const [deployUrl, setDeployUrl] = useState('');
  const [deployError, setDeployError] = useState('');
  const [envValues, setEnvValues] = useState<Record<string, string>>({});

  // Fetch deploy metadata
  useEffect(() => {
    fetch('/deploy/tools/' + toolId + '/docker-compose.yml')
      .then((r) => r.text())
      .then((compose) => {
        const nameMatch = compose.match(/# POST_DEPLOY_MSG=(.*)/);
        const urlMatch = compose.match(/# POST_DEPLOY_URL=(.*)/);
        const ports: string[] = [];
        const portRe = /-\s+"(\d+:\d+)"/g;
        let m;
        while ((m = portRe.exec(compose)) !== null) ports.push(m[1]);

        setDeployMeta({
          name: toolId, // will be replaced by tool name logic
          ports: ports.length ? ports : ['unknown'],
          memory_mb: 512,
          disk_gb: 5,
          post_deploy_url: urlMatch?.[1] || 'http://你的服务器IP',
          post_deploy_msg: nameMatch?.[1] || '',
          env_vars: [],
        });
      })
      .catch(() => setDeployMeta(null));
  }, [toolId]);

  // Also load deploy metadata from API
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

  function updateField(field: keyof ServerForm, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTestResult(null);
  }

  async function handleTestConnection() {
    if (!form.host.trim()) {
      setTestResult({ success: false, error: '请输入服务器 IP' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/deploy/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: form.host,
          port: form.port,
          username: form.username,
          password: form.authMethod === 'password' ? form.password : undefined,
          privateKey: form.authMethod === 'key' ? form.privateKey : undefined,
        }),
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
      const res = await fetch('/api/deploy/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          host: form.host,
          port: form.port,
          username: form.username,
          password: form.authMethod === 'password' ? form.password : undefined,
          privateKey: form.authMethod === 'key' ? form.privateKey : undefined,
        }),
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
                  setDeployUrl(result.accessUrl || '');
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
              // ignore malformed lines
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
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                s < step ? 'bg-green-500 text-white' :
                s === step ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? '✓' : s}
              </div>
              <span className={`text-sm ${s <= step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {['服务器信息', '确认配置', '部署中'][s - 1]}
              </span>
              {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Server Info */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">填写服务器信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">服务器 IP 地址 <span className="text-red-500">*</span></label>
                <input type="text" value={form.host} onChange={(e) => updateField('host', e.target.value)}
                  placeholder="例如：123.45.67.89" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH 端口</label>
                  <input type="number" value={form.port} onChange={(e) => updateField('port', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                  <input type="text" value={form.username} onChange={(e) => updateField('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">认证方式</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="authMethod" checked={form.authMethod === 'password'} onChange={() => updateField('authMethod', 'password')} />
                    密码
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="authMethod" checked={form.authMethod === 'key'} onChange={() => updateField('authMethod', 'key')} />
                    SSH 私钥
                  </label>
                </div>
              </div>
              {form.authMethod === 'password' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">密码 <span className="text-red-500">*</span></label>
                  <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH 私钥内容 <span className="text-red-500">*</span></label>
                  <textarea value={form.privateKey} onChange={(e) => updateField('privateKey', e.target.value)}
                    rows={4} placeholder="粘贴私钥内容（以 -----BEGIN OPENSSH PRIVATE KEY----- 开头）"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}

              {/* Test result */}
              {testResult && (
                <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {testResult.success ? '✅ 连接成功！服务器可以正常访问' : `❌ ${testResult.error}`}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handleTestConnection} disabled={testing}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {testing ? '测试中...' : '测试连接'}
                </button>
                <button onClick={() => setStep(2)} disabled={!form.host || (!form.password && !form.privateKey)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  下一步
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Confirm config */}
        {step === 2 && deployMeta && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">确认部署配置</h2>

            <div className="space-y-3 mb-6">
              <InfoRow label="工具" value={deployMeta.name} />
              <InfoRow label="目标服务器" value={`${form.host}:${form.port} (${form.username})`} />
              <InfoRow label="端口映射" value={deployMeta.ports.join(', ')} />
              <InfoRow label="内存需求" value={deployMeta.memory_mb >= 1024 ? `${deployMeta.memory_mb / 1024}GB` : `${deployMeta.memory_mb}MB`} />
              <InfoRow label="硬盘需求" value={`${deployMeta.disk_gb}GB`} />
              <InfoRow label="访问地址" value={deployMeta.post_deploy_url} />
              <InfoRow label="数据目录" value={`~/awesome-tools/${toolId}/data`} />
            </div>

            {/* Environment variables */}
            {deployMeta.env_vars && deployMeta.env_vars.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">环境变量（可修改）</h3>
                {deployMeta.env_vars.map((env) => (
                  <div key={env.key} className="flex items-center gap-3 mb-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded w-48 truncate">{env.key}</code>
                    <input
                      type="text"
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

                {/* Share button */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button onClick={() => {
                    const text = `我用 Awesome Toolkit 一键部署了 ${deployMeta?.name || toolId}！\n自动装好 Docker、下载配置、启动服务，5 分钟搞定 🚀\nhttps://awesome-toolkit.pages.dev/deploy/${toolId}`;
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

export default function WizardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>}>
      <WizardContent />
    </Suspense>
  );
}
