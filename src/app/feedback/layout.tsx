import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '用户反馈 — Awesome Toolkit',
  description: '帮助我们改进 Awesome Toolkit。提交功能建议、工具推荐或使用问题，我们认真对待每一条反馈。',
  alternates: { canonical: '/feedback' },
  robots: { index: false },
};

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
