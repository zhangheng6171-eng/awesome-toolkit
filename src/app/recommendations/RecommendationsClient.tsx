'use client';

import type { Tool } from '@/lib/tools';
import DeviceWizard from '@/components/DeviceWizard';
import Link from 'next/link';

export default function RecommendationsClient({ tools }: { tools: Tool[] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">找到最适合你的工具</h1>
            <p className="text-sm text-gray-500">根据你的设备配置，智能推荐适合部署的开源工具</p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DeviceWizard tools={tools} />

        {/* Quick tips */}
        <div className="mt-12 pb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">💡 推荐说明</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="font-medium text-gray-700 mb-0.5">🌱 新手友好</div>
              <div>安装步骤 5 步以内、不用命令行、有网页界面的工具</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="font-medium text-gray-700 mb-0.5">✅ 推荐配置</div>
              <div>在你的内存下可以流畅运行，体验最佳</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="font-medium text-gray-700 mb-0.5">⚠️ 最低配置</div>
              <div>勉强能跑，但内存紧张时可能卡顿</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="font-medium text-gray-700 mb-0.5">🐳 Docker 必需</div>
              <div>标注 Docker 的工具需要先装 Docker（免费），网页工具和桌面 App 不需要</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
