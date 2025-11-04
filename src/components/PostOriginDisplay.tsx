import { ExternalLink, Globe } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface PostOriginDisplayProps {
  postOrigin?: string | null;
  originSource?: string | null;
  originUrl?: string | null;
}

export function PostOriginDisplay({ postOrigin, originSource, originUrl }: PostOriginDisplayProps) {
  // Don't render if no origin data exists
  if (!postOrigin && !originSource && !originUrl) {
    return null;
  }

  // Extract domain from URL for display
  const getDomain = (url: string | null | undefined): string => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const domain = originUrl ? getDomain(originUrl) : '';
  const displaySource = originSource || postOrigin || domain || 'External Source';

  return (
    <GlassCard className="p-4 sm:p-5 border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg">
            <Globe size={20} className="text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Original Source
            </span>
          </div>
          <div className="space-y-2">
            {displaySource && (
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                {displaySource}
              </p>
            )}
            {originUrl && (
              <a
                href={originUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group"
              >
                <span className="truncate max-w-[200px] sm:max-w-[300px]">{originUrl}</span>
                <ExternalLink size={14} className="flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

