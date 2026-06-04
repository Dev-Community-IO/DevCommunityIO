import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Clock, TrendingUp, X, Users, FileText, Hash, Sparkles, ArrowRight, Command, Loader2, Trophy, Calendar, Briefcase } from 'lucide-react';
import { Avatar } from './Avatar';
import { VerifiedBadge } from './VerifiedBadge';
import { Post, User } from '../types';
import { useNavigate } from 'react-router-dom';
import searchService from '../services/api/search.service';
import { TabPills } from './TabPills';

const SEARCH_FILTER_TABS = [
  { id: 'all' as const, label: 'All', icon: Sparkles },
  { id: 'posts' as const, label: 'Posts', icon: FileText },
  { id: 'users' as const, label: 'Users', icon: Users },
  { id: 'pages' as const, label: 'Pages', icon: Hash },
];

const DEFAULT_PAGE_LOGO = 'https://api.dicebear.com/7.x/shapes/svg?seed=Adaex%20App';

const searchInputShell = (active: boolean) =>
  `relative flex h-9 w-full items-center gap-2 rounded-lg border bg-white px-2.5 transition-colors dark:bg-[#0a1020]/90 ${
    active
      ? 'border-zinc-400 shadow-sm dark:border-zinc-500/80 dark:shadow-none'
      : 'border-zinc-200/80 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/15'
  }`;

const dropdownPanelClass =
  'overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-900 flex flex-col animate-slide-down';

const resultRowClass =
  'w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06] touch-manipulation';

const sectionLabelClass =
  'text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500';

const countChipClass =
  'inline-flex min-w-[1.25rem] items-center justify-center rounded-md border border-zinc-200/70 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400';

const iconTileClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200/70 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400';

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
        
        const searchResults = await searchService.search(query.trim(), { 
          limit: activeFilter === 'all' ? 5 : 10,
          type: activeFilter === 'all' ? 'all' : activeFilter
        });
        
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
        
        setIsOpen(true);
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
  
  // Show suggestions when:
  // 1. Query is empty (show recent searches and trending)
  // 2. Query is 1 character (show suggestions while waiting for 2+ chars)
  // 3. Query is 2+ chars but no results and not searching (show "no results")
  const showSuggestions = query.length === 0 || (query.length === 1) || (!hasResults && query.length >= 2 && !isSearching);

  // Render dropdown content (reusable for both portal and non-portal versions)
  const renderDropdownContent = () => (
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Searching…</p>
                </div>
              ) : query.length === 0 || query.length === 1 ? (
                <div className="p-2">
                  {recentSearches.length > 0 && (
                    <div className="mb-3">
                      <div className="mb-1.5 flex items-center justify-between px-1">
                        <h3 className={`${sectionLabelClass} flex items-center gap-1.5`}>
                          <Clock size={12} />
                          Recent
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setRecentSearches([]);
                            localStorage.removeItem('recentSearches');
                          }}
                          className="text-[11px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {recentSearches.map((search, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleRecentSearchClick(search)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className={`${resultRowClass} flex items-center gap-2`}
                          >
                            <Clock size={14} className="shrink-0 text-zinc-400" />
                            <span className="min-w-0 flex-1 truncate text-left text-sm text-zinc-700 dark:text-zinc-300">
                              {search}
                            </span>
                            <ArrowRight size={12} className="shrink-0 text-zinc-400 opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {query.length === 1 && (
                    <p className="mb-2 px-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      Type 2+ characters to search
                    </p>
                  )}

                  <div className="md:hidden">
                    <h3 className={`${sectionLabelClass} mb-1.5 flex items-center gap-1.5 px-1`}>
                      <TrendingUp size={12} />
                      Trending
                    </h3>
                    <div className="flex flex-wrap gap-1 px-1">
                      {['defi', 'blockchain', 'ethereum', 'web3', 'nft'].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setQuery(suggestion);
                            inputRef.current?.focus();
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="rounded-md border border-zinc-200/70 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.08]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : query.length >= 2 && hasResults && !isSearching ? (
                /* Search Results */
                <div className="space-y-3 p-2 pb-3">
                  {results.posts.length > 0 && (activeFilter === 'all' || activeFilter === 'posts') && (
                    <div>
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        <FileText size={14} className="text-zinc-500" />
                        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Posts</h3>
                        <span className={countChipClass}>{results.posts.length}</span>
                      </div>
                      <div className="space-y-1">
                        {results.posts.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => handlePostClick(post)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className={resultRowClass}
                          >
                            <div className="flex items-start gap-2.5">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (post.author?.username) {
                                    navigate(`/profile/${post.author.username}`);
                                  }
                                }}
                                className="shrink-0 cursor-pointer"
                              >
                                <Avatar src={post.author?.avatar || post.author?.avatarUrl || ''} alt={post.author?.username || 'User'} size="sm" className="" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 
                                  onClick={() => handlePostClick(post)}
                                  className="mb-0.5 line-clamp-1 text-sm font-medium text-zinc-900 dark:text-zinc-100"
                                >
                                  {post.title}
                                </h4>
                                <p 
                                  onClick={() => handlePostClick(post)}
                                  className="mb-1 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400"
                                >
                                  {post.content}
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                                  <span 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (post.author?.username) {
                                        navigate(`/profile/${post.author.username}`);
                                      }
                                    }}
                                    className="font-medium text-zinc-600 dark:text-zinc-400"
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
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        <Users size={14} className="text-zinc-500" />
                        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Users</h3>
                        <span className={countChipClass}>{results.users.length}</span>
                      </div>
                      <div className="space-y-1">
                        {results.users.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleUserClick(user)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className={resultRowClass}
                          >
                            <div className="flex items-center gap-2.5">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserClick(user);
                                }}
                                className="shrink-0 cursor-pointer"
                              >
                                <Avatar src={user.avatar || user.avatarUrl || ''} alt={user.username || 'User'} size="sm" className="" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 
                                    onClick={() => handleUserClick(user)}
                                    className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                                  >
                                    {user.username}
                                  </h4>
                                  {user.isVerified && <VerifiedBadge size={12} />}
                                </div>
                                <p 
                                  onClick={() => handleUserClick(user)}
                                  className="text-[11px] text-zinc-500 dark:text-zinc-400"
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
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        <Hash size={14} className="text-zinc-500" />
                        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Pages</h3>
                        <span className={countChipClass}>{results.pages.length}</span>
                      </div>
                      <div className="space-y-1">
                        {results.pages.map((page) => (
                          <button
                            key={page.id}
                            onClick={() => handlePageClick(page)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className={resultRowClass}
                          >
                            <div className="flex items-center gap-2.5">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePageClick(page);
                                }}
                                className="shrink-0 cursor-pointer"
                              >
                                <div className="h-8 w-8 overflow-hidden rounded-md border border-zinc-200/80 dark:border-white/10">
                                  <img 
                                    src={page.logo || page.logoUrl || DEFAULT_PAGE_LOGO}
                                    alt={page.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 
                                  onClick={() => handlePageClick(page)}
                                  className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
                                >
                                  {page.name}
                                </h4>
                                <p 
                                  onClick={() => handlePageClick(page)}
                                  className="line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400"
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
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        <Trophy size={14} className="text-zinc-500" />
                        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Hackathons</h3>
                        <span className={countChipClass}>{results.hackathons.length}</span>
                      </div>
                      <div className="space-y-1">
                        {results.hackathons.map((hackathon) => (
                          <button
                            key={hackathon.id}
                            onClick={() => handleHackathonClick(hackathon)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className={resultRowClass}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={iconTileClass}>
                                <Trophy size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="mb-0.5 line-clamp-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                  {hackathon.title}
                                </h4>
                                <p className="mb-1 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                                  {hackathon.description || 'Hackathon'}
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
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
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        <Calendar size={14} className="text-zinc-500" />
                        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Events</h3>
                        <span className={countChipClass}>{results.events.length}</span>
                      </div>
                      <div className="space-y-1">
                        {results.events.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => handleEventClick(event)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className={resultRowClass}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={iconTileClass}>
                                <Calendar size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="mb-0.5 line-clamp-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                  {event.title}
                                </h4>
                                <p className="mb-1 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                                  {event.description || 'Event'}
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
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
                      <div className="mb-1.5 flex items-center gap-2 px-1">
                        <Briefcase size={14} className="text-zinc-500" />
                        <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Opportunities</h3>
                        <span className={countChipClass}>{results.opportunities.length}</span>
                      </div>
                      <div className="space-y-1">
                        {results.opportunities.map((opportunity) => (
                          <button
                            key={opportunity.id}
                            onClick={() => handleOpportunityClick(opportunity)}
                            onTouchStart={(e) => e.stopPropagation()}
                            className={resultRowClass}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className={iconTileClass}>
                                <Briefcase size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="mb-0.5 line-clamp-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                  {opportunity.title}
                                </h4>
                                <p className="mb-1 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                                  {opportunity.description || 'Opportunity'}
                                </p>
                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
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
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.04]">
                    <Search size={18} className="text-zinc-400" />
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    No results
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Try different keywords or check spelling
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
    <div className={`relative mx-auto w-full max-w-4xl flex-1 ${isOpen ? 'z-[9999] md:z-auto' : ''}`} ref={dropdownRef}>
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
      <div ref={inputContainerRef} className={`relative ${isOpen ? 'z-[10000] md:z-auto' : ''}`}>
        <div className={searchInputShell(isFocused || isOpen)}>
          <Search className="shrink-0 text-zinc-400" size={16} strokeWidth={2} />

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
            placeholder="Search posts, users, pages…"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
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
              className="shrink-0 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200 touch-manipulation"
            >
              <X size={14} />
            </button>
          )}

          <kbd className="hidden shrink-0 items-center gap-0.5 rounded border border-zinc-200/80 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 lg:inline-flex">
            <Command size={10} />
            <span>K</span>
          </kbd>
        </div>

        {/* Dropdown Results - Use portal on mobile to break out of navbar constraints */}
        {isOpen && (isMobile ? createPortal(
          <div 
            className={`${dropdownPanelClass} fixed z-[99999] max-h-[calc(100vh-8rem)]`}
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
              <div
                className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-50/95 px-2 py-1.5 dark:border-white/10 dark:bg-zinc-900/90"
                onTouchStart={(e) => e.stopPropagation()}
              >
                <TabPills
                  ariaLabel="Search filters"
                  activeTab={activeFilter}
                  onChange={setActiveFilter}
                  tabs={SEARCH_FILTER_TABS}
                />
              </div>
            )}

            {/* Content - Mobile Portal Version */}
            {renderDropdownContent()}
          </div>,
          document.body
        ) : (
          <div 
            className={`${dropdownPanelClass} absolute top-full left-0 right-0 z-50 mt-1.5 max-h-[min(28rem,calc(100vh-6rem))]`}
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
              <div
                className="sticky top-0 z-10 border-b border-zinc-200/80 bg-zinc-50/95 px-2 py-1.5 dark:border-white/10 dark:bg-zinc-900/90"
                onTouchStart={(e) => e.stopPropagation()}
              >
                <TabPills
                  ariaLabel="Search filters"
                  activeTab={activeFilter}
                  onChange={setActiveFilter}
                  tabs={SEARCH_FILTER_TABS}
                />
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
