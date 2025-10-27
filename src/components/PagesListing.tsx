import { Users, TrendingUp, ArrowLeft, Search, Filter, FileText } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { useState } from 'react';

interface PagesListingProps {
  onPageClick: (pageId: string) => void;
  onBack?: () => void;
}

export function PagesListing({ onPageClick, onBack }: PagesListingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const allPages = [
    {
      id: '1',
      name: 'Web3 Developers Hub',
      description: 'Community for Web3 developers to share knowledge and collaborate',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=web3dev',
      coverImage: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      members: 1250,
      category: 'Development',
      trending: true
    },
    {
      id: '2',
      name: 'DeFi Research Group',
      description: 'Deep dive into DeFi protocols and mechanisms',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=defi',
      coverImage: 'https://images.pexels.com/photos/6771900/pexels-photo-6771900.jpeg?auto=compress&cs=tinysrgb&w=800',
      members: 856,
      category: 'DeFi',
      trending: false
    },
    {
      id: '3',
      name: 'Smart Contract Auditors',
      description: 'Professional network for smart contract security experts',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=audit',
      coverImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      members: 423,
      category: 'Security',
      trending: false
    },
    {
      id: '4',
      name: 'NFT Creators Alliance',
      description: 'Artists and creators building the future of digital art',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=nft',
      coverImage: 'https://images.pexels.com/photos/6954174/pexels-photo-6954174.jpeg?auto=compress&cs=tinysrgb&w=800',
      members: 2103,
      category: 'NFTs',
      trending: true
    },
    {
      id: '5',
      name: 'DAO Governance Forum',
      description: 'Discussing and shaping decentralized governance models',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=dao',
      coverImage: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800',
      members: 987,
      category: 'DAOs',
      trending: false
    },
    {
      id: '6',
      name: 'Blockchain Beginners',
      description: 'Start your journey into blockchain technology',
      logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=beginners',
      coverImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      members: 3421,
      category: 'Education',
      trending: true
    }
  ];

  const categories = ['all', 'trending', ...Array.from(new Set(allPages.map(page => page.category)))];

  const filteredPages = allPages.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         page.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'trending' && page.trending) ||
                         page.category === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
              <FileText size={24} className="text-white" strokeWidth={2.5} />
            </div>
            Pages
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Discover and join communities that match your interests
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
              placeholder="Search communities..."
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

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPages.map(page => (
          <div
            key={page.id}
            className="cursor-pointer group pt-8"
            onClick={() => onPageClick(page.id)}
          >
            <GlassCard className="relative overflow-visible hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              {/* Logo - Positioned absolutely above the card */}
              <div className="absolute -top-8 left-4 z-20">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-4 border-white dark:border-gray-900 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <img
                    src={page.logo}
                    alt={page.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Compact Cover Image */}
              <div className="relative h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden rounded-t-2xl">
                <img
                  src={page.coverImage}
                  alt={page.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                {page.trending && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge variant="gradient" className="flex items-center gap-1 text-[10px] px-2 py-0.5 shadow-lg">
                      <TrendingUp size={10} />
                      Trending
                    </Badge>
                  </div>
                )}
              </div>

              {/* Page Content */}
              <div className="p-4 pb-5 rounded-b-2xl">
                {/* Category Badge */}
                <div className="flex items-start justify-end mb-3">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                    {page.category}
                  </Badge>
                </div>

                {/* Page Title */}
                <h3 className="text-base font-bold group-hover:text-blue-500 transition-colors line-clamp-1 mb-1.5">
                  {page.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed min-h-[32px]">
                  {page.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Users size={14} />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {page.members.toLocaleString()}
                  </span>
                  <span>members</span>
                </div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No pages found matching your search</p>
        </div>
      )}
    </div>
  );
}
