import { useState, useEffect, useRef, useCallback } from 'react';
import { PostCard } from './PostCard';
import { Post } from '../types';
import postsService from '../services/api/posts.service';

interface InfiniteScrollFeedProps {
  initialPosts?: Post[];
  onPostClick: (post: Post) => void;
  onLoginRequired?: () => void;
  filter?: {
    category?: string;
    tag?: string;
    userId?: string;
  };
}

export function InfiniteScrollFeed({
  initialPosts = [],
  onPostClick,
  onLoginRequired,
  filter = {},
}: InfiniteScrollFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await postsService.getPosts({
        page: page + 1,
        limit: 10,
        ...filter,
      });

      const newPosts = response.data || [];

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Failed to load more posts');
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, filter]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMorePosts, hasMore, isLoading]);

  // Reset when filter changes
  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [filter.category, filter.tag, filter.userId, initialPosts]);

  return (
    <div className="space-y-4">
      {/* Posts */}
      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">No posts found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => onPostClick(post)}
              onLoginRequired={onLoginRequired}
            />
          ))}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading more posts...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-center py-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={loadMorePosts}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-full">
            <span className="text-2xl">🎉</span>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              You've reached the end!
            </p>
          </div>
        </div>
      )}

      {/* Intersection Observer Target */}
      <div ref={observerTarget} className="h-4" />
    </div>
  );
}

