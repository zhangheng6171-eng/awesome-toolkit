'use client';

import { useState } from 'react';

export default function WaitlistForm({
  source = 'homepage',
  placeholder = 'your@email.com',
  buttonText = '登记',
  compact = false,
}: {
  source?: string;
  placeholder?: string;
  buttonText?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source }),
      });
    } catch {}
    setDone(true);
  }

  if (done) {
    return <p className={`text-green-600 font-medium ${compact ? 'text-sm' : ''}`}>✅ 已登记，上线时通知你!</p>;
  }

  return (
    <form className={`flex gap-2 ${compact ? '' : 'mt-2'}`} onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        required
        className={`flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${compact ? 'text-xs' : ''}`}
      />
      <button type="submit"
        className={`bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
      >
        {buttonText}
      </button>
    </form>
  );
}
