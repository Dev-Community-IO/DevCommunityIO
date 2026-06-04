import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, X } from 'lucide-react';
import { TabPillItem, TabPills } from './TabPills';
import { asidePanelClass, asideStatChipClass } from './postCardSurface';

export function formatListingLabel(value: string): string {
  return value
    .split(/[\s,_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function ListingPageHeader({
  icon: Icon,
  title,
  subtitle,
  onBack,
  count,
  countLabel,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onBack?: () => void;
  count?: number;
  countLabel?: string;
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
                <Icon size={16} strokeWidth={2} />
              </span>
              <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-xl">
                {title}
              </h1>
            </div>
            <p className="mt-1 max-w-xl text-sm leading-snug text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          </div>
        </div>
        {count !== undefined && count > 0 && countLabel && (
          <span className={`${asideStatChipClass} text-xs text-zinc-600 dark:text-zinc-400 sm:shrink-0`}>
            <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
              {count.toLocaleString()}
            </span>
            <span className="text-zinc-500 dark:text-zinc-500">{countLabel}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function ListingFilterToolbar({
  searchId,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  filterTabs,
  selectedFilter,
  onFilterChange,
  filterAriaLabel,
  resultCount,
  loading,
  loadingLabel,
  entityPlural,
}: {
  searchId: string;
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterTabs: TabPillItem<string>[];
  selectedFilter: string;
  onFilterChange: (id: string) => void;
  filterAriaLabel: string;
  resultCount: number;
  loading: boolean;
  loadingLabel: string;
  entityPlural: string;
}) {
  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedFilter !== 'all';
  const activeFilterLabel =
    selectedFilter === 'all' ? null : formatListingLabel(selectedFilter);

  return (
    <div className={`${asidePanelClass} overflow-hidden`}>
      <div className="flex flex-col gap-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-5">
          <div className="min-w-0 flex-1 lg:max-w-sm xl:max-w-md">
            <label
              htmlFor={searchId}
              className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
            >
              <Search size={11} strokeWidth={2} />
              Search
            </label>
            <div className="relative">
              <input
                id={searchId}
                type="search"
                placeholder={searchPlaceholder}
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
                ariaLabel={filterAriaLabel}
                scrollable
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs dark:border-white/[0.06]">
          <p className="text-zinc-500 dark:text-zinc-400">
            {loading ? (
              loadingLabel
            ) : (
              <>
                <span className="font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                  {resultCount.toLocaleString()}
                </span>
                <span> {entityPlural}</span>
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

export function ListingEmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className={`${asidePanelClass} p-10 text-center`}>
      <Icon size={40} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}

export function ListingErrorState({
  icon: Icon,
  title,
  message,
  onRetry,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className={`${asidePanelClass} p-8 text-center`}>
      <Icon size={40} className="mx-auto mb-3 text-red-400/80 dark:text-red-500/70" strokeWidth={1.5} />
      <p className="mb-1 font-medium text-red-600 dark:text-red-400">{title}</p>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-transparent bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        Retry
      </button>
    </div>
  );
}

export function ListingSectionTitle({
  children,
  icon: Icon,
}: {
  children: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      {Icon && <Icon size={14} strokeWidth={2} className="text-zinc-400" aria-hidden />}
      {children}
    </h2>
  );
}
