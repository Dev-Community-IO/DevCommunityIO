import { Calendar, MapPin, Users, Clock, ArrowLeft, Search, Filter, ExternalLink, Video, Ticket, Star, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState, useEffect, useMemo } from 'react';
import { eventsService, Event as APIEvent } from '../services/api/events.service';
import { ContentGridSkeletonList } from './skeletons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface EventsPageProps {
  onBack?: () => void;
  onViewEventDetail?: (id: string) => void;
}

interface Event {
  id: string;
  slug?: string;
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

export function EventsPage({ onBack, onViewEventDetail }: EventsPageProps) {
  const navigate = useNavigate();
  const { user, isAdmin, canModerate } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [events, setEvents] = useState<APIEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const canManageFeatured = isAdmin() || canModerate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim();
        if (selectedFilter !== 'all') {
          // Check if it's a type filter
          if (['online', 'in-person', 'hybrid'].includes(selectedFilter)) {
            params.type = selectedFilter;
          } else {
            // Otherwise it's a category filter
            params.category = selectedFilter;
          }
        }
        
        const response = await eventsService.getEvents(params);
        setEvents(response.data || response);
      } catch (err: any) {
        setError(err?.message || 'Failed to load events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [debouncedSearchQuery, selectedFilter]);

  const eventsData: Event[] = events.map(e => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    organizer: 'Organizer', // Would need to fetch organizer details
    date: e.date,
    time: e.time,
    location: e.location,
    type: e.type,
    category: e.category,
    attendees: e.attendeeCount,
    maxAttendees: e.maxAttendees,
    image: e.imageUrl || `https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800`,
    tags: [], // Would need to add tags support
    featured: e.featured,
    price: e.price
  }));

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
      
      // Update local state
      setEvents(prev => prev.map(e => 
        e.id === event.id ? { ...e, featured: newFeaturedStatus } : e
      ));
      
      toast.success(newFeaturedStatus ? 'Event featured successfully' : 'Event removed from featured');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update featured status');
      console.error('Error toggling featured:', err);
    } finally {
      setTogglingFeatured(null);
    }
  };

  // Separate type filters and category filters
  const typeFilters = ['all', 'online', 'in-person', 'hybrid'];
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(eventsData.map(e => e.category).filter(Boolean)));
    return uniqueCategories.sort();
  }, [eventsData]);

  const filteredEvents = eventsData;

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
              <optgroup label="Type">
                {typeFilters.map(filter => (
                  <option key={filter} value={filter}>{filter === 'in-person' ? 'In-Person' : filter}</option>
                ))}
              </optgroup>
              {categories.length > 0 && (
                <optgroup label="Category">
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Loading State */}
      {loading && (
        <ContentGridSkeletonList count={6} />
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-red-300 dark:text-red-700 mb-4" />
          <p className="text-red-500 dark:text-red-400 mb-2">Failed to load events</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Featured Events */}
      {!loading && !error && filteredEvents.filter(e => e.featured).length > 0 && selectedFilter === 'all' && !debouncedSearchQuery && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={20} className="text-yellow-500" />
            <h2 className="text-lg font-bold">Featured Events</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEvents.filter(e => e.featured).map(event => (
              <GlassCard 
                key={event.id} 
                className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
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
                    {canManageFeatured && (
                      <button
                        onClick={(e) => handleToggleFeatured(e, event)}
                        disabled={togglingFeatured === event.id}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all shadow-md"
                        title="Remove from featured"
                      >
                        {togglingFeatured === event.id ? (
                          <Loader2 size={12} className="animate-spin text-red-500" />
                        ) : (
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        )}
                      </button>
                    )}
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
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {event.tags.map(tag => {
                        const tagName = typeof tag === 'string' ? tag : (tag.name || tag.slug || '');
                        const tagKey = typeof tag === 'string' ? tag : (tag.id || tag.slug || tagName);
                        return (
                          <span key={tagKey} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            #{tagName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <Button 
                    variant="primary" 
                    className="w-full text-sm py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
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
      {!loading && !error && (
      <div>
        {filteredEvents.filter(e => e.featured).length > 0 && selectedFilter === 'all' && !debouncedSearchQuery && (
          <h2 className="text-lg font-bold mb-3">Upcoming Events</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.filter(e => selectedFilter !== 'all' || debouncedSearchQuery || !e.featured).map(event => (
            <GlassCard 
              key={event.id} 
              className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
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
                <div className="absolute top-2 right-2 flex gap-2">
                  {canManageFeatured && (
                    <button
                      onClick={(e) => handleToggleFeatured(e, event)}
                      disabled={togglingFeatured === event.id}
                      className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all shadow-md"
                      title={event.featured ? "Remove from featured" : "Add to featured"}
                    >
                      {togglingFeatured === event.id ? (
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                      ) : (
                        <Star size={12} className={event.featured ? "text-yellow-500 fill-yellow-500" : "text-gray-400 hover:text-yellow-500"} />
                      )}
                    </button>
                  )}
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
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {event.tags.slice(0, 3).map(tag => {
                      const tagName = typeof tag === 'string' ? tag : (tag.name || tag.slug || '');
                      const tagKey = typeof tag === 'string' ? tag : (tag.id || tag.slug || tagName);
                      return (
                        <span key={tagKey} className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                          #{tagName}
                        </span>
                      );
                    })}
                  </div>
                )}
                <Button 
                  variant="primary" 
                  className="w-full text-xs py-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  Register
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No events found matching your search</p>
        </div>
      )}
    </div>
  );
}
