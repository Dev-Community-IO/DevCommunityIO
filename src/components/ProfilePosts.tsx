import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PostCard } from './PostCard';
import { mockPosts } from '../data/mockData';
import { GlassCard } from './GlassCard';

interface ProfilePostsProps {
  userId: string;
}

export function ProfilePosts({ userId }: ProfilePostsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'controversial'>('recent');

  const userPosts = mockPosts.filter(post => post.author.id === userId);

  const filteredPosts = userPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case 'controversial':
        return (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes);
      default:
        return b.timestamp.getTime() - a.timestamp.getTime();
    }
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="controversial">Most Controversial</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Posts List */}
      {sortedPosts.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No posts found</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map(post => (
            <PostCard key={post.id} post={post} onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}
