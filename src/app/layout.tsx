import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Awesome Toolkit — 开源工具一键部署，人人都能自托管',
  description:
    '从 GitHub 精选 50+ 最强开源工具，提供一键部署方案和普通人能看懂的使用说明。支持一键部署到你的服务器：照片管理、密码管理、智能家居、监控告警等。',
  keywords: '开源工具, Docker部署, 自托管, 一键部署, GitHub精选, 家庭服务器',
  openGraph: {
    title: 'Awesome Toolkit — 开源工具一键部署',
    description: '从 GitHub 精选 50+ 最强开源工具，提供一键部署方案。让普通人也能在自己的服务器上运行开源软件。',
    url: 'https://awesome-toolkit.pages.dev',
    siteName: 'Awesome Toolkit',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Awesome Toolkit — 开源工具一键部署',
    description: '从 GitHub 精选 50+ 最强开源工具，提供一键部署方案',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
