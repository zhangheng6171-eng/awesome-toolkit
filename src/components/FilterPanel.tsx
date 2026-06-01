'use client';

import { CATEGORIES } from '@/lib/categories';

interface FilterPanelProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: number | null;
  onDifficultyChange: (difficulty: number | null) => void;
  selectedTargetUser: string;
  onTargetUserChange: (user: string) => void;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '⭐ 下载即用',
  2: '⭐⭐ 需命令行',
  3: '⭐⭐⭐ 需配置',
  4: '⭐⭐⭐⭐ 需技术知识',
  5: '⭐⭐⭐⭐⭐ 需编程',
};

const TARGET_USERS = ['技术小白', '普通用户', '开发者'];

export default function FilterPanel({
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedTargetUser,
  onTargetUserChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-4">
      {/* 分类筛选 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">按分类</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              style={
                selectedCategory === cat.id
                  ? { backgroundColor: cat.color }
                  : undefined
              }
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 难度筛选 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">按安装难度</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onDifficultyChange(null)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              selectedDifficulty === null
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            不限难度
          </button>
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedDifficulty === d
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* 目标用户 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">按适合人群</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTargetUserChange('')}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              selectedTargetUser === ''
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            所有人
          </button>
          {TARGET_USERS.map((u) => (
            <button
              key={u}
              onClick={() => onTargetUserChange(u)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedTargetUser === u
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
