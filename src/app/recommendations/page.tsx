import type { Metadata } from 'next';
import { getAllTools } from '@/lib/tools';
import RecommendationsClient from './RecommendationsClient';

export const metadata: Metadata = {
  title: '找到最适合你的工具 — 设备适配推荐 | Awesome Toolkit',
  description: '根据你的设备（Windows/Mac电脑/NAS/服务器）和配置，自动推荐适合部署的开源工具。',
  openGraph: {
    title: '设备适配推荐 — 找到最适合你的工具',
    description: '选择设备类型和配置，自动推荐适合的开源工具',
    type: 'website',
  },
};

export default function RecommendationsPage() {
  const tools = getAllTools();
  return <RecommendationsClient tools={tools} />;
}
