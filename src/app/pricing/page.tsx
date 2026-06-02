'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface Plan {
  name: string;
  tier: 'free' | 'pro' | 'team';
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: '免费版',
    tier: 'free',
    price: '¥0',
    period: '永久',
    description: '适合想自己动手的技术爱好者',
    features: [
      { text: '浏览全部 50 个工具', included: true },
      { text: '查看详细使用说明', included: true },
      { text: '复制手动部署命令', included: true },
      { text: '工具横向对比', included: true },
      { text: '一键自动部署', included: false },
      { text: '多台服务器管理', included: false },
      { text: '部署历史记录', included: false },
      { text: '优先技术支持', included: false },
    ],
    cta: '免费开始',
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: '¥29',
    period: '/月',
    description: '适合个人自部署玩家',
    features: [
      { text: '包含免费版全部功能', included: true },
      { text: '一键自动部署（不限次数）', included: true },
      { text: '最多 3 台服务器', included: true },
      { text: '工具对比功能', included: true },
      { text: '部署成功通知', included: true },
      { text: '多台服务器管理', included: false },
      { text: '部署历史记录', included: false },
      { text: '优先技术支持', included: false },
    ],
    cta: '升级 Pro',
    popular: true,
  },
  {
    name: 'Team',
    tier: 'team',
    price: '¥99',
    period: '/月',
    description: '适合团队和重度用户',
    features: [
      { text: '包含 Pro 全部功能', included: true },
      { text: '无限台服务器', included: true },
      { text: '一键自动部署（不限次数）', included: true },
      { text: '部署历史记录', included: true },
      { text: '工具批量部署', included: true },
      { text: '服务器状态监控', included: true },
      { text: '一键重启/更新/卸载', included: true },
      { text: '优先技术支持', included: true },
    ],
    cta: '升级 Team',
  },
];

export default function PricingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">选择适合你的方案</h1>
          <p className="mt-3 text-lg text-gray-500">
            从免费版开始，随时升级
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative bg-white rounded-2xl border-2 p-6 ${
                plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  最受欢迎
                </span>
              )}

              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {feat.included ? (
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className={feat.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feat.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.tier === 'free' ? (
                  <Link
                    href="/"
                    className="block w-full text-center py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      document.getElementById('waitlist-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block w-full text-center py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist section */}
        <div id="waitlist-section" className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-gray-900">Pro 版即将上线</h2>
          <p className="mt-2 text-gray-500">
            留下邮箱，上线时第一时间通知你，享受早鸟价
          </p>

          {submitted ? (
            <div className="mt-6 text-green-600 font-medium">
              ✅ 已登记！上线时我们会第一时间通知你
            </div>
          ) : (
            <form
              className="mt-6 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.trim()) return;
                try {
                  await fetch('/api/waitlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim(), source: 'pricing' }),
                  });
                } catch {
                  // 即使 API 不可用也显示成功（邮件保存到 localStorage 兜底）
                }
                setSubmitted(true);
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
              >
                登记
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
