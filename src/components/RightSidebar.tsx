import { Megaphone, TrendingUp, Clock, Trophy, Calendar, Briefcase, DollarSign, MapPin, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { mockUsers } from '../data/mockData';

interface RightSidebarProps {
  onHackathonClick?: (id: string) => void;
  onEventClick?: (id: string) => void;
  onOpportunityClick?: (id: string) => void;
}

export function RightSidebar({ onHackathonClick, onEventClick, onOpportunityClick }: RightSidebarProps) {
  const upcomingHackathons = [
    {
      id: '1',
      title: 'Web3 Global Hackathon 2025',
      prize: '$100,000',
      endDate: '2025-03-15',
      participants: 2500
    },
    {
      id: '2',
      title: 'NFT Art Challenge',
      prize: '$50,000',
      endDate: '2025-02-20',
      participants: 1800
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Web3 Summit 2025',
      date: '2025-03-15',
      location: 'San Francisco, CA',
      attendees: 1500
    },
    {
      id: '2',
      title: 'Smart Contract Security Webinar',
      date: '2025-02-15',
      location: 'Virtual Event',
      attendees: 2100
    }
  ];

  const upcomingOpportunities = [
    {
      id: '1',
      title: 'Senior Smart Contract Engineer',
      company: 'DeFi Protocol',
      salary: '$150k - $200k',
      type: 'full-time'
    },
    {
      id: '2',
      title: 'Blockchain Product Manager',
      company: 'Web3 Ventures',
      salary: '$140k - $180k',
      type: 'full-time'
    }
  ];

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
        <div className="space-y-3">
          {upcomingHackathons.map(hackathon => {
            const daysUntil = getDaysUntil(hackathon.endDate);
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
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                    {daysUntil > 0 ? `${daysUntil}d left` : 'Ended'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Trophy size={10} />
                  <span>{hackathon.participants.toLocaleString()} participants</span>
                </div>
              </div>
            );
          })}
        </div>
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
        <div className="space-y-3">
          {upcomingEvents.map(event => {
            const daysUntil = getDaysUntil(event.date);
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
                    <span className="font-semibold">{formatDate(event.date)}</span>
                  </div>
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                    {daysUntil > 0 ? `in ${daysUntil}d` : 'Today'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 truncate">
                  <MapPin size={10} className="flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            );
          })}
        </div>
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
                {opportunity.company}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <DollarSign size={12} />
                  <span className="font-semibold">{opportunity.salary}</span>
                </div>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 capitalize">
                  {opportunity.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Active */}
      <GlassCard className="p-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-green-500 flex-shrink-0" />
          <h3 className="font-semibold">Recent Active</h3>
        </div>
        <div className="space-y-3">
          {[
            {
              id: '1',
              title: 'Best practices for smart contract upgrades',
              author: mockUsers[0],
              replies: 23,
              timestamp: '5m ago'
            },
            {
              id: '2',
              title: 'Understanding EIP-4844 and blob transactions',
              author: mockUsers[1],
              replies: 45,
              timestamp: '12m ago'
            }
          ].map(discussion => (
            <div
              key={discussion.id}
              className="pb-3 border-b border-white/10 dark:border-white/5 last:border-0 last:pb-0 cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 rounded-lg p-2 -m-2 transition-all duration-300"
            >
              <h4 className="font-medium text-sm mb-2 line-clamp-2 hover:text-blue-500 transition-colors break-words">
                {discussion.title}
              </h4>
              <div className="flex items-center gap-2 min-w-0">
                <Avatar src={discussion.author.avatar} alt={discussion.author.username} size="sm" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {discussion.author.username}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    <span className="whitespace-nowrap">{discussion.replies} replies</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Clock size={10} />
                      {discussion.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </aside>
  );
}
