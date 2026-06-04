'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import ToolCard from '@/components/ToolCard';
import RecommendModal from '@/components/RecommendModal';
import CompareBar from '@/components/CompareBar';
import MobileFilterBar from '@/components/MobileFilterBar';
import WaitlistForm from '@/components/WaitlistForm';
import Link from 'next/link';
import { filterTools } from '@/lib/tools';
import type { Tool } from '@/lib/tools';

export default function HomeClient({ tools }: { tools: Tool[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [targetUser, setTargetUser] = useState('');
  const [showRecommend, setShowRecommend] = useState(false);

  const filteredTools = useMemo(
    () => filterTools({ search, category, difficulty, targetUser, license: '', hasWebUI: null }),
    [search, category, difficulty, targetUser]
  );

  const totalCategories = useMemo(() => new Set(tools.map((t) => t.category)).size, [tools]);

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <SearchBar value={search} onChange={setSearch} resultCount={filteredTools.length} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="收录工具" value={String(tools.length)} />
          <StatCard label="分类数" value={String(totalCategories)} />
          <StatCard label="许可证类型" value={String(new Set(tools.map((t) => t.license)).size)} />
          <StatCard label="对小白友好" value={String(tools.filter((t) => t.target_users.includes('技术小白')).length)} />
        </div>

        {/* Device wizard CTA */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪄</span>
            <div>
              <div className="font-semibold text-gray-900 text-sm">不知道从哪个工具开始？</div>
              <div className="text-xs text-gray-500">告诉我们你的设备，自动推荐最适合的工具</div>
            </div>
          </div>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            开始匹配
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="lg:hidden">
            <MobileFilterBar
              category={category}
              onCategoryChange={setCategory}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              targetUser={targetUser}
              onTargetUserChange={setTargetUser}
              onClear={() => { setSearch(''); setCategory(''); setDifficulty(null); setTargetUser(''); }}
              resultCount={filteredTools.length}
            />
          </div>

          <aside className="hidden lg:block lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">筛选条件</h2>
              <FilterPanel
                selectedCategory={category}
                onCategoryChange={setCategory}
                selectedDifficulty={difficulty}
                onDifficultyChange={setDifficulty}
                selectedTargetUser={targetUser}
                onTargetUserChange={setTargetUser}
              />
              <button
                onClick={() => { setSearch(''); setCategory(''); setDifficulty(null); setTargetUser(''); }}
                className="mt-4 w-full px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                清除所有筛选
              </button>
            </div>
          </aside>

          <div className="lg:col-span-3">
            {filteredTools.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg">没有找到匹配的工具</p>
                <p className="text-sm mt-1">试试换一下搜索词或筛选条件</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            )}

            <div className="mt-10 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">🙌 用户怎么说</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { initial: 'L', name: '小李', color: 'bg-blue-500', text: '之前部署个工具要折腾半天，现在点几下就好了，太爽了！' },
                  { initial: 'W', name: '王同学', color: 'bg-green-500', text: '在 VPS 上一键部署了 Immich，终于可以告别 iCloud 月费了' },
                  { initial: 'M', name: '老马', color: 'bg-purple-500', text: '省了我至少 10 个小时的 Docker 配置时间，强烈推荐' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                    <div className={`w-10 h-10 rounded-full ${item.color} text-white flex items-center justify-center font-bold mx-auto`}>
                      {item.initial}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{`"${item.text}"`}</p>
                    <p className="mt-1 text-xs text-gray-400">—— {item.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 max-w-md mx-auto mb-6">
              <p className="text-sm font-medium text-blue-900">📬 订阅更新，第一时间获得新工具推荐和早鸟优惠</p>
              <WaitlistForm />
            </div>

            <footer className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
              <p>工具数据来自 GitHub 公开仓库，遵循各项目原始许可证 | 持续更新中</p>
              <p className="mt-1">收录标准：Star ≥ 1000 · 有明确使用场景 · 有可用文档</p>
              <button
                onClick={() => setShowRecommend(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                推荐工具
              </button>
            </footer>
          </div>
        </div>
      </main>

      <RecommendModal open={showRecommend} onClose={() => setShowRecommend(false)} />
      <CompareBar tools={tools} />
    </>
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
