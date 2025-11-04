import { Trophy, Calendar, Users, DollarSign, Clock, ArrowLeft, Search, Filter, ExternalLink, Award, Star, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState, useEffect, useMemo } from 'react';
import { hackathonsService, Hackathon } from '../services/api/hackathons.service';
import { ContentGridSkeletonList } from './skeletons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

interface HackathonsPageProps {
  onBack?: () => void;
  onViewHackathonDetail?: (id: string) => void;
}

export function HackathonsPage({ onBack, onViewHackathonDetail }: HackathonsPageProps) {
  const navigate = useNavigate();
  const { user, isAdmin, canModerate } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
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
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
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
      } catch (err: any) {
        setError(err?.message || 'Failed to load hackathons');
        console.error('Error fetching hackathons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHackathons();
  }, [debouncedSearchQuery, selectedFilter]);

  const hackathonsData: any[] = hackathons.map(h => ({
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
    image: h.imageUrl || `https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800`,
    tags: h.tracks || [],
    featured: h.featured
  }));

  const handleHackathonClick = (hackathon: any) => {
    if (hackathon.slug) {
      navigate(`/hackathons/${hackathon.slug}`);
    } else if (onViewHackathonDetail) {
      onViewHackathonDetail(hackathon.id);
    } else {
      navigate(`/hackathons/${hackathon.id}`);
    }
  };

  const handleToggleFeatured = async (e: React.MouseEvent, hackathon: any) => {
    e.stopPropagation();
    if (!canManageFeatured) return;

    try {
      setTogglingFeatured(hackathon.id);
      const newFeaturedStatus = !hackathon.featured;
      await hackathonsService.updateHackathon(hackathon.id, { featured: newFeaturedStatus });
      
      // Update local state
      setHackathons(prev => prev.map(h => 
        h.id === hackathon.id ? { ...h, featured: newFeaturedStatus } : h
      ));
      
      toast.success(newFeaturedStatus ? 'Hackathon featured successfully' : 'Hackathon removed from featured');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update featured status');
      console.error('Error toggling featured:', err);
    } finally {
      setTogglingFeatured(null);
    }
  };

  // Separate status filters and category filters
  const statusFilters = ['all', 'upcoming', 'ongoing', 'ended'];
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(hackathonsData.map(h => h.category).filter(Boolean)));
    return uniqueCategories.sort();
  }, [hackathonsData]);

  const filteredHackathons = hackathonsData;

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      ongoing: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      ended: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
    };
    return styles[status as keyof typeof styles] || styles.upcoming;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Beginner: 'from-green-500 to-emerald-500',
      Intermediate: 'from-yellow-500 to-orange-500',
      Advanced: 'from-red-500 to-pink-500'
    };
    return colors[difficulty as keyof typeof colors] || colors.Intermediate;
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
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-md">
              <Trophy size={24} className="text-white" strokeWidth={2.5} />
            </div>
            Hackathons
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Compete, collaborate, and build amazing projects
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
              placeholder="Search hackathons..."
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
              <optgroup label="Status">
                {statusFilters.map(filter => (
                  <option key={filter} value={filter}>{filter}</option>
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
          <Trophy size={48} className="mx-auto text-red-300 dark:text-red-700 mb-4" />
          <p className="text-red-500 dark:text-red-400 mb-2">Failed to load hackathons</p>
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

      {/* Featured Hackathons */}
      {!loading && !error && filteredHackathons.filter(h => h.featured).length > 0 && selectedFilter === 'all' && !debouncedSearchQuery && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={20} className="text-yellow-500" />
            <h2 className="text-lg font-bold">Featured</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredHackathons.filter(h => h.featured).map(hackathon => (
              <GlassCard 
                key={hackathon.id} 
                className="p-0 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => handleHackathonClick(hackathon)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={hackathon.image}
                    alt={hackathon.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant="gradient" className="text-[10px] px-2 py-1">
                      <Award size={10} className="inline mr-1" />
                      Featured
                    </Badge>
                    {canManageFeatured && (
                      <button
                        onClick={(e) => handleToggleFeatured(e, hackathon)}
                        disabled={togglingFeatured === hackathon.id}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all shadow-md"
                        title="Remove from featured"
                      >
                        {togglingFeatured === hackathon.id ? (
                          <Loader2 size={12} className="animate-spin text-red-500" />
                        ) : (
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(hackathon.status)} capitalize`}>
                      {hackathon.status}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold group-hover:text-blue-500 transition-colors line-clamp-1">
                      {hackathon.title}
                    </h3>
                    <Badge className="text-[10px] px-2 py-0.5 flex-shrink-0">
                      {hackathon.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {hackathon.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <DollarSign size={14} className="text-green-500" />
                      <span className="font-semibold">{hackathon.prize}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Users size={14} className="text-blue-500" />
                      <span className="font-semibold">{hackathon.participants}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Calendar size={14} className="text-purple-500" />
                      <span>{new Date(hackathon.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Clock size={14} className="text-orange-500" />
                      <span>{hackathon.difficulty}</span>
                    </div>
                  </div>
                  {hackathon.tags && hackathon.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                      {hackathon.tags.map((tag: string | any) => {
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
                    onClick={() => handleHackathonClick(hackathon)}
                  >
                    <ExternalLink size={14} className="mr-2" />
                    View Details
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* All Hackathons Grid */}
      {!loading && !error && (
      <div>
        {filteredHackathons.filter(h => h.featured).length > 0 && selectedFilter === 'all' && !debouncedSearchQuery && (
          <h2 className="text-lg font-bold mb-3">All Hackathons</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHackathons.filter(h => selectedFilter !== 'all' || debouncedSearchQuery || !h.featured).map(hackathon => (
            <GlassCard 
              key={hackathon.id} 
              className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              onClick={() => handleHackathonClick(hackathon)}
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={hackathon.image}
                  alt={hackathon.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 left-2">
                  <div className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-semibold ${getStatusBadge(hackathon.status)} capitalize`}>
                    {hackathon.status}
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  {canManageFeatured && (
                    <button
                      onClick={(e) => handleToggleFeatured(e, hackathon)}
                      disabled={togglingFeatured === hackathon.id}
                      className="p-1.5 rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-all shadow-md"
                      title={hackathon.featured ? "Remove from featured" : "Add to featured"}
                    >
                      {togglingFeatured === hackathon.id ? (
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                      ) : (
                        <Star size={12} className={hackathon.featured ? "text-yellow-500 fill-yellow-500" : "text-gray-400 hover:text-yellow-500"} />
                      )}
                    </button>
                  )}
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getDifficultyColor(hackathon.difficulty)}`}></div>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold group-hover:text-blue-500 transition-colors line-clamp-1 flex-1">
                    {hackathon.title}
                  </h3>
                  <Badge className="text-[9px] px-1.5 py-0.5 flex-shrink-0">
                    {hackathon.category}
                  </Badge>
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {hackathon.description}
                </p>
                <div className="grid grid-cols-2 gap-1.5 mb-2 text-[10px]">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <DollarSign size={12} className="text-green-500" />
                    <span className="font-semibold">{hackathon.prize}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                    <Users size={12} className="text-blue-500" />
                    <span className="font-semibold">{hackathon.participants}</span>
                  </div>
                </div>
                {hackathon.tags && hackathon.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {hackathon.tags.slice(0, 3).map((tag: string | any) => {
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
                  onClick={() => handleHackathonClick(hackathon)}
                >
                  View Details
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
      )}

      {!loading && !error && filteredHackathons.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hackathons found matching your search</p>
        </div>
      )}
    </div>
  );
}
