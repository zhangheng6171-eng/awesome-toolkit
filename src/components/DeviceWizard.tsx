'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics';
import type { DeviceProfile, Tool } from '@/lib/tools';
import {
  DEVICE_LABELS, DEVICE_ICONS, RAM_PRESETS,
  recommendForDevice, getRAMTierLabel, formatRAM, formatDisk,
  formatStarCount, renderDifficultyStars,
} from '@/lib/tools';
import { getUniqueCategories } from '@/lib/tools';

interface Props {
  tools: Tool[];
}

const STEP_LABELS = ['你的设备', '内存大小', 'Docker', '用途'] as const;

export default function DeviceWizard({ tools }: Props) {
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState<DeviceProfile['type'] | null>(null);
  const [ramMb, setRamMb] = useState(4096);
  const [hasDocker, setHasDocker] = useState<boolean | null>(null);
  const [category, setCategory] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => { track('wizard_open'); }, []);

  const categories = useMemo(() => getUniqueCategories(), []);

  const results = useMemo(() => {
    if (!device || hasDocker === null) return null;
    const profile: DeviceProfile = { type: device, ram_mb: ramMb, has_docker: hasDocker, has_gpu: false };
    let filtered = recommendForDevice(profile, tools);
    if (category) {
      filtered = filtered.filter((t) => t.category === category);
    }
    return filtered;
  }, [device, ramMb, hasDocker, category, tools]);

  const canNext = () => {
    if (step === 0) return device !== null;
    if (step === 1) return ramMb > 0;
    if (step === 2) return hasDocker !== null;
    return true;
  };

  if (showResults && results) {
    return <ResultsView tools={results} device={device!} ramMb={ramMb} onReset={() => { setStep(0); setDevice(null); setHasDocker(null); setCategory(''); setShowResults(false); }} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              i === step
                ? 'bg-blue-600 text-white'
                : i < step
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-400'
            }`}>
              {i + 1}. {label}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className="w-4 h-0.5 bg-gray-200" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Device */}
      {step === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">你用什么设备？</h2>
          <p className="text-sm text-gray-500 mb-5">选择你打算用来安装和运行工具的机器</p>
          <div className="grid grid-cols-2 gap-3">
            {(['windows', 'mac', 'linux', 'nas'] as const).map((d) => (
              <button
                key={d}
                onClick={() => { setDevice(d); track('device_select', { device: d }); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  device === d
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">{DEVICE_ICONS[d]}</div>
                <div className="font-medium text-gray-900 text-sm">{DEVICE_LABELS[d]}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {d === 'windows' && '需要装 Docker Desktop'}
                  {d === 'mac' && '需要装 Docker Desktop'}
                  {d === 'linux' && '直接装 Docker 即可'}
                  {d === 'nas' && '需装 Container Manager'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: RAM */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {device && <>{DEVICE_ICONS[device]} {DEVICE_LABELS[device]} — 有多少内存？</>}
          </h2>
          <p className="text-sm text-gray-500 mb-5">内存越大，能流畅运行的工具越多</p>
          <div className="space-y-2">
            {RAM_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setRamMb(preset.value)}
                className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                  ramMb === preset.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">{preset.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{getRAMTierLabel(preset.value)}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  ramMb === preset.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {ramMb === preset.value && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Docker */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">你安装了 Docker 吗？</h2>
          <p className="text-sm text-gray-500 mb-5">
            {device === 'windows' && 'Windows 用户可以装 Docker Desktop（免费）'}
            {device === 'mac' && 'Mac 用户可以装 Docker Desktop（免费）'}
            {device === 'linux' && 'Linux 上推荐装 Docker + Docker Compose'}
            {device === 'nas' && '群晖在套件中心装 Container Manager 即可'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setHasDocker(true)}
              className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                hasDocker === true ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🐳</div>
              <div className="font-medium text-gray-900">已安装</div>
              <div className="text-xs text-gray-400 mt-1">可以直接跑容器</div>
            </button>
            <button
              onClick={() => setHasDocker(false)}
              className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                hasDocker === false ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">📦</div>
              <div className="font-medium text-gray-900">还没装</div>
              <div className="text-xs text-gray-400 mt-1">推荐原生 App 或网页工具</div>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Category (optional) */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">你想做什么？</h2>
          <p className="text-sm text-gray-500 mb-5">选一个用途，或者直接跳过看全部推荐</p>
          <div className="space-y-2">
            <button
              onClick={() => setCategory('')}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                category === '' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium text-gray-900">🔮 全部推荐</span>
              <span className="text-xs text-gray-400 ml-2">不限用途，看所有适合的工具</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full p-3 rounded-lg border text-left transition-all ${
                  category === cat ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-gray-900">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← 上一步
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            下一步
          </button>
        ) : (
          <button
            onClick={() => setShowResults(true)}
            disabled={!canNext()}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            🎯 查看推荐
          </button>
        )}
      </div>

      {/* Skip button */}
      {step < 3 && (
        <div className="mt-3 text-center">
          <button
            onClick={() => {
              if (!device) setDevice('linux');
              if (hasDocker === null) setHasDocker(true);
              setStep(3);
            }}
            className="text-xs text-gray-400 hover:text-gray-500 underline"
          >
            跳过，直接看全部推荐
          </button>
        </div>
      )}
    </div>
  );
}

function ResultsView({ tools, device, ramMb, onReset }: {
  tools: Tool[];
  device: DeviceProfile['type'];
  ramMb: number;
  onReset: () => void;
}) {
  const [showCategory, setShowCategory] = useState('');
  const [showBeginner, setShowBeginner] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(tools.map((t) => t.category));
    return Array.from(cats);
  }, [tools]);

  let filtered = tools;
  if (showCategory) filtered = filtered.filter((t) => t.category === showCategory);
  if (showBeginner) filtered = filtered.filter((t) => t.beginner_friendly);

  const recommended = filtered.filter((t) => ramMb >= t.system_requirements.recommended_ram_mb);
  const minimal = filtered.filter((t) => ramMb >= t.system_requirements.min_ram_mb && ramMb < t.system_requirements.recommended_ram_mb);
  const tooHeavy = filtered.filter((t) => ramMb < t.system_requirements.min_ram_mb);

  return (
    <div>
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{DEVICE_ICONS[device]}</span>
              <h2 className="text-lg font-semibold text-gray-900">{DEVICE_LABELS[device]} · {formatRAM(ramMb)} 内存</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              为你找到 <strong>{filtered.length}</strong> 个适合的工具
              {recommended.length > 0 && <>（{recommended.length} 个推荐配置可流畅运行）</>}
            </p>
          </div>
          <button onClick={onReset} className="text-sm text-blue-600 hover:underline">
            重新选择
          </button>
        </div>

        {/* Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400">筛选：</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setShowCategory(showCategory === cat ? '' : cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                showCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.replace(' & ', '/').replace('自部署 & 家庭服务器', '家庭服务器')}
            </button>
          ))}
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button
            onClick={() => setShowBeginner(!showBeginner)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              showBeginner ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            🌱 新手友好
          </button>
        </div>
      </div>

      {/* Too heavy warning */}
      {tooHeavy.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          ⚠️ 有 {tooHeavy.length} 个工具因为你的内存不够被隐藏了（需要 ≥{formatRAM(Math.min(...tooHeavy.map(t => t.system_requirements.min_ram_mb)))}）。
        </div>
      )}

      {/* Tool cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>没有匹配的工具，试试放宽筛选条件</p>
          </div>
        )}
        {recommended.map((tool) => (
          <RecommendationCard key={tool.id} tool={tool} tier="recommended" />
        ))}
        {minimal.map((tool) => (
          <RecommendationCard key={tool.id} tool={tool} tier="minimal" />
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ tool, tier }: { tool: Tool; tier: 'recommended' | 'minimal' }) {
  const req = tool.system_requirements;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/tool/${tool.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {tool.name}
            </Link>
            {tool.beginner_friendly && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">🌱 新手友好</span>
            )}
            {tier === 'minimal' && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">最低配置</span>
            )}
            <span className="text-xs text-gray-400">{tool.category}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{tool.description_plain}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>难度：{renderDifficultyStars(tool.difficulty)}</span>
            <span>内存：{formatRAM(req.min_ram_mb)} ~ {formatRAM(req.recommended_ram_mb)}</span>
            <span>磁盘：≥{formatDisk(req.min_disk_mb)}</span>
            <span>安装：约 {req.install_time_minutes} 分钟</span>
            {req.setup_notes && (
              <span className="text-gray-300 hidden sm:inline" title={req.setup_notes}>💡</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <Link
            href={`/tool/${tool.id}`}
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            查看详情
          </Link>
          <span className="text-xs text-gray-400">{formatStarCount(tool.stars)} ⭐</span>
        </div>
      </div>
    </div>
  );
}
