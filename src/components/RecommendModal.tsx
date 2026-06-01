'use client';

import { useState, useEffect, useRef } from 'react';

interface RecommendModalProps {
  open: boolean;
  onClose: () => void;
}

const GITHUB_USERNAME = 'YOUR_USERNAME';
const GITHUB_REPO = 'awesome-toolkit';

export default function RecommendModal({ open, onClose }: RecommendModalProps) {
  const [url, setUrl] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUrl('');
      setReason('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  function extractRepoName(githubUrl: string): string {
    const m = githubUrl.match(/github\.com\/[^/]+\/([^/?#]+)/);
    return m ? m[1] : '';
  }

  function handleSubmit() {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('请输入 GitHub 链接');
      return;
    }
    if (!trimmedUrl.startsWith('https://github.com/')) {
      setError('请输入有效的 GitHub 仓库链接（以 https://github.com/ 开头）');
      return;
    }

    const toolName = extractRepoName(trimmedUrl);
    const title = `推荐工具：${toolName || '未知工具'}`;
    const body = [
      `GitHub 链接：${trimmedUrl}`,
      reason.trim() ? `\n推荐理由：${reason.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const issueUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=tool-recommendation`;
    window.open(issueUrl, '_blank');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            推荐工具
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* GitHub 链接 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              GitHub 链接 <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              placeholder="https://github.com/用户名/仓库名"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 推荐理由 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              推荐理由 <span className="text-gray-400 text-xs">选填</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={100}
              rows={3}
              placeholder="简单说说这个工具是做什么的、为什么值得收录（最多100字）"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {reason.length}/100
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            提交到 GitHub Issue
          </button>

          <p className="text-xs text-gray-400 text-center">
            提交后将在 GitHub 上创建一个公开的 Issue，我们会定期查看
          </p>
        </div>
      </div>
    </div>
  );
}
