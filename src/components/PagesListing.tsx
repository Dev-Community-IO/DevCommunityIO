import {
  Users,
  TrendingUp,
  ArrowLeft,
  Search,
  FileText,
  Loader2,
  Building2,
  ChevronRight,
  UserCheck,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from './Button';
import { VerifiedBadge } from './VerifiedBadge';
import { TabPills } from './TabPills';
import { useState, useEffect, useMemo } from 'react';
import { pagesService, Page } from '../services/api/pages.service';
import { useNavigate } from 'react-router-dom';
import { PageCardSkeletonList } from './skeletons';
import {
  asidePanelClass,
  asideStatChipClass,
  postCardSurfaceClass,
  postTagClass,
} from './postCardSurface';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

const communityGridClass =
  'grid items-stretch gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,16rem),1fr))]';

const trendingPillClass =
  'inline-flex items-center gap-0.5 rounded-md border border-orange-200/80 bg-orange-50/95 px-1.5 py-0.5 text-[10px] font-semibold text-orange-800 backdrop-blur-sm dark:border-orange-500/30 dark:bg-orange-950/80 dark:text-orange-200';

const followingPillClass =
  'inline-flex items-center gap-0.5 rounded-md border border-zinc-200/80 bg-white/95 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 backdrop-blur-sm dark:border-white/15 dark:bg-zinc-900/90 dark:text-zinc-300';

interface PagesListingProps {
  onPageClick?: (pageId: string) => void;
  onBack?: () => void;
}

function formatCategoryLabel(category: string): string {
  return category
    .split(/[\s,_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function normalizePageFromApi(page: Page): Page {
  return {
    ...page,
    isFollowing: page?.isFollowing === true,
    postCount: Number(page.postCount ?? 0),
    memberCount: Number(page.memberCount ?? page.member_count ?? 0),
    followerCount: Number(page.followerCount ?? page.follower_count ?? 0),
  };
}

function CommunitiesPageHeader({
  onBack,
  total,
  categoryCount,
}: {
  onBack?: () => void;
  total: number;
  categoryCount: number;
}) {
  return (
    <div className={`${asidePanelClass} p-3 sm:p-4`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100"
              aria-label="Go back"
            >
              <ArrowLeft size={16} strokeWidth={2} />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400"
                aria-hidden
              >
                <Building2 size={16} strokeWidth={2} />
              </span>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-xl">
                Communities
              </h1>
            </div>
            <p className="mt-1 max-w-xl text-sm leading-snug text-zinc-500 dark:text-zinc-400">
              Discover and join communities that match your interests
            </p>
          </div>
        </div>

        {(total > 0 || categoryCount > 0) && (
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
            {total > 0 && (
              <span className={`${asideStatChipClass} gap-1.5 text-xs text-zinc-600 dark:text-zinc-400`}>
                <Users size={12} strokeWidth={2} className="shrink-0 text-zinc-400" aria-hidden />
                <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                  {total.toLocaleString()}
                </span>
                <span className="text-zinc-500 dark:text-zinc-500">communities</span>
              </span>
            )}
            {categoryCount > 0 && (
              <span className={`${asideStatChipClass} text-xs text-zinc-600 dark:text-zinc-400`}>
                <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
                  {categoryCount}
                </span>
                <span className="text-zinc-500 dark:text-zinc-500">
                  {categoryCount === 1 ? 'category' : 'categories'}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CommunitiesFilterToolbar({
  searchQuery,
  onSearchChange,
  filterTabs,
  selectedFilter,
  onFilterChange,
  total,
  resultCount,
  loading,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterTabs: { id: string; label: string; icon?: typeof TrendingUp }[];
  selectedFilter: string;
  onFilterChange: (id: string) => void;
  total: number;
  resultCount: number;
  loading: boolean;
}) {
  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedFilter !== 'all';

  const activeFilterLabel =
    selectedFilter === 'all'
      ? null
      : selectedFilter === 'trending'
        ? 'Trending'
        : formatCategoryLabel(selectedFilter);

  return (
    <div className={`${asidePanelClass} overflow-hidden`}>
      <div className="flex flex-col gap-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
          <div className="min-w-0 flex-1 lg:max-w-sm xl:max-w-md">
            <label
              htmlFor="communities-search"
              className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
            >
              <Search size={11} strokeWidth={2} />
              Search
            </label>
            <div className="relative">
              <input
                id="communities-search"
                type="search"
                placeholder="Name or description…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200/80 bg-white py-0 pl-3 pr-9 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-[#0a1020]/90 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
                  aria-label="Clear search"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {filterTabs.length > 1 && (
            <div className="min-w-0 flex-1 lg:border-l lg:border-zinc-100 lg:pl-5 dark:lg:border-white/[0.06]">
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                <SlidersHorizontal size={11} strokeWidth={2} />
                Filter
              </p>
              <TabPills
                tabs={filterTabs}
                activeTab={selectedFilter}
                onChange={onFilterChange}
                ariaLabel="Filter communities"
                scrollable
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs dark:border-white/[0.06]">
          <p className="text-zinc-500 dark:text-zinc-400">
            {loading ? (
              'Loading communities…'
            ) : (
              <>
                <span className="font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                  {resultCount.toLocaleString()}
                </span>
                {total > 0 ? (
                  <span> of {total.toLocaleString()} shown</span>
                ) : (
                  <span> communities</span>
                )}
              </>
            )}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onFilterChange('all');
              }}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50 px-2 py-1 font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200"
            >
              {activeFilterLabel && searchQuery.trim() ? (
                <>Clear filters</>
              ) : activeFilterLabel ? (
                <>Clear “{activeFilterLabel}”</>
              ) : (
                <>Clear search</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PageListCard({ page, onClick }: { page: Page; onClick: () => void }) {
  const logoUrl = page.logoUrl || page.logo || DEFAULT_PAGE_LOGO;
  const coverUrl = page.coverImageUrl || page.coverImage;
  const bio = page.shortBio || page.description;
  const handle = page.username || page.slug;
  const followers = page.followerCount ?? 0;
  const posts = page.postCount ?? 0;
  const members = page.memberCount ?? 0;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`${postCardSurfaceClass} h-full overflow-hidden`}
    >
      <div className="relative h-[4.5rem] shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900/60 sm:h-20">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200/60 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-800"
            aria-hidden
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

        {(page.isTrending || page.isFollowing) && (
          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            {page.isTrending && (
              <span className={trendingPillClass}>
                <TrendingUp size={10} strokeWidth={2.5} aria-hidden />
                Trending
              </span>
            )}
            {page.isFollowing && (
              <span className={followingPillClass}>
                <UserCheck size={10} strokeWidth={2.5} aria-hidden />
                Following
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col px-3.5 pb-3.5 pt-7 sm:px-4 sm:pb-4">
        <div className="absolute -top-5 left-3.5 z-10 sm:left-4">
          <div className="h-11 w-11 overflow-hidden rounded-xl border-2 border-white bg-zinc-100 shadow-sm ring-1 ring-zinc-200/80 dark:border-zinc-900 dark:bg-zinc-800 dark:ring-white/10 sm:h-12 sm:w-12">
            <img
              src={logoUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== DEFAULT_PAGE_LOGO) target.src = DEFAULT_PAGE_LOGO;
              }}
            />
          </div>
        </div>

        <div className="mb-1.5 flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0 flex-1 pr-1">
            <div className="inline-flex min-w-0 max-w-full items-center gap-0.5">
              <h3 className="min-w-0 truncate text-sm font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white">
                {page.name}
              </h3>
              {page.isVerified && <VerifiedBadge variant="page" size={12} className="shrink-0" />}
            </div>
            {handle && (
              <p className="mt-0.5 truncate text-left text-[11px] text-zinc-500 dark:text-zinc-400">
                @{handle}
              </p>
            )}
          </div>
          <ChevronRight
            size={16}
            strokeWidth={2}
            className="mt-0.5 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
            aria-hidden
          />
        </div>

        <p className="mb-2.5 line-clamp-2 flex-1 text-left text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {bio || 'No description yet.'}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          {page.category && (
            <span className={`${postTagClass} capitalize`}>{formatCategoryLabel(page.category)}</span>
          )}
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Users size={11} strokeWidth={2} className="opacity-70" aria-hidden />
              {followers.toLocaleString()} followers
            </span>
            <span className="mx-1 text-zinc-300 dark:text-zinc-600" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <FileText size={11} strokeWidth={2} className="opacity-70" aria-hidden />
              {posts.toLocaleString()} posts
            </span>
            <span className="mx-1 text-zinc-300 dark:text-zinc-600" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Building2 size={11} strokeWidth={2} className="opacity-70" aria-hidden />
              {members.toLocaleString()} members
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

export function PagesListing({ onPageClick, onBack }: PagesListingProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const PAGES_PER_PAGE = 9;

  useEffect(() => {
    let cancelled = false;

    const loadCategoryOptions = async () => {
      try {
        const response = await pagesService.getPages({ page: 1, limit: 100 });
        const cats = Array.from(
          new Set(
            (response.data || [])
              .map((p: Page) => p.category?.trim())
              .filter((c): c is string => Boolean(c))
          )
        ).sort((a, b) => a.localeCompare(b));

        if (!cancelled) setCategoryOptions(cats);
      } catch {
        /* non-blocking */
      }
    };

    loadCategoryOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const filterTabs = useMemo(() => {
    const merged = Array.from(
      new Set([
        ...categoryOptions,
        ...pages.map((p) => p.category?.trim()).filter((c): c is string => Boolean(c)),
      ])
    ).sort((a, b) => a.localeCompare(b));

    return [
      { id: 'all', label: 'All' },
      { id: 'trending', label: 'Trending', icon: TrendingUp },
      ...merged.map((cat) => ({
        id: cat,
        label: formatCategoryLabel(cat),
      })),
    ];
  }, [categoryOptions, pages]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPage(1);

        const params: Record<string, unknown> = {
          page: 1,
          limit: PAGES_PER_PAGE,
        };
        if (searchQuery) params.search = searchQuery;
        if (selectedFilter === 'trending') {
          params.trending = true;
        } else if (selectedFilter !== 'all') {
          params.category = selectedFilter;
        }

        const response = await pagesService.getPages(params);
        const pagesData = response.data || [];
        const meta = response.meta || {};

        setPages(pagesData.map((page: Page) => normalizePageFromApi(page)));
        setHasMore(meta.currentPage < meta.lastPage);
        setTotal(meta.total || 0);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load pages';
        setError(message);
        console.error('Error fetching pages:', err);
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [searchQuery, selectedFilter]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;

      const params: Record<string, unknown> = {
        page: nextPage,
        limit: PAGES_PER_PAGE,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedFilter === 'trending') {
        params.trending = true;
      } else if (selectedFilter !== 'all') {
        params.category = selectedFilter;
      }

      const response = await pagesService.getPages(params);
      const pagesData = response.data || [];
      const meta = response.meta || {};

      setPages((prev) => [...prev, ...pagesData.map((page: Page) => normalizePageFromApi(page))]);
      setCurrentPage(nextPage);
      setHasMore(meta.currentPage < meta.lastPage);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load more pages';
      console.error('Error loading more pages:', err);
      setError(message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePageClick = (page: Page) => {
    if (page.slug) {
      navigate(`/pages/${page.slug}`);
    } else if (onPageClick) {
      onPageClick(page.id);
    }
  };

  if (loading && pages.length === 0) {
    return (
      <div className="space-y-4">
        <div className={`${asidePanelClass} animate-pulse p-4`}>
          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3.5 w-full max-w-sm rounded bg-zinc-100 dark:bg-zinc-800/80" />
            </div>
          </div>
        </div>
        <div className={`${asidePanelClass} animate-pulse p-4`}>
          <div className="mb-3 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/80" />
        </div>
        <PageCardSkeletonList count={9} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CommunitiesPageHeader
        onBack={onBack}
        total={total}
        categoryCount={categoryOptions.length}
      />

      <CommunitiesFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterTabs={filterTabs}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        total={total}
        resultCount={pages.length}
        loading={loading}
      />

      {error && !loading && (
        <div className={`${asidePanelClass} p-8 text-center`}>
          <p className="mb-1 font-medium text-red-600 dark:text-red-400">Failed to load communities</p>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {pages.length > 0 ? (
            <>
              <div className={communityGridClass}>
                {pages.map((page) => (
                  <PageListCard
                    key={page.id}
                    page={page}
                    onClick={() => handlePageClick(page)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button onClick={loadMore} disabled={loadingMore} variant="secondary" size="md">
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading…
                      </>
                    ) : (
                      <>
                        Load more
                        <ChevronRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {total > 0 && (
                <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                  Showing {pages.length.toLocaleString()} of {total.toLocaleString()} communit
                  {total !== 1 ? 'ies' : 'y'}
                </p>
              )}
            </>
          ) : (
            <div className={`${asidePanelClass} px-6 py-12 text-center`}>
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">
                <Building2 size={24} className="text-zinc-400" strokeWidth={1.5} />
              </span>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                No communities found
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {searchQuery
                  ? `Nothing matches "${searchQuery}". Try another search.`
                  : 'Be the first to create a community.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
