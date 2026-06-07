import { Post } from '../types';
import { PostCard } from './PostCard';
import { HackathonCard } from './HackathonCard';
import { EventCard } from './EventCard';
import { OpportunityCard } from './OpportunityCard';
import { TrendingUp, Sparkles, Trophy, ChevronDown, Loader2, FileText, Hash, X, Heart, Clock, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './Button';
import { InfiniteScroll } from './InfiniteScroll';
import adsService, { PublicAd } from '../services/api/ads.service';
import { InFeedAd } from './ads/InFeedAd';
import { PostSkeletonList } from './skeletons';
import { asidePanelClass } from './postCardSurface';
import { Hackathon } from '../services/api/hackathons.service';
import { Event } from '../services/api/events.service';
import { Opportunity } from '../services/api/opportunities.service';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export type FeedItem = 
  | { type: 'post'; data: Post }
  | { type: 'hackathon'; data: Hackathon }
  | { type: 'event'; data: Event }
  | { type: 'opportunity'; data: Opportunity };

interface PostFeedProps {
  items: FeedItem[];
  onPostClick: (post: Post) => void;
  onHackathonClick?: (hackathon: Hackathon) => void;
  onEventClick?: (event: Event) => void;
  onOpportunityClick?: (opportunity: Opportunity) => void;
  onLoginRequired?: () => void;
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  fetchMore?: () => void;
  activeTagFilter?: string | null;
  activeTagLogo?: string | null;
  onClearTagFilter?: () => void;
  activeSort?: 'hot' | 'new' | 'top';
  onSortChange?: (sort: 'hot' | 'new' | 'top') => void;
  activeCategory?: string;
}

type FeedMenu = 'feed' | 'sort';

export function PostFeed({ items, onPostClick, onHackathonClick, onEventClick, onOpportunityClick, onLoginRequired, loading, error, hasMore = false, fetchMore, activeTagFilter, activeTagLogo, onClearTagFilter, activeSort = 'hot', onSortChange, activeCategory = 'trending' }: PostFeedProps) {
  const [openMenu, setOpenMenu] = useState<FeedMenu | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Sponsored "pub" slots injected between posts (every few posts).
  const [feedAds, setFeedAds] = useState<PublicAd[]>([]);
  useEffect(() => {
    let alive = true;
    adsService.getAds('feed').then((a) => {
      if (alive) setFeedAds(a);
    });
    return () => {
      alive = false;
    };
  }, []);
  const AD_INTERVAL = 5; // insert an ad after every N posts

  const toggleMenu = (menu: FeedMenu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const closeMenus = () => setOpenMenu(null);

  const filters = [
    { label: 'Hot', value: 'hot' as const, icon: TrendingUp, color: 'from-orange-500 to-red-500' },
    { label: 'New', value: 'new' as const, icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
    { label: 'Top', value: 'top' as const, icon: Trophy, color: 'from-yellow-500 to-amber-500' }
  ];

  const categoryFilters = [
    { label: 'Trending', value: 'trending', icon: Flame, color: 'from-orange-500 to-red-500', requiresAuth: false },
    { label: 'For You', value: 'for-you', icon: Heart, color: 'from-pink-500 to-rose-500', requiresAuth: true },
    { label: 'Latest', value: 'latest', icon: Clock, color: 'from-blue-500 to-cyan-500', requiresAuth: false },
    { label: 'Following', value: 'following', icon: Sparkles, color: 'from-purple-500 to-pink-500', requiresAuth: true }
  ];

  // Filter categories based on authentication
  const availableCategories = categoryFilters.filter(cat => !cat.requiresAuth || isAuthenticated);

  const activeFilterData = filters.find(f => f.value === activeSort) || filters[0];
  const ActiveIcon = activeFilterData.icon;

  const activeCategoryData = availableCategories.find(cat => cat.value === activeCategory) || availableCategories[0];
  const ActiveCategoryIcon = activeCategoryData.icon;

  const handleCategoryChange = (category: string) => {
    const routes: Record<string, string> = {
      'trending': '/',
      'for-you': '/for-you',
      'latest': '/latest',
      'following': '/following'
    };
    navigate(routes[category] || '/');
    closeMenus();
  };

  const triggerClass = (isOpen: boolean) =>
    `flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 touch-manipulation sm:flex-none sm:justify-start sm:px-3.5 ${
      isOpen
        ? 'bg-zinc-100 text-zinc-900 shadow-sm dark:bg-white/10 dark:text-zinc-50'
        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100'
    }`;

  const menuPanelClass =
    'absolute top-[calc(100%+6px)] z-40 min-w-[12.5rem] overflow-hidden rounded-xl border border-zinc-200/80 bg-white/95 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95 animate-slide-up';

  const menuItemClass = (isActive: boolean) =>
    `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors touch-manipulation ${
      isActive
        ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-white/10 dark:text-zinc-50'
        : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-white/5'
    }`;

  const renderItem = (item: FeedItem) => {
    if (item.type === 'post') {
      return (
        <PostCard
          key={`post-${item.data.id}`}
          post={item.data}
          onClick={() => onPostClick(item.data)}
          onLoginRequired={onLoginRequired}
        />
      );
    } else if (item.type === 'hackathon') {
      return (
        <HackathonCard
          key={`hackathon-${item.data.id}`}
          hackathon={item.data}
          onClick={() => onHackathonClick?.(item.data)}
          onLoginRequired={onLoginRequired}
        />
      );
    } else if (item.type === 'event') {
      return (
        <EventCard
          key={`event-${item.data.id}`}
          event={item.data}
          onClick={() => onEventClick?.(item.data)}
          onLoginRequired={onLoginRequired}
        />
      );
    } else if (item.type === 'opportunity') {
      return (
        <OpportunityCard
          key={`opportunity-${item.data.id}`}
          opportunity={item.data}
          onClick={() => onOpportunityClick?.(item.data)}
          onLoginRequired={onLoginRequired}
        />
      );
    }
    return null;
  };

  // Render the feed, interleaving sponsored slots after every AD_INTERVAL posts.
  const renderFeed = () => {
    const nodes: Array<JSX.Element | null> = [];
    let postCount = 0;
    let adIndex = 0;
    items.forEach((item) => {
      nodes.push(renderItem(item));
      if (item.type === 'post') {
        postCount += 1;
        if (postCount % AD_INTERVAL === 0 && feedAds.length > 0) {
          const ad = feedAds[adIndex % feedAds.length];
          adIndex += 1;
          nodes.push(<InFeedAd key={`ad-${ad.id}-${postCount}`} ad={ad} />);
        }
      }
    });
    return nodes;
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5">
      {activeTagFilter && (
        <div
          className="sticky top-[calc(var(--layout-header-offset)+0.5rem)] z-30 -mx-px pb-2 sm:pb-3"
          role="status"
          aria-live="polite"
        >
          <div
            className={`${asidePanelClass} flex items-center gap-3 p-3 shadow-sm backdrop-blur-md sm:p-3.5 dark:bg-zinc-900/90`}
          >
            {activeTagLogo ? (
              <img
                src={activeTagLogo}
                alt=""
                className="h-9 w-9 shrink-0 rounded-lg border border-zinc-200/80 object-cover dark:border-white/10 sm:h-10 sm:w-10"
              />
            ) : (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04] sm:h-10 sm:w-10"
                aria-hidden
              >
                <Hash size={16} strokeWidth={2} className="text-zinc-500 dark:text-zinc-400" />
              </span>
            )}
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Filtered by tag
              </p>
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100 sm:text-base">
                #{activeTagFilter}
              </p>
            </div>
            {onClearTagFilter && (
              <button
                type="button"
                onClick={onClearTagFilter}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:hover:text-zinc-100 sm:px-3 touch-manipulation"
                title="Clear tag filter"
              >
                <X size={14} strokeWidth={2} aria-hidden />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header with Filters - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Discover
        </h2>

        <div className="relative w-full sm:w-auto">
          {openMenu !== null && (
            <div
              className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px]"
              aria-hidden
              onClick={closeMenus}
            />
          )}

          <div className="relative z-40 flex w-full items-stretch gap-0.5 rounded-xl border border-zinc-200/80 bg-white/90 p-1 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-black/30 sm:w-auto">
            {/* Feed (category) */}
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <button
                type="button"
                aria-expanded={openMenu === 'feed'}
                aria-haspopup="listbox"
                onClick={() => toggleMenu('feed')}
                className={triggerClass(openMenu === 'feed')}
              >
                <ActiveCategoryIcon size={16} strokeWidth={2} className="shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="truncate">{activeCategoryData.label}</span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-zinc-400 transition-transform duration-200 ${openMenu === 'feed' ? 'rotate-180' : ''}`}
                />
              </button>

              {openMenu === 'feed' && (
                <div className={`${menuPanelClass} left-0 w-full sm:w-52`} role="listbox">
                  <p className="border-b border-zinc-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:border-white/5 dark:text-zinc-500">
                    Feed
                  </p>
                  <div className="max-h-[60vh] space-y-0.5 overflow-y-auto p-1.5 sm:max-h-none">
                    {availableCategories.map((category) => {
                      const Icon = category.icon;
                      const isActive = activeCategory === category.value;
                      return (
                        <button
                          key={category.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => handleCategoryChange(category.value)}
                          className={menuItemClass(isActive)}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-white/5">
                            <Icon size={14} strokeWidth={2} className="text-zinc-600 dark:text-zinc-300" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{category.label}</span>
                          {isActive && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="my-1 w-px shrink-0 self-stretch bg-zinc-200/80 dark:bg-white/10" aria-hidden />

            {/* Sort */}
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <button
                type="button"
                aria-expanded={openMenu === 'sort'}
                aria-haspopup="listbox"
                onClick={() => toggleMenu('sort')}
                className={triggerClass(openMenu === 'sort')}
              >
                <ActiveIcon size={16} strokeWidth={2} className="shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="truncate">{activeFilterData.label}</span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-zinc-400 transition-transform duration-200 ${openMenu === 'sort' ? 'rotate-180' : ''}`}
                />
              </button>

              {openMenu === 'sort' && (
                <div className={`${menuPanelClass} right-0 w-full sm:w-44`} role="listbox">
                  <p className="border-b border-zinc-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:border-white/5 dark:text-zinc-500">
                    Sort
                  </p>
                  <div className="space-y-0.5 p-1.5">
                    {filters.map((filter) => {
                      const Icon = filter.icon;
                      const isActive = activeSort === filter.value;
                      return (
                        <button
                          key={filter.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            onSortChange?.(filter.value);
                            closeMenus();
                          }}
                          className={menuItemClass(isActive)}
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-white/5">
                            <Icon size={14} strokeWidth={2} className="text-zinc-600 dark:text-zinc-300" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{filter.label}</span>
                          {isActive && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <PostSkeletonList count={5} />
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-red-300 dark:text-red-700 mb-4" />
          <p className="text-red-500 dark:text-red-400 mb-2">Failed to load posts</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Feed Items with Infinite Scroll */}
      {!loading && !error && items.length > 0 && fetchMore && hasMore ? (
        <InfiniteScroll
          dataLength={items.length}
          next={fetchMore}
          hasMore={hasMore}
          isLoading={Boolean(loading)}
          loader={
            <div className="flex items-center justify-center py-6 sm:py-8">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">Loading more...</span>
            </div>
          }
          endMessage={
            <div className="text-center py-6 sm:py-8 text-sm text-gray-500 dark:text-gray-400">
              You've reached the end! 🎉
            </div>
          }
          className="space-y-2 sm:space-y-3 md:space-y-4"
        >
          {renderFeed()}
        </InfiniteScroll>
      ) : !loading && !error && items.length > 0 ? (
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {renderFeed()}
        </div>
      ) : !loading && !error && items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-lg font-medium mb-2">No content found</p>
          <p className="text-sm">Be the first to create content in this category!</p>
        </div>
      ) : null}
    </div>
  );
}
