'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Stats {
  events: Record<string, number>;
  sessions: number;
  tools: Record<string, number>;
  devices: Record<string, number>;
  scene_types: Record<string, number>;
  pages: Record<string, number>;
  funnel: {
    page_view: number;
    hero_cta_click: number;
    scene_card_click: number;
    wizard_open: number;
    device_select: number;
    results_viewed: number;
    tool_click: number;
    deploy_start: number;
    deploy_complete: number;
  };
  recent_events: Array<{
    event: string;
    page: string;
    tool_id?: string;
    device?: string;
    scene_type?: string;
    timestamp: number;
    session_id: string;
  }>;
}

const EVENT_LABELS: Record<string, string> = {
  page_view: '页面浏览',
  hero_cta_click: 'Hero CTA 点击',
  scene_card_click: '场景卡片点击',
  wizard_open: '打开推荐向导',
  device_select: '选择设备',
  results_viewed: '查看推荐结果',
  tool_click: '点击工具',
  deploy_start: '开始部署',
  deploy_complete: '部署完成',
};

function pct(num: number, den: number): string {
  if (den === 0) return '0%';
  return ((num / den) * 100).toFixed(1) + '%';
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/stats');
      if (res.status === 401) {
        setError('请先配置 Cloudflare Access 登录');
        return;
      }
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setStats(data);
        setError('');
      }
    } catch {
      setError('获取数据失败，请检查网络');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const totalEvents = Object.values(stats.events).reduce((a, b) => a + b, 0);
  const totalSessions = stats.sessions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500">用户行为数据看板 · 每 30 秒自动刷新</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchStats} className="text-sm text-blue-600 hover:underline">
              🔄 刷新
            </button>
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              返回首页
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="总事件" value={String(totalEvents)} />
          <StatCard label="独立会话" value={String(totalSessions)} />
          <StatCard label="页面浏览" value={String(stats.events.page_view || 0)} />
          <StatCard label="工具点击" value={String(stats.events.tool_click || 0)} />
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">转化漏斗</h2>
          <div className="space-y-3">
            <FunnelStep
              label="首页浏览"
              count={stats.funnel.page_view}
              total={stats.funnel.page_view}
              rate="100%"
            />
            <FunnelStep
              label="Hero CTA 点击"
              count={stats.funnel.hero_cta_click}
              total={stats.funnel.page_view}
              rate={pct(stats.funnel.hero_cta_click, stats.funnel.page_view)}
            />
            <FunnelStep
              label="场景卡片点击"
              count={stats.funnel.scene_card_click}
              total={stats.funnel.page_view}
              rate={pct(stats.funnel.scene_card_click, stats.funnel.page_view)}
            />
            <FunnelStep
              label="打开推荐向导"
              count={stats.funnel.wizard_open}
              total={stats.funnel.page_view}
              rate={pct(stats.funnel.wizard_open, stats.funnel.page_view)}
            />
            <FunnelStep
              label="选择设备"
              count={stats.funnel.device_select}
              total={stats.funnel.page_view}
              rate={pct(stats.funnel.device_select, stats.funnel.page_view)}
            />
            <FunnelStep
              label="查看推荐结果"
              count={stats.funnel.results_viewed}
              total={stats.funnel.page_view}
              rate={pct(stats.funnel.results_viewed, stats.funnel.page_view)}
            />
            <FunnelStep
              label="点击工具详情"
              count={stats.funnel.tool_click}
              total={stats.funnel.page_view}
              rate={pct(stats.funnel.tool_click, stats.funnel.page_view)}
            />
            <FunnelStep
              label="开始部署"
              count={stats.funnel.deploy_start}
              total={stats.funnel.page_view}
              rate={pct(stats.funnel.deploy_start, stats.funnel.page_view)}
              highlight
            />
            <FunnelStep
              label="部署完成"
              count={stats.funnel.deploy_complete}
              total={stats.funnel.page_view}
              rate={pct(stats.funnel.deploy_complete, stats.funnel.page_view)}
              highlight
            />
          </div>
          {/* Mini conversion rates */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500">
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="font-medium text-gray-700">首页 → Hero CTA</div>
              <div className="text-lg font-bold text-blue-600">{pct(stats.funnel.hero_cta_click, stats.funnel.page_view)}</div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="font-medium text-gray-700">首页 → 场景卡</div>
              <div className="text-lg font-bold text-indigo-600">{pct(stats.funnel.scene_card_click, stats.funnel.page_view)}</div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="font-medium text-gray-700">向导 → 结果</div>
              <div className="text-lg font-bold text-blue-600">{pct(stats.funnel.results_viewed, stats.funnel.wizard_open)}</div>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="font-medium text-gray-700">部署 → 成功</div>
              <div className="text-lg font-bold text-green-600">{pct(stats.funnel.deploy_complete, stats.funnel.deploy_start)}</div>
            </div>
          </div>
        </div>

        {/* Two-column: Devices + Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Device distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">热门设备类型</h2>
            {Object.keys(stats.devices).length === 0 ? (
              <p className="text-sm text-gray-400">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.devices)
                  .sort((a, b) => b[1] - a[1])
                  .map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{deviceLabel(device)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: pct(count, stats.funnel.device_select) }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Top tools */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">热门工具 (Top 10)</h2>
            {Object.keys(stats.tools).length === 0 ? (
              <p className="text-sm text-gray-400">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.tools)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([toolId, count], i) => (
                    <div key={toolId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                        <Link href={`/tool/${toolId}`} className="text-sm text-blue-600 hover:underline font-medium">
                          {toolId}
                        </Link>
                      </div>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Pages + Event types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Page distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">页面分布</h2>
            {Object.keys(stats.pages).length === 0 ? (
              <p className="text-sm text-gray-400">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.pages)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([page, count]) => (
                    <div key={page} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-mono">{page}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Event type distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">事件类型分布</h2>
            {Object.keys(stats.events).length === 0 ? (
              <p className="text-sm text-gray-400">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.events)
                  .sort((a, b) => b[1] - a[1])
                  .map(([event, count]) => (
                    <div key={event} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{EVENT_LABELS[event] || event}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 rounded-full h-2 hidden sm:block">
                          <div
                            className="bg-indigo-400 h-2 rounded-full"
                            style={{ width: pct(count, totalEvents) }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Live feed */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">实时事件流 (最近 20 条)</h2>
          {stats.recent_events.length === 0 ? (
            <p className="text-sm text-gray-400">暂无事件</p>
          ) : (
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {stats.recent_events.map((ev, i) => (
                <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-gray-50">
                  <span className={`px-1.5 py-0.5 rounded font-medium whitespace-nowrap ${eventColor(ev.event)}`}>
                    {EVENT_LABELS[ev.event] || ev.event}
                  </span>
                  {ev.tool_id && (
                    <span className="text-gray-500 font-mono">/{ev.tool_id}</span>
                  )}
                  {ev.device && (
                    <span className="text-gray-400">{deviceLabel(ev.device)}</span>
                  )}
                  <span className="text-gray-300 flex-1 text-right font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function FunnelStep({ label, count, total, rate, highlight }: {
  label: string;
  count: number;
  total: number;
  rate: string;
  highlight?: boolean;
}) {
  const barWidth = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all ${highlight ? 'bg-green-500' : 'bg-blue-400'}`}
          style={{ width: `${Math.min(barWidth, 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-900 w-10 text-right">{count}</span>
      <span className="text-xs text-gray-400 w-12 text-right">{rate}</span>
    </div>
  );
}

function deviceLabel(d: string): string {
  const m: Record<string, string> = {
    windows: '🪟 Windows',
    mac: '🍎 Mac',
    linux: '🐧 Linux',
    nas: '🖥️ NAS',
  };
  return m[d] || d;
}

function eventColor(event: string): string {
  const m: Record<string, string> = {
    page_view: 'bg-gray-100 text-gray-600',
    hero_cta_click: 'bg-blue-100 text-blue-700',
    scene_card_click: 'bg-indigo-100 text-indigo-700',
    wizard_open: 'bg-purple-100 text-purple-600',
    device_select: 'bg-violet-100 text-violet-600',
    results_viewed: 'bg-teal-100 text-teal-700',
    tool_click: 'bg-sky-100 text-sky-700',
    deploy_start: 'bg-amber-100 text-amber-700',
    deploy_complete: 'bg-green-100 text-green-700',
  };
  return m[event] || 'bg-gray-100 text-gray-600';
}
