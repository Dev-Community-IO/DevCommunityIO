import { Post } from '../types';
import { PostCard } from './PostCard';
import { HackathonCard } from './HackathonCard';
import { EventCard } from './EventCard';
import { OpportunityCard } from './OpportunityCard';
import { TrendingUp, Sparkles, Trophy, ChevronDown, Loader2, FileText, Hash, X, Heart, Clock, Flame } from 'lucide-react';
import { useState } from 'react';
import { Button } from './Button';
import InfiniteScroll from 'react-infinite-scroll-component';
import { PostSkeletonList } from './skeletons';
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

export function PostFeed({ items, onPostClick, onHackathonClick, onEventClick, onOpportunityClick, onLoginRequired, loading, error, hasMore = false, fetchMore, activeTagFilter, activeTagLogo, onClearTagFilter, activeSort = 'hot', onSortChange, activeCategory = 'for-you' }: PostFeedProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const filters = [
    { label: 'Hot', value: 'hot' as const, icon: TrendingUp, color: 'from-orange-500 to-red-500' },
    { label: 'New', value: 'new' as const, icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
    { label: 'Top', value: 'top' as const, icon: Trophy, color: 'from-yellow-500 to-amber-500' }
  ];

  const categoryFilters = [
    { label: 'For You', value: 'for-you', icon: Heart, color: 'from-pink-500 to-rose-500', requiresAuth: true },
    { label: 'Latest', value: 'latest', icon: Clock, color: 'from-blue-500 to-cyan-500', requiresAuth: false },
    { label: 'Trending', value: 'trending', icon: Flame, color: 'from-orange-500 to-red-500', requiresAuth: false },
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
      'for-you': '/',
      'latest': '/latest',
      'trending': '/trending',
      'following': '/following'
    };
    navigate(routes[category] || '/');
    setIsCategoryDropdownOpen(false);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5">
      {/* Active Tag Filter Banner - Mobile Optimized */}
      {activeTagFilter && (
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {activeTagLogo ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                <img
                  src={activeTagLogo}
                  alt={activeTagFilter}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm flex-shrink-0">
                <Hash size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Filtered by tag</p>
              <p className="text-sm sm:text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent truncate">
                #{activeTagFilter}
              </p>
            </div>
          </div>
          {onClearTagFilter && (
            <button
              onClick={onClearTagFilter}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:shadow-sm flex-shrink-0 touch-manipulation"
              title="Clear filter"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      )}

      {/* Header with Filters - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Discover
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category Filter - Mobile Optimized */}
            <div className="relative flex-1 sm:flex-none z-50">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md group w-full sm:w-auto touch-manipulation"
              >
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${activeCategoryData.color} shadow-sm flex-shrink-0`}>
                  <ActiveCategoryIcon size={14} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs sm:text-sm font-semibold truncate">{activeCategoryData.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 flex-shrink-0 sm:w-4 sm:h-4 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  />
                  <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-up">
                    <div className="p-2 max-h-[70vh] sm:max-h-none overflow-y-auto">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2 sticky top-0 bg-white dark:bg-gray-800 z-10">
                        Feed
                      </div>
                      {availableCategories.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeCategory === category.value;
                        return (
                          <button
                            key={category.value}
                            onClick={() => handleCategoryChange(category.value)}
                            className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-sm'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700'
                            }`}
                          >
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color} ${isActive ? 'shadow-lg' : 'opacity-70'} flex-shrink-0`}>
                              <Icon size={14} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className={`text-sm font-medium flex-1 text-left ${
                              isActive
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {category.label}
                            </span>
                            {isActive && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sort Filter - Mobile Optimized */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md group w-full sm:w-auto touch-manipulation"
              >
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${activeFilterData.color} shadow-sm flex-shrink-0`}>
                  <ActiveIcon size={14} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs sm:text-sm font-semibold truncate">{activeFilterData.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 flex-shrink-0 sm:w-4 sm:h-4 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-up">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                      Sort By
                    </div>
                    {filters.map((filter) => {
                      const Icon = filter.icon;
                      const isActive = activeSort === filter.value;
                      return (
                        <button
                          key={filter.value}
                          onClick={() => {
                            onSortChange?.(filter.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-sm'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700'
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${filter.color} ${isActive ? 'shadow-lg' : 'opacity-70'} flex-shrink-0`}>
                            <Icon size={14} className="text-white" strokeWidth={2.5} />
                          </div>
                          <span className={`text-sm font-medium ${
                            isActive
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {filter.label}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex-shrink-0"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
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
          {items.map((item) => {
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
          })}
        </InfiniteScroll>
      ) : !loading && !error && items.length > 0 ? (
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {items.map((item) => {
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
          })}
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
