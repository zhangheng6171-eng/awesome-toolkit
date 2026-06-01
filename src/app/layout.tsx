import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitHub 精选工具库 - 人人都能用的开源工具',
  description:
    '从 GitHub 精选最强功能的开源项目，面向非技术人员也能看懂的工具库，配普通话使用说明。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
