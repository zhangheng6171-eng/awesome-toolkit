'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics';

export default function PageViewTracker() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    // Fire on initial load AND on each subsequent navigation
    if (pathname && pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      track('page_view');
    }
  }, [pathname]);

  return null;
}
