import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Calendar, Briefcase, DollarSign, MapPin, ArrowRight, Award } from 'lucide-react';
import { StickyAsidePanel } from './layout/StickyAsidePanel';
import { SidebarAds } from './ads/SidebarAds';
import { Avatar } from './Avatar';
import { VerifiedBadge } from './VerifiedBadge';
import trendingService from '../services/api/trending.service';
import hackathonsService from '../services/api/hackathons.service';
import eventsService from '../services/api/events.service';
import opportunitiesService from '../services/api/opportunities.service';
import { useNavigate } from 'react-router-dom';
import { isNetworkError } from '../services/api/config';
import {
  HackathonCardSkeletonList,
  EventCardSkeletonList,
  OpportunityCardSkeletonList,
  UserCardSkeletonList,
} from './skeletons';

interface RightSidebarProps {
  onHackathonClick?: (id: string) => void;
  onEventClick?: (id: string) => void;
  onOpportunityClick?: (id: string) => void;
}

type Timeframe = '24h' | '7d' | '30d' | '1yr' | 'all';

const panelClass =
  'rounded-xl border border-zinc-200/80 bg-white/90 p-2.5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900/40';

const sectionLabelClass =
  'mb-1 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500';

const viewAllClass =
  'inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200';

const listItemClass =
  'cursor-pointer rounded-lg px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]';

const metaClass = 'text-[11px] text-zinc-500 dark:text-zinc-400';

const chipClass =
  'inline-flex shrink-0 items-center rounded-md border border-zinc-200/70 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400';

const TIMEFRAMES: Timeframe[] = ['24h', '7d', '30d', '1yr', 'all'];

function startOfLocalDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function normalizeApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as { data: unknown }).data;
    return Array.isArray(data) ? data : [];
  }
  return [];
}

function isHackathonStillActive(hackathon: { status?: string; endDate?: string }) {
  if (hackathon.status === 'ended') return false;
  if (!hackathon.endDate) return true;
  return (
    startOfLocalDay(new Date(hackathon.endDate)).getTime() >= startOfLocalDay(new Date()).getTime()
  );
}

function isEventStillUpcoming(event: { date?: string; time?: string }) {
  if (!event.date) return true;
  const today = startOfLocalDay(new Date());
  const eventDay = startOfLocalDay(new Date(event.date));
  if (eventDay.getTime() > today.getTime()) return true;
  if (eventDay.getTime() < today.getTime()) return false;

  if (event.time) {
    const end = new Date(event.date);
    const match = event.time.trim().match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      end.setHours(Number(match[1]), Number(match[2]), 0, 0);
      return end.getTime() > Date.now();
    }
  }

  return true;
}

/** Last day from post body lines like "Dates: November 19–20, 2025" when DB has no deadline. */
function parseContentEndDate(content?: string): Date | null {
  if (!content) return null;

  const datesLine =
    content.match(/(?:🗓\s*)?Dates?:\s*\*{0,2}\s*([^\n*]+)/i)?.[1] ??
    content.match(/(?:deadline|closes?|ends?)\s*:?\s*\*{0,2}\s*([^\n*]+)/i)?.[1];

  if (!datesLine) return null;

  const range = datesLine.match(
    /([A-Za-z]+)\s+(\d{1,2})\s*[–—-]\s*(\d{1,2}),?\s*(\d{4})/
  );
  if (range) {
    const parsed = new Date(`${range[1]} ${range[3]}, ${range[4]}`);
    if (!Number.isNaN(parsed.getTime())) return startOfLocalDay(parsed);
  }

  const single = datesLine.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (single) {
    const parsed = new Date(`${single[1]} ${single[2]}, ${single[3]}`);
    if (!Number.isNaN(parsed.getTime())) return startOfLocalDay(parsed);
  }

  const iso = datesLine.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) {
    const parsed = startOfLocalDay(new Date(iso[1]));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function getOpportunityCutoffDate(opportunity: {
  deadline?: string;
  expiresAt?: string;
  expires_at?: string;
  post?: {
    content?: string;
    event?: { date?: string };
    hackathon?: { endDate?: string };
  };
}): Date | null {
  const structured = [
    opportunity.deadline,
    opportunity.expiresAt,
    opportunity.expires_at,
    opportunity.post?.event?.date,
    opportunity.post?.hackathon?.endDate,
  ];

  for (const raw of structured) {
    if (!raw) continue;
    const parsed = startOfLocalDay(new Date(raw));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return parseContentEndDate(opportunity.post?.content);
}

function isOpportunityStillOpen(opportunity: Parameters<typeof getOpportunityCutoffDate>[0]) {
  const cutoff = getOpportunityCutoffDate(opportunity);
  if (!cutoff) return true;
  return cutoff.getTime() >= startOfLocalDay(new Date()).getTime();
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function SectionHeader({
  icon: Icon,
  title,
  onViewAll,
}: {
  icon: typeof Trophy;
  title: string;
  onViewAll?: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <Icon size={15} strokeWidth={2} className="shrink-0 text-zinc-500 dark:text-zinc-400" />
        <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      </div>
      {onViewAll && (
        <button type="button" onClick={onViewAll} className={viewAllClass}>
          View all
          <ArrowRight size={11} />
        </button>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-3 text-center text-xs text-zinc-500 dark:text-zinc-500">{message}</p>;
}

export function RightSidebar({ onHackathonClick, onEventClick, onOpportunityClick }: RightSidebarProps) {
  const navigate = useNavigate();
  const [trendingAuthors, setTrendingAuthors] = useState<any[]>([]);
  const [mostReputedAuthors, setMostReputedAuthors] = useState<any[]>([]);
  const [trendingTimeframe, setTrendingTimeframe] = useState<Timeframe>('7d');
  const [upcomingHackathons, setUpcomingHackathons] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [upcomingOpportunities, setUpcomingOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [hackathonsUpcoming, hackathonsOngoing, events, opportunities] = await Promise.all([
          hackathonsService.getHackathons({ limit: 10, status: 'upcoming' }).catch(() => ({ data: [] })),
          hackathonsService.getHackathons({ limit: 10, status: 'ongoing' }).catch(() => ({ data: [] })),
          eventsService.getUpcomingEvents({ limit: 10 }).catch(() => []),
          opportunitiesService.getOpportunities({ limit: 10 }).catch(() => ({ data: [] })),
        ]);

        const hackathonCandidates = dedupeById([
          ...normalizeApiList<any>(hackathonsUpcoming),
          ...normalizeApiList<any>(hackathonsOngoing),
        ])
          .filter(isHackathonStillActive)
          .slice(0, 2);

        const eventCandidates = normalizeApiList<any>(events)
          .filter(isEventStillUpcoming)
          .slice(0, 2);

        const opportunityCandidates = normalizeApiList<any>(opportunities)
          .filter(isOpportunityStillOpen)
          .slice(0, 2);

        setUpcomingHackathons(hackathonCandidates);
        setUpcomingEvents(eventCandidates);
        setUpcomingOpportunities(opportunityCandidates);
      } catch (err: any) {
        if (!isNetworkError(err)) {
          console.error('Error fetching sidebar data:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTrendingAuthors = async () => {
      try {
        setLoadingTrending(true);
        const authors = await trendingService.getTrendingAuthors(trendingTimeframe, 5);
        setTrendingAuthors(Array.isArray(authors) ? authors : []);
      } catch (err: any) {
        if (!isNetworkError(err)) {
          console.error('Error fetching trending authors:', err);
        }
        setTrendingAuthors([]);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrendingAuthors();
  }, [trendingTimeframe]);

  useEffect(() => {
    const fetchMostReputedAuthors = async () => {
      try {
        const authors = await trendingService.getMostReputedAuthors(5);
        setMostReputedAuthors(Array.isArray(authors) ? authors : []);
      } catch (err: any) {
        if (!isNetworkError(err)) {
          console.error('Error fetching most reputed authors:', err);
        }
        setMostReputedAuthors([]);
      }
    };

    fetchMostReputedAuthors();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const timeframePillClass = (active: boolean) =>
    `rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
      active
        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
        : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200'
    }`;

  const renderAuthorRow = (
    author: any,
    index: number,
    meta: React.ReactNode,
    showRank: boolean
  ) => (
    <div
      key={author.id}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/profile/${author.username}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/profile/${author.username}`);
        }
      }}
      className={`${listItemClass} flex items-center gap-2.5`}
    >
      <div className="relative shrink-0">
        <Avatar
          src={
            author.avatarUrl ||
            author.avatar ||
            ''
          }
          alt={author.username || 'User'}
          size="sm"
        />
        {author.isVerified && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <VerifiedBadge size={10} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {author.username || 'Unknown User'}
        </p>
        <div className={metaClass}>{meta}</div>
      </div>
      {showRank && index < 3 && (
        <span className={chipClass}>#{index + 1}</span>
      )}
    </div>
  );

  return (
    <aside className="flex h-full min-h-0 w-full flex-1 shrink-0 flex-col">
      <StickyAsidePanel pin={false} className="space-y-3 pb-2">
        {/* Sponsored / Pub slots (rendered on top, max 2) */}
        <SidebarAds />

        {/* Hackathons */}
        <section>
          <p className={sectionLabelClass}>Hackathons</p>
          <div className={panelClass}>
            <SectionHeader
              icon={Trophy}
              title="Upcoming"
              onViewAll={() => navigate('/hackathons')}
            />
            {loading ? (
              <HackathonCardSkeletonList count={2} />
            ) : upcomingHackathons.length > 0 ? (
              <ul className="divide-y divide-zinc-100 dark:divide-white/[0.06]" role="list">
                {upcomingHackathons.map((hackathon) => {
                  const daysUntil = hackathon.endDate ? getDaysUntil(hackathon.endDate) : 0;
                  return (
                    <li key={hackathon.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onHackathonClick?.(hackathon.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onHackathonClick?.(hackathon.id);
                          }
                        }}
                        className={listItemClass}
                      >
                        <h4 className="mb-1 line-clamp-2 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
                          {hackathon.title}
                        </h4>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          {hackathon.prize && (
                            <span className={`${metaClass} inline-flex items-center gap-0.5`}>
                              <DollarSign size={11} className="shrink-0" />
                              <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
                                {hackathon.prize}
                              </span>
                            </span>
                          )}
                          <span className={chipClass}>
                            {daysUntil > 0 ? `${daysUntil}d left` : 'Ended'}
                          </span>
                        </div>
                        <span className={`${metaClass} inline-flex items-center gap-1`}>
                          <Trophy size={10} />
                          {Number(hackathon.participantCount || 0).toLocaleString()} participants
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState message="No upcoming hackathons" />
            )}
          </div>
        </section>

        {/* Events */}
        <section>
          <p className={sectionLabelClass}>Events</p>
          <div className={panelClass}>
            <SectionHeader
              icon={Calendar}
              title="Upcoming"
              onViewAll={() => navigate('/events')}
            />
            {loading ? (
              <EventCardSkeletonList count={2} />
            ) : upcomingEvents.length > 0 ? (
              <ul className="divide-y divide-zinc-100 dark:divide-white/[0.06]" role="list">
                {upcomingEvents.map((event) => {
                  const daysUntil = event.date ? getDaysUntil(event.date) : 0;
                  return (
                    <li key={event.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onEventClick?.(event.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onEventClick?.(event.id);
                          }
                        }}
                        className={listItemClass}
                      >
                        <h4 className="mb-1 line-clamp-2 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
                          {event.title}
                        </h4>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className={`${metaClass} inline-flex items-center gap-0.5`}>
                            <Calendar size={11} className="shrink-0" />
                            {event.date ? formatDate(event.date) : 'Date TBD'}
                          </span>
                          <span className={chipClass}>
                            {daysUntil > 0 ? `in ${daysUntil}d` : 'Today'}
                          </span>
                        </div>
                        <span className={`${metaClass} inline-flex max-w-full items-center gap-1 truncate`}>
                          <MapPin size={10} className="shrink-0" />
                          <span className="truncate">{event.location || 'Location TBD'}</span>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState message="No upcoming events" />
            )}
          </div>
        </section>

        {/* Opportunities */}
        <section>
          <p className={sectionLabelClass}>Jobs</p>
          <div className={panelClass}>
            <SectionHeader
              icon={Briefcase}
              title="Opportunities"
              onViewAll={() => navigate('/opportunities')}
            />
            {loading ? (
              <OpportunityCardSkeletonList count={2} />
            ) : upcomingOpportunities.length > 0 ? (
              <ul className="divide-y divide-zinc-100 dark:divide-white/[0.06]" role="list">
                {upcomingOpportunities.map((opportunity) => (
                  <li key={opportunity.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpportunityClick?.(opportunity.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpportunityClick?.(opportunity.id);
                        }
                      }}
                      className={listItemClass}
                    >
                      <h4 className="mb-0.5 line-clamp-2 text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
                        {opportunity.title}
                      </h4>
                      <p className={`${metaClass} mb-1 truncate`}>
                        {opportunity.companyName || opportunity.company}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        {opportunity.salary && (
                          <span className={`${metaClass} inline-flex items-center gap-0.5 font-medium text-zinc-700 dark:text-zinc-300`}>
                            <DollarSign size={11} />
                            {opportunity.salary}
                          </span>
                        )}
                        {opportunity.type && (
                          <span className={`${chipClass} capitalize`}>{opportunity.type}</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No opportunities found" />
            )}
          </div>
        </section>

        {/* Trending authors */}
        <section>
          <p className={sectionLabelClass}>Community</p>
          <div className={panelClass}>
            <SectionHeader icon={TrendingUp} title="Trending authors" />
            <div className="mb-2 flex flex-wrap gap-0.5">
              {TIMEFRAMES.map((timeframe) => (
                <button
                  key={timeframe}
                  type="button"
                  onClick={() => setTrendingTimeframe(timeframe)}
                  className={timeframePillClass(trendingTimeframe === timeframe)}
                >
                  {timeframe === 'all' ? 'All' : timeframe}
                </button>
              ))}
            </div>
            {loadingTrending ? (
              <UserCardSkeletonList count={5} />
            ) : trendingAuthors.length > 0 ? (
              <div className="space-y-0.5">
                {trendingAuthors.map((author: any, index: number) =>
                  renderAuthorRow(
                    author,
                    index,
                    <span>
                      {author.stats?.posts || 0} {author.stats?.posts === 1 ? 'post' : 'posts'}
                      {author.stats?.comments > 0 && ` · ${author.stats.comments} comments`}
                    </span>,
                    true
                  )
                )}
              </div>
            ) : (
              <EmptyState message="No trending authors" />
            )}
          </div>
        </section>

        {/* Most reputed */}
        <section>
          <div className={panelClass}>
            <SectionHeader icon={Award} title="Top reputation" />
            {loading ? (
              <UserCardSkeletonList count={5} />
            ) : mostReputedAuthors.length > 0 ? (
              <div className="space-y-0.5">
                {mostReputedAuthors.map((author: any, index: number) =>
                  renderAuthorRow(
                    author,
                    index,
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {Number(author.reputation || 0).toLocaleString()} rep
                    </span>,
                    true
                  )
                )}
              </div>
            ) : (
              <EmptyState message="No authors found" />
            )}
          </div>
        </section>
      </StickyAsidePanel>
    </aside>
  );
}
