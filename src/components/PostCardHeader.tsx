import { MoreHorizontal } from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { Avatar } from './Avatar';
import { PagePostAvatar } from './PageAuthorAvatarStack';
import { UserHoverCardDropdown } from './UserHoverCardDropdown';
import type { Post } from '../types';

interface PostCardHeaderProps {
  post: Post;
  timeAgo: string;
  isAuthenticated: boolean;
  isPostOwner: boolean;
  onLoginRequired?: () => void;
  onNavigateProfile: (username: string) => void;
  onNavigatePage: (slug: string) => void;
}

export function PostCardHeader({
  post,
  timeAgo,
  isAuthenticated,
  isPostOwner,
  onLoginRequired,
  onNavigateProfile,
  onNavigatePage,
}: PostCardHeaderProps) {
  const timestamp = post.publishedAt || post.createdAt || post.timestamp;

  const authCallbacks = {
    onViewProfile: () => onNavigateProfile(post.author.username),
    onFollow: () => {
      if (!isAuthenticated) {
        onLoginRequired?.();
      }
    },
  };

  return (
    <div className="flex shrink-0 items-start justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {post.page ? (
          <>
            <PagePostAvatar
              page={post.page}
              onPageClick={(e) => {
                e.stopPropagation();
                if (post.page?.slug) {
                  onNavigatePage(post.page.slug);
                }
              }}
              onViewPage={() => {
                if (post.page?.slug) {
                  onNavigatePage(post.page.slug);
                }
              }}
              onJoin={() => {
                if (!isAuthenticated) {
                  onLoginRequired?.();
                }
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="inline-flex min-w-0 max-w-full items-center gap-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.page?.slug) {
                      onNavigatePage(post.page.slug);
                    }
                  }}
                  className="truncate text-left text-xs font-semibold text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200 touch-manipulation"
                >
                  {post.page.name}
                </button>
                {post.page.isVerified && (
                  <VerifiedBadge variant="page" size={11} className="shrink-0" />
                )}
              </div>
              <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <UserHoverCardDropdown
                  user={{
                    ...post.author,
                    avatar: post.author.avatar || post.author.avatarUrl || '',
                    avatarUrl: post.author.avatarUrl || post.author.avatar,
                  }}
                  page={post.page}
                  trigger={
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateProfile(post.author.username);
                      }}
                      className="truncate font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 touch-manipulation"
                    >
                      @{post.author.username}
                    </button>
                  }
                  {...authCallbacks}
                />
                <span aria-hidden>·</span>
                <time className="shrink-0 whitespace-nowrap" dateTime={String(timestamp)}>
                  {timeAgo}
                </time>
              </div>
            </div>
          </>
        ) : (
          <UserHoverCardDropdown
            user={{
              ...post.author,
              avatar: post.author.avatar || post.author.avatarUrl || '',
              avatarUrl: post.author.avatarUrl || post.author.avatar,
            }}
            trigger={
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateProfile(post.author.username);
                }}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left touch-manipulation"
              >
                <Avatar
                  src={post.author.avatar || post.author.avatarUrl || ''}
                  alt={post.author.username}
                  size="sm"
                  className="h-9 w-9 shrink-0 ring-2 ring-white dark:ring-zinc-900"
                />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="flex min-w-0 items-center gap-0.5">
                    <span className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {post.author.username}
                    </span>
                    {post.author.isVerified && <VerifiedBadge size={11} className="shrink-0" />}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="tabular-nums">{post.author.reputation.toLocaleString()}</span> rep
                    <span className="mx-1 text-zinc-300 dark:text-zinc-600" aria-hidden>
                      ·
                    </span>
                    <time dateTime={String(timestamp)}>{timeAgo}</time>
                  </span>
                </span>
              </button>
            }
            {...authCallbacks}
          />
        )}
      </div>

      {isPostOwner && (
        <button
          type="button"
          aria-label="Post options"
          onClick={(e) => e.stopPropagation()}
          className="-mr-0.5 shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-200 touch-manipulation"
        >
          <MoreHorizontal size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
