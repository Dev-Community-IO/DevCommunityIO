import apiClient from './config';
import { Post, User } from '../../types';

class TrendingService {
    /**
     * Get trending posts
     */
    async getTrendingPosts(timeframe: '1d' | '7d' | '30d' = '7d', limit = 10): Promise<Post[]> {
        const response = await apiClient.get('/posts/trending', {
            params: { timeframe, limit }
        });
        return response.data.data || response.data;
    }

    /**
     * Get trending tags
     */
    async getTrendingTags(limit = 10): Promise<any[]> {
        const response = await apiClient.get('/tags', {
            params: { sort: 'trending', limit }
        });
        return response.data.data || response.data;
    }

    /**
     * Get trending authors
     */
    async getTrendingAuthors(limit = 5): Promise<User[]> {
        const response = await apiClient.get('/users/trending', {
            params: { limit }
        });
        // API returns array directly, not paginated
        return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    }

    /**
     * Get featured/highlighted content
     */
    async getFeaturedPosts(limit = 5): Promise<Post[]> {
        const response = await apiClient.get('/posts', {
            params: { featured: true, limit }
        });
        return response.data.data || response.data;
    }
}

export default new TrendingService();

