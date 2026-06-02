import Link from 'next/link';
import { getDeployableTools } from '@/lib/deploy';
import type { DeployConfig } from '@/lib/deploy';

export default function DeployPage() {
  const tools = getDeployableTools();

  const categoryNames: Record<string, { icon: string; name: string }> = {
    uptime: { icon: '📡', name: '监控 & 告警' },
    n8n: { icon: '⚡', name: '自动化' },
    immich: { icon: '📸', name: '照片 & 备份' },
    'stirling-pdf': { icon: '📄', name: '文件处理' },
    vaultwarden: { icon: '🔐', name: '密码管理' },
    'adguard-home': { icon: '🛡️', name: '网络安全' },
    'changedetection-io': { icon: '👀', name: '监控' },
    'paperless-ngx': { icon: '🗂️', name: '文档管理' },
    'home-assistant': { icon: '🏠', name: '智能家居' },
    'open-webui': { icon: '💬', name: 'AI 聊天' },
    dify: { icon: '🤖', name: 'AI 应用' },
    langflow: { icon: '🧩', name: 'AI 流程' },
    metabase: { icon: '📊', name: '数据分析' },
    grafana: { icon: '📈', name: '数据可视化' },
    'apache-superset': { icon: '📉', name: '数据看板' },
  };

  function getMemoryText(mb: number): string {
    return mb >= 1024 ? `${mb / 1024}GB` : `${mb}MB`;
  }

  function getDifficultyLabel(tool: DeployConfig): string {
    const deps = tool.memory_mb;
    if (deps <= 256) return '极低配置';
    if (deps <= 512) return '低配置';
    if (deps <= 1024) return '中等配置';
    if (deps <= 2048) return '较高配置';
    return '高配置';
  }

  function getDifficultyColor(tool: DeployConfig): string {
    const deps = tool.memory_mb;
    if (deps <= 256) return 'text-green-600 bg-green-50';
    if (deps <= 512) return 'text-blue-600 bg-blue-50';
    if (deps <= 1024) return 'text-yellow-600 bg-yellow-50';
    if (deps <= 2048) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">首页</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">一键部署</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 标题区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">一键部署</h1>
          <p className="mt-2 text-lg text-gray-500">
            选一个工具，复制一条命令到你的服务器终端，5 分钟内自动装好
          </p>
        </div>

        {/* 快速开始指引 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">准备条件</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</span>
              <div>
                <div className="font-medium text-gray-900 text-sm">准备一台服务器</div>
                <div className="text-xs text-gray-500 mt-0.5">阿里云/腾讯云轻量服务器最低 ¥50/月，1核2G即可</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</span>
              <div>
                <div className="font-medium text-gray-900 text-sm">SSH 登录服务器</div>
                <div className="text-xs text-gray-500 mt-0.5">Windows 用 Xshell/PuTTY，Mac 用自带终端</div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">3</span>
              <div>
                <div className="font-medium text-gray-900 text-sm">粘贴部署命令</div>
                <div className="text-xs text-gray-500 mt-0.5">在终端里粘贴下面工具的部署命令，等待完成</div>
              </div>
            </div>
          </div>
        </div>

        {/* 工具列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/deploy/${tool.id}`}
              className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(tool)}`}>
                  {getDifficultyLabel(tool)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                <span>内存 {getMemoryText(tool.memory_mb)}</span>
                <span>磁盘 {tool.disk_gb}GB</span>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span>部署后访问</span>
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">
                  {tool.post_deploy_url}
                </code>
              </div>
            </Link>
          ))}
        </div>

        {/* 底部说明 */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
          <p>所有部署脚本开源，使用标准的 Docker Compose，数据存储在你自己服务器上</p>
          <p className="mt-1">如有问题，欢迎提交 GitHub Issue 反馈</p>
        </footer>
      </main>
    </div>
  );
}
