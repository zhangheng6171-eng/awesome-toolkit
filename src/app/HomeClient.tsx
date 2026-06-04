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
import { track } from '@/lib/analytics';
import type { Tool } from '@/lib/tools';

const FEATURED_SCENARIOS = [
  {
    emoji: '📸',
    title: '手机照片自动备份',
    toolId: 'immich',
    toolName: 'Immich',
    sceneType: 'photo_backup',
    description: '像苹果 iCloud 一样自动备份，但不交月费',
    hardware: '电脑 / NAS / VPS',
    installTime: '5 分钟',
    difficulty: '很简单',
    difficultyStars: '⭐',
  },
  {
    emoji: '🤖',
    title: 'AI 自动干活',
    toolId: 'n8n',
    toolName: 'n8n',
    sceneType: 'ai_automation',
    description: '收邮件 → 存附件 → 发微信通知，像搭积木一样',
    hardware: '电脑 / NAS / VPS',
    installTime: '3 分钟',
    difficulty: '简单',
    difficultyStars: '⭐⭐',
  },
  {
    emoji: '🔐',
    title: '一个密码管理所有账号',
    toolId: 'vaultwarden',
    toolName: 'Vaultwarden',
    sceneType: 'password_manager',
    description: '代替 1Password，密码存在自己服务器上',
    hardware: '电脑 / NAS',
    installTime: '3 分钟',
    difficulty: '很简单',
    difficultyStars: '⭐',
  },
  {
    emoji: '📄',
    title: 'PDF 文档处理',
    toolId: 'stirling-pdf',
    toolName: 'Stirling PDF',
    sceneType: 'pdf_tools',
    description: '合并、拆分、加水印、签名，一个网页全搞定',
    hardware: '电脑 / NAS / VPS',
    installTime: '3 分钟',
    difficulty: '很简单',
    difficultyStars: '⭐',
  },
];

const HOT_TAGS = ['照片备份', '密码管理', '网站监控', 'AI聊天', 'PDF处理', '去广告'];

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

  const scrollToTools = () => {
    document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center py-10 sm:py-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            不用写代码，不用学 Docker，<br className="sm:hidden" />不用看英文
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-500">
            选你想做的事，剩下的交给我们
          </p>

          {/* Main CTA */}
          <div className="mt-8">
            <Link
              href="/recommendations"
              onClick={() => track('hero_cta_click', { location: 'homepage_hero' })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              <span className="text-xl">🚀</span> 告诉我用什么设备
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Secondary text link */}
          <div className="mt-3">
            <button
              onClick={scrollToTools}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              也可以先看看有哪些工具 →
            </button>
          </div>

          {/* Windows quick entry */}
          <div className="mt-4">
            <Link
              href="/recommendations?platform=windows"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              💻 我只有 Windows 电脑
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">50</div>
              <div className="text-sm text-gray-500">精选工具</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-bold text-gray-900">Windows / Mac</div>
              <div className="text-sm text-gray-500">Linux / NAS 都能用</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">32</div>
              <div className="text-sm text-gray-500">一键部署</div>
            </div>
          </div>
        </section>

        {/* Scene cards */}
        <section className="mt-4 mb-10">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            想做什么？从这里开始
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURED_SCENARIOS.map((scene) => (
              <Link
                key={scene.toolId}
                href={`/tool/${scene.toolId}`}
                onClick={() => track('scene_card_click', { tool_id: scene.toolId, scene_type: scene.sceneType })}
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{scene.emoji}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {scene.title}
                </h3>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  {scene.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
                  <span>🖥 {scene.hardware}</span>
                  <span>⏱ {scene.installTime}</span>
                  <span>{scene.difficultyStars} {scene.difficulty}</span>
                </div>
                <div className="mt-3 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  用 {scene.toolName} 搞定 →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Waitlist */}
        <section className="mb-10">
          <div className="max-w-md mx-auto text-center">
            <p className="text-sm font-medium text-gray-700 mb-2">
              📬 新工具上线通知你 · 前 100 个订阅者解锁全部功能
            </p>
            <WaitlistForm />
          </div>
        </section>

        {/* Tools section divider */}
        <div className="text-center mb-6" id="tools-section">
          <span className="text-sm text-gray-400">── 或者浏览全部 50 个工具 ──</span>
        </div>

        {/* Hot tags + Search */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {HOT_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearch(tag)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-sm text-gray-600 rounded-full transition-colors border border-gray-200"
              >
                {tag}
              </button>
            ))}
          </div>
          <SearchBar value={search} onChange={setSearch} resultCount={filteredTools.length} />
        </div>

        {/* Filter + Tool cards */}
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

            <footer className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-400">
              <p>工具数据持续更新中 · 遵循各项目原始许可证</p>
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
