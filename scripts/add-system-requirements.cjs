const fs = require('fs');
const tools = JSON.parse(fs.readFileSync('src/data/tools.json', 'utf8'));

// System requirements for all 50 tools
// Based on official docs + Docker Hub + real-world experience
const requirements = {
  // === AI & 自动化 ===
  ollama: {
    min_ram_mb: 8192, recommended_ram_mb: 16384, min_disk_mb: 20480, recommended_disk_mb: 102400,
    cpu: 'high', docker_required: false, gpu_beneficial: true,
    install_time_minutes: 10, setup_complexity: 'simple',
    setup_notes: 'CPU 模式需要 16GB+ 内存，GPU 模式 8GB 即可。每个模型额外占用 4-20GB 磁盘。',
  },
  dify: {
    min_ram_mb: 4096, recommended_ram_mb: 8192, min_disk_mb: 10240, recommended_disk_mb: 30720,
    cpu: 'high', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 15, setup_complexity: 'moderate',
    setup_notes: '包含 6 个容器（API、Worker、Web、PostgreSQL、Redis、Weaviate），需 4GB+ 内存。需配置 LLM API Key。',
  },
  'open-webui': {
    min_ram_mb: 2048, recommended_ram_mb: 4096, min_disk_mb: 2048, recommended_disk_mb: 10240,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '需要搭配 Ollama 或其他 LLM 后端使用。Ollama 推荐单独部署在有 GPU 的机器上。',
  },
  langflow: {
    min_ram_mb: 2048, recommended_ram_mb: 4096, min_disk_mb: 2048, recommended_disk_mb: 10240,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '轻量级 AI 工作流工具。需配置 LLM API Key（OpenAI 或本地 Ollama）。',
  },

  // === 开发效率工具 ===
  n8n: {
    min_ram_mb: 512, recommended_ram_mb: 2048, min_disk_mb: 1024, recommended_disk_mb: 5120,
    cpu: 'medium', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '也可用 npx n8n 一行命令启动，不需要 Docker。生产环境推荐 Docker。',
  },
  appwrite: {
    min_ram_mb: 4096, recommended_ram_mb: 8192, min_disk_mb: 10240, recommended_disk_mb: 30720,
    cpu: 'high', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 20, setup_complexity: 'complex',
    setup_notes: '微服务架构，包含多个容器。仅限开发者使用，需要编程知识。',
  },
  'it-tools': {
    min_ram_mb: 128, recommended_ram_mb: 256, min_disk_mb: 100, recommended_disk_mb: 500,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 1, setup_complexity: 'simple',
    setup_notes: '纯网页工具，浏览器打开 it-tools.tech 即可使用，无需安装。',
  },
  portainer: {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 1024, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '管理 Docker 的必备工具，建议作为每个新服务器的第一个部署。',
  },
  gitea: {
    min_ram_mb: 512, recommended_ram_mb: 2048, min_disk_mb: 2048, recommended_disk_mb: 10240,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '极轻量的 Git 服务，一个可执行文件就能跑。数据库选 SQLite 最简单。',
  },

  // === 数据处理 & 可视化 ===
  nocodb: {
    min_ram_mb: 512, recommended_ram_mb: 2048, min_disk_mb: 1024, recommended_disk_mb: 5120,
    cpu: 'medium', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '也可用 npx nocodb 启动。配合 PostgreSQL 更适合生产环境。',
  },
  metabase: {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 2048, recommended_disk_mb: 5120,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '需要连接数据库或导入数据才能发挥作用。单用户使用 SQLite 即可。',
  },
  grafana: {
    min_ram_mb: 512, recommended_ram_mb: 2048, min_disk_mb: 2048, recommended_disk_mb: 10240,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'moderate',
    setup_notes: '需要配置数据源（Prometheus、PostgreSQL 等）。配合 Prometheus 使用最经典。',
  },
  'apache-superset': {
    min_ram_mb: 2048, recommended_ram_mb: 4096, min_disk_mb: 5120, recommended_disk_mb: 20480,
    cpu: 'high', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 10, setup_complexity: 'moderate',
    setup_notes: '比 Metabase 更专业，适合数据分析团队。初始化配置较复杂。',
  },
  plausible: {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 5120, recommended_disk_mb: 20480,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 10, setup_complexity: 'moderate',
    setup_notes: '需要 ClickHouse + PostgreSQL。需要在被统计网站插入 JS 代码。',
  },

  // === 安全 & 隐私 ===
  vaultwarden: {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '极轻量（~50MB 内存）。公网访问必须配置 HTTPS（Nginx Proxy Manager 或 Caddy）。',
  },
  'adguard-home': {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'moderate',
    setup_notes: '需要占用 53 端口（DNS）。Windows 需先停用系统 DNS 服务。装完后路由器 DNS 指向它。',
  },
  'pi-hole': {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 1024, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 10, setup_complexity: 'moderate',
    setup_notes: '推荐用树莓派或 Linux 部署。同样需要 53 端口和路由器 DNS 配置。',
  },
  keepassxc: {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 200, recommended_disk_mb: 500,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 2, setup_complexity: 'simple',
    setup_notes: '纯桌面 App，离线使用。密码文件可以放 U 盘或同步盘。不需要服务器。',
  },
  passbolt: {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 2048, recommended_disk_mb: 5120,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 15, setup_complexity: 'complex',
    setup_notes: '面向团队，配置需数据库 + 邮件服务 + GPG 密钥。个人用户推荐 Vaultwarden。',
  },
  bitwarden: {
    min_ram_mb: 512, recommended_ram_mb: 2048, min_disk_mb: 1024, recommended_disk_mb: 5120,
    cpu: 'medium', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '官方提供免费云服务，也可以自托管。桌面 App + 浏览器插件 + 手机 App 全平台覆盖。',
  },

  // === 自部署 & 家庭服务器 ===
  immich: {
    min_ram_mb: 2048, recommended_ram_mb: 4096, min_disk_mb: 10240, recommended_disk_mb: 102400,
    cpu: 'high', docker_required: true, gpu_beneficial: true,
    install_time_minutes: 10, setup_complexity: 'moderate',
    setup_notes: '机器学习功能需要 GPU（可选）。2GB NAS 建议关闭 ML 功能。照片越多磁盘越大。',
  },
  photoprism: {
    min_ram_mb: 2048, recommended_ram_mb: 4096, min_disk_mb: 10240, recommended_disk_mb: 102400,
    cpu: 'high', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 10, setup_complexity: 'moderate',
    setup_notes: '类似 Immich，但更偏专业照片管理。需要指定照片目录作为数据源。',
  },
  'home-assistant': {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 5120, recommended_disk_mb: 20480,
    cpu: 'medium', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 15, setup_complexity: 'complex',
    setup_notes: '智能家居中枢。Docker 版不支持 USB 透传（Zigbee/Z-Wave），需要 host 网络模式。',
  },
  homebridge: {
    min_ram_mb: 512, recommended_ram_mb: 1024, min_disk_mb: 1024, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 10, setup_complexity: 'moderate',
    setup_notes: '让非 HomeKit 设备出现在 Apple 家庭 App 中。需与智能设备在同一局域网。',
  },
  'node-red': {
    min_ram_mb: 256, recommended_ram_mb: 1024, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '极轻量的流程自动化。配合 Home Assistant 使用效果更好。',
  },
  'uptime-kuma': {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '最易用的监控工具。添加要监控的网址，支持微信/邮件/钉钉等通知。',
  },
  netdata: {
    min_ram_mb: 512, recommended_ram_mb: 1024, min_disk_mb: 1024, recommended_disk_mb: 5120,
    cpu: 'medium', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '装好即用，自动发现所有监控指标。界面酷炫。Linux 原生安装效果更好。',
  },
  prometheus: {
    min_ram_mb: 1024, recommended_ram_mb: 4096, min_disk_mb: 10240, recommended_disk_mb: 51200,
    cpu: 'high', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 10, setup_complexity: 'complex',
    setup_notes: '专业级监控，需编辑 YAML 配置文件。通常配合 Grafana 使用。适合运维团队。',
  },
  beszel: {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'moderate',
    setup_notes: '需要 Hub + Agent 架构。每台被监控的服务器都要装 Agent。比 Netdata 更轻。',
  },
  duplicati: {
    min_ram_mb: 512, recommended_ram_mb: 1024, min_disk_mb: 1024, recommended_disk_mb: 2048,
    cpu: 'medium', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'moderate',
    setup_notes: '需要配置备份目标（云存储/FTP/本地硬盘）。支持加密和增量备份。',
  },
  actual: {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '个人理财记账。所有数据存自己服务器。手机通过网页添加到主屏幕即可使用。',
  },

  // === 网络 & 爬虫 ===
  'changedetection-io': {
    min_ram_mb: 256, recommended_ram_mb: 1024, min_disk_mb: 1024, recommended_disk_mb: 5120,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '监控网页变化。添加网址+监控区域+通知方式即可。支持十几种通知渠道。',
  },
  hoppscotch: {
    min_ram_mb: 128, recommended_ram_mb: 256, min_disk_mb: 50, recommended_disk_mb: 200,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 1, setup_complexity: 'simple',
    setup_notes: '纯网页 App，浏览器打开 hoppscotch.io 直接用，不需要部署。',
  },
  cyberchef: {
    min_ram_mb: 128, recommended_ram_mb: 256, min_disk_mb: 50, recommended_disk_mb: 200,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 1, setup_complexity: 'simple',
    setup_notes: '纯网页工具，浏览器打开即用。处理大文件时需更多内存。',
  },
  'nginx-proxy-manager': {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 1024, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'moderate',
    setup_notes: '需要 80/443 端口用于 HTTP/HTTPS。Windows 需先停用 IIS。一键申请 SSL 证书。',
  },

  // === 创意 & 媒体处理 ===
  excalidraw: {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 50, recommended_disk_mb: 200,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 1, setup_complexity: 'simple',
    setup_notes: '纯网页白板工具，浏览器打开 excalidraw.com 即用，无需安装。',
  },
  'obs-studio': {
    min_ram_mb: 4096, recommended_ram_mb: 8192, min_disk_mb: 2048, recommended_disk_mb: 10240,
    cpu: 'high', docker_required: false, gpu_beneficial: true,
    install_time_minutes: 5, setup_complexity: 'moderate',
    setup_notes: '需要 GPU 和桌面环境。纯服务器无法运行。录屏和直播需要较好的硬件。',
  },
  penpot: {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 2048, recommended_disk_mb: 10240,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 10, setup_complexity: 'moderate',
    setup_notes: '开源 Figma。Docker 部署或使用 penpot.app 免费在线版。',
  },
  'lossless-cut': {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'medium', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 2, setup_complexity: 'simple',
    setup_notes: '桌面 App，下载即用。视频剪辑时需足够磁盘空间存放输出文件。',
  },
  jellyfin: {
    min_ram_mb: 1024, recommended_ram_mb: 4096, min_disk_mb: 5120, recommended_disk_mb: 102400,
    cpu: 'high', docker_required: false, gpu_beneficial: true,
    install_time_minutes: 10, setup_complexity: 'moderate',
    setup_notes: '硬件转码需要 GPU。直接播放不需要 GPU。电影/音乐文件越多磁盘越大。',
  },
  navidrome: {
    min_ram_mb: 256, recommended_ram_mb: 512, min_disk_mb: 1024, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '轻量音乐服务器。占用极低。需要指定音乐文件夹路径。',
  },
  audiobookshelf: {
    min_ram_mb: 512, recommended_ram_mb: 1024, min_disk_mb: 2048, recommended_disk_mb: 10240,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '有声书和播客管理。手机 App 支持断点续听、倍速播放。',
  },

  // === 文件 & 知识管理 ===
  'stirling-pdf': {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 2048, recommended_disk_mb: 5120,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 5, setup_complexity: 'simple',
    setup_notes: '处理大 PDF 时需要更多内存。也可用 stirlingpdf.io 在线版。',
  },
  'paperless-ngx': {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 5120, recommended_disk_mb: 20480,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 10, setup_complexity: 'moderate',
    setup_notes: '需要配置 OCR 语言。扫描件越多磁盘需求越大。NAS 用户的最爱。',
  },
  'trilium-notes': {
    min_ram_mb: 512, recommended_ram_mb: 1024, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '桌面版直接安装。Docker 版可在浏览器访问。支持无限层级笔记。',
  },
  joplin: {
    min_ram_mb: 512, recommended_ram_mb: 1024, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '桌面 App + 手机 App，通过网盘同步。不需要服务器。',
  },
  logseq: {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 1024, recommended_disk_mb: 5120,
    cpu: 'medium', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '桌面 App 为主，数据存本地文件夹。Docker 版可在浏览器访问。',
  },
  siyuan: {
    min_ram_mb: 512, recommended_ram_mb: 1024, min_disk_mb: 512, recommended_disk_mb: 2048,
    cpu: 'low', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 3, setup_complexity: 'simple',
    setup_notes: '国产笔记软件。桌面版安装即用。对中文用户特别友好。',
  },
  outline: {
    min_ram_mb: 1024, recommended_ram_mb: 2048, min_disk_mb: 5120, recommended_disk_mb: 20480,
    cpu: 'medium', docker_required: true, gpu_beneficial: false,
    install_time_minutes: 15, setup_complexity: 'complex',
    setup_notes: '需要 OAuth 登录（GitHub/Google）+ PostgreSQL + Redis。配置较复杂。',
  },
  nextcloud: {
    min_ram_mb: 1024, recommended_ram_mb: 4096, min_disk_mb: 10240, recommended_disk_mb: 102400,
    cpu: 'medium', docker_required: false, gpu_beneficial: false,
    install_time_minutes: 15, setup_complexity: 'complex',
    setup_notes: '功能多但重。推荐 Docker Compose 部署。文件越多磁盘越大。外网访问需配域名+HTTPS。',
  },
};

// Also define beginner_friendly flag
const beginnerFriendly = new Set([
  'portainer', 'uptime-kuma', 'vaultwarden', 'actual', 'n8n',
  'nocodb', 'stirling-pdf', 'navidrome', 'changedetection-io',
  'open-webui', 'it-tools', 'excalidraw', 'hoppscotch', 'cyberchef',
  'keepassxc', 'joplin', 'lossless-cut', 'siyuan',
]);

for (const tool of tools) {
  const req = requirements[tool.id];
  if (!req) {
    console.error('MISSING requirements for:', tool.id);
    continue;
  }
  tool.system_requirements = req;
  tool.beginner_friendly = beginnerFriendly.has(tool.id);
}

fs.writeFileSync('src/data/tools.json', JSON.stringify(tools, null, 2) + '\n');

// Print summary
console.log('=== Summary ===');
console.log('Total tools:', tools.length);
console.log('With system_requirements:', tools.filter(t => t.system_requirements).length);
console.log('Beginner friendly:', tools.filter(t => t.beginner_friendly).length);
console.log('');
console.log('Docker required:', tools.filter(t => t.system_requirements.docker_required).length);
console.log('GPU beneficial:', tools.filter(t => t.system_requirements.gpu_beneficial).length);
console.log('');
console.log('Setup: simple =', tools.filter(t => t.system_requirements.setup_complexity === 'simple').length);
console.log('Setup: moderate =', tools.filter(t => t.system_requirements.setup_complexity === 'moderate').length);
console.log('Setup: complex =', tools.filter(t => t.system_requirements.setup_complexity === 'complex').length);
