import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Video,
  Ticket,
  Star,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { eventsService, Event as APIEvent } from '../services/api/events.service';
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

interface EventsPageProps {
  onBack?: () => void;
  onViewEventDetail?: (id: string) => void;
}

interface Event {
  id: string;
  slug?: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'online' | 'in-person' | 'hybrid';
  category: string;
  attendees: number;
  maxAttendees?: number;
  image: string;
  featured?: boolean;
  price: string;
}

const TYPE_FILTERS = ['all', 'online', 'in-person', 'hybrid'] as const;

const TYPE_LABELS: Record<string, string> = {
  all: 'All',
  online: 'Online',
  'in-person': 'In person',
  hybrid: 'Hybrid',
};

const typePillClass =
  'inline-flex items-center gap-1 rounded-md border border-zinc-200/70 bg-zinc-50/95 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-300 capitalize';

const featuredPillClass =
  'inline-flex items-center gap-0.5 rounded-md border border-amber-200/80 bg-amber-50/95 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-950/80 dark:text-amber-200';

function formatEventDate(date: string, short = false) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(short ? {} : { year: 'numeric' }),
  });
}

function EventListCard({
  event,
  featured,
  canManageFeatured,
  togglingFeatured,
  onToggleFeatured,
  onClick,
}: {
  event: Event;
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
          src={event.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {event.featured && (
            <span className={featuredPillClass}>
              <Star size={10} strokeWidth={2.5} className="fill-current" />
              Featured
            </span>
          )}
          <span className={typePillClass}>
            {event.type === 'online' && <Video size={10} strokeWidth={2} />}
            {event.type === 'in-person' && <MapPin size={10} strokeWidth={2} />}
            {event.type === 'hybrid' && <Users size={10} strokeWidth={2} />}
            {event.type === 'in-person' ? 'In person' : event.type}
          </span>
        </div>
        {canManageFeatured && (
          <button
            type="button"
            onClick={onToggleFeatured}
            disabled={togglingFeatured}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200/80 bg-white/95 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-amber-600 dark:border-white/10 dark:bg-zinc-900/95 dark:hover:text-amber-400"
            title={event.featured ? 'Remove from featured' : 'Add to featured'}
            aria-label={event.featured ? 'Remove from featured' : 'Add to featured'}
          >
            {togglingFeatured ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Star
                size={12}
                className={event.featured ? 'fill-amber-500 text-amber-500' : ''}
                strokeWidth={2}
              />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white">
            {event.title}
          </h3>
          {event.category && (
            <span className={`${postTagClass} shrink-0 capitalize`}>{event.category}</span>
          )}
        </div>

        <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          {event.description}
        </p>

        <div className="mb-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
              {formatEventDate(event.date, !featured)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="truncate">{event.time}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <Users size={12} className="shrink-0 text-zinc-400" strokeWidth={2} />
            <span className="tabular-nums">
              {event.attendees.toLocaleString()}
              {event.maxAttendees ? ` / ${event.maxAttendees}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-2.5 dark:border-white/[0.06]">
          <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            <Ticket size={12} className="text-zinc-400" strokeWidth={2} />
            {event.price}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            View event
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

export function EventsPage({ onBack, onViewEventDetail }: EventsPageProps) {
  const navigate = useNavigate();
  const { isAdmin, canModerate } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [events, setEvents] = useState<APIEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const canManageFeatured = isAdmin() || canModerate();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const params: Record<string, string> = {};
        if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();
        if (selectedFilter !== 'all') {
          if (['online', 'in-person', 'hybrid'].includes(selectedFilter)) {
            params.type = selectedFilter;
          } else {
            params.category = selectedFilter;
          }
        }

        const response = await eventsService.getEvents(params);
        setEvents(response.data || response);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load events';
        setError(message);
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [debouncedSearchQuery, selectedFilter]);

  const eventsData: Event[] = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    date: e.date,
    time: e.time,
    location: e.location,
    type: e.type,
    category: e.category,
    attendees: e.attendeeCount,
    maxAttendees: e.maxAttendees,
    image:
      e.imageUrl ||
      'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: e.featured,
    price: e.price,
  }));

  const categories = useMemo(() => {
    return Array.from(new Set(eventsData.map((e) => e.category).filter(Boolean))).sort();
  }, [eventsData]);

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
  const featuredEvents = eventsData.filter((e) => e.featured);
  const regularEvents = eventsData.filter(
    (e) => selectedFilter !== 'all' || debouncedSearchQuery || !e.featured
  );

  const handleEventClick = (event: Event) => {
    if (event.slug) {
      navigate(`/events/${event.slug}`);
    } else if (onViewEventDetail) {
      onViewEventDetail(event.id);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  const handleToggleFeatured = async (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    if (!canManageFeatured) return;

    try {
      setTogglingFeatured(event.id);
      const newFeaturedStatus = !event.featured;
      await eventsService.updateEvent(event.id, { featured: newFeaturedStatus });
      setEvents((prev) =>
        prev.map((item) => (item.id === event.id ? { ...item, featured: newFeaturedStatus } : item))
      );
      toast.success(
        newFeaturedStatus ? 'Event featured successfully' : 'Event removed from featured'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update featured status';
      toast.error(message);
      console.error('Error toggling featured:', err);
    } finally {
      setTogglingFeatured(null);
    }
  };

  if (loading && eventsData.length === 0) {
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
        icon={Calendar}
        title="Events"
        subtitle="Discover and attend Web3 events worldwide"
        onBack={onBack}
        count={eventsData.length}
        countLabel={eventsData.length === 1 ? 'event' : 'events'}
      />

      <ListingFilterToolbar
        searchId="events-search"
        searchPlaceholder="Title, location, or description…"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterTabs={filterTabs}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        filterAriaLabel="Filter events"
        resultCount={eventsData.length}
        loading={loading}
        loadingLabel="Loading events…"
        entityPlural={eventsData.length === 1 ? 'event' : 'events'}
      />

      {error && (
        <ListingErrorState
          icon={Calendar}
          title="Failed to load events"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {!loading && !error && eventsData.length === 0 && (
        <ListingEmptyState icon={Calendar} message="No events match your search or filters." />
      )}

      {!loading && !error && eventsData.length > 0 && (
        <div className="space-y-6">
          {showFeaturedSection && featuredEvents.length > 0 && (
            <section>
              <ListingSectionTitle icon={Star}>Featured</ListingSectionTitle>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {featuredEvents.map((event) => (
                  <EventListCard
                    key={event.id}
                    event={event}
                    featured
                    canManageFeatured={canManageFeatured}
                    togglingFeatured={togglingFeatured === event.id}
                    onToggleFeatured={(e) => handleToggleFeatured(e, event)}
                    onClick={() => handleEventClick(event)}
                  />
                ))}
              </div>
            </section>
          )}

          {regularEvents.length > 0 && (
            <section>
              {showFeaturedSection && featuredEvents.length > 0 && (
                <ListingSectionTitle>Upcoming</ListingSectionTitle>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularEvents.map((event) => (
                  <EventListCard
                    key={event.id}
                    event={event}
                    canManageFeatured={canManageFeatured}
                    togglingFeatured={togglingFeatured === event.id}
                    onToggleFeatured={(e) => handleToggleFeatured(e, event)}
                    onClick={() => handleEventClick(event)}
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
