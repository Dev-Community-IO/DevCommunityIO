import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Star,
  Loader2,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { opportunitiesService, Opportunity as APIOpportunity } from '../services/api/opportunities.service';
import { ContentGridSkeletonList } from './skeletons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import {
  ListingPageHeader,
  ListingFilterToolbar,
  ListingEmptyState,
  ListingErrorState,
  ListingSectionTitle,
  formatListingLabel,
} from './listingPageChrome';
import { asidePanelClass, postCardSurfaceClass, postTagClass } from './postCardSurface';

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

interface OpportunitiesPageProps {
  onBack?: () => void;
  onViewOpportunityDetail?: (id: string) => void;
}

interface Opportunity {
  id: string;
  slug?: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  category: string;
  salary: string;
  experience: string;
  posted: string;
  logo: string;
  featured?: boolean;
  remote: boolean;
}

const TYPE_FILTERS = ['all', 'full-time', 'part-time', 'contract', 'internship'] as const;

const TYPE_LABELS: Record<string, string> = {
  all: 'All',
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

const featuredPillClass =
  'inline-flex items-center gap-0.5 rounded-md border border-amber-200/80 bg-amber-50/95 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/80 dark:text-amber-200';

const remotePillClass =
  'inline-flex items-center gap-0.5 rounded-md border border-zinc-200/70 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400';

function OpportunityListCard({
  opportunity,
  large,
  canManageFeatured,
  togglingFeatured,
  onToggleFeatured,
  onClick,
}: {
  opportunity: Opportunity;
  large?: boolean;
  canManageFeatured: boolean;
  togglingFeatured: boolean;
  onToggleFeatured: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const logoSize = large ? 'h-14 w-14' : 'h-11 w-11';

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
      className={`${postCardSurfaceClass} h-full`}
    >
      <div className={`flex gap-3 p-3.5 sm:gap-4 sm:p-4 ${large ? 'sm:p-5' : ''}`}>
        <div
          className={`${logoSize} shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 ring-1 ring-zinc-200/80 dark:border-white/10 dark:bg-zinc-800 dark:ring-white/10`}
        >
          <img
            src={opportunity.logo}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== DEFAULT_PAGE_LOGO) target.src = DEFAULT_PAGE_LOGO;
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3
                  className={`line-clamp-1 font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white ${
                    large ? 'text-base' : 'text-sm'
                  }`}
                >
                  {opportunity.title}
                </h3>
                {opportunity.featured && (
                  <span className={featuredPillClass}>
                    <Star size={10} strokeWidth={2.5} className="fill-current" />
                    Featured
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {opportunity.company}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {canManageFeatured && (
                <button
                  type="button"
                  onClick={onToggleFeatured}
                  disabled={togglingFeatured}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200/80 bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-amber-600 dark:border-white/10 dark:bg-white/[0.04] dark:hover:text-amber-400"
                  title={opportunity.featured ? 'Remove from featured' : 'Add to featured'}
                  aria-label={opportunity.featured ? 'Remove from featured' : 'Add to featured'}
                >
                  {togglingFeatured ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Star
                      size={12}
                      className={opportunity.featured ? 'fill-amber-500 text-amber-500' : ''}
                      strokeWidth={2}
                    />
                  )}
                </button>
              )}
              {opportunity.category && (
                <span className={`${postTagClass} hidden sm:inline-flex capitalize`}>
                  {opportunity.category}
                </span>
              )}
            </div>
          </div>

          <p
            className={`mb-2.5 line-clamp-2 text-zinc-600 dark:text-zinc-400 ${
              large ? 'text-sm leading-relaxed' : 'text-xs leading-relaxed'
            }`}
          >
            {opportunity.description}
          </p>

          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <span className={`${postTagClass} capitalize`}>{opportunity.type.replace('-', ' ')}</span>
            {opportunity.remote && (
              <span className={remotePillClass}>
                <Zap size={10} strokeWidth={2} />
                Remote
              </span>
            )}
            {opportunity.experience && (
              <span className={postTagClass}>{opportunity.experience}</span>
            )}
            {opportunity.category && (
              <span className={`${postTagClass} capitalize sm:hidden`}>{opportunity.category}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-zinc-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
              <span className="truncate">{opportunity.location}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <DollarSign size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{opportunity.salary}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
              {opportunity.posted}
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-end border-t border-zinc-100 pt-2.5 dark:border-white/[0.06]">
            <span className="flex items-center gap-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              View role
              <ChevronRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function OpportunitiesPage({ onBack, onViewOpportunityDetail }: OpportunitiesPageProps) {
  const navigate = useNavigate();
  const { isAdmin, canModerate } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [opportunities, setOpportunities] = useState<APIOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const canManageFeatured = isAdmin() || canModerate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: Record<string, string> = {};
        if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();
        if (selectedFilter !== 'all') {
          if (['full-time', 'part-time', 'contract', 'internship'].includes(selectedFilter)) {
            params.type = selectedFilter;
          } else {
            params.category = selectedFilter;
          }
        }

        const response = await opportunitiesService.getOpportunities(params);
        setOpportunities(response.data || response);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load opportunities';
        setError(message);
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [debouncedSearchQuery, selectedFilter]);

  const opportunitiesData: Opportunity[] = opportunities.map((o) => ({
    id: o.id,
    slug: o.slug,
    title: o.title,
    company: o.companyName,
    description: o.description,
    location: o.location,
    type: o.type,
    category: o.category,
    salary: o.salary || 'Competitive',
    experience: o.experience,
    posted: o.postedAt ? new Date(o.postedAt).toLocaleDateString() : 'Recently',
    logo: o.logoUrl || DEFAULT_PAGE_LOGO,
    featured: o.featured,
    remote: o.remote,
  }));

  const categories = useMemo(() => {
    return Array.from(new Set(opportunitiesData.map((o) => o.category).filter(Boolean))).sort();
  }, [opportunitiesData]);

  const filterTabs = useMemo(
    () => [
      { id: 'all', label: 'All' },
      ...TYPE_FILTERS.filter((t) => t !== 'all').map((t) => ({
        id: t,
        label: TYPE_LABELS[t] || formatListingLabel(t),
      })),
      ...categories.map((cat) => ({
        id: cat,
        label: formatListingLabel(cat),
      })),
    ],
    [categories]
  );

  const showFeaturedSection =
    !loading && !error && selectedFilter === 'all' && !debouncedSearchQuery;
  const featuredOpportunities = opportunitiesData.filter((o) => o.featured);
  const regularOpportunities = opportunitiesData.filter(
    (o) => selectedFilter !== 'all' || debouncedSearchQuery || !o.featured
  );

  const handleOpportunityClick = (opportunity: Opportunity) => {
    if (opportunity.slug) {
      navigate(`/opportunities/${opportunity.slug}`);
    } else if (onViewOpportunityDetail) {
      onViewOpportunityDetail(opportunity.id);
    } else {
      navigate(`/opportunities/${opportunity.id}`);
    }
  };

  const handleToggleFeatured = async (e: React.MouseEvent, opportunity: Opportunity) => {
    e.stopPropagation();
    if (!canManageFeatured) return;

    try {
      setTogglingFeatured(opportunity.id);
      const newFeaturedStatus = !opportunity.featured;
      await opportunitiesService.updateOpportunity(opportunity.id, { featured: newFeaturedStatus });
      setOpportunities((prev) =>
        prev.map((item) =>
          item.id === opportunity.id ? { ...item, featured: newFeaturedStatus } : item
        )
      );
      toast.success(
        newFeaturedStatus
          ? 'Opportunity featured successfully'
          : 'Opportunity removed from featured'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update featured status';
      toast.error(message);
      console.error('Error toggling featured:', err);
    } finally {
      setTogglingFeatured(null);
    }
  };

  if (loading && opportunitiesData.length === 0) {
    return (
      <div className="space-y-4">
        <div className={`${asidePanelClass} animate-pulse p-4`}>
          <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-3.5 w-72 max-w-full rounded bg-zinc-100 dark:bg-zinc-800/80" />
        </div>
        <div className={`${asidePanelClass} animate-pulse p-4`}>
          <div className="mb-3 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-8 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/80" />
        </div>
        <ContentGridSkeletonList count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ListingPageHeader
        icon={Briefcase}
        title="Opportunities"
        subtitle="Find your next career opportunity in Web3"
        onBack={onBack}
        count={opportunitiesData.length}
        countLabel={opportunitiesData.length === 1 ? 'role' : 'roles'}
      />

      <ListingFilterToolbar
        searchId="opportunities-search"
        searchPlaceholder="Role, company, or keywords…"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterTabs={filterTabs}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        filterAriaLabel="Filter opportunities"
        resultCount={opportunitiesData.length}
        loading={loading}
        loadingLabel="Loading opportunities…"
        entityPlural={opportunitiesData.length === 1 ? 'role' : 'roles'}
      />

      {error && (
        <ListingErrorState
          icon={Briefcase}
          title="Failed to load opportunities"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {!loading && !error && opportunitiesData.length === 0 && (
        <ListingEmptyState
          icon={Briefcase}
          message="No opportunities match your search or filters."
        />
      )}

      {!loading && !error && opportunitiesData.length > 0 && (
        <div className="space-y-6">
          {showFeaturedSection && featuredOpportunities.length > 0 && (
            <section>
              <ListingSectionTitle icon={Star}>Featured</ListingSectionTitle>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {featuredOpportunities.map((opp) => (
                  <OpportunityListCard
                    key={opp.id}
                    opportunity={opp}
                    large
                    canManageFeatured={canManageFeatured}
                    togglingFeatured={togglingFeatured === opp.id}
                    onToggleFeatured={(e) => handleToggleFeatured(e, opp)}
                    onClick={() => handleOpportunityClick(opp)}
                  />
                ))}
              </div>
            </section>
          )}

          {regularOpportunities.length > 0 && (
            <section>
              {showFeaturedSection && featuredOpportunities.length > 0 && (
                <ListingSectionTitle>All roles</ListingSectionTitle>
              )}
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {regularOpportunities.map((opp) => (
                  <OpportunityListCard
                    key={opp.id}
                    opportunity={opp}
                    canManageFeatured={canManageFeatured}
                    togglingFeatured={togglingFeatured === opp.id}
                    onToggleFeatured={(e) => handleToggleFeatured(e, opp)}
                    onClick={() => handleOpportunityClick(opp)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
