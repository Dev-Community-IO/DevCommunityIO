import apiClient from './config'
import { Post } from '../../types'

interface BookmarksResponse {
    bookmarks: Array<{
        id: string
        postId: string
        userId: string
        createdAt: string
        post: Post
    }>
    meta: {
        total: number
        perPage: number
        currentPage: number
        lastPage: number
    }
}

class BookmarksService {
    /**
     * Get user's bookmarked posts
     */
    async getBookmarks(page: number = 1): Promise<BookmarksResponse> {
        const response = await apiClient.get('/bookmarks', { params: { page } })
        return response.data
    }

    /**
     * Bookmark a post
     */
    async addBookmark(postId: string): Promise<{ message: string }> {
        const response = await apiClient.post('/bookmarks', { postId })
        return response.data
    }

    /**
     * Remove bookmark
     */
    async removeBookmark(postId: string): Promise<{ message: string }> {
        const response = await apiClient.delete(`/bookmarks/${postId}`)
        return response.data
    }

    /**
     * Check if post is bookmarked
     */
    async checkBookmark(postId: string): Promise<{ isBookmarked: boolean }> {
        const response = await apiClient.get(`/bookmarks/check/${postId}`)
        return response.data
    }
}

export default new BookmarksService()

