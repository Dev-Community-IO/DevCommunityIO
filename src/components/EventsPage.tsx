import { Calendar, MapPin, Users, Clock, ArrowLeft, Search, Filter, ExternalLink, Video, Ticket, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState } from 'react';

interface EventsPageProps {
  onBack?: () => void;
}

interface Event {
  id: string;
  title: string;
  description: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  type: 'online' | 'in-person' | 'hybrid';
  category: string;
  attendees: number;
  maxAttendees?: number;
  image: string;
  tags: string[];
  featured?: boolean;
  price: string;
}

export function EventsPage({ onBack }: EventsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const events: Event[] = [
    {
      id: '1',
      title: 'Web3 Summit 2025',
      description: 'Join industry leaders discussing the future of decentralized technologies and blockchain innovation',
      organizer: 'Web3 Foundation',
      date: '2025-03-15',
      time: '09:00 AM',
      location: 'San Francisco, CA',
      type: 'hybrid',
      category: 'Conference',
      attendees: 1500,
      maxAttendees: 2000,
      image: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Web3', 'Blockchain', 'Innovation'],
      featured: true,
      price: '$299'
    },
    {
      id: '2',
      title: 'NFT Art Exhibition',
      description: 'Explore groundbreaking digital art and meet renowned NFT artists from around the world',
      organizer: 'NFT Gallery',
      date: '2025-02-20',
      time: '06:00 PM',
      location: 'New York, NY',
      type: 'in-person',
      category: 'Exhibition',
      attendees: 450,
      maxAttendees: 500,
      image: 'https://images.pexels.com/photos/1839919/pexels-photo-1839919.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['NFT', 'Art', 'Digital'],
      featured: true,
      price: 'Free'
    },
    {
      id: '3',
      title: 'DeFi Workshop Series',
      description: 'Hands-on workshop covering DeFi protocols, yield farming, and liquidity provision strategies',
      organizer: 'DeFi Academy',
      date: '2025-02-10',
      time: '02:00 PM',
      location: 'Virtual Event',
      type: 'online',
      category: 'Workshop',
      attendees: 850,
      image: 'https://images.pexels.com/photos/3183165/pexels-photo-3183165.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['DeFi', 'Finance', 'Education'],
      featured: false,
      price: '$49'
    },
    {
      id: '4',
      title: 'Blockchain Developer Meetup',
      description: 'Network with fellow blockchain developers and share your latest projects',
      organizer: 'Dev Community',
      date: '2025-02-05',
      time: '07:00 PM',
      location: 'Austin, TX',
      type: 'in-person',
      category: 'Meetup',
      attendees: 120,
      maxAttendees: 150,
      image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Development', 'Networking', 'Blockchain'],
      featured: false,
      price: 'Free'
    },
    {
      id: '5',
      title: 'Smart Contract Security Webinar',
      description: 'Learn best practices for auditing and securing smart contracts from industry experts',
      organizer: 'Security Alliance',
      date: '2025-02-15',
      time: '11:00 AM',
      location: 'Virtual Event',
      type: 'online',
      category: 'Webinar',
      attendees: 2100,
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Security', 'Smart Contracts', 'Education'],
      featured: true,
      price: 'Free'
    },
    {
      id: '6',
      title: 'DAO Governance Forum',
      description: 'Discuss decentralized governance models and participate in shaping the future of DAOs',
      organizer: 'DAO Collective',
      date: '2025-03-01',
      time: '03:00 PM',
      location: 'Virtual Event',
      type: 'online',
      category: 'Forum',
      attendees: 680,
      image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['DAO', 'Governance', 'Community'],
      featured: false,
      price: 'Free'
    },
    {
      id: '7',
      title: 'Metaverse Conference',
      description: 'Explore the latest developments in virtual worlds, gaming, and immersive experiences',
      organizer: 'Metaverse Network',
      date: '2025-03-20',
      time: '10:00 AM',
      location: 'Los Angeles, CA',
      type: 'hybrid',
      category: 'Conference',
      attendees: 1200,
      maxAttendees: 1500,
      image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Metaverse', 'Gaming', 'VR'],
      featured: false,
      price: '$199'
    },
    {
      id: '8',
      title: 'Crypto Trading Masterclass',
      description: 'Advanced strategies for cryptocurrency trading and portfolio management',
      organizer: 'Trading Academy',
      date: '2025-02-12',
      time: '01:00 PM',
      location: 'Virtual Event',
      type: 'online',
      category: 'Masterclass',
      attendees: 540,
      maxAttendees: 1000,
      image: 'https://images.pexels.com/photos/6771900/pexels-photo-6771900.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Trading', 'Crypto', 'Finance'],
      featured: false,
      price: '$99'
    }
  ];

  const categories = ['all', ...Array.from(new Set(events.map(e => e.category)))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || event.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'online':
        return <Video size={12} className="text-blue-500" />;
      case 'in-person':
        return <MapPin size={12} className="text-green-500" />;
      case 'hybrid':
        return <Users size={12} className="text-purple-500" />;
      default:
        return <Calendar size={12} />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      online: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'in-person': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      hybrid: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    };
    return styles[type as keyof typeof styles] || styles.online;
  };

  return (
    <div className="space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
              <Calendar size={24} className="text-white" strokeWidth={2.5} />
            </div>
            Events
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Discover and attend Web3 events worldwide
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400 flex-shrink-0" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all capitalize"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Featured Events */}
      {filteredEvents.filter(e => e.featured).length > 0 && selectedFilter === 'all' && !searchQuery && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={20} className="text-yellow-500" />
            <h2 className="text-lg font-bold">Featured Events</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEvents.filter(e => e.featured).map(event => (
              <GlassCard key={event.id} className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant="gradient" className="text-[10px] px-2 py-1">
                      <Star size={10} className="inline mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${getTypeBadge(event.type)} capitalize`}>
                      {getTypeIcon(event.type)}
                      {event.type}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold group-hover:text-blue-500 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 flex-shrink-0">
                      {event.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Calendar size={14} className="text-blue-500" />
                      <span className="font-semibold">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock size={14} className="text-orange-500" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users size={14} className="text-green-500" />
                      <span className="font-semibold">{event.attendees}</span>
                      {event.maxAttendees && <span>/ {event.maxAttendees}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Ticket size={14} className="text-purple-500" />
                      <span className="font-semibold">{event.price}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {event.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <Button variant="primary" className="w-full text-sm py-2">
                    <ExternalLink size={14} className="mr-2" />
                    Register Now
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* All Events Grid */}
      <div>
        {filteredEvents.filter(e => e.featured).length > 0 && selectedFilter === 'all' && !searchQuery && (
          <h2 className="text-lg font-bold mb-3">Upcoming Events</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.filter(e => selectedFilter !== 'all' || searchQuery || !e.featured).map(event => (
            <GlassCard key={event.id} className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-32 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 left-2">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${getTypeBadge(event.type)} capitalize`}>
                    {getTypeIcon(event.type)}
                    {event.type}
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                    {event.category}
                  </Badge>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold group-hover:text-blue-500 transition-colors line-clamp-1 mb-2">
                  {event.title}
                </h3>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {event.description}
                </p>
                <div className="space-y-1 mb-2 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Calendar size={12} className="text-blue-500" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <MapPin size={12} className="text-green-500" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users size={12} className="text-purple-500" />
                      <span className="font-semibold">{event.attendees}</span>
                      {event.maxAttendees && <span>/ {event.maxAttendees}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Ticket size={12} className="text-orange-500" />
                      <span className="font-semibold">{event.price}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {event.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <Button variant="primary" className="w-full text-xs py-1.5">
                  Register
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No events found matching your search</p>
        </div>
      )}
    </div>
  );
}
