'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';

export default function MobileFilterBar({
  category, onCategoryChange,
  difficulty, onDifficultyChange,
  targetUser, onTargetUserChange,
  onClear, resultCount,
}: {
  category: string;
  onCategoryChange: (c: string) => void;
  difficulty: number | null;
  onDifficultyChange: (d: number | null) => void;
  targetUser: string;
  onTargetUserChange: (u: string) => void;
  onClear: () => void;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700"
      >
        <span>筛选条件 ({resultCount})</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {/* Category chips */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">按分类</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              <FilterChip active={category === ''} onClick={() => onCategoryChange('')} label="全部" />
              {CATEGORIES.map((cat) => (
                <FilterChip key={cat.id} active={category === cat.id} onClick={() => onCategoryChange(cat.id)} label={`${cat.icon} ${cat.name}`} />
              ))}
            </div>
          </div>
          {/* Difficulty chips */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">按难度</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              <FilterChip active={difficulty === null} onClick={() => onDifficultyChange(null)} label="不限" />
              {[1, 2, 3, 4, 5].map((d) => (
                <FilterChip key={d} active={difficulty === d} onClick={() => onDifficultyChange(d)} label={'⭐'.repeat(d)} />
              ))}
            </div>
          </div>
          {/* Target user chips */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">按人群</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              <FilterChip active={targetUser === ''} onClick={() => onTargetUserChange('')} label="所有人" />
              {['技术小白', '普通用户', '开发者'].map((u) => (
                <FilterChip key={u} active={targetUser === u} onClick={() => onTargetUserChange(u)} label={u} />
              ))}
            </div>
          </div>
          <button
            onClick={() => { onClear(); setOpen(false); }}
            className="w-full px-3 py-1.5 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
        active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
