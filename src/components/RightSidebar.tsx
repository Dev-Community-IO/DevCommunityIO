import { useState, useEffect } from 'react';
import { TrendingUp, Trophy, Calendar, Briefcase, DollarSign, MapPin, ArrowRight, Loader } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import trendingService from '../services/api/trending.service';
import hackathonsService from '../services/api/hackathons.service';
import eventsService from '../services/api/events.service';
import opportunitiesService from '../services/api/opportunities.service';
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

export function RightSidebar({ onHackathonClick, onEventClick, onOpportunityClick }: RightSidebarProps) {
  const [trendingAuthors, setTrendingAuthors] = useState<any[]>([]);
  const [upcomingHackathons, setUpcomingHackathons] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [upcomingOpportunities, setUpcomingOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [authors, hackathons, events, opportunities] = await Promise.all([
          trendingService.getTrendingAuthors(5).catch(() => []),
          hackathonsService.getHackathons({ limit: 2, status: 'upcoming' }).catch(() => ({ data: [] })),
          eventsService.getEvents({ limit: 2 }).catch(() => ({ data: [] })),
          opportunitiesService.getOpportunities({ limit: 2 }).catch(() => ({ data: [] }))
        ]);

        // Ensure authors is an array (API returns array directly)
        setTrendingAuthors(Array.isArray(authors) ? authors : []);
        setUpcomingHackathons(hackathons?.data || (Array.isArray(hackathons) ? hackathons : []));
        setUpcomingEvents(events?.data || (Array.isArray(events) ? events : []));
        setUpcomingOpportunities(opportunities?.data || (Array.isArray(opportunities) ? opportunities : []));
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    <aside className="hidden lg:block w-80 flex-shrink-0 space-y-4">
      {/* Upcoming Hackathons */}
      <GlassCard className="p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
              <Trophy size={14} className="text-white" />
            </div>
            <h3 className="font-semibold text-sm">Upcoming Hackathons</h3>
          </div>
          <button className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
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
          <button className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
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
          <button className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
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

      {/* Recent Active */}
      <GlassCard className="p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-green-500 flex-shrink-0" />
          <h3 className="font-semibold">Trending Authors</h3>
        </div>
        {loading ? (
          <UserCardSkeletonList count={5} />
        ) : trendingAuthors.length > 0 ? (
          <div className="space-y-3">
            {trendingAuthors.map((author: any) => (
              <div
                key={author.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 cursor-pointer transition-all duration-300"
              >
                <Avatar 
                  src={author.avatarUrl || author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username || 'user'}`} 
                  alt={author.username || 'User'} 
                  size="sm" 
                  className="flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{author.username || 'Unknown User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Number(author.reputation || 0).toLocaleString()} reputation
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No trending authors</p>
        )}
      </GlassCard>
    </aside>
  );
}
