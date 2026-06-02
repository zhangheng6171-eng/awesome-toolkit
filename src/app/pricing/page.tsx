'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FuturePlan {
  name: string;
  tier: string;
  price: string;
  description: string;
  features: string[];
  badge: string;
  badgeColor: string;
}

const futurePlans: FuturePlan[] = [
  {
    name: '免费版',
    tier: 'free',
    price: '¥0',
    description: '适合个人尝鲜体验',
    features: ['浏览全部 50+ 工具', '一键部署到你的服务器', '管理最多 1 台服务器', '部署 3 个工具', '社区支持'],
    badge: '当前可用',
    badgeColor: 'bg-green-500',
  },
  {
    name: 'Pro 版',
    tier: 'pro',
    price: '¥29/月',
    description: '适合自托管爱好者',
    features: ['免费版全部功能', '管理最多 5 台服务器', '无限制部署工具', '自动备份配置', '部署历史记录', '优先客服支持'],
    badge: '即将推出',
    badgeColor: 'bg-blue-500',
  },
  {
    name: 'Team 版',
    tier: 'team',
    price: '¥99/月',
    description: '适合团队协作',
    features: ['Pro 版全部功能', '无限制服务器', '团队协作管理', '批量部署 & 监控', '专属技术支持', '自定义品牌'],
    badge: '即将推出',
    badgeColor: 'bg-purple-500',
  },
];

export default function PricingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'pricing-early-bird' }),
      });
    } catch {}
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">定价方案</h1>
            <p className="text-sm text-gray-500">早期用户全部免费，付费方案即将推出</p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">返回首页</Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Free for all banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center mb-10">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold mb-2">早期用户免费计划</h2>
          <p className="text-lg text-green-100 mb-1">
            现在注册即可免费使用全部功能，包括一键部署、服务器管理等
          </p>
          <p className="text-sm text-green-200">无需信用卡，无需付费，立即开始</p>
        </div>

        {/* Future plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {futurePlans.map((plan) => (
            <div key={plan.tier} className="bg-white rounded-xl border border-gray-200 p-6 relative">
              <div className={`absolute -top-3 left-6 px-3 py-1 ${plan.badgeColor} text-white text-xs font-bold rounded-full`}>
                {plan.badge}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-2">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              <div className="mt-4 text-3xl font-bold text-gray-900">{plan.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {plan.features.map((f, i) => (
                  <li key={i}>✅ {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Early bird waitlist */}
        <div className="max-w-lg mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900">🐦 付费版早鸟折扣</h3>
          <p className="text-sm text-blue-600 mt-1">
            留下邮箱，付费版上线时获得 <strong>50% 折扣</strong>，并锁定早鸟价永久有效
          </p>
          {submitted ? (
            <p className="mt-4 text-green-600 font-medium">✅ 已登记！上线时我们会第一时间通知你</p>
          ) : (
            <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button type="submit" disabled={submitting}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? '提交中...' : '锁定早鸟价'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
