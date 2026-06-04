'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Tool, Platforms, PlatformSupport } from '@/lib/tools';
import { PLATFORM_LABELS, getPlatformBadge } from '@/lib/tools';

interface Props {
  platforms: Platforms;
  toolId: string;
  toolName: string;
  isDeployable: boolean;
  platformInstructions?: Tool['platform_instructions'];
}

const PLATFORM_KEYS: (keyof Omit<Platforms, 'recommended'>)[] = ['windows', 'linux', 'mac', 'nas'];

const PLATFORM_ICONS: Record<string, string> = {
  windows: '🪟',
  linux: '🐧',
  mac: '🍎',
  nas: '🖥️',
};

const PLATFORM_NOTES: Record<PlatformSupport, (name: string, id: string) => string> = {
  native: (name) => `${name} 有官方安装包，下载后双击安装即可。`,
  docker: (_name, id) => `通过 Docker 部署 ${_name}，一条命令即可启动。`,
  web: () => '无需安装，浏览器打开即用。',
  unsupported: (name) => `${name} 暂不支持此平台。`,
};

export default function PlatformSelector({ platforms, toolId, toolName, isDeployable, platformInstructions }: Props) {
  const [selected, setSelected] = useState<string>(() => {
    const rec = platforms.recommended;
    if (rec === 'all') return 'linux';
    if (rec === 'web') return 'windows';
    return rec;
  });

  const support = platforms[selected as keyof Omit<Platforms, 'recommended'>] as PlatformSupport | undefined;
  const badge = support ? getPlatformBadge(support) : null;
  const instructions = platformInstructions?.[selected as 'windows' | 'linux' | 'mac' | 'nas'];

  return (
    <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <span className="text-2xl">💻</span> 选择你的部署环境
      </h2>

      {/* Platform tabs */}
      <div className="flex flex-wrap gap-2">
        {PLATFORM_KEYS.map((key) => {
          const p = platforms[key];
          const isSelected = selected === key;
          const icon = PLATFORM_ICONS[key] || '';
          const label = PLATFORM_LABELS[key] || key;
          const isDisabled = p === 'unsupported';

          return (
            <button
              key={key}
              onClick={() => !isDisabled && setSelected(key)}
              disabled={isDisabled}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : isDisabled
                    ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <span className="mr-1">{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Platform status badge + note */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        {badge && support && (
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-sm text-gray-600">
              {PLATFORM_NOTES[support](toolName, toolId)}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          {support === 'docker' && isDeployable && (
            <Link
              href={`/deploy/${toolId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              ⚡ 一键部署
            </Link>
          )}
          {support === 'native' && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              ✅ 前往官网下载安装包
            </span>
          )}
          {support === 'web' && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
              🌐 浏览器打开即用
            </span>
          )}
          {support === 'unsupported' && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm">
              🚫 {toolName} 暂不支持 {PLATFORM_LABELS[selected]}
            </span>
          )}
        </div>
      </div>

      {/* Mini hint for Docker Desktop */}
      {support === 'docker' && (selected === 'windows' || selected === 'mac') && (
        <p className="mt-2 text-xs text-gray-400">
          💡 {PLATFORM_LABELS[selected]} 用户需要先安装{' '}
          <a href="https://www.docker.com/products/docker-desktop/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Docker Desktop
          </a>
          （免费），然后即可运行 Docker 命令。
        </p>
      )}
      {support === 'docker' && selected === 'nas' && (
        <p className="mt-2 text-xs text-gray-400">
          💡 在 Synology DSM 套件中心安装「Container Manager」，导入 docker-compose.yml 即可。
        </p>
      )}

      {/* Platform-specific detailed instructions */}
      {instructions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {instructions.prerequisites && (
            <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <span className="text-xs font-medium text-amber-700">📋 准备工作：</span>
              <span className="text-xs text-amber-600 ml-1">{instructions.prerequisites}</span>
            </div>
          )}
          <ol className="space-y-2.5">
            {instructions.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          {instructions.note && (
            <p className="mt-3 text-xs text-gray-400 border-l-2 border-gray-200 pl-3">
              💡 {instructions.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
