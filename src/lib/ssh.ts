import { NodeSSH } from 'node-ssh';

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
}

export interface SSHResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: string;
}

const CONNECTION_TIMEOUT = 15000;
const COMMAND_TIMEOUT = 300000;

export async function testConnection(config: SSHConfig): Promise<{ success: boolean; error?: string }> {
  const ssh = new NodeSSH();
  try {
    await ssh.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password || undefined,
      privateKey: config.privateKey || undefined,
      readyTimeout: CONNECTION_TIMEOUT,
      strict: false,
    });

    const result = await ssh.execCommand('echo ok');
    ssh.dispose();

    if (result.stdout.trim() === 'ok') {
      return { success: true };
    }
    return { success: false, error: `连接成功但响应异常: ${result.stderr || result.stdout}` };
  } catch (err) {
    ssh.dispose();
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('All configured authentication methods failed')) {
      return { success: false, error: '认证失败：请检查用户名和密码/私钥是否正确' };
    }
    if (msg.includes('Timed out') || msg.includes('EHOSTUNREACH') || msg.includes('ETIMEDOUT')) {
      return { success: false, error: '连接超时：请检查服务器 IP 和端口是否正确，确保服务器可以从公网访问' };
    }
    return { success: false, error: `连接失败：${msg}` };
  }
}

export type LogCallback = (type: 'info' | 'success' | 'error', message: string) => void;

export async function executeDeploy(
  config: SSHConfig,
  toolId: string,
  composeContent: string,
  onLog: LogCallback
): Promise<{ success: boolean; accessUrl?: string; error?: string }> {
  const ssh = new NodeSSH();

  try {
    onLog('info', `正在连接服务器 ${config.host}:${config.port}...`);
    await ssh.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password || undefined,
      privateKey: config.privateKey || undefined,
      readyTimeout: CONNECTION_TIMEOUT,
      strict: false,
    });
    onLog('success', 'SSH 连接成功');

    // Step 1: Check/install Docker
    onLog('info', '检测 Docker...');
    const dockerCheck = await ssh.execCommand('docker --version 2>/dev/null || echo NOT_FOUND', { execOptions: { execOptions: { timeout: COMMAND_TIMEOUT } } });
    if (dockerCheck.stdout.includes('NOT_FOUND')) {
      onLog('info', 'Docker 未安装，正在安装（约需 1-2 分钟）...');
      const installResult = await ssh.execCommand(
        'curl -fsSL https://get.docker.com | bash 2>&1',
        { execOptions: { timeout: COMMAND_TIMEOUT } }
      );
      if (installResult.code !== 0) {
        onLog('error', `Docker 安装失败: ${installResult.stderr}`);
        ssh.dispose();
        return { success: false, error: `Docker 安装失败: ${installResult.stderr}` };
      }
      onLog('success', 'Docker 安装完成');
    } else {
      onLog('success', `Docker 已安装: ${dockerCheck.stdout.trim()}`);
    }

    // Step 2: Create directories
    const installDir = `$HOME/awesome-tools/${toolId}`;
    onLog('info', `创建安装目录 ${installDir}...`);
    await ssh.execCommand(`mkdir -p ${installDir}/data`, { execOptions: { timeout: COMMAND_TIMEOUT } });
    onLog('success', '目录创建完成');

    // Step 3: Write docker-compose.yml
    onLog('info', '写入 docker-compose.yml...');
    // Escape the compose content for safe echo
    const escaped = composeContent.replace(/\\/g, '\\\\').replace(/'/g, "'\\''");
    const writeResult = await ssh.execCommand(
      `cat > ${installDir}/docker-compose.yml << 'COMPOSE_EOF'\n${composeContent}\nCOMPOSE_EOF\necho WRITTEN`,
      { execOptions: { timeout: COMMAND_TIMEOUT } }
    );
    if (!writeResult.stdout.includes('WRITTEN')) {
      onLog('error', `写入配置文件失败: ${writeResult.stderr}`);
      ssh.dispose();
      return { success: false, error: '写入 docker-compose.yml 失败' };
    }
    onLog('success', 'docker-compose.yml 写入成功');

    // Step 4: Pull images
    onLog('info', '拉取 Docker 镜像（首次可能需要几分钟）...');
    const pullResult = await ssh.execCommand(
      `cd ${installDir} && docker compose pull 2>&1`,
      { execOptions: { timeout: COMMAND_TIMEOUT } }
    );
    onLog('info', pullResult.stdout || pullResult.stderr || '镜像拉取完成');

    // Step 5: Start containers
    onLog('info', '启动容器...');
    const upCmd = await ssh.execCommand(
      `cd ${installDir} && docker compose up -d 2>&1`,
      { execOptions: { timeout: COMMAND_TIMEOUT } }
    );
    if (upCmd.code !== 0) {
      onLog('error', `容器启动失败: ${upCmd.stderr}`);
      ssh.dispose();
      return { success: false, error: `容器启动失败: ${upCmd.stderr}` };
    }
    onLog('success', '容器启动成功');

    // Step 6: Get server IP
    const ipResult = await ssh.execCommand(
      'curl -fsSL -4 ifconfig.me 2>/dev/null || curl -fsSL -4 ipinfo.io/ip 2>/dev/null || echo "你的服务器IP"',
      { execOptions: { timeout: COMMAND_TIMEOUT } }
    );
    const serverIp = ipResult.stdout.trim() || config.host;

    // Parse post-deploy URL from compose
    const postDeployMatch = composeContent.match(/# POST_DEPLOY_URL=(.*)/);
    let accessUrl = postDeployMatch
      ? postDeployMatch[1].replace(/你的服务器IP/g, serverIp)
      : `http://${serverIp}`;

    onLog('success', `部署完成! 访问地址: ${accessUrl}`);

    ssh.dispose();
    return { success: true, accessUrl };
  } catch (err) {
    ssh.dispose();
    const msg = err instanceof Error ? err.message : String(err);
    onLog('error', `部署异常: ${msg}`);
    return { success: false, error: msg };
  }
}
