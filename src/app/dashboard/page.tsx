'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getAuthState, setAuthState, removeServer, type UserState, type ServerInfo } from '@/lib/auth';
import { useToast } from '@/components/Toast';
import TokenModal from '@/components/TokenModal';

interface DeployRecord {
  userEmail: string;
  toolId: string;
  host: string;
  timestamp: number;
  status: string;
}

interface TokenRequest {
  title: string;
  resolve: (token: string | null) => void;
}

export default function DashboardPage() {
  const [auth, setAuth] = useState<UserState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [remoteHistory, setRemoteHistory] = useState<DeployRecord[]>([]);
  const [remoteServers, setRemoteServers] = useState<ServerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [tokenRequest, setTokenRequest] = useState<TokenRequest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setAuth(getAuthState());
    setMounted(true);

    Promise.all([
      fetch('/api/deploy/history').then((r) => r.json()).catch(() => ({})),
      fetch('/api/servers').then((r) => r.json()).catch(() => ({})),
    ]).then(([historyData, serversData]) => {
      if (historyData.deployments) setRemoteHistory(historyData.deployments);
      if (serversData.servers) {
        setRemoteServers(serversData.servers);
        const localState = getAuthState();
        let changed = false;
        for (const remote of serversData.servers) {
          const exists = localState.servers.find((s) => s.id === remote.id);
          if (!exists) {
            localState.servers.push(remote);
            changed = true;
          } else if (remote.lastSeen > exists.lastSeen) {
            Object.assign(exists, remote);
            changed = true;
          }
        }
        if (changed) {
          setAuthState(localState);
          setAuth({ ...localState });
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  const requestToken = useCallback((title: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setTokenRequest({ title, resolve });
    });
  }, []);

  async function syncToKV() {
    setSyncing(true);
    try {
      const state = getAuthState();
      const results = await Promise.all(state.servers.map((server) =>
        fetch('/api/servers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: server.id,
            host: server.host,
            port: server.port,
            name: server.name,
            installedTools: server.installedTools,
          }),
        }).then((r) => r.json()).catch(() => ({ success: false }))
      ));
      const allOk = results.every((r) => r.success);
      toast(allOk ? 'success' : 'error', allOk ? '同步成功！数据已保存到云端' : '部分同步失败，请重试');
    } catch {
      toast('error', '同步失败，请检查网络');
    } finally {
      setSyncing(false);
    }
  }

  if (!mounted || !auth) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>;
  }

  const totalTools = auth.servers.reduce((sum, s) => sum + s.installedTools.length, 0);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">控制台</h1>
              <p className="text-sm text-gray-500">管理你的服务器和已部署工具</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={syncToKV}
                disabled={syncing}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {syncing ? '同步中...' : '☁️ 同步到云端'}
              </button>
              <Link href="/" className="text-sm text-blue-600 hover:underline">
                返回首页
              </Link>
            </div>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8">
            <StatCard label="当前方案" value={tierLabel(auth.tier)} />
            <StatCard label="服务器数" value={String(auth.servers.length)} />
            <StatCard label="已部署工具" value={String(totalTools)} />
            <StatCard label="邮箱" value={auth.email || '未设置'} />
          </div>

          {/* Tier status */}
          {auth.tier === 'free' && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div>
                  <div className="font-medium text-yellow-800">免费版已启用</div>
                  <div className="text-sm text-yellow-600">一键部署功能需要 Pro 或 Team 方案</div>
                </div>
              </div>
              <Link href="/pricing"
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
              >
                升级方案
              </Link>
            </div>
          )}

          {/* Server list */}
          {auth.servers.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">🖥️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">还没有添加服务器</h3>
              <p className="text-sm text-gray-500 mb-4">
                {auth.tier === 'free'
                  ? '升级到 Pro 后，可以在这里管理你的服务器和一键部署的工具'
                  : '去部署页面选择工具，填写服务器信息即可开始'}
              </p>
              {auth.tier === 'free' ? (
                <Link href="/pricing" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  升级方案
                </Link>
              ) : (
                <Link href="/deploy" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  去部署工具
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {auth.servers.map((server) => (
                <ServerCard key={server.id} server={server} requestToken={requestToken} toast={toast} onRemove={async () => {
                  await fetch(`/api/servers?id=${server.id}`, { method: 'DELETE' }).catch(() => {});
                  removeServer(server.id);
                  setAuth(getAuthState());
                }} />
              ))}
            </div>
          )}

          {/* Deploy history from KV */}
          {remoteHistory.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">部署历史</h2>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {remoteHistory.slice(0, 20).map((record, i) => (
                  <div key={`${record.toolId}-${record.timestamp}`} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <Link href={`/deploy/${record.toolId}`} className="text-sm font-medium text-blue-600 hover:underline">
                          {record.toolId}
                        </Link>
                        <p className="text-xs text-gray-400">{record.host}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                      <p className="text-xs text-green-500">{record.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <TokenModal
        open={tokenRequest !== null}
        title={tokenRequest?.title || ''}
        onConfirm={(token) => {
          tokenRequest?.resolve(token);
          setTokenRequest(null);
        }}
        onCancel={() => {
          tokenRequest?.resolve(null);
          setTokenRequest(null);
        }}
      />
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-center">
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function ServerCard({
  server, onRemove, requestToken, toast,
}: {
  server: ServerInfo;
  onRemove: () => void | Promise<void>;
  requestToken: (title: string) => Promise<string | null>;
  toast: (type: 'success' | 'error' | 'info', message: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busyToolId, setBusyToolId] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <h3 className="font-semibold text-gray-900">{server.name || server.host}</h3>
            <span className="text-xs text-gray-400">{server.host}:{server.port}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {server.installedTools.length} 个工具 · 最后在线 {new Date(server.lastSeen).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {expanded ? '收起' : '展开'}
          </button>
          <button onClick={onRemove}
            className="text-sm text-red-400 hover:text-red-600"
          >
            移除
          </button>
        </div>
      </div>

      {expanded && server.installedTools.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {server.installedTools.map((tool) => (
            <div key={tool.toolId} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <div>
                  <Link href={`/tool/${tool.toolId}`} className="text-blue-600 hover:underline font-medium">
                    {tool.toolName}
                  </Link>
                  <p className="text-xs text-gray-400">{new Date(tool.deployedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => window.open(`http://${server.host}`, '_blank', 'noopener,noreferrer')}
                  className="p-1.5 sm:px-2 sm:py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="访问工具"
                >
                  <svg className="w-3.5 h-3.5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  <span className="hidden sm:inline">访问</span>
                </button>
                <button
                  onClick={async () => {
                    const token = await requestToken('输入 Agent Token 执行更新');
                    if (!token) return;
                    setBusyToolId(tool.toolId);
                    try {
                      const res = await fetch(`http://${server.host}:${server.port || 9876}/update`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Agent-Token': token },
                        body: JSON.stringify({ tool_id: tool.toolId }),
                      });
                      const data = await res.json();
                      toast(data.success ? 'success' : 'error', data.success ? '更新成功' : `更新失败: ${data.message || data.error}`);
                    } catch {
                      toast('error', '操作失败，请检查 Agent 是否在线');
                    } finally {
                      setBusyToolId(null);
                    }
                  }}
                  disabled={busyToolId === tool.toolId}
                  className="p-1.5 sm:px-2 sm:py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors disabled:opacity-50"
                  title="更新工具"
                >
                  <svg className="w-3.5 h-3.5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  <span className="hidden sm:inline">{busyToolId === tool.toolId ? '更新中...' : '更新'}</span>
                </button>
                <button
                  onClick={async () => {
                    if (!confirm(`确认卸载 ${tool.toolName}？此操作将永久删除所有数据（照片、数据库、配置文件），不可撤销。`)) return;
                    const token = await requestToken('输入 Agent Token 执行卸载');
                    if (!token) return;
                    setBusyToolId(tool.toolId);
                    try {
                      const res = await fetch(`http://${server.host}:${server.port || 9876}/uninstall`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-Agent-Token': token },
                        body: JSON.stringify({ tool_id: tool.toolId }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        toast('success', '卸载成功');
                        onRemove();
                      } else {
                        toast('error', `卸载失败: ${data.message}`);
                      }
                    } catch {
                      toast('error', '操作失败');
                    } finally {
                      setBusyToolId(null);
                    }
                  }}
                  disabled={busyToolId === tool.toolId}
                  className="p-1.5 sm:px-2 sm:py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                  title="卸载工具"
                >
                  <svg className="w-3.5 h-3.5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  <span className="hidden sm:inline">{busyToolId === tool.toolId ? '卸载中...' : '卸载'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && server.installedTools.length === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">
          该服务器上暂无已部署工具
        </div>
      )}
    </div>
  );
}

function tierLabel(tier: string): string {
  if (tier === 'pro') return 'Pro';
  if (tier === 'team') return 'Team';
  return '免费版';
}
