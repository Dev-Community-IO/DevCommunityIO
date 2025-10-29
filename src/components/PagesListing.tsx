import { Users, TrendingUp, ArrowLeft, Search, Filter, FileText, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState, useEffect } from 'react';
import { pagesService, Page } from '../services/api/pages.service';

interface PagesListingProps {
  onPageClick: (pageId: string) => void;
  onBack?: () => void;
}

export function PagesListing({ onPageClick, onBack }: PagesListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedFilter === 'trending') {
          params.trending = true;
        } else if (selectedFilter !== 'all') {
          params.category = selectedFilter;
        }
        
        const response = await pagesService.getPages(params);
        setPages(response.data || response);
      } catch (err: any) {
        setError(err?.message || 'Failed to load pages');
        console.error('Error fetching pages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [searchQuery, selectedFilter]);

  const allPages = pages.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    logo: p.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.name}`,
    coverImage: p.coverImageUrl || 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    members: p.memberCount,
    category: p.category || 'General',
    trending: p.isTrending
  }));

  const categories = ['all', 'trending', ...Array.from(new Set(allPages.map(page => page.category)))];

  const filteredPages = allPages;

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
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md">
              <FileText size={24} className="text-white" strokeWidth={2.5} />
            </div>
            Pages
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Discover and join communities that match your interests
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Filter Dropdown */}
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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading pages...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-red-300 dark:text-red-700 mb-4" />
          <p className="text-red-500 dark:text-red-400 mb-2">Failed to load pages</p>
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

      {/* Pages Grid */}
      {!loading && !error && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPages.length > 0 ? filteredPages.map(page => (
          <div
            key={page.id}
            className="cursor-pointer group pt-8"
            onClick={() => onPageClick(page.id)}
          >
            <GlassCard className="relative overflow-visible hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              {/* Logo - Positioned absolutely above the card */}
              <div className="absolute -top-8 left-4 z-20">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-white dark:border-gray-900 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <img
                    src={page.logo}
                    alt={page.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Compact Cover Image */}
              <div className="relative h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden rounded-t-2xl">
                <img
                  src={page.coverImage}
                  alt={page.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                {page.trending && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500/90 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1">
                      <TrendingUp size={12} />
                      Trending
                    </Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 pt-2">
                <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {page.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {page.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Users size={14} />
                    <span>{page.members.toLocaleString()} members</span>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {page.category}
                  </Badge>
                </div>
              </div>
            </GlassCard>
          </div>
        )) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No pages found matching your search
          </div>
        )}
      </div>
      )}
    </div>
  );
}
