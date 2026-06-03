'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchUserInfo, clearUserCache, type UserTier } from '@/lib/auth';

export default function UserMenu() {
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<UserTier>('free');
  const [source, setSource] = useState<'cf-access' | 'local' | 'loading'>('loading');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserInfo().then((info) => {
      setEmail(info.email);
      setTier(info.tier);
      setSource(info.source);
    });
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [open]);

  function handleLogout() {
    clearUserCache();
    setEmail('');
    setSource('local');
    setOpen(false);
    // CF Access logout: redirect to the Cloudflare Access logout endpoint
    // This clears the CF Access session cookie
    window.location.href = '/cdn-cgi/access/logout';
  }

  // Loading state
  if (source === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
    );
  }

  // Not authenticated
  if (!email) {
    return (
      <Link
        href="/cdn-cgi/access/login"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        登录
      </Link>
    );
  }

  const initial = email.charAt(0).toUpperCase();
  const tierBadge = tier === 'pro' ? 'bg-purple-500' : tier === 'team' ? 'bg-green-500' : 'bg-gray-400';

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        title={email}
      >
        <div className={`w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold`}>
          {initial}
        </div>
        <span className="hidden sm:inline text-sm text-gray-700 max-w-[120px] truncate">
          {email}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${tierBadge}`} />
              <span className="text-xs text-gray-500">
                {tier === 'pro' ? 'Pro 方案' : tier === 'team' ? 'Team 方案' : '免费版'}
              </span>
            </div>
            {source === 'cf-access' && (
              <p className="text-xs text-green-500 mt-0.5">✓ 已认证</p>
            )}
          </div>

          {/* Menu items */}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            控制台
          </Link>
          <Link
            href="/deploy"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            一键部署
          </Link>

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {source === 'cf-access' ? '退出登录' : '清除本地数据'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
