import { useState, useEffect, useRef } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Save recent searches
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ posts: [], users: [], pages: [], hackathons: [], events: [], opportunities: [] });
      setIsOpen(query.length > 0);
      return;
    }

    const performSearch = async () => {
      try {
        setIsSearching(true);
        const searchResults = await searchService.search(query, { 
          limit: activeFilter === 'all' ? 5 : 10,
          type: activeFilter === 'all' ? 'all' : activeFilter
        });
        setResults({
          posts: searchResults.posts || [],
          users: searchResults.users || [],
          pages: searchResults.pages || [],
          hackathons: searchResults.hackathons || [],
          events: searchResults.events || [],
          opportunities: searchResults.opportunities || []
        });
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      setResults({ posts: [], users: [], pages: [], hackathons: [], events: [], opportunities: [] });
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
  const showSuggestions = query.length === 0 || (!hasResults && query.length >= 2 && !isSearching);

  return (
    <div className="flex-1 relative max-w-4xl mx-auto" ref={dropdownRef}>
      {/* Search Input */}
      <div className={`relative transition-all duration-300 ${
        isFocused || isOpen ? 'scale-[1.02]' : ''
      }`}>
        <div className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 transition-all duration-300 ${
          isFocused || isOpen 
            ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20 bg-white dark:bg-gray-900' 
            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
        }`}>
          <Search className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={20} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(query.length >= 2 || query.length === 0);
            }}
            placeholder="Search posts, users, pages, tags..."
            className="flex-1 bg-transparent border-0 outline-none text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          
          {query && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
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

        {/* Dropdown Results */}
            {(isOpen || showSuggestions) && query.length >= 1 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-slide-down max-h-[600px] flex flex-col">
            {/* Filters */}
            {query.length >= 2 && (
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
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
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon size={14} />
                        <span className="capitalize">{filter}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : query.length === 0 ? (
                /* Recent Searches & Suggestions */
                <div className="p-4">
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
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                          >
                            <Clock size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300">{search}</span>
                            <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
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
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                        >
                          <TrendingUp size={16} className="text-orange-400" />
                          <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{suggestion}</span>
                          <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : hasResults ? (
                /* Search Results */
                <div className="p-4 space-y-4">
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
                            className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group cursor-pointer"
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
                            className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group cursor-pointer"
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
                            className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group cursor-pointer"
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
                            className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group cursor-pointer"
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
                            className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group cursor-pointer"
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
                            className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group cursor-pointer"
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
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Try searching with different keywords or check your spelling
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
