'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">关于我们</h1>
            <p className="text-sm text-gray-500">了解 Awesome Toolkit 的故事</p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">返回首页</Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* 项目理念 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>💡</span> 项目理念
          </h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Awesome Toolkit 的使命是<strong>帮助普通用户轻松自托管</strong>。GitHub 上有成千上万个优秀的开源工具，但它们往往需要技术背景才能部署和使用。我们把最好的工具筛选出来，提供一键部署方案和通俗易懂的使用说明，让<strong>没有任何技术背景的人</strong>也能在自己的服务器上运行这些工具。
          </p>
          <p className="mt-3 text-gray-600 leading-relaxed">
            我们相信数据应该属于你自己。与其把照片存在别人的云盘、把密码交给第三方，不如在自己的服务器上运行 Immich、Vaultwarden 这样的开源替代品。我们帮你把这一步变得像「点一下按钮」一样简单。
          </p>
        </section>

        {/* 当前数据 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📊</span> 当前数据
          </h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatItem label="收录工具" value="50+" />
            <StatItem label="工具分类" value="8" />
            <StatItem label="支持一键部署" value="28" />
            <StatItem label="代码开源" value="MIT" />
          </div>
        </section>

        {/* 开源声明 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📖</span> 开源声明
          </h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Awesome Toolkit 本身是一个开源项目，代码托管在{' '}
            <a href="https://github.com/zhangheng6171-eng/awesome-toolkit" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:underline">
              GitHub
            </a>
            。欢迎提交 Issue 推荐新工具，或贡献代码。网站收录的所有工具数据来自 GitHub 公开仓库，遵循各项目的原始许可证。
          </p>
          <p className="mt-2 text-gray-600 leading-relaxed">
            部署 Agent（<code className="bg-gray-100 px-1 rounded text-xs">agent.py</code>）完全开源，你可以审查源码确认它不会泄露你的数据。
          </p>
        </section>

        {/* 联系方式 */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📬</span> 联系方式
          </h2>
          <ul className="mt-3 space-y-2 text-gray-600">
            <li>📧 邮箱：<code className="bg-gray-100 px-1 rounded text-xs">zhangheng6171@163.com</code></li>
            <li>🐙 GitHub Issues：<a href="https://github.com/zhangheng6171-eng/awesome-toolkit/issues" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">提交反馈和建议</a></li>
            <li>📝 反馈页面：<Link href="/feedback" className="text-blue-600 hover:underline">在线提交反馈</Link></li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className="text-2xl font-bold text-blue-600">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
