'use client';

import { useEffect, useRef } from 'react';

export interface LogEntry {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp: number;
}

interface TerminalLogProps {
  logs: LogEntry[];
  isRunning: boolean;
}

const colorMap = {
  info: 'text-cyan-400',
  success: 'text-green-400',
  error: 'text-red-400',
};

const prefixMap = {
  info: '  ➤',
  success: '  ✓',
  error: '  ✗',
};

export default function TerminalLog({ logs, isRunning }: TerminalLogProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 h-80 overflow-y-auto font-mono text-sm">
      {logs.length === 0 && isRunning && (
        <div className="flex items-center gap-2 text-gray-500">
          <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          等待连接...
        </div>
      )}

      {logs.map((entry, i) => (
        <div key={i} className={`${colorMap[entry.type]} leading-relaxed`}>
          <span className="text-gray-600 mr-2">
            [{new Date(entry.timestamp).toLocaleTimeString()}]
          </span>
          <span className={entry.type === 'error' ? 'text-red-400' : 'text-gray-500'}>
            {prefixMap[entry.type]}
          </span>
          <span>{entry.message}</span>
        </div>
      ))}

      {isRunning && (
        <div className="flex items-center gap-2 text-gray-500 mt-1">
          <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <span className="animate-pulse">执行中...</span>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
