const fs = require('fs');
const tools = JSON.parse(fs.readFileSync('src/data/tools.json', 'utf8'));

function addPlatformInstructions(id, data) {
  const tool = tools.find(t => t.id === id);
  if (!tool) { console.error('NOT FOUND:', id); return; }
  tool.platform_instructions = data;
  console.log('OK:', id);
}

// Dify
addPlatformInstructions('dify', {
  windows: {
    prerequisites: '安装 Docker Desktop，至少 8GB 可用内存',
    steps: [
      '安装 Docker Desktop for Windows，确保 WSL 2 已启用',
      '创建 C:\\dify 文件夹，下载官方 docker-compose.yml 放入其中',
      '在 PowerShell 中 cd C:\\dify，运行 docker compose up -d',
      '首次启动需 5-10 分钟（下载多个镜像），完成后访问 http://localhost:3000',
      '创建管理员账号，配置 OpenAI API Key 或本地 Ollama 地址'
    ],
    note: 'Dify 包含多个服务（API、Worker、Web、PostgreSQL、Redis、Weaviate），需要 8GB+ 内存，低配电脑可能很慢。'
  },
  linux: {
    prerequisites: 'Linux VPS（推荐 4GB+ 内存），已安装 Docker 和 Docker Compose',
    steps: [
      'SSH 登录服务器：cd /opt && git clone https://github.com/langgenius/dify.git',
      'cd dify/docker && cp .env.example .env',
      '编辑 .env 文件，填入你的 OpenAI API Key 或其他模型配置',
      'docker compose up -d',
      '浏览器访问 http://你的服务器IP:3000，完成初始化设置'
    ],
    note: '生产环境建议配置外部 PostgreSQL 和 Redis。内存不足可在 .env 中关闭不需要的服务。'
  },
  mac: {
    prerequisites: 'Docker Desktop for Mac，至少 8GB 可用内存',
    steps: [
      '安装 Docker Desktop for Mac（Apple Silicon 版）',
      '终端执行：cd ~ && git clone https://github.com/langgenius/dify.git',
      'cd dify/docker && cp .env.example .env',
      '编辑 .env 填入 API Key，docker compose up -d',
      '浏览器访问 http://localhost:3000'
    ],
    note: 'Mac 睡眠后容器暂停。推荐仅用于开发测试，生产部署用 Linux VPS。'
  },
  nas: {
    prerequisites: 'Synology NAS（8GB+ 内存），Container Manager 已安装',
    steps: [
      'SSH 登录 NAS 或通过 File Station 创建 dify 项目文件夹',
      '下载 dify 官方 docker-compose.yml 到该文件夹',
      '在 Container Manager 中导入项目，注意修改 volume 路径为 NAS 路径',
      '环境变量中配置 API Key，启动所有服务',
      '启动后访问 http://你的NAS的IP:3000'
    ],
    note: 'Dify 对 NAS 内存要求较高，建议 8GB+ 型号。低配 NAS 建议用 Dify 免费云版。'
  }
});

// Flowise (langflow in our data)
addPlatformInstructions('langflow', {
  windows: {
    prerequisites: '安装 Docker Desktop',
    steps: [
      '安装 Docker Desktop for Windows 并启动',
      '打开 PowerShell，运行：docker run -d -p 7860:7860 langflowai/langflow',
      '浏览器访问 http://localhost:7860',
      '添加 API Key（OpenAI 或本地 Ollama），拖拽组件创建工作流'
    ],
    note: 'LangFlow 资源占用较低，4GB 内存即可流畅运行。'
  },
  linux: {
    prerequisites: 'Linux VPS（2GB+ 内存），Docker 已安装',
    steps: [
      'SSH 登录服务器',
      '运行：docker run -d --restart unless-stopped -p 7860:7860 langflowai/langflow',
      '浏览器访问 http://你的服务器IP:7860',
      '配置 LLM 后端（OpenAI / Ollama / 其他）'
    ],
    note: '推荐用 Docker Compose 管理，更方便配置环境变量和持久化存储。'
  },
  mac: {
    prerequisites: 'Docker Desktop for Mac',
    steps: [
      '安装 Docker Desktop for Mac',
      '终端运行：docker run -d -p 7860:7860 langflowai/langflow',
      '浏览器访问 http://localhost:7860'
    ],
    note: 'Mac 适合开发测试，生产部署推荐 Linux VPS。'
  },
  nas: {
    prerequisites: 'Synology NAS（4GB+ 内存），Container Manager 已安装',
    steps: [
      'Container Manager > 映像 > 新增 > 搜索 langflowai/langflow',
      '启动容器，端口映射 7860:7860',
      '浏览器访问 http://你的NAS的IP:7860'
    ],
    note: 'LangFlow 比 Dify 轻量很多，4GB 内存的 NAS 足够运行。'
  }
});

// Open WebUI
addPlatformInstructions('open-webui', {
  windows: {
    prerequisites: '安装 Docker Desktop + 提前装好 Ollama',
    steps: [
      '先安装 Ollama（ollama.com 下载安装包），启动并下载至少一个模型',
      '安装 Docker Desktop',
      'PowerShell 运行：docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui ghcr.io/open-webui/open-webui:main',
      '浏览器访问 http://localhost:3000，注册账号',
      '在设置中 Ollama 地址填 http://host.docker.internal:11434'
    ],
    note: '如果 Ollama 装在另一台电脑上，把 Ollama 地址改为那台电脑的 IP。'
  },
  linux: {
    prerequisites: 'Linux VPS 或本地 Linux，Docker 已安装',
    steps: [
      '如需本地 Ollama：curl -fsSL https://ollama.com/install.sh | sh && ollama pull qwen3',
      'docker run -d --network host -v open-webui:/app/backend/data -e OLLAMA_BASE_URL=http://127.0.0.1:11434 --name open-webui ghcr.io/open-webui/open-webui:main',
      '浏览器访问 http://你的服务器IP:3000'
    ],
    note: '使用 --network host 让容器直接访问本机 Ollama。如 Ollama 在其他机器上，改 OLLAMA_BASE_URL 即可。'
  },
  mac: {
    prerequisites: 'Docker Desktop for Mac + Ollama（可选）',
    steps: [
      '安装 Ollama（ollama.com 下载 Mac 版）',
      '安装 Docker Desktop for Mac',
      '终端运行 docker run 命令（同 Linux）',
      '浏览器访问 http://localhost:3000'
    ],
    note: 'Mac 版 Ollama 支持 Metal GPU 加速，速度比 Docker 中的 Ollama 快很多。'
  },
  nas: {
    prerequisites: 'Synology NAS（8GB+ 内存），Container Manager 已安装',
    steps: [
      'Container Manager > 映像 > 搜索 ghcr.io/open-webui/open-webui',
      '设置环境变量 OLLAMA_BASE_URL 指向你的 Ollama 服务器地址',
      '端口映射 3000:8080，启动容器',
      '浏览器访问 http://你的NAS的IP:3000'
    ],
    note: 'NAS 上一般不适合跑 Ollama（无 GPU）。建议 NAS 只跑 Open WebUI，Ollama 跑在有 GPU 的电脑上。'
  }
});

// NocoDB
addPlatformInstructions('nocodb', {
  windows: {
    prerequisites: '安装 Docker Desktop 或 Node.js 18+',
    steps: [
      '方式一（Docker）：docker run -d -p 8080:8080 nocodb/nocodb',
      '方式二（npx）：打开 PowerShell，输入 npx nocodb 回车',
      '浏览器访问 http://localhost:8080（Docker）',
      '创建项目，可选择导入 Excel、CSV 或连接外部数据库'
    ],
    note: 'npx 方式适合临时使用。Docker 方式数据持久化需挂载 volume。'
  },
  linux: {
    prerequisites: 'Linux VPS，Docker 已安装',
    steps: [
      'docker run -d --restart unless-stopped -p 8080:8080 -v nocodb-data:/usr/app/data nocodb/nocodb',
      '浏览器访问 http://你的服务器IP:8080',
      '推荐配合 PostgreSQL 使用（生产环境）或 SQLite（个人使用）'
    ],
    note: '生产环境建议使用外置 PostgreSQL，性能和可靠性更好。'
  },
  mac: {
    prerequisites: 'Docker Desktop for Mac 或 Node.js 18+',
    steps: [
      '安装 Docker Desktop for Mac',
      '终端运行：docker run -d -p 8080:8080 nocodb/nocodb',
      '浏览器访问 http://localhost:8080'
    ],
    note: '也可以用 npx nocodb 快速启动，不需要 Docker。'
  },
  nas: {
    prerequisites: 'Synology NAS，Container Manager 已安装',
    steps: [
      'Container Manager > 映像 > 搜索 nocodb/nocodb',
      '设置端口映射 8080:8080，挂载文件夹',
      '启动容器，访问 http://你的NAS的IP:8080'
    ],
    note: 'NocoDB 非常轻量，2GB 内存 NAS 即可运行。推荐用 PostgreSQL 做数据库。'
  }
});

// Vaultwarden
addPlatformInstructions('vaultwarden', {
  windows: {
    prerequisites: '安装 Docker Desktop',
    steps: [
      '安装 Docker Desktop for Windows',
      '创建 C:\\vaultwarden 文件夹，在里面创建 docker-compose.yml',
      'PowerShell 中 cd C:\\vaultwarden && docker compose up -d',
      '浏览器访问 http://localhost:8080，创建账号',
      '手机下载 Bitwarden App，设置 > 自托管服务器 > 填入 http://你的IP:8080'
    ],
    note: '仅本地使用不需要 HTTPS。如需外网访问，强烈建议用 Nginx Proxy Manager 配置 HTTPS 反向代理。'
  },
  linux: {
    prerequisites: 'Linux VPS，Docker 已安装',
    steps: [
      'mkdir -p /opt/vaultwarden/data && cd /opt/vaultwarden',
      '创建 docker-compose.yml（或使用我们的一键部署）',
      'docker compose up -d',
      '访问 http://你的服务器IP:8080 创建主账号',
      '所有设备安装 Bitwarden App，填入自托管地址即可同步密码'
    ],
    note: '密码管理器的安全级别最高。务必配置 HTTPS，不要用 HTTP 暴露到公网。'
  },
  mac: {
    prerequisites: 'Docker Desktop for Mac',
    steps: [
      '安装 Docker Desktop for Mac',
      '终端执行：mkdir -p ~/vaultwarden/data && cd ~/vaultwarden',
      '创建 docker-compose.yml，docker compose up -d',
      '浏览器访问 http://localhost:8080'
    ],
    note: '公网暴露必须配 HTTPS，用 Nginx Proxy Manager 或 Caddy。'
  },
  nas: {
    prerequisites: 'Synology NAS（任意型号），Container Manager 已安装',
    steps: [
      'File Station > docker 文件夹 > 新建 vaultwarden/data 子文件夹',
      'Container Manager > 项目 > 新增 > 导入 docker-compose.yml',
      'Volume 映射 /volume1/docker/vaultwarden/data:/data',
      '端口映射 8080:8080，启动',
      '访问 http://你的NAS的IP:8080 创建账号'
    ],
    note: 'Vaultwarden 资源占用极低（~50MB 内存），是最适合 NAS 的工具之一。'
  }
});

// Immich
addPlatformInstructions('immich', {
  windows: {
    prerequisites: '安装 Docker Desktop，建议 8GB+ 可用内存',
    steps: [
      '安装 Docker Desktop for Windows（启用 WSL 2）',
      '创建 C:\\immich 文件夹，下载官方 docker-compose.yml 和 .env 文件',
      '修改 .env 中的 UPLOAD_LOCATION 为你的照片存放路径',
      'docker compose up -d，第一次需下载多个镜像（约 5 分钟）',
      '访问 http://localhost:2283 创建管理员账号，开始上传照片'
    ],
    note: 'Immich 的机器学习功能需要 GPU 才能快速识别。CPU 模式也能用，只是慢一些。'
  },
  linux: {
    prerequisites: 'Linux VPS 或本地 Linux，Docker + Docker Compose 已安装',
    steps: [
      'wget -O- https://github.com/immich-app/immich/releases/latest/download/install.sh | bash',
      '修改 .env 文件中的 UPLOAD_LOCATION 为你的照片目录',
      'docker compose up -d',
      '访问 http://你的服务器IP:2283，创建管理员账号',
      '手机安装 Immich App，填入服务器地址，开启自动备份'
    ],
    note: '外网访问需要配置 HTTPS 反向代理。照片存储路径建议用 SSD。'
  },
  mac: {
    prerequisites: 'Docker Desktop for Mac',
    steps: [
      '安装 Docker Desktop for Mac',
      '终端运行 Immich 官方安装脚本',
      '修改 .env 中 UPLOAD_LOCATION 为 Mac 上的照片文件夹路径',
      'docker compose up -d',
      '访问 http://localhost:2283'
    ],
    note: 'Mac 版适合尝鲜体验。正式备份建议部署到 Linux 服务器或 NAS。'
  },
  nas: {
    prerequisites: 'Synology NAS（4GB+ 内存推荐，2GB 需关闭 ML 功能）',
    steps: [
      'Container Manager > 项目 > 新增',
      '导入 Immich 官方 docker-compose.yml',
      '修改 UPLOAD_LOCATION 为 /volume1/photo 或你的照片目录',
      '在 .env 中设置 IMMICH_MACHINE_LEARNING_ENABLED=false（低配 NAS）',
      '启动后访问 http://你的NAS的IP:2283'
    ],
    note: '这是 Immich 最推荐的部署方式之一。NAS 硬盘大、一直开机，非常适合做照片备份。'
  }
});

// Portainer
addPlatformInstructions('portainer', {
  windows: {
    prerequisites: '安装 Docker Desktop',
    steps: [
      '先安装并启动 Docker Desktop',
      '打开 PowerShell，运行 docker volume create portainer_data',
      '运行：docker run -d -p 9443:9443 -p 8000:8000 --name portainer --restart=always -v \\\\.\\pipe\\docker_engine:\\\\.\\pipe\\docker_engine -v portainer_data:/data portainer/portainer-ce:latest',
      '浏览器访问 https://localhost:9443（注意是 https）',
      '首次访问会要求创建管理员密码（至少 12 位），然后选择本地连接'
    ],
    note: 'Portainer 是 Docker 管理的第一步。装完它后面所有工具都能在网页上点点鼠标部署。'
  },
  linux: {
    prerequisites: 'Linux VPS，Docker 已安装',
    steps: [
      'docker run -d -p 9443:9443 -p 8000:8000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest',
      '浏览器访问 https://你的服务器IP:9443',
      '创建管理员密码（至少 12 位）',
      '连接本地 Docker 环境，开始可视化管理'
    ],
    note: 'Portainer 自己就是个容器，占用极低（~30MB 内存）。建议作为每个新服务器的第一个部署。'
  },
  mac: {
    prerequisites: 'Docker Desktop for Mac',
    steps: [
      '安装 Docker Desktop for Mac',
      '终端运行 docker run 命令（同 Linux）',
      '访问 https://localhost:9443'
    ],
    note: 'Mac 版功能与 Linux 完全相同。'
  },
  nas: {
    prerequisites: 'Synology NAS，Container Manager 已安装',
    steps: [
      'Container Manager > 映像 > 搜索 portainer/portainer-ce',
      '启动容器，端口映射 9443:9443 和 8000:8000',
      '挂载 /var/run/docker.sock:/var/run/docker.sock',
      '访问 https://你的NAS的IP:9443',
      '之后可以在 Portainer 网页中管理所有 NAS 上的 Docker 容器'
    ],
    note: 'NAS 上的 Portainer 需要访问 Docker socket，权限设置可能需要在 SSH 中手动调整。'
  }
});

fs.writeFileSync('src/data/tools.json', JSON.stringify(tools, null, 2) + '\n');
console.log('Done: 8 tools have platform_instructions');
