import { Post } from '../types';
import { PostCard } from './PostCard';
import { TrendingUp, Sparkles, Trophy, TrendingDown, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface PostFeedProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
}

export function PostFeed({ posts, onPostClick }: PostFeedProps) {
  const [activeFilter, setActiveFilter] = useState('Hot');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filters = [
    { label: 'Hot', value: 'hot', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
    { label: 'New', value: 'new', icon: Sparkles, color: 'from-blue-500 to-cyan-500' },
    { label: 'Top', value: 'top', icon: Trophy, color: 'from-yellow-500 to-amber-500' },
    { label: 'Rising', value: 'rising', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Controversial', value: 'controversial', icon: TrendingDown, color: 'from-purple-500 to-pink-500' }
  ];

  const activeFilterData = filters.find(f => f.label === activeFilter) || filters[0];
  const ActiveIcon = activeFilterData.icon;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Discover
          </h2>

          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <ActiveIcon size={16} className={`bg-gradient-to-r ${activeFilterData.color} bg-clip-text text-transparent`} />
              <span className="text-sm font-semibold">{activeFilter}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-up">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                      Sort By
                    </div>
                    {filters.map((filter) => {
                      const Icon = filter.icon;
                      const isActive = activeFilter === filter.label;
                      return (
                        <button
                          key={filter.value}
                          onClick={() => {
                            setActiveFilter(filter.label);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 shadow-sm'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${filter.color} ${isActive ? 'shadow-lg' : 'opacity-70'}`}>
                            <Icon size={14} className="text-white" strokeWidth={2.5} />
                          </div>
                          <span className={`text-sm font-medium ${
                            isActive
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {filter.label}
                          </span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.slice(0, 3).map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.label;
            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post)}
          />
        ))}
      </div>
    </div>
  );
}
