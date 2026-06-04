'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

// Invisible component — fires tool_click event on mount
export default function TrackToolView({ toolId }: { toolId: string }) {
  useEffect(() => {
    track('tool_click', { tool_id: toolId });
  }, [toolId]);
  return null;
}
