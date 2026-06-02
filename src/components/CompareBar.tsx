'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Tool } from '@/lib/tools';

const STORAGE_KEY = 'awesome-compare-tools';

export function getCompareIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addCompareId(id: string) {
  const ids = getCompareIds();
  if (ids.includes(id) || ids.length >= 4) return;
  ids.push(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event('compare-changed'));
}

export function removeCompareId(id: string) {
  const ids = getCompareIds().filter((i) => i !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event('compare-changed'));
}

export function clearCompare() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('compare-changed'));
}

export function isCompareSelected(id: string): boolean {
  return getCompareIds().includes(id);
}

export default function CompareBar({ tools }: { tools: Tool[] }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getCompareIds());
    const handler = () => setIds(getCompareIds());
    window.addEventListener('compare-changed', handler);
    return () => window.removeEventListener('compare-changed', handler);
  }, []);

  const selectedTools = ids.map((id) => tools.find((t) => t.id === id)).filter(Boolean) as Tool[];

  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">
            已选 {ids.length}/4
          </span>
          <div className="flex items-center gap-2">
            {selectedTools.map((tool) => (
              <span
                key={tool.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {tool.name}
                <button
                  onClick={() => removeCompareId(tool.id)}
                  className="ml-0.5 text-blue-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => clearCompare()}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            清空
          </button>
          <Link
            href={`/compare?tools=${ids.join(',')}`}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              ids.length >= 2
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            开始对比
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
