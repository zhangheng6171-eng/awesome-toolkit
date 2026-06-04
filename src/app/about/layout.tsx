import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于我们 — Awesome Toolkit',
  description: 'Awesome Toolkit 的使命是帮助普通用户轻松自托管。从 GitHub 精选 50+ 最强开源工具，提供一键部署方案和通俗易懂的使用说明。',
  alternates: { canonical: '/about' },
  openGraph: {
    title: '关于 Awesome Toolkit — 开源工具一键部署',
    description: '帮助普通用户轻松自托管。从 GitHub 精选 50+ 最强开源工具，提供一键部署方案。',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
