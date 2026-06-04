import { MessageCircle, ChevronRight } from 'lucide-react';
import { Post } from '../types';
import {
  compactPostCardClass,
  postCardDividerClass,
  postTagClass,
} from './postCardSurface';
import { Avatar } from './Avatar';
import { VerifiedBadge } from './VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import reactionsService from '../services/api/reactions.service';
import postsService from '../services/api/posts.service';
import { extractPostPreviewText } from '../utils/extractPostPreviewText';

interface CompactPostCardProps {
  post: Post;
  onClick: () => void;
  onLoginRequired?: () => void;
  hideTags?: boolean;
}

function formatTimeAgo(date: Date | string | undefined | null): string {
  if (!date) return 'Just now';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!dateObj || Number.isNaN(dateObj.getTime())) return 'Just now';

  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CompactPostCard({
  post,
  onClick,
  hideTags = false,
}: CompactPostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [emojis, setEmojis] = useState<{ emoji: string; count: number }[]>([]);
  const [coverError, setCoverError] = useState(false);

  useEffect(() => {
    setCoverError(false);
  }, [post.id, post.coverImage, post.coverImageUrl, post.ogImageUrl]);

  useEffect(() => {
    const loadReactions = async () => {
      try {
        const { reactions } = await reactionsService.getEmojis({ postId: post.id });
        setEmojis(reactions || []);
      } catch (error) {
        console.error('Failed to load reactions:', error);
      }
    };
    loadReactions();
  }, [post.id, user]);

  const coverSrc =
    post.coverImage ||
    post.coverImageUrl ||
    (post.autoGenerateImage ? post.ogImageUrl : undefined);

  const showCover =
    Boolean(coverSrc) &&
    !coverError &&
    (post.autoGenerateImage || post.coverImage || post.coverImageUrl);

  const totalReactions = emojis.reduce((sum, e) => sum + e.count, 0);
  const topEmojis = emojis.slice(0, 3);
  const contentPreview = extractPostPreviewText(post.content, {
    maxLength: 130,
    skipTitle: post.title,
  });

  const authorLabel =
    post.author?.username || post.author?.pseudo || post.page?.name || 'Member';

  const firstTag = post.tags?.[0];
  const tagLabel =
    !hideTags && firstTag
      ? typeof firstTag === 'string'
        ? firstTag
        : firstTag?.name || firstTag?.slug
      : null;

  const commentCount = post.commentCount ?? 0;
  const viewCount = post.viewCount ?? 0;
  const publishedLabel = formatTimeAgo(
    post.publishedAt || post.createdAt || post.timestamp
  );

  const handleCardClick = () => {
    if (post?.id) {
      postsService.trackView(post.id, 'card_click').catch(() => {});
    }
    onClick();
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.author?.username) {
      navigate(`/profile/${post.author.username}`);
    }
  };

  return (
    <article
      className={compactPostCardClass}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="link"
      aria-label={post.title}
    >
      {showCover ? (
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <img
            src={coverSrc}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setCoverError(true)}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent"
            aria-hidden
          />
          {tagLabel && (
            <span
              className={`${postTagClass} absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate border-white/20 bg-white/90 text-zinc-700 backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-300`}
            >
              #{tagLabel}
            </span>
          )}
        </div>
      ) : (
        <div
          className="flex h-1.5 w-full shrink-0 bg-gradient-to-r from-zinc-200 via-zinc-300/80 to-zinc-200 dark:from-white/[0.06] dark:via-white/[0.12] dark:to-white/[0.06]"
          aria-hidden
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col p-4">
        <button
          type="button"
          onClick={handleAuthorClick}
          className="mb-3 flex w-full min-w-0 items-center gap-2.5 text-left touch-manipulation"
        >
          <Avatar
            src={post.author?.avatar || post.author?.avatarUrl || ''}
            alt={authorLabel}
            size="sm"
            className="h-9 w-9 shrink-0 ring-2 ring-white dark:ring-zinc-900"
          />
          <div className="min-w-0 flex-1 leading-tight">
            <span className="flex min-w-0 items-center gap-1">
              <span className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {authorLabel}
              </span>
              {post.author?.isVerified && <VerifiedBadge size={11} className="shrink-0" />}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              {publishedLabel}
            </span>
          </div>
        </button>

        {!showCover && tagLabel && (
          <span className={`${postTagClass} mb-2 max-w-full self-start truncate`}>#{tagLabel}</span>
        )}

        <h3 className="mb-2 line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-white sm:text-base">
          {post.title}
        </h3>

        {contentPreview ? (
          <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {contentPreview}
          </p>
        ) : (
          <div className="mb-4 flex-1" />
        )}

        <div
          className={`mt-auto flex items-center justify-between gap-3 pt-3 ${postCardDividerClass}`}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {topEmojis.length > 0 && totalReactions > 0 && (
              <span className="inline-flex max-w-full items-center gap-1 tabular-nums">
                <span className="flex items-center -space-x-0.5">
                  {topEmojis.map(({ emoji }) => (
                    <span
                      key={emoji}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50 text-[10px] dark:border-white/10 dark:bg-zinc-800"
                    >
                      {emoji}
                    </span>
                  ))}
                </span>
                <span>{totalReactions}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageCircle size={12} strokeWidth={2} className="shrink-0 opacity-70" />
              {commentCount}
            </span>
            {viewCount > 0 && (
              <span className="hidden tabular-nums sm:inline">{viewCount.toLocaleString()} views</span>
            )}
          </div>

          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-zinc-500 transition-colors group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200">
            Read
            <ChevronRight
              size={14}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </article>
  );
}
