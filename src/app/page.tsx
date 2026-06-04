import type { Metadata } from 'next';
import { getAllTools } from '@/lib/tools';
import HomeClient from './HomeClient';
import { JsonLd, webSiteSchema } from '@/components/JsonLd';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Awesome Toolkit — 开源工具一键部署，人人都能自托管',
    description: '从 GitHub 精选 50+ 最强开源工具，提供一键部署方案。让普通人也能在自己的服务器上运行开源软件。',
    type: 'website',
  },
};

export default function Home() {
  const tools = getAllTools();
  return (
    <>
      <JsonLd data={webSiteSchema()} />
      <HomeClient tools={tools} />
    </>
  );
}
