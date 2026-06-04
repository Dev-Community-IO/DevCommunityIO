import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Edit2, Trash2, Trophy, Calendar, Briefcase, FileText, MoreVertical } from 'lucide-react';
import { PostCard } from './PostCard';
import { ConfirmDialog } from './ConfirmDialog';
import { Post } from '../types';
import usersService from '../services/api/users.service';
import postsService from '../services/api/posts.service';
import { PostSkeletonList } from './skeletons';
import { TabPills } from './TabPills';
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              Posts
            </h2>
            {!loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {sortedPosts.length === 0
                  ? 'No posts found'
                  : `${sortedPosts.length} ${sortedPosts.length === 1 ? 'post' : 'posts'}${searchQuery ? ` matching "${searchQuery}"` : ''}`}
              </p>
            )}
          </div>
          <TabPills
            ariaLabel="Post categories"
            activeTab={categoryFilter}
            onChange={setCategoryFilter}
            className="min-w-0 sm:shrink-0"
            tabs={[
              { id: 'all', label: 'All', icon: FileText },
              { id: 'hackathon', label: 'Hackathons', icon: Trophy },
              { id: 'event', label: 'Events', icon: Calendar },
              { id: 'opportunity', label: 'Opportunities', icon: Briefcase },
            ]}
          />
        </div>
        {isOwnProfile && sortedPosts.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/create-post')}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 active:scale-95 touch-manipulation sm:w-auto"
          >
            <FileText size={16} />
            <span>New Post</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 sm:w-48">
          <SlidersHorizontal size={18} className="text-gray-400 flex-shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="flex-1 px-3 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="controversial">Most Controversial</option>
          </select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <PostSkeletonList count={3} />
      ) : sortedPosts.length === 0 ? (
        <div className="py-12 sm:py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <FileText size={32} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || categoryFilter !== 'all' ? 'No posts found' : 'No posts yet'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery || categoryFilter !== 'all'
              ? isOwnProfile
                ? "Try adjusting your filters or search terms to find what you're looking for."
                : "This user hasn't published any posts matching your criteria."
              : isOwnProfile
                ? "Start sharing your thoughts and connect with the community."
                : "This user hasn't published any posts yet."}
          </p>
          {isOwnProfile && (
            <button
              onClick={() => navigate('/create-post')}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 active:scale-95 transition-all"
            >
              <FileText size={16} />
              Create Your First Post
            </button>
          )}
        </div>
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
                <div key={`${post.id}-${post.slug}`} className="relative group flex flex-col">
                  <div className="flex-1 flex flex-col">
                    <PostCard 
                      post={post} 
                      onClick={() => navigate(getNavigationUrl())}
                    />
                  </div>
                  {isOwnProfile && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="relative">
                        <button
                          className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all touch-manipulation"
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
                            <div className="absolute top-full right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{((currentPage - 1) * paginationMeta.perPage) + 1}</span> to{' '}
                <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * paginationMeta.perPage, paginationMeta.total)}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{paginationMeta.total}</span> posts
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                  className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
