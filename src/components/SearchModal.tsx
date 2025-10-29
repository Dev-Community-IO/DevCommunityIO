import { useState, useEffect } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { Avatar } from './Avatar';
import { Post, User } from '../types';
import searchService from '../services/api/search.service';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostClick: (post: Post) => void;
}

export function SearchModal({ isOpen, onClose, onPostClick }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ posts: Post[]; users: User[] }>({ posts: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ posts: [], users: [] });
      return;
    }

    const performSearch = async () => {
      try {
        setIsSearching(true);
        const searchResults = await searchService.search(query, { limit: 15 });
        setResults({
          posts: searchResults.posts || [],
          users: searchResults.users || []
        });
      } catch (err) {
        console.error('Search error:', err);
        setResults({ posts: [], users: [] });
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handlePostClick = (post: Post) => {
    setQuery('');
    onClose();
    onPostClick(post);
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative h-full flex flex-col bg-white dark:bg-gray-900 animate-slide-up">
        <div className="flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts, users, tags..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 text-base"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Search Suggestions
              </h3>
              <div className="space-y-2">
                {['staking', 'ethereum', 'defi', 'cardano', 'governance'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Search size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {results.posts.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <TrendingUp size={14} />
                    Posts ({results.posts.length})
                  </div>
                  <div className="space-y-2">
                    {results.posts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => handlePostClick(post)}
                        className="w-full text-left p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar src={post.author.avatar} alt={post.author.username} size="sm" className="flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold line-clamp-2 mb-1.5 text-gray-900 dark:text-white">
                              {post.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium">{post.author.username}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {timeAgo(post.timestamp)}
                              </span>
                              <span>•</span>
                              <span>{post.commentCount} comments</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.users.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <Search size={14} />
                    Users ({results.users.length})
                  </div>
                  <div className="space-y-2">
                    {results.users.map((user) => (
                      <button
                        key={user.id}
                        className="w-full text-left p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} alt={user.username} size="sm" className="flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{user.username}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                              {user.walletAddress} • {user.reputation} rep
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.length >= 2 && results.posts.length === 0 && results.users.length === 0 && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
