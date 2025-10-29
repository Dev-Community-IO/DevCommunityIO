import apiClient from './config';
import { Post, User } from '../../types';

export interface SearchResults {
    posts: Post[];
    users: User[];
    pages?: any[];
    tags?: any[];
}

class SearchService {
    /**
     * Search across the platform
     */
    async search(query: string, filters?: {
        type?: 'posts' | 'users' | 'pages' | 'tags' | 'all';
        limit?: number;
    }): Promise<SearchResults> {
        const response = await apiClient.get('/search', {
            params: {
                q: query,
                ...filters
            }
        });
        return response.data;
    }

    /**
     * Search posts only
     */
    async searchPosts(query: string, limit = 10): Promise<Post[]> {
        const results = await this.search(query, { type: 'posts', limit });
        return results.posts || [];
    }

    /**
     * Search users only
     */
    async searchUsers(query: string, limit = 10): Promise<User[]> {
        const results = await this.search(query, { type: 'users', limit });
        return results.users || [];
    }

    /**
     * Search pages only
     */
    async searchPages(query: string, limit = 10): Promise<any[]> {
        const results = await this.search(query, { type: 'pages', limit });
        return results.pages || [];
    }

    /**
     * Search tags only
     */
    async searchTags(query: string, limit = 10): Promise<any[]> {
        const results = await this.search(query, { type: 'tags', limit });
        return results.tags || [];
    }
}

export default new SearchService();

