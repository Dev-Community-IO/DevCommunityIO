import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Edit2, Trash2, Trophy, Calendar, Briefcase, FileText, MoreVertical, X } from 'lucide-react';
import { PostCard } from './PostCard';
import { GlassCard } from './GlassCard';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
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
          setUserPosts(response.data);
          setPaginationMeta(response.meta || paginationMeta);
        } else {
          // Handle legacy response format
          setUserPosts(Array.isArray(response) ? response : []);
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
      setShowDeleteConfirm(null);
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleEditPost = (post: Post) => {
    // Navigate to edit post (you might need to create an edit post page)
    navigate(`/post/${post.slug}/edit`);
  };

  const filteredPosts = userPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.content && post.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (categoryFilter === 'all') return matchesSearch;
    
    // Filter by category
    if (categoryFilter === 'hackathon') return matchesSearch && post.category === 'hackathon';
    if (categoryFilter === 'event') return matchesSearch && post.category === 'event';
    if (categoryFilter === 'opportunity') return matchesSearch && post.category === 'opportunity';
    
    return matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0));
      case 'controversial':
        return ((b.upvotes || 0) + (b.downvotes || 0)) - ((a.upvotes || 0) + (a.downvotes || 0));
      default:
        const aTime = new Date(a.createdAt || a.timestamp || 0).getTime();
        const bTime = new Date(b.createdAt || b.timestamp || 0).getTime();
        return bTime - aTime;
    }
  });

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            categoryFilter === 'all'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <FileText size={16} />
          All Posts
        </button>
        <button
          onClick={() => setCategoryFilter('hackathon')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            categoryFilter === 'hackathon'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Trophy size={16} />
          Hackathons
        </button>
        <button
          onClick={() => setCategoryFilter('event')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            categoryFilter === 'event'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Calendar size={16} />
          Events
        </button>
        <button
          onClick={() => setCategoryFilter('opportunity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            categoryFilter === 'opportunity'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Briefcase size={16} />
          Opportunities
        </button>
      </div>

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
              onChange={(e) => setSortBy(e.target.value as SortBy)}
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
      {loading ? (
        <PostSkeletonList count={3} />
      ) : sortedPosts.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-4">
          <div className="text-6xl">📝</div>
          <div>
            <h3 className="text-xl font-bold mb-2">No Posts Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {isOwnProfile ? "You haven't published any posts yet." : "This user hasn't published any posts yet."}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/create-post')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
              >
                Create Your First Post
              </button>
            )}
          </div>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedPosts.map(post => (
            <div key={post.id} className="relative group">
              <PostCard 
                post={post} 
                onClick={() => navigate(`/post/${post.slug}`)}
              />
              {isOwnProfile && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="relative">
                    <button
                      className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(showDeleteConfirm === post.id ? null : post.id);
                      }}
                    >
                      <MoreVertical size={18} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    
                    {showDeleteConfirm === post.id && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPost(post);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit2 size={16} />
                          Edit Post
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                              handleDeletePost(post.id);
                            }
                          }}
                          disabled={deletingPostId === post.id}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          {deletingPostId === post.id ? 'Deleting...' : 'Delete Post'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>

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
