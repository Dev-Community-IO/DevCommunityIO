import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Calendar, Briefcase, DollarSign, MapPin, ArrowRight, Award } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
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
  UserCardSkeletonList 
} from './skeletons';

interface RightSidebarProps {
  onHackathonClick?: (id: string) => void;
  onEventClick?: (id: string) => void;
  onOpportunityClick?: (id: string) => void;
}

type Timeframe = '24h' | '7d' | '30d' | '1yr' | 'all';

export function RightSidebar({ onHackathonClick, onEventClick, onOpportunityClick }: RightSidebarProps) {
  const navigate = useNavigate();
  const [trendingAuthors, setTrendingAuthors] = useState<any[]>([]);
  const [mostReputedAuthors, setMostReputedAuthors] = useState<any[]>([]);
  const [trendingTimeframe, setTrendingTimeframe] = useState<Timeframe>('all');
  const [upcomingHackathons, setUpcomingHackathons] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [upcomingOpportunities, setUpcomingOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [hackathons, events, opportunities] = await Promise.all([
          hackathonsService.getHackathons({ limit: 2, status: 'upcoming' }).catch(() => ({ data: [] })),
          eventsService.getEvents({ limit: 2 }).catch(() => ({ data: [] })),
          opportunitiesService.getOpportunities({ limit: 2 }).catch(() => ({ data: [] }))
        ]);

        setUpcomingHackathons(hackathons?.data || (Array.isArray(hackathons) ? hackathons : []));
        setUpcomingEvents(events?.data || (Array.isArray(events) ? events : []));
        setUpcomingOpportunities(opportunities?.data || (Array.isArray(opportunities) ? opportunities : []));
      } catch (err: any) {
        // Don't log network errors (server offline) - already handled by interceptor
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
        // Don't log network errors (server offline) - already handled by interceptor
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
        // Don't log network errors (server offline) - already handled by interceptor
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <aside className="hidden lg:block w-80 flex-shrink-0">
      <div className="sticky top-24">
        <div className="space-y-4 px-1">
          {/* Upcoming Hackathons */}
          <GlassCard className="p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                  <Trophy size={14} className="text-white" />
                </div>
                <h3 className="font-semibold text-sm">Upcoming Hackathons</h3>
              </div>
              <button 
                onClick={() => navigate('/hackathons')}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight size={12} />
              </button>
            </div>
            {loading ? (
              <HackathonCardSkeletonList count={2} />
            ) : upcomingHackathons.length > 0 ? (
              <div className="space-y-3">
                {upcomingHackathons.map(hackathon => {
                  const daysUntil = hackathon.endDate ? getDaysUntil(hackathon.endDate) : 0;
                  return (
                    <div
                      key={hackathon.id}
                      onClick={() => onHackathonClick?.(hackathon.id)}
                      className="pb-3 border-b border-white/10 dark:border-white/5 last:border-0 last:pb-0 cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 rounded-lg p-2 -m-2 transition-all duration-300"
                    >
                      <h4 className="font-medium text-sm mb-2 line-clamp-2 hover:text-blue-500 transition-colors">
                        {hackathon.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <DollarSign size={12} />
                          <span className="font-semibold">{hackathon.prize}</span>
                        </div>
                        <Badge variant="default" className="text-[9px] px-1.5 py-0.5">
                          {daysUntil > 0 ? `${daysUntil}d left` : 'Ended'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Trophy size={10} />
                        <span>{Number(hackathon.participantCount || 0).toLocaleString()} participants</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming hackathons</p>
            )}
          </GlassCard>

          {/* Upcoming Events */}
          <GlassCard className="p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Calendar size={14} className="text-white" />
                </div>
                <h3 className="font-semibold text-sm">Upcoming Events</h3>
              </div>
              <button 
                onClick={() => navigate('/events')}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight size={12} />
              </button>
            </div>
            {loading ? (
              <EventCardSkeletonList count={2} />
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map(event => {
                  const daysUntil = event.date ? getDaysUntil(event.date) : 0;
                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event.id)}
                      className="pb-3 border-b border-white/10 dark:border-white/5 last:border-0 last:pb-0 cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 rounded-lg p-2 -m-2 transition-all duration-300"
                    >
                      <h4 className="font-medium text-sm mb-2 line-clamp-2 hover:text-blue-500 transition-colors">
                        {event.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <Calendar size={12} />
                          <span className="font-semibold">{event.date ? formatDate(event.date) : 'Date TBD'}</span>
                        </div>
                        <Badge variant="default" className="text-[9px] px-1.5 py-0.5">
                          {daysUntil > 0 ? `in ${daysUntil}d` : 'Today'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 truncate">
                        <MapPin size={10} className="flex-shrink-0" />
                        <span className="truncate">{event.location || 'Location TBD'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </GlassCard>

          {/* Upcoming Opportunities */}
          <GlassCard className="p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                  <Briefcase size={14} className="text-white" />
                </div>
                <h3 className="font-semibold text-sm">Job Opportunities</h3>
              </div>
              <button 
                onClick={() => navigate('/opportunities')}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight size={12} />
              </button>
            </div>
            {loading ? (
              <OpportunityCardSkeletonList count={2} />
            ) : upcomingOpportunities.length > 0 ? (
              <div className="space-y-3">
                {upcomingOpportunities.map(opportunity => (
                  <div
                    key={opportunity.id}
                    onClick={() => onOpportunityClick?.(opportunity.id)}
                    className="pb-3 border-b border-white/10 dark:border-white/5 last:border-0 last:pb-0 cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 rounded-lg p-2 -m-2 transition-all duration-300"
                  >
                    <h4 className="font-medium text-sm mb-1 line-clamp-2 hover:text-blue-500 transition-colors">
                      {opportunity.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                      {opportunity.companyName || opportunity.company}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <DollarSign size={12} />
                        <span className="font-semibold">{opportunity.salary}</span>
                      </div>
                      <Badge variant="default" className="text-[9px] px-1.5 py-0.5 capitalize">
                        {opportunity.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No opportunities found</p>
            )}
          </GlassCard>

          {/* Trending Authors */}
          <GlassCard className="p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <TrendingUp size={14} className="text-white" />
              </div>
              <h3 className="font-semibold text-sm">Trending Authors</h3>
            </div>
            
            {/* Time Filter Buttons */}
            <div className="flex items-center gap-1 mb-3 flex-wrap">
              {(['24h', '7d', '30d', '1yr', 'all'] as Timeframe[]).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setTrendingTimeframe(timeframe)}
                  className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                    trendingTimeframe === timeframe
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-500/30 font-semibold'
                      : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 font-medium'
                  }`}
                >
                  {timeframe === 'all' ? 'All' : timeframe}
                </button>
              ))}
            </div>

            {loadingTrending ? (
              <UserCardSkeletonList count={5} />
            ) : trendingAuthors.length > 0 ? (
              <div className="space-y-2">
                {trendingAuthors.map((author: any, index: number) => (
                  <div
                    key={author.id}
                    onClick={() => navigate(`/profile/${author.username}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0 relative">
                      <Avatar 
                        src={author.avatarUrl || author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username || 'user'}`} 
                        alt={author.username || 'User'} 
                        size="sm" 
                        className="flex-shrink-0" 
                      />
                      {author.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <VerifiedBadge size={10} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                          {author.username || 'Unknown User'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          {author.stats?.posts || 0} {author.stats?.posts === 1 ? 'post' : 'posts'}
                        </span>
                        {author.stats?.comments > 0 && (
                          <>
                            <span>•</span>
                            <span>{author.stats.comments} comments</span>
                          </>
                        )}
                      </div>
                    </div>
                    {index < 3 && (
                      <div className="flex-shrink-0">
                        <Badge className="text-[9px] px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                          #{index + 1}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No trending authors</p>
            )}
          </GlassCard>

          {/* Most Reputed Authors */}
          <GlassCard className="p-4 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                <Award size={14} className="text-white" />
              </div>
              <h3 className="font-semibold text-sm">Most Reputed Authors</h3>
            </div>
            {loading ? (
              <UserCardSkeletonList count={5} />
            ) : mostReputedAuthors.length > 0 ? (
              <div className="space-y-2">
                {mostReputedAuthors.map((author: any, index: number) => (
                  <div
                    key={author.id}
                    onClick={() => navigate(`/profile/${author.username}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 cursor-pointer transition-all duration-300 group"
                  >
                    <div className="flex-shrink-0 relative">
                      <Avatar 
                        src={author.avatarUrl || author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username || 'user'}`} 
                        alt={author.username || 'User'} 
                        size="sm" 
                        className="flex-shrink-0" 
                      />
                      {author.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <VerifiedBadge size={10} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                          {author.username || 'Unknown User'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {Number(author.reputation || 0).toLocaleString()} rep
                        </span>
                      </div>
                    </div>
                    {index < 3 && (
                      <div className="flex-shrink-0">
                        <Badge className="text-[9px] px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0">
                          #{index + 1}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No authors found</p>
            )}
          </GlassCard>
        </div>
      </div>
    </aside>
  );
}