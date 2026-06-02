'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 5) {
      setError('反馈内容至少需要 5 个字符');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), message: message.trim() }),
      });
      setSubmitted(true);
    } catch {
      setError('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户反馈</h1>
            <p className="text-sm text-gray-500">帮助我们改进产品</p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">返回首页</Link>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {submitted ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-900">感谢反馈！</h2>
            <p className="text-sm text-gray-500 mt-2">你的意见对我们非常重要，我们会认真对待每一条反馈</p>
            <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
              返回首页
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  你的反馈 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="比如：希望支持哪些工具？哪里不好用？有什么功能建议？"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱（选填）</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com，方便我们回复你"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {submitting ? '提交中...' : '提交反馈'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
