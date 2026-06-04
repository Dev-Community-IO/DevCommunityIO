import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  FileText,
  MessageSquare,
  ThumbsUp,
  TrendingDown,
  Users,
  UserPlus,
  Eye,
  Bookmark,
  Smile,
  Award,
  Building2,
  TrendingUp,
  Clock,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import usersService, {
  type UserStats,
  type UserStatsPeriod,
  type UserStatsPostsByCategory,
  type UserStatsTimelinePoint,
} from '../services/api/users.service';
import { TabPills } from './TabPills';
import { ProfileTabPanel, ProfileTabHeader, ProfileStatChip } from './profileTabUi';
import { asidePanelClass } from './postCardSurface';

const PERIOD_TABS: { id: UserStatsPeriod; label: string }[] = [
  { id: '1d', label: '1D' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '6m', label: '6M' },
  { id: '1yr', label: '1Y' },
  { id: 'all', label: 'ALL' },
];

function getPeriodCutoff(period: UserStatsPeriod): Date | null {
  const now = new Date();
  switch (period) {
    case '1d':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case '30d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case '6m': {
      const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case '1yr': {
      const d = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    default:
      return null;
  }
}

function isWithinPeriod(date: Date | string | undefined, cutoff: Date | null): boolean {
  if (!cutoff || !date) return true;
  return new Date(date).getTime() >= cutoff.getTime();
}

const ProfileDashboardCharts = lazy(() =>
  import('./ProfileDashboardCharts').then((m) => ({ default: m.ProfileDashboardCharts }))
);

interface ProfileDashboardProps {
  username: string;
  isOwnProfile?: boolean;
  user: {
    username: string;
    reputation?: number;
    joinedDate?: string;
    stats?: Partial<UserStats>;
  };
}

type DashboardStats = Required<
  Pick<
    UserStats,
    | 'reputation'
    | 'posts'
    | 'replies'
    | 'upvotes'
    | 'downvotes'
    | 'followers'
    | 'following'
    | 'bookmarks'
    | 'views'
    | 'pages'
    | 'achievements'
    | 'reactions'
  >
> & { postsByCategory: UserStatsPostsByCategory };

const EMPTY_CATEGORY: UserStatsPostsByCategory = {
  general: 0,
  hackathon: 0,
  event: 0,
  opportunity: 0,
};

const normalizeCount = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && value !== null) {
    const obj = value as { total?: number; count?: number };
    return Number(obj.total ?? obj.count ?? 0);
  }
  return Number(value || 0);
};

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return n.toLocaleString();
};

const timeAgo = (date: Date | string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200/80 bg-white/60 p-2.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200/70 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
          <Icon size={15} strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {label}
          </p>
          <p className="text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {typeof value === 'number' ? formatCount(value) : value}
          </p>
          {sub && <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function ActivityRow({
  title,
  meta,
  onClick,
}: {
  title: string;
  meta: React.ReactNode;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-2 rounded-lg border border-transparent px-2 py-2 text-left transition-colors ${
        onClick ? 'hover:border-zinc-200/80 hover:bg-zinc-50 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.03]' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          {meta}
        </div>
      </div>
      {onClick && <ChevronRight size={14} className="mt-1 shrink-0 text-zinc-400" aria-hidden />}
    </Comp>
  );
}

export function ProfileDashboard({ username, user, isOwnProfile = true }: ProfileDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    reputation: user?.reputation ?? 0,
    posts: normalizeCount(user?.stats?.posts),
    replies: normalizeCount(user?.stats?.replies),
    upvotes: normalizeCount(user?.stats?.upvotes),
    downvotes: 0,
    followers: normalizeCount(user?.stats?.followers),
    following: normalizeCount(user?.stats?.following),
    bookmarks: 0,
    views: 0,
    pages: 0,
    achievements: 0,
    reactions: 0,
    postsByCategory: { ...EMPTY_CATEGORY },
  });
  const [recentPosts, setRecentPosts] = useState<
    { id?: string; slug?: string; title?: string; createdAt?: string; upvotes?: number; category?: string }[]
  >([]);
  const [timeline, setTimeline] = useState<UserStatsTimelinePoint[]>([]);
  const [recentReplies, setRecentReplies] = useState<
    {
      id?: string;
      content?: string;
      body?: string;
      createdAt?: string;
      created_at?: string;
      postTitle?: string;
      post?: { title?: string; slug?: string };
    }[]
  >([]);
  const [period, setPeriod] = useState<UserStatsPeriod>('30d');
  const [periodLabel, setPeriodLabel] = useState('Last 30 days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!username) return;

      try {
        setLoading(true);
        setError(null);

        const updatedStats = await usersService.getUserStats(username, { period });
        setPeriodLabel(updatedStats.periodLabel ?? 'Last 30 days');
        const category = updatedStats.postsByCategory ?? EMPTY_CATEGORY;

        setStats({
          reputation: normalizeCount(updatedStats.reputation ?? user?.reputation),
          posts: normalizeCount(updatedStats.posts),
          replies: normalizeCount(updatedStats.replies),
          upvotes: normalizeCount(updatedStats.upvotes),
          downvotes: normalizeCount(updatedStats.downvotes),
          followers: normalizeCount(updatedStats.followers),
          following: normalizeCount(updatedStats.following),
          bookmarks: normalizeCount(updatedStats.bookmarks),
          views: normalizeCount(updatedStats.views),
          pages: normalizeCount(updatedStats.pages),
          achievements: normalizeCount(updatedStats.achievements),
          reactions: normalizeCount(updatedStats.reactions),
          postsByCategory: {
            general: normalizeCount(category.general),
            hackathon: normalizeCount(category.hackathon),
            event: normalizeCount(category.event),
            opportunity: normalizeCount(category.opportunity),
          },
        });

        setTimeline(
          Array.isArray(updatedStats.timeline) && updatedStats.timeline.length > 0
            ? updatedStats.timeline
            : Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - (5 - i));
                return {
                  label: d.toLocaleDateString('en-US', { month: 'short' }),
                  posts: 0,
                  replies: 0,
                };
              })
        );

        const [postsResponse, repliesResponse] = await Promise.all([
          usersService.getUserPosts(username, { limit: 5, page: 1 }).catch(() => null),
          usersService.getUserReplies(username, { limit: 5, page: 1 }).catch(() => null),
        ]);

        const cutoff = getPeriodCutoff(period);
        const postsData = postsResponse?.data ?? postsResponse ?? [];
        const filteredPosts = (Array.isArray(postsData) ? postsData : []).filter((post) =>
          isWithinPeriod(post.createdAt, cutoff)
        );
        setRecentPosts(filteredPosts.slice(0, 5));

        const repliesData = repliesResponse?.data ?? repliesResponse ?? [];
        const filteredReplies = (Array.isArray(repliesData) ? repliesData : []).filter((reply) =>
          isWithinPeriod(reply.createdAt ?? reply.created_at, cutoff)
        );
        setRecentReplies(filteredReplies.slice(0, 5));
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [username, user?.reputation, period]);

  const totalEngagement = stats.upvotes + stats.reactions + stats.bookmarks;

  const hasPeriodActivity =
    stats.posts > 0 ||
    stats.replies > 0 ||
    stats.upvotes > 0 ||
    stats.downvotes > 0 ||
    stats.reactions > 0 ||
    stats.bookmarks > 0 ||
    stats.views > 0 ||
    stats.followers > 0 ||
    stats.following > 0 ||
    stats.pages > 0 ||
    stats.achievements > 0 ||
    timeline.some((t) => t.posts > 0 || t.replies > 0);

  const periodEmptyMessage = `No activity in ${periodLabel.toLowerCase()}.`;

  const postUrl = (post: { slug?: string; id?: string; category?: string; hackathon?: { slug?: string }; event?: { slug?: string }; opportunity?: { slug?: string } }) => {
    const p = post as Record<string, unknown>;
    if (post.category === 'hackathon' && p.hackathon) {
      const h = p.hackathon as { slug?: string; id?: string };
      return `/hackathons/${h.slug || h.id}`;
    }
    if (post.category === 'event' && p.event) {
      const e = p.event as { slug?: string; id?: string };
      return `/events/${e.slug || e.id}`;
    }
    if (post.category === 'opportunity' && p.opportunity) {
      const o = p.opportunity as { slug?: string; id?: string };
      return `/opportunities/${o.slug || o.id}`;
    }
    return `/post/${post.slug || post.id}`;
  };

  if (loading && !error) {
    return (
      <ProfileTabPanel>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" strokeWidth={2} />
        </div>
      </ProfileTabPanel>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <ProfileTabPanel>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </ProfileTabPanel>
      )}

      <ProfileTabPanel>
        <ProfileTabHeader
          icon={LayoutGrid}
          title="Dashboard"
          description={
            user.joinedDate
              ? `Private analytics for @${username} · ${periodLabel.toLowerCase()} · joined ${user.joinedDate}`
              : `Private analytics · ${periodLabel.toLowerCase()}`
          }
        />

        {isOwnProfile && (
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            Only you see this dashboard. Visitors get a simple overview on the Overview tab.
          </p>
        )}

        {!hasPeriodActivity && (
          <p className="mb-3 rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-3 py-2 text-xs text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-zinc-400">
            {periodEmptyMessage}
          </p>
        )}

        <div className="mb-3 overflow-x-auto scrollbar-hide">
          <TabPills
            ariaLabel="Dashboard time range"
            activeTab={period}
            onChange={setPeriod}
            scrollable
            size="sm"
            tabs={PERIOD_TABS}
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <ProfileStatChip label="Reputation (all-time)" value={formatCount(stats.reputation)} />
          <ProfileStatChip
            label={`Engagement (${periodLabel.toLowerCase()})`}
            value={formatCount(totalEngagement)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <StatCard icon={FileText} label="Posts" value={stats.posts} />
          <StatCard icon={MessageSquare} label="Replies" value={stats.replies} />
          <StatCard icon={ThumbsUp} label="Upvotes" value={stats.upvotes} sub="received" />
          <StatCard icon={TrendingDown} label="Downvotes" value={stats.downvotes} sub="received" />
          <StatCard icon={Smile} label="Reactions" value={stats.reactions} sub="on posts" />
          <StatCard icon={Bookmark} label="Bookmarks" value={stats.bookmarks} sub="saved" />
          <StatCard icon={Eye} label="Views" value={stats.views} sub="on posts" />
          <StatCard icon={Users} label="Followers" value={stats.followers} />
          <StatCard icon={UserPlus} label="Following" value={stats.following} />
          <StatCard icon={Building2} label="Pages" value={stats.pages} sub="member of" />
          <StatCard icon={Award} label="Badges" value={stats.achievements} sub="unlocked" />
        </div>
      </ProfileTabPanel>

      <Suspense
        fallback={
          <ProfileTabPanel>
            <div className="flex h-[220px] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-400" strokeWidth={2} />
            </div>
          </ProfileTabPanel>
        }
      >
        <ProfileDashboardCharts
          timeline={timeline}
          periodLabel={periodLabel}
          periodEmptyMessage={periodEmptyMessage}
          postsByCategory={stats.postsByCategory}
          engagement={{
            upvotes: stats.upvotes,
            downvotes: stats.downvotes,
            reactions: stats.reactions,
            bookmarks: stats.bookmarks,
          }}
        />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`${asidePanelClass} p-3 sm:p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent posts</h3>
            <button
              type="button"
              onClick={() => navigate(`/profile/${username}?tab=posts`)}
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              View all
            </button>
          </div>
          <div className="space-y-0.5">
            {recentPosts.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-500">
                {period === 'all' ? 'No posts yet' : `No posts in ${periodLabel.toLowerCase()}`}
              </p>
            ) : (
              recentPosts.map((post) => (
                <ActivityRow
                  key={post.id || post.slug}
                  title={post.title || 'Untitled'}
                  onClick={() => navigate(postUrl(post))}
                  meta={
                    <>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo(post.createdAt || new Date())}
                      </span>
                      {(post.upvotes ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp size={10} />
                          {post.upvotes}
                        </span>
                      )}
                      {post.category && (
                        <span className="capitalize">{post.category}</span>
                      )}
                    </>
                  }
                />
              ))
            )}
          </div>
        </div>

        <div className={`${asidePanelClass} p-3 sm:p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recent replies</h3>
            <button
              type="button"
              onClick={() => navigate(`/profile/${username}?tab=replies`)}
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              View all
            </button>
          </div>
          <div className="space-y-0.5">
            {recentReplies.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-500">
                {period === 'all' ? 'No replies yet' : `No replies in ${periodLabel.toLowerCase()}`}
              </p>
            ) : (
              recentReplies.map((reply) => {
                const slug = reply.post?.slug;
                return (
                  <ActivityRow
                    key={reply.id || `${reply.createdAt}-${reply.content?.slice(0, 20)}`}
                    title={
                      (reply.content || reply.body || 'Reply').replace(/\s+/g, ' ').slice(0, 72) +
                      ((reply.content || reply.body || '').length > 72 ? '…' : '')
                    }
                    onClick={slug ? () => navigate(`/post/${slug}`) : undefined}
                    meta={
                      <>
                        <span className="truncate max-w-[10rem]">
                          on {reply.postTitle || reply.post?.title || 'a post'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={10} />
                          {timeAgo(reply.createdAt || reply.created_at || new Date())}
                        </span>
                      </>
                    }
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      <ProfileTabPanel>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <TrendingUp size={14} strokeWidth={2} className="shrink-0" />
          <span>
            {hasPeriodActivity && stats.posts > 0
              ? `Avg. ${formatCount(Math.round(totalEngagement / Math.max(stats.posts, 1)))} engagements per post · ${formatCount(Math.round(stats.views / Math.max(stats.posts, 1)))} views per post (${periodLabel.toLowerCase()})`
              : hasPeriodActivity
                ? 'Keep publishing to see per-post averages here.'
                : periodEmptyMessage}
          </span>
        </div>
      </ProfileTabPanel>
    </div>
  );
}
