import {
  Trophy,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Star,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { hackathonsService, Hackathon } from '../services/api/hackathons.service';
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

interface HackathonsPageProps {
  onBack?: () => void;
  onViewHackathonDetail?: (id: string) => void;
}

interface HackathonCardData {
  id: string;
  slug?: string;
  title: string;
  description: string;
  organizer: string;
  startDate: string;
  endDate: string;
  prize: string;
  participants: number;
  category: string;
  difficulty: string;
  status: string;
  image: string;
  tags: string[];
  featured?: boolean;
}

const STATUS_FILTERS = ['all', 'upcoming', 'ongoing', 'ended'] as const;

const STATUS_LABELS: Record<string, string> = {
  all: 'All',
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  ended: 'Ended',
};

const featuredPillClass =
  'inline-flex items-center gap-0.5 rounded-md border border-amber-200/80 bg-amber-50/95 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-950/80 dark:text-amber-200';

function statusPillClass(status: string) {
  const base =
    'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize backdrop-blur-sm';
  switch (status) {
    case 'ongoing':
      return `${base} border-emerald-200/80 bg-emerald-50/95 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/70 dark:text-emerald-300`;
    case 'ended':
      return `${base} border-zinc-200/70 bg-zinc-50/95 text-zinc-600 dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-400`;
    default:
      return `${base} border-sky-200/80 bg-sky-50/95 text-sky-800 dark:border-sky-500/30 dark:bg-sky-950/70 dark:text-sky-300`;
  }
}

function formatHackathonDate(date: string, short = false) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(short ? {} : { year: 'numeric' }),
  });
}

function formatTagName(tag: string | { name?: string; slug?: string; id?: string }) {
  if (typeof tag === 'string') return tag;
  return tag.name || tag.slug || '';
}

function HackathonListCard({
  hackathon,
  featured,
  canManageFeatured,
  togglingFeatured,
  onToggleFeatured,
  onClick,
}: {
  hackathon: HackathonCardData;
  featured?: boolean;
  canManageFeatured: boolean;
  togglingFeatured: boolean;
  onToggleFeatured: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  const imageHeight = featured ? 'h-36' : 'h-28';

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
      <div className={`relative ${imageHeight} shrink-0 overflow-hidden bg-zinc-100 dark:bg-[#0a1020]`}>
        <img
          src={hackathon.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {hackathon.featured && (
            <span className={featuredPillClass}>
              <Star size={10} strokeWidth={2.5} className="fill-current" />
              Featured
            </span>
          )}
          <span className={statusPillClass(hackathon.status)}>{hackathon.status}</span>
        </div>
        {canManageFeatured && (
          <button
            type="button"
            onClick={onToggleFeatured}
            disabled={togglingFeatured}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/95 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-amber-600 dark:border-white/10 dark:bg-zinc-900/95 dark:hover:text-amber-400"
            title={hackathon.featured ? 'Remove from featured' : 'Add to featured'}
            aria-label={hackathon.featured ? 'Remove from featured' : 'Add to featured'}
          >
            {togglingFeatured ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Star
                size={12}
                className={hackathon.featured ? 'fill-amber-500 text-amber-500' : ''}
                strokeWidth={2}
              />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white">
            {hackathon.title}
          </h3>
          {hackathon.category && (
            <span className={`${postTagClass} shrink-0 capitalize`}>{hackathon.category}</span>
          )}
        </div>

        <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {hackathon.description}
        </p>

        <div className="mb-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
          <div className="flex min-w-0 items-center gap-1.5">
            <DollarSign size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
              {hackathon.prize}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Users size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="tabular-nums">{hackathon.participants.toLocaleString()}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Calendar size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="truncate">{formatHackathonDate(hackathon.startDate, !featured)}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Clock size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="truncate capitalize">{hackathon.difficulty}</span>
          </div>
        </div>

        {hackathon.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {hackathon.tags.slice(0, featured ? 4 : 3).map((tag) => (
              <span key={tag} className={`${postTagClass} text-[10px]`}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-zinc-100 pt-2.5 dark:border-white/[0.06]">
          <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
            {hackathon.organizer}
          </span>
          <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            View hackathon
            <ChevronRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </span>
        </div>
      </div>
    </article>
  );
}

export function HackathonsPage({ onBack, onViewHackathonDetail }: HackathonsPageProps) {
  const navigate = useNavigate();
  const { isAdmin, canModerate } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const canManageFeatured = isAdmin() || canModerate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: Record<string, string> = {};
        if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();
        if (selectedFilter !== 'all') {
          if (['upcoming', 'ongoing', 'ended'].includes(selectedFilter)) {
            params.status = selectedFilter;
          } else {
            params.category = selectedFilter;
          }
        }

        const response = await hackathonsService.getHackathons(params);
        setHackathons(response.data || response);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load hackathons';
        setError(message);
        console.error('Error fetching hackathons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, [debouncedSearchQuery, selectedFilter]);

  const hackathonsData: HackathonCardData[] = hackathons.map((h) => ({
    id: h.id,
    slug: h.slug,
    title: h.title,
    description: h.description,
    organizer: h.organizerName,
    startDate: h.startDate,
    endDate: h.endDate,
    prize: h.prize || 'TBA',
    participants: h.participantCount,
    category: h.category,
    difficulty: h.difficulty,
    status: h.status,
    image:
      h.imageUrl ||
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: (h.tracks || []).map((tag) => formatTagName(tag)).filter(Boolean),
    featured: h.featured,
  }));

  const categories = useMemo(() => {
    return Array.from(new Set(hackathonsData.map((h) => h.category).filter(Boolean))).sort();
  }, [hackathonsData]);

  const filterTabs = useMemo(
    () => [
      { id: 'all', label: 'All' },
      ...STATUS_FILTERS.filter((s) => s !== 'all').map((s) => ({
        id: s,
        label: STATUS_LABELS[s] || formatListingLabel(s),
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
  const featuredHackathons = hackathonsData.filter((h) => h.featured);
  const regularHackathons = hackathonsData.filter(
    (h) => selectedFilter !== 'all' || debouncedSearchQuery || !h.featured
  );

  const handleHackathonClick = (hackathon: HackathonCardData) => {
    if (hackathon.slug) {
      navigate(`/hackathons/${hackathon.slug}`);
    } else if (onViewHackathonDetail) {
      onViewHackathonDetail(hackathon.id);
    } else {
      navigate(`/hackathons/${hackathon.id}`);
    }
  };

  const handleToggleFeatured = async (e: React.MouseEvent, hackathon: HackathonCardData) => {
    e.stopPropagation();
    if (!canManageFeatured) return;

    try {
      setTogglingFeatured(hackathon.id);
      const newFeaturedStatus = !hackathon.featured;
      await hackathonsService.updateHackathon(hackathon.id, { featured: newFeaturedStatus });
      setHackathons((prev) =>
        prev.map((item) => (item.id === hackathon.id ? { ...item, featured: newFeaturedStatus } : item))
      );
      toast.success(
        newFeaturedStatus ? 'Hackathon featured successfully' : 'Hackathon removed from featured'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update featured status';
      toast.error(message);
      console.error('Error toggling featured:', err);
    } finally {
      setTogglingFeatured(null);
    }
  };

  if (loading && hackathonsData.length === 0) {
    return (
      <div className="space-y-4">
        <div className={`${asidePanelClass} animate-pulse p-4`}>
          <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-3.5 w-64 max-w-full rounded bg-zinc-100 dark:bg-zinc-800/80" />
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
        icon={Trophy}
        title="Hackathons"
        subtitle="Compete, collaborate, and ship projects with the community"
        onBack={onBack}
        count={hackathonsData.length}
        countLabel={hackathonsData.length === 1 ? 'hackathon' : 'hackathons'}
      />

      <ListingFilterToolbar
        searchId="hackathons-search"
        searchPlaceholder="Title, organizer, or description…"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterTabs={filterTabs}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        filterAriaLabel="Filter hackathons"
        resultCount={hackathonsData.length}
        loading={loading}
        loadingLabel="Loading hackathons…"
        entityPlural={hackathonsData.length === 1 ? 'hackathon' : 'hackathons'}
      />

      {error && (
        <ListingErrorState
          icon={Trophy}
          title="Failed to load hackathons"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {!loading && !error && hackathonsData.length === 0 && (
        <ListingEmptyState
          icon={Trophy}
          message="No hackathons match your search or filters."
        />
      )}

      {!loading && !error && hackathonsData.length > 0 && (
        <div className="space-y-6">
          {showFeaturedSection && featuredHackathons.length > 0 && (
            <section>
              <ListingSectionTitle icon={Star}>Featured</ListingSectionTitle>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {featuredHackathons.map((hackathon) => (
                  <HackathonListCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    featured
                    canManageFeatured={canManageFeatured}
                    togglingFeatured={togglingFeatured === hackathon.id}
                    onToggleFeatured={(e) => handleToggleFeatured(e, hackathon)}
                    onClick={() => handleHackathonClick(hackathon)}
                  />
                ))}
              </div>
            </section>
          )}

          {regularHackathons.length > 0 && (
            <section>
              {showFeaturedSection && featuredHackathons.length > 0 && (
                <ListingSectionTitle>All hackathons</ListingSectionTitle>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularHackathons.map((hackathon) => (
                  <HackathonListCard
                    key={hackathon.id}
                    hackathon={hackathon}
                    canManageFeatured={canManageFeatured}
                    togglingFeatured={togglingFeatured === hackathon.id}
                    onToggleFeatured={(e) => handleToggleFeatured(e, hackathon)}
                    onClick={() => handleHackathonClick(hackathon)}
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
