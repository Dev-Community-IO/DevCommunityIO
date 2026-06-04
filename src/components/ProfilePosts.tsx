import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  Trophy,
  Calendar,
  Briefcase,
  FileText,
  MoreVertical,
  X,
  Clock,
  TrendingUp,
  Flame,
  Plus,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { PostCard } from './PostCard';
import { ConfirmDialog } from './ConfirmDialog';
import { Post } from '../types';
import usersService from '../services/api/users.service';
import postsService from '../services/api/posts.service';
import { PostSkeletonList } from './skeletons';
import { TabPills } from './TabPills';
import { asidePanelClass, compactPostGridClass } from './postCardSurface';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfilePostsProps {
  username: string;
}

type CategoryFilter = 'all' | 'hackathon' | 'event' | 'opportunity';
type SortBy = 'recent' | 'popular' | 'controversial';

const SORT_TABS = [
  { id: 'recent' as const, label: 'Recent', icon: Clock },
  { id: 'popular' as const, label: 'Popular', icon: TrendingUp },
  { id: 'controversial' as const, label: 'Hot', icon: Flame },
];

const CATEGORY_TABS = [
  { id: 'all' as const, label: 'All', icon: FileText },
  { id: 'hackathon' as const, label: 'Hackathons', icon: Trophy },
  { id: 'event' as const, label: 'Events', icon: Calendar },
  { id: 'opportunity' as const, label: 'Jobs', icon: Briefcase },
];

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
  const [filtersExpanded, setFiltersExpanded] = useState(false);
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

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || categoryFilter !== 'all' || sortBy !== 'recent';

  const activeSortLabel = SORT_TABS.find((t) => t.id === sortBy)?.label ?? 'Recent';
  const activeCategoryLabel =
    CATEGORY_TABS.find((t) => t.id === categoryFilter)?.label ?? 'All';

  const postCountLabel = loading
    ? '…'
    : `${sortedPosts.length} ${sortedPosts.length === 1 ? 'post' : 'posts'}`;

  return (
    <div className="space-y-4">
      <div className={`${asidePanelClass} overflow-hidden`}>
        {/* Collapsed / summary row — always one line */}
        <div className="flex min-h-10 items-center gap-2 px-2 py-1.5 sm:gap-2.5 sm:px-3">
          <button
            type="button"
            onClick={() => setFiltersExpanded((open) => !open)}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-50/90 px-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.08]"
            aria-expanded={filtersExpanded}
            aria-controls="profile-posts-filters"
          >
            <SlidersHorizontal size={14} strokeWidth={2} className="shrink-0" aria-hidden />
            <span className="hidden sm:inline">Filters</span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-zinc-400 transition-transform duration-200 ${filtersExpanded ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>

          <h2 className="shrink-0 text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Posts
          </h2>

          <span className="hidden h-4 w-px shrink-0 bg-zinc-200/80 dark:bg-white/10 sm:block" aria-hidden />

          <p className="min-w-0 shrink-0 truncate text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {postCountLabel}
          </p>

          {!filtersExpanded && hasActiveFilters && (
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-hide">
              {searchQuery.trim() && (
                <span className="inline-flex max-w-[8rem] shrink-0 items-center gap-1 truncate rounded-md border border-zinc-200/70 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 sm:max-w-[10rem]">
                  <Search size={10} strokeWidth={2} aria-hidden />
                  <span className="truncate">{searchQuery}</span>
                </span>
              )}
              {sortBy !== 'recent' && (
                <span className="shrink-0 rounded-md border border-zinc-200/70 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                  {activeSortLabel}
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="shrink-0 rounded-md border border-zinc-200/70 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">
                  {activeCategoryLabel}
                </span>
              )}
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {hasActiveFilters && !filtersExpanded && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setSortBy('recent');
                }}
                className="hidden rounded-md px-1.5 py-1 text-[10px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200 sm:inline"
              >
                Clear
              </button>
            )}
            {isOwnProfile && (
              <button
                type="button"
                onClick={() => navigate('/create-post')}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-zinc-200/80 bg-zinc-900 px-2.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:border-white/10 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <Plus size={14} strokeWidth={2} aria-hidden />
                <span className="hidden sm:inline">New</span>
              </button>
            )}
          </div>
        </div>

        {/* Expanded — search, sort, type on one scrollable row */}
        {filtersExpanded && (
          <div
            id="profile-posts-filters"
            className="flex items-center gap-2 overflow-x-auto border-t border-zinc-100 px-2 py-2 scrollbar-hide dark:border-white/[0.06] sm:gap-2.5 sm:px-3"
          >
            <div className="relative w-[7.5rem] shrink-0 sm:w-36 md:w-44 lg:w-52">
              <Search
                size={14}
                strokeWidth={2}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                aria-hidden
              />
              <input
                id="profile-posts-search"
                type="search"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-full rounded-lg border border-zinc-200/80 bg-white py-0 pl-8 pr-7 text-xs text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-[#0a1020]/90 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200"
                  aria-label="Clear search"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              )}
            </div>

            <span className="h-6 w-px shrink-0 bg-zinc-200/80 dark:bg-white/10" aria-hidden />

            <TabPills
              ariaLabel="Sort posts"
              activeTab={sortBy}
              onChange={(id) => setSortBy(id as SortBy)}
              scrollable={false}
              size="sm"
              className="shrink-0"
              tabs={SORT_TABS}
            />

            <span className="h-6 w-px shrink-0 bg-zinc-200/80 dark:bg-white/10" aria-hidden />

            <TabPills
              ariaLabel="Post categories"
              activeTab={categoryFilter}
              onChange={setCategoryFilter}
              scrollable={false}
              size="sm"
              className="shrink-0"
              tabs={CATEGORY_TABS}
            />

            {hasActiveFilters && (
              <>
                <span className="h-6 w-px shrink-0 bg-zinc-200/80 dark:bg-white/10" aria-hidden />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setSortBy('recent');
                  }}
                  className="shrink-0 rounded-md border border-zinc-200/70 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Posts List */}
      {loading ? (
        <PostSkeletonList count={3} />
      ) : sortedPosts.length === 0 ? (
        <div className={`${asidePanelClass} px-6 py-12 text-center`}>
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/10 dark:bg-white/[0.04]">
            <FileText size={22} strokeWidth={1.75} />
          </span>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {searchQuery || categoryFilter !== 'all' ? 'No posts found' : 'No posts yet'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            {searchQuery || categoryFilter !== 'all'
              ? isOwnProfile
                ? 'Try different filters or search terms.'
                : "This user hasn't published posts matching your criteria."
              : isOwnProfile
                ? 'Share your first post with the community.'
                : "This user hasn't published any posts yet."}
          </p>
          {isOwnProfile && !searchQuery && categoryFilter === 'all' && (
            <button
              type="button"
              onClick={() => navigate('/create-post')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:border-white/10 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              <Plus size={16} strokeWidth={2} aria-hidden />
              Create your first post
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={compactPostGridClass}>
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
