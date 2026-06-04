import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Twitter, Linkedin, Link as LinkIcon, Check, Hash } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  type?: 'post' | 'hackathon' | 'event' | 'opportunity';
  hashtags?: (string | { name?: string; slug?: string; id?: string })[];
  description?: string;
}

const modalPanelClass =
  'rounded-xl border border-zinc-200/80 bg-white shadow-xl dark:border-white/10 dark:bg-zinc-900';

const previewPanelClass =
  'rounded-lg border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-white/[0.08] dark:bg-zinc-900/50';

const tagChipClass =
  'inline-flex max-w-full items-center gap-0.5 rounded-md border border-zinc-200/70 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400';

const shareActionClass =
  'flex w-full items-center gap-3 rounded-lg border border-zinc-200/80 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/[0.04] touch-manipulation';

const TYPE_LABELS: Record<NonNullable<ShareModalProps['type']>, string> = {
  post: 'Post',
  hackathon: 'Hackathon',
  event: 'Event',
  opportunity: 'Opportunity',
};

function truncateUrl(url: string, max = 48): string {
  try {
    const parsed = new URL(url);
    const path = `${parsed.hostname}${parsed.pathname}`;
    if (path.length <= max) return path;
    return `${path.slice(0, max - 1)}…`;
  } catch {
    return url.length > max ? `${url.slice(0, max - 1)}…` : url;
  }
}

export function ShareModal({
  isOpen,
  onClose,
  url,
  title,
  type,
  hashtags = [],
  description,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const normalizeTag = (tag: string | { name?: string; slug?: string; id?: string }): string => {
    if (typeof tag === 'string') return tag;
    return tag.name || tag.slug || tag.id || '';
  };

  const normalizedHashtags = hashtags.map(normalizeTag).filter(Boolean);

  const hashtagsString =
    normalizedHashtags.length > 0
      ? normalizedHashtags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ')
      : '';

  const shareText = `${title}${hashtagsString ? ` ${hashtagsString}` : ''}`;

  const handleCopyLink = async () => {
    const linkText = hashtagsString ? `${title}\n\n${hashtagsString}\n\n${url}` : `${title}\n\n${url}`;
    try {
      await navigator.clipboard.writeText(linkText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handleShareX = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center p-3 animate-fade-in sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div
        className={`relative w-full max-w-sm animate-slide-up ${modalPanelClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="share-modal-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Share
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
            >
              Close
            </button>
          </div>

          <div className={`${previewPanelClass} mb-3 space-y-2`}>
            <div className="flex flex-wrap items-center gap-1.5">
              {type && (
                <span className="rounded-md border border-zinc-200/70 bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                  {TYPE_LABELS[type]}
                </span>
              )}
            </div>
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            {description && (
              <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <LinkIcon size={12} className="shrink-0" />
              <span className="min-w-0 truncate" title={url}>
                {truncateUrl(url)}
              </span>
            </div>
            {normalizedHashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {normalizedHashtags.slice(0, 4).map((tag) => (
                  <span key={tag} className={tagChipClass}>
                    <Hash size={10} className="shrink-0 opacity-70" />
                    {tag}
                  </span>
                ))}
                {normalizedHashtags.length > 4 && (
                  <span className="self-center text-[10px] text-zinc-400">+{normalizedHashtags.length - 4}</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <button type="button" onClick={handleShareX} className={shareActionClass}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Twitter size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">X (Twitter)</span>
              </span>
            </button>

            <button type="button" onClick={handleShareLinkedIn} className={shareActionClass}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0A66C2] text-white">
                <Linkedin size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">LinkedIn</span>
              </span>
            </button>

            <button type="button" onClick={handleCopyLink} className={shareActionClass}>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${
                  copied
                    ? 'border-zinc-300 bg-zinc-200 text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100'
                    : 'border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400'
                }`}
              >
                {copied ? <Check size={16} /> : <LinkIcon size={16} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {copied ? 'Copied' : 'Copy link'}
                </span>
                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                  {copied ? 'Ready to paste' : 'Title, tags, and URL'}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
