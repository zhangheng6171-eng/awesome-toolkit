import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '工具对比 — 横向比较 | Awesome Toolkit',
  description: '选择 2-4 个开源工具，从 Star 数、难度、许可证、界面类型等多个维度横向比较，帮你做出最好的选择。',
  alternates: { canonical: '/compare' },
  openGraph: {
    title: '开源工具横向对比 | Awesome Toolkit',
    description: '从多个维度横向比较开源工具，帮你做出最好的选择。',
    type: 'website',
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
