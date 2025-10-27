import { Hash, TrendingUp, Users, ArrowLeft, Search, Filter, UserPlus, UserCheck } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState } from 'react';

interface TagsPageProps {
  onTagClick: (tag: string) => void;
  onBack?: () => void;
}

interface Tag {
  name: string;
  category: string;
  posts: number;
  followers: number;
  trending?: boolean;
  color: string;
}

export function TagsPage({ onTagClick, onBack }: TagsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [followedTags, setFollowedTags] = useState<Set<string>>(new Set());

  const allTags: Tag[] = [
    { name: 'DeFi', category: 'Finance', posts: 1234, followers: 5432, trending: true, color: 'from-blue-500 to-cyan-500' },
    { name: 'NFT', category: 'Digital Art', posts: 2341, followers: 8765, trending: true, color: 'from-purple-500 to-pink-500' },
    { name: 'DAO', category: 'Governance', posts: 876, followers: 3210, trending: false, color: 'from-green-500 to-teal-500' },
    { name: 'Smart Contracts', category: 'Development', posts: 1567, followers: 6543, trending: true, color: 'from-orange-500 to-red-500' },
    { name: 'Ethereum', category: 'Blockchain', posts: 3456, followers: 12345, trending: true, color: 'from-indigo-500 to-blue-500' },
    { name: 'Solidity', category: 'Programming', posts: 987, followers: 4321, trending: false, color: 'from-pink-500 to-rose-500' },
    { name: 'Web3', category: 'Technology', posts: 2890, followers: 9876, trending: true, color: 'from-cyan-500 to-blue-500' },
    { name: 'Blockchain', category: 'Technology', posts: 4567, followers: 15678, trending: true, color: 'from-teal-500 to-green-500' },
    { name: 'Staking', category: 'Finance', posts: 1123, followers: 4567, trending: false, color: 'from-yellow-500 to-orange-500' },
    { name: 'Layer2', category: 'Scaling', posts: 765, followers: 2345, trending: false, color: 'from-lime-500 to-green-500' },
    { name: 'Cardano', category: 'Blockchain', posts: 2134, followers: 7654, trending: true, color: 'from-blue-600 to-cyan-600' },
    { name: 'Polkadot', category: 'Blockchain', posts: 1456, followers: 5432, trending: false, color: 'from-pink-600 to-purple-600' },
    { name: 'Metaverse', category: 'Virtual Reality', posts: 1890, followers: 6789, trending: true, color: 'from-violet-500 to-purple-500' },
    { name: 'GameFi', category: 'Gaming', posts: 1345, followers: 5678, trending: false, color: 'from-fuchsia-500 to-pink-500' },
    { name: 'Cross-chain', category: 'Interoperability', posts: 567, followers: 2109, trending: false, color: 'from-emerald-500 to-teal-500' },
    { name: 'dApps', category: 'Development', posts: 2456, followers: 8901, trending: true, color: 'from-sky-500 to-blue-500' },
    { name: 'Consensus', category: 'Protocol', posts: 678, followers: 2345, trending: false, color: 'from-slate-500 to-gray-500' },
    { name: 'Privacy', category: 'Security', posts: 890, followers: 3456, trending: false, color: 'from-stone-500 to-zinc-500' },
    { name: 'Tokenomics', category: 'Economics', posts: 1234, followers: 4567, trending: false, color: 'from-amber-500 to-yellow-500' },
    { name: 'Web Assembly', category: 'Programming', posts: 456, followers: 1789, trending: false, color: 'from-red-500 to-orange-500' },
  ];

  const categories = ['all', 'trending', ...Array.from(new Set(allTags.map(tag => tag.category)))];

  const filteredTags = allTags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tag.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'trending' && tag.trending) ||
                         tag.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFollow = (e: React.MouseEvent, tagName: string) => {
    e.stopPropagation();
    setFollowedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagName)) {
        newSet.delete(tagName);
      } else {
        newSet.add(tagName);
      }
      return newSet;
    });
  };

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
              <Hash size={24} className="text-white" strokeWidth={2.5} />
            </div>
            All Tags
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Explore topics and discover content that interests you
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
              placeholder="Search tags..."
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

      {/* Tags Grid - Compact Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredTags.map((tag) => {
          const isFollowing = followedTags.has(tag.name);
          return (
            <GlassCard
              key={tag.name}
              className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`h-1 bg-gradient-to-r ${tag.color}`}></div>
              <div className="p-3">
                <div className="flex items-start gap-2 mb-2">
                  <div
                    onClick={() => onTagClick(tag.name.toLowerCase())}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${tag.color} shadow-sm`}>
                        <Hash size={14} className="text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-sm font-bold group-hover:text-blue-500 transition-colors truncate">
                        {tag.name}
                      </h3>
                      {tag.trending && (
                        <Badge variant="gradient" className="text-[9px] px-1.5 py-0.5 flex-shrink-0">
                          <TrendingUp size={8} className="inline mr-0.5" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                      {tag.category}
                    </p>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={(e) => handleFollow(e, tag.name)}
                    className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
                      isFollowing
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {isFollowing ? (
                      <UserCheck size={14} />
                    ) : (
                      <UserPlus size={14} />
                    )}
                  </button>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1">
                    <Hash size={10} />
                    <span className="font-semibold">{tag.posts.toLocaleString()}</span>
                    <span className="hidden sm:inline">posts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={10} />
                    <span className="font-semibold">{tag.followers.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {filteredTags.length === 0 && (
        <div className="text-center py-12">
          <Hash size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No tags found matching your search</p>
        </div>
      )}
    </div>
  );
}
