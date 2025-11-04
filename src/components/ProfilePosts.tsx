import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Edit2, Trash2, Trophy, Calendar, Briefcase, FileText, MoreVertical, X } from 'lucide-react';
import { PostCard } from './PostCard';
import { GlassCard } from './GlassCard';
import { ConfirmDialog } from './ConfirmDialog';
import { Post } from '../types';
import usersService from '../services/api/users.service';
import postsService from '../services/api/posts.service';
import { PostSkeletonList } from './skeletons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfilePostsProps {
  username: string;
}

type CategoryFilter = 'all' | 'hackathon' | 'event' | 'opportunity';
type SortBy = 'recent' | 'popular' | 'controversial';

export function ProfilePosts({ username }: ProfilePostsProps) {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
  });

  const isOwnProfile = authUser?.username === username;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const category = categoryFilter === 'all' ? undefined : categoryFilter;
        const response = await usersService.getUserPosts(username, { 
          category,
          page: currentPage,
          limit: 20,
        });
        
        if (response && response.data) {
          // Deduplicate posts by ID to prevent duplicates
          const postsMap = new Map<string, Post>();
          (Array.isArray(response.data) ? response.data : []).forEach((post: Post) => {
            if (post.id && !postsMap.has(post.id)) {
              postsMap.set(post.id, post);
            }
          });
          const uniquePosts = Array.from(postsMap.values());
          
          setUserPosts(uniquePosts);
          setPaginationMeta(response.meta || paginationMeta);
        } else {
          // Handle legacy response format
          const posts = Array.isArray(response) ? response : [];
          const postsMap = new Map<string, Post>();
          posts.forEach((post: Post) => {
            if (post.id && !postsMap.has(post.id)) {
              postsMap.set(post.id, post);
            }
          });
          setUserPosts(Array.from(postsMap.values()));
        }
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setUserPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, categoryFilter, currentPage]);

  const handleDeletePost = async (postId: string) => {
    try {
      setDeletingPostId(postId);
      await postsService.deletePost(postId);
      setUserPosts(prev => prev.filter(p => p.id !== postId));
      setPostToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleEditPost = (post: Post) => {
    // Navigate to create-post page with edit parameter
    navigate(`/create-post?edit=${post.id}`);
  };

  // Deduplicate posts by ID before filtering to prevent duplicates
  const uniquePosts = useMemo(() => {
    const postsMap = new Map<string, Post>();
    userPosts.forEach((post: Post) => {
      if (post.id && !postsMap.has(post.id)) {
        postsMap.set(post.id, post);
      }
    });
    return Array.from(postsMap.values());
  }, [userPosts]);

  const filteredPosts = useMemo(() => {
    return uniquePosts.filter(post => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (categoryFilter === 'all') return matchesSearch;
      
      // Filter by category
      if (categoryFilter === 'hackathon') return matchesSearch && post.category === 'hackathon';
      if (categoryFilter === 'event') return matchesSearch && post.category === 'event';
      if (categoryFilter === 'opportunity') return matchesSearch && post.category === 'opportunity';
      
      return matchesSearch;
    });
  }, [uniquePosts, searchQuery, categoryFilter]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          const aScore = (a.upvotes || 0) - (a.downvotes || 0);
          const bScore = (b.upvotes || 0) - (b.downvotes || 0);
          return bScore - aScore;
        case 'controversial':
          const aControversy = (a.upvotes || 0) + (a.downvotes || 0);
          const bControversy = (b.upvotes || 0) + (b.downvotes || 0);
          return bControversy - aControversy;
        default:
          const aTime = new Date(a.createdAt || a.publishedAt || a.timestamp || 0).getTime();
          const bTime = new Date(b.createdAt || b.publishedAt || b.timestamp || 0).getTime();
          return bTime - aTime;
      }
    });
  }, [filteredPosts, sortBy]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Category Tabs - Mobile Optimized */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-3 sm:-mx-0 px-3 sm:px-0">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all active:scale-95 touch-manipulation ${
            categoryFilter === 'all'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600'
          }`}
        >
          <FileText size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden xs:inline">All Posts</span>
          <span className="xs:hidden">All</span>
        </button>
        <button
          onClick={() => setCategoryFilter('hackathon')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all active:scale-95 touch-manipulation ${
            categoryFilter === 'hackathon'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600'
          }`}
        >
          <Trophy size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden xs:inline">Hackathons</span>
          <span className="xs:hidden">Hacks</span>
        </button>
        <button
          onClick={() => setCategoryFilter('event')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all active:scale-95 touch-manipulation ${
            categoryFilter === 'event'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600'
          }`}
        >
          <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden xs:inline">Events</span>
          <span className="xs:hidden">Events</span>
        </button>
        <button
          onClick={() => setCategoryFilter('opportunity')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all active:scale-95 touch-manipulation ${
            categoryFilter === 'opportunity'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600'
          }`}
        >
          <Briefcase size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden xs:inline">Opportunities</span>
          <span className="xs:hidden">Jobs</span>
        </button>
      </div>

      {/* Filters - Mobile Optimized */}
      <GlassCard className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:w-[18px] sm:h-[18px]" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm sm:text-base"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gray-400 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm sm:text-base flex-1 sm:flex-none min-w-[140px]"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="controversial">Most Controversial</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Posts List - Mobile Optimized */}
      {loading ? (
        <PostSkeletonList count={3} />
      ) : sortedPosts.length === 0 ? (
        <GlassCard className="p-8 sm:p-12 text-center space-y-4">
          <div className="text-4xl sm:text-6xl">📝</div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">No Posts Yet</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
              {isOwnProfile ? "You haven't published any posts yet." : "This user hasn't published any posts yet."}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/create-post')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-sm sm:text-base hover:from-blue-600 hover:to-cyan-600 active:scale-95 transition-all shadow-lg hover:shadow-xl touch-manipulation"
              >
                Create Your First Post
              </button>
            )}
          </div>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {sortedPosts.map(post => {
              // Determine navigation URL based on post category
              const getNavigationUrl = () => {
                if (post.category === 'hackathon' && (post as any).hackathon) {
                  return `/hackathons/${(post as any).hackathon.slug || (post as any).hackathon.id}`;
                } else if (post.category === 'event' && (post as any).event) {
                  return `/events/${(post as any).event.slug || (post as any).event.id}`;
                } else if (post.category === 'opportunity' && (post as any).opportunity) {
                  return `/opportunities/${(post as any).opportunity.slug || (post as any).opportunity.id}`;
                }
                return `/post/${post.slug}`;
              };

              return (
                <div key={`${post.id}-${post.slug}`} className="relative group">
                  <div className="h-full">
                    <PostCard 
                      post={post} 
                      onClick={() => navigate(getNavigationUrl())}
                    />
                  </div>
                  {isOwnProfile && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="relative">
                        <button
                          className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 active:scale-95 transition-all touch-manipulation"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(showDropdown === post.id ? null : post.id);
                          }}
                          aria-label="More options"
                        >
                          <MoreVertical size={16} className="sm:w-[18px] sm:h-[18px] text-gray-600 dark:text-gray-300" />
                        </button>
                        
                        {showDropdown === post.id && (
                          <>
                            <div className="absolute top-full right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPost(post);
                                  setShowDropdown(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 text-gray-900 dark:text-white transition-colors touch-manipulation"
                              >
                                <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                Edit Post
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPostToDelete(post);
                                  setShowDropdown(null);
                                }}
                                disabled={deletingPostId === post.id}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-colors disabled:opacity-50 touch-manipulation"
                              >
                                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                {deletingPostId === post.id ? 'Deleting...' : 'Delete Post'}
                              </button>
                            </div>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setShowDropdown(null)}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            isOpen={!!postToDelete}
            title="Delete Post"
            message={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone.`}
            confirmText="Delete Post"
            cancelText="Cancel"
            variant="danger"
            onConfirm={() => {
              if (postToDelete) {
                handleDeletePost(postToDelete.id);
              }
            }}
            onCancel={() => {
              setPostToDelete(null);
            }}
          />

          {/* Pagination */}
          {paginationMeta.lastPage > 1 && (
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {((currentPage - 1) * paginationMeta.perPage) + 1} to{' '}
                  {Math.min(currentPage * paginationMeta.perPage, paginationMeta.total)} of{' '}
                  {paginationMeta.total} posts
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, paginationMeta.lastPage) }, (_, i) => {
                      let pageNum;
                      if (paginationMeta.lastPage <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= paginationMeta.lastPage - 2) {
                        pageNum = paginationMeta.lastPage - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(paginationMeta.lastPage, prev + 1))}
                    disabled={currentPage === paginationMeta.lastPage}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      )}

    </div>
  );
}
