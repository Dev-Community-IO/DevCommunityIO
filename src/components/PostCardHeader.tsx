import { MoreHorizontal } from 'lucide-react';
import { ReputationBadge } from './ReputationBadge';
import { VerifiedBadge } from './VerifiedBadge';
import { PagePostAvatar, PostAuthorAvatar } from './PageAuthorAvatarStack';
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
    <div className="flex shrink-0 items-start justify-between gap-2 sm:gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
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
            <div className="min-w-0 flex-1 space-y-0.5 pt-0.5">
              <div className="flex min-w-0 items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post.page?.slug) {
                      onNavigatePage(post.page.slug);
                    }
                  }}
                  className="truncate text-left text-sm font-semibold text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200 touch-manipulation"
                >
                  {post.page.name}
                </button>
                {post.page.isVerified && (
                  <VerifiedBadge variant="page" size={12} className="shrink-0 sm:h-3.5 sm:w-3.5" />
                )}
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0 text-[11px] text-zinc-500 dark:text-zinc-400">
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
                      className="inline-flex min-w-0 max-w-full items-center gap-x-1.5 rounded-md py-0.5 font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 touch-manipulation"
                    >
                      <span className="shrink-0">by</span>
                      {(post.author.avatar || post.author.avatarUrl) && (
                        <img
                          src={post.author.avatar || post.author.avatarUrl}
                          alt=""
                          className="h-4 w-4 shrink-0 rounded-full object-cover ring-1 ring-zinc-200/80 dark:ring-white/10"
                        />
                      )}
                      <span className="truncate">@{post.author.username}</span>
                    </button>
                  }
                  {...authCallbacks}
                />
                {post.author.isVerified && <VerifiedBadge size={10} className="shrink-0" />}
                <span aria-hidden>·</span>
                <time className="shrink-0 whitespace-nowrap" dateTime={String(timestamp)}>
                  {timeAgo}
                </time>
              </div>
            </div>
          </>
        ) : (
          <>
            <PostAuthorAvatar
              author={post.author}
              onAuthorClick={(e) => {
                e.stopPropagation();
                onNavigateProfile(post.author.username);
              }}
              {...authCallbacks}
            />
            <div className="min-w-0 flex-1 space-y-0.5 pt-0.5">
              <div className="flex min-w-0 items-center gap-1.5">
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
                      className="truncate text-left text-sm font-semibold text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-200 touch-manipulation"
                    >
                      {post.author.username}
                    </button>
                  }
                  {...authCallbacks}
                />
                {post.author.isVerified && (
                  <VerifiedBadge size={12} className="shrink-0 sm:h-3.5 sm:w-3.5" />
                )}
                <ReputationBadge value={post.author.reputation} className="hidden sm:inline-flex" />
              </div>
              <p className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                <time dateTime={String(timestamp)}>{timeAgo}</time>
                <ReputationBadge value={post.author.reputation} className="sm:hidden" />
              </p>
            </div>
          </>
        )}
      </div>

      {isPostOwner && (
        <button
          type="button"
          aria-label="Post options"
          onClick={(e) => e.stopPropagation()}
          className="-mr-1 shrink-0 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:scale-95 dark:hover:bg-white/10 dark:hover:text-zinc-200 touch-manipulation"
        >
          <MoreHorizontal size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
