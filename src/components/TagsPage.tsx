import { Hash, TrendingUp, Users, ArrowLeft, Search, Filter, UserPlus, UserCheck, Loader2, Eye, Edit, Upload, X, Save, Shield, Star, Sparkles, Grid3x3, LayoutGrid } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Button } from './Button';
import { useState, useEffect, useRef } from 'react';
import { tagsService, Tag as APITag, UpdateTagParams } from '../services/api/tags.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
  featured?: boolean;
  logoUrl?: string;
  restrictedToRoles?: string[];
  color: string;
}

type ViewMode = 'grid' | 'compact';

export function TagsPage({ onTagClick, onBack }: TagsPageProps) {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [followedTags, setFollowedTags] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<APITag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<APITag | null>(null);
  const [editForm, setEditForm] = useState<UpdateTagParams>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const isSuperAdmin = user?.role === 'super_admin';

  const handleTagClick = (tagSlug: string, tagName?: string) => {
    if (onTagClick) {
      onTagClick(tagName || tagSlug);
    } else {
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
        const tagsArray = Array.isArray(response) 
          ? response 
          : (response?.tags || response?.data || []);
        setTags(Array.isArray(tagsArray) ? tagsArray : []);
        
        if (user && Array.isArray(tagsArray)) {
          const followed = new Set(
            tagsArray
              .filter((tag: any) => tag.isFollowing === true)
              .map((tag: any) => tag.name)
          );
          setFollowedTags(followed);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load tags');
        console.error('Error fetching tags:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [searchQuery, selectedFilter, user]);

  const allTags: Tag[] = (Array.isArray(tags) ? tags : []).map(t => ({
    name: t.name,
    slug: t.slug || t.name.toLowerCase().replace(/\s+/g, '-'),
    category: t.category || 'General',
    posts: t.usageCount || 0,
    followers: t.followersCount || 0,
    trending: t.trending,
    featured: t.featured,
    logoUrl: t.logoUrl,
    restrictedToRoles: t.restrictedToRoles,
    color: t.color || 'from-blue-500 to-cyan-500'
  }));

  const categories = ['all', 'trending', ...Array.from(new Set(allTags.map(tag => tag.category)))];
  const trendingTags = allTags.filter(t => t.trending);
  const featuredTags = allTags.filter(t => t.featured);
  const regularTags = allTags.filter(t => !t.trending && !t.featured);

  const filteredTags = searchQuery || selectedFilter !== 'all'
    ? allTags
    : allTags;

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

  const handleEditTag = (tag: APITag) => {
    setEditingTag(tag);
    setEditForm({
      name: tag.name,
      category: tag.category || '',
      logoUrl: tag.logoUrl || '',
      featured: tag.featured || false,
      restrictedToRoles: tag.restrictedToRoles || [],
    });
    setLogoPreview(tag.logoUrl || null);
    setLogoFile(null);
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTag = async () => {
    if (!editingTag) return;

    try {
      setIsSaving(true);
      
      let logoUrl = editForm.logoUrl;
      if (logoFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          logoUrl = base64;
          
          const updateData: UpdateTagParams = {
            ...editForm,
            logoUrl: logoUrl,
          };

          await tagsService.updateTag(editingTag.slug, updateData);
          
          const response = await tagsService.getTags();
          const tagsArray = Array.isArray(response) 
            ? response 
            : (response?.tags || response?.data || []);
          setTags(Array.isArray(tagsArray) ? tagsArray : []);
          
          setEditingTag(null);
          setIsSaving(false);
        };
        reader.readAsDataURL(logoFile);
      } else {
        const updateData: UpdateTagParams = { ...editForm };
        await tagsService.updateTag(editingTag.slug, updateData);
        
        const response = await tagsService.getTags();
        const tagsArray = Array.isArray(response) 
          ? response 
          : (response?.tags || response?.data || []);
        setTags(Array.isArray(tagsArray) ? tagsArray : []);
        
        setEditingTag(null);
        setIsSaving(false);
      }
    } catch (err: any) {
      console.error('Failed to update tag:', err);
      alert(err?.message || 'Failed to update tag');
      setIsSaving(false);
    }
  };

  // Loading Skeleton
  if (loading && tags.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            )}
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2 animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Search Skeleton */}
        <GlassCard className="p-5">
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </GlassCard>

        {/* Tags Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                <div className="w-20 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
              <div className="h-9 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 group"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </button>
          )}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 dark:from-blue-400 dark:via-cyan-300 dark:to-purple-400 bg-clip-text text-transparent">
              Explore Tags
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1.5">
              Discover communities, follow topics, and join conversations
            </p>
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('compact')}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              viewMode === 'compact'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
            aria-label="Compact view"
          >
            <Grid3x3 size={18} />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative group">
            <Search 
              size={20} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" 
            />
            <input
              type="text"
              placeholder="Search tags by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Clear search"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-400 flex-shrink-0" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-3.5 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-gray-900 dark:text-white capitalize min-w-[140px]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="capitalize">
                  {cat === 'all' ? 'All Tags' : cat === 'trending' ? '🔥 Trending' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedFilter !== 'all') && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Active filters:</span>
            {searchQuery && (
              <Badge className="text-xs px-3 py-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1.5 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
            {selectedFilter !== 'all' && (
              <Badge className="text-xs px-3 py-1 capitalize">
                {selectedFilter === 'trending' ? '🔥 Trending' : selectedFilter}
                <button
                  onClick={() => setSelectedFilter('all')}
                  className="ml-1.5 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </Badge>
            )}
          </div>
        )}
      </GlassCard>

      {/* Error State */}
      {error && (
        <GlassCard className="p-8 text-center">
          <Hash size={48} className="mx-auto text-red-300 dark:text-red-700 mb-4" />
          <p className="text-red-500 dark:text-red-400 mb-2 font-medium">Failed to load tags</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </GlassCard>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="space-y-10">
          {/* Trending Tags Section */}
          {trendingTags.length > 0 && selectedFilter === 'all' && !searchQuery && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Most popular tags this week</p>
                </div>
              </div>
              
              <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'} gap-4`}>
                {trendingTags.map(tag => {
                  const apiTag = tags.find(t => t.slug === tag.slug || t.name === tag.name);
                  const isFollowing = followedTags.has(tag.name);
                  
                  return (
                    <GlassCard 
                      key={tag.name} 
                      className="p-5 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group relative overflow-hidden"
                      hover
                    >
                      {/* Trending Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="text-xs px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                          <TrendingUp size={12} className="mr-1" />
                          Trending
                        </Badge>
                      </div>

                      {/* Gradient Background Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${tag.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                      <div className="relative z-0">
                        {/* Tag Icon/Logo */}
                        <div className="flex items-start justify-between mb-4">
                          {tag.logoUrl ? (
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <img src={tag.logoUrl} alt={tag.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${tag.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              <Hash size={24} className="text-white" />
                            </div>
                          )}
                          
                          {/* Admin Edit Button */}
                          {isAdmin() && apiTag && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTag(apiTag);
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit Tag"
                            >
                              <Edit size={14} className="text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                        </div>

                        {/* Tag Name */}
                        <h3 className={`font-bold text-xl mb-2 bg-gradient-to-r ${tag.color} bg-clip-text text-transparent line-clamp-1`}>
                          #{tag.name}
                        </h3>

                        {/* Restricted Badge */}
                        {tag.restrictedToRoles && tag.restrictedToRoles.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <Shield size={12} className="text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {tag.restrictedToRoles.join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span className="flex items-center gap-1.5">
                            <Users size={14} />
                            <span className="font-semibold">{tag.followers.toLocaleString()}</span>
                            <span className="text-xs">followers</span>
                          </span>
                          <span className="font-semibold">{tag.posts.toLocaleString()}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagClick(tag.slug, tag.name);
                            }}
                          >
                            <Eye size={14} />
                            View Posts
                          </Button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollow(tag.slug, tag.name);
                            }}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${
                              isFollowing
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                            aria-label={isFollowing ? 'Unfollow tag' : 'Follow tag'}
                          >
                            {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </section>
          )}

          {/* Featured Tags Section */}
          {featuredTags.length > 0 && selectedFilter === 'all' && !searchQuery && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 via-orange-400 to-amber-500 shadow-lg shadow-yellow-500/20">
                  <Star size={20} className="text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Featured Tags</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Curated by our team</p>
                </div>
              </div>
              
              <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'} gap-5`}>
                {featuredTags.map(tag => {
                  const apiTag = tags.find(t => t.slug === tag.slug || t.name === tag.name);
                  const isFollowing = followedTags.has(tag.name);
                  
                  return (
                    <GlassCard 
                      key={tag.name} 
                      className="p-6 hover:shadow-2xl hover:shadow-yellow-500/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden border-2 border-transparent hover:border-yellow-500/20"
                      hover
                    >
                      {/* Subtle gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${tag.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                      
                      {/* Featured star accent - top left */}
                      <div className="absolute top-4 right-4">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-400/10 to-orange-400/10 backdrop-blur-sm border border-yellow-500/20">
                          <Star size={14} className="text-yellow-500 fill-yellow-500/30" />
                        </div>
                      </div>

                      <div className="relative z-0">
                        {/* Icon/Logo Section */}
                        <div className="flex items-center justify-between mb-5">
                          {tag.logoUrl ? (
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-800 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                              <img src={tag.logoUrl} alt={tag.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tag.color} shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 flex items-center justify-center`}>
                              <Hash size={28} className="text-white" />
                            </div>
                          )}
                          
                          {isAdmin() && apiTag && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTag(apiTag);
                              }}
                              className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit Tag"
                            >
                              <Edit size={14} className="text-gray-500 dark:text-gray-400" />
                            </button>
                          )}
                        </div>

                        {/* Tag Name */}
                        <h3 className={`font-bold text-2xl mb-3 bg-gradient-to-r ${tag.color} bg-clip-text text-transparent line-clamp-1 group-hover:scale-[1.02] transition-transform duration-300`}>
                          #{tag.name}
                        </h3>

                        {/* Restricted Badge - minimal */}
                        {tag.restrictedToRoles && tag.restrictedToRoles.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-4">
                            <Shield size={11} className="text-gray-400 dark:text-gray-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {tag.restrictedToRoles.join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Stats - cleaner */}
                        <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5">
                              <Users size={14} className="text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Followers</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{tag.followers.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5">
                              <Hash size={14} className="text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Posts</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{tag.posts.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions - simplified */}
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1 text-sm font-medium"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTagClick(tag.slug, tag.name);
                            }}
                          >
                            <Eye size={14} />
                            Explore
                          </Button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollow(tag.slug, tag.name);
                            }}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${
                              isFollowing
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700'
                            }`}
                            aria-label={isFollowing ? 'Unfollow tag' : 'Follow tag'}
                          >
                            {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </section>
          )}

          {/* All Tags Section */}
          <section>
            {(trendingTags.length > 0 || featuredTags.length > 0) && selectedFilter === 'all' && !searchQuery && (
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30">
                  <Hash size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">All Tags</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Browse all available topics</p>
                </div>
              </div>
            )}
            
            {filteredTags.length > 0 ? (
              <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'} gap-4`}>
                {filteredTags
                  .filter(t => selectedFilter !== 'all' || searchQuery || (!t.trending && !t.featured))
                  .map(tag => {
                    const apiTag = tags.find(t => t.slug === tag.slug || t.name === tag.name);
                    const isFollowing = followedTags.has(tag.name);
                    
                    return viewMode === 'grid' ? (
                      <GlassCard 
                        key={tag.name} 
                        className="p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group relative overflow-hidden"
                        hover
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${tag.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                        <div className="relative z-0">
                          <div className="flex items-start justify-between mb-4">
                            {tag.logoUrl ? (
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md group-hover:scale-110 transition-transform duration-300">
                                <img src={tag.logoUrl} alt={tag.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tag.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                <Hash size={20} className="text-white" />
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1">
                              {tag.featured && (
                                <Star size={14} className="text-yellow-500" />
                              )}
                              {tag.trending && (
                                <TrendingUp size={14} className="text-orange-500" />
                              )}
                              {isAdmin() && apiTag && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTag(apiTag);
                                  }}
                                  className="p-1 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Edit Tag"
                                >
                                  <Edit size={12} className="text-gray-600 dark:text-gray-400" />
                                </button>
                              )}
                            </div>
                          </div>

                          <h3 className={`font-bold text-lg mb-2 bg-gradient-to-r ${tag.color} bg-clip-text text-transparent line-clamp-1`}>
                            #{tag.name}
                          </h3>

                          {tag.restrictedToRoles && tag.restrictedToRoles.length > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              <Shield size={10} className="text-gray-500 dark:text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                {tag.restrictedToRoles.join(', ')}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              <span className="font-semibold">{tag.followers.toLocaleString()}</span>
                            </span>
                            <span className="font-semibold">{tag.posts.toLocaleString()} posts</span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTagClick(tag.slug, tag.name);
                              }}
                            >
                              <Eye size={12} />
                              View
                            </Button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFollow(tag.slug, tag.name);
                              }}
                              className={`p-2 rounded-xl transition-all duration-200 ${
                                isFollowing
                                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                              }`}
                              aria-label={isFollowing ? 'Unfollow tag' : 'Follow tag'}
                            >
                              {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    ) : (
                      <GlassCard 
                        key={tag.name} 
                        className="p-4 hover:shadow-lg transition-all duration-300 group"
                        hover
                        onClick={() => handleTagClick(tag.slug, tag.name)}
                      >
                        <div className="flex items-center gap-3">
                          {tag.logoUrl ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
                              <img src={tag.logoUrl} alt={tag.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${tag.color} flex-shrink-0`}>
                              <Hash size={16} className="text-white" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-bold text-base bg-gradient-to-r ${tag.color} bg-clip-text text-transparent truncate`}>
                                #{tag.name}
                              </h3>
                              {tag.featured && <Star size={12} className="text-yellow-500 flex-shrink-0" />}
                              {tag.trending && <TrendingUp size={12} className="text-orange-500 flex-shrink-0" />}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Users size={10} />
                                {tag.followers.toLocaleString()}
                              </span>
                              <span>{tag.posts.toLocaleString()} posts</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollow(tag.slug, tag.name);
                            }}
                            className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                              isFollowing
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                            aria-label={isFollowing ? 'Unfollow tag' : 'Follow tag'}
                          >
                            {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                          </button>
                        </div>
                      </GlassCard>
                    );
                  })}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                <Sparkles size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No tags found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No tags available at the moment'}
                </p>
              </GlassCard>
            )}
          </section>
        </div>
      )}

      {/* Edit Tag Modal */}
      {editingTag && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <GlassCard className="max-w-2xl w-full p-6 sm:p-8 bg-white dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Tag: <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{editingTag.name}</span>
              </h2>
              <button
                onClick={() => setEditingTag(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Logo Upload (Super Admin Only) */}
              {isSuperAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tag Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {logoPreview && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-2 font-medium"
                    >
                      <Upload size={18} />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />
                    {logoPreview && (
                      <button
                        onClick={() => {
                          setLogoPreview(null);
                          setLogoFile(null);
                          setEditForm({ ...editForm, logoUrl: '' });
                        }}
                        className="px-5 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl transition-colors flex items-center gap-2 text-red-600 dark:text-red-400 font-medium"
                      >
                        <X size={18} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Featured (Super Admin Only) */}
              {isSuperAdmin && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editForm.featured || false}
                    onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    <Star size={18} className="text-yellow-500" />
                    Featured Tag (Promoted in sidebar)
                  </label>
                </div>
              )}

              {/* Role Restrictions (Admin/Super Admin) */}
              {isAdmin() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Restricted To Roles
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <input
                        type="checkbox"
                        id="restrict-verified-user"
                        checked={(editForm.restrictedToRoles || []).includes('verified_user')}
                        onChange={(e) => {
                          const roles = editForm.restrictedToRoles || [];
                          if (e.target.checked) {
                            setEditForm({ ...editForm, restrictedToRoles: [...roles, 'verified_user'] });
                          } else {
                            setEditForm({ ...editForm, restrictedToRoles: roles.filter(r => r !== 'verified_user') });
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="restrict-verified-user" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <Shield size={18} />
                        Verified Users Only
                      </label>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <input
                        type="checkbox"
                        id="restrict-verified-page"
                        checked={(editForm.restrictedToRoles || []).includes('verified_page')}
                        onChange={(e) => {
                          const roles = editForm.restrictedToRoles || [];
                          if (e.target.checked) {
                            setEditForm({ ...editForm, restrictedToRoles: [...roles, 'verified_page'] });
                          } else {
                            setEditForm({ ...editForm, restrictedToRoles: roles.filter(r => r !== 'verified_page') });
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="restrict-verified-page" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        <Shield size={18} />
                        Verified Pages Only
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="primary"
                  onClick={handleSaveTag}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setEditingTag(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
