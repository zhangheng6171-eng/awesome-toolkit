'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuthState, setAuthState, removeServer, type UserState, type DeployedToolInfo } from '@/lib/auth';

export default function DashboardPage() {
  const [auth, setAuth] = useState<UserState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAuth(getAuthState());
    setMounted(true);
  }, []);

  if (!mounted || !auth) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>;
  }

  const totalTools = auth.servers.reduce((sum, s) => sum + s.installedTools.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">控制台</h1>
            <p className="text-sm text-gray-500">管理你的服务器和已部署工具</p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
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
            <Link
              href="/pricing"
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
              <ServerCard key={server.id} server={server} onRemove={() => {
                removeServer(server.id);
                setAuth(getAuthState());
              }} />
            ))}
          </div>
        )}
      </main>
    </div>
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

function ServerCard({ server, onRemove }: { server: import('@/lib/auth').ServerInfo; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);

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
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          {server.installedTools.map((tool) => (
            <div key={tool.toolId} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <Link href={`/tool/${tool.toolId}`} className="text-blue-600 hover:underline">
                  {tool.toolName}
                </Link>
              </div>
              <span className="text-gray-400 text-xs">
                {new Date(tool.deployedAt).toLocaleDateString()}
              </span>
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
