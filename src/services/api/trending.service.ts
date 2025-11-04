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
    async getTrendingAuthors(timeframe: '24h' | '7d' | '30d' | '1yr' | 'all' = 'all', limit = 10): Promise<User[]> {
        const response = await apiClient.get('/users/trending', {
            params: { timeframe, limit }
        });
        // API returns array directly, not paginated
        return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.users || []);
    }

    /**
     * Get most reputed authors
     */
    async getMostReputedAuthors(limit = 10): Promise<User[]> {
        const response = await apiClient.get('/users', {
            params: { sort: 'reputation', limit, order: 'desc' }
        });
        return Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.users || []);
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

