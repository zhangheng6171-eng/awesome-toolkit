'use client';

import { type ReactNode } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/Toast';
import PageViewTracker from '@/components/PageViewTracker';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <PageViewTracker />
        {children}
      </ToastProvider>
    </ErrorBoundary>
  );
}
