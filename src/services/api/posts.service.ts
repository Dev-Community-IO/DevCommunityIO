import apiClient from './config';
import { Post } from '../../types';

interface CreatePostData {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    pageId?: string;
    coverImage?: string;
}

interface PostsQueryParams {
    page?: number;
    limit?: number;
    category?: string;
    tags?: string; // Comma-separated tag slugs
    tag?: string; // Legacy support
    userId?: string;
    pageId?: string;
    sort?: 'hot' | 'new' | 'top';
    excludeIds?: string; // Comma-separated list of post IDs to exclude
}

class PostsService {
    // Get all posts
    async getPosts(params: PostsQueryParams = {}): Promise<{ posts: Post[]; meta: any }> {
        const response = await apiClient.get('/posts', { params });
        // API returns paginated format: { meta: {...}, data: [...] }
        if (response.data?.data && Array.isArray(response.data.data)) {
            return {
                posts: response.data.data,
                meta: response.data.meta
            };
        }
        // Fallback for non-paginated responses
        return {
            posts: Array.isArray(response.data) ? response.data : (response.data?.posts || []),
            meta: response.data?.meta || {}
        };
    }

    // Get single post
    async getPost(postId: string): Promise<Post> {
        const response = await apiClient.get(`/posts/${postId}`);
        return response.data.post;
    }

    // Create post
    async createPost(data: CreatePostData): Promise<Post> {
        const response = await apiClient.post('/posts', data);
        if (!response.data || !response.data.post) {
            throw new Error('Invalid response from server: post data is missing');
        }
        return response.data.post;
    }

    // Update post
    async updatePost(postId: string, data: Partial<CreatePostData>): Promise<Post> {
        const response = await apiClient.patch(`/posts/${postId}`, data);
        if (!response.data || !response.data.post) {
            throw new Error('Invalid response from server: post data is missing');
        }
        return response.data.post;
    }

    // Get post by slug (for editing)
    async getPostBySlug(slug: string): Promise<Post> {
        const response = await apiClient.get(`/posts/${slug}`);
        return response.data.post;
    }

    // Delete post
    async deletePost(postId: string): Promise<void> {
        await apiClient.delete(`/posts/${postId}`);
    }

    // Get trending posts
    async getTrendingPosts(params: { page?: number; limit?: number } = {}): Promise<{ posts: Post[]; meta: any }> {
        const response = await apiClient.get('/posts/trending', { params });
        return response.data;
    }

    // Get post comments
    async getPostComments(postId: string): Promise<any> {
        const response = await apiClient.get(`/posts/${postId}/comments`);
        return response.data;
    }

    // Upvote post
    async upvotePost(postId: string): Promise<any> {
        const response = await apiClient.post(`/posts/${postId}/upvote`);
        return response.data;
    }

    // Downvote post
    async downvotePost(postId: string): Promise<any> {
        const response = await apiClient.post(`/posts/${postId}/downvote`);
        return response.data;
    }

    // Remove vote
    async removeVote(postId: string): Promise<any> {
        const response = await apiClient.delete(`/posts/${postId}/vote`);
        return response.data;
    }

    // Vote on post (legacy method for compatibility)
    async votePost(postId: string, voteType: 'upvote' | 'downvote' | 'remove'): Promise<any> {
        if (voteType === 'upvote') {
            return this.upvotePost(postId);
        } else if (voteType === 'downvote') {
            return this.downvotePost(postId);
        } else {
            return this.removeVote(postId);
        }
    }

    // Bookmark post
    async bookmarkPost(postId: string): Promise<void> {
        await apiClient.post(`/posts/${postId}/bookmark`);
    }

    // Remove bookmark
    async removeBookmark(postId: string): Promise<void> {
        await apiClient.delete(`/posts/${postId}/bookmark`);
    }

    // Get user's bookmarks
    async getBookmarks(params: { page?: number; limit?: number } = {}): Promise<any> {
        const response = await apiClient.get('/posts/bookmarks', { params });
        return response.data;
    }
}

export default new PostsService();

