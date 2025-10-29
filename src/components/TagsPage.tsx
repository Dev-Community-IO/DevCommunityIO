import { Hash, TrendingUp, Users, ArrowLeft, Search, Filter, UserPlus, UserCheck, Loader2, Eye } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState, useEffect } from 'react';
import { tagsService, Tag as APITag } from '../services/api/tags.service';
import { useNavigate } from 'react-router-dom';

interface TagsPageProps {
  onTagClick?: (tag: string) => void;
  onBack?: () => void;
}

interface Tag {
  name: string;
  slug: string;
  category: string;
  posts: number;
  followers: number;
  trending?: boolean;
  color: string;
}

export function TagsPage({ onTagClick, onBack }: TagsPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [followedTags, setFollowedTags] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<APITag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleTagClick = (tagSlug: string, tagName?: string) => {
    if (onTagClick) {
      onTagClick(tagName || tagSlug);
    } else {
      // Default: navigate to feed with tag filter (use slug for API)
      navigate(`/?tags=${encodeURIComponent(tagSlug)}`);
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedFilter === 'trending') {
          params.trending = true;
        } else if (selectedFilter !== 'all') {
          params.category = selectedFilter;
        }
        
        const response = await tagsService.getTags(params);
        // Ensure tags is always an array
        const tagsArray = Array.isArray(response) 
          ? response 
          : (response?.tags || response?.data || []);
        setTags(Array.isArray(tagsArray) ? tagsArray : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load tags');
        console.error('Error fetching tags:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [searchQuery, selectedFilter]);

  const allTags: Tag[] = (Array.isArray(tags) ? tags : []).map(t => ({
    name: t.name,
    slug: t.slug || t.name.toLowerCase().replace(/\s+/g, '-'), // Use slug or generate from name
    category: t.category || 'General',
    posts: t.usageCount || 0,
    followers: t.followersCount || 0,
    trending: t.trending,
    color: t.color || 'from-blue-500 to-cyan-500'
  }));

  const categories = ['all', 'trending', ...Array.from(new Set(allTags.map(tag => tag.category)))];

  const filteredTags = allTags;

  const handleFollow = async (tagSlug: string, tagName: string) => {
    if (followedTags.has(tagName)) {
      try {
        await tagsService.unfollowTag(tagSlug);
        setFollowedTags(prev => {
          const newSet = new Set(prev);
          newSet.delete(tagName);
          return newSet;
        });
      } catch (err) {
        console.error('Failed to unfollow tag:', err);
      }
    } else {
      try {
        await tagsService.followTag(tagSlug);
        setFollowedTags(prev => new Set(prev).add(tagName));
      } catch (err) {
        console.error('Failed to follow tag:', err);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Explore Tags
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Discover and follow topics that interest you
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading tags...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <Hash size={48} className="mx-auto text-red-300 dark:text-red-700 mb-4" />
          <p className="text-red-500 dark:text-red-400 mb-2">Failed to load tags</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Trending Tags */}
      {!loading && !error && filteredTags.filter(t => t.trending).length > 0 && selectedFilter === 'all' && !searchQuery && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTags.filter(t => t.trending).map(tag => (
              <GlassCard key={tag.name} className="p-4 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tag.color} shadow-sm`}>
                    <Hash size={20} className="text-white" />
                  </div>
                  <Badge className="text-xs px-2 py-1">Trending</Badge>
                </div>
                <h3 className={`font-bold text-xl mb-2 bg-gradient-to-r ${tag.color} bg-clip-text text-transparent`}>
                  #{tag.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span className="font-medium">{tag.followers.toLocaleString()}</span>
                  </span>
                  <span className="font-medium">{tag.posts.toLocaleString()} posts</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1 text-xs py-2 h-auto"
                    onClick={() => handleTagClick(tag.slug, tag.name)}
                  >
                    <Eye size={14} className="mr-1.5" />
                    View Posts
                  </Button>
                  <Button
                    variant={followedTags.has(tag.name) ? "secondary" : "ghost"}
                    className="text-xs py-2 px-3 h-auto"
                    onClick={() => {
                      handleFollow(tag.slug, tag.name);
                    }}
                  >
                    {followedTags.has(tag.name) ? (
                      <UserCheck size={14} />
                    ) : (
                      <UserPlus size={14} />
                    )}
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* All Tags */}
      {!loading && !error && (
      <div>
        {filteredTags.filter(t => t.trending).length > 0 && selectedFilter === 'all' && !searchQuery && (
          <h2 className="text-lg font-bold mb-3">All Tags</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredTags.filter(t => selectedFilter !== 'all' || searchQuery || !t.trending).map(tag => (
            <GlassCard key={tag.name} className="p-3.5 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-start justify-between mb-2.5">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${tag.color} shadow-sm flex-shrink-0`}>
                  <Hash size={16} className="text-white" />
                </div>
                {tag.trending && (
                  <TrendingUp size={14} className="text-orange-500 flex-shrink-0" />
                )}
              </div>
              <h3 className={`font-bold text-lg mb-2 bg-gradient-to-r ${tag.color} bg-clip-text text-transparent truncate`} title={tag.name}>
                #{tag.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2.5">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  <span className="font-medium">{tag.followers.toLocaleString()}</span>
                </span>
                <span className="font-medium">{tag.posts.toLocaleString()} posts</span>
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant="primary"
                  className="flex-1 text-xs py-1.5 h-auto"
                  onClick={() => handleTagClick(tag.slug, tag.name)}
                >
                  <Eye size={12} className="mr-1" />
                  View
                </Button>
                <Button
                  variant={followedTags.has(tag.name) ? "secondary" : "ghost"}
                  className="text-xs py-1.5 px-2.5 h-auto"
                  onClick={() => {
                    handleFollow(tag.slug, tag.name);
                  }}
                >
                  {followedTags.has(tag.name) ? (
                    <UserCheck size={12} />
                  ) : (
                    <UserPlus size={12} />
                  )}
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
      )}

      {!loading && !error && filteredTags.length === 0 && (
        <div className="text-center py-12">
          <Hash size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No tags found matching your search</p>
        </div>
      )}
    </div>
  );
}
