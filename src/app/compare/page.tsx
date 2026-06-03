'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { getToolById } from '@/lib/tools';
import { buildCompareData } from '@/lib/compare';
import type { Tool } from '@/lib/tools';
import CompareToggle from '@/components/CompareToggle';

function CompareContent() {
  const searchParams = useSearchParams();
  const toolsParam = searchParams.get('tools') || '';
  const ids = toolsParam ? toolsParam.split(',').slice(0, 4) : [];
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    setTools(ids.map((id) => getToolById(id)).filter(Boolean) as Tool[]);
  }, [toolsParam]);

  if (ids.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">工具对比</h1>
          <p className="mt-2 text-gray-500">在首页的工具卡片上点击「+ 对比」按钮，选择 2-4 个工具后开始对比</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            返回首页挑选工具
          </Link>
        </div>
      </div>
    );
  }

  if (ids.length === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">还需要再选一个</h1>
          <p className="mt-2 text-gray-500">至少选择 2 个工具才能对比，你目前只选了 {tools[0]?.name}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            返回首页继续挑选
          </Link>
        </div>
      </div>
    );
  }

  const rows = buildCompareData(tools as unknown as Record<string, unknown>[]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">首页</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">工具对比</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">工具对比</h1>
          <p className="mt-2 text-gray-500">{tools.length} 个工具，{rows.length} 个维度横向比较</p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="w-32 px-5 py-4 text-left text-sm font-semibold text-gray-500 bg-gray-50 border-r border-gray-100">
                  对比维度
                </th>
                {tools.map((tool) => (
                  <th key={tool.id} className="px-5 py-4 text-left bg-gray-50 border-r border-gray-100 last:border-r-0 min-w-[200px]">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/tool/${tool.id}`}
                        className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {tool.name}
                      </Link>
                      <CompareToggle id={tool.id} />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <a href={tool.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">GitHub ↗</a>
                      <Link href={`/deploy/${tool.id}`} className="hover:text-blue-600">一键部署 ↗</Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={row.dimension.key} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-5 py-3 text-sm font-medium text-gray-600 border-r border-gray-100 whitespace-nowrap">
                    {row.dimension.label}
                  </td>
                  {row.values.map((val, colIdx) => (
                    <td key={colIdx} className="px-5 py-3 text-sm text-gray-900 border-r border-gray-100 last:border-r-0">
                      {row.dimension.key === 'stars' ? (
                        <span className="font-semibold">{val}</span>
                      ) : (
                        val
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card stack */}
        <div className="md:hidden space-y-4">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <Link href={`/tool/${tool.id}`} className="text-lg font-bold text-gray-900 hover:text-blue-600">
                    {tool.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                    <a href={tool.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">GitHub ↗</a>
                    <Link href={`/deploy/${tool.id}`} className="hover:text-blue-600">一键部署 ↗</Link>
                  </div>
                </div>
                <CompareToggle id={tool.id} />
              </div>
              <div className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const toolIdx = tools.indexOf(tool);
                  return (
                    <div key={row.dimension.key} className="flex justify-between px-4 py-2.5 text-sm">
                      <span className="text-gray-500">{row.dimension.label}</span>
                      <span className={`text-gray-900 font-medium ${row.dimension.key === 'stars' ? 'font-semibold' : ''}`}>
                        {row.values[toolIdx]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          对比数据来自 GitHub 公开信息，Star 数由 GitHub Actions 每日自动更新
        </p>
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
