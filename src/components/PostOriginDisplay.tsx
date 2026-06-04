import { ExternalLink, Link2 } from 'lucide-react';

interface PostOriginDisplayProps {
  postOrigin?: string | null;
  originSource?: string | null;
  originUrl?: string | null;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function formatLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function PostOriginDisplay({ postOrigin, originSource, originUrl }: PostOriginDisplayProps) {
  if (!postOrigin && !originSource && !originUrl) {
    return null;
  }

  const domain = originUrl ? getDomain(originUrl) : '';
  const sourceLabel = formatLabel(originSource || postOrigin || '');
  const linkLabel = domain || originUrl || '';
  const isRedundantSource =
    Boolean(linkLabel) && sourceLabel.toLowerCase() === linkLabel.toLowerCase();
  const showSource = Boolean(sourceLabel) && !isRedundantSource;

  return (
    <div
      role="note"
      aria-label="Original source"
      className="flex items-center gap-2.5 rounded-lg border border-zinc-200/70 bg-zinc-50/80 px-3 py-2 dark:border-white/[0.08] dark:bg-white/[0.03]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400">
        <Link2 className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
      </span>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-sm leading-tight">
        <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Source
        </span>

        {showSource && (
          <>
            <span className="hidden h-3 w-px shrink-0 bg-zinc-300/80 dark:bg-zinc-600 sm:block" aria-hidden />
            <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{sourceLabel}</span>
          </>
        )}

        {originUrl && (
          <>
            {(showSource || sourceLabel) && (
              <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                ·
              </span>
            )}
            <a
              href={originUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-w-0 max-w-full items-center gap-1 font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate">{linkLabel}</span>
              <ExternalLink
                className="h-3 w-3 shrink-0 opacity-60 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                aria-hidden
              />
            </a>
          </>
        )}
      </div>
    </div>
  );
}
