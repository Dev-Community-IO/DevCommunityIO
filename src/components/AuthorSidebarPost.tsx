import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { useNavigate } from 'react-router-dom';
import usersService from '../services/api/users.service';
import { useAuth } from '../contexts/AuthContext';
import {
  asidePanelClass,
  asidePanelPadding,
  asideStatChipClass,
  asideGhostBtnClass,
  postCardDividerClass,
} from './postCardSurface';

interface AuthorSidebarPostProps {
  author: {
    id: string;
    username: string;
    pseudo?: string;
    avatarUrl: string;
    bio?: string;
    reputation: number;
    isVerified: boolean;
  };
  onPostClick: (slug: string) => void;
  onLoginRequired?: () => void;
}

interface Author {
  id: string;
  username: string;
  pseudo?: string;
  avatarUrl: string;
  bio?: string;
  reputation: number;
  isVerified: boolean;
  stats?: {
    posts: number;
    followers: number;
  };
}

function SidebarSkeleton() {
  return (
    <div className={`${asidePanelClass} ${asidePanelPadding} animate-pulse`}>
      <div className="flex gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="mt-3 h-8 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

const normalizeCount = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null) {
    const obj = value as { total?: number; count?: number };
    return Number(obj.total ?? obj.count ?? 0);
  }
  return Number(value || 0);
};

export function AuthorSidebarPost({
  author: authorProp,
  onPostClick: _onPostClick,
  onLoginRequired,
}: AuthorSidebarPostProps) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  const isOwnProfile =
    isAuthenticated && user && (user.id === authorProp.id || user.username === authorProp.username);

  const displayName = author?.pseudo || author?.username || authorProp.username;

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);

        const statsResponse = await usersService.getUserStats(authorProp.username, { period: 'all' });

        setAuthor({
          ...authorProp,
          stats: {
            posts: normalizeCount(statsResponse.posts),
            followers: normalizeCount(statsResponse.followers),
          },
        });

        if (isAuthenticated) {
          const isFollowingUser = await usersService.isFollowing(authorProp.id);
          setFollowing(isFollowingUser);
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
        setAuthor({
          ...authorProp,
          stats: { posts: 0, followers: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    if (authorProp) {
      fetchAuthorData();
    }
  }, [authorProp, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    try {
      if (following) {
        await usersService.unfollowUser(authorProp.id);
        setFollowing(false);
        if (author) {
          setAuthor({
            ...author,
            stats: {
              ...author.stats!,
              followers: Math.max(0, (author.stats?.followers || 0) - 1),
            },
          });
        }
      } else {
        await usersService.followUser(authorProp.id);
        setFollowing(true);
        if (author) {
          setAuthor({
            ...author,
            stats: {
              ...author.stats!,
              followers: (author.stats?.followers || 0) + 1,
            },
          });
        }
      }
    } catch (error: unknown) {
      console.error('Error following/unfollowing user:', error);
      setFollowing(!following);
      const message = error instanceof Error ? error.message : 'Failed to update follow status';
      alert(message);
    }
  };

  if (loading) return <SidebarSkeleton />;
  if (!author) return null;

  return (
    <section className={`${asidePanelClass} ${asidePanelPadding}`} aria-label="Author">
      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => navigate(`/profile/${author.username}`)}
            className="shrink-0 rounded-full ring-1 ring-zinc-200/80 transition-opacity hover:opacity-90 dark:ring-white/10"
          >
            <Avatar src={author.avatarUrl} alt={author.username} size="md" className="h-12 w-12" />
          </button>

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => navigate(`/profile/${author.username}`)}
              className="inline-flex max-w-full items-center gap-1 text-left"
            >
              <span className="truncate text-sm font-semibold text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300">
                {displayName}
              </span>
              {author.isVerified && <VerifiedBadge size={14} className="shrink-0" />}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/profile/${author.username}`)}
              className="mt-0.5 block truncate text-left text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              @{author.username}
            </button>
          </div>
        </div>

        {author.bio && (
          <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{author.bio}</p>
        )}

        <div className={`flex flex-wrap gap-1.5 pt-0.5 ${postCardDividerClass}`}>
          <span className={asideStatChipClass}>
            <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {author.stats?.posts ?? 0}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">posts</span>
          </span>
          <span className={asideStatChipClass}>
            <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {(author.stats?.followers ?? 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">followers</span>
          </span>
          <span className={asideStatChipClass}>
            <span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {Number(author.reputation || 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">rep</span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {!isOwnProfile && (
            <Button
              variant={following ? 'secondary' : 'primary'}
              onClick={handleFollow}
              className="h-8 w-full text-xs"
            >
              {following ? 'Following' : 'Follow'}
            </Button>
          )}

          <button
            type="button"
            onClick={() => navigate(`/profile/${author.username}`)}
            className={asideGhostBtnClass}
          >
            <ExternalLink size={14} strokeWidth={2} />
            View profile
          </button>
        </div>
      </div>
    </section>
  );
}
