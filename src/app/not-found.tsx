import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">页面未找到</h1>
        <p className="text-gray-500 mb-6">
          你访问的工具页面可能暂时下线了，或者这个链接从一开始就不存在。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
            </svg>
            返回首页
          </Link>
          <Link
            href="/deploy"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            一键部署
          </Link>
        </div>
        <p className="mt-8 text-sm text-gray-400">
          热门工具：
          <Link href="/tool/immich" className="ml-1 text-blue-600 hover:underline">Immich</Link>
          {' · '}
          <Link href="/tool/n8n" className="text-blue-600 hover:underline">n8n</Link>
          {' · '}
          <Link href="/tool/ollama" className="text-blue-600 hover:underline">Ollama</Link>
          {' · '}
          <Link href="/tool/uptime-kuma" className="text-blue-600 hover:underline">Uptime Kuma</Link>
        </p>
      </div>
    </div>
  );
}
