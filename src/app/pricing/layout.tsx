import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '定价方案 — 早期用户免费 | Awesome Toolkit',
  description: '早期用户全部免费使用。Pro 版 ¥29/月，Team 版 ¥99/月。现在注册锁定早鸟 50% 折扣，永久有效。',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: '定价方案 | Awesome Toolkit',
    description: '早期用户全部免费使用。现在注册锁定早鸟 50% 折扣，永久有效。',
    type: 'website',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
