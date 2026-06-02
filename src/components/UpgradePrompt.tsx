'use client';

import { useState } from 'react';

interface UpgradePromptProps {
  featureName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradePrompt({ featureName, isOpen, onClose }: UpgradePromptProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: `upgrade-prompt-${featureName}` }),
      });
    } catch {}
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 max-w-md mx-4 text-center shadow-xl">
        <div className="text-3xl mb-3">🚀</div>
        <h3 className="text-lg font-semibold text-gray-900">「{featureName}」即将推出</h3>
        <p className="text-sm text-gray-500 mt-2">
          该功能正在开发中，留下邮箱第一时间通知你，上线时享早鸟折扣
        </p>

        {submitted ? (
          <p className="mt-4 text-green-600 font-medium text-sm">✅ 已登记！我们会尽快通知你</p>
        ) : (
          <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? '提交中...' : '通知我'}
            </button>
          </form>
        )}

        <button onClick={onClose}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600"
        >
          以后再说
        </button>
      </div>
    </div>
  );
}
