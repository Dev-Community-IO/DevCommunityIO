import { Users, TrendingUp, ArrowLeft, Search, Filter, FileText, Loader2, Building2, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState, useEffect, useMemo } from 'react';
import { pagesService, Page } from '../services/api/pages.service';
import { useNavigate } from 'react-router-dom';

interface PagesListingProps {
  onPageClick?: (pageId: string) => void;
  onBack?: () => void;
}

// Utility function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function PagesListing({ onPageClick, onBack }: PagesListingProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const PAGES_PER_PAGE = 9;

  // Shuffle pages randomly when they change
  const shuffledPages = useMemo(() => {
    return shuffleArray(pages);
  }, [pages]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        setError(null);
        setCurrentPage(1);
        
        const params: any = {
          page: 1,
          limit: PAGES_PER_PAGE,
        };
        if (searchQuery) params.search = searchQuery;
        if (selectedFilter === 'trending') {
          params.trending = true;
        } else if (selectedFilter !== 'all') {
          params.category = selectedFilter;
        }
        
        const response = await pagesService.getPages(params);
        const pagesData = response.data || [];
        const meta = response.meta || {};
        
        setPages(pagesData);
        setHasMore(meta.currentPage < meta.lastPage);
        setTotal(meta.total || 0);
      } catch (err: any) {
        setError(err?.message || 'Failed to load pages');
        console.error('Error fetching pages:', err);
        setPages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [searchQuery, selectedFilter]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      
      const params: any = {
        page: nextPage,
        limit: PAGES_PER_PAGE,
      };
      if (searchQuery) params.search = searchQuery;
      if (selectedFilter === 'trending') {
        params.trending = true;
      } else if (selectedFilter !== 'all') {
        params.category = selectedFilter;
      }
      
      const response = await pagesService.getPages(params);
      const pagesData = response.data || [];
      const meta = response.meta || {};
      
      setPages(prev => [...prev, ...pagesData]);
      setCurrentPage(nextPage);
      setHasMore(meta.currentPage < meta.lastPage);
    } catch (err: any) {
      console.error('Error loading more pages:', err);
      setError(err?.message || 'Failed to load more pages');
    } finally {
      setLoadingMore(false);
    }
  };

  const categories = ['all', 'trending', ...Array.from(new Set(pages.map(page => page.category).filter(Boolean)))];

  const handlePageClick = (page: Page) => {
    if (page.slug) {
      navigate(`/pages/${page.slug}`);
    } else if (onPageClick) {
      onPageClick(page.id);
    }
  };

  const getDefaultCover = () => {
    const gradients = [
      'from-blue-500 via-purple-500 to-pink-500',
      'from-cyan-500 via-blue-500 to-indigo-500',
      'from-emerald-500 via-teal-500 to-cyan-500',
      'from-orange-500 via-red-500 to-pink-500',
      'from-violet-500 via-purple-500 to-fuchsia-500',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  if (loading && pages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading communities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl shadow-lg">
                <Building2 size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent">
                Communities
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-14">
              Discover and join communities that match your interests
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400 flex-shrink-0" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all capitalize text-sm min-w-[140px]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'trending' ? '🔥 Trending' : (cat || '').charAt(0).toUpperCase() + (cat || '').slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Error State */}
      {error && !loading && (
        <GlassCard className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <FileText size={32} className="text-red-500" />
          </div>
          <p className="text-red-500 dark:text-red-400 mb-2 font-semibold">Failed to load communities</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </GlassCard>
      )}

      {/* Pages Grid */}
      {!loading && !error && (
        <>
          {shuffledPages.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {shuffledPages.map((page) => {
                  const coverGradient = getDefaultCover();
                  const logoUrl = page.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${page.name}`;
                  const coverUrl = page.coverImageUrl || '';
                  
                  return (
                    <div
                      key={page.id}
                      onClick={() => handlePageClick(page)}
                      className="group cursor-pointer"
                    >
                      <GlassCard className="relative overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-gray-200 dark:border-gray-800">
                        {/* Cover Image */}
                        <div className={`relative h-28 bg-gradient-to-br ${coverGradient} overflow-hidden rounded-t-xl`}>
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={page.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                          
                          {/* Trending Badge */}
                          {page.isTrending && (
                            <div className="absolute top-2 right-2 z-10">
                              <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1 shadow-md px-2 py-0.5">
                                <TrendingUp size={10} />
                                Trending
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Logo Overlay - positioned outside cover image to avoid clipping */}
                        <div className="relative -mt-8 ml-4 z-10">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border-[3px] border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <img
                              src={logoUrl}
                              alt={page.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 pt-10 flex-1 flex flex-col">
                          <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1 mb-2">
                            {page.name}
                          </h3>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1 leading-relaxed">
                            {page.description || 'No description available'}
                          </p>

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Users size={13} className="flex-shrink-0" />
                              <span className="font-medium">{page.memberCount?.toLocaleString() || 0}</span>
                              <span className="hidden sm:inline">members</span>
                            </div>
                            {page.category && (
                              <Badge className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-xs capitalize px-2 py-0.5 border border-gray-200 dark:border-gray-700">
                                {page.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    variant="primary"
                    className="px-6 py-3 rounded-xl font-medium shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More
                        <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Pagination Info */}
              {total > 0 && shuffledPages.length > 0 && (
                <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Showing {shuffledPages.length} of {total} communit{total !== 1 ? 'ies' : 'y'}
                  {hasMore && ` • ${total - shuffledPages.length} more available`}
                </div>
              )}
            </>
          ) : (
            <GlassCard className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Building2 size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No communities found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery 
                  ? `No communities match "${searchQuery}"`
                  : 'Be the first to create a community!'}
              </p>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
