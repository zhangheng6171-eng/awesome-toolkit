import Link from 'next/link';
import { getDeployConfig, getDeployCommand, getServerRecommendation } from '@/lib/deploy';
import { getToolById } from '@/lib/tools';
import CopyButton from '@/components/CopyButton';

export async function generateStaticParams() {
  const tools = [
    'uptime-kuma', 'n8n', 'immich', 'stirling-pdf', 'vaultwarden',
    'adguard-home', 'changedetection-io', 'paperless-ngx', 'home-assistant',
    'open-webui', 'dify', 'langflow', 'metabase', 'grafana', 'apache-superset',
    'homebridge', 'node-red', 'netdata', 'beszel', 'jellyfin', 'navidrome',
    'audiobookshelf', 'nginx-proxy-manager', 'portainer', 'gitea', 'nextcloud',
    'duplicati', 'actual',
  ];
  return tools.map((id) => ({ id }));
}

export default async function DeployDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const config = getDeployConfig(id);
  const tool = getToolById(id);
  const deployCmd = getDeployCommand(id);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">暂不支持一键部署</h1>
          <p className="mt-2 text-gray-500">该工具暂未收录一键部署配置</p>
          <Link href="/deploy" className="mt-4 inline-block text-blue-600 hover:underline">
            返回部署列表
          </Link>
        </div>
      </div>
    );
  }

  const serverRec = getServerRecommendation(config);

  function getMemoryText(mb: number): string {
    return mb >= 1024 ? `${mb / 1024}GB` : `${mb}MB`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition-colors">首页</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/deploy" className="hover:text-gray-900 transition-colors">一键部署</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{config.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 标题区 */}
        <h1 className="text-3xl font-bold text-gray-900">
          一键部署 {config.name}
        </h1>
        {tool && (
          <p className="mt-3 text-lg text-gray-500">{tool.description_plain}</p>
        )}

        {/* 前置要求 */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">✅</span> 前置准备
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <div>
                <div className="font-medium text-gray-900">一台 Linux 服务器</div>
                <div className="text-sm text-gray-500">{serverRec}。</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href="https://www.aliyun.com/product/swas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 px-2 py-1 rounded transition-colors"
                  >
                    阿里云轻量服务器
                  </a>
                  <a
                    href="https://cloud.tencent.com/product/lighthouse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 px-2 py-1 rounded transition-colors"
                  >
                    腾讯云轻量服务器
                  </a>
                  <a
                    href="https://www.vultr.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 px-2 py-1 rounded transition-colors"
                  >
                    Vultr（国外VPS）
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <div>
                <div className="font-medium text-gray-900">有 SSH 登录权限</div>
                <div className="text-sm text-gray-500">
                  Windows 用户推荐用 Xshell 或 PuTTY，Mac 用户用自带终端输入 <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">ssh root@你的服务器IP</code>
                </div>
              </div>
            </div>
            {config.setup_notes && config.setup_notes.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-bold mt-0.5">!</div>
                <div>
                  <div className="font-medium text-gray-900">特别注意事项</div>
                  <ul className="text-sm text-gray-500 list-disc pl-4 mt-1 space-y-1">
                    {config.setup_notes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wizard CTA - Primary */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">⚡</span> 一键部署到你的服务器
              </h2>
              <p className="mt-1 text-sm text-blue-100">
                在网页上填写服务器信息，自动完成：检测系统 → 安装 Docker → 启动服务
              </p>
            </div>
            <Link
              href={`/deploy/${config.id}/wizard`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold text-sm shadow-lg"
            >
              开始部署向导
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 部署命令卡片（手动模式，折叠） */}
        <details className="mt-4 group">
          <summary className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-gray-300 transition-colors">
            <span className="text-sm font-medium text-gray-600">
              💻 或者手动复制命令到服务器终端（高级用户）
            </span>
          </summary>
          <div className="mt-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">🚀</span> 一键部署命令
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            复制下面这条命令，粘贴到你的服务器终端里，然后按回车
          </p>

          {/* 命令框 */}
          <div className="mt-4 bg-black/50 rounded-lg p-4 border border-gray-700 relative group">
            <pre className="text-green-400 text-sm font-mono break-all whitespace-pre-wrap select-all">
              {deployCmd}
            </pre>
            <CopyButton text={deployCmd} />
          </div>

          <p className="mt-3 text-xs text-gray-500">
            脚本会自动完成：检测系统 → 安装 Docker → 下载配置 → 启动服务，整个过程 3-5 分钟
          </p>
        </div>

        {/* 部署后信息 */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">🎯</span> 部署完成后
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">🔗</span>
              <div>
                <div className="font-medium text-gray-900">访问地址</div>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded text-blue-600 mt-1 inline-block">
                  {config.post_deploy_url}
                </code>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 mt-0.5">💡</span>
              <div>
                <div className="font-medium text-gray-900">下一步</div>
                <p className="text-sm text-gray-500 mt-1">{config.post_deploy_msg}</p>
              </div>
            </div>
            {config.alternative_install && (
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 mt-0.5">🔒</span>
                <div>
                  <div className="font-medium text-gray-900">安全建议</div>
                  <p className="text-sm text-gray-500 mt-1">{config.alternative_install}</p>
                </div>
              </div>
            )}
          </div>
          </div>
        </details>

        {/* 资源需求 */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">💻</span> 服务器配置要求
          </h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <RequirementCard label="内存" value={getMemoryText(config.memory_mb)} />
            <RequirementCard label="硬盘" value={`${config.disk_gb}GB`} />
            <RequirementCard label="端口" value={String(config.ports.length)} />
            <RequirementCard label="部署耗时" value="3-5分钟" />
          </div>
        </div>

        {/* 环境变量 */}
        {config.env_vars && config.env_vars.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-xl">⚙️</span> 环境变量（可选）
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              部署前可以设置这些变量来自定义安装，不设置则使用默认值
            </p>
            <div className="mt-3 space-y-2">
              {config.env_vars.map((env) => (
                <div key={env.key} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <code className="text-sm font-mono bg-gray-100 px-1.5 py-0.5 rounded text-pink-600">{env.key}</code>
                    <span className="ml-2 text-sm text-gray-500">{env.label}</span>
                  </div>
                  <code className="text-xs text-gray-400">{env.default}</code>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">使用示例：</p>
              <code className="text-xs text-gray-700 break-all">
                export DB_PASSWORD=mySecretPass123; curl -fsSL ... | bash -s -- {id}
              </code>
            </div>
          </div>
        )}

        {/* 管理命令 */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-xl">📋</span> 常用管理命令
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            部署完成后，SSH 进入 <code className="bg-gray-100 px-1 py-0.5 rounded">~/awesome-tools/{config.id}</code> 目录，然后运行：
          </p>
          <div className="mt-3 space-y-2">
            {[
              { cmd: 'docker compose ps', desc: '查看运行状态' },
              { cmd: 'docker compose logs -f', desc: '查看实时日志' },
              { cmd: 'docker compose restart', desc: '重启服务' },
              { cmd: 'docker compose pull && docker compose up -d', desc: '更新到最新版本' },
              { cmd: 'docker compose down', desc: '停止服务' },
            ].map((item) => (
              <div key={item.cmd} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{item.cmd}</code>
                <span className="text-xs text-gray-400">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 查看原始配置 */}
        <div className="mt-6 mb-12 text-center">
          <a
            href={`/deploy/tools/${config.id}/docker-compose.yml`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            查看原始 docker-compose.yml 配置
          </a>
        </div>
      </main>
    </div>
  );
}

function RequirementCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
