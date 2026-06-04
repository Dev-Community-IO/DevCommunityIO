import { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award, Lock, Trophy, Loader2, Star, Target } from 'lucide-react';
import achievementsService, { Achievement } from '../services/api/achievements.service';
import { AchievementBadge } from './AchievementBadge';
import { TabPills } from './TabPills';
import {
  ProfileTabPanel,
  ProfileTabHeader,
  ProfileStatChip,
} from './profileTabUi';
import { asidePanelClass } from './postCardSurface';

interface ProfileAchievementsProps {
  username: string;
  isOwnProfile?: boolean;
}

type AchievementFilter = 'all' | 'unlocked' | 'locked';

const difficultyChip: Record<Achievement['difficulty'], string> = {
  easy: 'text-emerald-700 dark:text-emerald-400',
  medium: 'text-sky-700 dark:text-sky-400',
  hard: 'text-violet-700 dark:text-violet-400',
  expert: 'text-amber-700 dark:text-amber-400',
  legendary: 'text-rose-700 dark:text-rose-400',
};

const criteriaLabels: Record<string, string> = {
  posts_count: 'Create posts',
  comments_count: 'Write comments',
  upvotes_given: 'Give upvotes',
  upvotes_received: 'Receive upvotes',
  followers_count: 'Gain followers',
  following_count: 'Follow users',
  pages_created: 'Create pages',
  reputation: 'Earn reputation',
  reactions_received: 'Receive reactions',
  bookmarks_received: 'Get bookmarks',
  profile_complete: 'Complete profile',
  is_verified: 'Verify account',
  verified: 'Verify account',
  first_post: 'First post',
  first_comment: 'First comment',
  first_page: 'First page',
  streak_days: 'Day streak',
  daily_streak: 'Daily streak',
  daily_active: 'Daily activity',
};

const getCriteriaDisplay = (criteria?: { type: string; value: number | boolean }): string => {
  if (!criteria?.type) return '';
  const label =
    criteriaLabels[criteria.type] ||
    criteria.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  if (typeof criteria.value === 'boolean') return label;
  if (criteria.type === 'daily_streak' || criteria.type === 'streak_days') {
    return `${label} · ${criteria.value}d`;
  }
  return `${label} · ${criteria.value}`;
};

function normalizeAchievements(data: Achievement[]): Achievement[] {
  return data.map((ach) => {
    let isUnlocked = false;
    if (ach.isUnlocked === true || ach.isUnlocked === ('true' as unknown) || ach.isUnlocked === (1 as unknown)) {
      isUnlocked = true;
    } else if (ach.unlocked_at) {
      isUnlocked = true;
    }
    return { ...ach, isUnlocked };
  });
}

export function ProfileAchievements({ username, isOwnProfile = false }: ProfileAchievementsProps) {
  const [searchParams] = useSearchParams();
  const highlightSlug = searchParams.get('achievement');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AchievementFilter>('all');
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!username) {
        setLoading(false);
        setError('Username is required');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        let data = await achievementsService.getUserAchievements(username);
        if (!Array.isArray(data)) data = [];
        setAchievements(normalizeAchievements(data));
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as Error)?.message ||
          'Failed to load achievements';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [username]);

  useEffect(() => {
    if (!highlightSlug || loading || achievements.length === 0) return;

    const match = achievements.find((a) => a.slug === highlightSlug);
    if (match?.isUnlocked) {
      setFilter('unlocked');
    } else if (match) {
      setFilter('all');
    }

    const timer = window.setTimeout(() => {
      highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [highlightSlug, loading, achievements]);

  const unlocked = useMemo(() => achievements.filter((a) => a.isUnlocked === true), [achievements]);
  const locked = useMemo(() => achievements.filter((a) => a.isUnlocked !== true), [achievements]);

  const progress =
    achievements.length === 0 ? 0 : Math.round((unlocked.length / achievements.length) * 100);

  const filtered = useMemo(() => {
    if (filter === 'unlocked') return unlocked;
    if (filter === 'locked') return locked;
    return achievements;
  }, [filter, achievements, unlocked, locked]);

  const filterTabs = useMemo(() => {
    const tabs: { id: AchievementFilter; label: string; icon: typeof Award; count?: number }[] = [
      { id: 'all', label: 'All', icon: Award, count: achievements.length },
      { id: 'unlocked', label: 'Unlocked', icon: Trophy, count: unlocked.length },
    ];
    if (isOwnProfile) {
      tabs.push({ id: 'locked', label: 'Locked', icon: Lock, count: locked.length });
    }
    return tabs;
  }, [achievements.length, unlocked.length, locked.length, isOwnProfile]);

  if (loading) {
    return (
      <ProfileTabPanel>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" strokeWidth={2} />
        </div>
      </ProfileTabPanel>
    );
  }

  if (error) {
    return (
      <ProfileTabPanel>
        <ProfileTabHeader icon={Award} title="Achievements" description={error} />
      </ProfileTabPanel>
    );
  }

  if (achievements.length === 0) {
    return (
      <ProfileTabPanel>
        <div className="py-12 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
            <Award size={22} strokeWidth={1.75} />
          </span>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No achievements yet</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {isOwnProfile
              ? 'Contribute to the community to unlock badges.'
              : "This user hasn't unlocked any badges yet."}
          </p>
        </div>
      </ProfileTabPanel>
    );
  }

  return (
    <div className="space-y-4">
      <ProfileTabPanel>
        <ProfileTabHeader
          icon={Award}
          title="Achievements"
          description={
            isOwnProfile
              ? 'Track milestones and reputation goals.'
              : `Badges earned by ${username}.`
          }
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <ProfileStatChip label="Unlocked" value={unlocked.length} />
          <ProfileStatChip label="Total" value={achievements.length} />
          <ProfileStatChip label="Progress" value={`${progress}%`} />
          {unlocked.filter((a) => a.is_showcased).length > 0 && (
            <ProfileStatChip
              label="Showcased"
              value={unlocked.filter((a) => a.is_showcased).length}
            />
          )}
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all duration-500 dark:bg-zinc-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </ProfileTabPanel>

      <div className={`${asidePanelClass} overflow-hidden p-2 sm:p-3`}>
        <div className="mb-2 overflow-x-auto scrollbar-hide px-1">
          <TabPills
            ariaLabel="Achievement filters"
            activeTab={filter}
            onChange={setFilter}
            scrollable
            size="sm"
            tabs={filterTabs}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
            No achievements in this view.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filtered
              .sort((a, b) => {
                if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
                if (a.isUnlocked && b.isUnlocked) {
                  return (b.unlocked_at || '').localeCompare(a.unlocked_at || '');
                }
                return a.order - b.order;
              })
              .map((achievement) => {
                const isLocked = achievement.isUnlocked !== true;
                const criteria = achievement.criteria as
                  | { type: string; value: number | boolean }
                  | undefined;

                const isHighlighted = highlightSlug === achievement.slug;

                return (
                  <article
                    key={achievement.id}
                    ref={isHighlighted ? highlightedRef : undefined}
                    className={`flex gap-3 rounded-lg border p-3 transition-colors ${
                      isHighlighted
                        ? 'border-amber-400/80 bg-amber-50/50 ring-2 ring-amber-400/40 dark:border-amber-500/40 dark:bg-amber-950/20 dark:ring-amber-500/30'
                        : isLocked
                          ? 'border-zinc-100 bg-zinc-50/50 opacity-75 dark:border-white/[0.04] dark:bg-white/[0.02]'
                          : 'border-zinc-200/80 bg-white dark:border-white/[0.08] dark:bg-zinc-900/30'
                    }`}
                  >
                    <div className="shrink-0">
                      <AchievementBadge achievement={achievement} size="sm" showDetails={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-1">
                        <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {achievement.name}
                        </h3>
                        {achievement.is_showcased && !isLocked && (
                          <Star
                            size={12}
                            className="shrink-0 fill-amber-500 text-amber-500"
                            aria-label="Showcased"
                          />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                        {achievement.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-md border border-zinc-200/70 bg-zinc-50 px-1.5 py-px text-[10px] font-medium capitalize dark:border-white/10 dark:bg-white/[0.04] ${difficultyChip[achievement.difficulty]}`}
                        >
                          <Target size={9} strokeWidth={2} aria-hidden />
                          {achievement.difficulty}
                        </span>
                        <span className="text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                          {achievement.reputation_required} rep
                        </span>
                        {achievement.unlocked_at && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {new Date(achievement.unlocked_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      {isLocked && isOwnProfile && criteria && (
                        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                          <Lock size={10} strokeWidth={2} aria-hidden />
                          {getCriteriaDisplay(criteria)}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
