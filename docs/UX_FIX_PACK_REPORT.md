# UX Fix Pack 实施报告

> 日期：2026-06-08
> 范围：P0（Stirling PDF 密码 + Vaultwarden HTTPS）+ P1（防火墙 + 价格）
> 状态：✅ 构建通过，待部署

---

## 一、修改文件

| # | 文件 | 变更 | 修复内容 |
|---|------|------|----------|
| 1 | `src/lib/deploy.ts` | +23/-2 | Stirling PDF + Vaultwarden setup_notes；价格分级 |
| 2 | `public/deploy/install.sh` | +72/-29 | 防火墙/安全组提醒 + 端口提示 + ufw 命令 |

## 二、逐项修复

### P0-1: Stirling PDF 默认密码说明

**Before（用户看到）：**
> 打开浏览器访问 http://IP:8080，主页会展示所有 PDF 处理功能，拖文件进去就能用。

**实际发生：** 用户打开网页 → 看到登录页 → 不知道密码 → 放弃。

**After：**
> 打开浏览器访问 http://IP:8080，首次访问会提示创建管理员账号（自己设置用户名和密码），之后每次使用都需要登录。登录后主页会展示所有 PDF 处理功能，拖文件进去就能用。

**新增 setup_notes（显示在部署页黄色警告区）：**
- 首次访问需要创建管理员账号：自己设置用户名和密码，记住即可
- 如果不需要密码保护，可以在 docker-compose.yml 中把 DOCKER_ENABLE_SECURITY 改为 false
- 处理大文件（100MB+）时建议给服务器分配 1GB 以上内存

### P0-2: Vaultwarden HTTPS 要求

**Before（用户看到）：**
> 手机上 Bitwarden App 设置里把「服务器地址」改成 http://IP:8081

**实际发生：** 手机 App 连接 HTTP → 失败 → 用户放弃。

**After：**
> ⚠️ 手机 App（iOS/安卓）要求 HTTPS 加密连接。HTTP 仅适合电脑浏览器临时测试。如需在手机上使用：推荐用 Nginx Proxy Manager 一键配置 SSL 证书，或使用 Cloudflare Tunnel 免费获得 HTTPS。

**新增 setup_notes（显示在部署页黄色警告区）：**
- 首次部署需先注册账号：SSH 进入服务器，编辑 docker-compose.yml，把 SIGNUPS_ALLOWED 改为 true，docker compose up -d 重启，访问网页注册。注册完成后改回 false 再重启
- ⚠️ 重要：手机 App 必须 HTTPS！如果只用电脑浏览器访问，HTTP 够用。手机用户请先配置 SSL 证书

### P1-1: install.sh 防火墙检查

**Before：** 部署成功信息打印后直接结束，无防火墙提示。

**After：** 新增独立的防火墙警告区块：
```
==============================================================
  !! 重要：防火墙 / 安全组设置
==============================================================

  如果浏览器打不开上面的访问地址，可能是防火墙没放行端口。

  云服务器（阿里云/腾讯云等）：
     进入控制台 -> 安全组 -> 添加入方向规则 -> 放行端口 TCP
     你需要放行的端口：8080（TCP）

  如果服务器上有 ufw 防火墙，运行：
     sudo ufw allow 8080/tcp

  放行端口后刷新浏览器即可访问
```

- 自动解析 compose 文件中的端口号
- 同时覆盖云服务器安全组和本地 ufw 两种场景
- 黄色高亮，视觉突出

### P1-2: 服务器价格分级

**Before：** 所有工具统一显示「月费约 ¥50-100」，不准确。

**After：** 根据内存需求三级定价：

| 内存 | 价格 |
|------|------|
| < 2GB（256MB~1GB） | ¥40-80 |
| 2GB~4GB | ¥60-100 |
| >= 4GB | ¥80-150 |

**效果：** Immich（4GB）显示 ¥80-150，Vaultwarden（256MB）显示 ¥40-80。

---

## 三、构建结果

```
✓ Compiled successfully in 1916ms
✓ TypeScript passed (2.6s, 0 errors)
✓ 125 static pages generated (767ms)
```

---

> **2 files, +72/-29. 零重构，零新功能，零架构变更。**
