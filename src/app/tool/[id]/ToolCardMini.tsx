import Link from 'next/link';
import type { Tool } from '@/lib/tools';
import { formatStarCount } from '@/lib/tools';

export default function ToolCardMini({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tool/${tool.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <h3 className="font-semibold text-gray-900 text-sm truncate">
        {tool.name}
      </h3>
      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
        {tool.description_plain}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <span>{formatStarCount(tool.stars)} ⭐</span>
        <span>
          {'⭐'.repeat(tool.difficulty)}
        </span>
      </div>
    </Link>
  );
}
