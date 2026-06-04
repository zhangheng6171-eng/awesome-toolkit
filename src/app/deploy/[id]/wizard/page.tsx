import type { Metadata } from 'next';
import { getDeployableTools, getDeployConfig } from '@/lib/deploy';
import { WizardClient } from './WizardClient';

export function generateStaticParams() {
  return getDeployableTools().map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const config = getDeployConfig(id);
  if (!config) return { title: '部署向导 | Awesome Toolkit' };
  return {
    title: `部署向导 — ${config.name} | Awesome Toolkit`,
    description: `在网页上填写服务器信息，一键自动部署 ${config.name}。Agent 自动检测系统、拉取镜像、启动服务。`,
    alternates: { canonical: `/deploy/${id}/wizard` },
    robots: { index: false },
  };
}

export default function WizardPage() {
  return <WizardClient />;
}
