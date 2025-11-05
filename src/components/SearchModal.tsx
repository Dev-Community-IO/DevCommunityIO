import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Clock, X, Users, FileText, Hash, Sparkles, ArrowRight, Loader2, Command } from 'lucide-react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { Post, User } from '../types';
import { useNavigate } from 'react-router-dom';
import searchService from '../services/api/search.service';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostClick: (post: Post) => void;
}

export function SearchModal({ isOpen, onClose, onPostClick }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ posts: Post[]; users: User[]; pages?: any[] }>({ posts: [], users: [], pages: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'users' | 'pages'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Save recent searches
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ posts: [], users: [], pages: [] });
      setIsSearching(false);
      return;
    }

    const performSearch = async () => {
      try {
        setIsSearching(true);
        console.log('🔍 SearchModal: Performing search:', { query: query.trim(), activeFilter, length: query.trim().length });
        
        const searchResults = await searchService.search(query.trim(), { 
          limit: activeFilter === 'all' ? 10 : 20,
          type: activeFilter === 'all' ? 'all' : activeFilter
        });
        
        console.log('✅ SearchModal: Search results received:', {
          posts: searchResults.posts?.length || 0,
          users: searchResults.users?.length || 0,
          pages: searchResults.pages?.length || 0,
          fullResults: searchResults
        });
        
        const finalResults = {
          posts: searchResults.posts || [],
          users: searchResults.users || [],
          pages: searchResults.pages || []
        };
        
        setResults(finalResults);
        
        console.log('📊 SearchModal: Results state set:', {
          postsCount: finalResults.posts.length,
          usersCount: finalResults.users.length,
          pagesCount: finalResults.pages.length,
          hasResults: finalResults.posts.length > 0 || finalResults.users.length > 0 || (finalResults.pages && finalResults.pages.length > 0)
        });
      } catch (err: any) {
        console.error('❌ SearchModal: Search error:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          response: err.response?.data,
          isNetworkError: err.isNetworkError
        });
        setResults({ posts: [], users: [], pages: [] });
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, activeFilter]);

  const handlePostClick = (post: Post) => {
    saveRecentSearch(query);
    setQuery('');
    onClose();
    onPostClick(post);
  };

  const handleUserClick = (user: User) => {
    saveRecentSearch(query);
    setQuery('');
    onClose();
    navigate(`/profile/${user.username}`);
  };

  const handlePageClick = (page: any) => {
    saveRecentSearch(query);
    setQuery('');
    onClose();
    if (page.slug) {
      navigate(`/pages/${page.slug}`);
    }
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    inputRef.current?.focus();
  };

  const timeAgo = (date?: Date | string) => {
    if (!date) return 'recently';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'recently';
      const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'recently';
    }
  };

  const hasResults = results.posts.length > 0 || results.users.length > 0 || (results.pages && results.pages.length > 0);
  
  // Debug logging for mobile - must be before early return to follow Rules of Hooks
  useEffect(() => {
    if (isOpen && window.innerWidth < 768 && query.length >= 2) {
      console.log('📱 SearchModal: Render state:', {
        query,
        queryLength: query.length,
        hasResults,
        postsCount: results.posts.length,
        usersCount: results.users.length,
        pagesCount: results.pages?.length || 0,
        isSearching,
        willShowResults: query.length >= 2 && hasResults && !isSearching,
        willShowNoResults: query.length >= 2 && !hasResults && !isSearching
      });
    }
  }, [isOpen, query, hasResults, results, isSearching]);

  if (!isOpen) return null;

  // Render modal via portal to ensure it's above everything, especially on mobile
  const modalContent = (
    <div className="fixed inset-0 z-[99999] animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative h-full w-full flex flex-col bg-white dark:bg-gray-900 animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <div className="relative flex items-center gap-3 px-5 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-500/20 transition-all duration-300">
                  <Search className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={22} />
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search posts, users, pages, tags..."
                    className="flex-1 bg-transparent border-0 outline-none text-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                    >
                      <X size={18} className="text-gray-400" />
                    </button>
                  )}
                  
                  {/* Keyboard Shortcut */}
                  <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    <Command size={12} />
                    <span>K</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 flex-shrink-0"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            {query.length >= 2 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide">
                {(['all', 'posts', 'users', 'pages'] as const).map((filter) => {
                  const icons = {
                    all: Sparkles,
                    posts: FileText,
                    users: Users,
                    pages: Hash
                  };
                  const Icon = icons[filter];
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="capitalize">{filter}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            {isSearching ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Searching...</span>
              </div>
            ) : query.length === 0 || query.length === 1 ? (
              /* Recent Searches & Suggestions */
              <div className="space-y-8">
                {query.length === 1 && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 Type at least 2 characters to see search results
                    </p>
                  </div>
                )}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={16} />
                        Recent Searches
                      </h3>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('recentSearches');
                        }}
                        className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRecentSearchClick(search)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group text-left"
                        >
                          <Clock size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{search}</span>
                          <ArrowRight size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : query.length >= 2 && hasResults ? (
              /* Search Results */
              <div className="space-y-8">
                {/* Debug: Show when results should be visible */}
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-sm rounded-xl mb-4 border border-blue-300 dark:border-blue-700">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Search Results Found</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Posts: {results.posts.length} | Users: {results.users.length} | Pages: {results.pages?.length || 0} | Filter: {activeFilter}
                  </p>
                </div>
                {results.posts.length > 0 && (activeFilter === 'all' || activeFilter === 'posts') && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText size={20} className="text-blue-500" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Posts</h3>
                      <Badge variant="default" className="px-2.5 py-1">{results.posts.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {results.posts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => handlePostClick(post)}
                          className="w-full text-left p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer"
                        >
                          <div className="flex items-start gap-4">
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (post.author?.username) {
                                  navigate(`/profile/${post.author.username}`);
                                }
                              }}
                              className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                            >
                              <Avatar src={post.author?.avatar || post.author?.avatarUrl || ''} alt={post.author?.username || 'User'} size="md" className="ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 
                                onClick={() => handlePostClick(post)}
                                className="text-base font-bold line-clamp-2 mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                              >
                                {post.title}
                              </h4>
                              <p 
                                onClick={() => handlePostClick(post)}
                                className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                              >
                                {post.content}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (post.author?.username) {
                                      navigate(`/profile/${post.author.username}`);
                                    }
                                  }}
                                  className="font-medium cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {post.author?.username}
                                </span>
                                {(post.timestamp || post.createdAt || post.publishedAt) && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} />
                                      {timeAgo(post.timestamp || post.createdAt || post.publishedAt)}
                                    </span>
                                  </>
                                )}
                                {(post.commentCount || 0) > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{post.commentCount} comments</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.users.length > 0 && (activeFilter === 'all' || activeFilter === 'users') && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users size={20} className="text-purple-500" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Users</h3>
                      <Badge variant="default" className="px-2.5 py-1">{results.users.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleUserClick(user)}
                          className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer"
                        >
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserClick(user);
                            }}
                            className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                          >
                            <Avatar src={user.avatar || user.avatarUrl || ''} alt={user.username || 'User'} size="md" className="ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 
                                onClick={() => handleUserClick(user)}
                                className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                              >
                                {user.username}
                              </h4>
                              {user.isVerified && <VerifiedBadge size={14} />}
                            </div>
                            <p 
                              onClick={() => handleUserClick(user)}
                              className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                            >
                              {user.walletAddress}
                            </p>
                            <p 
                              onClick={() => handleUserClick(user)}
                              className="text-xs text-gray-500 dark:text-gray-400 mt-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                            >
                              {user.reputation || 0} reputation
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.pages && results.pages.length > 0 && (activeFilter === 'all' || activeFilter === 'pages') && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Hash size={20} className="text-green-500" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pages</h3>
                      <Badge variant="default" className="px-2.5 py-1">{results.pages.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.pages.map((page) => (
                        <button
                          key={page.id}
                          onClick={() => handlePageClick(page)}
                          className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer"
                        >
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePageClick(page);
                            }}
                            className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                          >
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all">
                              <img 
                                src={page.logo || page.logoUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(page.name)}`}
                                alt={page.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              onClick={() => handlePageClick(page)}
                              className="text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 cursor-pointer"
                            >
                              {page.name}
                            </h4>
                            <p 
                              onClick={() => handlePageClick(page)}
                              className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                            >
                              {page.description || page.category || 'Page'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Fallback: Show message if no results match current filter */}
                {!results.posts.length && !results.users.length && (!results.pages || !results.pages.length) && activeFilter !== 'all' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No {activeFilter} found. Try switching filters.
                    </p>
                  </div>
                )}
              </div>
            ) : query.length >= 2 ? (
              /* No Results */
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Try searching with different keywords or check your spelling
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['defi', 'blockchain', 'ethereum'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setQuery(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal outside navbar hierarchy, especially important on mobile
  return createPortal(modalContent, document.body);
}
