import type { Tool } from './tools';

export interface DeployConfig {
  id: string;
  name: string;
  ports: string[];
  memory_mb: number;
  disk_gb: number;
  post_deploy_url: string;
  post_deploy_msg: string;
  env_vars?: { key: string; label: string; default: string }[];
  setup_notes?: string[];
  alternative_install?: string;
}

// 工具 ID → 部署配置
const deployRegistry: Record<string, DeployConfig> = {
  'uptime-kuma': {
    id: 'uptime-kuma',
    name: 'Uptime Kuma',
    ports: ['3001:3001'],
    memory_mb: 256,
    disk_gb: 2,
    post_deploy_url: 'http://你的服务器IP:3001',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:3001，创建管理员账号，然后添加你要监控的网站地址即可。',
  },
  n8n: {
    id: 'n8n',
    name: 'n8n',
    ports: ['5678:5678'],
    memory_mb: 512,
    disk_gb: 4,
    post_deploy_url: 'http://你的服务器IP:5678',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:5678，创建管理员账号，然后就可以拖拽节点创建工作流了。',
    env_vars: [
      { key: 'N8N_SECURE_COOKIE', label: '安全 Cookie', default: 'false' },
    ],
  },
  immich: {
    id: 'immich',
    name: 'Immich',
    ports: ['2283:2283'],
    memory_mb: 4096,
    disk_gb: 50,
    post_deploy_url: 'http://你的服务器IP:2283',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:2283，创建管理员账号。然后在手机上下载 Immich App（iOS/安卓），用同样的地址登录，开启自动备份即可。',
    env_vars: [
      { key: 'DB_PASSWORD', label: '数据库密码', default: 'changeMe123!' },
      { key: 'UPLOAD_LOCATION', label: '照片存储路径', default: './data/photos' },
    ],
  },
  'stirling-pdf': {
    id: 'stirling-pdf',
    name: 'Stirling PDF',
    ports: ['8080:8080'],
    memory_mb: 512,
    disk_gb: 4,
    post_deploy_url: 'http://你的服务器IP:8080',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:8080，主页会展示所有 PDF 处理功能，拖文件进去就能用。',
  },
  vaultwarden: {
    id: 'vaultwarden',
    name: 'Vaultwarden',
    ports: ['8081:80'],
    memory_mb: 256,
    disk_gb: 2,
    post_deploy_url: 'http://你的服务器IP:8081',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:8081，创建你的主账号。然后在手机上下载 Bitwarden App，在 App 设置里把「服务器地址」改成 http://你的服务器IP:8081，所有密码就存在你自己的服务器上。',
    alternative_install: '如需开启 HTTPS（推荐），建议配合 Nginx Proxy Manager 或 Caddy 配置 SSL 证书。',
  },
  'adguard-home': {
    id: 'adguard-home',
    name: 'AdGuard Home',
    ports: ['3000:3000', '53:53/udp', '67:67/udp'],
    memory_mb: 256,
    disk_gb: 2,
    post_deploy_url: 'http://你的服务器IP:3000',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:3000，完成初始化设置。然后把家里路由器的 DNS 改成这台服务器的 IP 地址，全家的广告都会被自动拦截。',
    setup_notes: [
      '部署前请确保服务器的 53 端口没有被其他 DNS 服务占用（比如 systemd-resolved）',
      '如果 53 端口冲突，可以把 DNS 端口映射改为 5353:53/udp',
    ],
  },
  'changedetection-io': {
    id: 'changedetection-io',
    name: 'changedetection.io',
    ports: ['5000:5000'],
    memory_mb: 256,
    disk_gb: 5,
    post_deploy_url: 'http://你的服务器IP:5000',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:5000，输入要监控的网页地址，设置通知方式（支持邮件、企业微信、Telegram 等），它就会定期帮你检查网页变化。',
  },
  'paperless-ngx': {
    id: 'paperless-ngx',
    name: 'Paperless-ngx',
    ports: ['8000:8000'],
    memory_mb: 1024,
    disk_gb: 20,
    post_deploy_url: 'http://你的服务器IP:8000',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:8000，创建管理员账号。然后把扫描的 PDF 或图片拖进去，AI 会自动识别文字并分类。',
  },
  'home-assistant': {
    id: 'home-assistant',
    name: 'Home Assistant',
    ports: ['8123:8123'],
    memory_mb: 2048,
    disk_gb: 10,
    post_deploy_url: 'http://你的服务器IP:8123',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:8123，完成初始化向导。Home Assistant 会自动扫描你家网络里的智能设备，然后你可以创建「离家自动关灯」这类自动化规则。',
  },
  'open-webui': {
    id: 'open-webui',
    name: 'Open WebUI',
    ports: ['3000:3000'],
    memory_mb: 2048,
    disk_gb: 10,
    post_deploy_url: 'http://你的服务器IP:3000',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:3000，创建管理员账号。在设置里连接你的 Ollama 或其他 AI 模型服务，就能像 ChatGPT 一样聊天了。',
    setup_notes: ['需要先有 Ollama 或其他 LLM 后端服务', '如果 Ollama 在同一台服务器上，部署脚本会自动对接'],
  },
  dify: {
    id: 'dify',
    name: 'Dify',
    ports: ['3002:3000'],
    memory_mb: 4096,
    disk_gb: 20,
    post_deploy_url: 'http://你的服务器IP:3002',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:3002，创建管理员账号。选择「聊天助手」模板，上传你的知识库文档，AI 就能基于你的资料回答问题了。',
  },
  langflow: {
    id: 'langflow',
    name: 'LangFlow',
    ports: ['7860:7860'],
    memory_mb: 2048,
    disk_gb: 10,
    post_deploy_url: 'http://你的服务器IP:7860',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:7860，像画流程图一样拖拽 AI 模块，连起来就能搭建一个 AI 应用。',
  },
  metabase: {
    id: 'metabase',
    name: 'Metabase',
    ports: ['3003:3000'],
    memory_mb: 1024,
    disk_gb: 5,
    post_deploy_url: 'http://你的服务器IP:3003',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:3003，创建管理员账号。连接你的数据库或导入 Excel，点点鼠标就能生成图表和仪表盘。',
  },
  grafana: {
    id: 'grafana',
    name: 'Grafana',
    ports: ['3004:3000'],
    memory_mb: 512,
    disk_gb: 5,
    post_deploy_url: 'http://你的服务器IP:3004',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:3004，默认账号 admin/admin。添加数据源后，创建仪表盘，拖拽图表组件，做出漂亮的数据大屏。',
  },
  'apache-superset': {
    id: 'apache-superset',
    name: 'Apache Superset',
    ports: ['8088:8088'],
    memory_mb: 2048,
    disk_gb: 10,
    post_deploy_url: 'http://你的服务器IP:8088',
    post_deploy_msg: '打开浏览器访问 http://你的服务器IP:8088，默认账号 admin/admin。连接数据库，创建图表，组合成数据看板。',
  },
  homebridge: {
    id: 'homebridge',
    name: 'Homebridge',
    ports: ['8581:8581'],
    memory_mb: 256,
    disk_gb: 2,
    post_deploy_url: 'http://你的服务器IP:8581',
    post_deploy_msg: '浏览器访问管理页面，安装对应品牌插件，然后在 iPhone 家庭 App 中扫描二维码添加设备。',
  },
  'node-red': {
    id: 'node-red',
    name: 'Node-RED',
    ports: ['1880:1880'],
    memory_mb: 256,
    disk_gb: 2,
    post_deploy_url: 'http://你的服务器IP:1880',
    post_deploy_msg: '浏览器访问可视化编辑器，拖节点连线创建自动化流程，点部署生效。',
  },
  netdata: {
    id: 'netdata',
    name: 'Netdata',
    ports: ['19999:19999'],
    memory_mb: 512,
    disk_gb: 5,
    post_deploy_url: 'http://你的服务器IP:19999',
    post_deploy_msg: '浏览器访问即可看到实时监控仪表盘，无需任何额外配置。',
  },
  beszel: {
    id: 'beszel',
    name: 'Beszel',
    ports: ['8090:8090'],
    memory_mb: 128,
    disk_gb: 2,
    post_deploy_url: 'http://你的服务器IP:8090',
    post_deploy_msg: '打开网页创建管理员账号，在需要监控的每台服务器上运行 Agent，即可在主页看到所有服务器状态。',
  },
  jellyfin: {
    id: 'jellyfin',
    name: 'Jellyfin',
    ports: ['8096:8096'],
    memory_mb: 1024,
    disk_gb: 50,
    post_deploy_url: 'http://你的服务器IP:8096',
    post_deploy_msg: '浏览器访问完成初始化，添加电影/音乐文件夹，在手机或电视上装 Jellyfin 客户端登录即可播放。',
  },
  navidrome: {
    id: 'navidrome',
    name: 'Navidrome',
    ports: ['4533:4533'],
    memory_mb: 256,
    disk_gb: 20,
    post_deploy_url: 'http://你的服务器IP:4533',
    post_deploy_msg: '浏览器访问创建管理员账号，指定音乐文件夹路径，自动扫描建库后用兼容客户端听歌。',
  },
  audiobookshelf: {
    id: 'audiobookshelf',
    name: 'Audiobookshelf',
    ports: ['13378:13378'],
    memory_mb: 512,
    disk_gb: 20,
    post_deploy_url: 'http://你的服务器IP:13378',
    post_deploy_msg: '浏览器访问创建管理员账号，添加有声书文件夹，用手机 App 登录即可收听。',
  },
  'nginx-proxy-manager': {
    id: 'nginx-proxy-manager',
    name: 'Nginx Proxy Manager',
    ports: ['80:80', '443:443', '81:81'],
    memory_mb: 256,
    disk_gb: 2,
    post_deploy_url: 'http://你的服务器IP:81',
    post_deploy_msg: '浏览器访问管理页面（默认 admin@example.com/changeme），添加域名和申请免费 SSL 证书。',
  },
  portainer: {
    id: 'portainer',
    name: 'Portainer',
    ports: ['9443:9443', '8000:8000'],
    memory_mb: 256,
    disk_gb: 2,
    post_deploy_url: 'https://你的服务器IP:9443',
    post_deploy_msg: '浏览器访问创建管理员账号，连接本地 Docker 后就能在网页上管理所有容器。',
  },
  gitea: {
    id: 'gitea',
    name: 'Gitea',
    ports: ['3000:3000', '2222:22'],
    memory_mb: 256,
    disk_gb: 10,
    post_deploy_url: 'http://你的服务器IP:3000',
    post_deploy_msg: '浏览器访问完成初始设置，注册管理员账号，即可创建和管理 Git 仓库。',
  },
  nextcloud: {
    id: 'nextcloud',
    name: 'Nextcloud',
    ports: ['8080:80'],
    memory_mb: 1024,
    disk_gb: 50,
    post_deploy_url: 'http://你的服务器IP:8080',
    post_deploy_msg: '浏览器访问创建管理员账号，下载电脑/手机客户端填入服务器地址登录，即可开始文件同步。',
  },
  duplicati: {
    id: 'duplicati',
    name: 'Duplicati',
    ports: ['8200:8200'],
    memory_mb: 512,
    disk_gb: 5,
    post_deploy_url: 'http://你的服务器IP:8200',
    post_deploy_msg: '浏览器访问设置密码，添加备份任务（选择文件夹→设置目标→设定计划），自动执行加密备份。',
  },
  actual: {
    id: 'actual',
    name: 'Actual Budget',
    ports: ['5006:5006'],
    memory_mb: 256,
    disk_gb: 2,
    post_deploy_url: 'http://你的服务器IP:5006',
    post_deploy_msg: '浏览器访问创建管理员账号和加密密码，建立预算分类开始记账，手机可通过浏览器添加到主屏幕使用。',
  },
};

export function getDeployableTools(): DeployConfig[] {
  return Object.values(deployRegistry);
}

export function getDeployConfig(toolId: string): DeployConfig | undefined {
  return deployRegistry[toolId];
}

export function isDeployable(toolId: string): boolean {
  return toolId in deployRegistry;
}

// 生成部署命令
export function getDeployCommand(toolId: string): string {
  const baseUrl = 'https://awesome-toolkit.pages.dev';
  return `curl -fsSL ${baseUrl}/deploy/install.sh | bash -s -- ${toolId}`;
}

// 生成卸载命令
export function getUninstallCommand(toolId: string): string {
  const baseUrl = 'https://awesome-toolkit.pages.dev';
  return `curl -fsSL ${baseUrl}/deploy/uninstall.sh | bash -s -- ${toolId}`;
}

// 获取服务器最低配置推荐文案
export function getServerRecommendation(config: DeployConfig): string {
  const memDesc =
    config.memory_mb >= 4096
      ? `${config.memory_mb / 1024}GB`
      : `${config.memory_mb}MB`;
  return `服务器最低配置：${memDesc} 内存 + ${config.disk_gb}GB 硬盘，推荐阿里云/腾讯云轻量应用服务器（月费约 ¥50-100）`;
}
