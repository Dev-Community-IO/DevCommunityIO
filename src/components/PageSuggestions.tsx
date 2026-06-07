import { useState, useEffect, useMemo } from 'react';
import { Search, Users, Check, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import onboardingService, { type SuggestedPage } from '../services/api/onboarding.service';
import { pagesService, type Page } from '../services/api/pages.service';
import { Avatar } from './Avatar';
import { VerifiedBadge } from './VerifiedBadge';
import {
  onboardingGhostBtnClass,
  onboardingHintClass,
  onboardingInputClass,
  onboardingPrimaryBtnClass,
  onboardingSelectableCardActiveClass,
  onboardingSelectableCardClass,
  onboardingStatusBarClass,
  onboardingStepDescClass,
  onboardingStepTitleClass,
} from './onboardingChrome';
import { postTagClass } from './postCardSurface';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

interface PageSuggestionsProps {
  selectedPages: string[];
  selectedTagIds?: string[];
  onPagesChange: (pages: string[]) => void;
}

function normalizePage(item: Page | SuggestedPage): SuggestedPage {
  const page = item as Page & SuggestedPage;
  return {
    id: page.id,
    name: page.name,
    slug: page.slug,
    logoUrl: page.logoUrl || page.logo,
    description: page.description || page.shortBio || '',
    category: page.category || '',
    members: page.members ?? page.memberCount ?? page.member_count ?? page.followerCount ?? 0,
    postsCount: page.postsCount ?? page.postCount ?? 0,
    isVerified: page.isVerified,
    isTrending: page.isTrending,
    isRecommended: page.isRecommended,
    matchingTags: page.matchingTags,
    reason: page.reason,
  };
}

function PageCard({
  page,
  isSelected,
  onToggle,
}: {
  page: SuggestedPage;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <li>
      <div className={isSelected ? onboardingSelectableCardActiveClass : onboardingSelectableCardClass}>
        <div className="flex gap-3">
          <Avatar
            src={page.logo || page.logoUrl || DEFAULT_PAGE_LOGO}
            alt={page.name}
            size="md"
            className="h-10 w-10 shrink-0 rounded-lg border border-zinc-200/80 dark:border-white/10"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {page.name}
                  </h4>
                  {page.isVerified && <VerifiedBadge variant="page" size={14} />}
                  {page.isTrending && !page.isRecommended && (
                    <TrendingUp size={12} className="shrink-0 text-amber-500" strokeWidth={2.5} />
                  )}
                </div>
                {page.category && (
                  <span className={`${postTagClass} mt-1 capitalize`}>{page.category}</span>
                )}
              </div>
              {isSelected && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500">
                  <Check size={11} strokeWidth={3} />
                </span>
              )}
            </div>

            {page.reason && (
              <p className="mt-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                {page.reason}
              </p>
            )}

            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              {page.description || 'Page on DevCommunity'}
            </p>

            {page.matchingTags && page.matchingTags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {page.matchingTags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-0.5">
                <Users size={10} strokeWidth={2} />
                {(page.members ?? 0).toLocaleString()}
              </span>
              <span aria-hidden>·</span>
              <span>{(page.postsCount ?? 0).toLocaleString()} posts</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`mt-2.5 w-full ${isSelected ? onboardingGhostBtnClass : onboardingPrimaryBtnClass}`}
        >
          {isSelected ? 'Following' : 'Follow'}
        </button>
      </div>
    </li>
  );
}

export function PageSuggestions({
  selectedPages,
  selectedTagIds = [],
  onPagesChange,
}: PageSuggestionsProps) {
  const [pages, setPages] = useState<SuggestedPage[]>([]);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [basedOnInterests, setBasedOnInterests] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSuggestedPages();
  }, [selectedTagIds.join(',')]);

  const loadSuggestedPages = async () => {
    setIsLoading(true);
    try {
      const result = await onboardingService.getSuggestedPages(selectedTagIds);
      let loaded = Array.isArray(result.pages) ? result.pages.map(normalizePage) : [];
      let recIds = Array.isArray(result.recommendedIds) ? result.recommendedIds : [];
      let based = result.basedOnInterests;

      if (loaded.length === 0) {
        const response = await pagesService.getPages({ page: 1, limit: 100 });
        const rawPages = Array.isArray(response?.data) ? response.data : [];
        loaded = rawPages.map(normalizePage);
        recIds = [];
        based = false;
      }

      setPages(loaded);
      setRecommendedIds(recIds);
      setBasedOnInterests(based);
    } catch (error) {
      console.error('Failed to load pages:', error);
      try {
        const response = await pagesService.getPages({ page: 1, limit: 100 });
        const rawPages = Array.isArray(response?.data) ? response.data : [];
        setPages(rawPages.map(normalizePage));
        setRecommendedIds([]);
        setBasedOnInterests(false);
      } catch {
        setPages([]);
        setRecommendedIds([]);
        setBasedOnInterests(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const safePages = Array.isArray(pages) ? pages : [];
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredPages = safePages.filter((page) => {
    if (!normalizedQuery) return true;
    return (
      page.name.toLowerCase().includes(normalizedQuery) ||
      (page.description || '').toLowerCase().includes(normalizedQuery) ||
      (page.category || '').toLowerCase().includes(normalizedQuery) ||
      (page.matchingTags || []).some((tag) => tag.toLowerCase().includes(normalizedQuery))
    );
  });

  const recommendedPages = useMemo(
    () => filteredPages.filter((page) => page.isRecommended || recommendedIds.includes(page.id)),
    [filteredPages, recommendedIds]
  );

  const otherPages = useMemo(
    () => filteredPages.filter((page) => !page.isRecommended && !recommendedIds.includes(page.id)),
    [filteredPages, recommendedIds]
  );

  const togglePage = (pageId: string) => {
    if (selectedPages.includes(pageId)) {
      onPagesChange(selectedPages.filter((id) => id !== pageId));
    } else {
      onPagesChange([...selectedPages, pageId]);
    }
  };

  const followRecommended = () => {
    const idsToAdd = recommendedIds.filter((id) => !selectedPages.includes(id));
    if (idsToAdd.length === 0) return;
    onPagesChange([...selectedPages, ...idsToAdd]);
  };

  const hasUnfollowedRecommended = recommendedIds.some((id) => !selectedPages.includes(id));

  return (
    <div className="space-y-4">
      <div>
        <h3 className={onboardingStepTitleClass}>Follow pages</h3>
        <p className={onboardingStepDescClass}>
          {basedOnInterests && recommendedIds.length > 0
            ? 'Recommended pages are at the top — follow at least one.'
            : 'Browse all pages and follow at least one to fill your feed.'}
        </p>
      </div>

      {!isLoading && recommendedIds.length > 0 && hasUnfollowedRecommended && !searchQuery && (
        <button
          type="button"
          onClick={followRecommended}
          className={`${onboardingPrimaryBtnClass} w-full`}
        >
          <Sparkles size={14} strokeWidth={2} />
          Follow all recommended ({recommendedIds.length})
        </button>
      )}

      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          strokeWidth={2}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search pages…"
          className={`${onboardingInputClass} pl-8`}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-2 py-8">
          <Loader2 size={20} className="animate-spin text-zinc-400" strokeWidth={2} />
          <p className={onboardingHintClass}>Loading pages…</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <p className={`py-6 text-center ${onboardingHintClass}`}>
          {searchQuery ? `No pages match “${searchQuery}”` : 'No pages available yet.'}
        </p>
      ) : (
        <>
          {recommendedPages.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Recommended for you
                </h4>
              </div>
              <ul className="space-y-2">
                {recommendedPages.map((page) => (
                  <PageCard
                    key={page.id}
                    page={page}
                    isSelected={selectedPages.includes(page.id)}
                    onToggle={() => togglePage(page.id)}
                  />
                ))}
              </ul>
            </section>
          )}

          {otherPages.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {recommendedPages.length > 0 ? 'All pages' : `All pages (${otherPages.length})`}
              </h4>
              <ul className="space-y-2">
                {otherPages.map((page) => (
                  <PageCard
                    key={page.id}
                    page={page}
                    isSelected={selectedPages.includes(page.id)}
                    onToggle={() => togglePage(page.id)}
                  />
                ))}
              </ul>
            </section>
          )}

          <div className={onboardingStatusBarClass}>
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} strokeWidth={2} />
              {selectedPages.length === 0
                ? 'Follow at least one page'
                : `${selectedPages.length} page${selectedPages.length === 1 ? '' : 's'} followed`}
            </span>
            {selectedPages.length >= 1 && (
              <Check size={14} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
