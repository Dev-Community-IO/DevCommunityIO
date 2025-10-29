import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { PostCard } from './PostCard'
import { PostSkeleton } from './skeletons/PostSkeleton'
import bookmarksService from '../services/api/bookmarks.service'
import { Post } from '../types'

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
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                        <Bookmark size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookmarked Posts</h1>
                        <p className="text-gray-600 dark:text-gray-400">Your saved posts for later reading</p>
                    </div>
                </div>
                {[1, 2, 3].map((i) => (
                    <PostSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Unable to load bookmarks
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        )
    }

    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                    <Bookmark size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No bookmarks yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Start bookmarking posts to save them for later. You can find them all here!
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium"
                >
                    Explore Posts
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Bookmark size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bookmarked Posts</h1>
                    <p className="text-gray-600 dark:text-gray-400">{bookmarks.length} saved posts</p>
                </div>
            </div>

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

            {hasMore && (
                <div className="text-center pt-6">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    )
}

