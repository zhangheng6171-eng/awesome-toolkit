'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import ToolCard from '@/components/ToolCard';
import RecommendModal from '@/components/RecommendModal';
import { filterTools, getAllTools } from '@/lib/tools';

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [targetUser, setTargetUser] = useState('');
  const [showRecommend, setShowRecommend] = useState(false);

  const allTools = useMemo(() => getAllTools(), []);
  const filteredTools = useMemo(
    () =>
      filterTools({
        search,
        category,
        difficulty,
        targetUser,
        license: '',
        hasWebUI: null,
      }),
    [search, category, difficulty, targetUser]
  );

  const totalCategories = useMemo(
    () => new Set(allTools.map((t) => t.category)).size,
    [allTools]
  );

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 搜索栏 */}
        <div className="mb-6">
          <SearchBar
            value={search}
            onChange={setSearch}
            resultCount={filteredTools.length}
          />
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="收录工具" value={String(allTools.length)} />
          <StatCard label="分类数" value={String(totalCategories)} />
          <StatCard label="许可证类型" value={String(new Set(allTools.map((t) => t.license)).size)} />
          <StatCard
            label="对小白友好"
            value={String(allTools.filter((t) => t.target_users.includes('技术小白')).length)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边筛选 */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                筛选条件
              </h2>
              <FilterPanel
                selectedCategory={category}
                onCategoryChange={setCategory}
                selectedDifficulty={difficulty}
                onDifficultyChange={setDifficulty}
                selectedTargetUser={targetUser}
                onTargetUserChange={setTargetUser}
              />
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setDifficulty(null);
                  setTargetUser('');
                }}
                className="mt-4 w-full px-4 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                清除所有筛选
              </button>
            </div>
          </aside>

          {/* 工具列表 */}
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

            {/* 页脚 */}
            <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
              <p>
                工具数据来自 GitHub 公开仓库，遵循各项目原始许可证 |
                持续更新中
              </p>
              <p className="mt-1">
                收录标准：Star ≥ 1000 · 有明确使用场景 · 有可用文档
              </p>
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

      <RecommendModal
        open={showRecommend}
        onClose={() => setShowRecommend(false)}
      />
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
