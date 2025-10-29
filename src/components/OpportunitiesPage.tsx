import { Briefcase, MapPin, DollarSign, Clock, ArrowLeft, Search, Filter, ExternalLink, Building, TrendingUp, Star, Zap, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState, useEffect } from 'react';
import { opportunitiesService, Opportunity as APIOpportunity } from '../services/api/opportunities.service';
import { ContentGridSkeletonList } from './skeletons';

interface OpportunitiesPageProps {
  onBack?: () => void;
}

interface Opportunity {
  id: string;
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
  tags: string[];
  featured?: boolean;
  remote: boolean;
}

export function OpportunitiesPage({ onBack }: OpportunitiesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [opportunities, setOpportunities] = useState<APIOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedFilter !== 'all' && ['full-time', 'part-time', 'contract', 'internship'].includes(selectedFilter)) {
          params.type = selectedFilter;
        } else if (selectedFilter !== 'all') {
          params.category = selectedFilter;
        }
        
        const response = await opportunitiesService.getOpportunities(params);
        setOpportunities(response.data || response);
      } catch (err: any) {
        setError(err?.message || 'Failed to load opportunities');
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [searchQuery, selectedFilter]);

  const opportunitiesData: Opportunity[] = opportunities.map(o => ({
    id: o.id,
    title: o.title,
    company: o.companyName,
    description: o.description,
    location: o.location,
    type: o.type,
    category: o.category,
    salary: o.salary || 'Competitive',
    experience: o.experience,
    posted: o.postedAt ? new Date(o.postedAt).toLocaleDateString() : 'Recently',
    logo: o.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${o.companyName}`,
    tags: [],
    featured: o.featured,
    remote: o.remote
  }));

  const categories = ['all', ...Array.from(new Set(opportunitiesData.map(o => o.category)))];

  const filteredOpportunities = opportunitiesData;

  const getTypeBadge = (type: string) => {
    const styles = {
      'full-time': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'part-time': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'contract': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      'internship': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
    };
    return styles[type as keyof typeof styles] || styles['full-time'];
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
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md">
              <Briefcase size={24} className="text-white" strokeWidth={2.5} />
            </div>
            Opportunities
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Find your next career opportunity in Web3
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
              placeholder="Search opportunities..."
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

      {/* Loading State */}
      {loading && (
        <ContentGridSkeletonList count={6} />
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-red-300 dark:text-red-700 mb-4" />
          <p className="text-red-500 dark:text-red-400 mb-2">Failed to load opportunities</p>
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

      {/* Featured Opportunities */}
      {!loading && !error && filteredOpportunities.filter(o => o.featured).length > 0 && selectedFilter === 'all' && !searchQuery && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={20} className="text-yellow-500" />
            <h2 className="text-lg font-bold">Featured Opportunities</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOpportunities.filter(o => o.featured).map(opp => (
              <GlassCard key={opp.id} className="p-4 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                    <img
                      src={opp.logo}
                      alt={opp.company}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold group-hover:text-blue-500 transition-colors line-clamp-1">
                          {opp.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{opp.company}</span>
                          {opp.remote && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
                              <Zap size={8} className="inline mr-0.5" />
                              Remote
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="gradient" className="text-[10px] px-2 py-1 flex-shrink-0">
                        <Star size={10} className="inline mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {opp.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="truncate">{opp.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <DollarSign size={14} className="text-green-500" />
                        <span className="font-semibold">{opp.salary}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Building size={14} className="text-purple-500" />
                        <span className={`capitalize ${getTypeBadge(opp.type)} px-2 py-0.5 rounded text-[10px] font-semibold`}>
                          {opp.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Clock size={14} className="text-orange-500" />
                        <span>{opp.posted}</span>
                      </div>
                    </div>
                    {opp.tags && opp.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {opp.tags.map(tag => {
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
                    <Button variant="primary" className="w-full text-sm py-2">
                      <ExternalLink size={14} className="mr-2" />
                      Apply Now
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* All Opportunities */}
      {!loading && !error && (
      <div>
        {filteredOpportunities.filter(o => o.featured).length > 0 && selectedFilter === 'all' && !searchQuery && (
          <h2 className="text-lg font-bold mb-3">All Opportunities</h2>
        )}
        <div className="space-y-3">
          {filteredOpportunities.filter(o => selectedFilter !== 'all' || searchQuery || !o.featured).map(opp => (
            <GlassCard key={opp.id} className="p-4 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  <img
                    src={opp.logo}
                    alt={opp.company}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold group-hover:text-blue-500 transition-colors line-clamp-1">
                        {opp.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{opp.company}</span>
                        {opp.remote && (
                          <Badge variant="secondary" className="text-[8px] px-1.5 py-0.5">
                            Remote
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[9px] px-2 py-0.5 flex-shrink-0">
                      {opp.category}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                    {opp.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-600 dark:text-gray-400 mb-2">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-blue-500" />
                      <span>{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} className="text-green-500" />
                      <span className="font-semibold">{opp.salary}</span>
                    </div>
                    <div className={`capitalize ${getTypeBadge(opp.type)} px-2 py-0.5 rounded font-semibold`}>
                      {opp.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-orange-500" />
                      <span>{opp.posted}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {opp.tags && opp.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {opp.tags.slice(0, 3).map(tag => {
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
                    <Button variant="primary" className="text-xs py-1 px-3 ml-2">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
      )}

      {!loading && !error && filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No opportunities found matching your search</p>
        </div>
      )}
    </div>
  );
}
