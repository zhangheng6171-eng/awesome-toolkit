import Link from 'next/link';
import type { Tool } from '@/lib/tools';
import { formatStarCount, renderDifficultyStars } from '@/lib/tools';
import { getCategoryInfo } from '@/lib/categories';
import CompareToggle from './CompareToggle';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const catInfo = getCategoryInfo(tool.category);

  return (
    <div className="bg-white rounded-xl border border-gray-200 card-hover overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm" title={tool.category}>
                {catInfo.icon}
              </span>
              <Link
                href={`/tool/${tool.id}`}
                className="text-lg font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors"
              >
                {tool.name}
              </Link>
              {tool.license && (
                <span className="badge bg-gray-100 text-gray-600">
                  {tool.license}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {tool.description_plain}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <a
              href={tool.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
              title="在 GitHub 上查看"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {formatStarCount(tool.stars)} ⭐
            </a>
          </div>
        </div>

        {/* 标签 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tool.tags.map((tag) => (
            <span key={tag} className="badge bg-blue-50 text-blue-700">
              {tag}
            </span>
          ))}
        </div>

        {/* 元信息栏 */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span title={`安装难度：${tool.difficulty}/5`}>
            安装难度：{renderDifficultyStars(tool.difficulty)}
          </span>
          <span>适合：{tool.target_users.join('、')}</span>
          <span className="flex items-center gap-1.5">
            {tool.has_web_ui && (
              <span className="badge bg-green-50 text-green-700">Web界面</span>
            )}
            {tool.has_desktop_app && (
              <span className="badge bg-purple-50 text-purple-700">桌面App</span>
            )}
            {tool.has_cli && (
              <span className="badge bg-orange-50 text-orange-700">命令行</span>
            )}
          </span>
        </div>

        {/* 替代品 */}
        {tool.alternatives && tool.alternatives.length > 0 && (
          <div className="mt-3 text-sm text-gray-500">
            同类工具：{tool.alternatives.join('、')}
          </div>
        )}
      </div>

      {/* 使用方法链接 */}
      <div className="border-t border-gray-100">
        <div className="flex items-center">
          <Link
            href={`/tool/${tool.id}`}
            className="flex-1 px-5 py-3 flex items-center justify-between text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 transition-colors"
          >
            <span>📖 查看普通人使用方法</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <div className="px-4 py-3 border-l border-gray-100">
            <CompareToggle id={tool.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
