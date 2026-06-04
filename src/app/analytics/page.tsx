import type { Metadata } from 'next';
import AnalyticsDashboard from './AnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics — 用户行为分析 | Awesome Toolkit',
  description: '用户行为数据看板：访问量、推荐使用率、部署转化漏斗',
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
