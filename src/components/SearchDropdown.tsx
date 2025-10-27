import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { mockPosts, mockUsers } from '../data/mockData';
import { Avatar } from './Avatar';
import { Post, User } from '../types';

interface SearchDropdownProps {
  onPostClick: (post: Post) => void;
}

export function SearchDropdown({ onPostClick }: SearchDropdownProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<{ posts: Post[]; users: User[] }>({ posts: [], users: [] });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ posts: [], users: [] });
      setIsOpen(false);
      return;
    }

    const searchQuery = query.toLowerCase();

    const filteredPosts = mockPosts.filter(post =>
      post.title.toLowerCase().includes(searchQuery) ||
      post.content.toLowerCase().includes(searchQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    ).slice(0, 5);

    const filteredUsers = mockUsers.filter(user =>
      user.username.toLowerCase().includes(searchQuery)
    ).slice(0, 3);

    setResults({ posts: filteredPosts, users: filteredUsers });
    setIsOpen(true);
  }, [query]);

  const handlePostClick = (post: Post) => {
    setQuery('');
    setIsOpen(false);
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

  return (
    <div className="flex-1 relative max-w-3xl" ref={dropdownRef}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder="Search posts, users, tags..."
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
      />

      {isOpen && (results.posts.length > 0 || results.users.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 animate-scale-in">
          {results.posts.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <TrendingUp size={14} />
                Posts
              </div>
              {results.posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => handlePostClick(post)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar src={post.author.avatar} alt={post.author.username} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold line-clamp-1 mb-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-1">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{post.author.username}</span>
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
          )}

          {results.users.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <Search size={14} />
                Users
              </div>
              {results.users.map((user) => (
                <button
                  key={user.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} alt={user.username} size="sm" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold">{user.username}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {user.walletAddress} • {user.reputation} rep
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && results.posts.length === 0 && results.users.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
