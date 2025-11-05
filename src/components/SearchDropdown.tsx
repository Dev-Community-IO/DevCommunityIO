import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Clock, TrendingUp, X, Users, FileText, Hash, Sparkles, ArrowRight, Command, Loader2, Trophy, Calendar, Briefcase } from 'lucide-react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { VerifiedBadge } from './VerifiedBadge';
import { Post, User } from '../types';
import { useNavigate } from 'react-router-dom';
import searchService from '../services/api/search.service';

interface SearchDropdownProps {
  onPostClick: (post: Post) => void;
}

export function SearchDropdown({ onPostClick }: SearchDropdownProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<{ posts: Post[]; users: User[]; pages?: any[]; hackathons?: any[]; events?: any[]; opportunities?: any[] }>({ posts: [], users: [], pages: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'users' | 'pages'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Save recent searches
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    // Handle both mouse and touch events for mobile
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Clear results if query is too short
    if (query.trim().length < 2) {
      setResults({ posts: [], users: [], pages: [], hackathons: [], events: [], opportunities: [] });
      setIsSearching(false);
      // On mobile, keep dropdown open if there's any query. On desktop, only open when typing
      if (query.length > 0) {
        setIsOpen(true);
      } else if (!isMobile) {
        // Desktop: close dropdown when query is cleared
        setIsOpen(false);
      }
      return;
    }

    const performSearch = async () => {
      try {
        setIsSearching(true);
        
        // Debug logging for mobile
        if (isMobile) {
          console.log('🔍 Mobile search triggered:', { query: query.trim(), activeFilter, length: query.trim().length });
        }
        
        const searchResults = await searchService.search(query.trim(), { 
          limit: activeFilter === 'all' ? 5 : 10,
          type: activeFilter === 'all' ? 'all' : activeFilter
        });
        
        // Debug logging for mobile
        if (isMobile) {
          console.log('✅ Mobile search results:', {
            posts: searchResults.posts?.length || 0,
            users: searchResults.users?.length || 0,
            pages: searchResults.pages?.length || 0,
            hackathons: searchResults.hackathons?.length || 0,
            events: searchResults.events?.length || 0,
            opportunities: searchResults.opportunities?.length || 0,
            fullResults: searchResults
          });
        }
        
        // Ensure we always set results, even if empty
        const finalResults = {
          posts: searchResults.posts || [],
          users: searchResults.users || [],
          pages: searchResults.pages || [],
          hackathons: searchResults.hackathons || [],
          events: searchResults.events || [],
          opportunities: searchResults.opportunities || []
        };
        
        setResults(finalResults);
        
        // Always open dropdown after search completes (success or empty results)
        setIsOpen(true);
        
        // Debug: Check if results are actually set
        if (isMobile) {
          console.log('📊 Results state after set:', {
            hasPosts: finalResults.posts.length > 0,
            hasUsers: finalResults.users.length > 0,
            hasPages: finalResults.pages.length > 0,
            hasHackathons: finalResults.hackathons.length > 0,
            hasEvents: finalResults.events.length > 0,
            hasOpportunities: finalResults.opportunities.length > 0,
            isOpen: true
          });
        }
      } catch (err: any) {
        console.error('❌ Search error:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          response: err.response?.data,
          isNetworkError: err.isNetworkError
        });
        
        // Set empty results on error
        setResults({ 
          posts: [], 
          users: [], 
          pages: [], 
          hackathons: [], 
          events: [], 
          opportunities: [] 
        });
        // Still open dropdown to show "no results" message
        setIsOpen(true);
      } finally {
        setIsSearching(false);
      }
    };

    // Use shorter debounce on mobile for better responsiveness
    const debounceDelay = isMobile ? 200 : 300;
    
    const timeoutId = setTimeout(performSearch, debounceDelay);
    return () => clearTimeout(timeoutId);
  }, [query, activeFilter, isMobile]);

  const handlePostClick = (post: Post) => {
    saveRecentSearch(query);
    setQuery('');
    setIsOpen(false);
    setIsFocused(false);
    
    // Navigate based on post category
    if (post.category === 'hackathon' && post.slug) {
      navigate(`/hackathons/${post.slug}`);
    } else if (post.category === 'event' && post.slug) {
      navigate(`/events/${post.slug}`);
    } else if (post.category === 'opportunity' && post.slug) {
      navigate(`/opportunities/${post.slug}`);
    } else if (post.slug) {
      // Regular post
      navigate(`/post/${post.slug}`);
    } else {
      // Fallback: try to use onPostClick if slug is missing
      onPostClick(post);
    }
  };

  const handleUserClick = (user: User) => {
    saveRecentSearch(query);
    setQuery('');
    setIsOpen(false);
    setIsFocused(false);
    navigate(`/profile/${user.username}`);
  };

  const handlePageClick = (page: any) => {
    saveRecentSearch(query);
    setQuery('');
    setIsOpen(false);
    setIsFocused(false);
    if (page.slug) {
      navigate(`/pages/${page.slug}`);
    }
  };

  const handleHackathonClick = (hackathon: any) => {
    saveRecentSearch(query);
    setQuery('');
    setIsOpen(false);
    setIsFocused(false);
    if (hackathon.slug || hackathon.id) {
      navigate(`/hackathons/${hackathon.slug || hackathon.id}`);
    }
  };

  const handleEventClick = (event: any) => {
    saveRecentSearch(query);
    setQuery('');
    setIsOpen(false);
    setIsFocused(false);
    if (event.slug || event.id) {
      navigate(`/events/${event.slug || event.id}`);
    }
  };

  const handleOpportunityClick = (opportunity: any) => {
    saveRecentSearch(query);
    setQuery('');
    setIsOpen(false);
    setIsFocused(false);
    if (opportunity.slug || opportunity.id) {
      navigate(`/opportunities/${opportunity.slug || opportunity.id}`);
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
      if (seconds < 60) return `${seconds}s`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h`;
      const days = Math.floor(hours / 24);
      return `${days}d`;
    } catch {
      return 'recently';
    }
  };

  const hasResults = results.posts.length > 0 || results.users.length > 0 || (results.pages && results.pages.length > 0) || (results.hackathons && results.hackathons.length > 0) || (results.events && results.events.length > 0) || (results.opportunities && results.opportunities.length > 0);
  
  // Debug logging for mobile
  useEffect(() => {
    if (isMobile && query.length >= 2) {
      console.log('📱 Mobile dropdown render state:', {
        query,
        queryLength: query.length,
        hasResults,
        postsCount: results.posts.length,
        usersCount: results.users.length,
        pagesCount: results.pages?.length || 0,
        hackathonsCount: results.hackathons?.length || 0,
        eventsCount: results.events?.length || 0,
        opportunitiesCount: results.opportunities?.length || 0,
        isOpen,
        isSearching,
        showSuggestions: query.length === 0 || (query.length === 1) || (!hasResults && query.length >= 2 && !isSearching),
        willShowResults: query.length >= 2 && hasResults && !isSearching
      });
    }
  }, [query, hasResults, results, isOpen, isSearching, isMobile]);
  
  // Show suggestions when:
  // 1. Query is empty (show recent searches and trending)
  // 2. Query is 1 character (show suggestions while waiting for 2+ chars)
  // 3. Query is 2+ chars but no results and not searching (show "no results")
  const showSuggestions = query.length === 0 || (query.length === 1) || (!hasResults && query.length >= 2 && !isSearching);

  // Render dropdown content (reusable for both portal and non-portal versions)
  const renderDropdownContent = () => (
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-3">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-blue-500" />
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Searching...</p>
                </div>
              ) : query.length === 0 || query.length === 1 ? (
                /* Recent Searches & Suggestions */
                <div className="p-3 sm:p-4">
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                          <Clock size={14} />
                          Recent Searches
                        </h3>
                        <button
                          onClick={() => {
                            setRecentSearches([]);
                            localStorage.removeItem('recentSearches');
                          }}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleRecentSearchClick(search)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all group touch-manipulation"
                          >
                            <Clock size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300">{search}</span>
                            <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {query.length === 1 && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        💡 Type at least 2 characters to see search results
                      </p>
                    </div>
                  )}
                  
          {/* Trending Searches - Hidden on desktop (md and up) */}
          <div className="md:hidden">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <TrendingUp size={14} />
                      Trending Searches
                    </h3>
                    <div className="space-y-1">
                      {['defi', 'blockchain', 'ethereum', 'web3', 'nft'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setQuery(suggestion);
                            inputRef.current?.focus();
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all group touch-manipulation"
                        >
                          <TrendingUp size={16} className="text-orange-400" />
                          <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{suggestion}</span>
                          <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : query.length >= 2 && hasResults && !isSearching ? (
                /* Search Results */
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 pb-4 sm:pb-6">
                  {results.posts.length > 0 && (activeFilter === 'all' || activeFilter === 'posts') && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <FileText size={16} className="text-blue-500" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Posts</h3>
                        <Badge variant="default" className="text-xs px-2 py-0.5">{results.posts.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {results.posts.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => handlePostClick(post)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all group cursor-pointer touch-manipulation"
                          >
                            <div className="flex items-start gap-3">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (post.author?.username) {
                                    navigate(`/profile/${post.author.username}`);
                                  }
                                }}
                                className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                              >
                                <Avatar src={post.author?.avatar || post.author?.avatarUrl || ''} alt={post.author?.username || 'User'} size="sm" className="ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 
                                  onClick={() => handlePostClick(post)}
                                  className="text-sm font-bold line-clamp-1 mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                                >
                                  {post.title}
                                </h4>
                                <p 
                                  onClick={() => handlePostClick(post)}
                                  className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                >
                                  {post.content}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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
                                        <Clock size={10} />
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
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <Users size={16} className="text-purple-500" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Users</h3>
                        <Badge variant="default" className="text-xs px-2 py-0.5">{results.users.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {results.users.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleUserClick(user)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all group cursor-pointer touch-manipulation"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserClick(user);
                                }}
                                className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                              >
                                <Avatar src={user.avatar || user.avatarUrl || ''} alt={user.username || 'User'} size="sm" className="ring-2 ring-gray-200 dark:ring-gray-700 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 
                                    onClick={() => handleUserClick(user)}
                                    className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                                  >
                                    {user.username}
                                  </h4>
                                  {user.isVerified && <VerifiedBadge size={12} />}
                                </div>
                                <p 
                                  onClick={() => handleUserClick(user)}
                                  className="text-xs text-gray-600 dark:text-gray-400 font-mono cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                >
                                  {user.walletAddress} • {user.reputation || 0} rep
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.pages && results.pages.length > 0 && (activeFilter === 'all' || activeFilter === 'pages') && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <Hash size={16} className="text-green-500" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Pages</h3>
                        <Badge variant="default" className="text-xs px-2 py-0.5">{results.pages.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {results.pages.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => handlePageClick(page)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all group cursor-pointer touch-manipulation"
                          >
                            <div className="flex items-center gap-3">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePageClick(page);
                                }}
                                className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                              >
                                <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all">
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
                                  className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                                >
                                  {page.name}
                                </h4>
                                <p 
                                  onClick={() => handlePageClick(page)}
                                  className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                >
                                  {page.description || page.category || 'Page'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.hackathons && results.hackathons.length > 0 && (activeFilter === 'all' || activeFilter === 'posts') && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <Trophy size={16} className="text-purple-500" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Hackathons</h3>
                        <Badge variant="default" className="text-xs px-2 py-0.5">{results.hackathons.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {results.hackathons.map((hackathon) => (
                          <button
                            key={hackathon.id}
                            onClick={() => handleHackathonClick(hackathon)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all group cursor-pointer touch-manipulation"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Trophy size={18} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold line-clamp-1 mb-1 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {hackathon.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                                  {hackathon.description || 'Hackathon'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  {hackathon.startDate && (
                                    <>
                                      <Clock size={10} />
                                      <span>{timeAgo(hackathon.startDate)}</span>
                                    </>
                                  )}
                                  {hackathon.prize && (
                                    <>
                                      <span>•</span>
                                      <span>Prize: {hackathon.prize}</span>
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

                  {results.events && results.events.length > 0 && (activeFilter === 'all' || activeFilter === 'posts') && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <Calendar size={16} className="text-blue-500" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Events</h3>
                        <Badge variant="default" className="text-xs px-2 py-0.5">{results.events.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {results.events.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => handleEventClick(event)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all group cursor-pointer touch-manipulation"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Calendar size={18} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold line-clamp-1 mb-1 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {event.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                                  {event.description || 'Event'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  {event.eventDate && (
                                    <>
                                      <Clock size={10} />
                                      <span>{timeAgo(event.eventDate)}</span>
                                    </>
                                  )}
                                  {event.location && (
                                    <>
                                      <span>•</span>
                                      <span>{event.location}</span>
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

                  {results.opportunities && results.opportunities.length > 0 && (activeFilter === 'all' || activeFilter === 'posts') && (
                    <div>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <Briefcase size={16} className="text-green-500" />
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Opportunities</h3>
                        <Badge variant="default" className="text-xs px-2 py-0.5">{results.opportunities.length}</Badge>
                      </div>
                      <div className="space-y-1">
                        {results.opportunities.map((opportunity) => (
                          <button
                            key={opportunity.id}
                            onClick={() => handleOpportunityClick(opportunity)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all group cursor-pointer touch-manipulation"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <Briefcase size={18} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold line-clamp-1 mb-1 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                  {opportunity.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                                  {opportunity.description || 'Opportunity'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  {opportunity.companyName && (
                                    <>
                                      <span>{opportunity.companyName}</span>
                                    </>
                                  )}
                                  {opportunity.salary && (
                                    <>
                                      <span>•</span>
                                      <span>{opportunity.salary}</span>
                                    </>
                                  )}
                                  {opportunity.remote && (
                                    <>
                                      <span>•</span>
                                      <span>Remote</span>
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
                </div>
              ) : (
                /* No Results */
                <div className="p-8 sm:p-12 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Search size={20} className="sm:w-6 sm:h-6 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
                    Try searching with different keywords or check your spelling
                  </p>
                </div>
              )}
    </div>
  );

  // Prevent body scroll on mobile when dropdown is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      // Calculate dropdown top position for mobile
      if (inputContainerRef.current) {
        const rect = inputContainerRef.current.getBoundingClientRect();
        setDropdownTop(rect.bottom + 8);
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  // Update dropdown position on scroll/resize when open on mobile
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const updatePosition = () => {
      if (inputContainerRef.current) {
        const rect = inputContainerRef.current.getBoundingClientRect();
        setDropdownTop(rect.bottom + 8);
      }
    };

    updatePosition(); // Initial position
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, isMobile]);

  return (
    <div className={`flex-1 relative max-w-4xl mx-auto ${isOpen ? 'z-[9999] md:z-auto' : ''}`} ref={dropdownRef}>
      {/* Mobile Backdrop - only show on mobile when dropdown is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] md:hidden"
          onClick={(e) => {
            // Only close if clicking directly on backdrop, not on dropdown content
            if (e.target === e.currentTarget) {
            setIsOpen(false);
            setIsFocused(false);
            inputRef.current?.blur();
            }
          }}
          onTouchStart={(e) => {
            // Only close if touching directly on backdrop, not on dropdown content
            if (e.target === e.currentTarget) {
              setIsOpen(false);
              setIsFocused(false);
              inputRef.current?.blur();
            }
          }}
        />
      )}

      {/* Search Input */}
      <div ref={inputContainerRef} className={`relative transition-all duration-300 ${isOpen ? 'z-[10000] md:z-auto' : ''} ${
        isFocused || isOpen ? 'scale-[1.02] md:scale-[1.02]' : ''
      }`}>
        <div className={`relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 transition-all duration-300 ${
          isFocused || isOpen 
            ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20 bg-white dark:bg-gray-900' 
            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
        }`}>
          <Search className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={18} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              const newQuery = e.target.value;
              setQuery(newQuery);
              // Open dropdown when typing starts (both mobile and desktop)
              if (newQuery.length > 0) {
                setIsFocused(true);
                setIsOpen(true);
              } else {
                // On desktop, close when query is cleared
                if (!isMobile) {
                  setIsOpen(false);
                }
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              // On mobile, always open when focused. On desktop, only open when typing
              if (isMobile) {
                setIsOpen(true);
              } else {
                // Desktop: only open if there's a query (typing has started)
                setIsOpen(query.length > 0);
              }
            }}
            onBlur={(e) => {
              // On mobile, don't close immediately on blur - allow time for click/touch events
              // Only close if clicking outside (handled by handleClickOutside)
              // Check if the blur is caused by clicking on dropdown content
              const relatedTarget = e.relatedTarget as Node;
              const isClickingDropdown = dropdownRef.current?.contains(relatedTarget);
              
              setTimeout(() => {
                // Only blur if we're not clicking on dropdown content and focus isn't on dropdown
                if (!isClickingDropdown && !dropdownRef.current?.contains(document.activeElement)) {
                  setIsFocused(false);
                }
              }, 150);
            }}
            placeholder="Search posts, users, pages, tags..."
            className="flex-1 bg-transparent border-0 outline-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          
          {query && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              onTouchStart={(e) => e.stopPropagation()}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors flex-shrink-0 touch-manipulation"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
          
          {/* Keyboard Shortcut Hint */}
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <Command size={12} />
            <span>K</span>
          </div>
        </div>

        {/* Dropdown Results - Use portal on mobile to break out of navbar constraints */}
        {isOpen && (isMobile ? createPortal(
          <div 
            className="fixed bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-[99999] animate-slide-down max-h-[calc(100vh-8rem)] flex flex-col"
            style={{
              top: `${dropdownTop}px`,
              left: '1rem',
              right: '1rem',
              width: 'auto'
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Filters */}
            {query.length >= 2 && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
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
                        onTouchStart={(e) => e.stopPropagation()}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all touch-manipulation active:scale-95 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                        }`}
                      >
                        <Icon size={13} className="sm:w-[14px] sm:h-[14px]" />
                        <span className="capitalize">{filter}</span>
                      </button>
                    );
                  })}
            </div>
          </div>
        )}

            {/* Content - Mobile Portal Version */}
            {renderDropdownContent()}
          </div>,
          document.body
        ) : (
          <div 
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-slide-down max-h-[600px] flex flex-col"
            onTouchStart={(e) => {
              // Prevent backdrop from closing when touching dropdown content
              e.stopPropagation();
            }}
            onClick={(e) => {
              // Prevent backdrop from closing when clicking dropdown content
              e.stopPropagation();
            }}
          >
            {/* Filters */}
            {query.length >= 2 && (
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 px-3 sm:px-0">
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
                        onTouchStart={(e) => e.stopPropagation()}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all touch-manipulation active:scale-95 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
                        }`}
                      >
                        <Icon size={13} className="sm:w-[14px] sm:h-[14px]" />
                        <span className="capitalize">{filter}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content - Desktop Version */}
            {renderDropdownContent()}
          </div>
        ))}
      </div>
    </div>
  );
}
