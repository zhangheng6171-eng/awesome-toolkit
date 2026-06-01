import Link from 'next/link';
import { getAllTools, getToolById, getToolsByCategory } from '@/lib/tools';
import { getCategoryInfo } from '@/lib/categories';
import { formatStarCount, renderDifficultyStars } from '@/lib/tools';
import ToolCardMini from './ToolCardMini';

export async function generateStaticParams() {
  return getAllTools().map((tool) => ({ id: tool.id }));
}

export default function ToolDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const tool = getToolById(params.id);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">工具未找到</h1>
          <p className="mt-2 text-gray-500">没有找到 ID 为「{params.id}」的工具</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const catInfo = getCategoryInfo(tool.category);
  const sameCategoryTools = getToolsByCategory(tool.category)
    .filter((t) => t.id !== tool.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              首页
            </Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              {catInfo.icon} {tool.category}
            </Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{tool.name}</span>
          </nav>
        </div>
      </div>

      {/* 主体内容 */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 标题区 */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <a
                href={tool.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {formatStarCount(tool.stars)} ⭐
              </a>
              {tool.license && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                  {tool.license}
                </span>
              )}
              <span>适合：{tool.target_users.join('、')}</span>
            </div>
          </div>
        </div>

        {/* 一句话描述 */}
        <p className="mt-6 text-xl text-gray-700 leading-relaxed">
          {tool.description_plain}
        </p>

        {/* 使用步骤 */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">📖</span> 使用步骤
          </h2>
          <ol className="mt-4 space-y-4">
            {tool.quick_start.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-gray-700 pt-1 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 标签 */}
        <div className="mt-6 flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 工具属性 */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span>安装难度：{renderDifficultyStars(tool.difficulty)}</span>
          <span className="flex items-center gap-2">
            {tool.has_web_ui && (
              <span className="bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-medium">Web界面</span>
            )}
            {tool.has_desktop_app && (
              <span className="bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-medium">桌面App</span>
            )}
            {tool.has_cli && (
              <span className="bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-medium">命令行</span>
            )}
          </span>
        </div>

        {/* 同类工具 */}
        {sameCategoryTools.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              同类工具推荐
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sameCategoryTools.map((related) => (
                <ToolCardMini key={related.id} tool={related} />
              ))}
            </div>
          </div>
        )}

        {/* 去 GitHub 查看按钮 */}
        <div className="mt-10 pb-12">
          <a
            href={tool.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            去 GitHub 查看
          </a>
        </div>
      </main>
    </div>
  );
}
