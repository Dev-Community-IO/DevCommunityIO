import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Sparkles, Loader2 } from 'lucide-react'
import { PostCard } from './PostCard'
import { PostSkeleton } from './skeletons/PostSkeleton'
import { GlassCard } from './GlassCard'
import bookmarksService from '../services/api/bookmarks.service'
import { Post } from '../types'
import InfiniteScroll from 'react-infinite-scroll-component'

interface BookmarksPageProps {
    onPostClick: (post: Post) => void
    onLoginRequired?: () => void
}

export function BookmarksPage({ onPostClick, onLoginRequired }: BookmarksPageProps) {
    const [bookmarks, setBookmarks] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchBookmarks()
    }, [page])

    const fetchBookmarks = async () => {
        try {
            setLoading(true)
            const response = await bookmarksService.getBookmarks(page)
            const posts = response.bookmarks.map((b) => b.post)
            
            if (page === 1) {
                setBookmarks(posts)
            } else {
                setBookmarks((prev) => [...prev, ...posts])
            }
            
            setHasMore(response.meta.currentPage < response.meta.lastPage)
        } catch (err: any) {
            console.error('Failed to fetch bookmarks:', err)
            setError(err.response?.data?.message || 'Failed to load bookmarks')
        } finally {
            setLoading(false)
        }
    }

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage((prev) => prev + 1)
        }
    }

    if (loading && page === 1) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Bookmark size={24} className="text-white" fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                Saved Posts
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your bookmarked content</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Loading Skeletons */}
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <PostSkeleton key={i} />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <GlassCard className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center mx-auto mb-6">
                    <Bookmark size={40} className="text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Unable to load bookmarks
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium shadow-lg shadow-blue-500/30"
                >
                    Retry
                </button>
            </GlassCard>
        )
    }

    if (bookmarks.length === 0) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Bookmark size={24} className="text-white" fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                Saved Posts
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your bookmarked content</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Empty State */}
                <GlassCard className="p-12 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center mx-auto mb-6">
                        <Bookmark size={48} className="text-yellow-500 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        No bookmarks yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Start bookmarking posts to save them for later. You can find them all here!
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium shadow-lg shadow-blue-500/30"
                    >
                        <Sparkles size={18} />
                        Explore Posts
                    </button>
                </GlassCard>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <Bookmark size={24} className="text-white" fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                Saved Posts
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                            </p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Bookmarks Feed */}
            {hasMore && bookmarks.length > 0 ? (
                <InfiniteScroll
                    dataLength={bookmarks.length}
                    next={handleLoadMore}
                    hasMore={hasMore}
                    loader={
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading more...</span>
                        </div>
                    }
                    endMessage={
                        <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center mx-auto mb-4">
                                <Sparkles size={24} className="text-blue-500 dark:text-blue-400" />
                            </div>
                            <p className="font-medium">You've reached the end!</p>
                            <p className="text-xs mt-1">All your bookmarks are displayed</p>
                        </div>
                    }
                    className="space-y-4"
                >
                    {bookmarks.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onClick={() => onPostClick(post)}
                            onLoginRequired={onLoginRequired}
                        />
                    ))}
                </InfiniteScroll>
            ) : (
                <div className="space-y-4">
                    {bookmarks.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onClick={() => onPostClick(post)}
                            onLoginRequired={onLoginRequired}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

