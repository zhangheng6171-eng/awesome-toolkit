'use client';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              GitHub 精选工具库
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              从全世界开源代码中，挑出最好用的工具，配好普通话使用说明
            </p>
          </div>
          <span className="text-xs text-gray-400">
            收录标准：Star≥1000 · 有文档 · 能实际用
          </span>
        </div>
      </div>
    </header>
  );
}
